//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    PickerBtnIndex =pars[0];
    SelledLabel = $(pars[1]);
    NameLabel = $(pars[2]);
    RulesLabel = $(pars[3]);
    ProfitLabel = $(pars[4]);
    RuleInfo01 = $(pars[5]);
    BuyBtnLabel = $(pars[6]);
    BuyBtnLabel.click(Buy_SubmitOrder);
    InitWeChatTable();

    if(MinerList[window.localStorage.getItem("MinerSelection")] == null){
        window.location.href="logo.html";
    }else{
        InitSelectionMiner(MinerList,window.localStorage.getItem("MinerSelection"));
        window.localStorage.removeItem("MinerSelection");
    }
}

var PickerBtnIndex;
var SelledLabel;
var NameLabel;
var RulesLabel;
var ProfitLabel;
var MinerList;
var RuleInfo01;
var BuyBtnLabel;
var MinerSelection;


var Buy_Pay = function (id,type,price) {
    console.log("买矿机:"+type);
    var BuyMiner = MinerList[type];
    Loading();
    //alert("微信支付准备");
    if(price <= 0){
        FinishLoading();
        Buy_Result_Success(id,price,"free");
    }else {
        WechatPay(id,type,price,function () {
            FinishLoading();
            Buy_Result_Success(id,price,"wechat");
        },function () {
            FinishLoading();
            Buy_Result_Failed(id);
        });
    }
}


var Buy_Result_Success = function (id,price,access) {
    Loading();
    Request("or","success",{"id":id,"tele":TELE(),"key":AUTHKEY(),"pr":price,"pa":access},
        function (code,data) {
            OnLogin(TELE(),AUTHKEY(),function () {
                SetBillInfo("order",id);
                window.location.href="bill.html";
                FinishLoading();
            },function () {
                FinishLoading();
            });
            console.log("success:"+data);
        },function (code,data) {
            console.log(code);
            FinishLoading();
        });
}

var Buy_Result_Failed = function (id) {
    Request("or","failed",{"id":id,"tele":TELE(),"key":AUTHKEY()},
        function (code,data) {
            OnLogin(TELE(),AUTHKEY(),function () {
            },function () {
            });
            console.log("success:"+data);
        },function (code,data) {
            console.log(code);
        });
}

var Buy_SubmitOrder = function () {
    console.log(MinerSelection);
    Request("or","sub",{"tele":TELE(),"mtype":MinerSelection,"key":AUTHKEY()},
        function (code,data) {
            console.log(data['order']);
            Buy_Pay(data['order']['id'],data['order']['mtype'],data['order']['price']);
        },function (code,data) {
            console.log(code);
            alert(data['context']);
        });
}

var InitWeChatTable = function () {

    if(window.localStorage.getItem("minerList")==null){
        window.location.href="logo.html";
    }
    MinerList = JSON.parse(GetLocalMinerList());

    console.log(MinerList);
    //window.localStorage.removeItem("minerList");

    document.querySelector(PickerBtnIndex).addEventListener('click', function () {
        weui.picker(
            GetPickerList(MinerList)
            , {
            className: 'custom-classname',
            container: 'body',
            defaultValue: [1],
            onChange: function (result) {
            },
            onConfirm: function (result) {
                InitSelectionMiner(MinerList,result[0]['value']);
            },
            id: 'singleLinePicker'
        });
    });
}

//初始化矿机选择信息
var InitSelectionMiner=function (MinerList,selection) {
    MinerSelection = selection;
    SelledLabel.html(
        MinerList[selection].msell
    );
    NameLabel.html(MinerList[selection].mname+"挖矿规则");


    var DayProfit = (MinerList[selection].daylimt*365+10000);

    ProfitLabel.html(DayProfit+"FIT");
    RulesLabel.html(
        "（ "+(MinerList[selection].daylimt)+"FIT/天 * 365天 + 10000FIT = "+DayProfit+"FIT ）");
    RuleInfo01.html("1.一年内，每日运动达标后（≥1万步），当日最多可挖"+MinerList[selection].daylimt+"；");
    BuyBtnLabel.html("￥"+MinerList[selection].mprice/100+"/台/年 立即购买");
}

var GetPickerList = function (MinerList) {
    var result = [];
    //var seek = 0;
    for(var key in MinerList){
        var miner = {};
        miner["label"] = MinerList[key].mname;
        miner["value"] = key;
        result.push(
            miner
        );
    }
    return result;
}


document.MinerState = function (code, data) {
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}