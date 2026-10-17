/* Recovered original module 45: settings. Bindings renamed by scope, not rewritten. */
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
        var value4 = argument4[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument3, value4.key, value4);
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
  var utilsModule = requireModule(0);
  var value2 = function (argument8) {
    if (argument8 && argument8.__esModule) {
      return argument8;
    } else {
      return {
        default: argument8
      };
    }
  }(utilsModule);
  var SettingsExport = function () {
    function Settings(player) {
      var self = this;
      helper(this, Settings);
      this.player = player;
      this.player.template.mask.addEventListener("click", function () {
        self.hide();
      });
      this.player.template.settingButton.addEventListener("click", function () {
        self.show();
      });
      this.loop = this.player.options.loop;
      this.player.template.loopToggle.checked = this.loop;
      this.player.template.loop.addEventListener("click", function () {
        self.player.template.loopToggle.checked = !self.player.template.loopToggle.checked;
        if (self.player.template.loopToggle.checked) {
          self.loop = true;
        } else {
          self.loop = false;
        }
        self.hide();
      });
      this.showDanmaku = this.player.user.get("danmaku");
      if (!this.showDanmaku) {
        if (this.player.danmaku) {
          this.player.danmaku.hide();
        }
      }
      this.player.template.showDanmakuToggle.checked = this.showDanmaku;
      this.player.template.showDanmaku.addEventListener("click", function () {
        self.player.template.showDanmakuToggle.checked = !self.player.template.showDanmakuToggle.checked;
        if (self.player.template.showDanmakuToggle.checked) {
          self.showDanmaku = true;
          self.player.danmaku.show();
        } else {
          self.showDanmaku = false;
          self.player.danmaku.hide();
        }
        self.player.user.set("danmaku", self.showDanmaku ? 1 : 0);
        self.hide();
      });
      this.unlimitDanmaku = this.player.user.get("unlimited");
      this.player.template.unlimitDanmakuToggle.checked = this.unlimitDanmaku;
      this.player.template.unlimitDanmaku.addEventListener("click", function () {
        self.player.template.unlimitDanmakuToggle.checked = !self.player.template.unlimitDanmakuToggle.checked;
        if (self.player.template.unlimitDanmakuToggle.checked) {
          self.unlimitDanmaku = true;
          self.player.danmaku.unlimit(true);
        } else {
          self.unlimitDanmaku = false;
          self.player.danmaku.unlimit(false);
        }
        self.player.user.set("unlimited", self.unlimitDanmaku ? 1 : 0);
        self.hide();
      });
      this.player.template.speed.addEventListener("click", function () {
        self.player.template.settingBox.classList.add("xplayer-setting-box-narrow");
        self.player.template.settingBox.classList.add("xplayer-setting-box-speed");
      });
      for (var index2 = 0; index2 < this.player.template.speedItem.length; index2++) {
        (function (argument9) {
          self.player.template.speedItem[argument9].addEventListener("click", function () {
            self.player.speed(self.player.template.speedItem[argument9].dataset.speed);
            self.hide();
          });
        })(index2);
      }
      if (this.player.danmaku) {
        this.player.on("danmaku_opacity", function (argument0) {
          self.player.bar.set("danmaku", argument0, "width");
          self.player.user.set("opacity", argument0);
        });
        this.player.danmaku.opacity(this.player.user.get("opacity"));
        function helper5(argument1) {
          var value5 = argument1 || window.event;
          var value6 = ((value5.clientX || value5.changedTouches[0].clientX) - value2.default.getElementViewLeft(self.player.template.danmakuOpacityBarWrap)) / 130;
          value6 = Math.max(value6, 0);
          value6 = Math.min(value6, 1);
          self.player.danmaku.opacity(value6);
        }
        var helper4 = function value7() {
          document.removeEventListener(value2.default.nameMap.dragEnd, value7);
          document.removeEventListener(value2.default.nameMap.dragMove, helper5);
          self.player.template.danmakuOpacityBox.classList.remove("xplayer-setting-danmaku-active");
        };
        this.player.template.danmakuOpacityBarWrapWrap.addEventListener("click", function (argument10) {
          var value8 = argument10 || window.event;
          var value9 = ((value8.clientX || value8.changedTouches[0].clientX) - value2.default.getElementViewLeft(self.player.template.danmakuOpacityBarWrap)) / 130;
          value9 = Math.max(value9, 0);
          value9 = Math.min(value9, 1);
          self.player.danmaku.opacity(value9);
        });
        this.player.template.danmakuOpacityBarWrapWrap.addEventListener(value2.default.nameMap.dragStart, function () {
          document.addEventListener(value2.default.nameMap.dragMove, helper5);
          document.addEventListener(value2.default.nameMap.dragEnd, helper4);
          self.player.template.danmakuOpacityBox.classList.add("xplayer-setting-danmaku-active");
        });
      }
    }
    value(Settings, [{
      key: "hide",
      value: function () {
        var self2 = this;
        this.player.template.settingBox.classList.remove("xplayer-setting-box-open");
        this.player.template.mask.classList.remove("xplayer-mask-show");
        setTimeout(function () {
          self2.player.template.settingBox.classList.remove("xplayer-setting-box-narrow");
          self2.player.template.settingBox.classList.remove("xplayer-setting-box-speed");
        }, 300);
        this.player.controller.disableAutoHide = false;
      }
    }, {
      key: "show",
      value: function () {
        this.player.template.settingBox.classList.add("xplayer-setting-box-open");
        this.player.template.mask.classList.add("xplayer-mask-show");
        this.player.controller.disableAutoHide = true;
      }
    }]);
    return Settings;
  }();
  exports.default = SettingsExport;
};
