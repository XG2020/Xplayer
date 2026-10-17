/* Recovered original module 0: utils. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = /mobile/i.test(window.navigator.userAgent);
  var options = {
    secondToTime: function (argument) {
      function helper(argument2) {
        if (argument2 < 10) {
          return "0" + argument2;
        } else {
          return "" + argument2;
        }
      }
      var value2 = Math.floor(argument / 3600);
      var value3 = Math.floor((argument - 3600 * value2) / 60);
      var value4 = Math.floor(argument - 3600 * value2 - 60 * value3);
      return (value2 > 0 ? [value2, value3, value4] : [value3, value4]).map(helper).join(":");
    },
    getElementViewLeft: function (argument3) {
      var offsetLeft = argument3.offsetLeft;
      var offsetParent = argument3.offsetParent;
      var value5 = document.body.scrollLeft + document.documentElement.scrollLeft;
      if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        while (null !== offsetParent && offsetParent !== argument3) {
          offsetLeft += offsetParent.offsetLeft;
          offsetParent = offsetParent.offsetParent;
        }
      } else {
        while (null !== offsetParent) {
          offsetLeft += offsetParent.offsetLeft;
          offsetParent = offsetParent.offsetParent;
        }
      }
      return offsetLeft - value5;
    },
    getScrollPosition: function () {
      return {
        left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
        top: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      };
    },
    setScrollPosition: function (argument4) {
      var left = argument4.left;
      var value6 = undefined === left ? 0 : left;
      var top = argument4.top;
      var value7 = undefined === top ? 0 : top;
      if (this.isFirefox) {
        document.documentElement.scrollLeft = value6;
        document.documentElement.scrollTop = value7;
      } else {
        window.scrollTo(value6, value7);
      }
    },
    isMobile: value,
    isFirefox: /firefox/i.test(window.navigator.userAgent),
    isChrome: /chrome/i.test(window.navigator.userAgent),
    storage: {
      set: function (argument5, argument6) {
        try {
          localStorage.setItem(argument5, argument6);
        } catch (_) {}
      },
      get: function (argument7) {
        try {
          return localStorage.getItem(argument7);
        } catch (_) {
          return null;
        }
      }
    },
    cumulativeOffset: function (argument8) {
      var index = 0;
      var index2 = 0;
      do {
        index += argument8.offsetTop || 0;
        index2 += argument8.offsetLeft || 0;
        argument8 = argument8.offsetParent;
      } while (argument8);
      return {
        top: index,
        left: index2
      };
    },
    nameMap: {
      dragStart: value ? "touchstart" : "mousedown",
      dragMove: value ? "touchmove" : "mousemove",
      dragEnd: value ? "touchend" : "mouseup"
    }
  };
  exports.default = options;
};
