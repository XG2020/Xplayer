/* Recovered original module 40: bar. Bindings renamed by scope, not rewritten. */
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
  var BarExport = function () {
    function Bar(argument8) {
      helper(this, Bar);
      this.elements = {};
      this.elements.volume = argument8.volumeBar;
      this.elements.played = argument8.playedBar;
      this.elements.loaded = argument8.loadedBar;
      this.elements.danmaku = argument8.danmakuOpacityBar;
    }
    value(Bar, [{
      key: "set",
      value: function (argument9, argument0, argument1) {
        argument0 = Math.max(argument0, 0);
        argument0 = Math.min(argument0, 1);
        this.elements[argument9].style[argument1] = 100 * argument0 + "%";
      }
    }, {
      key: "get",
      value: function (argument10) {
        return parseFloat(this.elements[argument10].style.width) / 100;
      }
    }]);
    return Bar;
  }();
  exports.default = BarExport;
};
