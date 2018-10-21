//唤醒控制器
var Awake = function () {
}
//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    MinerContainer = $(pars[0]);
    Request("mi","gdig",{"tele":TELE(),"key":AUTHKEY()},
        function (code,data){
            //console.log(data);
            CurrentMiners = data['mtype'];
            if(data['ordered']!=null) {
                CurrentOrderedMiners = data['ordered']['mtype'];
            }else{
                CurrentOrderedMiners ="";
            }
            InitSellTable();
        },
        function (code,data){
            CurrentMiners = "";
            InitSellTable();
        });

}

var CurrentMiners;
var CurrentOrderedMiners;
var OnSellMiners;
var MinerContainer;

var InitSellTable = function () {
    Request("md","gtd",{"tele":TELE(),"key":AUTHKEY()},
        function (code,data){
            //console.log(code);
            if(!data.hasOwnProperty("miners")){
                MinerContainer.html('<center>'+
                    "<h3>没有矿机正在售卖!</h3>"+
                    '</center>');
                return;
            }
            OnSellMiners = data['miners'];
            var levelRange = -1;
            if(CurrentOrderedMiners != "" && OnSellMiners.hasOwnProperty(CurrentOrderedMiners)){
                levelRange = OnSellMiners[CurrentOrderedMiners].level;
            }

            MinerContainer.html(GetSellMiners(levelRange));
            for(var key in OnSellMiners) {
               // console.log("#"+key);
                $("#"+key).click(function (e) {
                    console.log(e.currentTarget.id);
                    window.localStorage.setItem("MinerSelection",e.currentTarget.id);
                    window.location.href = "minerinfo.html";
                });
            }
        },
        function (code,data){
            console.log(code);
            alert(data['context']);
        }
    );
}


var GetSellMiners = function (lRange) {
    var result = "";
    if(OnSellMiners!=null){
        var minerList = {};
        for(var key in OnSellMiners){
            if(OnSellMiners[key].level <= lRange){
                continue;
            }
            minerList[key] = OnSellMiners[key];
            result = CreateSingleMinerSell(key,OnSellMiners[key]['mname'],OnSellMiners[key]['mprice'],OnSellMiners[key]['daylimt']) + result;
        }
        window.localStorage.setItem("minerList",JSON.stringify(minerList));
    }

    if(result == ""){
        MsgBox_OK("提示","已经拥有最高级别矿机，无需购买!","<strong style='color:#aaa'>知道了</strong>",function () {
            window.location.href="miner.html";
        });
        /*MsgBox_YESNO("最高级别","已经拥有最高级别矿机，无需购买!","<strong style='color:#aaa'>卸载</strong>","<strong style='color:#FFC600'>退出</strong>",
            function () {

            },function () {
                
            }
            );*/


        result =
        '<center>'+
        "<h3>已经拥有最高级别矿机，无需购买!</h3>"+
        '</center>';
    }

    return result;
}

var CreateSingleMinerSell = function (type,name,price,daylimt) {
    return '<a id="'+type+'" href="#" class="weui-media-box weui-media-box_appmsg" >'+
        '<div class="weui-media-box__hd">'+
        '<img class="weui-media-box__thumb" src="img/u103.png" alt="">'+
        '</div>'+
        '<div class="weui-media-box__bd">'+
        '<h4 class="weui-media-box__title tw text-center"><strong class="">'+name+' ￥'+price/100+'/台</strong></h4>'+
    '<p class="tw">1年内，每日运动达标（1万步），当日最多可挖'+daylimt+'枚FIT；连续100天达标，再奖1万枚FIT！</p>'+
    '</div>'+
    '</a>';
}



document.MinerState = function (code, data) {
    console.log(code,data);
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        _step = 0;
        console.log("init in Day Miner:",data['init']);
    }
}