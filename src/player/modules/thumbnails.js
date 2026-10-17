/* Recovered original module 44: thumbnails. Bindings renamed by scope, not rewritten. */
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
  var ThumbnailsExport = function () {
    function Thumbnails(argument8) {
      helper(this, Thumbnails);
      this.container = argument8.container;
      this.barWidth = argument8.barWidth;
      this.container.style.backgroundImage = "url('" + argument8.url + "')";
      this.events = argument8.events;
    }
    value(Thumbnails, [{
      key: "resize",
      value: function (argument9, argument0) {
        this.container.style.width = argument9 + "px";
        this.container.style.height = argument0 + "px";
        this.container.style.top = 2 - argument0 + "px";
      }
    }, {
      key: "show",
      value: function () {
        this.container.style.display = "block";
        if (this.events) {
          this.events.trigger("thumbnails_show");
        }
      }
    }, {
      key: "move",
      value: function (argument1) {
        this.container.style.backgroundPosition = "-" + 160 * (Math.ceil(argument1 / this.barWidth * 100) - 1) + "px 0";
        this.container.style.left = argument1 - this.container.offsetWidth / 2 + "px";
      }
    }, {
      key: "hide",
      value: function () {
        this.container.style.display = "none";
        if (this.events) {
          this.events.trigger("thumbnails_hide");
        }
      }
    }]);
    return Thumbnails;
  }();
  exports.default = ThumbnailsExport;
};
