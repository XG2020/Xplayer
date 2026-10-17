/* Recovered original module 10: immediate-polyfill. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  (function (argument, argument2) {
    (function (argument3, argument4) {
      function helper(argument5) {
        if ("function" != typeof argument5) {
          argument5 = function () {
            throw new TypeError("String callbacks are disabled");
          };
        }
        for (var value4 = new Array(arguments.length - 1), index2 = 0; index2 < value4.length; index2++) {
          value4[index2] = arguments[index2 + 1];
        }
        var options2 = {
          callback: argument5,
          args: value4
        };
        options[index] = options2;
        value(index);
        return index++;
      }
      function helper2(argument6) {
        delete options[argument6];
      }
      function helper3(argument7) {
        var callback = argument7.callback;
        var args = argument7.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(argument4, args);
        }
      }
      function helper4(argument8) {
        if (value2) {
          setTimeout(helper4, 0, argument8);
        } else {
          var value5 = options[argument8];
          if (value5) {
            value2 = true;
            try {
              helper3(value5);
            } finally {
              helper2(argument8);
              value2 = false;
            }
          }
        }
      }
      if (!argument3.setImmediate) {
        var value;
        var index = 1;
        var options = {};
        var value2 = false;
        var document = argument3.document;
        var value3 = Object.getPrototypeOf && Object.getPrototypeOf(argument3);
        value3 = value3 && value3.setTimeout ? value3 : argument3;
        if ("[object process]" === {}.toString.call(argument3.process)) {
          (function () {
            value = function (argument9) {
              argument2.nextTick(function () {
                helper4(argument9);
              });
            };
          })();
        } else if (function () {
          if (argument3.postMessage && !argument3.importScripts) {
            var value6 = true;
            var onmessage = argument3.onmessage;
            argument3.onmessage = function () {
              value6 = false;
            };
            argument3.postMessage("", "*");
            argument3.onmessage = onmessage;
            return value6;
          }
        }()) {
          (function () {
            var value7 = "setImmediate$" + Math.random() + "$";
            function helper5(argument0) {
              if (argument0.source === argument3 && "string" == typeof argument0.data && 0 === argument0.data.indexOf(value7)) {
                helper4(+argument0.data.slice(value7.length));
              }
            }
            if (argument3.addEventListener) {
              argument3.addEventListener("message", helper5, false);
            } else {
              argument3.attachEvent("onmessage", helper5);
            }
            value = function (argument1) {
              argument3.postMessage(value7 + argument1, "*");
            };
          })();
        } else if (argument3.MessageChannel) {
          (function () {
            var value8 = new MessageChannel();
            value8.port1.onmessage = function (argument10) {
              helper4(argument10.data);
            };
            value = function (argument11) {
              value8.port2.postMessage(argument11);
            };
          })();
        } else if (document && "onreadystatechange" in document.createElement("script")) {
          (function () {
            var documentElement = document.documentElement;
            value = function (argument12) {
              var value9 = document.createElement("script");
              value9.onreadystatechange = function () {
                helper4(argument12);
                value9.onreadystatechange = null;
                documentElement.removeChild(value9);
                value9 = null;
              };
              documentElement.appendChild(value9);
            };
          })();
        } else {
          (function () {
            value = function (argument13) {
              setTimeout(helper4, 0, argument13);
            };
          })();
        }
        value3.setImmediate = helper;
        value3.clearImmediate = helper2;
      }
    })("undefined" == typeof self ? undefined === argument ? undefined : argument : self);
  }).call(exports, requireModule(1), requireModule(11));
};
