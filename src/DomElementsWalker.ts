import Setup from './Setup';

export default class DomElementsWalker {
    /**
     * This is the dom work horse, this will will loop over the
     * dom elements and then call the element analyzers currently registered,
     * as well as rule analyzers for inline styles
     */
    public walkOverDomElements(obj, index) {
        if(Setup.debugMode) console.log("STAGE: Walking over DOM elements");
        //var recipesToRun = CSSUsage.StyleWalker.recipesToRun;			
        obj = obj || document.documentElement; index = index|0;

        // Loop through the elements
        var elements = [].slice.call(document.all,0);
        for(var i = 0; i < elements.length; i++) { 
            var element=elements[i];			
            
            // Analyze its style, if any
            // if(!CSSUsage.StyleWalker.runRecipes) {
            //     // Analyze the element
            //     runElementAnalyzers(element, index);

            //     if (element.hasAttribute('style')) {					
            //         // Inline styles count like a style rule with no selector but one matched element
            //         var ruleType = 1;
            //         var isInline = true;
            //         var selectorText = '@inline:'+element.tagName;
            //         var matchedElements = [element];
            //         runRuleAnalyzers(element.style, selectorText, matchedElements, ruleType, isInline);					
            //     }
            // } else { // We've already walked the DOM crawler and need to run the recipes
            //     for(var r = 0; r < recipesToRun.length ; r++) {
            //         var recipeToRun = recipesToRun[r];
            //         var results = RecipeResults[recipeToRun.name] || (RecipeResults[recipeToRun.name]={});
            //         recipeToRun(element, results, true);
            //     }
            // }
        }
        
    }
}