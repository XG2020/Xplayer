/* Recovered original module 9: timers-polyfill. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(id, clearFn) {
    this._id = id;
    this._clearFn = clearFn;
  }
  var apply = Function.prototype.apply;
  exports.setTimeout = function () {
    return new helper(apply.call(setTimeout, window, arguments), clearTimeout);
  };
  exports.setInterval = function () {
    return new helper(apply.call(setInterval, window, arguments), clearInterval);
  };
  exports.clearTimeout = exports.clearInterval = function (argument) {
    if (argument) {
      argument.close();
    }
  };
  helper.prototype.unref = helper.prototype.ref = function () {};
  helper.prototype.close = function () {
    this._clearFn.call(window, this._id);
  };
  exports.enroll = function (argument2, argument3) {
    clearTimeout(argument2._idleTimeoutId);
    argument2._idleTimeout = argument3;
  };
  exports.unenroll = function (argument4) {
    clearTimeout(argument4._idleTimeoutId);
    argument4._idleTimeout = -1;
  };
  exports._unrefActive = exports.active = function (argument5) {
    clearTimeout(argument5._idleTimeoutId);
    var idleTimeout = argument5._idleTimeout;
    if (idleTimeout >= 0) {
      argument5._idleTimeoutId = setTimeout(function () {
        if (argument5._onTimeout) {
          argument5._onTimeout();
        }
      }, idleTimeout);
    }
  };
  requireModule(10);
  exports.setImmediate = setImmediate;
  exports.clearImmediate = clearImmediate;
};
