//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    $(pars[0]).click(checkUpdate);
    $(pars[1]).click(aboutInfo);
    $(pars[2]).click(unlogin);
}
//挖矿状态
document.MinerState = function (code, data) {

}


var checkUpdate = function (){
    console.log("检查更新");
}

var aboutInfo = function () {
    console.log("关于");
    window.location.href = "http://www.fitchain.pro/";
}

var unlogin = function () {
    //console.log("准备下线");
    window.localStorage.clear();
    window.location.href = "index.html";
}