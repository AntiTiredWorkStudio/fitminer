//唤醒控制器
var Awake = function () {
    console.log("唤醒控制器");
}
//初始化控制器，通过选择器为对象绑定各种事件
// pars 为传入的选择器参数
var SelectorInit = function (pars) {

    genvalBtn = $(pars[0]);
    teleInputBox = $(pars[1]);
    registBtn = $(pars[2]);
    agreeContract = $(pars[3]);
    valInputBox = $(pars[4]);

    genvalBtn.click(GetValidateFunc);
    registBtn.click(Regist_Start);
}

var genvalBtn;//获取验证码按钮
var teleInputBox;//电话输入框
var registBtn;//注册按钮
var agreeContract;//免责生命勾选框
var valInputBox;//验证码输入框


//获取验证码
var GetValidateFunc = function(){
    GeneralValidateCode(teleInputBox.val());
}



var Miner = function(){
    window.location.href='miner.html';
}

var NotMiner = function () {
    window.location.href='logo.html';
}

//注册
var Regist_DoRegist = function (tele,uuid) {
    Request("us","reg",{"tele":tele,"key":AUTHKEY(),"uuid":uuid},function (code,data){
        console.log(code);

        //alert(data['context']);
        MsgBox_OK("注册结果",data['context'],"<strong style='color:#e6b000'>知道了</strong>",function () {
            OnLogin(tele,AUTHKEY(),Miner,NotMiner);
        });

        //window.location.href='logo.html';


    },function (code,data){

        MsgBox_OK("注册失败","用户已经存在，请登录","<strong style='color:#e6b000'>知道了</strong>",function () {
            CLEARTELEKEY();
            switch (code){
                case "12":;
                    window.location.href='login.html';
                    break;
                case "11":
                    window.location.href='index.html';
                    break;
                default:
                    break;
            }
        });
    });
}

//校验验证码并获取鉴权码
var Regist_GetAuth = function (tele,val) {
    Request("va","cok",{"tele":tele,"val":val},
        function (code,data){
            console.log(code);

            //MsgBox_OK("获取鉴权码",data['context'],"<strong style='color:#e6b000'>知道了</strong>",function () {});

            Regist_DoRegist(tele,UUID());
        },
        function (code,data){
            console.log(code);

            MsgBox_OK("验证失败","验证码校验失败","<strong style='color:#e6b000'>知道了</strong>",function () {});
        }
    );
}

//开始注册
var Regist_Start = function(){//点击注册按钮

    var isChecked = agreeContract.prop("checked");
    var teleValue = teleInputBox.val();
    var valInput = valInputBox.val();

    var cResult = IsCellPhoneNumber(teleValue);
    var vResult = IsValidateCode(valInput);

    if(cResult!=""){
        alert(cResult);
        return;
    }
    if(vResult!=""){
        alert(vResult);
        return;
    }

    if(!isChecked){
        //alert("您未同意条款！！！");

        MsgBox_OK("提示","您还未同意条款","<strong style='color:#e6b000'>知道了</strong>",function () {});
        return;
    }

    Regist_GetAuth(teleValue,valInput);

    //Request("us","reg",{""});
    //提交注册信息
};
