//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    priceLabel = $(pars[0]);
    titleLabel = $(pars[1]);
    timeInfoLabel = $(pars[2]);
    idLabel = $(pars[3]);
    contentLabel = $(pars[4]);
    stateLabel = $(pars[5]);
    btnContainer = $(pars[6]);

    priceLabel.html("");
    titleLabel.html("");
    timeInfoLabel.html("");
    idLabel.html("");
    contentLabel.html("");
    stateLabel.html("");

    InitBillInfo();
}

var priceLabel;
var titleLabel;//操作类型
var timeInfoLabel;
var idLabel;
var contentLabel;
var stateLabel;
var OnSellMiners;

var BillCache;
var btnContainer;


//挖矿状态
document.MinerState = function (code, data) {
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}

//初始化订单详情列表
var InitBillInfo = function () {
    BillCache = GetBillInfo();
    if(BillCache == null){
        priceLabel.html("0 FIT");
        titleLabel.html(" ");
        timeInfoLabel.html(" ");
        idLabel.html(" ");
        contentLabel.html(" ");
        stateLabel.html(" ");
    }else{
        switch (BillCache.type){
            case "order":
                InitByOrder(BillCache.type,BillCache.id);
                break;
            case "withdraw":
                InitByWithdraw(BillCache.type,BillCache.id);
                break;
            case "default":
                break;
        }
    }
}

var InitByOrder = function (type,id) {

    Request("md","gtd",{"tele":TELE(),"key":AUTHKEY()},
        function (code,data){
            OnSellMiners = data['miners'];//初始化矿机货架

            Request("or","gets",{"tele":TELE(),"key":AUTHKEY(),"id":id},InitGetOrderSuccess,InitGetFailed);

        },
        function (code,data){
            alert(data['context']);//失败输出失败信息
        }
    );
}

var InitByWithdraw = function (type,id) {
    Request("wi","gsi",{"tele":TELE(),"key":AUTHKEY(),"id":id},
        InitGetWithdrawSuccess,
        function (code,data){
            alert(data['context']);//失败输出失败信息
        }
    );
}





var InitGetOrderSuccess = function (code,data) {
    //console.log(data);
    var order = data['order'];
    priceLabel.html("¥ "+order.price/100);
    titleLabel.html(GetTitleContext(BillCache.type));
    timeInfoLabel.html(GetFormateTime(PhpTimeToJsTime(order.ptime)));
    idLabel.html(order.id);//需要改成order
    contentLabel.html(GetContentContext(BillCache.type,order));
    stateLabel.html(StateText(order.state));
    //btnContainer.html(PayStateBtn(order.state));
}

var InitGetWithdrawSuccess = function (code,data) {
    //console.log(data);
    var withdraw = data['withdraw'];
    priceLabel.html(withdraw.fit +" FIT");
    titleLabel.html(GetTitleContext(BillCache.type));
    timeInfoLabel.html(GetFormateTime(PhpTimeToJsTime(withdraw.ctime)));
    idLabel.html(withdraw.id);
    contentLabel.html(GetContentContext(BillCache.type,withdraw));
    stateLabel.html(StateText(withdraw.state));
    $("#detials").click(function () {
       MsgBox_OK("提币地址",withdraw.cadress,"确定",function () {
           
       });
    });
}


var InitGetFailed = function (code,data) {

}

var GetTitleContext = function (type) {
    switch (BillCache.type){
        case "order":
            return "购买矿机";
        case "withdraw":
            return "提币";
        case "default":
            return "";
    }
}

var GetContentContext = function (type,data) {
    switch (BillCache.type){
        case "order":
            return data.tele+"购买了【"+OnSellMiners[data.mtype].mname+"】";
        case "withdraw":
            return "FIT转入<strong><a id='detials'>"+getSercretAddress(data.cadress)+"</a></strong>账号";
        case "default":
            return "";
    }
}

var getSercretAddress = function (address) {
    var tAddress = address.split('');

    console.log(tAddress);
    var secret = [];
    for(var i = 8;i<32;i++){

        tAddress[i] = '*';
        console.log(tAddress[i]);
        secret.push('*');
    }
    tAddress = tAddress.join("");
    secret = secret.join("");
    tAddress = tAddress.replace(secret, "...");
    //teleLabel.html(teleText);
    //accountLabel.html(tmcount+" FIT");
    return tAddress;
}