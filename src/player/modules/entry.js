/* Recovered original module 5: entry. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  requireModule(6);
  var playerModule = requireModule(7);
  var value = function (argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }(playerModule);
  console.log('Xplayer by XG.GM');
  value.default.danmakuSwitchIcon = requireModule(2).default.danmakuSwitch;
  exports.default = value.default;
};
