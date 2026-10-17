/* Recovered original module 13: danmaku-api. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function helper(argument, argument2, argument3, argument4, argument5, acceptPayload, encoding) {
    var value = new XMLHttpRequest();
    var completed = false;
    value.onreadystatechange = function () {
      if (4 === value.readyState && !completed) {
        completed = true;
        if (value.status >= 200 && value.status < 300 || 304 === value.status) {
          var value2;
          try { value2 = JSON.parse(value.responseText); } catch (_) { return argument5(value); }
          if (!value2 || typeof value2 !== 'object') return argument5(value);
          if (acceptPayload) return argument3(value, value2);
          if (23 !== value2.code) {
            return argument4(value, value2);
          } else {
            return argument3(value, value2);
          }
        }
        var failure;
        try { failure = JSON.parse(value.responseText); } catch (_) {}
        if (failure && failure.msg) return argument4(value, failure);
        argument5(value);
      }
    };
    value.timeout = acceptPayload && argument2 === null ? 8000 : 20000;
    value.onerror = value.ontimeout = function () { if (!completed) { completed = true; argument5(value); } };
    value.open(null !== argument2 ? "POST" : "GET", argument, true);
    if (encoding === 'form' && argument2 !== null) {
      value.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      value.send(new URLSearchParams(argument2).toString());
    } else value.send(null !== argument2 ? JSON.stringify(argument2) : null);
    return value;
  }
  function requestPayload(address, body, callback, encoding) {
    return helper(address, body, function (request, result) { callback(null, result); },
      function (request, result) { callback({status: request.status, response: result}); },
      function (request) { callback({status: request.status, response: null}); }, true, encoding);
  }
  exports.default = {
    send: function (argument6, argument7, argument8) {
      if (window.XplayerDanmakuSources) return window.XplayerDanmakuSources.send(argument6, argument7, argument8 || function () {}, requestPayload);
      helper(argument6, argument7, function (argument9, argument0) {
        if (argument8) {
          argument8(null, argument0);
        }
      }, function (argument1, argument10) {
        if (argument8) argument8(new Error(argument10.msg || '弹幕发送失败'));
      }, function (argument11) {
        if (argument8) argument8(new Error('弹幕发送失败，请检查网络后重试'));
      });
    },
    read: function (argument12, argument13) {
      if (window.XplayerDanmakuSources) return window.XplayerDanmakuSources.read(argument12, argument13, requestPayload);
      helper(argument12, null, function (request, result) {
        if (!Array.isArray(result.danmuku)) return argument13({status: request.status, response: {msg: '弹幕接口返回的数据格式不正确'}});
        argument13(null, result.danmuku);
      }, function (request, result) {
        argument13({status: request.status, response: result});
      }, function (request) {
        argument13({status: request.status, response: null});
      });
    }
  };
};
