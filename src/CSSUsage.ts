export default class CSSUsage {

    // this will contain the usage stats of atrules
    public atrules = {};
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
    public rules = {"@stylerule":0,
                    "@atrule":0,
                    "@inline":0};
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
    public props = {};
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
    public types = [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ];
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
    public usages = {"SuccessfulCrawls":1};

    constructor(atruleUsage: any, ruleUsage: any, propUsage: any, typeUsage: number[], usageData: any) {
        this.atrules = atruleUsage;
        this.rules = ruleUsage;
        this.props = propUsage;
        this.types = typeUsage;
        this.usages = usageData;
    }
}