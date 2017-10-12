import AtRuleUsage from './AtRuleUsage';

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
            //processConditionalAtRules(rule);
        } else {
            //processGeneralAtRules(rule);
        }
        return new AtRuleUsage();
    }

    public static processAtRuleUpdate(rule: any, previousUsage: AtRuleUsage): AtRuleUsage {
        if(rule.conditionText) {
            //processConditionalAtRules(rule);
        } else {
            //processGeneralAtRules(rule);
        }
        return new AtRuleUsage();
    }
}