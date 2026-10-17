/* Recovered original module 15: template. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index = 0; index < argument5.length; index++) {
        var value5 = argument5[index];
        value5.enumerable = value5.enumerable || false;
        value5.configurable = true;
        if ("value" in value5) {
          value5.writable = true;
        }
        Object.defineProperty(argument4, value5.key, value5);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var iconsModule = requireModule(2);
  var value2 = helper(iconsModule);
  var playerTemplateModule = requireModule(32);
  var value3 = helper(playerTemplateModule);
  var TemplateExport = function () {
    function Template(argument9) {
      helper2(this, Template);
      this.container = argument9.container;
      this.options = argument9.options;
      this.index = argument9.index;
      this.tran = argument9.tran;
      this.init();
    }
    value(Template, [{
      key: "init",
      value: function () {
        this.container.innerHTML = (0, value3.default)({
          options: this.options,
          index: this.index,
          tran: this.tran,
          icons: value2.default,
          video: {
            current: true,
            pic: this.options.video.pic,
            screenshot: this.options.screenshot,
            preload: this.options.preload,
            url: this.options.video.url,
            subtitle: this.options.subtitle
          }
        });
        this.volumeBar = this.container.querySelector(".xplayer-volume-bar-inner");
        this.volumeBarWrap = this.container.querySelector(".xplayer-volume-bar");
        this.volumeBarWrapWrap = this.container.querySelector(".xplayer-volume-bar-wrap");
        this.volumeButton = this.container.querySelector(".xplayer-volume");
        this.volumeIcon = this.container.querySelector(".xplayer-volume-icon .xplayer-icon-content");
        this.playedBar = this.container.querySelector(".xplayer-played");
        this.loadedBar = this.container.querySelector(".xplayer-loaded");
        this.playedBarWrap = this.container.querySelector(".xplayer-bar-wrap");
        this.playedBarTime = this.container.querySelector(".xplayer-bar-time");
        this.danmaku = this.container.querySelector(".xplayer-danmaku");
        this.danmakuLoading = this.container.querySelector(".xplayer-danloading");
        this.video = this.container.querySelector(".xplayer-video-current");
        this.bezel = this.container.querySelector(".xplayer-bezel-icon");
        this.playButton = this.container.querySelector(".xplayer-play-icon");
        this.videoWrap = this.container.querySelector(".xplayer-video-wrap");
        this.controllerMask = this.container.querySelector(".xplayer-controller-mask");
        this.ptime = this.container.querySelector(".xplayer-ptime");
        this.settingButton = this.container.querySelector(".xplayer-setting-icon");
        this.settingBox = this.container.querySelector(".xplayer-setting-box");
        this.mask = this.container.querySelector(".xplayer-mask");
        this.loop = this.container.querySelector(".xplayer-setting-loop");
        this.loopToggle = this.container.querySelector(".xplayer-setting-loop .xplayer-toggle-setting-input");
        this.showDanmaku = this.container.querySelector(".xplayer-setting-showdan");
        this.showDanmakuToggle = this.container.querySelector(".xplayer-showdan-setting-input");
        this.unlimitDanmaku = this.container.querySelector(".xplayer-setting-danunlimit");
        this.unlimitDanmakuToggle = this.container.querySelector(".xplayer-danunlimit-setting-input");
        this.speed = this.container.querySelector(".xplayer-setting-speed");
        this.speedItem = this.container.querySelectorAll(".xplayer-setting-speed-item");
        this.danmakuOpacityBar = this.container.querySelector(".xplayer-danmaku-bar-inner");
        this.danmakuOpacityBarWrap = this.container.querySelector(".xplayer-danmaku-bar");
        this.danmakuOpacityBarWrapWrap = this.container.querySelector(".xplayer-danmaku-bar-wrap");
        this.danmakuOpacityBox = this.container.querySelector(".xplayer-setting-danmaku");
        this.dtime = this.container.querySelector(".xplayer-dtime");
        this.controller = this.container.querySelector(".xplayer-controller");
        this.commentInput = this.container.querySelector(".xplayer-comment-input");
        this.commentButton = this.container.querySelector(".xplayer-comment-icon");
        this.yzmcomment = this.container.querySelector(".yzm-xplayer-comment-input");
        this.commentSettingBox = this.container.querySelector(".xplayer-comment-setting-box");
        this.commentSettingButton = this.container.querySelector(".xplayer-comment-setting-icon");
        this.commentSettingFill = this.container.querySelector(".xplayer-comment-setting-icon path");
        this.commentSendButton = this.container.querySelector(".xplayer-send-icon");
        this.commentSendFill = this.container.querySelector(".xplayer-send-icon path");
        this.commentColorSettingBox = this.container.querySelector(".xplayer-comment-setting-color");
        this.browserFullButton = this.container.querySelector(".xplayer-full-icon");
        this.webFullButton = this.container.querySelector(".xplayer-full-in-icon");
        this.menu = this.container.querySelector(".xplayer-menu");
        this.menuItem = this.container.querySelectorAll(".xplayer-menu-item");
        this.qualityList = this.container.querySelector(".xplayer-quality-list");
        this.camareButton = this.container.querySelector(".xplayer-camera-icon");
        this.subtitleButton = this.container.querySelector(".xplayer-subtitle-icon");
        this.subtitleButtonInner = this.container.querySelector(".xplayer-subtitle-icon .xplayer-icon-content");
        this.subtitle = this.container.querySelector(".xplayer-subtitle");
        this.qualityButton = this.container.querySelector(".xplayer-quality-icon");
        this.barPreview = this.container.querySelector(".xplayer-bar-preview");
        this.barWrap = this.container.querySelector(".xplayer-bar-wrap");
        this.notice = this.container.querySelector(".xplayer-notice");
        this.infoPanel = this.container.querySelector(".xplayer-info-panel");
        this.infoPanelClose = this.container.querySelector(".xplayer-info-panel-close");
        this.infoVersion = this.container.querySelector(".xplayer-info-panel-item-version .xplayer-info-panel-item-data");
        this.infoFPS = this.container.querySelector(".xplayer-info-panel-item-fps .xplayer-info-panel-item-data");
        this.infoSpeed = this.container.querySelector(".xplayer-info-panel-item-speed .xplayer-info-panel-item-data");
        this.infoType = this.container.querySelector(".xplayer-info-panel-item-type .xplayer-info-panel-item-data");
        this.infoUrl = this.container.querySelector(".xplayer-info-panel-item-url .xplayer-info-panel-item-data");
        this.infoResolution = this.container.querySelector(".xplayer-info-panel-item-resolution .xplayer-info-panel-item-data");
        this.infoDuration = this.container.querySelector(".xplayer-info-panel-item-duration .xplayer-info-panel-item-data");
        this.infoDanmakuId = this.container.querySelector(".xplayer-info-panel-item-danmaku-id .xplayer-info-panel-item-data");
        this.infoDanmakuApi = this.container.querySelector(".xplayer-info-panel-item-danmaku-api .xplayer-info-panel-item-data");
        this.infoDanmakuAmount = this.container.querySelector(".xplayer-info-panel-item-danmaku-amount .xplayer-info-panel-item-data");
      }
    }]);
    return Template;
  }();
  exports.default = TemplateExport;
};
