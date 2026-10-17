/* Recovered original module 42: bezel. Bindings renamed by scope, not rewritten. */
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
  var BezelExport = function () {
    function Bezel(container) {
      var self = this;
      helper(this, Bezel);
      this.container = container;
      this.container.addEventListener("animationend", function () {
        self.container.classList.remove("xplayer-bezel-transition");
      });
    }
    value(Bezel, [{
      key: "switch",
      value: function (argument8) {
        this.container.innerHTML = argument8;
        this.container.classList.add("xplayer-bezel-transition");
      }
    }]);
    return Bezel;
  }();
  exports.default = BezelExport;
};
