/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    versionKey:"f9b65de0aba3423d67c23d2431dda3dce424bf36",//App版本秘钥
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        if(!init){
            init= true;
            OnAppInit();
        }
    }
};

var OnAppInit = function () {;
    console.log("On App Init")
    var successHandler = function (pedometerData) {
        DigObject.StepMine(pedometerData.numberOfSteps);
    };
    var onError = function () {
        
    };
    pedometer.startPedometerUpdates(successHandler, onError);
    tUUID = device.uuid;
    tSystem = device.platform;

    if (navigator.connection.type == Connection.UNKNOWN ||  navigator.connection.type == Connection.NONE){
        MsgBox_OK("警告", "网络连接异常", "<strong style='color:#aaa'>确定</strong>", function (e) {
            window.location.href = "index.html";
        });
    }else {

        var strUrl = window.location.href;
        var arrUrl = strUrl.split("/");
        var strPage = arrUrl[arrUrl.length - 1];
        if (strPage == "index.html") {
            InitKeySystem(function () {

                //检查应用版本更新请求
                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    //获取当前app的版本号；
                    tVersion = version;
                    var downUrl = (tSystem == "iOS") ? "url_ios" : ((tSystem == "Android" ? "url_android" : "http://fitchain.pro"));
                    CheckUpdate(tVersion, app.versionKey, function (result, vData) {
                        if (result) {
                            if (vData != null) {
                                MsgBox_YESNO("提示", "软件有新版本:v" + vData["version"], "<strong style='color:#aaa'>更新</strong>", "<strong style='color:#aaa'>跳过</strong>", function (e) {
                                    if (e.target.innerText == "更新") {
                                        window.location.href = vData[downUrl];
                                        navigator.app.exitApp();
                                    } else {
                                        PassVersionCheck();
                                    }
                                }, function (e) {
                                    PassVersionCheck();
                                });
                            } else {
                                PassVersionCheck();
                            }
                        } else {
                            MsgBox_YESNO("通知", "软件需要更新至v" + vData["version"] + "版本才可继续使用", "<strong style='color:#aaa'>更新</strong>", "<strong style='color:#aaa'>退出</strong>", function (e) {
                                if (e.target.innerText == "更新") {
                                    if (vData != null) {
                                        window.location.href = vData[downUrl];
                                        navigator.app.exitApp();
                                    } else {

                                        navigator.app.exitApp();
                                    }
                                } else {

                                    navigator.app.exitApp();
                                }
                            }, function (e) {
                                navigator.app.exitApp();
                                //退出App
                            });
                        }
                    });
                    //alert(tVersion);
                });
            });
        } else {
            cordova.getAppVersion.getVersionNumber().then(function (version) {
                //获取当前app的版本号；
                tVersion = version;
                if (document.OnVersionGetted) {
                    document.OnVersionGetted(tVersion);
                }
            });
        }
    }
}


var PassVersionCheck = function () {
    if(window.localStorage.getItem("Tele")!= null && window.localStorage.getItem("SecretKey")!= null) {
        //Loading();
        //alert(window.localStorage.getItem("Tele")+","+window.localStorage.getItem("SecretKey"));
        var LoginInterval = setInterval(function () {
            if (CheckLoginState) {
                //alert("CheckLoginState");
                CheckLoginState();
                window.clearInterval(LoginInterval);
                //FinishLoading();
            }
        }, 1000);
    }
}

app.initialize();



var init = false;


var SaveAllKey = function (OnFinished) {
    //alert("test01:"+storage);
    var storage = window.localStorage;
    var content = {};
    for (var i=0,len=storage.length;i<len;i++){
        var key = storage.key(i);
        var value = storage.getItem(key);
        if(key == "PageDay" || key == "PageTime" || key == "keysystem" || key=="AutoLogin" || key == "StepInfo"){
            continue;
        }
        content[key] = value;
    }

   // alert(JSON.stringify(content));
    writeFile(JSON.stringify(content),function (result) {
        //alert("test02:"+result);
        OnFinished();
    });
}



var InitKeySystem = function (isFinished) {
    //console.log("InitKeySystem");
    var keys = {};
    var content = JSON.stringify(keys);

    InitDocuments(content,function (result) {
        if(result) {
            //alert("写入,使文件可读");
        }else {
            //alert("写入失败");
        }
        //console.log("InitKeys");
        InitKeys(isFinished);
    });
}



var InitKeys = function (isFinished) {
    //alert("Init Keys");
    readFile("key.txt",function (result, content) {
        if(!result){
            //lert("读取失败");
            isFinished();
            return;
        }

        //alert("Init Keys Result:"+content);
        var storage = JSON.parse(content);
        for(var key in storage){
            window.localStorage.setItem(key,storage[key]);
        }
        isFinished();
    });
}

//var storage;




function createFile(createResult) {
    console.log("创建");
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)

    function successCallback(fs) {
        fs.root.getFile('key.txt', {create: true, exclusive: true}, function(fileEntry) {
            //alert('File creation successfull!');
            createResult(false);
        }, errorCallback);
    }

    function errorCallback(error) {
        alert("ERROR: " + error.code)
        createResult(true);
    }

}

function InitDocuments(text,writeResult) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    //var errorTime = 0;
    var exist = false;

    window.requestFileSystem(type, size, successCallback, errorCallback);

    //alert("Call write file");
   /* if(!exist){
        writeResult(false);
    }*/
    function successCallback(fs) {
        //alert("write file success Callback");

        fs.root.getFile('key.txt', {create: true, exclusive: true}, function(fileEntry) {
            exist = true;
            //alert("fs.root.getFile");
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    //alert('Write completed.');
                    writeResult(true);
                };

                fileWriter.onerror = function(e) {
                    //alert('Write failed: ' + e.toString());
                    writeResult(false);
                };

                //alert("new Blob([text], {type: 'text/plain'})");
                var blob = new Blob([text], {type: 'text/plain'});
                //alert("fileWriter.write(blob)");
                fileWriter.write(blob);
            }, errorCallback);

        }, errorCallback01);

    }

    function errorCallback(error) {
        //alert("ERROR: " + error.code);
    //   writeResult(false);
    }


    function errorCallback01(error) {

       // if((++errorTime) >=2 ){
           // alert("ERROR01: " + error.code);
            if(error.code == 12){
                writeResult(false);
            }
           // writeResult(false);
       // }
    }

}






function writeFile(text,writeResult) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    var errorTime = 0;
    var exist = false;

    window.requestFileSystem(type, size, successCallback, errorCallback);

    //alert("Call write file");
   /* if(!exist){
        writeResult(false);
    }*/
    function successCallback(fs) {
        //alert("write file success Callback");

        fs.root.getFile('key.txt', {create: false, exclusive: false}, function(fileEntry) {
            exist = true;
            //alert("fs.root.getFile");
            //alert(JSON.stringify(fileEntry));
            fileEntry.createWriter(
                function(fileWriter) {

                fileWriter.onwriteend = function(e) {
                    //alert('Write completed.');
                    writeResult(true);
                };

                fileWriter.onerror = function(e) {
                    //alert('Write failed: ' + e.toString());
                    writeResult(false);
                };

                //alert("new Blob([text], {type: 'text/plain'})");
                var blob = new Blob([text], {type: 'text/plain'});
                //alert("fileWriter.write(blob)");
                fileWriter.write(blob);
            }, errorCallback);

        }, errorCallback01);

    }

    function errorCallback(error) {
        alert("ERROR: " + error.code);
        writeResult(false);
    }


    function errorCallback01(error) {

       // if((++errorTime) >=2 ){
            alert("ERROR01: " + error.code);
            writeResult(false);
      //  }
    }

}




function readFile(path,readResult) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;

    window.requestFileSystem(type, size, successCallback, errorCallback)

    function successCallback(fs) {

        fs.root.getFile(path, {}, function(fileEntry) {

            fileEntry.file(function(file) {
                var reader = new FileReader();

                reader.onloadend = function(e) {
                   // var txtArea = document.getElementById('textarea');
                    //txtArea.value = this.result;
                    readResult(true,this.result);
                };

                reader.readAsText(file);

            }, errorCallback);

        }, errorCallback);
    }

    function errorCallback(error) {
        alert("ERROR: " + error.code)
        readResult(false,null);
    }

}

function removeFile(removeResult) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;

    window.requestFileSystem(type, size, successCallback, errorCallback)

    function successCallback(fs) {
        fs.root.getFile('key.txt', {create: false}, function(fileEntry) {

            fileEntry.remove(function() {
               // alert('File removed.');
                removeResult(true);
            }, errorCallback);

        }, errorCallback);
    }

    function errorCallback(error) {
        alert("ERROR: " + error.code)
        removeResult(true);
    }

}
