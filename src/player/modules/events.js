/* Recovered original module 36: events. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
  "use strict";

  function helper(argument, argument2) {
    if (!(argument instanceof argument2)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper2(argument3, argument4) {
      for (var index = 0; index < argument4.length; index++) {
        var value3 = argument4[index];
        value3.enumerable = value3.enumerable || false;
        value3.configurable = true;
        if ("value" in value3) {
          value3.writable = true;
        }
        Object.defineProperty(argument3, value3.key, value3);
      }
    }
    return function (argument5, argument6, argument7) {
      if (argument6) {
        helper2(argument5.prototype, argument6);
      }
      if (argument7) {
        helper2(argument5, argument7);
      }
      return argument5;
    };
  }();
  var EventsExport = function () {
    function Events() {
      helper(this, Events);
      this.events = {};
      this.videoEvents = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "mozaudioavailable", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"];
      this.playerEvents = ["screenshot", "thumbnails_show", "thumbnails_hide", "danmaku_show", "danmaku_hide", "danmaku_clear", "danmaku_loaded", "danmaku_load_start", "danmaku_load_end", "danmaku_send", "danmaku_opacity", "contextmenu_show", "contextmenu_hide", "notice_show", "notice_hide", "quality_start", "quality_end", "destroy", "resize", "fullscreen", "fullscreen_cancel", "webfullscreen", "webfullscreen_cancel", "subtitle_show", "subtitle_hide", "subtitle_change"];
    }
    value(Events, [{
      key: "on",
      value: function (argument8, argument9) {
        if (this.type(argument8) && "function" == typeof argument9) {
          this.events[argument8] ||= [];
          this.events[argument8].push(argument9);
        }
      }
    }, {
      key: "trigger",
      value: function (argument0, argument1) {
        if (this.events[argument0] && this.events[argument0].length) {
          for (var index2 = 0; index2 < this.events[argument0].length; index2++) {
            this.events[argument0][index2](argument1);
          }
        }
      }
    }, {
      key: "type",
      value: function (argument10) {
        if (-1 !== this.playerEvents.indexOf(argument10)) {
          return "player";
        } else if (-1 !== this.videoEvents.indexOf(argument10)) {
          return "video";
        } else {
          console.error("Unknown event name: " + argument10);
          return null;
        }
      }
    }]);
    return Events;
  }();
  exports.default = EventsExport;
};
