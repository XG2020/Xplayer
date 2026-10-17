/* Recovered original module 34: template-prototype. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  (function (argument) {
    module.exports = false;
    try {
      module.exports = "[object process]" === Object.prototype.toString.call(argument.process);
    } catch (error) {}
  }).call(exports, requireModule(1));
};
