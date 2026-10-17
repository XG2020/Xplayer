/* Recovered original module 33: template-runtime. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  (function (argument) {
    function helper(argument2) {
      if ("string" != typeof argument2) {
        argument2 = undefined === argument2 || null === argument2 ? "" : "function" == typeof argument2 ? helper(argument2.call(argument2)) : JSON.stringify(argument2);
      }
      return argument2;
    }
    function helper2(argument3) {
      var value3 = "" + argument3;
      var value4 = value2.exec(value3);
      if (!value4) {
        return argument3;
      }
      var value5 = "";
      var value6 = undefined;
      var value7 = undefined;
      var value8 = undefined;
      value6 = value4.index;
      value7 = 0;
      for (; value6 < value3.length; value6++) {
        switch (value3.charCodeAt(value6)) {
          case 34:
            value8 = "&#34;";
            break;
          case 38:
            value8 = "&#38;";
            break;
          case 39:
            value8 = "&#39;";
            break;
          case 60:
            value8 = "&#60;";
            break;
          case 62:
            value8 = "&#62;";
            break;
          default:
            continue;
        }
        if (value7 !== value6) {
          value5 += value3.substring(value7, value6);
        }
        value7 = value6 + 1;
        value5 += value8;
      }
      if (value7 !== value6) {
        return value5 + value3.substring(value7, value6);
      } else {
        return value5;
      }
    }
    var templatePrototypeModule = requireModule(34);
    var value = Object.create(templatePrototypeModule ? argument : window);
    var value2 = /["&'<>]/;
    value.$escape = function (argument4) {
      return helper2(helper(argument4));
    };
    value.$each = function (argument5, argument6) {
      if (Array.isArray(argument5)) {
        for (var index = 0, length = argument5.length; index < length; index++) {
          argument6(argument5[index], index);
        }
      } else {
        for (var value9 in argument5) {
          argument6(argument5[value9], value9);
        }
      }
    };
    module.exports = value;
  }).call(exports, requireModule(1));
};
