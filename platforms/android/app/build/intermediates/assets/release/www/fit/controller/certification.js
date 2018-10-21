//唤醒控制器
var Awake = function () {
    AddLib("fit/lib/qiniu.min.js");
}

//初始化控制器 pars 为传入的参数
var SelectorInit = function (pars) {
    infoContainer = $(pars[0]);
    nameField = $(pars[1]);
    idTField = $(pars[2]);
    imageFieldID = pars[3];
    imageField = $(pars[3])[0];
    addressField = $(pars[4]);
    fieldContainer = $(pars[5]);
    submitBtn = $(pars[6]);
    nopack = $(pars[7]);

    InitIdentification();

    nopack.click(
        function () {
            MsgBox_YESNO("提示","如果您还没有数字钱包地址，可直接下载注册FIT钱包，创建您专属钱包地址。","<div style='color:#aaa'>我有钱包</div>","<div>立即前往</div>",function (e) {
                if(e.target.innerText=="立即前往"){
                    window.location.href="http://www.fitchain.pro";
                }
            },function (e) {
            });
        }
    );
    submitBtn.click(OnSubmit);
    imageField.onchange = onImageFieldChange;
    //fieldContainer.html(GetIdentificationImage("https://www.baidu.com/img/dong_30688b45cdf667c7634a2a5ca98c3862.gif"));
}

var infoContainer;
var nameField;
var idTField;
var imageFieldID;
var imageField;
var imageObject;
var addressField;
var fieldContainer;
var submitBtn;
var nopack;

var onImageFieldChange = function () {
    console.log("onImageFieldChange");
    var windowURL = window.URL || window.webkitURL;
    imageObject = imageField.files[0];
    var dataURL = windowURL.createObjectURL(imageObject);
    //console.log(dataURL);
    fieldContainer.html(GetIdentificationImage(dataURL));
    $("#delete").click(
        OnDelete
    );
};

var OnDelete = function () {
    fieldContainer.html(GetIdentificationUploader());
    imageField = $(imageFieldID)[0];
    imageObject = null;
    imageField.onchange = onImageFieldChange;
}

//挖矿状态
document.MinerState = function (code, data) {

}

var InitIdentification = function () {
    Request("id","get",{"tele":TELE(),"key":AUTHKEY()},IdentificationSuccess,       function (code, data) {
        console.log(data);
        switch (data['state']){
            case "VERIFY":
                IdentificationVerify();
                break;
            case "FAILED":
                IdentificationFailed();
                break;
            default:
                break;
        }
    });
}
var IdentificationFailed = function (code,data) {
    MsgBox_OK("信息","<div style='color:#ff0000'>未通过实名认证!</div>","<strong style='color:#e6b000'>知道了</strong>",function () {
       // window.location.href = "personal.html";
    });
}
var IdentificationVerify = function (code,data) {
    infoContainer.html("");
    MsgBox_OK("信息","实名认证正在审核中!","<strong style='color:#e6b000'>知道了</strong>",function () {
        window.location.href = "personal.html";
    });
}

var IdentificationSuccess = function (code,data) {
    infoContainer.html(GetIdentificationSuccess());
   /* MsgBox_OK("信息","恭喜！实名认证已通过!","<strong style='color:#e6b000'>知道了</strong>",function () {
        //window.location.href = "personal.html";
    });*/
    $('#back').click(function () {
        window.location.href = "personal.html";
    });
}

var GetIdentificationImage = function (imgUrl) {
    return '<center><img style="width:80%;height:auto;" src="'
     + imgUrl+'"></center>'+
    '<div class="container form-inline  tw">' +
    '<button id="delete" class="btn btn-danger btn-block margint" type="button center">删除</button></div>';
}


var GetIdentificationUploader = function () {
    return '<div class="col-xs-4"></div>'+
        '<div class="col-xs-4">'+
        '<div class="weui-uploader__input-box nomargin" style="width:100%">'+
        '<center>'+
        '<input id="uploaderImg" class="weui-uploader__input" accept="image/*" multiple="" type="file">'+
        '</center>'+
        '</div>'+
        '</div>'+
        '<div class="col-xs-4"></div>';
}


var GetIdentificationSuccess = function () {
    return '<center>\n' +
    '\t<div class="icon-box">\n' +
    '            <i class="weui-icon-success weui-icon_msg"></i>\n' +
    '\t\t<div id="box01"></div>\n' +
    '            <div class="icon-box__ctn tw">\n' +
    '                <h3 class="icon-box__title">成功</h3>\n' +
    '                <p class="icon-box__desc">身份验证已经通过</p>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '\t\t<div class="page__bd">\n' +
    '\t\t <button id="back" type="button center" class="weui-btn weui-btn_primary ">确定</button>\n' +
    '\t\t\t</div>\n' +
    ' </center>';
}

var OnSubmit = function () {

    if(! /^[\u4E00-\u9FA5A-Za-z]+$/.test(nameField.val())){
        MsgBox_OK("警告","姓名中含有非法字符","确定",function () {
            nameField.val("");
        });
        return;
    }
    if(!/(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/.test(idTField.val())){
        MsgBox_OK("警告","身份证号不符合规范","确定",function () {
            idTField.val("");
        });
        return;
    }


    if(! /^(0x)[a-fA-F\d]{40}$/.test(addressField.val())){
        MsgBox_OK("警告","数字钱包地址格式有误","确定",function () {
            addressField.val("");
        });
        return;
    }

    Loading();

    Request("id","gen",{"tele":TELE(),"key":AUTHKEY()},function (code, data) {
        //console.log(data);
        var res = data;
        var token = res.uptoken;
        var domain = res.domain;
        window.localStorage.setItem("qiniu_domain",domain);
        var filename = res.fileName;
        console.log(token,domain);
        var config = {
            useCdnDomain: true,
            disableStatisticsReport: false,
            retryCount: 6,
            region: qiniu.region.z0
        };
        var putExtra = {
            fname: "",
            params: {},
            mimeType: null
        };

        uploadWithSDK(token, putExtra, config, domain,imageObject,filename);

    },function (code, data) {
        console.log(data);
    });
}


//上传至七牛云
var uploadWithSDK =  function (token, putExtra, config, domain,tfile,filename) {
    // $("#select2").unbind("change").bind("change",function(){
    var file = tfile;
    console.log(tfile);
    var suffix = tfile.name.split(".")[1];
    var finishedAttr = [];
    var compareChunks = [];
    var observable;
    if (file) {
        var key = filename;
        putExtra.fname = key+"."+suffix;
        console.log(putExtra["fname"] );
        putExtra.mimeType = ["image/png", "image/jpeg", "image/gif"];

        // 设置next,error,complete对应的操作，分别处理相应的进度信息，错误信息，以及完成后的操作
        var error = function(err) {
            console.log(err);
            //alert("上传出错");
        };

        var next = function(response) {
            var chunks = response.chunks||[];
            var total = response.total;
            // 这里对每个chunk更新进度，并记录已经更新好的避免重复更新，同时对未开始更新的跳过
            for (var i = 0; i < chunks.length; i++) {
                if (chunks[i].percent === 0 || finishedAttr[i]){
                    continue;
                }
                if (compareChunks[i].percent === chunks[i].percent){
                    continue;
                }
                if (chunks[i].percent === 100){
                    finishedAttr[i] = true;
                }
            }
            compareChunks = chunks;
        };

        var subObject = {
            next: next,
            error: error,
            complete: OnQiniuComplete
        };
        var subscription;
        observable = qiniu.upload(file, key, token, putExtra, config);

        subscription = observable.subscribe(subObject);
    }
}

var OnQiniuComplete = function (res) {
    console.log(res);
    if(res.hasOwnProperty("hash") && res.hasOwnProperty("key")){
        Request("id","res",
            {"tele":TELE(),"key":AUTHKEY(),"rname":nameField.val(),
            "iurl":(window.localStorage.getItem("qiniu_domain")+"/"+res.key),"postfix":"*","cadress":
                addressField.val()},
            function (code, data) {
                FinishLoading();
                window.localStorage.removeItem("qiniu_domain");
                infoContainer.html("");
                MsgBox_OK("提示","实名认证信息提交成功","确定",function () {
                    window.location.href = "personal.html";
                });
            },
            function (code, data) {
                FinishLoading();
                window.localStorage.removeItem("qiniu_domain");
                MsgBox_OK("提示","实名认证信息提交失败","确定",function () {

                });
            }
                );
    }else{
        window.location.href = "certification.html";
    }
}