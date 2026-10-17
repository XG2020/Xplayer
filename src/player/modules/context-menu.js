/* Recovered original module 48: context-menu. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (Array.isArray(argument)) {
      for (var index = 0, value3 = Array(argument.length); index < argument.length; index++) {
        value3[index] = argument[index];
      }
      return value3;
    }
    return Array.from(argument);
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index2 = 0; index2 < argument5.length; index2++) {
        var value4 = argument5[index2];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument4, value4.key, value4);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var ContextMenuExport = function () {
    function ContextMenu(player) {
      var self = this;
      helper2(this, ContextMenu);
      this.player = player;
      [].concat(helper(this.player.template.menuItem)).map(function (argument9, argument0) {
        if (self.player.options.contextmenu[argument0].click) {
          argument9.addEventListener("click", function () {
            self.hide();
            self.player.options.contextmenu[argument0].click(self.player);
          });
        }
        return argument9;
      });
      this.player.template.mask.addEventListener("click", function () { self.hide(); });
      this.player.container.addEventListener("contextmenu", function (argument1) {
        var value5 = argument1 || window.event;
        value5.preventDefault();
        var value6 = self.player.container.getBoundingClientRect();
        self.show(value5.clientX - value6.left, value5.clientY - value6.top);

      });
    }
    value(ContextMenu, [{
      key: "show",
      value: function (argument10, argument11) {
        this.player.template.menu.classList.add("xplayer-menu-show");
        var value7 = this.player.container.getBoundingClientRect();
        if (argument10 + this.player.template.menu.offsetWidth >= value7.width) {
          this.player.template.menu.style.right = value7.width - argument10 + "px";
          this.player.template.menu.style.left = "initial";
        } else {
          this.player.template.menu.style.left = argument10 + "px";
          this.player.template.menu.style.right = "initial";
        }
        if (argument11 + this.player.template.menu.offsetHeight >= value7.height) {
          this.player.template.menu.style.bottom = value7.height - argument11 + "px";
          this.player.template.menu.style.top = "initial";
        } else {
          this.player.template.menu.style.top = argument11 + "px";
          this.player.template.menu.style.bottom = "initial";
        }
        this.player.template.mask.classList.add("xplayer-mask-show");
        this.player.events.trigger("contextmenu_show");
      }
    }, {
      key: "hide",
      value: function () {
        this.player.template.mask.classList.remove("xplayer-mask-show");
        this.player.template.menu.classList.remove("xplayer-menu-show");
        this.player.events.trigger("contextmenu_hide");
      }
    }]);
    return ContextMenu;
  }();
  exports.default = ContextMenuExport;
};
