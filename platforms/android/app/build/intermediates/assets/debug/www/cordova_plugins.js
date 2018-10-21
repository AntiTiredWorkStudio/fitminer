cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-pedometer.Pedometer",
    "file": "plugins/cordova-pedometer/www/pedometer.js",
    "pluginId": "cordova-pedometer",
    "clobbers": [
      "pedometer"
    ]
  },
  {
    "id": "cordova-plugin-wechatv2.Wechat",
    "file": "plugins/cordova-plugin-wechatv2/www/wechat.js",
    "pluginId": "cordova-plugin-wechatv2",
    "clobbers": [
      "Wechat"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-pedometer": "0.2.0",
  "cordova-plugin-wechatv2": "2.1.3"
};
// BOTTOM OF METADATA
});