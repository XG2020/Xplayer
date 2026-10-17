/* Recovered original module 41: timer. Bindings renamed by scope, not rewritten. */
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
  var TimerExport = function () {
    function Timer(player) {
      helper(this, Timer);
      this.player = player;
      window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (argument9) {
          window.setTimeout(argument9, 16.666666666666668);
        };
      }();
      this.types = ["loading", "progress", "info", "fps"];
      this.init();
    }
    value(Timer, [{
      key: "init",
      value: function () {
        for (var index2 = 0; index2 < this.types.length; index2++) {
          var value5 = this.types[index2];
          if ("fps" !== value5) {
            this["init" + value5 + "Checker"]();
          }
        }
      }
    }, {
      key: "initloadingChecker",
      value: function () {
        var self = this;
        var index3 = 0;
        var index4 = 0;
        var value6 = false;
        this.loadingChecker = setInterval(function () {
          if (self.enableloadingChecker) {
            index4 = self.player.video.currentTime;
            if (!value6 && !(index4 !== index3) && !self.player.video.paused) {
              self.player.container.classList.add("xplayer-loading");
              value6 = true;
            }
            if (value6 && index4 > index3 && !self.player.video.paused) {
              self.player.container.classList.remove("xplayer-loading");
              value6 = false;
            }
            index3 = index4;
          }
        }, 100);
      }
    }, {
      key: "initprogressChecker",
      value: function () {
        var self2 = this;
        this.progressChecker = setInterval(function () {
          if (self2.enableprogressChecker) {
            self2.player.bar.set("played", self2.player.video.currentTime / self2.player.video.duration, "width");
            var value7 = value2.default.secondToTime(self2.player.video.currentTime);
            if (self2.player.template.ptime.innerHTML !== value7) {
              self2.player.template.ptime.innerHTML = value2.default.secondToTime(self2.player.video.currentTime);
            }
          }
        }, 100);
      }
    }, {
      key: "initfpsChecker",
      value: function () {
        var self3 = this;
        window.requestAnimationFrame(function () {
          if (self3.enablefpsChecker) {
            self3.initfpsChecker();
            if (self3.fpsStart) {
              self3.fpsIndex++;
              var value8 = new Date();
              if (value8 - self3.fpsStart > 1000) {
                self3.player.infoPanel.fps(self3.fpsIndex / (value8 - self3.fpsStart) * 1000);
                self3.fpsStart = new Date();
                self3.fpsIndex = 0;
              }
            } else {
              self3.fpsStart = new Date();
              self3.fpsIndex = 0;
            }
          } else {
            self3.fpsStart = 0;
            self3.fpsIndex = 0;
          }
        });
      }
    }, {
      key: "initinfoChecker",
      value: function () {
        var self4 = this;
        this.infoChecker = setInterval(function () {
          if (self4.enableinfoChecker) {
            self4.player.infoPanel.update();
          }
        }, 1000);
      }
    }, {
      key: "enable",
      value: function (argument0) {
        this["enable" + argument0 + "Checker"] = true;
        if ("fps" === argument0) {
          this.initfpsChecker();
        }
      }
    }, {
      key: "disable",
      value: function (argument1) {
        this["enable" + argument1 + "Checker"] = false;
      }
    }, {
      key: "destroy",
      value: function (argument10) {
        if (this[argument10 + "Checker"]) {
          clearInterval(this[argument10 + "Checker"]);
        }
      }
    }]);
    return Timer;
  }();
  exports.default = TimerExport;
};
