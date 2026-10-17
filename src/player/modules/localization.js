/* Recovered original module 14: localization. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(lang) {
    var self = this;
    this.lang = lang;
    this.tran = function (argument) {
      if (options[self.lang] && options[self.lang][argument]) {
        return options[self.lang][argument];
      } else {
        return argument;
      }
    };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var options = {
    "zh-cn": {
      "Danmaku is loading": " ",
      Top: "顶部",
      Bottom: "底部",
      Rolling: "滚动",
      "Input danmaku, hit Enter": "发个弹幕见证当下",
      "About author": "关于作者",
      "xplayer feedback": "播放器意见反馈",
      "About xplayer": "关于 xplayer 播放器",
      Loop: "洗脑循环",
      Speed: "速度",
      "Opacity for danmaku": "弹幕透明度",
      Normal: "正常",
      "Please input danmaku content!": "要输入弹幕内容啊喂！",
      "Set danmaku color": "弹幕颜色",
      "Set danmaku type": "弹幕模式",
      "Show danmaku": "显示弹幕",
      "This video fails to load": "视频加载失败",
      "Switching to": "正在切换至",
      "Switched to": "已经切换至",
      quality: "画质",
      FF: "快进",
      REW: "快退",
      "Unlimited danmaku": "海量弹幕",
      "Send danmaku": "发送弹幕",
      Setting: "设置",
      "Full screen": "全屏",
      "Web full screen": "页面全屏",
      Send: "发送",
      Screenshot: "截图",
      s: "秒",
      "Show subtitle": "显示字幕",
      "Hide subtitle": "隐藏字幕",
      Volume: "音量",
      Live: "直播",
      "Video info": "视频统计信息"
    },
    "zh-tw": {
      "Danmaku is loading": " ",
      Top: "頂部",
      Bottom: "底部",
      Rolling: "滾動",
      "Input danmaku, hit Enter": "輸入彈幕，Enter 發送",
      "About author": "關於作者",
      "xplayer feedback": "播放器意見反饋",
      "About xplayer": "關於 xplayer 播放器",
      Loop: "循環播放",
      Speed: "速度",
      "Opacity for danmaku": "彈幕透明度",
      Normal: "正常",
      "Please input danmaku content!": "請輸入彈幕内容啊！",
      "Set danmaku color": "設置彈幕顏色",
      "Set danmaku type": "設置彈幕類型",
      "Show danmaku": "顯示彈幕",
      "This video fails to load": "視頻加載失敗",
      "Switching to": "正在切換至",
      "Switched to": "已經切換至",
      quality: "畫質",
      FF: "快進",
      REW: "快退",
      "Unlimited danmaku": "海量彈幕",
      "Send danmaku": "發送彈幕",
      Setting: "設置",
      "Full screen": "全屏",
      "Web full screen": "頁面全屏",
      Send: "發送",
      Screenshot: "截圖",
      s: "秒",
      "Show subtitle": "顯示字幕",
      "Hide subtitle": "隱藏字幕",
      Volume: "音量",
      Live: "直播",
      "Video info": "視頻統計信息"
    }
  };
  exports.default = helper;
};
