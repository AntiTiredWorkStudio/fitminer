




	 function onLoad() {
                document.addEventListener("deviceready", onDeviceReady, false);
                document.addEventListener("resume", onResume, false);
                document.addEventListener("pause", onPause, false);

            }
		 document.addEventListener("volumeupbutton", onVolumeUpKeyDown, false);
		 document.addEventListener("backbutton", onBackKeyDown, false);
            //Cordova加载完毕
            function onDeviceReady() {
                alert("Cordova加载完毕！");
            }

            //进入后台
            function onPause() {
              alert("应用进入到后台！");
            }

            //恢复到前台
            function onResume() {
                alert("应用回到前台运行！");
            }// JavaScript Document



function onVolumeUpKeyDown() {
    // 增加声音按钮事件的事件处理函数
	//alert("增加声音按钮事件的事件处理函数");
	
}



