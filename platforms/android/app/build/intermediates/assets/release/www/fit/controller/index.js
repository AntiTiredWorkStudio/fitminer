//唤醒控制器
var Awake = function () {

    var tele = window.localStorage.getItem("Tele");
    var authkey = window.localStorage.getItem("SecretKey");
    var uuid = UUID();


    if(tele != null && authkey != null) {
        Request("us", "log", {"tele": tele, "key": authkey, "uuid": uuid},
            function (code, data) {
                console.log("状态:" + code + "  ", data);

                OnLogin(tele,authkey,Miner,NotMiner);

            }, function (code, err) {
                console.log("状态:" + code + "  ", err);
            });
    }else {
        console.log("不存在登录信息");
    }
}
//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    console.log(pars);

}


var Miner = function(){
    window.location.href='miner.html';
}

var NotMiner = function () {
    window.location.href='logo.html';
}