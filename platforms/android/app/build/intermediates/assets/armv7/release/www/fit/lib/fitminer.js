//需要的库：jquery.js  sha1.js   Cordova.js(肯定需要) weui.js

var Options = {
    Url : "http://www.antit.top:8001/fitback/index.php"//"http://192.168.1.106:8001/fitback/index.php"
};

//调用请求
var Request = function(module,action,paras,fSuccess,fFailed) {

    var postInfo = {};
    postInfo[module] = action;

    for(var k in paras){
        postInfo[k] = paras[k];
    }

    var allowLoading = true;
    if(arguments.length == 6){
        allowLoading = arguments[5];
    }
//	console.log(postInfo);
    if(allowLoading) {
        Loading();
    }

    var ajaxObject ={
        url: Options.Url,
        type: "post",
        dataType: "json",
        data: postInfo,
        success: function (data) {

            if(allowLoading) {
                FinishLoading();
            }
            UpdateAuthKey(data);
            if(data["result"] == "true" || data['code']=="0"){

                fSuccess(data['code'],data);
            }else{

                if(data['code'] == '10'){

                    window.localStorage.clear();
                    if(removeFile){
                        removeFile(function (result) {
                            window.location.href = "index.html";
                        });
                    }
                    return;
                }
                fFailed(data['code'],data);
            }
        },
        error: function (e) {
            if(allowLoading) {
                FinishLoading();
            }
            fFailed('-1',e);
        }
    };
    document.DoAjax(ajaxObject);
}

document.DoAjax=function (aObject) {
    var strUrl=window.location.href;
    var arrUrl=strUrl.split("/");
    var strPage=arrUrl[arrUrl.length-1];
    if(strPage != "index.html"){
        $.ajax(aObject);
        return;
    }
    if (navigator.connection.type == Connection.UNKNOWN ||  navigator.connection.type == Connection.NONE){
        //alert(navigator!=null && navigator.connection!=null && (navigator.connection.type == Connection.UNKNOWN ||  navigator.connection.type == Connection.NONE));
        FinishLoading();
        MsgBox_YESNO("警告", "网络连接异常", "<strong style='color:#aaa'>重试</strong>", "<strong style='color:#aaa'>退出</strong>", function (e) {
            if (e.target.innerText == "重试") {
                Loading();
                document.DoAjax(aObject);
            }else {navigator.app.exitApp();}

        }, function (e) {
            navigator.app.exitApp();
        });
    }else {

        $.ajax(aObject);
    }
}

//更新鉴权码
var UpdateAuthKey = function(data){
 //   console.log("鉴权码:"+data);
    if(data.hasOwnProperty("tele") && data.hasOwnProperty("time") && data.hasOwnProperty("rand")){
        //更新鉴权码
        console.log("鉴权码:"+data['tele'],data['time'],data['rand']);
        var authKey = data['tele']+data['time']+data['rand'];
        var authSecretKey = sha1(authKey);
        window.localStorage.setItem("Tele",data['tele']);
        window.localStorage.setItem("SecretKey",authSecretKey);
    }else{
      //  console.log("不包含鉴权码");
    }
}

//获取缓存中手机号
var TELE = function(){
    return  window.localStorage.getItem("Tele");
}
//获取缓存中的鉴权码
var AUTHKEY = function(){
    return  window.localStorage.getItem("SecretKey");
}

var CLEARTELEKEY = function () {
    window.localStorage.removeItem("Tele");
    window.localStorage.removeItem("SecretKey");
}

//获取前一天的数据
var LASTDAYDATA = function () {
    if (window.localStorage.getItem("lastDay") != null) {
        return JSON.parse(window.localStorage.getItem("lastDay"));
    }
    return null;
}

//获得步数
var STEP = function () {

    if(window.localStorage.getItem("StepInfo") != null){
        var step = 0;
        var stepInfo = JSON.parse(window.localStorage.getItem("StepInfo"));
    //    console.log(stepInfo['steps']);
        for(var k in stepInfo['steps']){
            step += stepInfo['steps'][k];
        }
        return step;
    }

    return 0;
}

//获得操作页面的时间
var PAGE_TIME = function () {
    return window.localStorage.getItem("PageTime");
}

//获得操作页面的日期
var PAGE_DAY = function () {
    return window.localStorage.getItem("PageDay");
}

var Now_DAY = function () {
    return DAY(JSTimeToPHPTime(PRC_TIME()));
}

//初始化页面时间
var InitPageTime = function () {
    window.localStorage.setItem("PageTime",JSTimeToPHPTime(PRC_TIME()));
    window.localStorage.setItem("PageDay",DAY(JSTimeToPHPTime(PRC_TIME())));
}


//获取设备号
var UUID = function () {
    return tUUID;
}

var tUUID = "";
var tVersion = "";
var tSystem = "";
//检查验证码格式
var IsValidateCode = function(target){

    if(target == null || target==""){
        return "还未输入验证码";
    }

    if(!(/^\d{6}$/.test(target))){
        return "验证码格式有误，请重填";
    }

    return "";
}

//检查手机号格式
var IsCellPhoneNumber = function(target){
    if(target == null || target==""){
        return "还未输入手机号码";
    }

    if(!(/^1[34578]\d{9}$/.test(target))){
        return "手机号码有误，请重填";
    }

    return "";
}

//获取验证码
var GeneralValidateCode = function (tele){
    var cResult = IsCellPhoneNumber(tele);
    if(cResult != ""){
        MsgBox_OK("信息",cResult,"<strong style='color:#e6b000'>知道了</strong>",function () {});
        return;
    }

    if(window.localStorage.hasOwnProperty("valtime")){
        var leftSeconds = parseInt(window.localStorage.getItem("valtime")) - JSTimeToPHPTime(PRC_TIME());

        if(leftSeconds>0){
            MsgBox_OK("信息","还有"+leftSeconds+"秒才能获取验证码","<strong style='color:#e6b000'>知道了</strong>",function () {});
            return;
        }
    }

    //请求获取验证码
    Request("va","gen",{"tele":tele},
        function (code,data){
            console.log(code);
            //alert(data['context']);
            window.localStorage.setItem("valtime",(JSTimeToPHPTime(PRC_TIME())+60));
            SaveAllKey(function () {

            });
            MsgBox_OK("信息","验证码已发送","<strong style='color:#e6b000'>知道了</strong>",function () {});

        },
        function (code,data){
            console.log(code);
            //alert(data['context']);
            MsgBox_OK("信息","验证码发送失败,"+data['context'],"<strong style='color:#e6b000'>知道了</strong>",function () {});

        }
    );
}

//当登录时调用(拥有矿机,还未拥有矿机)
var OnLogin = function (tele,authkey,Miner,NotMiner) {
    Request('mi','ini',{"tele":tele,"key":authkey},
        function (code,data){
            CollectLastDayData(data);
            StepInit(parseInt(data['steps']));
            console.log("code:"+code,data);
           // alert('code:'+JSON.stringify(data));
            Miner();
        },
        function (code,data){
            console.log("code:"+code,data);
           // alert('code:'+data);
            if(code == 32){
                Miner();
            }else {
                NotMiner();
            }
        });
}

//收集前一天的数据
var CollectLastDayData = function (data) {
    if(data.hasOwnProperty("lastDay")){
        window.localStorage.setItem("lastDay",JSON.stringify(data["lastDay"]));
    }
}

//微信支付接口调用
var WechatPay = function (id,mtype,price,success,failed) {
    console.log("调用微信支付:"+mtype+","+price);
    Request("or","wxpay",{"tele":TELE(),"key":AUTHKEY(),"type":mtype,"price":price,"id":id},
        function (code, data) {
            if(Wechat && Wechat.sendPaymentRequest){
                var params = {
                    "partnerid" : data["pay"]["partnerid"],
                    "prepayid" : data["pay"]["prepayid"],
                    "noncestr" : data["pay"]["noncestr"],
                    "timestamp" : data["pay"]["timestamp"],
                    "sign" : data["pay"]["sign"]
                };
                //alert(JSON.stringify(params));
                Wechat.sendPaymentRequest(params, function () {
                    MsgBox_OK("信息","支付成功","<strong style='color:#e6b000'>知道了</strong>",function () {success();});

                }, function (reason) {
                    var reasonDetials = "";
                    if(reason == "用户点击取消并返回") {
                        reasonDetials = "支付取消"
                    }
                    MsgBox_OK("信息", reasonDetials, "<strong style='color:#e6b000'>知道了</strong>", function () {
                        failed();
                    });
                });
            }else {
                //alert("!Wechat && Wechat.sendPaymentRequest");
                failed();
            }
        },
        function (code, data) {
            failed();
        }
        );
}

//获取矿机列表
var GetLocalMinerList = function () {
    return window.localStorage.getItem("minerList");
}

//获取格式化时间
var GetFormateTime = function (tstamp) {
    var date;
    if(tstamp==null) {
        date = new Date();
        //console.log("TimeStamp:"+date.getTime());
    }else {
        date = new Date(tstamp);
    }
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';

    D = date.getDate();
    h = date.getHours();
    m = date.getMinutes();
    s = date.getSeconds();

    if(h<10){
        h = '0'+h;
    }
    if(m<10){
        m = '0'+m;

    }
    if(s<10){
        s = '0'+s;
    }

    D = D + ' ';
    h = h + ':';
    m = m + ':';

    return Y+M+D+h+m+s;
}

//php 时间戳转换为js时间戳
var PhpTimeToJsTime = function (time) {
    return (time - 8*3600)*1000;
}

//js 时间戳转换为php时间戳
var JSTimeToPHPTime = function (time) {
    return Math.floor(time/1000);
}

//获得标准+8时区时间（js时间戳）
var PRC_TIME = function () {
    return (new Date()).getTime();// + 8*3600000;
}


//通过时间戳计算天数（需要转换为php时间戳计算）
function DAY(tStamp){
    return (tStamp - tStamp%86400)/86400;
}

//控制值在某范围内
var Clamp = function (val,min,max) {
    return (val<min)?min:((val>max)?max:val);
}

//挖矿模块
var DigObject = {
    Uploading: false,
    DigMiner : function () {
       // console.log({"tele":TELE(),"key":AUTHKEY(),"step":STEP()});
        var tele = TELE();//手机号
        var key = AUTHKEY();//鉴权码
        var step = STEP();//步数
        if(tele==null || key == null || step == null){
            console.log("验证信息不全面");
            return;
        }
        if(!DigObject.Uploading) {
            DigObject.Uploading = true;
            Request("mi", "dig",
                {"tele": tele, "key": key, "step": step},
                function (code, data) {
                    DigObject.Uploading = false;
                    DigObject.MinerSuccess(code, data);
                },
                function (code, data) {
                    DigObject.Uploading = false;
                    DigObject.MinerFailed(code, data);
                }, false
            );
        }
    },
    MinerSuccess:function (code,data) {},
    MinerFailed:function(code,data){},
    StepMine:function (step) {
        StepCollecting(step);//步数收集
        this.DigMiner();//挖矿请求
    }
}



var InitDig = function (OnMinerSuccess,OnMinerFailed) {
    if(OnMinerSuccess != null)
        DigObject.MinerSuccess = OnMinerSuccess;
    if(OnMinerFailed != null)
        DigObject.MinerFailed = OnMinerFailed;

    //绑定计步Dig事件（仅供测试）
   //setInterval(function(){_step+=15;DigObject.StepMine(_step);},2000);
    //console.log('setInterval');
   // setTimeout(function(){DigObject.StepMine(++step)},6000);
}

var StepInit = function (step) {
    var stepinfo = {};
    stepinfo['day'] = PAGE_DAY();
    stepinfo['steps'] = {};
    stepinfo['steps'][''+PAGE_TIME()] = step;
    /*if(pedometerData && pedometerData.hasOwnProperty("numberOfSteps")) {
        pedometerData.numberOfSteps = step;
    }*/
    window.localStorage.setItem("StepInfo",JSON.stringify(stepinfo));
    window.location.href = "miner.html";//强制刷新
}

//步数收集
var StepCollecting = function (step) {
    var stepinfo = {};
    if(window.localStorage.getItem("StepInfo") != null){
        stepinfo = JSON.parse(window.localStorage.getItem("StepInfo"));
        if(stepinfo['day'] != Now_DAY()){//缓存天不是当前天
            //step = 0;
            _step = 0;
            stepinfo['day'] = Now_DAY();
            stepinfo['steps'] = {};
            window.localStorage.setItem("StepInfo",JSON.stringify(stepinfo));
            //return;
        }
        var PageTimeIndex = '' + PAGE_TIME();
        if(!stepinfo['steps'].hasOwnProperty(PageTimeIndex)){
            var totalStep = STEP();
            //alert("totalStep:"+totalStep);
            stepinfo['steps'] = {};
            stepinfo['steps']['collect'] = totalStep;
        }

        stepinfo['steps'][''+PAGE_TIME()] = step;
    }else {
        stepinfo['day'] = PAGE_DAY();
        stepinfo['steps'] = {};
        stepinfo['steps'][''+PAGE_TIME()] = step;
        //alert(JSON.stringify(stepinfo));
    }
    window.localStorage.setItem("StepInfo",JSON.stringify(stepinfo));
}


//状态文本
var StateText = function (state) {
    switch (state) {
        case "SUCCESS":
            return "完成";
        case "FAILED":
            return "失败";
        case "SUBMIT":
            return "提交";
        case "VERIFY":
            return "审核中";
        case "CANCEL":
            return "取消";
        case "PAYMENT":
            return "待支付";
        case "INVALID":
            return "失效";
        default:
            return "";
    }
}

var StateColor = function (state) {
        switch (state ){
            case "SUCCESS":
                return "#d3a510";
            case "FAILED":
                return "#f00";
            case "SUBMIT":
                return "#bbb";
            case "VERIFY":
                return "#0af";
            case "CANCEL":
                return "#777";
            case "PAYMENT":
                return "#7f7";
            case "INVALID":
                return "#777";
            default:
                return "";
        }
}

//设置订单详情页内容索引
var SetBillInfo = function (type,id) {
    var BillInfo = {
        "type":type,
        "id":id
    }
    window.localStorage.setItem("BillInfo",
        JSON.stringify(BillInfo)
        );
}

//获取订单详情页内容索引
var GetBillInfo = function () {
    if(window.localStorage.getItem("BillInfo") != null){
        return JSON.parse(window.localStorage.getItem("BillInfo"));
    }else{
        return null;
    }
}

var MsgBox_OK = function (titleContext,content,OKLabel,OnOK) {
    weui.alert(content, OnOK, {title: titleContext,button:[
            {
                label:OKLabel,
                type:'primary',
                onClick:OnOK
            }]});
}

var MsgBox_YESNO = function (titleContext,content,YesLabel,NoLabel,OnYes,OnNo) {
    weui.confirm(content,
        {title: titleContext,
            button:[
                {
                    label:YesLabel,
                    type:'default',
                    onClick:OnYes
                },
                {
                    label:NoLabel,
                    type:'primary',
                    onClick:OnNo
                }
            ]
        }
    );
}


var CheckUpdate = function (version,avkey,vFunc) {
    Request("ve","vchk",{"ver":version,"avkey":avkey},
        function (code, data) {
            var newVersion = null;
            if(data.hasOwnProperty("tVersion")){//当前版本未下架,但是新版本已经上线
                newVersion = data['tVersion'];
            }
            vFunc(true,newVersion);
        },
        function (code, data) {
            var newVersion = null;
            if(data.hasOwnProperty("tVersion")){//当前版本下架,必须更新至新版本
                newVersion = data['tVersion'];
            }
            vFunc(false,newVersion);
        }
    );
}


var loadingObject;
var Loading = function () {
    if(loadingObject!=null){
        FinishLoading();
    }
    loadingObject = weui.loading('loading', {
        className: 'custom-classname'
    });
}



var FinishLoading = function () {
    if(loadingObject == null){
        return;
    }
    loadingObject.hide(function () {
        
    });
}


var AddLib = function (url) {
    document.write('<script type="text/javascript" src="'+url+'"></script>');
}

