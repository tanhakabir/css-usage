export default class CssSelectorAnalyzer {
    // 
    // To understand framework and general css usage, we collect stats about classes, ids and pseudos.
    // Those objects have the following shape: 
    // {"hover":5,"active":1,"focus":2}
    // 
    public cssPseudos = {}; // collect stats about which pseudo-classes and pseudo-elements are used in the css
    public domClasses = {}; // collect stats about which css classes are found in the <... class> attributes of the dom
    public cssClasses = {}; // collect stats about which css classes are used in the css
    public domIds = {};     // collect stats about which ids are found in the <... id> attributes of the dom
    public cssIds = {};     // collect stats about which ids are used in the css
    
    // 
    // To understand Modernizer usage, we need to know how often some classes are used at the front of a selector
    // While we're at it, the code also collect the state for ids
    // 
    public cssLonelyIdGates = {};            // .class something-else ==> {"class":1}
    public cssLonelyClassGates = {};         // #id something-else ==> {"id":1}
    public cssLonelyClassGatesMatches = [];  // .class something-else ==> [".class something-else"]
    public cssLonelyIdGatesMatches = [];     // #id something-else ==> ["#id something-else"]
    
    //
    // These regular expressions catch patterns we want to track (see before)
    //
    private ID_REGEXP = /[#][-_a-zA-Z][-_a-zA-Z0-9]*/g;     // #id
    private ID_REGEXP1 = /[#][-_a-zA-Z][-_a-zA-Z0-9]*/;     // #id (only the first one)
    private CLASS_REGEXP = /[.][-_a-zA-Z][-_a-zA-Z0-9]*/g;  // .class
    private CLASS_REGEXP1 = /[.][-_a-zA-Z][-_a-zA-Z0-9]*/;  // .class (only the first one)
    private PSEUDO_REGEXP = /[:][-_a-zA-Z][-_a-zA-Z0-9]*/g; // :pseudo (only the )
    private GATEID_REGEXP = /^\s*[#][-_a-zA-Z][-_a-zA-Z0-9]*([.][-_a-zA-Z][-_a-zA-Z0-9]*|[:][-_a-zA-Z][-_a-zA-Z0-9]*)*\s+[^>+{, ][^{,]+$/; // #id ...
    private GATECLASS_REGEXP = /^\s*[.][-_a-zA-Z][-_a-zA-Z0-9]*([:][-_a-zA-Z][-_a-zA-Z0-9]*)*\s+[^>+{, ][^{,]+$/; // .class ...
    
    
    /**
     * This analyzer will collect over the selectors the stats defined before
     */
    public parseSelector(style, selectorsText, analyzer: CssSelectorAnalyzer) {
        if(typeof selectorsText != 'string') return;
            
        var selectors = selectorsText.split(',');
        for(var i = selectors.length; i--;) { 
            var selector = selectors[i];
            
            // extract all features from the selectors
            analyzer.extractFeature(analyzer.ID_REGEXP, selector, analyzer.cssIds);
            analyzer.extractFeature(analyzer.CLASS_REGEXP, selector, analyzer.cssClasses);
            analyzer.extractFeature(analyzer.PSEUDO_REGEXP, selector, analyzer.cssPseudos);
            
            // detect specific selector patterns we're interested in
            if(analyzer.GATEID_REGEXP.test(selector)) {
                analyzer.cssLonelyIdGatesMatches.push(selector);
                analyzer.extractFeature(analyzer.ID_REGEXP1, selector, analyzer.cssLonelyIdGates);
            }
            if(analyzer.GATECLASS_REGEXP.test(selector)) {
                analyzer.cssLonelyClassGatesMatches.push(selector);
                analyzer.extractFeature(analyzer.CLASS_REGEXP1, selector, analyzer.cssLonelyClassGates);
            }
        }  
    }

    /**
     * From a css selector text and a set of counters, 
     * increment the counters for the matches in the selector of the 'feature' regular expression
     */
    private extractFeature(feature, selector, counters) {
        var instances = selector.match(feature)||[];
        for(var i = 0; i < instances.length; i++) {
            var instance = instances[i];
            instance = instance.substr(1);
            counters[instance] = (counters[instance]|0) + 1;
        }
    }
}