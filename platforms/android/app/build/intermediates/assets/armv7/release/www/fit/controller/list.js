//唤醒控制器
var Awake = function () {

}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    OrderContainer = $(pars[0]);
    OrderContainer.html("");


    InitContainer();
}

var OrderContainer;

var ContainerPrefix = "<div class=\"box02\"></div>";
var GetItemContent = function (title, state, price, timeInfo,id) {
    return '<a id="'+id+'" class="weui-cell weui-cell_access">\n' +
        '\n' +
        '                <div class="weui-cell__bd">\n' +
        '                    <p class="no-margin">'+title+'</p>\n' +
        '\t\t\t\t\t<p  class="no-margin"><small style="color: #808080;">'+timeInfo+'</small></p>\n' +
        '\t\t\t\t\t\n' +
        '                </div>\n' +
        '                <strong><div class="weui-cell__ft no-margin" style="color: #fff";>'+price+'<p class="no-margin" style="color: '+StateColor(state)+'">'+StateText(state)+'</p></div></strong>\n' +
        '\t\n' +
        '            </a>';
}


var ListItems;
var OnSellMiners;
var InitContainer = function () {
    ListItems = {};
    Request("md","gtd",{"tele":TELE(),"key":AUTHKEY()},
        function (code,data){
            OnSellMiners = data['miners'];
            console.log(OnSellMiners);
            Request("or","get",{"tele":TELE(),"key":AUTHKEY()},Init_Order,Init_Failed);

        },
        function (code,data){
            console.log(code);
            alert(data['context']);
        }
    );
}

var Init_Order = function (code,data) {
    //console.log(data['orders']);
    for(var key in data['orders']){
        var target = data['orders'][key];
        console.log(data['orders'][key]);
        ListItems[target['ptime']] = {
            "type":"order",
            "id":target['id'],
            "title":"购买【"+OnSellMiners[target['mtype']].mname+"】",
            "state":target['state'],
            "price":"¥"+target['price']/100,
            "timeInfo":GetFormateTime(PhpTimeToJsTime(target['ptime']))
        }
    }
    Request("wi","gwi",{"tele":TELE(),"key":AUTHKEY()},Init_WithDraw,Init_Failed);
}

var Init_WithDraw = function(code,data){
    console.log(data['withdraw']);

    for(var key in data['withdraw']) {
        var target = data['withdraw'][key];
        ListItems[target['ctime']] = {
            "type":"withdraw",
            "id":key,
            "title":"提现",
            "state":target['state'],
            "price":target['fit'] + " FIT",
            "timeInfo":GetFormateTime(PhpTimeToJsTime(target['ctime']))
        }
    }
    console.log(ListItems);
    InitSortListView();
}


var InitSortListView = function () {
    var keys = [];

    for(var key in ListItems) {
        keys.push(key);
    }
    keys.sort(function (x,y) {
        if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        } else {
            return 0;
        }
    });
    var content = ContainerPrefix;
    //var NewListItem = {};
    var idList = {};
    for(var k in keys) {

        content+=GetItemContent(ListItems[keys[k]].title,ListItems[keys[k]].state,ListItems[keys[k]].price,ListItems[keys[k]].timeInfo,ListItems[keys[k]].id);
        idList[ListItems[keys[k]].id] = ListItems[keys[k]].type;
        //idList.push(ListItems[keys[k]].id);
    }
    if(keys.length > 0){
        OrderContainer.html(content);

        Init_ListEvent(idList);
    }else {
        OrderContainer.html("<center><h3>暂无账目记录</h3></center>");
    }
}


var Init_Failed = function (code, data) {

}

var Init_ListEvent = function (idList) {
    //console.log(idList);
    for(var id in idList){
        //console.log("id:"+idList[id]);
        $("#"+id).click(function (evt) {
            SetBillInfo(idList[evt.currentTarget.id],evt.currentTarget.id);
            window.location.href=  "bill.html";
        });
    }

}



//挖矿状态
document.MinerState = function (code, data) {
    if(data.hasOwnProperty('init')){//新的一天重置步数
        CollectLastDayData(data['init']);
        StepInit(0);
        console.log("init in Day Miner:",data['init']);
    }
}

