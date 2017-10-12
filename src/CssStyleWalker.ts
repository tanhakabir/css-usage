import CSSUsage from './CSSUsage';
import CssAtRuleUsage from './atrules/CssAtRuleUsage';

export default class CssStyleWalker {
    private ruleAnalyzers = [];

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
    public walkOverCssRules(/*CSSRuleList*/ cssRules: any, styleSheet: any, parentMatchedElements: any) {
        for (var ruleIndex = cssRules.length; ruleIndex >= 0; ruleIndex--) {

            // Loop through the rules
            var rule = cssRules[ruleIndex];

            // Until we can correlate animation usage
            // to keyframes do not parse @keyframe rules
            if(rule.type == 7) {
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
    public processRule(rule, parentMatchedElements) {			
        // Increment the rule type's counter
        this.CSSUsageTypes[rule.type|0]++; 

        // Some CssRules have nested rules to walk through:
        if (rule.cssRules && rule.cssRules.length>0) {
            
            this.walkOverCssRules(rule.cssRules, rule.parentStyleSheet, parentMatchedElements);
            
        }

        // Some CssRules have style we can analyze
        if(rule.style) {
            // find what the rule applies to
            var selectorText;
            var matchedElements; 
            if(rule.selectorText) {
                //selectorText = CSSUsage.PropertyValuesAnalyzer.cleanSelectorText(rule.selectorText);
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
            } else {
                selectorText = '@atrule:'+rule.type;
                if(parentMatchedElements) {
                    matchedElements = parentMatchedElements;
                } else {
                    matchedElements = [];
                }
            }

            // run an analysis on it
            //runRuleAnalyzers(rule.style, selectorText, matchedElements, rule.type);
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
        }
    }
}