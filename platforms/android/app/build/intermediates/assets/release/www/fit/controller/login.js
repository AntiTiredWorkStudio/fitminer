//唤醒控制器
var Awake = function () {

}
//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    genvalBtn = $(pars[0]);
    teleInputBox = $(pars[1]);
    loginBtn = $(pars[2]);
    valInputBox = $(pars[3]);
    genvalBtn.click(GetValidateFunc);

    loginBtn.click(Login_Start);
}


var genvalBtn;//获取验证码按钮
var teleInputBox;//电话输入框
var loginBtn;//注册按钮
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

//登录
var Login_DoLogin = function(tele,uuid){
    Request("us", "log", {"tele": tele, "key": AUTHKEY(), "uuid": uuid},
        function (code, data) {
            console.log("状态:" + code + "  ", data);
            OnLogin(tele,AUTHKEY(),Miner,NotMiner);
            //window.location.href='logo.html';
        }, function (code, err) {
            alert("登录失败");
            console.log("状态:" + code + "  ", err);
        });
}
//校验验证码并获取鉴权码
var Login_GetAuth = function(tele,val) {
    Request("va","cok",{"tele":tele,"val":val},
        function (code,data){
            console.log(code);
            alert(data['context']);
            Login_DoLogin(data['tele'],UUID());
        },
        function (code,data){
            console.log(code);
            alert(data['context']);
        }
    );
}
//开始注册
var Login_Start = function() {
    console.log("登录");
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
    Login_GetAuth(teleValue,valInput);
}
