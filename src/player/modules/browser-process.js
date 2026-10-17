/* Recovered original module 11: browser-process. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";
  function helper() {
    throw new Error("setTimeout has not been defined");
  }
  function helper2() {
    throw new Error("clearTimeout has not been defined");
  }
  function helper3(argument34) {
    if (value === setTimeout) {
      return setTimeout(argument34, 0);
    }
    if ((value === helper || !value) && setTimeout) {
      value = setTimeout;
      return setTimeout(argument34, 0);
    }
    try {
      return value(argument34, 0);
    } catch (error) {
      try {
        return value.call(null, argument34, 0);
      } catch (error2) {
        return value.call(this, argument34, 0);
      }
    }
  }
  function helper4(argument35) {
    if (value2 === clearTimeout) {
      return clearTimeout(argument35);
    }
    if ((value2 === helper2 || !value2) && clearTimeout) {
      value2 = clearTimeout;
      return clearTimeout(argument35);
    }
    try {
      return value2(argument35);
    } catch (error3) {
      try {
        return value2.call(null, argument35);
      } catch (error4) {
        return value2.call(this, argument35);
      }
    }
  }
  function helper5() {
    if (value5 && value4) {
      value5 = false;
      if (value4.length) {
        items = value4.concat(items);
      } else {
        value6 = -1;
      }
      if (items.length) {
        helper6();
      }
    }
  }
  function helper6() {
    if (!value5) {
      var value7 = helper3(helper5);
      value5 = true;
      for (var length = items.length; length;) {
        value4 = items;
        items = [];
        while (++value6 < length) {
          if (value4) {
            value4[value6].run();
          }
        }
        value6 = -1;
        length = items.length;
      }
      value4 = null;
      value5 = false;
      helper4(value7);
    }
  }
  function helper7(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  function helper8() {}
  var value;
  var value2;
  var value3 = module.exports = {};
  (function () {
    try {
      value = "function" == typeof setTimeout ? setTimeout : helper;
    } catch (error5) {
      value = helper;
    }
    try {
      value2 = "function" == typeof clearTimeout ? clearTimeout : helper2;
    } catch (error6) {
      value2 = helper2;
    }
  })();
  var value4;
  var items = [];
  var value5 = false;
  var value6 = -1;
  value3.nextTick = function (argument36) {
    var value8 = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var index = 1; index < arguments.length; index++) {
        value8[index - 1] = arguments[index];
      }
    }
    items.push(new helper7(argument36, value8));
    if (!(1 !== items.length) && !value5) {
      helper3(helper6);
    }
  };
  helper7.prototype.run = function () {
    this.fun.apply(null, this.array);
  };
  value3.title = "browser";
  value3.browser = true;
  value3.env = {};
  value3.argv = [];
  value3.version = "";
  value3.versions = {};
  value3.on = helper8;
  value3.addListener = helper8;
  value3.once = helper8;
  value3.off = helper8;
  value3.removeListener = helper8;
  value3.removeAllListeners = helper8;
  value3.emit = helper8;
  value3.prependListener = helper8;
  value3.prependOnceListener = helper8;
  value3.listeners = function (argument37) {
    return [];
  };
  value3.binding = function (argument38) {
    throw new Error("process.binding is not supported");
  };
  value3.cwd = function () {
    return "/";
  };
  value3.chdir = function (argument39) {
    throw new Error("process.chdir is not supported");
  };
  value3.umask = function () {
    return 0;
  };
};
