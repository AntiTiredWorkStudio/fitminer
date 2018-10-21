//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    teleLabel = $(pars[0]);
    accountLabel = $(pars[1]);

    teleLabel.html("");
    accountLabel.html("");

    getPersonalInfo();
}


var teleLabel;
var accountLabel;

var getPersonalInfo = function () {
    Loading();
    Request('mi','gdig',{"tele":TELE(),"key":AUTHKEY()},function (code,data) {
        var tmcount = data['tmcount']==null?"0": data['tmcount'];
        setPersonalInfo(TELE(),tmcount);
        FinishLoading();
    },function (code,data) {
        setPersonalInfo('',0);
        FinishLoading();
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

    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}