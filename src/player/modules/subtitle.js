/* Recovered original module 39: subtitle. Bindings renamed by scope, not rewritten. */
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
  var SubtitleExport = function () {
    function Subtitle(container, video, options, events) {
      helper(this, Subtitle);
      this.container = container;
      this.video = video;
      this.options = options;
      this.events = events;
      this.init();
    }
    value(Subtitle, [{
      key: "init",
      value: function () {
        var self = this;
        this.container.style.fontSize = this.options.fontSize;
        this.container.style.bottom = this.options.bottom;
        this.container.style.color = this.options.color;
        if (this.video.textTracks && this.video.textTracks[0]) {
          var value4 = this.video.textTracks[0];
          value4.oncuechange = function () {
            var value5 = value4.activeCues[0];
            if (value5) {
              self.container.innerHTML = "";
              var value6 = document.createElement("p");
              value6.appendChild(value5.getCueAsHTML());
              self.container.appendChild(value6);
            } else {
              self.container.innerHTML = "";
            }
            self.events.trigger("subtitle_change");
          };
        }
      }
    }, {
      key: "show",
      value: function () {
        this.container.classList.remove("xplayer-subtitle-hide");
        this.events.trigger("subtitle_show");
      }
    }, {
      key: "hide",
      value: function () {
        this.container.classList.add("xplayer-subtitle-hide");
        this.events.trigger("subtitle_hide");
      }
    }, {
      key: "toggle",
      value: function () {
        if (this.container.classList.contains("xplayer-subtitle-hide")) {
          this.show();
        } else {
          this.hide();
        }
      }
    }]);
    return Subtitle;
  }();
  exports.default = SubtitleExport;
};
