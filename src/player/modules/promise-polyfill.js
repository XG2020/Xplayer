/* Recovered original module 8: promise-polyfill. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  (function (argument) {
    function helper() {}
    function helper2(argument2, argument3) {
      return function () {
        argument2.apply(argument3, arguments);
      };
    }
    function helper3(argument4) {
      if (!(this instanceof helper3)) {
        throw new TypeError("Promises must be constructed via new");
      }
      if ("function" != typeof argument4) {
        throw new TypeError("not a function");
      }
      this._state = 0;
      this._handled = false;
      this._value = undefined;
      this._deferreds = [];
      helper9(argument4, this);
    }
    function helper4(argument5, argument6) {
      while (3 === argument5._state) {
        argument5 = argument5._value;
      }
      if (0 === argument5._state) {
        argument5._deferreds.push(argument6);
        return;
      }
      argument5._handled = true;
      helper3._immediateFn(function () {
        var value3 = 1 === argument5._state ? argument6.onFulfilled : argument6.onRejected;
        if (null === value3) {
          (1 === argument5._state ? helper5 : helper6)(argument6.promise, argument5._value);
          return;
        }
        var value4;
        try {
          value4 = value3(argument5._value);
        } catch (error) {
          helper6(argument6.promise, error);
          return;
        }
        helper5(argument6.promise, value4);
      });
    }
    function helper5(argument7, argument8) {
      try {
        if (argument8 === argument7) {
          throw new TypeError("A promise cannot be resolved with itself.");
        }
        if (argument8 && ("object" === (undefined === argument8 ? "undefined" : value(argument8)) || "function" == typeof argument8)) {
          var then = argument8.then;
          if (argument8 instanceof helper3) {
            argument7._state = 3;
            argument7._value = argument8;
            helper7(argument7);
            return;
          }
          if ("function" == typeof then) {
            helper9(helper2(then, argument8), argument7);
            return;
          }
        }
        argument7._state = 1;
        argument7._value = argument8;
        helper7(argument7);
      } catch (error2) {
        helper6(argument7, error2);
      }
    }
    function helper6(argument9, argument0) {
      argument9._state = 2;
      argument9._value = argument0;
      helper7(argument9);
    }
    function helper7(argument1) {
      if (2 === argument1._state && 0 === argument1._deferreds.length) {
        helper3._immediateFn(function () {
          if (!argument1._handled) {
            helper3._unhandledRejectionFn(argument1._value);
          }
        });
      }
      for (var index = 0, length = argument1._deferreds.length; index < length; index++) {
        helper4(argument1, argument1._deferreds[index]);
      }
      argument1._deferreds = null;
    }
    function helper8(argument10, argument11, promise) {
      this.onFulfilled = "function" == typeof argument10 ? argument10 : null;
      this.onRejected = "function" == typeof argument11 ? argument11 : null;
      this.promise = promise;
    }
    function helper9(argument12, argument13) {
      var value5 = false;
      try {
        argument12(function (argument14) {
          if (!value5) {
            value5 = true;
            helper5(argument13, argument14);
          }
        }, function (argument15) {
          if (!value5) {
            value5 = true;
            helper6(argument13, argument15);
          }
        });
      } catch (error3) {
        if (value5) {
          return;
        }
        value5 = true;
        helper6(argument13, error3);
      }
    }
    var value = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (argument16) {
      return typeof argument16;
    } : function (argument17) {
      if (argument17 && "function" == typeof Symbol && argument17.constructor === Symbol && argument17 !== Symbol.prototype) {
        return "symbol";
      } else {
        return typeof argument17;
      }
    };
    var value2 = setTimeout;
    helper3.prototype.catch = function (argument18) {
      return this.then(null, argument18);
    };
    helper3.prototype.then = function (argument19, argument20) {
      var value6 = new this.constructor(helper);
      helper4(this, new helper8(argument19, argument20, value6));
      return value6;
    };
    helper3.all = function (argument21) {
      return new helper3(function (argument22, argument23) {
        function helper0(argument24, argument25) {
          try {
            if (argument25 && ("object" === (undefined === argument25 ? "undefined" : value(argument25)) || "function" == typeof argument25)) {
              var then2 = argument25.then;
              if ("function" == typeof then2) {
                then2.call(argument25, function (argument26) {
                  helper0(argument24, argument26);
                }, argument23);
                return;
              }
            }
            value7[argument24] = argument25;
            if (0 == --length2) {
              argument22(value7);
            }
          } catch (error4) {
            argument23(error4);
          }
        }
        if (!argument21 || undefined === argument21.length) {
          throw new TypeError("Promise.all accepts an array");
        }
        var value7 = Array.prototype.slice.call(argument21);
        if (0 === value7.length) {
          return argument22([]);
        }
        var length2 = value7.length;
        for (var index2 = 0; index2 < value7.length; index2++) {
          helper0(index2, value7[index2]);
        }
      });
    };
    helper3.resolve = function (argument27) {
      if (argument27 && "object" === (undefined === argument27 ? "undefined" : value(argument27)) && argument27.constructor === helper3) {
        return argument27;
      } else {
        return new helper3(function (argument28) {
          argument28(argument27);
        });
      }
    };
    helper3.reject = function (argument29) {
      return new helper3(function (argument30, argument31) {
        argument31(argument29);
      });
    };
    helper3.race = function (argument32) {
      return new helper3(function (argument33, argument34) {
        for (var index3 = 0, length3 = argument32.length; index3 < length3; index3++) {
          argument32[index3].then(argument33, argument34);
        }
      });
    };
    helper3._immediateFn = "function" == typeof argument && function (argument35) {
      argument(argument35);
    } || function (argument36) {
      value2(argument36, 0);
    };
    helper3._unhandledRejectionFn = function (argument37) {
      if ("undefined" != typeof console && console) {
        console.warn("Possible Unhandled Promise Rejection:", argument37);
      }
    };
    module.exports = helper3;
  }).call(exports, requireModule(9).setImmediate);
};
