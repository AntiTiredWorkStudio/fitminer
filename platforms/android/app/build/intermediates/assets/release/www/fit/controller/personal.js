//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    teleLabel = $(pars[0]);
    accountLabel = $(pars[1]);
    getPersonalInfo();
}


var teleLabel;
var accountLabel;

var getPersonalInfo = function () {

    Request('mi','gdig',{"tele":TELE(),"key":AUTHKEY()},function (code,data) {
        var tmcount = data['tmcount']==null?"0": data['tmcount'];
        setPersonalInfo(TELE(),tmcount);
    },function (code,data) {
        setPersonalInfo('',0);
    });
}

var setPersonalInfo = function (tele, tmcount) {
    var teleText = tele.split('');
    teleText[3] = '*';
    teleText[4] = '*';
    teleText[5] = '*';
    teleText[6] = '*';
    teleText = teleText.join("");
    teleLabel.html(teleText);
    accountLabel.html(tmcount+" FIT");
}
//挖矿状态
document.MinerState = function (code, data) {
    if(code == 0)
        getPersonalInfo();
}