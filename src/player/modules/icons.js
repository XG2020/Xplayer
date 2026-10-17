/* Recovered original module 2: icons. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var fullscreenIconModule = requireModule(16);
  var value = helper(fullscreenIconModule);
  var webFullscreenIconModule = requireModule(17);
  var value2 = helper(webFullscreenIconModule);
  var volumeDownIconModule = requireModule(18);
  var value3 = helper(volumeDownIconModule);
  var volumeOffIconModule = requireModule(19);
  var value4 = helper(volumeOffIconModule);
  var volumeUpIconModule = requireModule(20);
  var value5 = helper(volumeUpIconModule);
  var commentIconModule = requireModule(21);
  var value6 = helper(commentIconModule);
  var commentOffIconModule = requireModule(22);
  var value7 = helper(commentOffIconModule);
  var sendIconModule = requireModule(23);
  var value8 = helper(sendIconModule);
  var arrowIconModule = requireModule(24);
  var value9 = helper(arrowIconModule);
  var settingsIconModule = requireModule(25);
  var value0 = helper(settingsIconModule);
  var paletteIconModule = requireModule(26);
  var value1 = helper(paletteIconModule);
  var cameraIconModule = requireModule(27);
  var value10 = helper(cameraIconModule);
  var loadingIconModule = requireModule(28);
  var value11 = helper(loadingIconModule);
  var subtitleIconModule = requireModule(29);
  var value12 = helper(subtitleIconModule);
  var playIconModule = requireModule(30);
  var value13 = helper(playIconModule);
  var pauseIconModule = requireModule(31);
  var value14 = helper(pauseIconModule);
  var options = {
    play: value.default,
    pause: value2.default,
    volumeUp: value3.default,
    volumeDown: value4.default,
    volumeOff: value5.default,
    full: value6.default,
    fullWeb: value7.default,
    setting: value8.default,
    right: value9.default,
    comment: value0.default,
    commentOff: value1.default,
    send: value10.default,
    pallette: value11.default,
    camera: value12.default,
    subtitle: value13.default,
    loading: value14.default
  };
  exports.default = options;
};
