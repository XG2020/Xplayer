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
      this.player.events.on("webfullscreen", function () {
        self.player.resize();
      });
      this.player.events.on("webfullscreen_cancel", function () {
        self.player.resize();
        value2.default.setScrollPosition(self.lastScrollPosition);
      });
      function helper4() {
        self.player.resize();
        if (self.isFullScreen("browser")) {
          self.player.events.trigger("fullscreen");
        } else {
          value2.default.setScrollPosition(self.lastScrollPosition);
          self.player.events.trigger("fullscreen_cancel");
        }
      }
      this.player.container.addEventListener("fullscreenchange", helper4);
      this.player.container.addEventListener("mozfullscreenchange", helper4);
      this.player.container.addEventListener("webkitfullscreenchange", helper4);
    }
    value(Fullscreen, [{
      key: "isFullScreen",
      value: function () {
        switch (arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser") {
          case "browser":
            return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
          case "web":
            return this.player.container.classList.contains("xplayer-fulled");
        }
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
            if (this.player.container.requestFullscreen) {
              this.player.container.requestFullscreen();
            } else if (this.player.container.mozRequestFullScreen) {
              this.player.container.mozRequestFullScreen();
            } else if (this.player.container.webkitRequestFullscreen) {
              this.player.container.webkitRequestFullscreen();
            } else if (this.player.video.webkitEnterFullscreen) {
              this.player.video.webkitEnterFullscreen();
            }
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
            if (document.cancelFullScreen) {
              document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
            }
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
