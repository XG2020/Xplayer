/* Recovered original module 1: global. Bindings renamed by scope, not rewritten. */
module.exports = function (module) {
  module.exports = typeof globalThis !== "undefined" ? globalThis : window;
};
