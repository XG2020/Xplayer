/* Recovered original module 47: dom-parser. Bindings renamed by scope, not rewritten. */
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
  var helper2 = function value(argument3) {
    helper(this, value);
    if (argument3.options.hotkey) {
      document.addEventListener("keydown", function (argument4) {
        if (argument3.focus) {
          var value2 = document.activeElement.tagName.toUpperCase();
          var value3 = document.activeElement.getAttribute("contenteditable");
          if ("INPUT" !== value2 && "TEXTAREA" !== value2 && "SELECT" !== value2 && !document.activeElement.closest('.xplayer-feature-dialog') && "" !== value3 && "true" !== value3) {
            var value4 = argument4 || window.event;
            var value5 = undefined;
            switch (value4.keyCode) {
              case 32:
                value4.preventDefault();
                argument3.toggle();
                break;
              case 37:
                value4.preventDefault();
                argument3.seek(argument3.video.currentTime - 5);
                argument3.controller.setAutoHide();
                break;
              case 39:
                value4.preventDefault();
                argument3.seek(argument3.video.currentTime + 5);
                argument3.controller.setAutoHide();
                break;
              case 38:
                value4.preventDefault();
                value5 = argument3.volume() + 0.1;
                argument3.volume(value5);
                break;
              case 40:
                value4.preventDefault();
                value5 = argument3.volume() - 0.1;
                argument3.volume(value5);
            }
          }
        }
      });
    }
    document.addEventListener("keydown", function (argument5) {
      switch ((argument5 || window.event).keyCode) {
        case 27:
          if (argument3.fullScreen.isFullScreen("web")) {
            argument3.fullScreen.cancel("web");
          }
      }
    });
  };
  exports.default = helper2;
};
