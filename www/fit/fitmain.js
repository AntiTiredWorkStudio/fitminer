//需要jquery支持

//库
var libs = {
    "weui":"fit/lib/weui.js",
    "sha1":"fit/lib/sha1.js",
    "plib":"fit/lib/fitminer.js"
};
//页面控制器
var controllers = {
    "index":"fit/controller/index.js",//开始
    "register":"fit/controller/register.js",//注册页面
    "login":"fit/controller/login.js",//登录页面,
    "logo":"fit/controller/logo.js",//矿机货架
    "minerinfo":"fit/controller/minerinfo.js",//矿机购买页面
    "miner":"fit/controller/miner.js",//跑步页面
    "personal":"fit/controller/personal.js",//个人页面
    "about":"fit/controller/about.js",//关于页面
    "list":"fit/controller/list.js",//订单请求页面
    "bill":"fit/controller/bill.js",//订单详情页面
    "certification":"fit/controller/certification.js",//实名认证页面
    "drawmoney":"fit/controller/drawmoney.js"//提现页面
};

//初始化Fit代码生命周期
var InitFit = function(controllerID,initpars){


        for(var libID in libs){
            document.write("<script type='text/javascript' src="+libs[libID
                ]+"></script>");
        }

        document.write("<script>InitPageTime();</script>");

        Init_Cordova_Libs();//初始化 Cordova 框架

        var parsText = JSON.stringify(initpars);


        if(controllers.hasOwnProperty(controllerID)){
            document.write("<script type='text/javascript' src="+controllers[controllerID]+"></script>");

            document.write("<script>Awake();</script>");
            if(initpars != undefined) {
                document.write("<script>SelectorInit("+parsText+");</script>");
            }


            //初始化计步功能
            document.write("<script>" +
                "if(document.hasOwnProperty('MinerState')) " +
                "{" +
                "InitDig(document.MinerState,document.MinerState);" +
                "}" +
                "else{" +
                "console.log('No Dig Call Back');" +
                "}" +
                "</script>");

        }else{
            console.log("不包含库:"+controllerID);
        }

        console.log("初始化fit 系统");

}





var Init_Cordova_Libs = function () {
    console.log("初始化 Cordova 框架");
    document.write("<script type='text/javascript' src='cordova.js'></script>");
    document.write("<script type='text/javascript' src='fit/cordovaInitor.js'></script>");
}

