import Setup from './Setup';
import CssStyleWalker from './CssStyleWalker';
import CssSelectorAnalyzer from './CssSelectorAnalyzer';

var hasAlreadyRun = false;

/**
 * This is the main entrypoint of our script
 */
function onready(): void {
    // Uncomment if you want to set breakpoints when running in the console
    //debugger;
    
    // Prevent this code from running multiple times
    var firstTime = !hasAlreadyRun; hasAlreadyRun = true;
    if(!firstTime) { return; /* for now... */ }
    
    // Prevent this code from running when the page has no stylesheet (probably a redirect page)
    if(document.styleSheets.length == 0) { return; }

    // Check to see if you're on a Firefox failure page
    if(document.styleSheets.length == 1 && Setup.browserIsFirefox) {
        if(document.styleSheets[0].href !== null && document.styleSheets[0].href.indexOf('aboutNetError') != -1) {
            return;
        }
    }

    // Keep track of duration
    var startTime = performance.now();

    Setup.guardExecution();
    Setup.setUpClasses();

    var styleSheets = document.styleSheets;

    var cssWalker = new CssStyleWalker();
    var selectorAnalyzer = new CssSelectorAnalyzer();

    cssWalker.ruleAnalyzers.push(selectorAnalyzer.parseSelector);

    var ret = cssWalker.walkOverCssStyleUsage(styleSheets);
    console.log(ret);
}

if(document.readyState !== 'complete') {
    // if the document is loading, run when it loads or in 10s, whichever is less
    window.addEventListener('load', onready);
    setTimeout(onready, 10000);
} else { 
    // if the document is ready, run now
    onready();
    
}
