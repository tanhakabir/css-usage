import Setup from './Setup';
import CssShorthands from './CssShorthands';

export default class CssPropertyValuesAnalyzer {
    private static ID_REGEXP = "[#]i";         // #id
    private static CLASS_REGEXP = "[.]c";      // .class
    private static ATTR_REGEXP = "\\[a\\]";    // [att]
    private static PSEUDO_REGEXP = "[:][:]?[-_a-zA-Z][-_a-zA-Z0-9]*"; // :pseudo
    private static SORT_REGEXPS = [
        
        // #id first
        new RegExp("("+CssPropertyValuesAnalyzer.CLASS_REGEXP+")("+CssPropertyValuesAnalyzer.ID_REGEXP+")",'g'),
        new RegExp("("+CssPropertyValuesAnalyzer.ATTR_REGEXP+")("+CssPropertyValuesAnalyzer.ID_REGEXP+")",'g'),
        new RegExp("("+CssPropertyValuesAnalyzer.PSEUDO_REGEXP+")("+CssPropertyValuesAnalyzer.ID_REGEXP+")",'g'),
        
        // .class second
        new RegExp("("+CssPropertyValuesAnalyzer.ATTR_REGEXP+")("+CssPropertyValuesAnalyzer.CLASS_REGEXP+")",'g'),
        new RegExp("("+CssPropertyValuesAnalyzer.PSEUDO_REGEXP+")("+CssPropertyValuesAnalyzer.CLASS_REGEXP+")",'g'),
        
        // [attr] third
        new RegExp("("+CssPropertyValuesAnalyzer.PSEUDO_REGEXP+")("+CssPropertyValuesAnalyzer.ATTR_REGEXP+")",'g'),
        
        // :pseudo last
        
    ];

    private static buggyValuesForThisBrowser = null;

    /**
     * If you try to do querySelectorAll on pseudo selectors
     * it returns 0 because you are not actually doing the action the pseudo is stating those things,
     * but we will honor those declarations and we don't want them to be missed,
     * so we remove the pseudo selector from the selector text
     */
    public static cleanSelectorText(text: string): string {
        if(text.indexOf(':') == -1) {
            return text;
        } else {
            return text.replace(/([-_a-zA-Z0-9*\[\]]?):(?:hover|active|focus|before|after|not\(:(hover|active|focus)\))|::(?:before|after)/gi, '>>$1<<').replace(/(^| |>|\+|~)>><</g,'$1*').replace(/\(>><<\)/g,'(*)').replace(/>>([-_a-zA-Z0-9*\[\]]?)<</g,'$1');
        }
    }

    /**
     * Returns an anonymized version of the selector.
     * @example "#menu.open:hover>a.submenu" => "#id.class:hover > a.class"
     */
    public static generalizedSelectorsOf(value: string): string[] {
        
        // Trim
        value = value.trim();
        
        // Collapse whitespace
        if (value) {
            value = value.replace(/\s+/g, " ");
        }
        
        // Remove (...)
        if (value.indexOf("(") != -1) {
            value = value.replace(/[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]*)[)])*[)])*[)])*[)])*[)]/g, "");
            value = value.replace(/[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]+|[(](?:[^()]*)[)])*[)])*[)])*[)])*[)]/g, "");
        }
        
        // Simplify "..." and '...'
        value = value.replace(/"([^"\\]|\\[^"\\]|\\\\|\\")*"/g,'""')
        value = value.replace(/'([^'\\]|\\[^'\\]|\\\\|\\')*'/g,"''");

        
        // Simplify [att]
        if (value.indexOf("[") != -1) {
            value = value.replace(/\[[^=\[\]]+="([^"\\]|\\[^"\\]|\\\\|\\")*"\]/g, "[a]");
            value = value.replace(/\[[^=\[\]]+='([^'\\]|\\[^'\\]|\\\\|\\')*'\]/g, "[a]");
            value = value.replace(/\[[^\[\]]+\]/g, "[a]");
        }
        
        // Simplify .class
        if (value.indexOf(".") != -1) {
            value = value.replace(/[.][-_a-zA-Z][-_a-zA-Z0-9]*/g, ".c");
        }
        
        // Simplify #id
        if (value.indexOf("#") != -1) {
            value = value.replace(/[#][-_a-zA-Z][-_a-zA-Z0-9]*/g, "#i");
        }
        
        // Normalize combinators
        value = value.replace(/[ ]*([>|+|~])[ ]*/g,' $1 ');
        
        // Trim whitespace
        value = value.trim();
        
        // Remove unnecessary * to match Chrome
        value = value.replace(/[*]([#.\x5B:])/g,'$1');
        
        // Now we can sort components so that all browsers give results similar to Chrome
        value = CssPropertyValuesAnalyzer.sortSelectorComponents(value);
        
        // Split multiple selectors
        var ret = value.split(/\s*,\s*/g);

        return ret;
    }

    private static sortSelectorComponents(value) {
        
        var oldValue; do { // Yeah this is a very inefficient bubble sort. I know.
            
            oldValue = value;
            for(var i = 0; i < CssPropertyValuesAnalyzer.SORT_REGEXPS.length; i++) {
                var wrongPair = CssPropertyValuesAnalyzer.SORT_REGEXPS[i];
                value = value.replace(wrongPair,'$2$1');
            }
            
        } while(oldValue != value); return value;

    }

    public static valueExistsInRootProperty(cssText,key,rootKey,value): boolean {
        value = value.trim().toLowerCase();
        
        // detect suspicious values
        var buggyValues = CssPropertyValuesAnalyzer.buggyValuesForThisBrowser;
        
        // apply common sense to the given value, per browser
        var buggyState = buggyValues[key+':'+value];
        if(buggyState === 1) { return false; }
        if(buggyState !== 0 && (!buggyValues['*'] || CssShorthands.unexpand(key).length == 0)) { return true; }

        // root properties are unlikely to lie
        if(key==rootKey) return false;			
        
        // ask the browser is the best we can do right now
        var values = value.split(/\s+|\s*,\s*/g);
        var validValues = ' ';
        var validValuesExtractor = new RegExp(' '+rootKey+'(?:[-][-_a-zA-Z0-9]+)?[:]([^;]*)','gi');
        var match; while(match = validValuesExtractor.exec(cssText)) {
            validValues += match[1] + ' ';
        }
        for(var i = 0; i < values.length; i++) {
            var value = values[i];
            if(validValues.indexOf(' '+value+' ')==-1) return false;
        }
        return true;
    }

    public static getBuggyValuesForThisBrowser() {
        var buggyValues = Object.create(null);

        // Edge reports initial value instead of "initial", we have to be cautious
        if(Setup.browserIsEdge) {
            buggyValues['*'] = 1; // make 0 values automatic for longhand properties
            
            //buggyValues['list-style-position:outside'] = 0;
            buggyValues['list-style-image:none'] = 1;
            //buggyValues['outline-color:invert'] = 0;
            //buggyValues['outline-style:none'] = 0;
            //buggyValues['outline-width:medium'] = 0;
            //buggyValues['background-image:none'] = 0;
            //buggyValues['background-attachment:scroll'] = 0;
            //buggyValues['background-repeat:repeat'] = 0;
            //buggyValues['background-repeat-x:repeat'] = 0;
            //buggyValues['background-repeat-y:repeat'] = 0;
            //buggyValues['background-position-x:0%'] = 0;
            //buggyValues['background-position-y:0%'] = 0;
            //buggyValues['background-size:auto'] = 0;
            //buggyValues['background-origin:padding-box'] = 0;
            //buggyValues['background-clip:border-box'] = 0;
            //buggyValues['background-color:transparent'] = 0;
            buggyValues['border-top-color:currentcolor'] = 1;
            buggyValues['border-right-color:currentcolor'] = 1;
            buggyValues['border-bottom-color:currentcolor'] = 1;
            buggyValues['border-left-color:currentcolor'] = 1;
            //buggyValues['border-top-style:solid'] = 0;
            //buggyValues['border-right-style:solid'] = 0;
            //buggyValues['border-bottom-style:solid'] = 0;
            //buggyValues['border-left-style:solid'] = 0;
            buggyValues['border-top-width:medium'] = 1;
            buggyValues['border-right-width:medium'] = 1;
            buggyValues['border-bottom-width:medium'] = 1;
            buggyValues['border-left-width:medium'] = 1;
            buggyValues['border-image-source:none'] = 1;
            buggyValues['border-image-outset:0'] = 1;
            buggyValues['border-image-width:1'] = 1;
            buggyValues['border-image-repeat:repeat'] = 1;
            buggyValues['border-image-repeat-x:repeat'] = 1;
            buggyValues['border-image-repeat-y:repeat'] = 1;
            buggyValues['line-height:normal'] = 1;
            //buggyValues['font-size-adjust:none'] = 0;
            buggyValues['font-stretch:normal'] = 1;
            
        }
        
        // Firefox reports initial values instead of "initial", we have to be cautious
        if(Setup.browserIsFirefox) {
            buggyValues['*'] = 1; // make 0 values automatic for longhand properties
        }

        CssPropertyValuesAnalyzer.buggyValuesForThisBrowser = buggyValues;
    }
}