//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    $(pars[0]).click(checkUpdate);
    $(pars[1]).click(aboutInfo);
    $(pars[2]).click(unlogin);
}

document.OnVersionGetted = function (tVer) {
    $(pars[3]).html(tVer);
}

//挖矿状态
document.MinerState = function (code, data) {
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}


var checkUpdate = function (){
    console.log("检查更新");
    var downUrl = (tSystem=="iOS")?"url_ios":((tSystem=="Android"?"url_android":"http://fitchain.pro"));
    //检查应用版本更新请求（暂未实现）
    CheckUpdate(tVersion,app.versionKey,function (result,vData) {
        if(result){
            if(vData!=null) {
                MsgBox_YESNO("提示", "软件有新版本:v"+vData["version"], "<strong style='color:#aaa'>更新</strong>", "<strong style='color:#aaa'>跳过</strong>", function (e) {
                    if (e.target.innerText == "更新") {
                        if (vData != null) {
                            window.location.href = vData[downUrl];
                            navigator.app.exitApp();
                        }
                    }
                }, function (e) {

                });
            }else {
                MsgBox_OK("提示","软件为最新版本，无需更新","<strong style='color:#aaa'>知道了</strong>",function () {
                });
            }
        }else {
            MsgBox_YESNO("通知","软件需要更新至v"+vData["version"]+"版本才可继续使用","<strong style='color:#aaa'>更新</strong>","<strong style='color:#aaa'>退出</strong>",function (e) {
                if(e.target.innerText=="更新"){
                    if(vData!=null) {
                        window.location.href = vData[downUrl];
                        navigator.app.exitApp();
                    }
                }
            },function (e) {
                navigator.app.exitApp();
                //退出App
            });
        }
    });
}

var aboutInfo = function () {
    console.log("关于");
    window.location.href = "start.html";
}

var unlogin = function () {
    //console.log("准备下线");
    window.localStorage.clear();
    if(removeFile){
        removeFile(function (result) {
            window.location.href = "index.html";
        });
    }
}