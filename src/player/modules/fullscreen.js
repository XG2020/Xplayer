/* Recovered original module 37: fullscreen. Bindings renamed by scope, not rewritten. */
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
  var FullscreenExport = function () {
    function Fullscreen(player) {
      var self = this;
      helper(this, Fullscreen);
      this.player = player;
      this.container = player.container;
      this.video = player.video;
      this.destroyed = false;
      this.browserFullscreenActive = false;
      this.nativeVideoFullscreen = false;
      this.orientationFullscreenActive = false;
      this.orientationFullscreenMode = "";
      this.orientationSession = 0;
      this.orientationLockPending = false;
      this.orientationLockOwned = false;
      this.player.events.on("webfullscreen", function () {
        self.player.resize();
        self.syncOrientation();
      });
      this.player.events.on("webfullscreen_cancel", function () {
        self.player.resize();
        self.syncOrientation();
        if (self.lastScrollPosition) value2.default.setScrollPosition(self.lastScrollPosition);
      });
      this.onFullscreenChange = function () {
        if (self.destroyed) return;
        var active = self.isPlayerFullscreen();
        if (active !== self.browserFullscreenActive) {
          self.browserFullscreenActive = active;
          self.player.resize();
          if (active) {
            self.player.events.trigger("fullscreen");
          } else {
            if (self.lastScrollPosition) value2.default.setScrollPosition(self.lastScrollPosition);
            self.player.events.trigger("fullscreen_cancel");
          }
        }
        self.syncOrientation();
      };
      this.fullscreenChangeEvents = ["fullscreenchange", "mozfullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"];
      this.fullscreenChangeEvents.forEach(function (event) {
        document.addEventListener(event, self.onFullscreenChange);
        self.container.addEventListener(event, self.onFullscreenChange);
      });
      this.onNativeFullscreenBegin = function () {
        self.nativeVideoFullscreen = true;
        self.onFullscreenChange();
      };
      this.onNativeFullscreenEnd = function () {
        self.nativeVideoFullscreen = false;
        self.onFullscreenChange();
      };
      this.video.addEventListener("webkitbeginfullscreen", this.onNativeFullscreenBegin);
      this.video.addEventListener("webkitendfullscreen", this.onNativeFullscreenEnd);
      this.player.events.on("destroy", function () {
        self.destroyed = true;
        self.orientationFullscreenActive = false;
        self.orientationFullscreenMode = "";
        self.orientationSession++;
        self.releaseOrientation();
        self.fullscreenChangeEvents.forEach(function (event) {
          document.removeEventListener(event, self.onFullscreenChange);
          self.container.removeEventListener(event, self.onFullscreenChange);
        });
        self.video.removeEventListener("webkitbeginfullscreen", self.onNativeFullscreenBegin);
        self.video.removeEventListener("webkitendfullscreen", self.onNativeFullscreenEnd);
      });
    }
    value(Fullscreen, [{
      key: "isFullScreen",
      value: function () {
        switch (arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser") {
          case "browser":
            return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement || this.nativeVideoFullscreen;
          case "web":
            return this.container.classList.contains("xplayer-fulled");
        }
      }
    }, {
      key: "isPlayerFullscreen",
      value: function () {
        var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        return !!(this.nativeVideoFullscreen || element && (element === this.container || this.container.contains(element)));
      }
    }, {
      key: "syncOrientation",
      value: function () {
        if (this.destroyed) return;
        var mode = this.isPlayerFullscreen() ? "browser" : this.isFullScreen("web") ? "web" : "";
        var active = !!mode;
        if (mode === this.orientationFullscreenMode) return;
        this.orientationFullscreenActive = active;
        this.orientationFullscreenMode = mode;
        this.orientationSession++;
        if (active) this.requestLandscape();
        else this.releaseOrientation();
      }
    }, {
      key: "requestLandscape",
      value: function () {
        var self = this;
        var navigator = window.navigator;
        var mobile = value2.default.isMobile || /android|ipad|iphone|ipod/i.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        if (!mobile || this.destroyed || this.orientationLockOwned || this.orientationLockPending) return;
        var screen = window.screen;
        if (!screen) return;
        var orientation = screen.orientation;
        var target = orientation && typeof orientation.lock === "function" ? orientation : screen;
        var lock = target === orientation ? orientation.lock : screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.webkitLockOrientation;
        var unlock = target === orientation ? orientation.unlock : screen.unlockOrientation || screen.mozUnlockOrientation || screen.msUnlockOrientation || screen.webkitUnlockOrientation;
        if (typeof lock !== "function") return;
        var session = this.orientationSession;
        this.orientationLockPending = true;
        try {
          // Modern mobile browsers require real fullscreen before accepting a lock.
          var result = lock.call(target, "landscape");
          Promise.resolve(result).then(function (locked) {
            self.orientationLockPending = false;
            if (locked === false) return;
            self.orientationLockOwned = true;
            self.orientationUnlock = typeof unlock === "function" ? function () { unlock.call(target); } : null;
            // An exit or destruction can happen while the orientation promise is pending.
            if (self.destroyed || !self.orientationFullscreenActive) self.releaseOrientation();
          }, function () {
            self.orientationLockPending = false;
            // A new entry may have occurred while an earlier request was pending.
            if (!self.destroyed && self.orientationFullscreenActive && session !== self.orientationSession) self.requestLandscape();
          });
        } catch (_) {
          this.orientationLockPending = false;
        }
      }
    }, {
      key: "releaseOrientation",
      value: function () {
        if (!this.orientationLockOwned) return;
        this.orientationLockOwned = false;
        var unlock = this.orientationUnlock;
        this.orientationUnlock = null;
        try {
          if (unlock) unlock();
        } catch (_) {}
      }
    }, {
      key: "request",
      value: function () {
        var value5 = arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser";
        var value6 = "browser" === value5 ? "web" : "browser";
        var value7 = this.isFullScreen(value6);
        if (!value7) {
          this.lastScrollPosition = value2.default.getScrollPosition();
        }
        switch (value5) {
          case "browser":
            var self = this;
            var request = this.container.requestFullscreen || this.container.mozRequestFullScreen || this.container.webkitRequestFullscreen || this.container.msRequestFullscreen;
            try {
              if (request) {
                Promise.resolve(request.call(this.container)).then(function () {
                  self.onFullscreenChange();
                }, function () {});
              } else if (this.video.webkitEnterFullscreen) {
                this.video.webkitEnterFullscreen();
              }
            } catch (_) {}
            break;
          case "web":
            this.player.container.classList.add("xplayer-fulled");
            document.body.classList.add("xplayer-web-fullscreen-fix");
            this.player.events.trigger("webfullscreen");
        }
        if (value7) {
          this.cancel(value6);
        }
      }
    }, {
      key: "cancel",
      value: function () {
        switch (arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser") {
          case "browser":
            var self = this;
            var exit = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.webkitCancelFullScreen || document.msExitFullscreen;
            try {
              if (this.nativeVideoFullscreen && this.video.webkitExitFullscreen) {
                this.video.webkitExitFullscreen();
              } else if (exit) {
                Promise.resolve(exit.call(document)).then(function () {
                  self.onFullscreenChange();
                }, function () {});
              }
            } catch (_) {}
            break;
          case "web":
            this.player.container.classList.remove("xplayer-fulled");
            document.body.classList.remove("xplayer-web-fullscreen-fix");
            this.player.events.trigger("webfullscreen_cancel");
        }
      }
    }, {
      key: "toggle",
      value: function () {
        var value8 = arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser";
        if (this.isFullScreen(value8)) {
          this.cancel(value8);
        } else {
          this.request(value8);
        }
      }
    }]);
    return Fullscreen;
  }();
  exports.default = FullscreenExport;
};
