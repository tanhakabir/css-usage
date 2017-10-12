/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Setup_1 = __webpack_require__(1);
var CssStyleWalker_1 = __webpack_require__(2);
var hasAlreadyRun = false;
var browserIsEdge = navigator.userAgent.indexOf('Edge') >= 0;
var browserIsFirefox = navigator.userAgent.indexOf('Firefox') >= 0;
/**
 * This is the main entrypoint of our script
 */
function onready() {
    // Uncomment if you want to set breakpoints when running in the console
    //debugger;
    // Prevent this code from running multiple times
    var firstTime = !hasAlreadyRun;
    hasAlreadyRun = true;
    if (!firstTime) {
        return; /* for now... */
    }
    // Prevent this code from running when the page has no stylesheet (probably a redirect page)
    if (document.styleSheets.length == 0) {
        return;
    }
    // Check to see if you're on a Firefox failure page
    if (document.styleSheets.length == 1 && browserIsFirefox) {
        if (document.styleSheets[0].href !== null && document.styleSheets[0].href.indexOf('aboutNetError') != -1) {
            return;
        }
    }
    // Keep track of duration
    var startTime = performance.now();
    Setup_1.default.guardExecution();
    var styleSheets = document.styleSheets;
    var cssWalker = new CssStyleWalker_1.default();
    var ret = cssWalker.walkOverCssStyleUsage(styleSheets);
    console.log(ret);
}
if (document.readyState !== 'complete') {
    // if the document is loading, run when it loads or in 10s, whichever is less
    window.addEventListener('load', onready);
    setTimeout(onready, 10000);
}
else {
    // if the document is ready, run now
    onready();
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Setup = /** @class */ (function () {
    function Setup() {
    }
    Setup.guardExecution = function () {
        // Don't run in subframes for now
        if (top.location.href !== location.href)
            throw new Error("CSSUsage: the script doesn't run in frames for now");
        // Do not allow buggy trim() to bother usage
        if (('' + String.prototype.trim).indexOf("[native code]") == -1) {
            console.warn('Replaced custom trim function with something known to work. Might break website.');
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
    };
    return Setup;
}());
exports.default = Setup;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CSSUsage_1 = __webpack_require__(3);
var CssAtRuleUsage_1 = __webpack_require__(4);
var CssStyleWalker = /** @class */ (function () {
    function CssStyleWalker() {
        this.ruleAnalyzers = [];
        // These stats are being collected while walking over the css style rules
        this.amountOfInlineStyles = 0;
        this.amountOfSelectorsUnused = 0;
        this.amountOfSelectors = 0;
        this.CSSUsageTypes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.CSSUsageRules = {};
        this.CSSUsageAtRules = {};
        this.CSSUsageProps = {};
        this.CSSUsageData = { "SuccessfulCrawls": 1 };
    }
    /**
     * For all stylesheets of the document,
     * walk through the stylerules and run analyzers
     * Returns the complete CSSUsage.
     */
    CssStyleWalker.prototype.walkOverCssStyleUsage = function (styleSheets) {
        // Loop through StyeSheets
        for (var ssIndex = 0; ssIndex < styleSheets.length; ssIndex++) {
            var styleSheet = styleSheets[ssIndex];
            try {
                if (styleSheet.cssRules) {
                    this.walkOverCssRules(styleSheet.cssRules, styleSheet, null);
                }
                else {
                    console.warn("No content loaded for stylesheet: ", styleSheet.href || styleSheet);
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
        return new CSSUsage_1.default(this.CSSUsageAtRules, this.CSSUsageRules, this.CSSUsageProps, this.CSSUsageTypes, this.CSSUsageData);
    };
    /**
     * This is the css work horse, this will will loop over the
     * rules and then call the rule analyzers currently registered
     */
    CssStyleWalker.prototype.walkOverCssRules = function (/*CSSRuleList*/ cssRules, styleSheet, parentMatchedElements) {
        for (var ruleIndex = cssRules.length; ruleIndex >= 0; ruleIndex--) {
            // Loop through the rules
            var rule = cssRules[ruleIndex];
            // Until we can correlate animation usage
            // to keyframes do not parse @keyframe rules
            if (rule.type == 7) {
                // keyframes[rule.name] = rule;
                continue;
            }
            // Filter "@supports" which the current browser doesn't support
            if (rule.type == 12 && (!CSS.supports || !CSS.supports(rule.conditionText))) {
                continue;
            }
            // Other rules should be processed immediately
            this.processRule(rule, parentMatchedElements);
        }
    };
    /**
     * This function takes a css rule and:
     * [1] walk over its child rules if needed
     * [2] call rule analyzers for that rule if it has style data
     */
    CssStyleWalker.prototype.processRule = function (rule, parentMatchedElements) {
        // Increment the rule type's counter
        this.CSSUsageTypes[rule.type | 0]++;
        // Some CssRules have nested rules to walk through:
        if (rule.cssRules && rule.cssRules.length > 0) {
            this.walkOverCssRules(rule.cssRules, rule.parentStyleSheet, parentMatchedElements);
        }
        // Some CssRules have style we can analyze
        if (rule.style) {
            // find what the rule applies to
            var selectorText;
            var matchedElements;
            if (rule.selectorText) {
                //selectorText = CSSUsage.PropertyValuesAnalyzer.cleanSelectorText(rule.selectorText);
                try {
                    if (parentMatchedElements) {
                        matchedElements = [].slice.call(document.querySelectorAll(selectorText));
                        matchedElements.parentMatchedElements = parentMatchedElements;
                    }
                    else {
                        matchedElements = [].slice.call(document.querySelectorAll(selectorText));
                    }
                }
                catch (ex) {
                    matchedElements = [];
                    console.warn(ex.stack || ("Invalid selector: " + selectorText + " -- via " + rule.selectorText));
                }
            }
            else {
                selectorText = '@atrule:' + rule.type;
                if (parentMatchedElements) {
                    matchedElements = parentMatchedElements;
                }
                else {
                    matchedElements = [];
                }
            }
            // run an analysis on it
            //runRuleAnalyzers(rule.style, selectorText, matchedElements, rule.type);
        }
        // run analysis on at rules to populate CSSUsageResults.atrules
        if (CssAtRuleUsage_1.default.isRuleAnAtRule(rule)) {
            var selectorText;
            selectorText = '@atrule:' + rule.type;
            if (!this.CSSUsageAtRules[selectorText]) {
                this.CSSUsageAtRules[selectorText] = CssAtRuleUsage_1.default.processAtRule(rule);
            }
            else {
                var alreadyCollected = this.CSSUsageAtRules[selectorText];
                this.CSSUsageAtRules[selectorText] = CssAtRuleUsage_1.default.processAtRuleUpdate(rule, alreadyCollected);
            }
        }
    };
    return CssStyleWalker;
}());
exports.default = CssStyleWalker;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CSSUsage = /** @class */ (function () {
    function CSSUsage(atruleUsage, ruleUsage, propUsage, typeUsage, usageData) {
        // this will contain the usage stats of atrules
        this.atrules = {};
        /* atrules ~= {
            "@atrule:4": {
                count: 3,
                props: {
                    "background-color": 1,
                    "color": 4,
                    "opacity": 3,
                    "transform": 3
                },
                nested: {
                    "h3": 1
                },
                conditions: {
                    "screen": 1
                }
            }
        }*/
        // this will contain selectors and the properties they refer to
        this.rules = { "@stylerule": 0,
            "@atrule": 0,
            "@inline": 0 };
        /* rules ~= {
            "#id:hover .class": {
                count: 10,
                props: {
                    "background-color": 5,
                    "color": 4,
                    "opacity": 3,
                    "transform": 3
                }
            }
        }*/
        // this will contain the usage stats of various css properties and values
        this.props = {};
        /* props ~= {
            "background-color": {
                count: 10,
                values: {
                    "<color-keyword>": 9,
                    "inherit": 1
                }
            }
        }*/
        // this will contain the usage stats of various at-rules and rules
        this.types = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        /* types ~= {
            "unknown":0,   //0
            "style":0,     //1
            "charset": 0,  //2
            "import":0,    //3
            "media":0,     //4
            "font-face":0, //5
            "page":0,      //6
            "keyframes":0, //7 This is the @keyframe at rule
            "keyframe":0,  //8 This is the individual 0%, or from/to
            "reserved9":0, //9
            "namespace":0, //10
            "reserved11":0,//11
            "supports":0,  //12
            "reserved13":0,//13
            "reserved14":0,//14
            "viewport":0,  //15
        }*/
        // this will contains the various datapoints we measure on css selector usage
        this.usages = { "SuccessfulCrawls": 1 };
        this.atrules = atruleUsage;
        this.rules = ruleUsage;
        this.props = propUsage;
        this.types = typeUsage;
        this.usages = usageData;
    }
    return CSSUsage;
}());
exports.default = CSSUsage;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AtRuleUsage_1 = __webpack_require__(5);
var CssAtRuleUsage = /** @class */ (function () {
    function CssAtRuleUsage() {
    }
    CssAtRuleUsage.isRuleAnAtRule = function (rule) {
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
        var type = rule.type;
        return (type >= 2 && type <= 8) || (type == 10) || (type == 12) || (type == 15);
    };
    CssAtRuleUsage.processAtRule = function (rule) {
        if (rule.conditionText) {
            //processConditionalAtRules(rule);
        }
        else {
            //processGeneralAtRules(rule);
        }
        return new AtRuleUsage_1.default();
    };
    CssAtRuleUsage.processAtRuleUpdate = function (rule, previousUsage) {
        if (rule.conditionText) {
            //processConditionalAtRules(rule);
        }
        else {
            //processGeneralAtRules(rule);
        }
        return new AtRuleUsage_1.default();
    };
    return CssAtRuleUsage;
}());
exports.default = CssAtRuleUsage;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AtRuleUsage = /** @class */ (function () {
    function AtRuleUsage() {
        this.count = 1;
        this.props = {};
    }
    return AtRuleUsage;
}());
exports.default = AtRuleUsage;


/***/ })
/******/ ]);