/* Recovered original module 38: preferences. Bindings renamed by scope, not rewritten. */
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
  var PreferencesExport = function () {
    function Preferences(argument9) {
      helper(this, Preferences);
      this.storageName = {
        opacity: "xplayer-danmaku-opacity",
        volume: "xplayer-volume",
        unlimited: "xplayer-danmaku-unlimited",
        danmaku: "xplayer-danmaku-show",
        displayArea: "xplayer-danmaku-display-area",
        displaySize: "xplayer-danmaku-display-size",
        displaySpeed: "xplayer-danmaku-display-speed",
        displayRight: "xplayer-danmaku-display-right",
        displayFixed: "xplayer-danmaku-display-fixed",
        displayColor: "xplayer-danmaku-display-color",
        subtitle: "xplayer-subtitle-show"
      };
      this.default = {
        opacity: 0.7,
        volume: argument9.options.volume || 0.7,
        unlimited: (argument9.options.danmaku && argument9.options.danmaku.unlimited ? 1 : 0) || 0,
        danmaku: 1,
        displayArea: 100,
        displaySize: 100,
        displaySpeed: 1,
        displayRight: 1,
        displayFixed: 1,
        displayColor: 1,
        subtitle: 1
      };
      this.data = {};
      this.init();
    }
    value(Preferences, [{
      key: "init",
      value: function () {
        for (var value5 in this.storageName) {
          var value6 = this.storageName[value5];
          var stored = value2.default.storage.get(value6);
          var parsed = stored === null || stored === undefined || stored === "" ? this.default[value5] : parseFloat(stored);
          this.data[value5] = Number.isFinite(parsed) ? parsed : this.default[value5];
        }
      }
    }, {
      key: "get",
      value: function (argument0) {
        return this.data[argument0];
      }
    }, {
      key: "set",
      value: function (argument1, argument10) {
        this.data[argument1] = argument10;
        value2.default.storage.set(this.storageName[argument1], argument10);
      }
    }]);
    return Preferences;
  }();
  exports.default = PreferencesExport;
};
