import CssPropertyValuesAnalyzer from './CssPropertyValuesAnalyzer';

export default class Setup {
	public static browserIsEdge = navigator.userAgent.indexOf('Edge')>=0;
	public static browserIsFirefox = navigator.userAgent.indexOf('Firefox')>=0;

    public static guardExecution() {
        // Don't run in subframes for now
		if (top.location.href !== location.href) throw new Error("CSSUsage: the script doesn't run in frames for now");
		
		// Do not allow buggy trim() to bother usage
		if((''+String.prototype.trim).indexOf("[native code]") == -1) {
			console.warn('Replaced custom trim function with something known to work. Might break website.');
			String.prototype.trim = function() {
				return this.replace(/^\s+|\s+$/g, '');
			}
        }
	}
	
	public static setUpClasses() {
		CssPropertyValuesAnalyzer.getBuggyValuesForThisBrowser();
	}
}