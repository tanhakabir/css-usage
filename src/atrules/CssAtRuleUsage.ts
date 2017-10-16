import AtRuleUsage from './AtRuleUsage';
import ConditionalAtRuleUsage from './ConditionalAtRuleUsage';
import KeyframeAtRuleUsage from './KeyframeAtRuleUsage';
import PseudoAtRuleUsage from './PseudoAtRuleUsage';
import CssPropertyValuesAnalyzer from '../CssPropertyValuesAnalyzer';

export default class CssAtRuleUsage {
    public static isRuleAnAtRule(rule): boolean {
        /**
         *  @atrules types ~= {
                    "charset": 0,  //2
                    "import":0,    //3
                    "media":0,     //4
                    "font-face":0, //5
                    "page":0,      //6
                    "keyframes":0, //7 This is the @keyframe at rule
                    "keyframe":0,  //8 This is the individual 0%, or from/to

                    "namespace":0, //10
                    "supports":0,  //12
                    "viewport":0,  //15
         */
        let type = rule.type;
        return (type >= 2 && type <= 8) || (type == 10) || (type == 12) || (type == 15);
    }

    public static processAtRule(rule: any): AtRuleUsage {
        if(rule.conditionText) {
            return CssAtRuleUsage.processConditionalAtRule(rule);
        } else {
            return CssAtRuleUsage.processGeneralAtRule(rule);
        }
    }

    public static processAtRuleUpdate(rule: any, previousUsage: AtRuleUsage): AtRuleUsage {
        var ret = previousUsage;

        if(rule.conditionText) {
            var cRet = <ConditionalAtRuleUsage>ret;
            let newUsage = CssAtRuleUsage.processConditionalAtRule(rule);

            cRet.props = CssAtRuleUsage.combineUsageStats(cRet.props, newUsage.props);
            cRet.conditions = CssAtRuleUsage.combineUsageStats(cRet.conditions, newUsage.conditions);
            cRet.nested = CssAtRuleUsage.combineUsageStats(cRet.nested, newUsage.nested);

            ret = cRet;
        } else  {
            let newUsage = CssAtRuleUsage.processGeneralAtRule(rule);

            if(rule.type == 7) {
                let kRet = <KeyframeAtRuleUsage> ret;
                let kNew = <KeyframeAtRuleUsage> newUsage;

                kRet.keyframes = CssAtRuleUsage.combineUsageStats(kRet.keyframes, kNew.keyframes);

                ret = kRet;
            }

            // TODO: not returning pseudo usage
            let pRet = <PseudoAtRuleUsage> ret;
            if(pRet.pseudos) {
                let pNew = <PseudoAtRuleUsage> newUsage;

                pRet.pseudos = CssAtRuleUsage.combineUsageStats(pRet.pseudos, pNew.pseudos);
                ret = pRet;
            }

            ret.props = CssAtRuleUsage.combineUsageStats(ret.props, newUsage.props);
        }

        var count = ret.count;
        ret.count = count + 1;
        return ret;
    }

    /**
     * This process @atrules with conditional statements such as @supports.
     * [1] It will process any props and values used within the body of the rule.
     * [2] It will count the occurence of usage of nested atrules.
     * [3] It will process condition statements to conform to a standardized version. 
     */
    private static processConditionalAtRule(rule: any): ConditionalAtRuleUsage  {
        var ret = new ConditionalAtRuleUsage();


        if(rule.cssRules) {
            ret.props = CssAtRuleUsage.analyzeAtRulePropCount(rule.cssRules);
            ret.nested = CssAtRuleUsage.processNestedRules(rule.cssRules);
        }

        let conditionSelector = CssAtRuleUsage.processConditionText(rule.conditionText);

        ret.conditions[conditionSelector] = Object.create(null);
        ret.conditions[conditionSelector] = { "count": 1 };

        return ret;
    }

    /**
     * This processes the usage of conditions of conditional @atrules like @media.
     * Requires the condition of the rule to process and the current recorded usage 
     * of the @atrule in question.
     */
    private static processConditionText(conditionText): string {
        return conditionText = conditionText.replace(/[0-9]/g, '');
    }

    /**
     * Analyzes the given @atrules, such as @supports, and counts the usage of the nested rules
     * according to their type. NOTE: must pass in the current usage of nested rules for the
     * given @atrule.
     */
    private static processNestedRules(cssRules: any): any {
        var nested = {};

        // find the rule count for nested rules
        for(let index in cssRules) {
            let ruleBody = cssRules[index];

            if(!ruleBody.cssText) {
                continue;
            }

            var nestRuleSelector;

            if(CssAtRuleUsage.isRuleAnAtRule(ruleBody)) {
                nestRuleSelector = '@atrule:' + ruleBody.type;

            } else if(ruleBody.style) {
                if(ruleBody.selectorText) {
                    try {
                        var selectorText = CssPropertyValuesAnalyzer.cleanSelectorText(ruleBody.selectorText);
                        var matchedElements = [].slice.call(document.querySelectorAll(selectorText));

                        if(matchedElements.length == 0) {
                            continue;
                        }

                        var cleanedSelectors = CssPropertyValuesAnalyzer.generalizedSelectorsOf(selectorText);
                        nestRuleSelector = cleanedSelectors[0];  // only passed in one selector to a function that returns many
                    } catch (ex) {
                        continue;
                    }
                }
            }

            if(nestRuleSelector) {
                var individualNested = nestRuleSelector.split(' ');

                for (let selector of individualNested) {
                    if(!nested[selector]) {
                        nested[selector] = Object.create(null);
                        nested[selector] = {"count": 1}
                    } else {
                        var nestedCount = nested[selector].count;
                        nested[selector].count = nestedCount + 1;
                    }
                }
            }
        }

        return nested;
    }

    /**
     * This will process all other @atrules that don't have conditions or styles.
     * [1] It will process any props and values used within the body of the rule.
     * [2] It will count the occurence of usage of nested atrules.
     */
    private static processGeneralAtRule(rule: any): AtRuleUsage {
        if(rule.style) {
            if(rule.pseudoClass) {
                var pseudoRet = new PseudoAtRuleUsage();
                pseudoRet.pseudos = CssAtRuleUsage.processPseudoClassesOfAtrules(rule);
                pseudoRet.props = CssAtRuleUsage.analyzePropCount(rule.style);
                return pseudoRet;
            } else {
                var ret = new AtRuleUsage();
                ret.props = CssAtRuleUsage.analyzePropCount(rule.style);
                return ret;
            }
        } else if (rule.cssRules) {
            // @keyframes rule type is 7
            if(rule.type == 7) {
                var keyframeRet = new KeyframeAtRuleUsage();
                keyframeRet.keyframes = CssAtRuleUsage.processKeyframeAtRules(rule);
                keyframeRet.props = CssAtRuleUsage.analyzeAtRulePropCount(rule.cssRules);
                return keyframeRet;
            }
        } else {
            return new AtRuleUsage();
        }
    }

    /**
     * Processes on @keyframe to add the appropriate props from the frame and a counter of which
     * frames are used throughout the document.
     */
    private static processKeyframeAtRules(rule: any): any {
        var keyframes = Object.create(null);

        for(let index in rule.cssRules) {
            let keyframe = rule.cssRules[index];

            if(keyframe.keyText) {
                if(!keyframes[keyframe.keyText]) {
                    keyframes[keyframe.keyText] = {"count": 1};
                } else {
                    var keyframeCount = keyframes[keyframe.keyText].count;
                    keyframes[keyframe.keyText].count = keyframeCount + 1;
                }
            }
        }

        return keyframes;
    }

    /**
     * If an atrule as has a pseudo class such as @page, process the pseudo class and
     * add it to the atrule usage.
     */
    private static processPseudoClassesOfAtrules(rule: any): any {
        var pseudos = Object.create(null);

        let pseudoClass = rule.pseudoClass;

        pseudos[pseudoClass] = Object.create(null);
        pseudos[pseudoClass] = { "count": 1 };

        return pseudos;
    }

    /**
     * Runs an analysis over the properties of an @atrule to collect the count of properties present within
     * @param cssRules the contents of the @atrule
     */
    private static analyzeAtRulePropCount(cssRules: any): any {
        var props = Object.create(null);

        for(let index in cssRules) {
            let ruleBody = cssRules[index];
            let style = ruleBody.style;

            // guard for non css objects
            if(!style) {
                continue;
            }

            if(ruleBody.selector) { 
                try {
                    var selectorText = CssPropertyValuesAnalyzer.cleanSelectorText(ruleBody.selectorText);
                    var matchedElements = [].slice.call(document.querySelectorAll(selectorText));
                    
                    if (matchedElements.length == 0) {
                        continue;
                    }
                } catch (ex) {
                    console.warn(ex.stack||("Invalid selector: "+selectorText+" -- via "+ruleBody.selectorText));
                    continue;
                }
            }

            props = CssPropertyValuesAnalyzer.analyzePropCount(style, props);
        }

        return props;
    }

    private static analyzePropCount(style: any): any {
        var props = Object.create(null);

        props = CssPropertyValuesAnalyzer.analyzePropCount(style, props);

        return props;
    }
    
    private static combineUsageStats(oldUsage: any, newUsage: any): any {
        var modified = oldUsage;

        var keys = Object.keys(newUsage);

        for(let key of keys) {
            if(modified[key]) {
                var previousCount = modified[key].count;
                modified[key].count = previousCount + 1;
            } else {
                modified[key] = newUsage[key];
            }
        }

        return modified;
    }
}