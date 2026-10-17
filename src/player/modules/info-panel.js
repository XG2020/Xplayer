/* Recovered original module 49: info-panel. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(argument, argument2) {
    if (!(argument instanceof argument2)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper2(argument3, argument4) {
      for (var index = 0; index < argument4.length; index++) {
        var value3 = argument4[index];
        value3.enumerable = value3.enumerable || false;
        value3.configurable = true;
        if ("value" in value3) {
          value3.writable = true;
        }
        Object.defineProperty(argument3, value3.key, value3);
      }
    }
    return function (argument5, argument6, argument7) {
      if (argument6) {
        helper2(argument5.prototype, argument6);
      }
      if (argument7) {
        helper2(argument5, argument7);
      }
      return argument5;
    };
  }();
  var InfoPanelExport = function () {
    function InfoPanel(player) {
      var self = this;
      helper(this, InfoPanel);
      this.container = player.template.infoPanel;
      this.template = player.template;
      this.video = player.video;
      this.player = player;
      this.template.infoPanelClose.addEventListener("click", function () {
        self.hide();
      });
    }
    value(InfoPanel, [{
      key: "show",
      value: function () {
        this.beginTime = Date.now();
        this.update();
        this.player.time.enable("info");
        this.player.time.enable("fps");
        this.container.classList.remove("xplayer-info-panel-hide");
      }
    }, {
      key: "hide",
      value: function () {
        this.player.time.disable("info");
        this.player.time.disable("fps");
        this.container.classList.add("xplayer-info-panel-hide");
      }
    }, {
      key: "triggle",
      value: function () {
        if (this.container.classList.contains("xplayer-info-panel-hide")) {
          this.show();
        } else {
          this.hide();
        }
      }
    }, {
      key: "update",
      value: function () {
        function helper4(argument8) {
          return [parseInt(argument8 / 60 / 60), parseInt(argument8 / 60 % 60), parseInt(argument8 % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
        }
        this.template.infoVersion.textContent = "Xplayer Pro";
        this.template.infoType.textContent = this.player.type;
        this.template.infoUrl.textContent = getRootUrl(this.player.options.video.url);
        this.template.infoResolution.textContent = this.player.video.videoWidth + " x " + this.player.video.videoHeight;
        this.template.infoDuration.textContent = helper4(this.player.video.duration);
        if (this.player.options.danmaku) {
          this.template.infoDanmakuId.textContent = this.player.options.danmaku.id;
          this.template.infoDanmakuApi.textContent = this.player.options.danmaku.api;
          this.template.infoDanmakuAmount.textContent = this.player.danmaku.dan.length - 2;
        }
      }
    }, {
      key: "fps",
      value: function (argument9) {
        this.template.infoFPS.textContent = "" + argument9.toFixed(1);
      }
    }]);
    return InfoPanel;
  }();
  exports.default = InfoPanelExport;
};
