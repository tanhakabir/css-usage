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
var cssAtRuleUsage_1 = __webpack_require__(1);
var styles = cssAtRuleUsage_1.default.test();
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
    console.log(document.styleSheets);
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
var CSSAtRuleUsage = /** @class */ (function () {
    function CSSAtRuleUsage() {
    }
    CSSAtRuleUsage.test = function () {
        return document.stylesheets;
    };
    return CSSAtRuleUsage;
}());
exports.default = CSSAtRuleUsage;


/***/ })
/******/ ]);