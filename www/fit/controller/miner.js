//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    lastDayFit = $(pars[0]);
    totalFit = $(pars[1]);
    dayFit = $(pars[2]);
    dataUpdateTime = $(pars[3]);
    chart = $(pars[4]);
    cDayLabel = $(pars[6]);

    lastDayFit.html("");
    totalFit.html("");
    dayFit.html("");
    dataUpdateTime.html("");
    cDayLabel.html("");


    document.querySelector(pars[5]).addEventListener('click', function () {
            MsgBox_OK(minerTitle, minerInfo, "<strong style='color:#aaa'>关闭</strong>", MinerInfo);
    });
    chart.circleChart({
            size: 300,
            value: 0.1,
            text: 0,
            onDraw: DrawChart
    });
    InitMiner();
    UpdateCirCleChart();
}

var lastDayFit;
var dayFit;
var totalFit;
var dataUpdateTime;
var chart;
var minerTitle;
var minerInfo;
var cDayLabel;

var DrawChart = function (el, circle) {
    //circle.value =StepChartValue();
    //console.log('draw chart');
    circle.text(STEP() +"步");
}

var StepChartValue = function () {
    return Clamp(STEP(),0,10000)/10000;
}



var MinerInfo = function () {

}

/*var MinerContent = function () {
    return {
        title: minerTitle,
        content: minerInfo
    };
}*/

var InitMiner = function () {
    var tele = TELE();
    var auth = AUTHKEY();
    //Loading();
    Request('mi','ini',{"tele":tele,"key":auth},
        function (code,data){
            CollectLastDayData(data);
            console.log(data);
            if(data['new']=='true'){//新的一天的操作
                ClearCache();
                NewDayMiner();
            }else {//一天的正常操作
                DayMiner();
            }
            if(data['order']!=null) {//已有矿机
                //var order = data['order'];
                SetMinerInfoBox(data['mtype'],data['vday']);
            }else {//未购买矿机
                NoneMiner();
                SetMinerInfo("暂无矿机","当前账户暂未购买矿机");
            }
            //FinishLoading();
        },
        function (code,data){
            if(code == 32){
                NoneUsageMiner();
                SetMinerInfoBox(data['mtype'],data['vday']);
            }

            if(code == 29){
                NoneMiner();
                SetMinerInfo("暂无矿机","当前账户暂未购买矿机");
            }
            //FinishLoading();
        });
}

var SetMinerInfo = function (title,info) {
    minerTitle = title;
    minerInfo = info;
}

var NoneUsageMiner= function () {
    var tText = GetFormateTime();
    lastDayFit.html("昨日收益 0 FIT");
     dayFit.html("当前账户不包含已生效矿机");
     totalFit.html("0 FIT");
     dataUpdateTime.html("数据刷新于:"+tText);
    cDayLabel.html("");
}

var NoneMiner = function () {
    var tText = GetFormateTime();
    lastDayFit.html("昨日收益 0 FIT");
    dayFit.html("当前账户未购买矿机</br><a href='logo.html'>点此购买</a>");
    totalFit.html("0 FIT");
    dataUpdateTime.html("数据刷新于:"+tText);
    cDayLabel.html("");
}

var ClearCache = function () {
    
}

var NewDayMiner = function () {
    var tText = GetFormateTime();
    lastDayFit.html("昨日收益 0 FIT");
    dayFit.html("今日当前获得: 0 FIT");
    totalFit.html("0 FIT");
    dataUpdateTime.html("数据刷新于:"+tText);
    cDayLabel.html("");
}

var DayMiner = function () {
    Request('mi','gdig',{"tele":TELE(),"key":AUTHKEY()},function (code,data) {
        console.log(data);
        DeltaInfo(data['mcount'],data['tmcount'],data['cdays']);
    },function (code,data) {
        console.log(code,data);
        NewDayMiner();
    });
}

var DeltaInfo = function (mcount,tmcount,cdays) {
    var tText = GetFormateTime();
    var lastDay = LASTDAYDATA();
    lastDayFit.html("昨日收益 "+(lastDay==null?0:lastDay['mcount'])+" FIT");
    dayFit.html("今日当前获得: "+mcount+" FIT");
    totalFit.html(tmcount+" FIT");
    dataUpdateTime.html("数据刷新于:"+tText);
    if(cdays == 0){
        cDayLabel.html("");
    }else {
        cDayLabel.html("连续达标"+cdays+"天");
    }
}

var SetMinerInfoBox = function (mtype,vtime) {

    var UsageTimeStamp = PhpTimeToJsTime(parseInt(vtime));

    var CurrentTimeStamp = PRC_TIME();

    console.log(GetFormateTime(CurrentTimeStamp));

    console.log(GetFormateTime(UsageTimeStamp));

    var phpTimeStamp = CurrentTimeStamp/1000;

    var phpDay = (phpTimeStamp - phpTimeStamp%86400)/86400;

    Request("md","gsg",
        {"mtype":mtype,"tele":TELE(),"key":AUTHKEY()},
        function (code,data){
            console.log("矿机生效:"+CurrentTimeStamp +">="+ UsageTimeStamp);
            if(CurrentTimeStamp >= UsageTimeStamp) {
                SetMinerInfo(data['miners'][mtype]['mname']+"(正在使用)",
                    "生效时间:" + GetFormateTime(UsageTimeStamp));
            }else {
                SetMinerInfo(data['miners'][mtype]['mname']+"(暂未生效)",
                    "拥有矿机，但未生效</br>" + "生效时间:" + GetFormateTime(UsageTimeStamp));
            }
        },
        function (code,data){
            console.log(data);
            if(CurrentTimeStamp >= UsageTimeStamp) {

            }else {
                SetMinerInfo("获取矿机名称失败","拥有矿机，但未生效");
            }
        });
}



document.MinerState = function (code, data) {

    //console.log(code,data);
    UpdateCirCleChart();
    if(code == '0'){
        console.log(code,data);
        DeltaInfo(data['mcount'],data['tmcount'],data['cdays']);
    }
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}




var UpdateCirCleChart = function () {
    var tValue = StepChartValue()*100;
    tValue= tValue>=99?(99+Math.random()%1):tValue;
    chart.circleChart({
        value: tValue,
    });
}