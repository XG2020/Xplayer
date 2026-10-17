/* Recovered original module 12: options. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (argument) {
    return typeof argument;
  } : function (argument2) {
    if (argument2 && "function" == typeof Symbol && argument2.constructor === Symbol && argument2 !== Symbol.prototype) {
      return "symbol";
    } else {
      return typeof argument2;
    }
  };
  var danmakuApiModule = requireModule(13);
  var value2 = function (argument3) {
    if (argument3 && argument3.__esModule) {
      return argument3;
    } else {
      return {
        default: argument3
      };
    }
  }(danmakuApiModule);
  exports.default = function (argument4) {
    var options = {
      container: argument4.element || document.getElementsByClassName("xplayer")[0],
      live: false,
      autoplay: false,
      theme: "#b7daff",
      loop: false,
      lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
      screenshot: false,
      hotkey: true,
      preload: "auto",
      volume: 0.7,
      apiBackend: value2.default,
      video: {},
      contextmenu: [],
      mutex: true
    };
    for (var value3 in options) {
      if (options.hasOwnProperty(value3) && !argument4.hasOwnProperty(value3)) {
        argument4[value3] = options[value3];
      }
    }
    if (argument4.video && !argument4.video.type) {
      argument4.video.type = "auto";
    }
    if ("object" === value(argument4.danmaku) && argument4.danmaku && !argument4.danmaku.user) {
      argument4.danmaku.user = "XGGM";
    }
    if (argument4.subtitle) {
      if (!argument4.subtitle.type) {
        argument4.subtitle.type = "webvtt";
      }
      if (!argument4.subtitle.fontSize) {
        argument4.subtitle.fontSize = "20px";
      }
      if (!argument4.subtitle.bottom) {
        argument4.subtitle.bottom = "40px";
      }
      if (!argument4.subtitle.color) {
        argument4.subtitle.color = "#fff";
      }
    }
    if (argument4.video.quality) {
      argument4.video.url = [argument4.video.quality[argument4.video.defaultQuality].url];
    }
    argument4.lang &&= argument4.lang.toLowerCase();
    argument4.contextmenu = argument4.contextmenu.concat(rightmenuArr);
    return argument4;
  };
};
