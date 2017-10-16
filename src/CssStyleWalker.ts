import CSSUsage from './CSSUsage';
import CssAtRuleUsage from './atrules/CssAtRuleUsage';
import CssPropertyValuesAnalyzer from './CssPropertyValuesAnalyzer';

export default class CssStyleWalker {
    public ruleAnalyzers = [];

    // These stats are being collected while walking over the css style rules
    public amountOfInlineStyles = 0;
    public amountOfSelectorsUnused = 0;
    public amountOfSelectors = 0;

    private CSSUsageTypes = [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ];
    private CSSUsageRules = {};
    private CSSUsageAtRules = {};
    private CSSUsageProps = {};
    private CSSUsageData = {"SuccessfulCrawls":1};
    
    /**
     * For all stylesheets of the document, 
     * walk through the stylerules and run analyzers
     * Returns the complete CSSUsage.
     */    
    public walkOverCssStyleUsage(styleSheets: any): CSSUsage {
        // Loop through StyeSheets
        for (var ssIndex = 0; ssIndex < styleSheets.length; ssIndex++) {
            var styleSheet = styleSheets[ssIndex];
            try {
                if(styleSheet.cssRules) {
                    this.walkOverCssRules(styleSheet.cssRules, styleSheet, null);
                } else {
                    console.warn("No content loaded for stylesheet: ", styleSheet.href||styleSheet);
                }
            }
            catch (e) {
                console.log(e, e.stack);
            }
        }

        // TODO: look where to insert
        // Hack: rely on the results to find out which
        // animations actually run, and parse their keyframes
        // var animations = (CSSUsageResults.props['animation-name']||{}).values||{};
        // for(var animation in keyframes) {
        //     var keyframe = keyframes[animation];
        //     var matchCount = animations[animation]|0;
        //     var fakeElements = initArray(matchCount, (i)=>({tagName:'@keyframes '+animation+' ['+i+']'}));
        //     processRule(keyframe, fakeElements);
        // }

        return new CSSUsage(this.CSSUsageAtRules, this.CSSUsageRules, this.CSSUsageProps, this.CSSUsageTypes, this.CSSUsageData);        
    }

    /**
     * This is the css work horse, this will will loop over the
     * rules and then call the rule analyzers currently registered
     */
    private walkOverCssRules(/*CSSRuleList*/ cssRules: any, styleSheet: any, parentMatchedElements: any) {
        for (var ruleIndex = 0; ruleIndex < cssRules.length; ruleIndex++) {

            // Loop through the rules
            var rule = cssRules[ruleIndex];

            // Until we can correlate animation usage
            // to keyframes do not parse @keyframe rules
            if(rule.type == 8) {
                // keyframes[rule.name] = rule;
                continue;
            }
            
            // Filter "@supports" which the current browser doesn't support
            if(rule.type == 12 && (!CSS.supports || !CSS.supports(rule.conditionText))) {
                continue;
            }
                
            // Other rules should be processed immediately
            this.processRule(rule, parentMatchedElements);
        }
    }

    /**
     * This function takes a css rule and:
     * [1] walk over its child rules if needed
     * [2] call rule analyzers for that rule if it has style data
     */
    private processRule(rule, parentMatchedElements) {			
        // Increment the rule type's counter
        this.CSSUsageTypes[rule.type|0]++; 

        // Some CssRules have nested rules to walk through:
        if (rule.cssRules && rule.cssRules.length>0) {
            this.walkOverCssRules(rule.cssRules, rule.parentStyleSheet, parentMatchedElements);
        }

        // run analysis on at rules to populate CSSUsageResults.atrules
        if(CssAtRuleUsage.isRuleAnAtRule(rule)) {
            var selectorText;
            selectorText = '@atrule:' + rule.type;

            if(!this.CSSUsageAtRules[selectorText]) {
                this.CSSUsageAtRules[selectorText] = CssAtRuleUsage.processAtRule(rule);
            } else {
                let alreadyCollected = this.CSSUsageAtRules[selectorText];
                this.CSSUsageAtRules[selectorText] = CssAtRuleUsage.processAtRuleUpdate(rule, alreadyCollected);
            } 

        } else if(rule.style) {
            // find what the rule applies to
            var selectorText;
            var matchedElements; 
            if(rule.selectorText) {
                selectorText = CssPropertyValuesAnalyzer.cleanSelectorText(rule.selectorText);
                try {
                    if(parentMatchedElements) {
                        matchedElements = [].slice.call(document.querySelectorAll(selectorText));
                        matchedElements.parentMatchedElements = parentMatchedElements;
                    } else {
                        matchedElements = [].slice.call(document.querySelectorAll(selectorText));
                    }
                } catch(ex) {
                    matchedElements = [];
                    console.warn(ex.stack||("Invalid selector: "+selectorText+" -- via "+rule.selectorText));
                }
            } 

            // run an analysis on it
            this.runRuleAnalyzers(rule.style, selectorText, matchedElements, rule.type, null);
        }
    }

    /**
     * Given a rule and its data, send it to all rule analyzers
     */
    private runRuleAnalyzers(style: any, selectorText: any, matchedElements: any, type: any, isInline: any) {
        
        // Keep track of the counters
        if(isInline) {
            this.amountOfInlineStyles++;
        } else {
            this.amountOfSelectors++;
        }
        
        // Run all rule analyzers
        for(var i = 0; i < this.ruleAnalyzers.length; i++) {
            var runAnalyzer = this.ruleAnalyzers[i];
            runAnalyzer(style, selectorText, matchedElements, type, isInline);
        }
        
    }

    public static combineUsageStats(oldUsage: any, newUsage: any): any {
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