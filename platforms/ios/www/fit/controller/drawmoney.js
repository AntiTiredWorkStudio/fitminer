//'#container','#idstate','#fit','#drawmoneyCount','#address','#submit'
//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    container = $(pars[0]);
    idState = $(pars[1]);
    fitCount = $(pars[2]);
    drawmoneyInput = $(pars[3]);
    addressInput = $(pars[4]);
    submitBtn = $(pars[5]);
    hintLabel = $(pars[6]);


    fitCount.html("");
    hintLabel.html("");
    idState.html("");


    InitDrawMoney();
    submitBtn.click(OnSubmit);
    drawmoneyInput.bind("keyup",OnMoneyInput);
}

var container;
var idState;
var fitCount;
var fitCountValue;
var drawmoneyInput;
var drawmoneyResult = false;


var addressInput;
var defaultAddress = "";


var submitBtn;
var hintLabel;



//挖矿状态
document.MinerState = function (code, data) {
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}

var GetIdStateContent = function (result) {
    if(result){
        return '<i class="weui-icon-success weui-icon-mini"><h5 class="weui-cell__bd weui-btn_inline ">身份验证已经通过</h5></i>';
    }else {
        return '<i class="weui-icon-warn weui-icon-mini"><h5 class="weui-cell__bd weui-btn_inline ">身份验证未通过</h5></i>';
    }
}

//接收实名认证结果
var IdentificationState = function (result) {
    if(result){
        idState.html(GetIdStateContent(result));
    }else {
        container.html("<div style='height:3em;'></div><center>"+GetIdStateContent(false)+"</center>");
        //MsgBox_OK("提示","当前用户还未通过实名认证")
        MsgBox_YESNO("提示","当前用户还未通过实名认证","前往认证","返回",function (e) {
            if(e.target.innerText=="前往认证"){
                window.location.href="certification.html";
            }
        },function (e) {
            console.log("返回?");
            window.location.href="personal.html";
        });
    }
}

//初始化提现模块
var InitDrawMoney = function () {
    Loading();
    Request("id","get",{"tele":TELE(),"key":AUTHKEY()},
        function (code, data) {
        console.log(data);
        addressInput.val(data['address']);
        defaultAddress = data['address'];
        IdentificationState(true);
        InitPersonalPackage();
        FinishLoading();
    },function (code, data) {
        console.log(data);
        IdentificationState(false);
        FinishLoading();
    });
}

//初始化钱包数额
var InitPersonalPackage  =function () {
    Request('mi','gdig',{"tele":TELE(),"key":AUTHKEY()},function (code,data) {
        //console.log(data);
        //DeltaInfo(data['mcount'],data['tmcount'],data['cdays']);
        //setPersonalInfo(TELE(),data['tmcount']);
        fitCount.html(data['tmcount']);
        fitCountValue = parseFloat(data['tmcount']);
    },function (code,data) {
        setPersonalInfo('',0);
    });
}


var OnSubmit = function () {
    //console.log("提交");

    if(!drawmoneyResult){
        MsgBox_OK("警告","提现金额输入有误","确定",function () {
            drawmoneyInput.val("");
        });
        return;
    }

    if(!/^(0x)[a-fA-F\d]{40}$/.test(addressInput.val())){
        MsgBox_OK("警告","数字钱包地址格式有误","确定",function () {
            addressInput.val(defaultAddress);
        });
        return;
    }
    var mcount = drawmoneyInput.val();
    var address =addressInput.val();

    Request("wi","apl",{"tele":TELE(),"key":AUTHKEY(),"mcount":mcount,"adress":address},
        function (code, data) {
            SetBillInfo("withdraw",data['id']);
            MsgBox_YESNO("提示","提现申请已经提交","前往查看","返回",function (e) {
                if(e.target.innerText=="前往查看"){
                    window.location.href="bill.html";
                }else {
                    window.location.href="personal.html";
                }
            },function (e) {
                window.location.href="personal.html";
            });
            console.log(data);
        },
        function (code, data) {
            console.log(data);
            MsgBox_OK("警告",data['context'],"确定",function () {
                window.location.href="personal.html";
            });
        }
        );
}


var OnMoneyInput = function (evt) {
    if(/^[0-9]*$/.test(evt.target.value)){

        if(parseInt(evt.target.value)%100 == 0 && parseInt(evt.target.value)>0){
            console.log("能被100整除");
            hintLabel.attr("style","color:#fff");
            drawmoneyInput.attr("style","color:#555");
            if(parseInt(evt.target.value) > fitCountValue){
                fitCount.attr("style","color:#f00");
                fitCount.html(fitCountValue+"(余额不足)");
                drawmoneyResult = false;//余额不足
            }else {
                fitCount.attr("style","color:#f0f8ff");
                fitCount.html(fitCountValue);
                drawmoneyResult = true;//正确
            }
        }else{
            hintLabel.attr("style","color:#f00");
            drawmoneyInput.attr("style","color:#f00");
            drawmoneyResult = false;//不是100整数倍
        }
    }else{
        evt.target.value = "";
        drawmoneyResult = false;//输入不符合规范
    }
}