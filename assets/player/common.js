/* Xplayer Pro: recovered original modules. Build: node tools/build-player.cjs */
(function(global){'use strict';const modules=[
/* Recovered original module 0: utils. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = /mobile/i.test(window.navigator.userAgent);
  var options = {
    secondToTime: function (argument) {
      function helper(argument2) {
        if (argument2 < 10) {
          return "0" + argument2;
        } else {
          return "" + argument2;
        }
      }
      var value2 = Math.floor(argument / 3600);
      var value3 = Math.floor((argument - 3600 * value2) / 60);
      var value4 = Math.floor(argument - 3600 * value2 - 60 * value3);
      return (value2 > 0 ? [value2, value3, value4] : [value3, value4]).map(helper).join(":");
    },
    getElementViewLeft: function (argument3) {
      var offsetLeft = argument3.offsetLeft;
      var offsetParent = argument3.offsetParent;
      var value5 = document.body.scrollLeft + document.documentElement.scrollLeft;
      if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        while (null !== offsetParent && offsetParent !== argument3) {
          offsetLeft += offsetParent.offsetLeft;
          offsetParent = offsetParent.offsetParent;
        }
      } else {
        while (null !== offsetParent) {
          offsetLeft += offsetParent.offsetLeft;
          offsetParent = offsetParent.offsetParent;
        }
      }
      return offsetLeft - value5;
    },
    getScrollPosition: function () {
      return {
        left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
        top: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      };
    },
    setScrollPosition: function (argument4) {
      var left = argument4.left;
      var value6 = undefined === left ? 0 : left;
      var top = argument4.top;
      var value7 = undefined === top ? 0 : top;
      if (this.isFirefox) {
        document.documentElement.scrollLeft = value6;
        document.documentElement.scrollTop = value7;
      } else {
        window.scrollTo(value6, value7);
      }
    },
    isMobile: value,
    isFirefox: /firefox/i.test(window.navigator.userAgent),
    isChrome: /chrome/i.test(window.navigator.userAgent),
    storage: {
      set: function (argument5, argument6) {
        try {
          localStorage.setItem(argument5, argument6);
        } catch (_) {}
      },
      get: function (argument7) {
        try {
          return localStorage.getItem(argument7);
        } catch (_) {
          return null;
        }
      }
    },
    cumulativeOffset: function (argument8) {
      var index = 0;
      var index2 = 0;
      do {
        index += argument8.offsetTop || 0;
        index2 += argument8.offsetLeft || 0;
        argument8 = argument8.offsetParent;
      } while (argument8);
      return {
        top: index,
        left: index2
      };
    },
    nameMap: {
      dragStart: value ? "touchstart" : "mousedown",
      dragMove: value ? "touchmove" : "mousemove",
      dragEnd: value ? "touchend" : "mouseup"
    }
  };
  exports.default = options;
},
/* Recovered original module 1: global. Bindings renamed by scope, not rewritten. */
function (module) {
  module.exports = typeof globalThis !== "undefined" ? globalThis : window;
},
/* Recovered original module 2: icons. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var fullscreenIconModule = requireModule(16);
  var value = helper(fullscreenIconModule);
  var webFullscreenIconModule = requireModule(17);
  var value2 = helper(webFullscreenIconModule);
  var volumeDownIconModule = requireModule(18);
  var value3 = helper(volumeDownIconModule);
  var volumeOffIconModule = requireModule(19);
  var value4 = helper(volumeOffIconModule);
  var volumeUpIconModule = requireModule(20);
  var value5 = helper(volumeUpIconModule);
  var commentIconModule = requireModule(21);
  var value6 = helper(commentIconModule);
  var commentOffIconModule = requireModule(22);
  var value7 = helper(commentOffIconModule);
  var sendIconModule = requireModule(23);
  var value8 = helper(sendIconModule);
  var arrowIconModule = requireModule(24);
  var value9 = helper(arrowIconModule);
  var settingsIconModule = requireModule(25);
  var value0 = helper(settingsIconModule);
  var paletteIconModule = requireModule(26);
  var value1 = helper(paletteIconModule);
  var cameraIconModule = requireModule(27);
  var value10 = helper(cameraIconModule);
  var loadingIconModule = requireModule(28);
  var value11 = helper(loadingIconModule);
  var subtitleIconModule = requireModule(29);
  var value12 = helper(subtitleIconModule);
  var playIconModule = requireModule(30);
  var value13 = helper(playIconModule);
  var pauseIconModule = requireModule(31);
  var value14 = helper(pauseIconModule);
  var options = {
    play: value.default,
    pause: value2.default,
    volumeUp: value3.default,
    volumeDown: value4.default,
    volumeOff: value5.default,
    full: value6.default,
    fullWeb: value7.default,
    setting: value8.default,
    right: value9.default,
    comment: value0.default,
    commentOff: value1.default,
    send: value10.default,
    pallette: value11.default,
    camera: value12.default,
    subtitle: value13.default,
    loading: value14.default
  };
  options.danmakuSwitch = "<svg class=\"xplayer-pip-danmaku-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path class=\"xplayer-pip-danmaku-frame\" fill-rule=\"evenodd\" d=\"M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 0 0-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 0 0 0-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 1 0 1.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 0 0-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13Zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 0 0 .748-1.42L15.183 7.8a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858h1.254Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902h1.254v.902h-1.254Z\"/><path class=\"xplayer-pip-danmaku-check\" fill-rule=\"evenodd\" d=\"M22.846 14.627a1 1 0 0 0-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 0 0-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 0 0-.166-1.295Z\"/><path class=\"xplayer-pip-danmaku-off\" fill-rule=\"evenodd\" d=\"m8.085 4.891-.999-1.499a1.008 1.008 0 0 1 1.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 0 1 1.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 0 1-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 0 0-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 0 0 5.416.139.988.988 0 0 1 0 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 0 1 2.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 0 1 5.92 4.96c.761-.027 1.483-.05 2.164-.069Zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 0 1 3.575-3.115V9.598h-1.276a8.59 8.59 0 0 0 .748-1.42l-1.089-.384a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858H15.8Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902H15.8v.902h-1.254Zm3.517 10.594a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.002-1.502a2.5 2.5 0 0 1-2.217-3.657l3.326 3.398a2.49 2.49 0 0 1-1.109.259Zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 0 1 3.614 2.239Z\"/></svg>";
  exports.default = options;
},
/* Recovered original module 3: template-runtime-export. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  module.exports = requireModule(33);
},
/* Recovered original module 4: video-template. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  var templateRuntimeExportModule = requireModule(3);
  module.exports = function (argument) {
    "use strict";

    argument = argument || {};
    var value = "";
    var enableSubtitle = argument.enableSubtitle;
    var subtitle = argument.subtitle;
    var current = argument.current;
    var pic = argument.pic;
    var $escape = templateRuntimeExportModule.$escape;
    var screenshot = argument.screenshot;
    var preload = argument.preload;
    var url = argument.url;
    var enableSubtitle = subtitle && "webvtt" === subtitle.type;
    value += "\n<video\n id=\"xplayer-media\" \n   class=\"xplayer-video ";
    if (current) {
      value += "xplayer-video-current";
    }
    value += "\"\n    webkit-playsinline\n    playsinline\n    ";
    if (pic) {
      value += "poster=\"";
      value += $escape(pic);
      value += "\"";
    }
    value += "\n    ";
    if (screenshot || enableSubtitle) {
      value += "crossorigin=\"anonymous\"";
    }
    value += "\n    ";
    if (preload) {
      value += "preload=\"";
      value += $escape(preload);
      value += "\"";
    }
    value += "\n    ";
    if (url) {
      value += "src=\"";
      value += $escape(url);
      value += "\"";
    }
    value += "\n    >\n    ";
    if (enableSubtitle) {
      value += "\n    <track kind=\"metadata\" default src=\"";
      value += $escape(subtitle.url);
      value += "\"></track>\n    ";
    }
    return value += "\n</video>";
  };
},
/* Recovered original module 5: entry. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  requireModule(6);
  var playerModule = requireModule(7);
  var value = function (argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }(playerModule);
  console.log('Xplayer by XG.GM');
  value.default.danmakuSwitchIcon = requireModule(2).default.danmakuSwitch;
  exports.default = value.default;
},
/* Recovered original module 6: style-placeholder. Bindings renamed by scope, not rewritten. */
function (module, exports) {},
/* Recovered original module 7: player. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index2 = 0; index2 < argument5.length; index2++) {
        var value22 = argument5[index2];
        value22.enumerable = value22.enumerable || false;
        value22.configurable = true;
        if ("value" in value22) {
          value22.writable = true;
        }
        Object.defineProperty(argument4, value22.key, value22);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var promisePolyfillModule = requireModule(8);
  var value2 = helper(promisePolyfillModule);
  var utilsModule = requireModule(0);
  var value3 = helper(utilsModule);
  var optionsModule = requireModule(12);
  var value4 = helper(optionsModule);
  var localizationModule = requireModule(14);
  var value5 = helper(localizationModule);
  var templateModule = requireModule(15);
  var value6 = helper(templateModule);
  var iconsModule = requireModule(2);
  var value7 = helper(iconsModule);
  var danmakuModule = requireModule(35);
  var value8 = helper(danmakuModule);
  var eventsModule = requireModule(36);
  var value9 = helper(eventsModule);
  var fullscreenModule = requireModule(37);
  var value0 = helper(fullscreenModule);
  var preferencesModule = requireModule(38);
  var value1 = helper(preferencesModule);
  var subtitleModule = requireModule(39);
  var value10 = helper(subtitleModule);
  var barModule = requireModule(40);
  var value11 = helper(barModule);
  var timerModule = requireModule(41);
  var value12 = helper(timerModule);
  var bezelModule = requireModule(42);
  var value13 = helper(bezelModule);
  var controllerModule = requireModule(43);
  var value14 = helper(controllerModule);
  var settingsModule = requireModule(45);
  var value15 = helper(settingsModule);
  var commentModule = requireModule(46);
  var value16 = helper(commentModule);
  var domParserModule = requireModule(47);
  var value17 = helper(domParserModule);
  var contextMenuModule = requireModule(48);
  var value18 = helper(contextMenuModule);
  var infoPanelModule = requireModule(49);
  var value19 = helper(infoPanelModule);
  var videoTemplateModule = requireModule(4);
  var value20 = helper(videoTemplateModule);
  var index = 0;
  var items = [];
  var PlayerExport = function () {
    function Player(argument9) {
      var self = this;
      helper2(this, Player);
      this.options = (0, value4.default)(argument9);
      if (this.options.video.quality) {
        this.qualityIndex = this.options.video.defaultQuality;
        this.quality = this.options.video.quality[this.options.video.defaultQuality];
      }
      this.tran = new value5.default(this.options.lang).tran;
      this.events = new value9.default();
      this.user = new value1.default(this);
      this.container = this.options.container;
      this.container.classList.add("xplayer");
      if (!this.options.danmaku) {
        this.container.classList.add("xplayer-no-danmaku");
      }
      if (this.options.live) {
        this.container.classList.add("xplayer-live");
      }
      if (value3.default.isMobile) {
        this.container.classList.add("xplayer-mobile");
      }
      this.arrow = this.container.offsetWidth <= 500;
      if (this.arrow) {
        this.container.classList.add("xplayer-arrow");
      }
      this.template = new value6.default({
        container: this.container,
        options: this.options,
        index: index,
        tran: this.tran
      });
      this.video = this.template.video;
      this.bar = new value11.default(this.template);
      this.bezel = new value13.default(this.template.bezel);
      this.fullScreen = new value0.default(this);
      this.controller = new value14.default(this);
      if (this.options.danmaku) {
        this.danmaku = new value8.default({
          container: this.template.danmaku,
          opacity: this.user.get("opacity"),
          callback: function () {
            setTimeout(function () {
              self.template.danmakuLoading.style.display = "none";
              setTimeout(function () {}, 1500);
              if (self.options.autoplay) {
                self.play();
              }
            }, 0);
          },
          error: function (argument0) {
            var success = document.getElementById('link2-success');
            if (success) success.remove();
            setTimeout(function () {
              var failure = document.getElementById('link2-error');
              if (failure) failure.style.display = 'block';
            }, 1000);
            self.notice(argument0);
          },
          apiBackend: this.options.apiBackend,
          borderColor: this.options.theme,
          height: this.arrow ? 24 : 30,
          time: function () {
            return self.video.currentTime;
          },
          unlimited: this.user.get("unlimited"),
          api: {
            id: this.options.danmaku.id,
            address: this.options.danmaku.api,
            token: this.options.danmaku.token,
            maximum: this.options.danmaku.maximum,
            addition: this.options.danmaku.addition,
            user: this.options.danmaku.user
          },
          events: this.events
        });
        this.comment = new value16.default(this);
      }
      this.setting = new value15.default(this);
      document.addEventListener("click", function () {
        self.focus = false;
      }, true);
      this.container.addEventListener("click", function () {
        self.focus = true;
      }, true);
      this.paused = true;
      this.time = new value12.default(this);
      this.hotkey = new value17.default(this);
      this.contextmenu = new value18.default(this);
      this.initVideo(this.video, this.quality && this.quality.type || this.options.video.type);
      this.infoPanel = new value19.default(this);
      if (!this.danmaku && this.options.autoplay) {
        this.play();
      }
      index++;
      items.push(this);
    }
    value(Player, [{
      key: "seek",
      value: function (argument1) {
        argument1 = Math.max(argument1, 0);
        if (this.video.duration) {
          argument1 = Math.min(argument1, this.video.duration);
        }
        if (this.video.currentTime < argument1) {
          this.notice(this.tran("FF") + " " + (argument1 - this.video.currentTime).toFixed(0) + " " + this.tran("s"));
        } else if (this.video.currentTime > argument1) {
          this.notice(this.tran("REW") + " " + (this.video.currentTime - argument1).toFixed(0) + " " + this.tran("s"));
        }
        this.video.currentTime = argument1;
        if (this.danmaku) {
          this.danmaku.seek();
        }
        this.bar.set("played", argument1 / this.video.duration, "width");
      }
    }, {
      key: "play",
      value: function () {
        var self2 = this;
        this.paused = false;
        if (this.video.paused) {
          this.bezel.switch(value7.default.play);
        }
        this.template.playButton.innerHTML = value7.default.pause;
        value2.default.resolve(this.video.play()).catch(function () {
          self2.pause();
        }).then(function () {});
        this.time.enable("loading");
        this.time.enable("progress");
        this.container.classList.remove("xplayer-paused");
        this.container.classList.add("xplayer-playing");
        if (this.danmaku) {
          this.danmaku.play();
        }
        if (this.options.mutex) {
          for (var index3 = 0; index3 < items.length; index3++) {
            if (this !== items[index3]) {
              items[index3].pause();
            }
          }
        }
      }
    }, {
      key: "pause",
      value: function () {
        this.paused = true;
        this.container.classList.remove("xplayer-loading");
        if (!this.video.paused) {
          this.bezel.switch(value7.default.pause);
        }
        this.ended = false;
        this.template.playButton.innerHTML = value7.default.play;
        this.video.pause();
        this.time.disable("loading");
        this.time.disable("progress");
        this.container.classList.remove("xplayer-playing");
        this.container.classList.add("xplayer-paused");
        if (this.danmaku) {
          this.danmaku.pause();
        }
      }
    }, {
      key: "switchVolumeIcon",
      value: function () {
        if (this.volume() >= 0.95) {
          this.template.volumeIcon.innerHTML = value7.default.volumeUp;
        } else if (this.volume() > 0) {
          this.template.volumeIcon.innerHTML = value7.default.volumeDown;
        } else {
          this.template.volumeIcon.innerHTML = value7.default.volumeOff;
        }
      }
    }, {
      key: "volume",
      value: function (argument10, argument11, argument12) {
        argument10 = parseFloat(argument10);
        if (!isNaN(argument10)) {
          argument10 = Math.max(argument10, 0);
          argument10 = Math.min(argument10, 1);
          this.bar.set("volume", argument10, "width");
          var value23 = (100 * argument10).toFixed(0) + "%";
          this.template.volumeBarWrapWrap.dataset.balloon = value23;
          if (!argument11) {
            this.user.set("volume", argument10);
          }
          if (!argument12) {
            this.notice(this.tran("Volume") + " " + (100 * argument10).toFixed(0) + "%");
          }
          this.video.volume = argument10;
          this.video.muted &&= false;
          this.switchVolumeIcon();
        }
        return this.video.volume;
      }
    }, {
      key: "toggle",
      value: function () {
        if (this.video.paused) {
          this.play();
        } else {
          this.pause();
        }
      }
    }, {
      key: "on",
      value: function (argument13, argument14) {
        this.events.on(argument13, argument14);
      }
    }, {
      key: "switchVideo",
      value: function (argument15, argument16) {
        this.pause();
        this.destroyMediaEngine();
        this.video.poster = argument15.pic ? argument15.pic : "";
        this.video.src = argument15.url;
        this.initMSE(this.video, argument15.type || "auto");
        if (argument16) {
          this.template.danmakuLoading.style.display = "block";
          this.bar.set("played", 0, "width");
          this.bar.set("loaded", 0, "width");
          this.template.ptime.innerHTML = "00:00";
          this.template.danmaku.innerHTML = "";
          if (this.danmaku) {
            this.danmaku.reload({
              id: argument16.id,
              address: argument16.api,
              token: argument16.token,
              maximum: argument16.maximum,
              addition: argument16.addition,
              user: argument16.user
            });
          }
        }
      }
    }, {
      key: "destroyMediaEngine",
      value: function () {
        var engine = this.mediaEngine;
        this.mediaEngine = null;
        if (engine) {
          if (typeof engine.destroy === "function") engine.destroy();
          else if (typeof engine.reset === "function") engine.reset();
        }
      }
    }, {
      key: "initMSE",
      value: function (argument17, type) {
        var self3 = this;
        var source = argument17.src;
        this.destroyMediaEngine();
        if (argument17.src !== source) argument17.src = source;
        this.type = type;
        if (this.options.video.customType && this.options.video.customType[type]) {
          if ("[object Function]" === Object.prototype.toString.call(this.options.video.customType[type])) {
            this.options.video.customType[type](this.video, this);
          } else {
            console.error("Illegal customType: " + type);
          }
        } else {
          if ("auto" === this.type) {
            if (/m3u8(#|\?|$)/i.test(argument17.src) || /blob:/i.test(argument17.src)) {
              this.type = "hls";
            } else if (/.flv(#|\?|$)/i.test(argument17.src)) {
              this.type = "flv";
            } else if (/\.mpd(#|\?|$)/i.test(argument17.src)) {
              this.type = "dash";
            } else {
              this.type = "Video";
            }
          }
          switch (this.type) {
            case "hls":
              // Some browsers advertise partial native HLS support but cannot
              // handle the provider's playlist. Prefer the bundled MSE engine.
              if (typeof Hls !== "undefined" && Hls.isSupported()) {
                  var value24 = this.mediaEngine = new Hls();
                  value24.on(Hls.Events.ERROR, function (event, details) {
                    if (self3.mediaEngine !== value24 || !details.fatal) return;
                    self3.events.trigger("error");
                    self3.notice("HLS 加载失败，请检查视频源与跨域许可");
                  });
                  value24.loadSource(argument17.src);
                  value24.attachMedia(argument17);
              } else if (!argument17.canPlayType("application/vnd.apple.mpegurl")) {
                this.notice("当前浏览器不支持 HLS 播放");
              }
              break;
            case "flv":
              if (typeof flvjs !== "undefined" && flvjs.isSupported()) {
                if (flvjs.isSupported()) {
                  var value25 = this.mediaEngine = flvjs.createPlayer({
                    type: "flv",
                    url: argument17.src
                  });
                  value25.attachMediaElement(argument17);
                  value25.load();
                } else {
                  this.notice("等待视频连接中...");
                }
              } else {
                this.notice("等待视频连接中...");
              }
              break;
            case "dash":
              if (typeof dashjs !== "undefined" && typeof dashjs.MediaPlayer === "function") {
                try {
                  var dashPlayer = this.mediaEngine = dashjs.MediaPlayer().create();
                  dashPlayer.updateSettings({debug: {logLevel: 0}});
                  // Use timing supplied by the video source, without a bundled external clock dependency.
                  dashPlayer.clearDefaultUTCTimingSources();
                  dashPlayer.on(dashjs.MediaPlayer.events.ERROR, function () {
                    if (self3.mediaEngine === dashPlayer) {
                      self3.events.trigger("error");
                      self3.notice("DASH 加载失败，请检查视频源、浏览器编码支持与跨域许可");
                    }
                  });
                  dashPlayer.initialize(argument17, argument17.src, false);
                } catch (_) {
                  this.destroyMediaEngine();
                  this.notice("DASH 初始化失败，请刷新播放器后重试");
                }
              } else {
                this.notice("DASH 播放组件未加载，请刷新后重试");
              }
              break;
            case "webtorrent":
              if (typeof WebTorrent !== "undefined") {
                if (WebTorrent.WEBRTC_SUPPORT) {
                  this.container.classList.add("xplayer-loading");
                  var value26 = new WebTorrent();
                  var src = argument17.src;
                  value26.add(src, function (argument18) {
                    argument18.files.find(function (argument19) {
                      return argument19.name.endsWith(".mp4");
                    }).renderTo(self3.video, {
                      autoplay: self3.options.autoplay
                    }, function () {
                      self3.container.classList.remove("xplayer-loading");
                    });
                  });
                } else {
                  this.notice("等待视频连接中...");
                }
              } else {
                this.notice("等待视频连接中...");
              }
          }
        }
      }
    }, {
      key: "initVideo",
      value: function (argument20, argument21) {
        var self4 = this;
        this.initMSE(argument20, argument21);
        this.on("durationchange", function () {
          if (1 !== argument20.duration) {
            self4.template.dtime.innerHTML = value3.default.secondToTime(argument20.duration);
          }
        });
        this.on("progress", function () {
          var value27 = argument20.buffered.length ? argument20.buffered.end(argument20.buffered.length - 1) / argument20.duration : 0;
          self4.bar.set("loaded", value27, "width");
        });
        this.on("error", function () {
            if (self4.audioReloading) return;
          setTimeout(function () {
            var failure = document.getElementById('link3-error');
            if (failure) failure.style.display = 'block';
          }, 5000);
          if (self4.tran && self4.notice) {
            self4.type;
            self4.notice(self4.tran("This video fails to load"), -1);
          }
        });
        this.ended = false;
        this.on("ended", function () {
          self4.bar.set("played", 1, "width");
          if (self4.setting.loop) {
            self4.seek(0);
            argument20.play();
          } else {
            self4.ended = true;
            self4.pause();
          }
          if (self4.danmaku) {
            self4.danmaku.danIndex = 0;
          }
        });
        this.on("play", function () {
          if (self4.paused) {
            self4.play();
          }
        });
        this.on("pause", function () {
          if (!self4.paused) {
            self4.pause();
          }
        });
        for (var index4 = 0; index4 < this.events.videoEvents.length; index4++) {
          (function (argument22) {
            argument20.addEventListener(self4.events.videoEvents[argument22], function () {
              self4.events.trigger(self4.events.videoEvents[argument22]);
            });
          })(index4);
        }
        this.volume(this.user.get("volume"), true, true);
        if (this.options.subtitle) {
          this.subtitle = new value10.default(this.template.subtitle, this.video, this.options.subtitle, this.events);
          if (!this.user.get("subtitle")) {
            this.subtitle.hide();
          }
        }
      }
    }, {
      key: "switchQuality",
      value: function (qualityIndex) {
        var self5 = this;
        if (this.qualityIndex !== qualityIndex && !this.switchingQuality) {
          var value28 = "3|2|4|1|0".split("|");
          this.qualityIndex = qualityIndex;
          this.switchingQuality = true;
          this.quality = this.options.video.quality[qualityIndex];
          this.template.qualityButton.textContent = this.quality.name;
          var paused = this.video.paused;
          this.video.pause();
          var value29 = (0, value20.default)({
            current: false,
            pic: null,
            screenshot: this.options.screenshot,
            preload: "auto",
            url: this.quality.url,
            subtitle: this.options.subtitle
          });
          var video = new DOMParser().parseFromString(value29, "text/html").body.firstChild;
          this.template.videoWrap.insertBefore(video, this.template.videoWrap.getElementsByTagName("div")[0]);
          this.prevVideo = this.video;
          this.video = video;
          this.initVideo(this.video, this.quality.type || this.options.video.type);
          this.seek(this.prevVideo.currentTime);
          this.notice(this.tran("Switching to") + " " + this.quality.name + " " + this.tran("quality"), -1);
          this.events.trigger("quality_start", this.quality);
          this.on("canplay", function () {
            if (self5.prevVideo) {
              if (self5.video.currentTime !== self5.prevVideo.currentTime) {
                self5.seek(self5.prevVideo.currentTime);
                return;
              }
              self5.template.videoWrap.removeChild(self5.prevVideo);
              self5.video.classList.add("xplayer-video-current");
              if (!paused) {
                self5.video.play();
              }
              self5.prevVideo = null;
              self5.notice(self5.tran("Switched to") + " " + self5.quality.name + " " + self5.tran("quality"));
              self5.switchingQuality = false;
              self5.events.trigger("quality_end");
            }
          });
        }
      }
    }, {
      key: "notice",
      value: function (argument23) {
        var self6 = this;
        var value30 = arguments.length > 1 && undefined !== arguments[1] ? arguments[1] : 2000;
        var value31 = arguments.length > 2 && undefined !== arguments[2] ? arguments[2] : 0.8;
        this.template.notice.textContent = argument23;
        this.template.notice.style.opacity = value31;
        if (this.noticeTime) {
          clearTimeout(this.noticeTime);
        }
        this.events.trigger("notice_show", argument23);
        this.noticeTime = setTimeout(function () {
          self6.template.notice.style.opacity = 0;
          self6.events.trigger("notice_hide");
        }, value30);
      }
    }, {
      key: "resize",
      value: function () {
        if (this.danmaku) {
          this.danmaku.resize();
        }
        this.events.trigger("resize");
      }
    }, {
      key: "speed",
      value: function (argument24) {
        this.video.playbackRate = argument24;
      }
    }, {
      key: "destroy",
      value: function () {
        this.destroyMediaEngine();
        if (this.danmaku) this.danmaku.destroyed = true;
        items.splice(items.indexOf(this), 1);
        this.pause();
        this.controller.destroy();
        this.time.destroy();
        this.video.src = "";
        this.container.innerHTML = "";
        this.events.trigger("destroy");
        for (var value32 in this) {
          if (this.hasOwnProperty(value32) && "paused" !== value32) {
            delete this[value32];
          }
        }
      }
    }]);
    return Player;
  }();
  exports.default = PlayerExport;
},
/* Recovered original module 8: promise-polyfill. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 9: timers-polyfill. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 10: immediate-polyfill. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 11: browser-process. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 12: options. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (argument) {
    return typeof argument;
  } : function (argument2) {
    if (argument2 && "function" == typeof Symbol && argument2.constructor === Symbol && argument2 !== Symbol.prototype) {
      return "symbol";
    } else {
      return typeof argument2;
    }
  };
  var danmakuApiModule = requireModule(13);
  var value2 = function (argument3) {
    if (argument3 && argument3.__esModule) {
      return argument3;
    } else {
      return {
        default: argument3
      };
    }
  }(danmakuApiModule);
  exports.default = function (argument4) {
    var options = {
      container: argument4.element || document.getElementsByClassName("xplayer")[0],
      live: false,
      autoplay: false,
      theme: "#b7daff",
      loop: false,
      lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
      screenshot: false,
      hotkey: true,
      preload: "auto",
      volume: 0.7,
      apiBackend: value2.default,
      video: {},
      contextmenu: [],
      mutex: true
    };
    for (var value3 in options) {
      if (options.hasOwnProperty(value3) && !argument4.hasOwnProperty(value3)) {
        argument4[value3] = options[value3];
      }
    }
    if (argument4.video && !argument4.video.type) {
      argument4.video.type = "auto";
    }
    if ("object" === value(argument4.danmaku) && argument4.danmaku && !argument4.danmaku.user) {
      argument4.danmaku.user = "XGGM";
    }
    if (argument4.subtitle) {
      if (!argument4.subtitle.type) {
        argument4.subtitle.type = "webvtt";
      }
      if (!argument4.subtitle.fontSize) {
        argument4.subtitle.fontSize = "20px";
      }
      if (!argument4.subtitle.bottom) {
        argument4.subtitle.bottom = "40px";
      }
      if (!argument4.subtitle.color) {
        argument4.subtitle.color = "#fff";
      }
    }
    if (argument4.video.quality) {
      argument4.video.url = [argument4.video.quality[argument4.video.defaultQuality].url];
    }
    argument4.lang &&= argument4.lang.toLowerCase();
    argument4.contextmenu = argument4.contextmenu.concat(rightmenuArr);
    return argument4;
  };
},
/* Recovered original module 13: danmaku-api. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 14: localization. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(lang) {
    var self = this;
    this.lang = lang;
    this.tran = function (argument) {
      if (options[self.lang] && options[self.lang][argument]) {
        return options[self.lang][argument];
      } else {
        return argument;
      }
    };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var options = {
    "zh-cn": {
      "Danmaku is loading": " ",
      Top: "顶部",
      Bottom: "底部",
      Rolling: "滚动",
      "Input danmaku, hit Enter": "发个弹幕见证当下",
      "About author": "关于作者",
      "xplayer feedback": "播放器意见反馈",
      "About xplayer": "关于 xplayer 播放器",
      Loop: "洗脑循环",
      Speed: "速度",
      "Opacity for danmaku": "弹幕透明度",
      Normal: "正常",
      "Please input danmaku content!": "要输入弹幕内容啊喂！",
      "Set danmaku color": "弹幕颜色",
      "Set danmaku type": "弹幕模式",
      "Show danmaku": "显示弹幕",
      "This video fails to load": "视频加载失败",
      "Switching to": "正在切换至",
      "Switched to": "已经切换至",
      quality: "画质",
      FF: "快进",
      REW: "快退",
      "Unlimited danmaku": "海量弹幕",
      "Send danmaku": "发送弹幕",
      Setting: "设置",
      "Full screen": "全屏",
      "Web full screen": "页面全屏",
      Send: "发送",
      Screenshot: "截图",
      s: "秒",
      "Show subtitle": "显示字幕",
      "Hide subtitle": "隐藏字幕",
      Volume: "音量",
      Live: "直播",
      "Video info": "视频统计信息"
    },
    "zh-tw": {
      "Danmaku is loading": " ",
      Top: "頂部",
      Bottom: "底部",
      Rolling: "滾動",
      "Input danmaku, hit Enter": "輸入彈幕，Enter 發送",
      "About author": "關於作者",
      "xplayer feedback": "播放器意見反饋",
      "About xplayer": "關於 xplayer 播放器",
      Loop: "循環播放",
      Speed: "速度",
      "Opacity for danmaku": "彈幕透明度",
      Normal: "正常",
      "Please input danmaku content!": "請輸入彈幕内容啊！",
      "Set danmaku color": "設置彈幕顏色",
      "Set danmaku type": "設置彈幕類型",
      "Show danmaku": "顯示彈幕",
      "This video fails to load": "視頻加載失敗",
      "Switching to": "正在切換至",
      "Switched to": "已經切換至",
      quality: "畫質",
      FF: "快進",
      REW: "快退",
      "Unlimited danmaku": "海量彈幕",
      "Send danmaku": "發送彈幕",
      Setting: "設置",
      "Full screen": "全屏",
      "Web full screen": "頁面全屏",
      Send: "發送",
      Screenshot: "截圖",
      s: "秒",
      "Show subtitle": "顯示字幕",
      "Hide subtitle": "隱藏字幕",
      Volume: "音量",
      Live: "直播",
      "Video info": "視頻統計信息"
    }
  };
  exports.default = helper;
},
/* Recovered original module 15: template. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index = 0; index < argument5.length; index++) {
        var value5 = argument5[index];
        value5.enumerable = value5.enumerable || false;
        value5.configurable = true;
        if ("value" in value5) {
          value5.writable = true;
        }
        Object.defineProperty(argument4, value5.key, value5);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var iconsModule = requireModule(2);
  var value2 = helper(iconsModule);
  var playerTemplateModule = requireModule(32);
  var value3 = helper(playerTemplateModule);
  var TemplateExport = function () {
    function Template(argument9) {
      helper2(this, Template);
      this.container = argument9.container;
      this.options = argument9.options;
      this.index = argument9.index;
      this.tran = argument9.tran;
      this.init();
    }
    value(Template, [{
      key: "init",
      value: function () {
        this.container.innerHTML = (0, value3.default)({
          options: this.options,
          index: this.index,
          tran: this.tran,
          icons: value2.default,
          video: {
            current: true,
            pic: this.options.video.pic,
            screenshot: this.options.screenshot,
            preload: this.options.preload,
            url: this.options.video.url,
            subtitle: this.options.subtitle
          }
        });
        this.volumeBar = this.container.querySelector(".xplayer-volume-bar-inner");
        this.volumeBarWrap = this.container.querySelector(".xplayer-volume-bar");
        this.volumeBarWrapWrap = this.container.querySelector(".xplayer-volume-bar-wrap");
        this.volumeButton = this.container.querySelector(".xplayer-volume");
        this.volumeIcon = this.container.querySelector(".xplayer-volume-icon .xplayer-icon-content");
        this.playedBar = this.container.querySelector(".xplayer-played");
        this.loadedBar = this.container.querySelector(".xplayer-loaded");
        this.playedBarWrap = this.container.querySelector(".xplayer-bar-wrap");
        this.playedBarTime = this.container.querySelector(".xplayer-bar-time");
        this.danmaku = this.container.querySelector(".xplayer-danmaku");
        this.danmakuLoading = this.container.querySelector(".xplayer-danloading");
        this.video = this.container.querySelector(".xplayer-video-current");
        this.bezel = this.container.querySelector(".xplayer-bezel-icon");
        this.playButton = this.container.querySelector(".xplayer-play-icon");
        this.videoWrap = this.container.querySelector(".xplayer-video-wrap");
        this.controllerMask = this.container.querySelector(".xplayer-controller-mask");
        this.ptime = this.container.querySelector(".xplayer-ptime");
        this.settingButton = this.container.querySelector(".xplayer-setting-icon");
        this.settingBox = this.container.querySelector(".xplayer-setting-box");
        this.mask = this.container.querySelector(".xplayer-mask");
        this.loop = this.container.querySelector(".xplayer-setting-loop");
        this.loopToggle = this.container.querySelector(".xplayer-setting-loop .xplayer-toggle-setting-input");
        this.showDanmaku = this.container.querySelector(".xplayer-setting-showdan");
        this.showDanmakuToggle = this.container.querySelector(".xplayer-showdan-setting-input");
        this.unlimitDanmaku = this.container.querySelector(".xplayer-setting-danunlimit");
        this.unlimitDanmakuToggle = this.container.querySelector(".xplayer-danunlimit-setting-input");
        this.speed = this.container.querySelector(".xplayer-setting-speed");
        this.speedItem = this.container.querySelectorAll(".xplayer-setting-speed-item");
        this.danmakuOpacityBar = this.container.querySelector(".xplayer-danmaku-bar-inner");
        this.danmakuOpacityBarWrap = this.container.querySelector(".xplayer-danmaku-bar");
        this.danmakuOpacityBarWrapWrap = this.container.querySelector(".xplayer-danmaku-bar-wrap");
        this.danmakuOpacityBox = this.container.querySelector(".xplayer-setting-danmaku");
        this.dtime = this.container.querySelector(".xplayer-dtime");
        this.controller = this.container.querySelector(".xplayer-controller");
        this.commentInput = this.container.querySelector(".xplayer-comment-input");
        this.commentButton = this.container.querySelector(".xplayer-comment-icon");
        this.yzmcomment = this.container.querySelector(".yzm-xplayer-comment-input");
        this.commentSettingBox = this.container.querySelector(".xplayer-comment-setting-box");
        this.commentSettingButton = this.container.querySelector(".xplayer-comment-setting-icon");
        this.sendStyleButton = this.container.querySelector(".xplayer-send-style-icon");
        this.danmakuDisplayBox = this.container.querySelector(".xplayer-danmaku-display-box");
        this.commentSettingFill = this.container.querySelector(".xplayer-send-style-icon span");
        this.commentSendButton = this.container.querySelector(".xplayer-send-icon");
        this.commentSendFill = this.container.querySelector(".xplayer-send-icon path");
        this.commentColorSettingBox = this.container.querySelector(".xplayer-comment-setting-color");
        this.browserFullButton = this.container.querySelector(".xplayer-full-icon");
        this.webFullButton = this.container.querySelector(".xplayer-full-in-icon");
        this.menu = this.container.querySelector(".xplayer-menu");
        this.menuItem = this.container.querySelectorAll(".xplayer-menu-item");
        this.qualityList = this.container.querySelector(".xplayer-quality-list");
        this.camareButton = this.container.querySelector(".xplayer-camera-icon");
        this.subtitleButton = this.container.querySelector(".xplayer-subtitle-icon");
        this.subtitleButtonInner = this.container.querySelector(".xplayer-subtitle-icon .xplayer-icon-content");
        this.subtitle = this.container.querySelector(".xplayer-subtitle");
        this.qualityButton = this.container.querySelector(".xplayer-quality-icon");
        this.barPreview = this.container.querySelector(".xplayer-bar-preview");
        this.barWrap = this.container.querySelector(".xplayer-bar-wrap");
        this.notice = this.container.querySelector(".xplayer-notice");
        this.infoPanel = this.container.querySelector(".xplayer-info-panel");
        this.infoPanelClose = this.container.querySelector(".xplayer-info-panel-close");
        this.infoVersion = this.container.querySelector(".xplayer-info-panel-item-version .xplayer-info-panel-item-data");
        this.infoFPS = this.container.querySelector(".xplayer-info-panel-item-fps .xplayer-info-panel-item-data");
        this.infoSpeed = this.container.querySelector(".xplayer-info-panel-item-speed .xplayer-info-panel-item-data");
        this.infoType = this.container.querySelector(".xplayer-info-panel-item-type .xplayer-info-panel-item-data");
        this.infoUrl = this.container.querySelector(".xplayer-info-panel-item-url .xplayer-info-panel-item-data");
        this.infoResolution = this.container.querySelector(".xplayer-info-panel-item-resolution .xplayer-info-panel-item-data");
        this.infoDuration = this.container.querySelector(".xplayer-info-panel-item-duration .xplayer-info-panel-item-data");
        this.infoDanmakuId = this.container.querySelector(".xplayer-info-panel-item-danmaku-id .xplayer-info-panel-item-data");
        this.infoDanmakuApi = this.container.querySelector(".xplayer-info-panel-item-danmaku-api .xplayer-info-panel-item-data");
        this.infoDanmakuAmount = this.container.querySelector(".xplayer-info-panel-item-danmaku-amount .xplayer-info-panel-item-data");
      }
    }]);
    return Template;
  }();
  exports.default = TemplateExport;
},
/* Recovered original module 16: fullscreen-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M17.982 9.275L8.06 3.27A2.013 2.013 0 005 4.994v12.011a2.017 2.017 0 003.06 1.725l9.922-6.005a2.017 2.017 0 000-3.45z\"></path></svg>";
},
/* Recovered original module 17: web-fullscreen-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M7 3a2 2 0 00-2 2v12a2 2 0 104 0V5a2 2 0 00-2-2zM15 3a2 2 0 00-2 2v12a2 2 0 104 0V5a2 2 0 00-2-2z\"></path></svg>";
},
/* Recovered original module 18: volume-down-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M10.188 4.65L6 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39V5.04a.498.498 0 00-.812-.39zM14.446 3.778a1 1 0 00-.862 1.804 6.002 6.002 0 01-.007 10.838 1 1 0 00.86 1.806A8.001 8.001 0 0019 11a8.001 8.001 0 00-4.554-7.222z\"></path><path d=\"M15 11a3.998 3.998 0 00-2-3.465v6.93A3.998 3.998 0 0015 11z\"></path></svg>";
},
/* Recovered original module 19: volume-off-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M10.188 4.65L6 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39V5.04a.498.498 0 00-.812-.39zM14.446 3.778a1 1 0 00-.862 1.804 6.002 6.002 0 01-.007 10.838 1 1 0 00.86 1.806A8.001 8.001 0 0019 11a8.001 8.001 0 00-4.554-7.222z\"></path><path d=\"M15 11a3.998 3.998 0 00-2-3.465v6.93A3.998 3.998 0 0015 11z\"></path></svg>";
},
/* Recovered original module 20: volume-up-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M15 11a3.998 3.998 0 00-2-3.465v2.636l1.865 1.865A4.02 4.02 0 0015 11z\"></path><path d=\"M13.583 5.583A5.998 5.998 0 0117 11a6 6 0 01-.585 2.587l1.477 1.477a8.001 8.001 0 00-3.446-11.286 1 1 0 00-.863 1.805zM18.778 18.778l-2.121-2.121-1.414-1.414-1.415-1.415L13 13l-2-2-3.889-3.889-3.889-3.889a.999.999 0 10-1.414 1.414L5.172 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39v-3.131l2.587 2.587-.01.005a1 1 0 00.86 1.806c.215-.102.424-.214.627-.333l2.3 2.3a1.001 1.001 0 001.414-1.416zM11 5.04a.5.5 0 00-.813-.39L8.682 5.854 11 8.172V5.04z\"></path></svg>";
},
/* Recovered original module 21: comment-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 1024 1024\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M172.76790012 458.3867064c-16.56714924 0-30.76756226-13.41150166-30.76756226-30.76756226V276.93697895C142.00033786 205.93491169 182.23484286 163.33367119 249.29235047 163.33367119h148.31542969c16.56714924 0 30.76756226 13.41150166 30.76756298 30.76756226s-13.41150166 30.76756226-30.76756298 30.76756228H250.08126254c-28.40082677 0-46.54579943 8.67803065-46.54580015 52.8570953v150.68216519c0 15.77823717-14.20041374 29.97865091-30.76756227 29.97865018z m597.99518975 441.79064149H622.44766018c-16.56714924 0-29.97865091-13.41150166-29.97865019-29.97865019s13.41150166-29.97865091 29.97865019-29.9786509h148.31542969c28.40082677 0 46.54579943-8.67803065 46.54580016-52.85709459V635.89187494c0-16.56714924 13.41150166-29.97865091 29.97865019-29.97865019s29.97865091 13.41150166 29.97865092 29.97865019v150.68216518c0.78891208 71.00206727-39.44559292 113.60330777-106.50310127 113.60330777z\" id=\"xplayer-full\"></path></svg>";
},
/* Recovered original module 22: comment-off-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg id=\"yemian\"xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M18 4H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM8 15.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V14h1.5a.5.5 0 01.5.5v1zm0-8a.5.5 0 01-.5.5H6v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1zm10 8a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H16v-1.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v3zm0-6a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V8h-1.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3z\"></path></svg><svg id=\"tuichuuyemian\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M18 4H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM8 15.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V14H4.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3zm0-6a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H6V6.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v3zm10 4a.5.5 0 01-.5.5H16v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1zm0-4a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V8h1.5a.5.5 0 01.5.5v1z\"></path></svg>";
},
/* Recovered original module 23: send-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><circle cx=\"11\" cy=\"11\" r=\"2\"></circle><path d=\"M19.164 8.861L17.6 8.6a6.978 6.978 0 00-1.186-2.099l.574-1.533a1 1 0 00-.436-1.217l-1.997-1.153a1.001 1.001 0 00-1.272.23l-1.008 1.225a7.04 7.04 0 00-2.55.001L8.716 2.829a1 1 0 00-1.272-.23L5.447 3.751a1 1 0 00-.436 1.217l.574 1.533A6.997 6.997 0 004.4 8.6l-1.564.261A.999.999 0 002 9.847v2.306c0 .489.353.906.836.986l1.613.269a7 7 0 001.228 2.075l-.558 1.487a1 1 0 00.436 1.217l1.997 1.153c.423.244.961.147 1.272-.23l1.04-1.263a7.089 7.089 0 002.272 0l1.04 1.263a1 1 0 001.272.23l1.997-1.153a1 1 0 00.436-1.217l-.557-1.487c.521-.61.94-1.31 1.228-2.075l1.613-.269a.999.999 0 00.835-.986V9.847a.999.999 0 00-.836-.986zM11 15a4 4 0 110-8 4 4 0 010 8z\"></path></svg>";
},
/* Recovered original module 24: arrow-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 32 32\"><path d=\"M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z\"></path></svg>";
},
/* Recovered original module 25: settings-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 1024 1024\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M634.307692 358.53846172H341.23076914c-24.23076943 0-45-19.61538487-45-45S315.84615401 269.69230742 341.23076914 269.69230742h293.07692285c24.23076943 0 43.84615342 19.61538487 43.84615429 45s-19.61538487 43.84615342-43.84615429 43.8461543z m-74.99999971 159.23076943c0-24.23076943-19.61538487-45-45-45H328.53846113c-24.23076943 0-45 19.61538487-45 45s19.61538487 45 45 45h186.92307773c24.23076943-1.15384658 43.84615342-20.76923057 43.84615343-45zM520.07692344 835.07692344c0-23.07692285-18.46153828-42.69230771-42.69230772-42.69230771H252.38461573c-54.23076914 0-96.92307685-47.30769229-96.92307686-106.15384688v-426.92307627c0-58.84615371 43.84615342-106.15384599 96.92307685-106.153846h630c54.23076914 0 96.92307685 47.30769229 96.92307686 106.153846v94.61538456c0 23.07692285 18.46153828 42.69230771 42.69230771 42.69230773s42.69230771-18.46153828 42.69230772-42.69230773v-94.61538456C1064.69230801 154.30769229 982.76923057 68.92307685 882.38461573 68.92307685H252.38461573C153.15384658 68.92307685 71.23076914 154.30769229 71.23076914 259.30769258v428.07692285c0 105.00000029 81.92307656 190.38461573 181.15384658 190.38461572H477.38461573c24.23076943 0 42.69230771-19.61538487 42.69230771-42.69230771z m323.07692255-521.53846172c0-27.69230742-23.07692285-50.76923115-50.76923026-50.76923115s-50.76923115 23.07692285-50.76923116 50.76923115 23.07692285 50.76923115 50.76923116 50.76923028c28.84615401 0 50.76923115-23.07692285 50.76923026-50.76923028m255.00000059 377.3076917c0-148.84615372-121.15384629-270-268.84615429-270S559.30769229 541.99999971 559.30769229 690.84615342s121.15384629 268.84615342 270 268.84615429 268.84615342-119.99999971 268.84615429-268.84615429z m-87.69230772 0c0 99.23076914-80.76923086 181.15384658-181.15384657 181.15384658s-181.15384658-80.76923086-181.15384571-181.15384658 80.76923086-180 181.15384571-180 181.15384658 80.76923086 181.15384657 180z m-167.30769287 114.23076944l170.76923086-184.61538458c15.00000029-16.15384599 13.84615371-41.53846114-2.30769228-56.53846143-16.15384599-15.00000029-41.53846114-13.84615371-56.53846142 2.30769229L807.38461513 724.307692 731.23076885 672.38461513c-18.46153828-12.69230801-42.69230771-8.07692344-55.38461484 10.38461573-12.69230801 18.46153828-8.07692344 42.69230771 10.38461484 55.38461572l106.15384687 72.69230743c6.92307685 4.61538457 15.00000029 6.92307685 23.07692285 6.92307685 9.23076914 0 19.61538487-4.61538457 27.69230742-12.69230801z\" id=\"xplayer-comment\"></path></svg>";
},
/* Recovered original module 26: palette-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 32 32\"><path d=\"M27.090 0.131h-22.731c-2.354 0-4.262 1.839-4.262 4.109v16.401c0 2.269 1.908 4.109 4.262 4.109h4.262v-2.706h8.469l-8.853 8.135 1.579 1.451 7.487-6.88h9.787c2.353 0 4.262-1.84 4.262-4.109v-16.401c0-2.27-1.909-4.109-4.262-4.109v0zM28.511 19.304c0 1.512-1.272 2.738-2.841 2.738h-8.425l-0.076-0.070-0.076 0.070h-11.311c-1.569 0-2.841-1.226-2.841-2.738v-13.696c0-1.513 1.272-2.739 2.841-2.739h19.889c1.569 0 2.841-0.142 2.841 1.37v15.064z\"></path></svg>";
},
/* Recovered original module 27: camera-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 1048 1024\"><path d=\"M675.48206831 405.43059956c-21.34102395 0-38.61709113-17.27606717-38.61709114-38.61709114 0-21.34102395 17.27606717-38.61709113 38.61709113-38.6170903s38.61709113 17.27606717 38.6170903 38.6170903c0 21.34102395-17.27606717 38.61709113-38.6170903 38.61709114M825.88547437 93.44515543c-1.0162392 0-3.04871759 1.0162392-4.06495679 1.0162392L171.42740857 347.50496286c-32.51965512 9.14615277-57.92563586 35.56837271-67.07178864 68.08802865-9.14615277 34.55213351 0 69.10426785 25.40598074 94.5102486 5.08119598 5.08119598 11.17863116 8.12991357 18.29230555 10.1623928L284.22996353 557.86648401l104.67264139 30.48717673c48.77948309-45.7307655 144.30597089-134.14357891 159.54955883-148.37092768 15.24358878-15.24358878 39.63333032-15.24358878 54.87691911 0 15.24358878 15.24358878 15.24358878 39.63333032 0 54.87691911-18.29230637 18.29230637-132.11110052 123.98118613-157.51708127 147.35468847L498.65644147 883.06303852c2.03247839 7.11367438 5.08119598 14.22734958 10.16239279 19.30854556 18.29230637 18.29230637 42.68204792 28.45469834 69.10426703 28.45469833 8.12991357 0 17.27606717-1.0162392 25.40598157-3.04871759 33.53589431-9.14615277 58.94187506-33.53589431 68.08802783-66.05555026L943.76922531 218.44258075c1.0162392-2.03247839 1.0162392-3.04871759 2.0324784-5.08119598 9.14615277-34.55213351 0-69.10426785-25.40598074-94.5102486C894.98974222 94.46139462 860.43760788 84.29900183 825.88547437 93.44515543z\"></path></svg>";
},
/* Recovered original module 28: loading-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M16.5 8c1.289 0 2.49.375 3.5 1.022V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h7.022A6.5 6.5 0 0116.5 8zM7 13H5a1 1 0 010-2h2a1 1 0 010 2zm2-4H5a1 1 0 010-2h4a1 1 0 010 2z\"></path><path d=\"M20.587 13.696l-.787-.131a3.503 3.503 0 00-.593-1.051l.301-.804a.46.46 0 00-.21-.56l-1.005-.581a.52.52 0 00-.656.113l-.499.607a3.53 3.53 0 00-1.276 0l-.499-.607a.52.52 0 00-.656-.113l-1.005.581a.46.46 0 00-.21.56l.301.804c-.254.31-.456.665-.593 1.051l-.787.131a.48.48 0 00-.413.465v1.209a.48.48 0 00.413.465l.811.135c.144.382.353.733.614 1.038l-.292.78a.46.46 0 00.21.56l1.005.581a.52.52 0 00.656-.113l.515-.626a3.549 3.549 0 001.136 0l.515.626a.52.52 0 00.656.113l1.005-.581a.46.46 0 00.21-.56l-.292-.78c.261-.305.47-.656.614-1.038l.811-.135A.48.48 0 0021 15.37v-1.209a.48.48 0 00-.413-.465zM16.5 16.057a1.29 1.29 0 11.002-2.582 1.29 1.29 0 01-.002 2.582z\"></path></svg>";
},
/* Recovered original module 29: subtitle-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 32 32\"><path d=\"M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z\"></path></svg>";
},
/* Recovered original module 30: play-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 32 32\"><path d=\"M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z\"></path></svg>";
},
/* Recovered original module 31: pause-icon. Bindings renamed by scope, not rewritten. */
function (module, exports) {
  module.exports = "<svg version=\"1.1\" viewBox=\"0 0 22 22\"><svg x=\"7\" y=\"1\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-0\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"11\" y=\"3\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-1\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"13\" y=\"7\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-2\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"11\" y=\"11\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-3\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"7\" y=\"13\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-4\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"3\" y=\"11\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-5\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"1\" y=\"7\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-6\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg><svg x=\"3\" y=\"3\"><circle class=\"diplayer-loading-dot diplayer-loading-dot-7\" cx=\"4\" cy=\"4\" r=\"2\"></circle></svg></svg>";
},
/* Recovered original module 32: player-template. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  var options = {
    DnvNA: function (argument, argument2) {
      return argument === argument2;
    },
    MZEXF: "nnQXg",
    UsVWr: "nMwXA",
    DmeOa: "\n                    <div class=\"xplayer-quality-item\" data-index=\"",
    LMepc: function (argument3, argument4) {
      return argument3(argument4);
    },
    XWONh: "</div>\n                ",
    IiQUL: function (argument5, argument6) {
      return argument5 === argument6;
    },
    pREAs: "KQhZe",
    uDTrm: "xplayer-subtitle-hide",
    buEaa: "subtitle_show",
    EdeUu: "\n        <div class=\"xplayer-menu-item\">\n            <a href=\"",
    ikxhA: function (argument7, argument8) {
      return argument7(argument8);
    },
    FDsFC: "javascript:void(0);",
    TIeCA: function (argument9, argument0) {
      return argument9(argument0);
    },
    oIFJH: function (argument1, argument10) {
      return argument1(argument10);
    },
    NEUlw: "</a>\n        </div>\n    ",
    SzmwC: function (argument11, argument12) {
      return argument11 || argument12;
    },
    XNRyn: "<div id=\"loading-box\"><div class=\"loading\"><p class=\"pic\"></p><div class=\"tips\"></div></div><div type=\"button\" id=\"close\" ><div class=\"playlink\"><span id=\"link1\">播放器连接...</span><span id=\"link1-success\">【完成】</span></div><div class=\"dmlink\"><span id=\"link2\">弹幕连接中...</span><span id=\"link2-success\">【完成】</span><span id=\"link2-error\">【失败】</span></div><span class=\"palycon\" id=\"link3\"><e id=\"link3_tip\">等待视频连接中</e><e id=\"link3-error\">【失败】</e><!--d class=\"wait\"><e id=\"span\">3</e>s</d--></span></div></div><div class=\"xplayer-mask\"></div>\n<div class=\"xplayer-cplayer\"><div class=\"xplayer-showing\"><svg aria-hidden=\"true\"><use xlink:href=\"#icon-play\"></use></svg></div><div class=\"vod-title\"><div id=\"landing-title\" class=\"video-info\"><ul class=\"u-title\"><a id=\"vodlink\" href=\"\" target=\"_blank\" ><span class=\"iconfont icon-back\"></span></a><a id=\"vodtitle\"><span></span></a></ul></div></div></div><div class=\"xplayer-video-wrap\">\n    ",
    mAqNF: function (argument13, argument14) {
      return argument13(argument14);
    },
    yreJy: "\n    ",
    woFng: "\n    <div class=\"xplayer-logo\">\n        <img src=\"",
    ktOfO: function (argument15, argument16) {
      return argument15(argument16);
    },
    JIWef: "\">\n    </div>\n    ",
    JMlTp: "\n    <div class=\"xplayer-danmaku\"",
    XDvQK: " style=\"margin-bottom:",
    cNwWb: function (argument17, argument18) {
      return argument17(argument18);
    },
    kpwaK: ">\n        <div class=\"xplayer-danmaku-item xplayer-danmaku-item--demo\"></div>\n    </div>\n    <div class=\"xplayer-subtitle\"></div>\n    <div class=\"xplayer-bezel\">\n        <span class=\"xplayer-bezel-icon\"></span>\n        ",
    lxsUi: "\n <span class=\"xplayer-danloading\">",
    JtuhP: function (argument19, argument20) {
      return argument19(argument20);
    },
    dlRbU: "Danmaku is loading",
    EOfHO: "</span>\n  ",
    xYMGF: "\n        <span class=\"diplayer-loading-icon\">",
    IDihA: "</span>\n    </div>\n</div>\n<div class=\"xplayer-controller-mask\"></div>\n<div class=\"xplayer-controller\">\n  <div class=\"controller-box\">\n   <div class=\"xplayer-icons xplayer-icons-left\">\n        <button class=\"xplayer-icon xplayer-play-icon\">\n            <span class=\"xplayer-icon-content\">",
    whDwC: "</span>\n        </button>\n    <button onclick=\"XGGM.video.next();\" class=\"xplayer-icon  icon-xj\" data-balloon=\"下一集\" data-balloon-pos=\"up\">\n<span class=\"xplayer-icon-content\"><svg aria-hidden=\"true\" fill=\"#fff\"><use xlink:href=\"#icon-play-xj\"></use></svg></span></button>\n    <div class=\"xplayer-volume\">\n            <button class=\"xplayer-icon xplayer-volume-icon\">\n                <span class=\"xplayer-icon-content\">",
    noqHh: "</span>\n            </button>\n            <div class=\"xplayer-volume-bar-wrap\" data-balloon-pos=\"up\">\n                <div class=\"xplayer-volume-bar\">\n                    <div class=\"xplayer-volume-bar-inner\" style=\"background: ",
    wJQBs: function (argument21, argument22) {
      return argument21(argument22);
    },
    vzbeo: ";\">\n                        <span class=\"xplayer-thumb\" style=\"background: ",
    hEHWa: function (argument23, argument24) {
      return argument23(argument24);
    },
    hPpDg: "\"></span>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <span class=\"xplayer-time\">\n            <span class=\"xplayer-ptime\">0:00</span> /\n            <span class=\"xplayer-dtime\">0:00</span>\n        </span>\n        ",
    iGZIh: "\n        <span class=\"xplayer-live-badge\"><span class=\"xplayer-live-dot\" style=\"background: ",
    saolT: ";\"></span>",
    QrSgM: "Live",
    lLcXC: "</span>\n        ",
    nZHCE: "\n    </div>\n    <div class=\"xplayer-icons xplayer-icons-right\">\n        ",
    sGBrI: "\n        <div class=\"xplayer-quality\">\n            <button class=\"xplayer-icon xplayer-quality-icon\">",
    WPDOO: function (argument25, argument26) {
      return argument25(argument26);
    },
    mWqwf: "</button>\n            <div class=\"xplayer-quality-mask\">\n                <div class=\"xplayer-quality-list\"></div>\n                ",
    MYeVt: function (argument27, argument28, argument29) {
      return argument27(argument28, argument29);
    },
    xxxbT: "\n                </div>\n            </div>\n        </div>\n        ",
    tIOhl: "\n        ",
    gXAhR: "\n        <a href=\"#\" class=\"xplayer-icon xplayer-camera-icon\" data-balloon=\"",
    wAyHD: "Screenshot",
    UFycL: "\" data-balloon-pos=\"up\">\n            <span class=\"xplayer-icon-content\">",
    GCKKa: "</span>\n        </a>\n        ",
    uYwik: "\n        <div class=\"xplayer-comment\">\n            <button class=\"xplayer-icon xplayer-comment-icon\" data-balloon=\"",
    FwYtL: "Send danmaku",
    cIhZp: "\" data-balloon-pos=\"up\">\n                <span class=\"xplayer-icon-content\">",
    gGjNu: "</span>\n            </button>\n        </div>\n        ",
    dSbRh: "\n        <div class=\"xplayer-subtitle-btn\">\n            <button class=\"xplayer-icon xplayer-subtitle-icon\" data-balloon=\"",
    uiPdL: "Hide subtitle",
    tqfOQ: "\n        <div class=\"xplayer-setting\"><button class=\"xplayer-icon xplayer-list-icon\" data-balloon=\"弹幕列表\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 32 32\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z\" id=\"xplayer-full-in\"></path></svg></span></button>\n            <button class=\"xplayer-icon xplayer-setting-icon\" data-balloon=\"",
    iRlhQ: function (argument30, argument31) {
      return argument30(argument31);
    },
    rfsdt: "Setting",
    iJrrT: "</span>\n            </button>\n            <div class=\"xplayer-setting-box\">\n                <div class=\"xplayer-setting-origin-panel\">\n                    <div class=\"xplayer-setting-item xplayer-setting-speed\">\n                        <span class=\"xplayer-label\">",
    kwojc: function (argument32, argument33) {
      return argument32(argument33);
    },
    hfNsi: "Speed",
    YhOpr: "</span>\n                        <div class=\"xplayer-toggle\">",
    LCQJL: "</div>\n                    </div>\n                    <div class=\"xplayer-setting-item xplayer-setting-loop\">\n                        <span class=\"xplayer-label\">",
    igUiB: function (argument34, argument35) {
      return argument34(argument35);
    },
    HlnLu: "Loop",
    hXVPG: "</span>\n                        <div class=\"xplayer-toggle\">\n                            <input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\">\n                            <label for=\"xplayer-toggle\"></label>\n                        </div>\n                    </div><div class=\"xplayer-setting-item xplayer-setting-jlast\"><span class=\"xplayer-label\">跳过片尾 <span class=\"xplayer-skip-time\"><input id=\"jumptime\" inputmode=\"numeric\" aria-label=\"跳过片尾时长（秒）\" placeholder=\"0\"><span class=\"xplayer-skip-time-unit\" aria-hidden=\"true\">秒</span></span></span><div class=\"xplayer-toggle\"><input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\"><label for=\"xplayer-toggle\"></label></div></div><div class=\"xplayer-setting-item xplayer-setting-jfrist\"><span class=\"xplayer-label\">跳过片头 <span class=\"xplayer-skip-time\"><input id=\"fristtime\" inputmode=\"numeric\" aria-label=\"跳过片头时长（秒）\" placeholder=\"0\"><span class=\"xplayer-skip-time-unit\" aria-hidden=\"true\">秒</span></span></span><div class=\"xplayer-toggle\"><input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\"><label for=\"xplayer-toggle\"></label></div></div>\n             </div>\n                <div class=\"xplayer-setting-speed-panel\">\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"0.5\">\n                        <span class=\"xplayer-label\">0.5</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"0.75\">\n                        <span class=\"xplayer-label\">0.75</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1\">\n                        <span class=\"xplayer-label\">",
    MEcDJ: function (argument36, argument37) {
      return argument36(argument37);
    },
    eCnNB: "Normal",
    mYVnf: "</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1.25\">\n                        <span class=\"xplayer-label\">1.25</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1.5\">\n                        <span class=\"xplayer-label\">1.5</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"2\">\n                        <span class=\"xplayer-label\">2</span>\n                    </div>\n                </div>\n            </div>\n        </div>\n   <button onclick=\"hzh()\" class=\"xplayer-icon xplayer-full-in-icon\" data-balloon=\"画中画\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"#E6E6E6\" fill-rule=\"evenodd\"><path d=\"M17 4a2 2 0 012 2v6h-2V6.8a.8.8 0 00-.8-.8H4.8a.8.8 0 00-.794.7L4 6.8v8.4a.8.8 0 00.7.794l.1.006H11v2H4a2 2 0 01-2-2V6a2 2 0 012-2h13z\"></path><rect id=\"huazhonghua\" x=\"13\" y=\"14\" width=\"8\" height=\"6\" rx=\"1\"></rect></g></svg></span></button> \n        <div class=\"xplayer-full\">\n         <button class=\"xplayer-icon xplayer-full-icon\" data-balloon=\"",
    BKGtF: function (argument38, argument39) {
      return argument38(argument39);
    },
    wEAdh: "Full screen",
    mVIsn: "</span>\n            </button><button class=\"xplayer-icon xplayer-fulloff-icon\" data-balloon=\"退出全屏\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 1024 1024\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M308.3555518 432.05693128H150.1524268c-17.67162586 0-32.81873308-14.30560177-32.81873308-32.81873308s14.30560177-32.81873308 32.81873308-32.81873309h158.203125c30.29421522 0 49.64885273-9.25656603 49.6488535-56.38090166V150.1524268c0-17.67162586 14.30560177-32.81873308 32.81873308-32.81873308s32.81873308 14.30560177 32.81873309 32.81873308v160.72764287c-0.84150622 75.73553842-43.75831155 121.17686162-115.28631967 121.17686161z m321.45528573 471.24335092c-17.67162586 0-31.97722764-14.30560177-31.97722687-31.97722687V709.75390625c0-75.73553842 42.91680533-121.17686162 114.44481346-121.17686162h158.203125c17.67162586 0 31.97722764 14.30560177 31.97722763 31.97722764s-14.30560177 31.97722764-31.97722763 31.97722687H712.27842412c-30.29421522 0-49.64885273 9.25656603-49.64885273 56.38090089v160.72764287c-0.84150622 18.51313131-15.14710799 33.6602393-32.81873386 33.6602393z\" id=\"xplayer-fulloff\"></path></svg></span></button>\n        </div>\n    </div>\n    <div class=\"xplayer-bar-wrap\">\n        <div class=\"xplayer-bar-time hidden\">00:00</div>\n        <div class=\"xplayer-bar-preview\"></div>\n        <div class=\"xplayer-bar\">\n            <div class=\"xplayer-loaded\" style=\"width: 0;\"></div>\n            <div class=\"xplayer-played\" style=\"width: 0; background: ",
    JXljp: function (argument40, argument41) {
      return argument40(argument41);
    },
    QTEUB: "\">\n                <span class=\"xplayer-thumb\" style=\"background: ",
    vRzel: function (argument42, argument43) {
      return argument42(argument43);
    },
    jVndo: "\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 18 18\" width=\"18\" height=\"18\" preserveAspectRatio=\"xMidYMid meet\" style=\"width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);\"><defs><clipPath id=\"__lottie_element_25\"><rect width=\"18\" height=\"18\" x=\"0\" y=\"0\"></rect></clipPath></defs><g clip-path=\"url(#__lottie_element_25)\"><g transform=\"matrix(1,0,0,1,8.937000274658203,8.25)\" opacity=\"0.14\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,0.07500000298023224,1.2130000591278076)\"><path fill=\"rgb(251,114,153)\" fill-opacity=\"1\" d=\" M9,-3.5 C9,-3.5 9,3.5 9,3.5 C9,5.707600116729736 7.207600116729736,7.5 5,7.5 C5,7.5 -5,7.5 -5,7.5 C-7.207600116729736,7.5 -9,5.707600116729736 -9,3.5 C-9,3.5 -9,-3.5 -9,-3.5 C-9,-5.707600116729736 -7.207600116729736,-7.5 -5,-7.5 C-5,-7.5 5,-7.5 5,-7.5 C7.207600116729736,-7.5 9,-5.707600116729736 9,-3.5z\"></path></g></g><g transform=\"matrix(1,0,0,1,9.140999794006348,8.67199993133545)\" opacity=\"0.28\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-0.1509999930858612,0.7990000247955322)\"><path fill=\"rgb(251,114,153)\" fill-opacity=\"1\" d=\" M8,-3 C8,-3 8,3 8,3 C8,4.931650161743164 6.431650161743164,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-6.431650161743164,6.5 -8,4.931650161743164 -8,3 C-8,3 -8,-3 -8,-3 C-8,-4.931650161743164 -6.431650161743164,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C6.431650161743164,-6.5 8,-4.931650161743164 8,-3z\"></path></g></g><g transform=\"matrix(0.9883429408073425,-0.7275781631469727,0.6775955557823181,0.920446515083313,7.3224687576293945,-0.7606706619262695)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(0.9937776327133179,-0.11138220876455307,0.11138220876455307,0.9937776327133179,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1.1436611413955688,0.7535901665687561,-0.6317168474197388,0.9587040543556213,16.0070743560791,2.902894973754883)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(0.992861807346344,0.1192704513669014,-0.1192704513669014,0.992861807346344,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1,0,0,1,8.890999794006348,8.406000137329102)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,0.09099999815225601,1.1009999513626099)\"><path fill=\"rgb(255,255,255)\" fill-opacity=\"1\" d=\" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z\"></path><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" fill-opacity=\"0\" stroke-miterlimit=\"4\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"1\" stroke-width=\"1.5\" d=\" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z\"></path></g></g><g transform=\"matrix(1,0,0,1,8.89900016784668,8.083999633789062)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.875,-1.125 C0.875,-1.125 0.875,1.125 0.875,1.125 C0.875,1.607912540435791 0.48291251063346863,2 0,2 C0,2 0,2 0,2 C-0.48291251063346863,2 -0.875,1.607912540435791 -0.875,1.125 C-0.875,1.125 -0.875,-1.125 -0.875,-1.125 C-0.875,-1.607912540435791 -0.48291251063346863,-2 0,-2 C0,-2 0,-2 0,-2 C0.48291251063346863,-2 0.875,-1.607912540435791 0.875,-1.125z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1,0,0,1,14.008999824523926,8.083999633789062)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.8999999761581421,-1.100000023841858 C0.8999999761581421,-1.100000023841858 0.8999999761581421,1.100000023841858 0.8999999761581421,1.100000023841858 C0.8999999761581421,1.596709966659546 0.4967099726200104,2 0,2 C0,2 0,2 0,2 C-0.4967099726200104,2 -0.8999999761581421,1.596709966659546 -0.8999999761581421,1.100000023841858 C-0.8999999761581421,1.100000023841858 -0.8999999761581421,-1.100000023841858 -0.8999999761581421,-1.100000023841858 C-0.8999999761581421,-1.596709966659546 -0.4967099726200104,-2 0,-2 C0,-2 0,-2 0,-2 C0.4967099726200104,-2 0.8999999761581421,-1.596709966659546 0.8999999761581421,-1.100000023841858z\" style=\"fill: #000;\"></path></g></g></g></svg></span>\n            </div>\n        </div>\n  </div>\n    </div>\n  <div class=\"xplayer-icons xplayer-comment-box\"><div class=\"xplayer-setting-item xplayer-setting-showdan showdan-setting\"> <span class=\"xplayer-label\"></span>\n<div class=\"xplayer-toggle\"><input class=\"xplayer-showdan-setting-input\"type=\"checkbox\"name=\"xplayer-toggle-dan\"><label for=\"xplayer-toggle-dan\"></label></div></div>\n        <button class=\"xplayer-icon xplayer-comment-setting-icon\" data-balloon=\"",
    mUPqf: function (argument44, argument45) {
      return argument44(argument45);
    },
    Xknlr: "</span>\n        </button>\n        <div class=\"xplayer-comment-setting-box\">\n <div class=\"xplayer-setting-item xplayer-setting-danunlimit\">\n                        <span class=\"xplayer-label\">",
    QdAWN: function (argument46, argument47) {
      return argument46(argument47);
    },
    MuaDI: "Unlimited danmaku",
    aKufb: "</span>\n                        <div class=\"xplayer-toggle\">\n                            <input class=\"xplayer-danunlimit-setting-input\" type=\"checkbox\" name=\"xplayer-toggle-danunlimit\">\n                            <label for=\"xplayer-toggle-danunlimit\"></label>\n                        </div>\n                    </div>\n                    <div class=\"xplayer-setting-item xplayer-setting-danmaku\">\n                        <span class=\"xplayer-label\">",
    BPnRB: "Opacity for danmaku",
    dbnLZ: "</span>\n                        <div class=\"xplayer-danmaku-bar-wrap\">\n                            <div class=\"xplayer-danmaku-bar\">\n                                <div class=\"xplayer-danmaku-bar-inner\">\n                                    <span class=\"xplayer-thumb\"></span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                  <div class=\"xplayer-comment-setting-type\">\n                <div class=\"xplayer-comment-setting-title\">",
    SIoOF: function (argument48, argument49) {
      return argument48(argument49);
    },
    NpmxI: function (argument50, argument51) {
      return argument50(argument51);
    },
    hjiKJ: "Set danmaku type",
    GIhqs: "</div>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-type-",
    uKvUk: function (argument52, argument53) {
      return argument52(argument53);
    },
    YcSsX: "\" value=\"top\">\n                    <span>",
    ouyYf: function (argument54, argument55) {
      return argument54(argument55);
    },
    muiHH: "Top",
    pkLEv: "</span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-type-",
    dhmNs: "\" value=\"right\" checked>\n                    <span>",
    BMACK: "Rolling",
    FRpRM: "\" value=\"bottom\">\n                    <span>",
    Wezzi: function (argument56, argument57) {
      return argument56(argument57);
    },
    YkDXz: "Bottom",
    oGaSU: "</span>\n                </label>\n            </div>\n    <div class=\"xplayer-comment-setting-font\"><div class=\"xplayer-comment-setting-title\">弹幕大小</div><label><input type=\"radio\"name=\"xplayer-danmaku-font-0\"value=\"50px\"><span>超大</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-0\"value=\"35px\"><span>较大</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-0\"value=\"27.5px\"checked=\"\"><span>标准</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-0\"value=\"18px\"><span>较小</span></label></div>      <div class=\"xplayer-comment-setting-color\">\n                <div class=\"xplayer-comment-setting-title\">",
    mPDOY: "Set danmaku color",
    KhhVj: "</div>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    uqpRF: function (argument58, argument59) {
      return argument58(argument59);
    },
    hhnIz: "\" value=\"#FE0302\">\n                    <span style=\"background:#FE0302;\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    TySvV: "\" value=\"#FF7204\">\n                    <span style=\"background: #FF7204\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    ooicQ: "\" value=\"#FFAA02\">\n                    <span style=\"background: #FFAA02\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    NIpYg: function (argument60, argument61) {
      return argument60(argument61);
    },
    OKtYV: "\" value=\"#FFD302\">\n                    <span style=\"background: #FFD302\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    kOTgs: function (argument62, argument63) {
      return argument62(argument63);
    },
    SAlIy: "\" value=\"#FFFF00\">\n                    <span style=\"background: #FFFF00\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    TEeEI: function (argument64, argument65) {
      return argument64(argument65);
    },
    UNyad: "\" value=\"#A0EE00\">\n                    <span style=\"background: #A0EE00\"></span>\n                </label>\n<label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    yXRMz: function (argument66, argument67) {
      return argument66(argument67);
    },
    nMybo: "\" value=\"#00CD00\">\n                    <span style=\"background: #00CD00;\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    lYbAE: function (argument68, argument69) {
      return argument68(argument69);
    },
    VoYOI: "\" value=\"#019899\">\n                    <span style=\"background: #019899\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    mleEp: "\" value=\"#4266BE\">\n                    <span style=\"background: #4266BE\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    ErADd: function (argument70, argument71) {
      return argument70(argument71);
    },
    ZgSlC: "\" value=\"#89D5FF\">\n                    <span style=\"background: #89D5FF\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    gxdyi: function (argument72, argument73) {
      return argument72(argument73);
    },
    zljbv: "\" value=\"#CC0273\">\n                    <span style=\"background: #CC0273\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    qnIAO: function (argument74, argument75) {
      return argument74(argument75);
    },
    jaggg: "\" value=\"#222222\">\n                    <span style=\"background: #222222\"></span>\n                </label>\n            <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    saToX: "\" value=\"#9B9B9B\">\n                    <span style=\"background: #9B9B9B\"></span>\n                </label>\n          <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-",
    MHkQW: "\" value=\"#FFFFFF\" checked>\n                    <span style=\"background: #FFFFFF\"></span>\n                </label>\n</div>\n                   </div>\n        <input class=\"xplayer-comment-input\" type=\"text\" placeholder=\"",
    qaRuS: "Input danmaku, hit Enter",
    eMUxo: "\" maxlength=\"30\">\n        <button class=\"xplayer-icon xplayer-send-icon\" data-balloon=\"",
    YfmWg: function (argument76, argument77) {
      return argument76(argument77);
    },
    cgSyj: "Send",
    yWFeo: "</span>\n        </button>\n<input id=\"dmtext\" dmtype=\"right\" size=\"27.5px\" class=\"yzm-xplayer-comment-input\" type=\"text\" placeholder=\"",
    hkNPB: function (argument78, argument79) {
      return argument78(argument79);
    },
    tYvln: "\" maxlength=\"30\" >\n        <button class=\"xplayer-icon yzm-xplayer-send-icon\" data-balloon=\"",
    XuVyX: function (argument80, argument81) {
      return argument80(argument81);
    },
    wCkbH: "\" data-balloon-pos=\"up\">发送\t</button>\n   </div>\n  </div>\n<div class=\"xplayer-info-panel xplayer-info-panel-hide\"><div class=\"title\"><span>统计信息</span><a href=\"javascript:void(0);\"class=\"xplayer-info-panel-close\"><span style=\"width: 100%;height: 100%;\"><svg xmlns=\"http://www.w3.org/2000/svg\"viewBox=\"0 0 16 16\"><path d=\"M8 6.939l3.182-3.182a.75.75 0 111.061 1.061L9.061 8l3.182 3.182a.75.75 0 11-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 11-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 111.061-1.061L8 6.939z\"></path></svg></span></a></div><div class=\"panel\"><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-version\"><span class=\"xplayer-info-panel-item-title\">Player Version</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-fps\"><span class=\"xplayer-info-panel-item-title\">Player FPS</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-type\"><span class=\"xplayer-info-panel-item-title\">Video Type</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-url\"><span class=\"xplayer-info-panel-item-title\">Video Host</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-resolution\"><span class=\"xplayer-info-panel-item-title\">Video Resolution</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-duration\"><span class=\"xplayer-info-panel-item-title\">Video Time</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-speed\"><span class=\"xplayer-info-panel-item-title\">Video Speed</span><span class=\"xplayer-info-panel-item-data\">0 Kbps</span></div>",
    iGDUQ: "<div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-id\"><span class=\"xplayer-info-panel-item-title\">Barrage ID</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-api\"><span class=\"xplayer-info-panel-item-title\">Barrage API</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-amount\"><span class=\"xplayer-info-panel-item-title\">Barrage Number</span><span class=\"xplayer-info-panel-item-data\"></span></div>",
    ogegf: "</div></div>\n<div class=\"xplayer-menu\">\n    ",
    MoVWs: "\n</div>\n<div class=\"xplayer-notice\"></div><div class=\"xplayer-danmu\"><div class=\"xplayer-watching\"><span class=\"xplayer-watching-number\" title=\"播放器在线人数\">1</span>人正在观看,<span class=\"danmuku-num\">100</span>条弹幕</div><ul class=\"xplayer-list\"><li>时间</li><li>弹幕内容</li><li>发送时间</li></ul><ul class=\"list-show\"></ul></div><div class=\"svg-icon\"><svg aria-hidden=\"true\"><symbol id=\"icon-play\" viewBox=\"0 0 80 80\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><defs><polygon id=\"cd9e036b-17ed-4fb1-988d-92dd0e62df02\"points=\"0 0 80 0 80 80 0 80\"></polygon><path id=\"e9029cf2-058b-4dc3-a369-191aaec4988d\"d=\"M52.5463795,8.01403034 C54.5470371,7.84763808 56.3253994,9.18911826 56.7676959,11.0911381 C56.8718466,11.5365362 56.8612939,11.8985083 56.8069245,12.2287648 C56.7500316,12.556723 56.6424397,12.8481393 56.4951605,13.110368 C56.4219797,13.2418271 56.3354933,13.3636336 56.2494657,13.4856699 L56.2494657,13.4856699 L55.9916124,13.8522385 L55.4708587,14.5816985 C54.7716265,15.5508645 54.0556475,16.50762 53.3171867,17.4480581 C53.3121398,17.4544931 53.3068634,17.4606984 53.3020459,17.4671334 C54.2015503,17.5075824 55.1010548,17.5517085 56.0005592,17.6022697 C57.096436,17.6624835 58.1918539,17.7339586 59.2877307,17.8093407 L59.2877307,17.8093407 L60.9309723,17.9320665 L61.7527078,17.9980259 L62.1635756,18.0324994 L62.3688948,18.0495064 L62.471669,18.0580098 L62.5872901,18.0699607 C63.8533868,18.1864812 65.1027368,18.520185 66.2644533,19.0451021 C67.4263993,19.5697893 68.5000236,20.2872985 69.4304979,21.1587894 C70.3609723,22.0295909 71.1487556,23.0543742 71.7511781,24.1807396 C72.3552065,25.3059558 72.7702036,26.5343627 72.9750639,27.7944854 C73.0051162,27.9514549 73.0214041,28.1100331 73.0429684,28.2681518 L73.0429684,28.2681518 L73.0581092,28.3867407 L73.0714148,28.4988946 L73.0927497,28.7045867 L73.178089,29.5271253 L73.3366092,31.1733515 C73.4377777,32.2714485 73.5267875,33.3709245 73.6061623,34.4713197 C73.9220556,38.8708323 74.0704819,43.2995325 73.9677076,47.7257047 C73.8695214,52.1475102 73.5717513,56.5518491 73.123949,60.9389512 C73.1124787,61.0662734 73.0904556,61.2356534 73.070956,61.3930826 C73.0530623,61.5521205 73.0269099,61.7104689 72.9989223,61.8683577 L72.9583172,62.1053058 L72.9083065,62.3406451 C72.8745837,62.4976146 72.8410903,62.6543543 72.7979618,62.8092554 C72.638524,63.4309282 72.4281579,64.0401904 72.1691575,64.6280791 C71.6523038,65.8043162 70.9393071,66.8927606 70.0700844,67.8368758 C69.2020087,68.7819103 68.1783951,69.5837648 67.0510896,70.1990025 C65.9240135,70.8153893 64.6934749,71.2433208 63.4282958,71.4609637 C63.2697757,71.485325 63.1117143,71.5129038 62.9525059,71.5331283 L62.9525059,71.5331283 L62.4762572,71.5859877 L61.6545217,71.6574628 L60.0108212,71.7907605 C58.9151739,71.8769444 57.8190677,71.9509475 56.723191,72.0210437 C54.5309786,72.1573291 52.3383075,72.2648865 50.1451775,72.3455546 C41.3733459,72.6696058 32.5989908,72.5652659 23.8315179,72.0442559 C22.7356412,71.9799053 21.6402232,71.9031442 20.5445759,71.8238551 L20.5445759,71.8238551 L18.9015636,71.6951539 L18.0802869,71.6264367 L17.6696486,71.5910438 L17.4643294,71.5731176 C17.3957368,71.5671422 17.3305852,71.5620861 17.2461635,71.5522036 C15.9706611,71.433155 14.7132819,71.091867 13.5460596,70.5609746 C12.3779196,70.0296225 11.3006248,69.3040695 10.368774,68.4252242 C9.4371526,67.5466086 8.64822227,66.5163096 8.04901145,65.3832794 C7.4486536,64.2513983 7.03686821,63.0188545 6.83407251,61.7557442 C6.80952597,61.5978554 6.78268537,61.4401964 6.7670857,61.2811585 L6.7670857,61.2811585 L6.7407039,61.0428314 L6.72762771,60.9240127 L6.71868084,60.8210517 L6.6475647,59.9978237 L6.51565574,58.3504483 C6.43283985,57.2518916 6.35942964,56.1524157 6.29565452,55.0522503 C6.03986583,50.6529675 5.93755035,46.2348392 6.03825998,41.8194687 C6.13667554,37.4068562 6.41012856,33.0075734 6.82604327,28.6223099 C6.94441723,27.3608083 7.26696333,26.1147049 7.78312886,24.9545555 C8.29814735,23.7937167 9.0047206,22.7195213 9.86476706,21.7871271 C10.7243547,20.8542732 11.7390214,20.0655187 12.8543978,19.4603933 C13.9695447,18.8548081 15.1865483,18.43561 16.4368159,18.2241723 C16.5935008,18.2007303 16.7494975,18.1726918 16.9068707,18.1540761 L16.9068707,18.1540761 L17.3762372,18.1030552 L18.1975139,18.0336485 L19.8398379,17.9037982 C20.9350264,17.8199126 22.0302149,17.7482077 23.1254035,17.6801799 C24.2455974,17.6123819 25.3662501,17.552398 26.4866734,17.4993087 C26.4731384,17.4823018 26.459374,17.465065 26.4458389,17.4480581 C25.7073781,16.50762 24.9911698,15.5508645 24.2919376,14.5816985 L24.2919376,14.5816985 L23.7714133,13.8522385 L23.51356,13.4856699 C23.4275324,13.3636336 23.3408166,13.2418271 23.2678652,13.110368 C23.1203565,12.8481393 23.0129941,12.556723 22.9558718,12.2287648 C22.9017318,11.8985083 22.8909496,11.5365362 22.9953298,11.0911381 C23.4527671,9.13281148 25.2740285,7.85039596 27.2166461,8.01403034 C27.6717894,8.05195123 28.0122293,8.1735279 28.3093112,8.32682022 C28.6031814,8.48195113 28.8468116,8.67408363 29.0507543,8.89540373 C29.1530698,9.00548922 29.2418502,9.12568695 29.3313189,9.24519521 L29.3313189,9.24519521 L29.6001838,9.60371998 L30.1328666,10.3244467 C30.8380634,11.289246 31.5265136,12.266226 32.1922524,13.2595235 C32.8575324,14.2532806 33.5042304,15.2605973 34.1217938,16.2890578 C34.3094487,16.6025372 34.4950388,16.9178551 34.6778761,17.2350116 C37.4016243,17.1878978 40.125143,17.1791645 42.8488911,17.1968609 C43.5962988,17.2026065 44.3441653,17.2120293 45.0918023,17.2232906 C45.2723456,16.9100411 45.4558711,16.59886 45.6410025,16.2890578 C46.2587952,15.2605973 46.9054933,14.2532806 47.5707733,13.2595235 C48.2367415,12.266226 48.9249622,11.289246 49.6299296,10.3244467 L49.6299296,10.3244467 L50.1626124,9.60371998 L50.4314773,9.24519521 C50.5211754,9.12568695 50.6099559,9.00548922 50.7122714,8.89540373 C50.9162141,8.67408363 51.1596148,8.48195113 51.4537145,8.32682022 C51.7507964,8.1735279 52.0912362,8.05195123 52.5463795,8.01403034 Z M30.1292787,34.6305448 C29.9027436,35.0737419 29.7609153,35.5553261 29.7110787,36.0505615 C29.4138374,39.0042999 29.2652168,42.0471726 29.2652168,45.1791797 C29.2652168,48.0068864 29.3863609,50.8345931 29.6286492,53.6622998 L29.7399083,54.8741737 C29.9552063,57.072794 31.9120739,58.6805944 34.1106942,58.4652963 C34.6308013,58.4143652 35.1358879,58.2620098 35.597405,58.0168417 C38.4166275,56.5192079 41.1473744,54.9840008 43.7896457,53.4112203 C45.7989419,52.2152106 47.7645435,50.9930278 49.6864507,49.7446716 L51.1196851,48.8034922 C52.9601471,47.5816163 53.4616102,45.0991009 52.2397342,43.2586389 C51.9555036,42.830514 51.5914399,42.4611683 51.1674532,42.1708009 C48.8122631,40.5578484 46.3529939,38.9884709 43.7896457,37.4626684 C41.5302725,36.1178034 39.2374735,34.835025 36.9112487,33.6143333 L35.5115044,32.8893654 C33.5444304,31.8839182 31.1347259,32.6634708 30.1292787,34.6305448 Z\"></path><filter x=\"-15.4%\"y=\"-16.3%\"width=\"130.9%\"height=\"132.5%\"filterUnits=\"objectBoundingBox\"id=\"0bb3e1ae-f6c9-4254-a22a-e753c086e5a8\"><feOffset dx=\"0\"dy=\"2\"in=\"SourceAlpha\"result=\"shadowOffsetOuter1\"></feOffset><feGaussianBlur stdDeviation=\"1\"in=\"shadowOffsetOuter1\"result=\"shadowBlurOuter1\"></feGaussianBlur><feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0\"type=\"matrix\"in=\"shadowBlurOuter1\"result=\"shadowMatrixOuter1\"></feColorMatrix><feOffset dx=\"0\"dy=\"0\"in=\"SourceAlpha\"result=\"shadowOffsetOuter2\"></feOffset><feGaussianBlur stdDeviation=\"3.5\"in=\"shadowOffsetOuter2\"result=\"shadowBlurOuter2\"></feGaussianBlur><feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0\"type=\"matrix\"in=\"shadowBlurOuter2\"result=\"shadowMatrixOuter2\"></feColorMatrix><feMerge><feMergeNode in=\"shadowMatrixOuter1\"></feMergeNode><feMergeNode in=\"shadowMatrixOuter2\"></feMergeNode></feMerge></filter></defs><g stroke=\"none\"stroke-width=\"1\"fill=\"none\"fill-rule=\"evenodd\"opacity=\"0.8\"><mask id=\"ab6af442-0ec0-4fa1-b1e0-53d5102b9d3a\"fill=\"white\"><use xlink:href=\"#cd9e036b-17ed-4fb1-988d-92dd0e62df02\"></use></mask><g mask=\"url(#ab6af442-0ec0-4fa1-b1e0-53d5102b9d3a)\"><use fill=\"black\"fill-opacity=\"1\"filter=\"url(#0bb3e1ae-f6c9-4254-a22a-e753c086e5a8)\"xlink:href=\"#e9029cf2-058b-4dc3-a369-191aaec4988d\"></use><use fill=\"#FFFFFF\"fill-rule=\"evenodd\"xlink:href=\"#e9029cf2-058b-4dc3-a369-191aaec4988d\"></use></g></g></symbol><symbol id=\"icon-play-xj\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z\"></path></symbol></svg></div>"
  };
  var templateRuntimeExportModule = requireModule(3);
  module.exports = function (argument82) {
    "use strict";

    argument82 = options.SzmwC(argument82, {});
    var value = "";
    arguments[1];
    var video = argument82.video;
    var options2 = argument82.options;
    var $escape = templateRuntimeExportModule.$escape;
    var tran = argument82.tran;
    var icons = argument82.icons;
    var index = argument82.index;
    var $each = templateRuntimeExportModule.$each;
    argument82.$value;
    argument82.$index;
    value += "<div id=\"loading-box\"><div class=\"loading\"><p class=\"pic\"></p><div class=\"tips\"></div></div><div type=\"button\" id=\"close\" ><div class=\"playlink\"><span id=\"link1\">播放器连接...</span><span id=\"link1-success\">【完成】</span></div><div class=\"dmlink\"><span id=\"link2\">弹幕连接中...</span><span id=\"link2-success\">【完成】</span><span id=\"link2-error\">【失败】</span></div><span class=\"palycon\" id=\"link3\"><e id=\"link3_tip\">等待视频连接中</e><e id=\"link3-error\">【失败】</e><!--d class=\"wait\"><e id=\"span\">3</e>s</d--></span></div></div><div class=\"xplayer-mask\"></div>\n<div class=\"xplayer-cplayer\"><div class=\"xplayer-showing\"><svg aria-hidden=\"true\"><use xlink:href=\"#icon-play\"></use></svg></div><div class=\"vod-title\"><div id=\"landing-title\" class=\"video-info\"><ul class=\"u-title\"><a id=\"vodlink\" href=\"\" target=\"_blank\" ><span class=\"iconfont icon-back\"></span></a><a id=\"vodtitle\"><span></span></a></ul></div></div></div><div class=\"xplayer-video-wrap\">\n    ";
    (function (argument83) {
      value += argument83;
    })(requireModule(4)(video));
    value += "\n    ";
    if (options2.logo) {
      value += "\n    <div class=\"xplayer-logo\">\n        <img src=\"";
      value += $escape(options2.logo);
      value += "\">\n    </div>\n    ";
    }
    value += "\n    <div class=\"xplayer-danmaku\"";
    if (options2.danmaku && options2.danmaku.bottm) {
      value += " style=\"margin-bottom:";
      value += $escape(options2.danmaku.bottm);
      value += "\"";
    }
    value += ">\n        <div class=\"xplayer-danmaku-item xplayer-danmaku-item--demo\"></div>\n    </div>\n    <div class=\"xplayer-subtitle\"></div>\n    <div class=\"xplayer-bezel\">\n        <span class=\"xplayer-bezel-icon\"></span>\n        ";
    if (options2.danmaku) {
      value += "\n <span class=\"xplayer-danloading\">";
      value += $escape(tran("Danmaku is loading"));
      value += "</span>\n  ";
    }
    value += "\n        <span class=\"diplayer-loading-icon\">";
    value += icons.loading;
    value += "</span>\n    </div>\n</div>\n<div class=\"xplayer-controller-mask\"></div>\n<div class=\"xplayer-controller\">\n  <div class=\"controller-box\">\n   <div class=\"xplayer-icons xplayer-icons-left\">\n        <button class=\"xplayer-icon xplayer-play-icon\">\n            <span class=\"xplayer-icon-content\">";
    value += icons.play;
    value += "</span>\n        </button>\n    <button onclick=\"XGGM.video.next();\" class=\"xplayer-icon  icon-xj\" data-balloon=\"下一集\" data-balloon-pos=\"up\">\n<span class=\"xplayer-icon-content\"><svg aria-hidden=\"true\" fill=\"#fff\"><use xlink:href=\"#icon-play-xj\"></use></svg></span></button>\n    <div class=\"xplayer-volume\">\n            <button class=\"xplayer-icon xplayer-volume-icon\">\n                <span class=\"xplayer-icon-content\">";
    value += icons.volumeDown;
    value += "</span>\n            </button>\n            <div class=\"xplayer-volume-bar-wrap\" data-balloon-pos=\"up\">\n                <div class=\"xplayer-volume-bar\">\n                    <div class=\"xplayer-volume-bar-inner\" style=\"background: ";
    value += $escape(options2.theme);
    value += ";\">\n                        <span class=\"xplayer-thumb\" style=\"background: ";
    value += $escape(options2.theme);
    value += "\"></span>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <span class=\"xplayer-time\">\n            <span class=\"xplayer-ptime\">0:00</span> /\n            <span class=\"xplayer-dtime\">0:00</span>\n        </span>\n        ";
    if (options2.live) {
      value += "\n        <span class=\"xplayer-live-badge\"><span class=\"xplayer-live-dot\" style=\"background: ";
      value += $escape(options2.theme);
      value += ";\"></span>";
      value += $escape(tran("Live"));
      value += "</span>\n        ";
    }
    value += "\n    </div>\n    <div class=\"xplayer-icons xplayer-icons-right\">\n        ";
    if (options2.video.quality) {
      value += "\n        <div class=\"xplayer-quality\">\n            <button class=\"xplayer-icon xplayer-quality-icon\">";
      value += $escape(options2.video.quality[options2.video.defaultQuality].name);
      value += "</button>\n            <div class=\"xplayer-quality-mask\">\n                <div class=\"xplayer-quality-list\"></div>\n                ";
      $each(options2.video.quality, function (argument84, argument85) {
        value += "\n                    <div class=\"xplayer-quality-item\" data-index=\"";
        value += $escape(argument85);
        value += "\">";
        value += $escape(argument84.name);
        value += "</div>\n                ";
      });
      value += "\n                </div>\n            </div>\n        </div>\n        ";
    }
    value += "\n        ";
    if (options2.screenshot) {
      value += "\n        <a href=\"#\" class=\"xplayer-icon xplayer-camera-icon\" data-balloon=\"";
      value += $escape(tran("Screenshot"));
      value += "\" data-balloon-pos=\"up\">\n            <span class=\"xplayer-icon-content\">";
      value += icons.camera;
      value += "</span>\n        </a>\n        ";
    }
    value += "\n        <div class=\"xplayer-comment\">\n            <button class=\"xplayer-icon xplayer-comment-icon\" data-balloon=\"";
    value += $escape(tran("Send danmaku"));
    value += "\" data-balloon-pos=\"up\">\n                <span class=\"xplayer-icon-content\">";
    value += icons.comment;
    value += "</span>\n            </button>\n        </div>\n        ";
    if (options2.subtitle) {
      value += "\n        <div class=\"xplayer-subtitle-btn\">\n            <button class=\"xplayer-icon xplayer-subtitle-icon\" data-balloon=\"";
      value += $escape(tran("Hide subtitle"));
      value += "\" data-balloon-pos=\"up\">\n                <span class=\"xplayer-icon-content\">";
      value += icons.subtitle;
      value += "</span>\n            </button>\n        </div>\n        ";
    }
    value += "\n        <div class=\"xplayer-setting\"><button class=\"xplayer-icon xplayer-list-icon\" data-balloon=\"弹幕列表\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 32 32\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z\" id=\"xplayer-full-in\"></path></svg></span></button>\n            <button class=\"xplayer-icon xplayer-setting-icon\" data-balloon=\"";
    value += $escape(tran("Setting"));
    value += "\" data-balloon-pos=\"up\">\n                <span class=\"xplayer-icon-content\">";
    value += icons.setting;
    value += "</span>\n            </button>\n            <div class=\"xplayer-setting-box\">\n                <div class=\"xplayer-setting-origin-panel\">\n                    <div class=\"xplayer-setting-item xplayer-setting-speed\">\n                        <span class=\"xplayer-label\">";
    value += $escape(tran("Speed"));
    value += "</span>\n                        <div class=\"xplayer-toggle\">";
    value += icons.right;
    value += "</div>\n                    </div>\n                    <div class=\"xplayer-setting-item xplayer-setting-loop\">\n                        <span class=\"xplayer-label\">";
    value += $escape(tran("Loop"));
    value += "</span>\n                        <div class=\"xplayer-toggle\">\n                            <input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\">\n                            <label for=\"xplayer-toggle\"></label>\n                        </div>\n                    </div><div class=\"xplayer-setting-item xplayer-setting-jlast\"><span class=\"xplayer-label\">跳过片尾 <span class=\"xplayer-skip-time\"><input id=\"jumptime\" inputmode=\"numeric\" aria-label=\"跳过片尾时长（秒）\" placeholder=\"0\"><span class=\"xplayer-skip-time-unit\" aria-hidden=\"true\">秒</span></span></span><div class=\"xplayer-toggle\"><input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\"><label for=\"xplayer-toggle\"></label></div></div><div class=\"xplayer-setting-item xplayer-setting-jfrist\"><span class=\"xplayer-label\">跳过片头 <span class=\"xplayer-skip-time\"><input id=\"fristtime\" inputmode=\"numeric\" aria-label=\"跳过片头时长（秒）\" placeholder=\"0\"><span class=\"xplayer-skip-time-unit\" aria-hidden=\"true\">秒</span></span></span><div class=\"xplayer-toggle\"><input class=\"xplayer-toggle-setting-input\" type=\"checkbox\" name=\"xplayer-toggle\"><label for=\"xplayer-toggle\"></label></div></div>\n             </div>\n                <div class=\"xplayer-setting-speed-panel\">\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"0.5\">\n                        <span class=\"xplayer-label\">0.5</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"0.75\">\n                        <span class=\"xplayer-label\">0.75</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1\">\n                        <span class=\"xplayer-label\">";
    value += $escape(tran("Normal"));
    value += "</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1.25\">\n                        <span class=\"xplayer-label\">1.25</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"1.5\">\n                        <span class=\"xplayer-label\">1.5</span>\n                    </div>\n                    <div class=\"xplayer-setting-speed-item\" data-speed=\"2\">\n                        <span class=\"xplayer-label\">2</span>\n                    </div>\n                </div>\n            </div>\n        </div>\n   <button onclick=\"hzh()\" class=\"xplayer-icon xplayer-full-in-icon\" data-balloon=\"画中画\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"#E6E6E6\" fill-rule=\"evenodd\"><path d=\"M17 4a2 2 0 012 2v6h-2V6.8a.8.8 0 00-.8-.8H4.8a.8.8 0 00-.794.7L4 6.8v8.4a.8.8 0 00.7.794l.1.006H11v2H4a2 2 0 01-2-2V6a2 2 0 012-2h13z\"></path><rect id=\"huazhonghua\" x=\"13\" y=\"14\" width=\"8\" height=\"6\" rx=\"1\"></rect></g></svg></span></button> \n        <div class=\"xplayer-full\">\n         <button class=\"xplayer-icon xplayer-full-icon\" data-balloon=\"";
    value += $escape(tran("Full screen"));
    value += "\" data-balloon-pos=\"up\">\n                <span class=\"xplayer-icon-content\">";
    value += icons.full;
    value += "</span>\n            </button><button class=\"xplayer-icon xplayer-fulloff-icon\" data-balloon=\"退出全屏\" data-balloon-pos=\"up\"><span class=\"xplayer-icon-content\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" version=\"1.1\" viewBox=\"0 0 1024 1024\"><path class=\"xplayer-fill\" style=\"fill:#ffffff\" d=\"M308.3555518 432.05693128H150.1524268c-17.67162586 0-32.81873308-14.30560177-32.81873308-32.81873308s14.30560177-32.81873308 32.81873308-32.81873309h158.203125c30.29421522 0 49.64885273-9.25656603 49.6488535-56.38090166V150.1524268c0-17.67162586 14.30560177-32.81873308 32.81873308-32.81873308s32.81873308 14.30560177 32.81873309 32.81873308v160.72764287c-0.84150622 75.73553842-43.75831155 121.17686162-115.28631967 121.17686161z m321.45528573 471.24335092c-17.67162586 0-31.97722764-14.30560177-31.97722687-31.97722687V709.75390625c0-75.73553842 42.91680533-121.17686162 114.44481346-121.17686162h158.203125c17.67162586 0 31.97722764 14.30560177 31.97722763 31.97722764s-14.30560177 31.97722764-31.97722763 31.97722687H712.27842412c-30.29421522 0-49.64885273 9.25656603-49.64885273 56.38090089v160.72764287c-0.84150622 18.51313131-15.14710799 33.6602393-32.81873386 33.6602393z\" id=\"xplayer-fulloff\"></path></svg></span></button>\n        </div>\n    </div>\n    <div class=\"xplayer-bar-wrap\">\n        <div class=\"xplayer-bar-time hidden\">00:00</div>\n        <div class=\"xplayer-bar-preview\"></div>\n        <div class=\"xplayer-bar\">\n            <div class=\"xplayer-loaded\" style=\"width: 0;\"></div>\n            <div class=\"xplayer-played\" style=\"width: 0; background: ";
    value += $escape(options2.theme);
    value += "\">\n                <span class=\"xplayer-thumb\" style=\"background: ";
    value += $escape(options2.theme);
    value += "\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 18 18\" width=\"18\" height=\"18\" preserveAspectRatio=\"xMidYMid meet\" style=\"width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);\"><defs><clipPath id=\"__lottie_element_25\"><rect width=\"18\" height=\"18\" x=\"0\" y=\"0\"></rect></clipPath></defs><g clip-path=\"url(#__lottie_element_25)\"><g transform=\"matrix(1,0,0,1,8.937000274658203,8.25)\" opacity=\"0.14\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,0.07500000298023224,1.2130000591278076)\"><path fill=\"rgb(251,114,153)\" fill-opacity=\"1\" d=\" M9,-3.5 C9,-3.5 9,3.5 9,3.5 C9,5.707600116729736 7.207600116729736,7.5 5,7.5 C5,7.5 -5,7.5 -5,7.5 C-7.207600116729736,7.5 -9,5.707600116729736 -9,3.5 C-9,3.5 -9,-3.5 -9,-3.5 C-9,-5.707600116729736 -7.207600116729736,-7.5 -5,-7.5 C-5,-7.5 5,-7.5 5,-7.5 C7.207600116729736,-7.5 9,-5.707600116729736 9,-3.5z\"></path></g></g><g transform=\"matrix(1,0,0,1,9.140999794006348,8.67199993133545)\" opacity=\"0.28\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-0.1509999930858612,0.7990000247955322)\"><path fill=\"rgb(251,114,153)\" fill-opacity=\"1\" d=\" M8,-3 C8,-3 8,3 8,3 C8,4.931650161743164 6.431650161743164,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-6.431650161743164,6.5 -8,4.931650161743164 -8,3 C-8,3 -8,-3 -8,-3 C-8,-4.931650161743164 -6.431650161743164,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C6.431650161743164,-6.5 8,-4.931650161743164 8,-3z\"></path></g></g><g transform=\"matrix(0.9883429408073425,-0.7275781631469727,0.6775955557823181,0.920446515083313,7.3224687576293945,-0.7606706619262695)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(0.9937776327133179,-0.11138220876455307,0.11138220876455307,0.9937776327133179,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1.1436611413955688,0.7535901665687561,-0.6317168474197388,0.9587040543556213,16.0070743560791,2.902894973754883)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(0.992861807346344,0.1192704513669014,-0.1192704513669014,0.992861807346344,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1,0,0,1,8.890999794006348,8.406000137329102)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,0.09099999815225601,1.1009999513626099)\"><path fill=\"rgb(255,255,255)\" fill-opacity=\"1\" d=\" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z\"></path><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" fill-opacity=\"0\" stroke-miterlimit=\"4\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"1\" stroke-width=\"1.5\" d=\" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z\"></path></g></g><g transform=\"matrix(1,0,0,1,8.89900016784668,8.083999633789062)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.875,-1.125 C0.875,-1.125 0.875,1.125 0.875,1.125 C0.875,1.607912540435791 0.48291251063346863,2 0,2 C0,2 0,2 0,2 C-0.48291251063346863,2 -0.875,1.607912540435791 -0.875,1.125 C-0.875,1.125 -0.875,-1.125 -0.875,-1.125 C-0.875,-1.607912540435791 -0.48291251063346863,-2 0,-2 C0,-2 0,-2 0,-2 C0.48291251063346863,-2 0.875,-1.607912540435791 0.875,-1.125z\" style=\"fill: #000;\"></path></g></g><g transform=\"matrix(1,0,0,1,14.008999824523926,8.083999633789062)\" opacity=\"1\" style=\"display: block;\"><g opacity=\"1\" transform=\"matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)\"><path fill=\"rgb(0,0,0)\" fill-opacity=\"1\" d=\" M0.8999999761581421,-1.100000023841858 C0.8999999761581421,-1.100000023841858 0.8999999761581421,1.100000023841858 0.8999999761581421,1.100000023841858 C0.8999999761581421,1.596709966659546 0.4967099726200104,2 0,2 C0,2 0,2 0,2 C-0.4967099726200104,2 -0.8999999761581421,1.596709966659546 -0.8999999761581421,1.100000023841858 C-0.8999999761581421,1.100000023841858 -0.8999999761581421,-1.100000023841858 -0.8999999761581421,-1.100000023841858 C-0.8999999761581421,-1.596709966659546 -0.4967099726200104,-2 0,-2 C0,-2 0,-2 0,-2 C0.4967099726200104,-2 0.8999999761581421,-1.596709966659546 0.8999999761581421,-1.100000023841858z\" style=\"fill: #000;\"></path></g></g></g></svg></span>\n            </div>\n        </div>\n  </div>\n    </div>";
    value += "<div class=\"xplayer-icons xplayer-comment-box xplayer-danmaku-composer\">\n<button type=\"button\" class=\"xplayer-icon xplayer-setting-showdan showdan-setting\" data-balloon=\"显示弹幕\" data-balloon-pos=\"up\" aria-label=\"显示弹幕\" aria-pressed=\"true\"><input class=\"xplayer-showdan-setting-input\" type=\"checkbox\" tabindex=\"-1\" aria-hidden=\"true\"><span class=\"xplayer-icon-content\">" + icons.danmakuSwitch + "</span></button><button type=\"button\" class=\"xplayer-icon xplayer-comment-setting-icon\" data-balloon=\"弹幕显示设置\" data-balloon-pos=\"up\" aria-label=\"弹幕显示设置\" aria-expanded=\"false\"><span class=\"xplayer-icon-content\">" + icons.pallette + "</span></button>";
    value += "<div class=\"xplayer-danmaku-display-box\" role=\"group\" aria-label=\"弹幕显示设置\" aria-hidden=\"true\">\n<div class=\"xplayer-danmaku-display-title\">按类型显示</div>\n<div class=\"xplayer-danmaku-filters\"><label><input type=\"checkbox\" data-danmaku-filter=\"right\" checked><span>滚动</span></label><label><input type=\"checkbox\" data-danmaku-filter=\"fixed\" checked><span>固定</span></label><label><input type=\"checkbox\" data-danmaku-filter=\"color\" checked><span>彩色</span></label></div>\n<label class=\"xplayer-setting-item xplayer-setting-danunlimit xplayer-danmaku-density\"><span class=\"xplayer-label\">海量弹幕</span><input class=\"xplayer-danunlimit-setting-input\" type=\"checkbox\"></label>\n<label class=\"xplayer-danmaku-display-row\"><span>显示区域</span><input type=\"range\" data-danmaku-display=\"area\" aria-label=\"弹幕显示区域\" min=\"25\" max=\"100\" step=\"25\" value=\"100\"><output>100%</output></label>\n<label class=\"xplayer-danmaku-display-row\"><span>不透明度</span><input type=\"range\" data-danmaku-display=\"opacity\" aria-label=\"弹幕不透明度\" min=\"0\" max=\"100\" step=\"1\" value=\"70\"><output>70%</output></label>\n<label class=\"xplayer-danmaku-display-row\"><span>弹幕字号</span><input type=\"range\" data-danmaku-display=\"size\" aria-label=\"观看弹幕字号\" min=\"50\" max=\"150\" step=\"5\" value=\"100\"><output>100%</output></label>\n<label class=\"xplayer-danmaku-display-row\"><span>弹幕速度</span><input type=\"range\" data-danmaku-display=\"speed\" aria-label=\"弹幕移动速度\" min=\"0.5\" max=\"2\" step=\"0.25\" value=\"1\"><output>适中</output></label>\n</div>\n<button type=\"button\" class=\"xplayer-icon xplayer-send-style-icon\" data-balloon=\"发送弹幕样式\" data-balloon-pos=\"up\" aria-label=\"发送弹幕样式\" aria-expanded=\"false\"><span aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"xplayer-send-style-svg\"><path d=\"m5.5 17 5.4-12.2a1.2 1.2 0 0 1 2.2 0L18.5 17M8 12h8M4 21h16\"/></svg></span></button>\n<div class=\"xplayer-comment-setting-box\" role=\"group\" aria-label=\"发送弹幕样式\" aria-hidden=\"true\"><div class=\"xplayer-danmaku-display-title\">发送弹幕样式</div><div class=\"xplayer-comment-setting-type\"><div class=\"xplayer-comment-setting-title\">";
    value += $escape(tran("Set danmaku type"));
    value += "</div>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-type-";
    value += $escape(index);
    value += "\" value=\"top\">\n                    <span>";
    value += $escape(tran("Top"));
    value += "</span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-type-";
    value += $escape(index);
    value += "\" value=\"right\" checked>\n                    <span>";
    value += $escape(tran("Rolling"));
    value += "</span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-type-";
    value += $escape(index);
    value += "\" value=\"bottom\">\n                    <span>";
    value += $escape(tran("Bottom"));
    value += "</span>\n                </label>\n            </div>\n    <div class=\"xplayer-comment-setting-font\"><div class=\"xplayer-comment-setting-title\">弹幕大小</div><label><input type=\"radio\"name=\"xplayer-danmaku-font-" + $escape(index) + "\"value=\"50px\"><span>超大</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-" + $escape(index) + "\"value=\"35px\"><span>较大</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-" + $escape(index) + "\"value=\"27.5px\"checked=\"\"><span>标准</span></label><label><input type=\"radio\"name=\"xplayer-danmaku-font-" + $escape(index) + "\"value=\"18px\"><span>较小</span></label></div>      <div class=\"xplayer-comment-setting-color\">\n                <div class=\"xplayer-comment-setting-title\">";
    value += $escape(tran("Set danmaku color"));
    value += "</div>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FE0302\">\n                    <span style=\"background:#FE0302;\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FF7204\">\n                    <span style=\"background: #FF7204\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FFAA02\">\n                    <span style=\"background: #FFAA02\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FFD302\">\n                    <span style=\"background: #FFD302\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FFFF00\">\n                    <span style=\"background: #FFFF00\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#A0EE00\">\n                    <span style=\"background: #A0EE00\"></span>\n                </label>\n<label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#00CD00\">\n                    <span style=\"background: #00CD00;\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#019899\">\n                    <span style=\"background: #019899\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#4266BE\">\n                    <span style=\"background: #4266BE\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#89D5FF\">\n                    <span style=\"background: #89D5FF\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#CC0273\">\n                    <span style=\"background: #CC0273\"></span>\n                </label>\n                <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#222222\">\n                    <span style=\"background: #222222\"></span>\n                </label>\n            <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#9B9B9B\">\n                    <span style=\"background: #9B9B9B\"></span>\n                </label>\n          <label>\n                    <input type=\"radio\" name=\"xplayer-danmaku-color-";
    value += $escape(index);
    value += "\" value=\"#FFFFFF\" checked>\n                    <span style=\"background: #FFFFFF\"></span>\n                </label>\n</div>\n                   </div>\n        <input class=\"xplayer-comment-input\" type=\"text\" placeholder=\"";
    value += $escape(tran("Input danmaku, hit Enter"));
    value += "\" maxlength=\"30\">\n        <button class=\"xplayer-icon xplayer-send-icon\" data-balloon=\"";
    value += $escape(tran("Send"));
    value += "\" data-balloon-pos=\"up\">\n            <span class=\"xplayer-icon-content\">";
    value += "发送";
    value += "</span>\n        </button>\n<input id=\"dmtext\" dmtype=\"right\" size=\"27.5px\" class=\"yzm-xplayer-comment-input\" type=\"text\" placeholder=\"";
    value += $escape(tran("Input danmaku, hit Enter"));
    value += "\" maxlength=\"30\" >\n        <button class=\"xplayer-icon yzm-xplayer-send-icon\" data-balloon=\"";
    value += $escape(tran("Send"));
    value += "\" data-balloon-pos=\"up\">发送\t</button>\n   </div>\n  </div>\n<div class=\"xplayer-info-panel xplayer-info-panel-hide\"><div class=\"title\"><span>统计信息</span><a href=\"javascript:void(0);\"class=\"xplayer-info-panel-close\"><span style=\"width: 100%;height: 100%;\"><svg xmlns=\"http://www.w3.org/2000/svg\"viewBox=\"0 0 16 16\"><path d=\"M8 6.939l3.182-3.182a.75.75 0 111.061 1.061L9.061 8l3.182 3.182a.75.75 0 11-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 11-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 111.061-1.061L8 6.939z\"></path></svg></span></a></div><div class=\"panel\"><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-version\"><span class=\"xplayer-info-panel-item-title\">Player Version</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-fps\"><span class=\"xplayer-info-panel-item-title\">Player FPS</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-type\"><span class=\"xplayer-info-panel-item-title\">Video Type</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-url\"><span class=\"xplayer-info-panel-item-title\">Video Host</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-resolution\"><span class=\"xplayer-info-panel-item-title\">Video Resolution</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-duration\"><span class=\"xplayer-info-panel-item-title\">Video Time</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-speed\"><span class=\"xplayer-info-panel-item-title\">Video Speed</span><span class=\"xplayer-info-panel-item-data\">0 Kbps</span></div>";
    if (options2.danmaku) {
      value += "<div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-id\"><span class=\"xplayer-info-panel-item-title\">Barrage ID</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-api\"><span class=\"xplayer-info-panel-item-title\">Barrage API</span><span class=\"xplayer-info-panel-item-data\"></span></div><div class=\"info-line xplayer-info-panel-item xplayer-info-panel-item-danmaku-amount\"><span class=\"xplayer-info-panel-item-title\">Barrage Number</span><span class=\"xplayer-info-panel-item-data\"></span></div>";
    }
    value += "</div></div>\n<div class=\"xplayer-menu\">\n    ";
    $each(options2.contextmenu, function (argument86, argument87) {
      value += "\n        <div class=\"xplayer-menu-item\">\n            <a href=\"";
      value += $escape(argument86.link || "javascript:void(0);");
      value += argument86.target === '_blank' ? "\" target=\"_blank\" rel=\"noopener noreferrer\">" : "\">";
      value += $escape(tran(argument86.text));
      value += "</a>\n        </div>\n    ";
    });
    return value += "\n</div>\n<div class=\"xplayer-notice\"></div><div class=\"xplayer-danmu\"><div class=\"xplayer-watching\"><span class=\"xplayer-watching-number\" title=\"播放器在线人数\">1</span>人正在观看,<span class=\"danmuku-num\">100</span>条弹幕</div><ul class=\"xplayer-list\"><li>时间</li><li>弹幕内容</li><li>发送时间</li></ul><ul class=\"list-show\"></ul></div><div class=\"svg-icon\"><svg aria-hidden=\"true\"><symbol id=\"icon-play\" viewBox=\"0 0 80 80\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><defs><polygon id=\"cd9e036b-17ed-4fb1-988d-92dd0e62df02\"points=\"0 0 80 0 80 80 0 80\"></polygon><path id=\"e9029cf2-058b-4dc3-a369-191aaec4988d\"d=\"M52.5463795,8.01403034 C54.5470371,7.84763808 56.3253994,9.18911826 56.7676959,11.0911381 C56.8718466,11.5365362 56.8612939,11.8985083 56.8069245,12.2287648 C56.7500316,12.556723 56.6424397,12.8481393 56.4951605,13.110368 C56.4219797,13.2418271 56.3354933,13.3636336 56.2494657,13.4856699 L56.2494657,13.4856699 L55.9916124,13.8522385 L55.4708587,14.5816985 C54.7716265,15.5508645 54.0556475,16.50762 53.3171867,17.4480581 C53.3121398,17.4544931 53.3068634,17.4606984 53.3020459,17.4671334 C54.2015503,17.5075824 55.1010548,17.5517085 56.0005592,17.6022697 C57.096436,17.6624835 58.1918539,17.7339586 59.2877307,17.8093407 L59.2877307,17.8093407 L60.9309723,17.9320665 L61.7527078,17.9980259 L62.1635756,18.0324994 L62.3688948,18.0495064 L62.471669,18.0580098 L62.5872901,18.0699607 C63.8533868,18.1864812 65.1027368,18.520185 66.2644533,19.0451021 C67.4263993,19.5697893 68.5000236,20.2872985 69.4304979,21.1587894 C70.3609723,22.0295909 71.1487556,23.0543742 71.7511781,24.1807396 C72.3552065,25.3059558 72.7702036,26.5343627 72.9750639,27.7944854 C73.0051162,27.9514549 73.0214041,28.1100331 73.0429684,28.2681518 L73.0429684,28.2681518 L73.0581092,28.3867407 L73.0714148,28.4988946 L73.0927497,28.7045867 L73.178089,29.5271253 L73.3366092,31.1733515 C73.4377777,32.2714485 73.5267875,33.3709245 73.6061623,34.4713197 C73.9220556,38.8708323 74.0704819,43.2995325 73.9677076,47.7257047 C73.8695214,52.1475102 73.5717513,56.5518491 73.123949,60.9389512 C73.1124787,61.0662734 73.0904556,61.2356534 73.070956,61.3930826 C73.0530623,61.5521205 73.0269099,61.7104689 72.9989223,61.8683577 L72.9583172,62.1053058 L72.9083065,62.3406451 C72.8745837,62.4976146 72.8410903,62.6543543 72.7979618,62.8092554 C72.638524,63.4309282 72.4281579,64.0401904 72.1691575,64.6280791 C71.6523038,65.8043162 70.9393071,66.8927606 70.0700844,67.8368758 C69.2020087,68.7819103 68.1783951,69.5837648 67.0510896,70.1990025 C65.9240135,70.8153893 64.6934749,71.2433208 63.4282958,71.4609637 C63.2697757,71.485325 63.1117143,71.5129038 62.9525059,71.5331283 L62.9525059,71.5331283 L62.4762572,71.5859877 L61.6545217,71.6574628 L60.0108212,71.7907605 C58.9151739,71.8769444 57.8190677,71.9509475 56.723191,72.0210437 C54.5309786,72.1573291 52.3383075,72.2648865 50.1451775,72.3455546 C41.3733459,72.6696058 32.5989908,72.5652659 23.8315179,72.0442559 C22.7356412,71.9799053 21.6402232,71.9031442 20.5445759,71.8238551 L20.5445759,71.8238551 L18.9015636,71.6951539 L18.0802869,71.6264367 L17.6696486,71.5910438 L17.4643294,71.5731176 C17.3957368,71.5671422 17.3305852,71.5620861 17.2461635,71.5522036 C15.9706611,71.433155 14.7132819,71.091867 13.5460596,70.5609746 C12.3779196,70.0296225 11.3006248,69.3040695 10.368774,68.4252242 C9.4371526,67.5466086 8.64822227,66.5163096 8.04901145,65.3832794 C7.4486536,64.2513983 7.03686821,63.0188545 6.83407251,61.7557442 C6.80952597,61.5978554 6.78268537,61.4401964 6.7670857,61.2811585 L6.7670857,61.2811585 L6.7407039,61.0428314 L6.72762771,60.9240127 L6.71868084,60.8210517 L6.6475647,59.9978237 L6.51565574,58.3504483 C6.43283985,57.2518916 6.35942964,56.1524157 6.29565452,55.0522503 C6.03986583,50.6529675 5.93755035,46.2348392 6.03825998,41.8194687 C6.13667554,37.4068562 6.41012856,33.0075734 6.82604327,28.6223099 C6.94441723,27.3608083 7.26696333,26.1147049 7.78312886,24.9545555 C8.29814735,23.7937167 9.0047206,22.7195213 9.86476706,21.7871271 C10.7243547,20.8542732 11.7390214,20.0655187 12.8543978,19.4603933 C13.9695447,18.8548081 15.1865483,18.43561 16.4368159,18.2241723 C16.5935008,18.2007303 16.7494975,18.1726918 16.9068707,18.1540761 L16.9068707,18.1540761 L17.3762372,18.1030552 L18.1975139,18.0336485 L19.8398379,17.9037982 C20.9350264,17.8199126 22.0302149,17.7482077 23.1254035,17.6801799 C24.2455974,17.6123819 25.3662501,17.552398 26.4866734,17.4993087 C26.4731384,17.4823018 26.459374,17.465065 26.4458389,17.4480581 C25.7073781,16.50762 24.9911698,15.5508645 24.2919376,14.5816985 L24.2919376,14.5816985 L23.7714133,13.8522385 L23.51356,13.4856699 C23.4275324,13.3636336 23.3408166,13.2418271 23.2678652,13.110368 C23.1203565,12.8481393 23.0129941,12.556723 22.9558718,12.2287648 C22.9017318,11.8985083 22.8909496,11.5365362 22.9953298,11.0911381 C23.4527671,9.13281148 25.2740285,7.85039596 27.2166461,8.01403034 C27.6717894,8.05195123 28.0122293,8.1735279 28.3093112,8.32682022 C28.6031814,8.48195113 28.8468116,8.67408363 29.0507543,8.89540373 C29.1530698,9.00548922 29.2418502,9.12568695 29.3313189,9.24519521 L29.3313189,9.24519521 L29.6001838,9.60371998 L30.1328666,10.3244467 C30.8380634,11.289246 31.5265136,12.266226 32.1922524,13.2595235 C32.8575324,14.2532806 33.5042304,15.2605973 34.1217938,16.2890578 C34.3094487,16.6025372 34.4950388,16.9178551 34.6778761,17.2350116 C37.4016243,17.1878978 40.125143,17.1791645 42.8488911,17.1968609 C43.5962988,17.2026065 44.3441653,17.2120293 45.0918023,17.2232906 C45.2723456,16.9100411 45.4558711,16.59886 45.6410025,16.2890578 C46.2587952,15.2605973 46.9054933,14.2532806 47.5707733,13.2595235 C48.2367415,12.266226 48.9249622,11.289246 49.6299296,10.3244467 L49.6299296,10.3244467 L50.1626124,9.60371998 L50.4314773,9.24519521 C50.5211754,9.12568695 50.6099559,9.00548922 50.7122714,8.89540373 C50.9162141,8.67408363 51.1596148,8.48195113 51.4537145,8.32682022 C51.7507964,8.1735279 52.0912362,8.05195123 52.5463795,8.01403034 Z M30.1292787,34.6305448 C29.9027436,35.0737419 29.7609153,35.5553261 29.7110787,36.0505615 C29.4138374,39.0042999 29.2652168,42.0471726 29.2652168,45.1791797 C29.2652168,48.0068864 29.3863609,50.8345931 29.6286492,53.6622998 L29.7399083,54.8741737 C29.9552063,57.072794 31.9120739,58.6805944 34.1106942,58.4652963 C34.6308013,58.4143652 35.1358879,58.2620098 35.597405,58.0168417 C38.4166275,56.5192079 41.1473744,54.9840008 43.7896457,53.4112203 C45.7989419,52.2152106 47.7645435,50.9930278 49.6864507,49.7446716 L51.1196851,48.8034922 C52.9601471,47.5816163 53.4616102,45.0991009 52.2397342,43.2586389 C51.9555036,42.830514 51.5914399,42.4611683 51.1674532,42.1708009 C48.8122631,40.5578484 46.3529939,38.9884709 43.7896457,37.4626684 C41.5302725,36.1178034 39.2374735,34.835025 36.9112487,33.6143333 L35.5115044,32.8893654 C33.5444304,31.8839182 31.1347259,32.6634708 30.1292787,34.6305448 Z\"></path><filter x=\"-15.4%\"y=\"-16.3%\"width=\"130.9%\"height=\"132.5%\"filterUnits=\"objectBoundingBox\"id=\"0bb3e1ae-f6c9-4254-a22a-e753c086e5a8\"><feOffset dx=\"0\"dy=\"2\"in=\"SourceAlpha\"result=\"shadowOffsetOuter1\"></feOffset><feGaussianBlur stdDeviation=\"1\"in=\"shadowOffsetOuter1\"result=\"shadowBlurOuter1\"></feGaussianBlur><feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0\"type=\"matrix\"in=\"shadowBlurOuter1\"result=\"shadowMatrixOuter1\"></feColorMatrix><feOffset dx=\"0\"dy=\"0\"in=\"SourceAlpha\"result=\"shadowOffsetOuter2\"></feOffset><feGaussianBlur stdDeviation=\"3.5\"in=\"shadowOffsetOuter2\"result=\"shadowBlurOuter2\"></feGaussianBlur><feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0\"type=\"matrix\"in=\"shadowBlurOuter2\"result=\"shadowMatrixOuter2\"></feColorMatrix><feMerge><feMergeNode in=\"shadowMatrixOuter1\"></feMergeNode><feMergeNode in=\"shadowMatrixOuter2\"></feMergeNode></feMerge></filter></defs><g stroke=\"none\"stroke-width=\"1\"fill=\"none\"fill-rule=\"evenodd\"opacity=\"0.8\"><mask id=\"ab6af442-0ec0-4fa1-b1e0-53d5102b9d3a\"fill=\"white\"><use xlink:href=\"#cd9e036b-17ed-4fb1-988d-92dd0e62df02\"></use></mask><g mask=\"url(#ab6af442-0ec0-4fa1-b1e0-53d5102b9d3a)\"><use fill=\"black\"fill-opacity=\"1\"filter=\"url(#0bb3e1ae-f6c9-4254-a22a-e753c086e5a8)\"xlink:href=\"#e9029cf2-058b-4dc3-a369-191aaec4988d\"></use><use fill=\"#FFFFFF\"fill-rule=\"evenodd\"xlink:href=\"#e9029cf2-058b-4dc3-a369-191aaec4988d\"></use></g></g></symbol><symbol id=\"icon-play-xj\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\"><path d=\"M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z\"></path></symbol></svg></div>";
  };
},
/* Recovered original module 33: template-runtime. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 34: template-prototype. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  (function (argument) {
    module.exports = false;
    try {
      module.exports = "[object process]" === Object.prototype.toString.call(argument.process);
    } catch (error) {}
  }).call(exports, requireModule(1));
},
/* Recovered original module 35: danmaku. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument, argument2) {
    if (!(argument instanceof argument2)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (argument3) {
    return typeof argument3;
  } : function (argument4) {
    if (argument4 && "function" == typeof Symbol && argument4.constructor === Symbol && argument4 !== Symbol.prototype) {
      return "symbol";
    } else {
      return typeof argument4;
    }
  };
  var value2 = function () {
    function helper2(argument5, argument6) {
      for (var index = 0; index < argument6.length; index++) {
        var value4 = argument6[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument5, value4.key, value4);
      }
    }
    return function (argument7, argument8, argument9) {
      if (argument8) {
        helper2(argument7.prototype, argument8);
      }
      if (argument9) {
        helper2(argument7, argument9);
      }
      return argument7;
    };
  }();
  var DanmakuExport = function () {
    function Danmaku(options) {
      helper(this, Danmaku);
      this.options = options;
      this.container = this.options.container;
      this.danTunnel = {
        right: {},
        top: {},
        bottom: {}
      };
      this.danIndex = 0;
      this.dan = [];
      this.showing = true;
      this._opacity = this.options.opacity;
      this.events = this.options.events;
      this.unlimited = this.options.unlimited;
      this._displayArea = 100;
      this._displaySize = 100;
      this._displaySpeed = 1;
      this._displayFilters = {right: true, fixed: true, color: true};
      this._unlimitedCursor = {right: 0, top: 0, bottom: 0};
      this._measure("");
      this.load();
    }
    value2(Danmaku, [{
      key: "load",
      value: function () {
        var self = this;
        var generation = this.loadGeneration = (this.loadGeneration || 0) + 1;
        var value5 = undefined;
        value5 = this.options.api.maximum ? this.options.api.address + "&id=" + encodeURIComponent(this.options.api.id) + "&max=" + this.options.api.maximum : this.options.api.address + "&id=" + encodeURIComponent(this.options.api.id);
        var value6 = (this.options.api.addition || []).slice(0);
        value6.push(value5);
        if (window.XplayerDanmakuSources) value6 = [value5];
        if (this.events) {
          this.events.trigger("danmaku_load_start", value6);
        }
        this._readAllEndpoints(value6, function (argument0) {
          if (self.destroyed || generation !== self.loadGeneration) return;
          self.dan = [].concat.apply([], argument0).sort(function (argument1, argument10) {
            return argument1.time - argument10.time;
          });
          if (!self.frameStarted) {
            self.frameStarted = true;
            window.requestAnimationFrame(function () { self.frame(); });
          }
          self.options.callback();
          if (self.events) {
            self.events.trigger("danmaku_load_end");
          }
        });
        this.loadok = 0;
      }
    }, {
      key: "reload",
      value: function (argument11) {
        this.options.api = argument11;
        this.dan = [];
        this.clear();
        this.load();
      }
    }, {
      key: "_readAllEndpoints",
      value: function (argument12, argument13) {
        var self2 = this;
        var items = [];
        var index2 = 0;
        for (var index3 = 0; index3 < argument12.length; ++index3) {
          this.options.apiBackend.read(argument12[index3], function (argument14) {
            return function (argument15, argument16) {
              ++index2;
              if (argument15) {
                if (argument15.response) {
                  self2.options.error(argument15.response.msg);
                } else {
                  self2.options.error("弹幕加载失败：" + argument15.status);
                }
                items[argument14] = [];
              } else {
                items[argument14] = argument16 ? argument16.map(function (argument17) {
                  return {
                    time: argument17[0],
                    type: ["right", "top", "bottom"].includes(argument17[1]) ? argument17[1] : "right",
                    color: argument17[2],
                    author: argument17[3],
                    commentId: argument17[5],
                    playerId: window.XplayerDanmakuSources?.getSelected()?.reportTitle || self2.options.api.id,
                    text: String(argument17[4] || ""),
                    size: argument17[7]
                  };
                }) : [];
              }
              if (index2 === argument12.length) {
                return argument13(items);
              }
            };
          }(index3));
        }
      }
    }, {
      key: "send",
      value: function (argument18, argument19) {
        var options2 = {
          token: this.options.api.token,
          player: this.options.api.id,
          author: this.options.api.user,
          time: this.options.time(),
          text: argument18.text,
          color: argument18.color,
          type: argument18.type,
          size: argument18.size
        };
        var self = this;
        var generation = self.loadGeneration;
        var source = window.XplayerDanmakuSources?.getSelected();
        this.options.apiBackend.send(this.options.api.address, options2, function (error, result) {
          if (error) {
            self.options.error(error.message);
            if (argument19) argument19(error);
            return;
          }
          if (generation !== self.loadGeneration || self.destroyed) {if (argument19) argument19(null);return;}
          options2.commentId = result && result.id;
          options2.playerId = source?.reportTitle || self.options.api.id;
          self.dan.splice(self.danIndex, 0, options2);
          self.danIndex++;
          self.draw(Object.assign({}, options2, {border: '2px solid ' + self.options.borderColor}));
          if (self.events) self.events.trigger('danmaku_send', options2);
          if (argument19) argument19(null);
        });
      }
    }, {
      key: "frame",
      value: function () {
        if (this.destroyed) return;
        var self3 = this;
        if (this.dan.length && !this.paused && this.showing) {
          for (var value7 = this.dan[this.danIndex], items2 = []; value7 && this.options.time() > parseFloat(value7.time);) {
            items2.push(value7);
            value7 = this.dan[++this.danIndex];
          }
          if (this.loadok > 0) {
            this.draw(items2);
          } else {
            this.loadok++;
          }
        }
        window.requestAnimationFrame(function () {
          self3.frame();
        });
      }
    }, {
      key: "opacity",
      value: function (opacity) {
        if (undefined !== opacity) {
          for (var value8 = this.container.getElementsByClassName("xplayer-danmaku-item"), index4 = 0; index4 < value8.length; index4++) {
            value8[index4].style.opacity = opacity;
          }
          this._opacity = opacity;
          if (this.events) {
            this.events.trigger("danmaku_opacity", this._opacity);
          }
        }
        return this._opacity;
      }
    }, {
      key: "displayArea",
      value: function (percent) {
        return this._displayPreference("_displayArea", percent, 25, 100);
      }
    }, {
      key: "displaySize",
      value: function (percent) {
        return this._displayPreference("_displaySize", percent, 50, 150);
      }
    }, {
      key: "displaySpeed",
      value: function (multiplier) {
        return this._displayPreference("_displaySpeed", multiplier, 0.5, 2);
      }
    }, {
      key: "displayFilter",
      value: function (kind, enabled) {
        if (!Object.prototype.hasOwnProperty.call(this._displayFilters, kind)) return undefined;
        if (undefined !== enabled && this._displayFilters[kind] !== !!enabled) {
          this._displayFilters[kind] = !!enabled;
          this._refreshDisplay();
        }
        return this._displayFilters[kind];
      }
    }, {
      key: "_displayPreference",
      value: function (key, input, minimum, maximum) {
        if (undefined !== input && Number.isFinite(Number(input))) {
          var next = Math.max(minimum, Math.min(maximum, Number(input)));
          if (next !== this[key]) {
            this[key] = next;
            this._refreshDisplay();
          }
        }
        return this[key];
      }
    }, {
      key: "_displayColor",
      value: function (color) {
        if (null === color || undefined === color || color === "") return "#fff";
        if (typeof color === "number" || /^\d+$/.test(String(color))) {
          var numeric = Number(color);
          if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 0xffffff) {
            return "#" + numeric.toString(16).padStart(6, "0");
          }
        }
        return String(color);
      }
    }, {
      key: "_displayAllowed",
      value: function (item) {
        var type = item.type || "right";
        if (!Object.prototype.hasOwnProperty.call(this.danTunnel, type)) return false;
        if (!this._displayFilters[type === "right" ? "right" : "fixed"]) return false;
        var color = this._displayColor(item.color).replace(/\s+/g, "").toLowerCase();
        var white = ["#fff", "#ffffff", "white", "rgb(255,255,255)", "rgba(255,255,255,1)"].includes(color);
        return this._displayFilters.color || white;
      }
    }, {
      key: "_animationProgress",
      value: function (element) {
        var state = element._danmakuState;
        if (!state) return 0;
        if (state.staged) return state.progress;
        if (element.getAnimations) {
          var animation = element.getAnimations()[0];
          if (animation && animation.effect) {
            var timing = animation.effect.getComputedTiming && animation.effect.getComputedTiming();
            if (timing && typeof timing.progress === "number") return Math.max(0, Math.min(1, timing.progress));
            var delay = parseFloat(element.style.animationDelay) || 0;
            if (typeof animation.currentTime === "number") {
              return Math.max(0, Math.min(1, (animation.currentTime / 1000 - delay) / state.duration));
            }
          }
        }
        if (state.type === "right") {
          var right = element.getBoundingClientRect().right;
          var containerRight = this.container.getBoundingClientRect().right;
          if (right) return Math.max(0, Math.min(1, (containerRight + state.width - right) / (this.container.offsetWidth + state.width)));
        }
        var now = state.pausedAt || Date.now();
        return Math.max(0, Math.min(1, (now - state.startedAt) / (state.duration * 1000)));
      }
    }, {
      key: "_refreshDisplay",
      value: function () {
        var items = [], states = [];
        var elements = Array.from(this.container.getElementsByClassName("xplayer-danmaku-item"));
        for (var index = 0; index < elements.length; index++) {
          if (!elements[index]._danmakuItem) continue;
          var progress = this._animationProgress(elements[index]);
          if (progress < 1) {
            items.push(elements[index]._danmakuItem);
            states.push({progress: progress, hovered: false});
          }
          elements[index]._danmakuState.active = false;
        }
        this.danTunnel = {right: {}, top: {}, bottom: {}};
        this._unlimitedCursor = {right: 0, top: 0, bottom: 0};
        this.container.innerHTML = "";
        if (items.length) this.draw(items, states);
      }
    }, {
      key: "_animationDuration",
      value: function (type) {
        var probe = this.container.ownerDocument.createElement("div");
        probe.classList.add("xplayer-danmaku-item", "xplayer-danmaku-" + type, "xplayer-danmaku-move");
        probe.style.visibility = "hidden";
        probe.style.animationPlayState = "paused";
        this.container.appendChild(probe);
        var style = getComputedStyle(probe);
        var duration = (style.animationDuration || "").split(",")[0].trim();
        this.fontFamily = style.fontFamily || this.fontFamily;
        this.fontWeight = style.fontWeight || this.fontWeight;
        probe.remove();
        var seconds = parseFloat(duration);
        if (/ms$/.test(duration)) seconds /= 1000;
        if (!(seconds > 0)) seconds = type === "right" ? 13.5 : 4;
        return seconds / this._displaySpeed;
      }
    }, {
      key: "_tunnelFits",
      value: function (previous, element) {
        var oldState = previous._danmakuState, state = element._danmakuState;
        if (!oldState || !oldState.active) return true;
        if (state.type !== "right" || oldState.hovered) return false;
        var width = this.container.offsetWidth;
        var oldProgress = this._animationProgress(previous);
        var left = width - state.progress * (width + state.width);
        var oldRight = width + oldState.width - oldProgress * (width + oldState.width);
        var gap = left - oldRight - 10;
        if (gap <= 0) return false;
        var speed = (width + state.width) / state.duration;
        var oldSpeed = (width + oldState.width) / oldState.duration;
        return speed <= oldSpeed || gap > (speed - oldSpeed) * oldState.duration * (1 - oldProgress);
      }
    }, {
      key: "_allocateTunnel",
      value: function (element, availableHeight) {
        var self = this, state = element._danmakuState;
        var tunnel = this.danTunnel[state.type], maximumTop = availableHeight - state.height;
        if (maximumTop < 0) return -1;
        var tunnels = state.type === "right" ? [tunnel] : [this.danTunnel.top, this.danTunnel.bottom];
        var top = 0;
        while (top <= maximumTop) {
          var blockedBottom = top;
          var actualTop = state.type === "bottom" ? maximumTop - top : top;
          for (var tunnelIndex = 0; tunnelIndex < tunnels.length; tunnelIndex++) {
            for (var key in tunnels[tunnelIndex]) {
              var members = tunnels[tunnelIndex][key];
              for (var index = 0; index < members.length; index++) {
                var previous = members[index], oldState = previous._danmakuState;
                if (!oldState || !oldState.active || oldState.actualTop + oldState.height <= actualTop || oldState.actualTop >= actualTop + state.height) continue;
                if (!this._tunnelFits(previous, element)) {
                  var next = state.type === "bottom" ? availableHeight - oldState.actualTop : oldState.actualTop + oldState.height;
                  blockedBottom = Math.max(blockedBottom, next);
                }
              }
            }
          }
          if (blockedBottom === top) break;
          top = Math.ceil(blockedBottom);
        }
        if (top > maximumTop) {
          if (!this.unlimited) return -1;
          var rows = Math.max(1, Math.floor(availableHeight / state.height));
          top = (this._unlimitedCursor[state.type]++ % rows) * state.height;
        }
        state.top = top;
        state.actualTop = state.type === "bottom" ? maximumTop - top : top;
        tunnel[top] ||= [];
        tunnel[top].push(element);
        element.addEventListener("animationend", function () {
          state.active = false;
          var members = self.danTunnel[state.type][top];
          if (!members) return;
          var index = members.indexOf(element);
          if (index >= 0) members.splice(index, 1);
          if (!members.length) delete self.danTunnel[state.type][top];
        });
        return top;
      }
    }, {
      key: "draw",
      value: function (argument20, restoreStates) {
        var self4 = this;
        if (this.showing) {
          var offsetWidth = this.container.offsetWidth;
          var offsetHeight = this.container.offsetHeight;
          var availableHeight = offsetHeight * this._displayArea / 100;
          var durations = {}, drawn = [];
          if ("[object Array]" !== Object.prototype.toString.call(argument20)) {
            argument20 = [argument20];
          }
          var doc = this.container.ownerDocument;
          var value0 = doc.createDocumentFragment();
          for (var index5 = 0; index5 < argument20.length; index5++) {
            (function (argument27) {
              var item = argument20[argument27];
              if (!item || !self4._displayAllowed(item)) return;
              var type = item.type || "right";
              var restore = restoreStates && restoreStates[argument27];
              var progress = restore ? restore.progress : 0;
              if (progress >= 1) return;
              var value15 = doc.createElement("div");
              var canReport = !window.XplayerDanmakuSources || window.XplayerDanmakuSources.canReport();
              if (canReport) value15.addEventListener("click", function () {
                window.XGGM.danmu.report(String(item.commentId || ''), String(item.playerId || ''), String(item.text), String(item.author || ''));
              });
              value15.setAttribute("style", "pointer-events: auto !important;cursor:" + (canReport ? 'pointer' : 'default') + ";");
              if (canReport) {value15.setAttribute("data-balloon", "点击举报此弹幕");value15.setAttribute("data-balloon-pos", "down");}
              value15.addEventListener("mouseenter", function () {
                value15._danmakuState.hovered = true;
                value15._danmakuState.pausedAt ||= Date.now();
                value15.style.animationPlayState = "paused";
              });
              value15.addEventListener("mouseleave", function () {
                var state = value15._danmakuState;
                state.hovered = false;
                if (!self4.paused && state.pausedAt) {
                  state.startedAt += Date.now() - state.pausedAt;
                  state.pausedAt = 0;
                }
                value15.style.animationPlayState = "";
              });
              value15.classList.add("xplayer-danmaku-item");
              value15.classList.add("xplayer-danmaku-" + type);
              if(window.XplayerDanmakuContent)window.XplayerDanmakuContent.render(value15,item.text);
              else value15.textContent = String(item.text || '');
              if (item.border) value15.style.borderBottom = item.border;
              value15.style.opacity = self4._opacity;
              value15.style.color = self4._displayColor(item.color);
              var fontSize = window.XplayerDanmakuContent ? window.XplayerDanmakuContent.fontSize(item.size,doc) : parseFloat(item.size)||27.5;
              fontSize *= self4._displaySize / 100;
              value15.style.setProperty("font-size", fontSize + "px", "important");
              var hasBadge = window.XplayerDanmakuContent && window.XplayerDanmakuContent.parts && window.XplayerDanmakuContent.parts(item.text).some(function (part) {return !!part.badge;});
              var height = Math.ceil(Math.max((self4.options.height || 30) * self4._displaySize / 100, fontSize * (hasBadge ? 1.667 : 1.125) + 2));
              durations[type] ||= self4._animationDuration(type);
              var value16 = self4._measure(item.text,fontSize) + 1;
              value15._danmakuItem = item;
              value15._danmakuState = {
                type: type, width: value16, height: height, duration: durations[type], progress: progress,
                staged: true, active: true, hovered: !!(restore && restore.hovered),
                startedAt: Date.now() - progress * durations[type] * 1000,
                pausedAt: self4.paused || restore && restore.hovered ? Date.now() : 0
              };
              value15.style.height = height + "px";
              value15.style.animationDuration = durations[type] + "s";
              value15.style.webkitAnimationDuration = durations[type] + "s";
              if (progress) {
                value15.style.animationDelay = -progress * durations[type] + "s";
                value15.style.webkitAnimationDelay = value15.style.animationDelay;
              }
              if (restore && restore.hovered) value15.style.animationPlayState = "paused";
              value15.addEventListener("animationend", function () {
                value15.remove();
              });
              var value17 = self4._allocateTunnel(value15, availableHeight);
              if (value17 >= 0) {
                if (type === "bottom") value15.style.bottom = offsetHeight - availableHeight + value17 + "px";
                else value15.style.top = value17 + "px";
                if (type === "right") {
                  value15.style.width = value16 + "px";
                  value15.style.transform = "translateX(-" + offsetWidth + "px)";
                }
                value15.classList.add("xplayer-danmaku-move");
                value0.appendChild(value15);
                drawn.push(value15);
              } else {
                value15._danmakuState.active = false;
              }
            })(index5);
          }
          this.container.appendChild(value0);
          for (var index = 0; index < drawn.length; index++) drawn[index]._danmakuState.staged = false;
          return value0;
        }
      }
    }, {
      key: "play",
      value: function () {
        this.paused = false;
        var elements = this.container.getElementsByClassName("xplayer-danmaku-item"), now = Date.now();
        for (var index = 0; index < elements.length; index++) {
          var state = elements[index]._danmakuState;
          if (state && state.pausedAt && !state.hovered) {
            state.startedAt += now - state.pausedAt;
            state.pausedAt = 0;
          }
        }
      }
    }, {
      key: "pause",
      value: function () {
        this.paused = true;
        var elements = this.container.getElementsByClassName("xplayer-danmaku-item");
        for (var index = 0; index < elements.length; index++) {
          var state = elements[index]._danmakuState;
          if (state && !state.pausedAt) state.pausedAt = Date.now();
        }
      }
    }, {
      key: "_measure",
      value: function (argument28,fontSize) {
        if (!this.context) {
          var value18 = getComputedStyle(this.container.getElementsByClassName("xplayer-danmaku-item")[0]||this.container, null);
          this.context = document.createElement("canvas").getContext("2d");
          this.fontFamily = value18.fontFamily||'sans-serif';this.fontWeight=value18.fontWeight||'normal';
        }
        fontSize=fontSize||27.5;this.context.font=this.fontWeight+' '+fontSize+'px '+this.fontFamily;
        if(window.XplayerDanmakuContent)return window.XplayerDanmakuContent.measure(this.context,argument28,fontSize);
        return this.context.measureText(argument28).width;
      }
    }, {
      key: "seek",
      value: function () {
        this.clear();
        for (var danIndex = 0; danIndex < this.dan.length; danIndex++) {
          if (this.dan[danIndex].time >= this.options.time()) {
            this.danIndex = danIndex;
            break;
          }
          this.danIndex = this.dan.length;
        }
      }
    }, {
      key: "clear",
      value: function () {
        var elements = this.container.getElementsByClassName("xplayer-danmaku-item");
        for (var index = 0; index < elements.length; index++) {
          if (elements[index]._danmakuState) elements[index]._danmakuState.active = false;
        }
        this.danTunnel = {
          right: {},
          top: {},
          bottom: {}
        };
        this._unlimitedCursor = {right: 0, top: 0, bottom: 0};
        this.danIndex = 0;
        this.options.container.innerHTML = "";
        if (this.events) {
          this.events.trigger("danmaku_clear");
        }
      }
    }, {
      key: "htmlEncode",
      value: function (argument29) {
        return argument29.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2f;");
      }
    }, {
      key: "resize",
      value: function () {
        this._refreshDisplay();
      }
    }, {
      key: "hide",
      value: function () {
        this.showing = false;
        this.pause();
        this.clear();
        if (this.events) {
          this.events.trigger("danmaku_hide");
        }
      }
    }, {
      key: "show",
      value: function () {
        this.seek();
        this.showing = true;
        this.play();
        if (this.events) {
          this.events.trigger("danmaku_show");
        }
      }
    }, {
      key: "unlimit",
      value: function (unlimited) {
        this.unlimited = unlimited;
      }
    }]);
    return Danmaku;
  }();
  exports.default = DanmakuExport;
},
/* Recovered original module 36: events. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 37: fullscreen. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
        var value4 = argument4[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument3, value4.key, value4);
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
  var utilsModule = requireModule(0);
  var value2 = function (argument8) {
    if (argument8 && argument8.__esModule) {
      return argument8;
    } else {
      return {
        default: argument8
      };
    }
  }(utilsModule);
  var FullscreenExport = function () {
    function Fullscreen(player) {
      var self = this;
      helper(this, Fullscreen);
      this.player = player;
      this.container = player.container;
      this.video = player.video;
      this.destroyed = false;
      this.browserFullscreenActive = false;
      this.nativeVideoFullscreen = false;
      this.orientationFullscreenActive = false;
      this.orientationFullscreenMode = "";
      this.orientationSession = 0;
      this.orientationLockPending = false;
      this.orientationLockOwned = false;
      this.player.events.on("webfullscreen", function () {
        self.player.resize();
        self.syncOrientation();
      });
      this.player.events.on("webfullscreen_cancel", function () {
        self.player.resize();
        self.syncOrientation();
        if (self.lastScrollPosition) value2.default.setScrollPosition(self.lastScrollPosition);
      });
      this.onFullscreenChange = function () {
        if (self.destroyed) return;
        var active = self.isPlayerFullscreen();
        if (active !== self.browserFullscreenActive) {
          self.browserFullscreenActive = active;
          self.player.resize();
          if (active) {
            self.player.events.trigger("fullscreen");
          } else {
            if (self.lastScrollPosition) value2.default.setScrollPosition(self.lastScrollPosition);
            self.player.events.trigger("fullscreen_cancel");
          }
        }
        self.syncOrientation();
      };
      this.fullscreenChangeEvents = ["fullscreenchange", "mozfullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"];
      this.fullscreenChangeEvents.forEach(function (event) {
        document.addEventListener(event, self.onFullscreenChange);
        self.container.addEventListener(event, self.onFullscreenChange);
      });
      this.onNativeFullscreenBegin = function () {
        self.nativeVideoFullscreen = true;
        self.onFullscreenChange();
      };
      this.onNativeFullscreenEnd = function () {
        self.nativeVideoFullscreen = false;
        self.onFullscreenChange();
      };
      this.video.addEventListener("webkitbeginfullscreen", this.onNativeFullscreenBegin);
      this.video.addEventListener("webkitendfullscreen", this.onNativeFullscreenEnd);
      this.player.events.on("destroy", function () {
        self.destroyed = true;
        self.orientationFullscreenActive = false;
        self.orientationFullscreenMode = "";
        self.orientationSession++;
        self.releaseOrientation();
        self.fullscreenChangeEvents.forEach(function (event) {
          document.removeEventListener(event, self.onFullscreenChange);
          self.container.removeEventListener(event, self.onFullscreenChange);
        });
        self.video.removeEventListener("webkitbeginfullscreen", self.onNativeFullscreenBegin);
        self.video.removeEventListener("webkitendfullscreen", self.onNativeFullscreenEnd);
      });
    }
    value(Fullscreen, [{
      key: "isFullScreen",
      value: function () {
        switch (arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser") {
          case "browser":
            return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement || this.nativeVideoFullscreen;
          case "web":
            return this.container.classList.contains("xplayer-fulled");
        }
      }
    }, {
      key: "isPlayerFullscreen",
      value: function () {
        var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        return !!(this.nativeVideoFullscreen || element && (element === this.container || this.container.contains(element)));
      }
    }, {
      key: "syncOrientation",
      value: function () {
        if (this.destroyed) return;
        var mode = this.isPlayerFullscreen() ? "browser" : this.isFullScreen("web") ? "web" : "";
        var active = !!mode;
        if (mode === this.orientationFullscreenMode) return;
        this.orientationFullscreenActive = active;
        this.orientationFullscreenMode = mode;
        this.orientationSession++;
        if (active) this.requestLandscape();
        else this.releaseOrientation();
      }
    }, {
      key: "requestLandscape",
      value: function () {
        var self = this;
        var navigator = window.navigator;
        var mobile = value2.default.isMobile || /android|ipad|iphone|ipod/i.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        if (!mobile || this.destroyed || this.orientationLockOwned || this.orientationLockPending) return;
        var screen = window.screen;
        if (!screen) return;
        var orientation = screen.orientation;
        var target = orientation && typeof orientation.lock === "function" ? orientation : screen;
        var lock = target === orientation ? orientation.lock : screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.webkitLockOrientation;
        var unlock = target === orientation ? orientation.unlock : screen.unlockOrientation || screen.mozUnlockOrientation || screen.msUnlockOrientation || screen.webkitUnlockOrientation;
        if (typeof lock !== "function") return;
        var session = this.orientationSession;
        this.orientationLockPending = true;
        try {
          // Modern mobile browsers require real fullscreen before accepting a lock.
          var result = lock.call(target, "landscape");
          Promise.resolve(result).then(function (locked) {
            self.orientationLockPending = false;
            if (locked === false) return;
            self.orientationLockOwned = true;
            self.orientationUnlock = typeof unlock === "function" ? function () { unlock.call(target); } : null;
            // An exit or destruction can happen while the orientation promise is pending.
            if (self.destroyed || !self.orientationFullscreenActive) self.releaseOrientation();
          }, function () {
            self.orientationLockPending = false;
            // A new entry may have occurred while an earlier request was pending.
            if (!self.destroyed && self.orientationFullscreenActive && session !== self.orientationSession) self.requestLandscape();
          });
        } catch (_) {
          this.orientationLockPending = false;
        }
      }
    }, {
      key: "releaseOrientation",
      value: function () {
        if (!this.orientationLockOwned) return;
        this.orientationLockOwned = false;
        var unlock = this.orientationUnlock;
        this.orientationUnlock = null;
        try {
          if (unlock) unlock();
        } catch (_) {}
      }
    }, {
      key: "request",
      value: function () {
        var value5 = arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser";
        var value6 = "browser" === value5 ? "web" : "browser";
        var value7 = this.isFullScreen(value6);
        if (!value7) {
          this.lastScrollPosition = value2.default.getScrollPosition();
        }
        switch (value5) {
          case "browser":
            var self = this;
            var request = this.container.requestFullscreen || this.container.mozRequestFullScreen || this.container.webkitRequestFullscreen || this.container.msRequestFullscreen;
            try {
              if (request) {
                Promise.resolve(request.call(this.container)).then(function () {
                  self.onFullscreenChange();
                }, function () {});
              } else if (this.video.webkitEnterFullscreen) {
                this.video.webkitEnterFullscreen();
              }
            } catch (_) {}
            break;
          case "web":
            this.player.container.classList.add("xplayer-fulled");
            document.body.classList.add("xplayer-web-fullscreen-fix");
            this.player.events.trigger("webfullscreen");
        }
        if (value7) {
          this.cancel(value6);
        }
      }
    }, {
      key: "cancel",
      value: function () {
        switch (arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser") {
          case "browser":
            var self = this;
            var exit = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.webkitCancelFullScreen || document.msExitFullscreen;
            try {
              if (this.nativeVideoFullscreen && this.video.webkitExitFullscreen) {
                this.video.webkitExitFullscreen();
              } else if (exit) {
                Promise.resolve(exit.call(document)).then(function () {
                  self.onFullscreenChange();
                }, function () {});
              }
            } catch (_) {}
            break;
          case "web":
            this.player.container.classList.remove("xplayer-fulled");
            document.body.classList.remove("xplayer-web-fullscreen-fix");
            this.player.events.trigger("webfullscreen_cancel");
        }
      }
    }, {
      key: "toggle",
      value: function () {
        var value8 = arguments.length > 0 && undefined !== arguments[0] ? arguments[0] : "browser";
        if (this.isFullScreen(value8)) {
          this.cancel(value8);
        } else {
          this.request(value8);
        }
      }
    }]);
    return Fullscreen;
  }();
  exports.default = FullscreenExport;
},
/* Recovered original module 38: preferences. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
        var value4 = argument4[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument3, value4.key, value4);
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
  var utilsModule = requireModule(0);
  var value2 = function (argument8) {
    if (argument8 && argument8.__esModule) {
      return argument8;
    } else {
      return {
        default: argument8
      };
    }
  }(utilsModule);
  var PreferencesExport = function () {
    function Preferences(argument9) {
      helper(this, Preferences);
      this.storageName = {
        opacity: "xplayer-danmaku-opacity",
        volume: "xplayer-volume",
        unlimited: "xplayer-danmaku-unlimited",
        danmaku: "xplayer-danmaku-show",
        displayArea: "xplayer-danmaku-display-area",
        displaySize: "xplayer-danmaku-display-size",
        displaySpeed: "xplayer-danmaku-display-speed",
        displayRight: "xplayer-danmaku-display-right",
        displayFixed: "xplayer-danmaku-display-fixed",
        displayColor: "xplayer-danmaku-display-color",
        subtitle: "xplayer-subtitle-show"
      };
      this.default = {
        opacity: 0.7,
        volume: argument9.options.volume || 0.7,
        unlimited: (argument9.options.danmaku && argument9.options.danmaku.unlimited ? 1 : 0) || 0,
        danmaku: 1,
        displayArea: 100,
        displaySize: 100,
        displaySpeed: 1,
        displayRight: 1,
        displayFixed: 1,
        displayColor: 1,
        subtitle: 1
      };
      this.data = {};
      this.init();
    }
    value(Preferences, [{
      key: "init",
      value: function () {
        for (var value5 in this.storageName) {
          var value6 = this.storageName[value5];
          var stored = value2.default.storage.get(value6);
          var parsed = stored === null || stored === undefined || stored === "" ? this.default[value5] : parseFloat(stored);
          this.data[value5] = Number.isFinite(parsed) ? parsed : this.default[value5];
        }
      }
    }, {
      key: "get",
      value: function (argument0) {
        return this.data[argument0];
      }
    }, {
      key: "set",
      value: function (argument1, argument10) {
        this.data[argument1] = argument10;
        value2.default.storage.set(this.storageName[argument1], argument10);
      }
    }]);
    return Preferences;
  }();
  exports.default = PreferencesExport;
},
/* Recovered original module 39: subtitle. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
},
/* Recovered original module 40: bar. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
  var BarExport = function () {
    function Bar(argument8) {
      helper(this, Bar);
      this.elements = {};
      this.elements.volume = argument8.volumeBar;
      this.elements.played = argument8.playedBar;
      this.elements.loaded = argument8.loadedBar;
      this.elements.danmaku = argument8.danmakuOpacityBar;
    }
    value(Bar, [{
      key: "set",
      value: function (argument9, argument0, argument1) {
        argument0 = Math.max(argument0, 0);
        argument0 = Math.min(argument0, 1);
        this.elements[argument9].style[argument1] = 100 * argument0 + "%";
      }
    }, {
      key: "get",
      value: function (argument10) {
        return parseFloat(this.elements[argument10].style.width) / 100;
      }
    }]);
    return Bar;
  }();
  exports.default = BarExport;
},
/* Recovered original module 41: timer. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
        var value4 = argument4[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument3, value4.key, value4);
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
  var utilsModule = requireModule(0);
  var value2 = function (argument8) {
    if (argument8 && argument8.__esModule) {
      return argument8;
    } else {
      return {
        default: argument8
      };
    }
  }(utilsModule);
  var TimerExport = function () {
    function Timer(player) {
      helper(this, Timer);
      this.player = player;
      window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (argument9) {
          window.setTimeout(argument9, 16.666666666666668);
        };
      }();
      this.types = ["loading", "progress", "info", "fps"];
      this.init();
    }
    value(Timer, [{
      key: "init",
      value: function () {
        for (var index2 = 0; index2 < this.types.length; index2++) {
          var value5 = this.types[index2];
          if ("fps" !== value5) {
            this["init" + value5 + "Checker"]();
          }
        }
      }
    }, {
      key: "initloadingChecker",
      value: function () {
        var self = this;
        var index3 = 0;
        var index4 = 0;
        var value6 = false;
        this.loadingChecker = setInterval(function () {
          if (self.enableloadingChecker) {
            index4 = self.player.video.currentTime;
            if (!value6 && !(index4 !== index3) && !self.player.video.paused) {
              self.player.container.classList.add("xplayer-loading");
              value6 = true;
            }
            if (value6 && index4 > index3 && !self.player.video.paused) {
              self.player.container.classList.remove("xplayer-loading");
              value6 = false;
            }
            index3 = index4;
          }
        }, 100);
      }
    }, {
      key: "initprogressChecker",
      value: function () {
        var self2 = this;
        this.progressChecker = setInterval(function () {
          if (self2.enableprogressChecker) {
            self2.player.bar.set("played", self2.player.video.currentTime / self2.player.video.duration, "width");
            var value7 = value2.default.secondToTime(self2.player.video.currentTime);
            if (self2.player.template.ptime.innerHTML !== value7) {
              self2.player.template.ptime.innerHTML = value2.default.secondToTime(self2.player.video.currentTime);
            }
          }
        }, 100);
      }
    }, {
      key: "initfpsChecker",
      value: function () {
        var self3 = this;
        window.requestAnimationFrame(function () {
          if (self3.enablefpsChecker) {
            self3.initfpsChecker();
            if (self3.fpsStart) {
              self3.fpsIndex++;
              var value8 = new Date();
              if (value8 - self3.fpsStart > 1000) {
                self3.player.infoPanel.fps(self3.fpsIndex / (value8 - self3.fpsStart) * 1000);
                self3.fpsStart = new Date();
                self3.fpsIndex = 0;
              }
            } else {
              self3.fpsStart = new Date();
              self3.fpsIndex = 0;
            }
          } else {
            self3.fpsStart = 0;
            self3.fpsIndex = 0;
          }
        });
      }
    }, {
      key: "initinfoChecker",
      value: function () {
        var self4 = this;
        this.infoChecker = setInterval(function () {
          if (self4.enableinfoChecker) {
            self4.player.infoPanel.update();
          }
        }, 1000);
      }
    }, {
      key: "enable",
      value: function (argument0) {
        this["enable" + argument0 + "Checker"] = true;
        if ("fps" === argument0) {
          this.initfpsChecker();
        }
      }
    }, {
      key: "disable",
      value: function (argument1) {
        this["enable" + argument1 + "Checker"] = false;
      }
    }, {
      key: "destroy",
      value: function (argument10) {
        if (this[argument10 + "Checker"]) {
          clearInterval(this[argument10 + "Checker"]);
        }
      }
    }]);
    return Timer;
  }();
  exports.default = TimerExport;
},
/* Recovered original module 42: bezel. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
  var BezelExport = function () {
    function Bezel(container) {
      var self = this;
      helper(this, Bezel);
      this.container = container;
      this.container.addEventListener("animationend", function () {
        self.container.classList.remove("xplayer-bezel-transition");
      });
    }
    value(Bezel, [{
      key: "switch",
      value: function (argument8) {
        this.container.innerHTML = argument8;
        this.container.classList.add("xplayer-bezel-transition");
      }
    }]);
    return Bezel;
  }();
  exports.default = BezelExport;
},
/* Recovered original module 43: controller. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (argument && argument.__esModule) {
      return argument;
    } else {
      return {
        default: argument
      };
    }
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index = 0; index < argument5.length; index++) {
        var value6 = argument5[index];
        value6.enumerable = value6.enumerable || false;
        value6.configurable = true;
        if ("value" in value6) {
          value6.writable = true;
        }
        Object.defineProperty(argument4, value6.key, value6);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var utilsModule = requireModule(0);
  var value2 = helper(utilsModule);
  var thumbnailsModule = requireModule(44);
  var value3 = helper(thumbnailsModule);
  var iconsModule = requireModule(2);
  var value4 = helper(iconsModule);
  var ControllerExport = function () {
    function Controller(player) {
      var self = this;
      helper2(this, Controller);
      this.player = player;
      this.autoHideTimer = 0;
      if (!value2.default.isMobile) {
        this.player.container.addEventListener("mousemove", function () {
          self.setAutoHide();
        });
        this.player.container.addEventListener("click", function () {
          self.setAutoHide();
        });
        this.player.on("play", function () {
          self.setAutoHide();
        });
        this.player.on("pause", function () {
          self.setAutoHide();
        });
      }
      this.initPlayButton();
      this.initThumbnails();
      this.initPlayedBar();
      this.initFullButton();
      this.initQualityButton();
      this.initScreenshotButton();
      this.initSubtitleButton();
      this.initVolumeButton();
    }
    value(Controller, [{
      key: "initPlayButton",
      value: function () {
        var self2 = this;
        this.player.template.playButton.addEventListener("click", function () {
          self2.player.toggle();
        });
        if (value2.default.isMobile) {
          this.player.template.videoWrap.addEventListener("click", function () {
            self2.toggle();
          });
          this.player.template.controllerMask.addEventListener("click", function () {
            self2.toggle();
          });
        } else {
          this.player.template.videoWrap.addEventListener("click", function () {
            self2.player.toggle();
          });
          this.player.template.controllerMask.addEventListener("click", function () {
            self2.player.toggle();
          });
        }
      }
    }, {
      key: "initThumbnails",
      value: function () {
        var self3 = this;
        if (this.player.options.video.thumbnails) {
          this.thumbnails = new value3.default({
            container: this.player.template.barPreview,
            barWidth: this.player.template.barWrap.offsetWidth,
            url: this.player.options.video.thumbnails,
            events: this.player.events
          });
          this.player.on("loadedmetadata", function () {
            self3.thumbnails.resize(160, self3.player.video.videoHeight / self3.player.video.videoWidth * 160);
          });
        }
      }
    }, {
      key: "initPlayedBar",
      value: function () {
        var self4 = this;
        var bar = this.player.template.playedBarWrap;
        var pointerEvents = !!window.PointerEvent;
        var startEvent = pointerEvents ? "pointerdown" : value2.default.nameMap.dragStart;
        var moveEvent = pointerEvents ? "pointermove" : value2.default.nameMap.dragMove;
        var endEvent = pointerEvents ? "pointerup" : value2.default.nameMap.dragEnd;
        var cancelEvent = pointerEvents ? "pointercancel" : "touchcancel";
        var previousTouchAction = bar.style.touchAction;
        var drag = null;
        var disposed = false;
        bar.style.touchAction = "none";

        function clientX(event) {
          if (typeof event.clientX === "number") return event.clientX;
          var point = event.changedTouches && event.changedTouches[0] || event.touches && event.touches[0];
          return point ? point.clientX : NaN;
        }
        function fraction(event) {
          // Mouse coordinates and this rect share the owning window's CSS/zoom space.
          var bounds = bar.getBoundingClientRect(), x = clientX(event);
          if (!bounds.width || !Number.isFinite(x)) return null;
          return Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
        }
        function validDuration() {
          return Number.isFinite(self4.player.video.duration) && self4.player.video.duration > 0;
        }
        function paint(position, time) {
          self4.player.bar.set("played", position, "width");
          self4.player.template.ptime.textContent = value2.default.secondToTime(typeof time === "number" ? time : position * self4.player.video.duration);
        }
        function syncPausedPosition() {
          // The periodic progress checker is paused with playback. Keyboard,
          // resume and external seeks still need to update the visible time.
          if (!disposed && !drag && self4.player.video.paused && validDuration()) {
            var time = Math.max(0, Math.min(self4.player.video.duration, self4.player.video.currentTime));
            paint(time / self4.player.video.duration, time);
          }
        }
        this.player.on("seeking", syncPausedPosition);
        this.player.on("seeked", syncPausedPosition);
        this.player.on("timeupdate", syncPausedPosition);
        function matches(event) {
          return drag && (!pointerEvents || event.pointerId === drag.pointerId);
        }
        function moveDrag(event) {
          if (!matches(event)) return;
          var position = fraction(event);
          if (position !== null) {drag.position = position;paint(position);}
          if (event.cancelable) event.preventDefault();
        }
        function finishDrag(event, commit) {
          if (!drag || event && !matches(event)) return;
          var session = drag;
          if (commit && event) {
            var position = fraction(event);
            if (position !== null) session.position = position;
          }
          drag = null;
          session.document.removeEventListener(moveEvent, moveDrag, true);
          session.document.removeEventListener(endEvent, endDrag, true);
          session.document.removeEventListener(cancelEvent, cancelDrag, true);
          session.window.removeEventListener("blur", cancelDrag);
          try {if (pointerEvents && bar.hasPointerCapture(session.pointerId)) bar.releasePointerCapture(session.pointerId);} catch (_) {}
          try {
            if (commit && validDuration()) self4.player.seek(session.position * self4.player.video.duration);
            else if (validDuration()) paint(self4.player.video.currentTime / self4.player.video.duration);
          } finally {
            self4.player.time.enable("progress");
            self4.disableAutoHide = session.autoHide;
            self4.setAutoHide();
          }
          if (!commit || session.touch) hideHover();
        }
        function endDrag(event) {finishDrag(event, true);}
        function cancelDrag(event) {finishDrag(event && event.type !== "blur" ? event : null, false);}
        function beginDrag(event) {
          if (drag || event.isPrimary === false || typeof event.button === "number" && event.button !== 0 || !validDuration()) return;
          var position = fraction(event);
          if (position === null) return;
          // Document PiP adopts the existing player into another document.
          var owner = bar.ownerDocument;
          drag = {document: owner, window: owner.defaultView, pointerId: event.pointerId,
            position: position, autoHide: self4.disableAutoHide, touch: event.pointerType === "touch" || event.type === "touchstart"};
          self4.disableAutoHide = true;self4.show();self4.player.time.disable("progress");
          owner.addEventListener(moveEvent, moveDrag, {capture: true, passive: false});
          owner.addEventListener(endEvent, endDrag, true);
          owner.addEventListener(cancelEvent, cancelDrag, true);
          drag.window.addEventListener("blur", cancelDrag);
          try {if (pointerEvents) bar.setPointerCapture(event.pointerId);} catch (_) {}
          paint(position);
          if (event.cancelable) event.preventDefault();
        }
        function moveHover(event) {
          if (!validDuration()) return;
          var bounds = bar.getBoundingClientRect(), x = clientX(event) - bounds.left;
          if (!bounds.width || !Number.isFinite(x) || x < 0 || x > bounds.width) return;
          var position = x / bounds.width, localX = position * bar.clientWidth;
          if (self4.thumbnails) {self4.thumbnails.show();self4.thumbnails.move(localX);}
          self4.player.template.playedBarTime.style.left = localX - 20 + "px";
          self4.player.template.playedBarTime.textContent = value2.default.secondToTime(position * self4.player.video.duration);
          self4.player.template.playedBarTime.classList.remove("hidden");
        }
        function hideHover() {
          if (self4.thumbnails) self4.thumbnails.hide();
          self4.player.template.playedBarTime.classList.add("hidden");
        }
        var enterEvent = pointerEvents ? "pointerenter" : "mouseenter";
        var leaveEvent = pointerEvents ? "pointerleave" : "mouseleave";
        bar.addEventListener(startEvent, beginDrag, {passive: false});
        bar.addEventListener(moveEvent, moveHover, {passive: true});
        bar.addEventListener(enterEvent, moveHover, {passive: true});
        bar.addEventListener(leaveEvent, hideHover);
        if (pointerEvents) bar.addEventListener("lostpointercapture", cancelDrag);
        this.progressDragCleanup = function () {
          disposed = true;
          finishDrag(null, false);
          bar.removeEventListener(startEvent, beginDrag);
          bar.removeEventListener(moveEvent, moveHover);
          bar.removeEventListener(enterEvent, moveHover);
          bar.removeEventListener(leaveEvent, hideHover);
          if (pointerEvents) bar.removeEventListener("lostpointercapture", cancelDrag);
          bar.style.touchAction = previousTouchAction;
        };
      }
    }, {
      key: "initFullButton",
      value: function () {
        var self5 = this;
        this.player.template.browserFullButton.addEventListener("click", function () {
          self5.player.fullScreen.toggle("browser");
        });
        this.player.template.webFullButton.addEventListener("click", function () {
          self5.player.fullScreen.toggle("web");
        });
      }
    }, {
      key: "initVolumeButton",
      value: function () {
        var self6 = this;
        function helper7(argument10) {
          var value10 = argument10 || window.event;
          var value11 = ((value10.clientX || value10.changedTouches[0].clientX) - value2.default.getElementViewLeft(self6.player.template.volumeBarWrap) - 5.5) / 35;
          self6.player.volume(value11);
        }
        var helper8 = function value12() {
          document.removeEventListener(value2.default.nameMap.dragEnd, value12);
          document.removeEventListener(value2.default.nameMap.dragMove, helper7);
          self6.player.template.volumeButton.classList.remove("xplayer-volume-active");
        };
        this.player.template.volumeBarWrapWrap.addEventListener("click", function (argument11) {
          var value13 = argument11 || window.event;
          var value14 = ((value13.clientX || value13.changedTouches[0].clientX) - value2.default.getElementViewLeft(self6.player.template.volumeBarWrap) - 5.5) / 35;
          self6.player.volume(value14);
        });
        this.player.template.volumeBarWrapWrap.addEventListener(value2.default.nameMap.dragStart, function () {
          document.addEventListener(value2.default.nameMap.dragMove, helper7);
          document.addEventListener(value2.default.nameMap.dragEnd, helper8);
          self6.player.template.volumeButton.classList.add("xplayer-volume-active");
        });
        this.player.template.volumeIcon.addEventListener("click", function () {
          if (self6.player.video.muted) {
            self6.player.video.muted = false;
            self6.player.switchVolumeIcon();
            self6.player.bar.set("volume", self6.player.volume(), "width");
          } else {
            self6.player.video.muted = true;
            self6.player.template.volumeIcon.innerHTML = value4.default.volumeOff;
            self6.player.bar.set("volume", 0, "width");
          }
        });
      }
    }, {
      key: "initQualityButton",
      value: function () {
        var self7 = this;
        if (this.player.options.video.quality) {
          this.player.template.qualityList.addEventListener("click", function (argument12) {
            if (argument12.target.classList.contains("xplayer-quality-item")) {
              self7.player.switchQuality(argument12.target.dataset.index);
            }
          });
        }
      }
    }, {
      key: "initScreenshotButton",
      value: function () {
        var self8 = this;
        if (this.player.options.screenshot) {
          this.player.template.camareButton.addEventListener("click", function () {
            var value15 = document.createElement("canvas");
            value15.width = self8.player.video.videoWidth;
            value15.height = self8.player.video.videoHeight;
            value15.getContext("2d").drawImage(self8.player.video, 0, 0, value15.width, value15.height);
            var value16 = value15.toDataURL();
            self8.player.template.camareButton.href = value16;
            self8.player.template.camareButton.download = "xplayer.png";
            self8.player.events.trigger("screenshot", value16);
          });
        }
      }
    }, {
      key: "initSubtitleButton",
      value: function () {
        var self9 = this;
        if (this.player.options.subtitle) {
          this.player.events.on("subtitle_show", function () {
            self9.player.template.subtitleButton.dataset.balloon = self9.player.tran("Hide subtitle");
            self9.player.template.subtitleButtonInner.style.opacity = "";
            self9.player.user.set("subtitle", 1);
          });
          this.player.events.on("subtitle_hide", function () {
            self9.player.template.subtitleButton.dataset.balloon = self9.player.tran("Show subtitle");
            self9.player.template.subtitleButtonInner.style.opacity = "0.4";
            self9.player.user.set("subtitle", 0);
          });
          this.player.template.subtitleButton.addEventListener("click", function () {
            self9.player.subtitle.toggle();
          });
        }
      }
    }, {
      key: "setAutoHide",
      value: function () {
        var self0 = this;
        this.show();
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(function () {
          if (!!self0.player.video.played.length && !self0.player.paused && !self0.disableAutoHide) {
            self0.hide();
          }
        }, 3000);
      }
    }, {
      key: "show",
      value: function () {
        this.player.container.classList.remove("xplayer-hide-controller");
      }
    }, {
      key: "hide",
      value: function () {
        this.player.container.classList.add("xplayer-hide-controller");
        this.player.setting.hide();
        if (this.player.comment) {
          this.player.comment.hide();
        }
      }
    }, {
      key: "isShow",
      value: function () {
        return !this.player.container.classList.contains("xplayer-hide-controller");
      }
    }, {
      key: "toggle",
      value: function () {
        if (this.isShow()) {
          this.hide();
        } else {
          this.show();
        }
      }
    }, {
      key: "destroy",
      value: function () {
        if (this.progressDragCleanup) this.progressDragCleanup();
        clearTimeout(this.autoHideTimer);
      }
    }]);
    return Controller;
  }();
  exports.default = ControllerExport;
},
/* Recovered original module 44: thumbnails. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
  var ThumbnailsExport = function () {
    function Thumbnails(argument8) {
      helper(this, Thumbnails);
      this.container = argument8.container;
      this.barWidth = argument8.barWidth;
      this.container.style.backgroundImage = "url('" + argument8.url + "')";
      this.events = argument8.events;
    }
    value(Thumbnails, [{
      key: "resize",
      value: function (argument9, argument0) {
        this.container.style.width = argument9 + "px";
        this.container.style.height = argument0 + "px";
        this.container.style.top = 2 - argument0 + "px";
      }
    }, {
      key: "show",
      value: function () {
        this.container.style.display = "block";
        if (this.events) {
          this.events.trigger("thumbnails_show");
        }
      }
    }, {
      key: "move",
      value: function (argument1) {
        this.container.style.backgroundPosition = "-" + 160 * (Math.ceil(argument1 / this.barWidth * 100) - 1) + "px 0";
        this.container.style.left = argument1 - this.container.offsetWidth / 2 + "px";
      }
    }, {
      key: "hide",
      value: function () {
        this.container.style.display = "none";
        if (this.events) {
          this.events.trigger("thumbnails_hide");
        }
      }
    }]);
    return Thumbnails;
  }();
  exports.default = ThumbnailsExport;
},
/* Recovered original module 45: settings. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
        var value4 = argument4[index];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument3, value4.key, value4);
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
  var utilsModule = requireModule(0);
  var value2 = function (argument8) {
    if (argument8 && argument8.__esModule) {
      return argument8;
    } else {
      return {
        default: argument8
      };
    }
  }(utilsModule);
  var SettingsExport = function () {
    function Settings(player) {
      var self = this;
      helper(this, Settings);
      this.player = player;
      this.resetTimer = null;
      this.player.template.mask.addEventListener("click", function () {
        self.hide();
      });
      this.player.template.settingButton.setAttribute("aria-expanded", "false");
      this.player.template.settingBox.setAttribute("aria-hidden", "true");
      this.player.template.settingButton.addEventListener("click", function () {
        self.toggle();
      });
      this.loop = this.player.options.loop;
      this.player.template.loopToggle.checked = this.loop;
      this.player.template.loop.addEventListener("click", function () {
        self.player.template.loopToggle.checked = !self.player.template.loopToggle.checked;
        if (self.player.template.loopToggle.checked) {
          self.loop = true;
        } else {
          self.loop = false;
        }
        self.hide();
      });
      this.showDanmaku = this.player.user.get("danmaku");
      if (!this.showDanmaku) {
        if (this.player.danmaku) {
          this.player.danmaku.hide();
        }
      }
      this.player.template.showDanmakuToggle.checked = this.showDanmaku;
      this.player.template.showDanmaku.addEventListener("click", function () {
        self.player.template.showDanmakuToggle.checked = !self.showDanmaku;
        if (self.player.template.showDanmakuToggle.checked) {
          self.showDanmaku = true;
          self.player.danmaku.show();
        } else {
          self.showDanmaku = false;
          self.player.danmaku.hide();
        }
        self.player.user.set("danmaku", self.showDanmaku ? 1 : 0);
        self.player.template.showDanmaku.setAttribute("aria-pressed", String(self.showDanmaku));
        self.player.template.showDanmaku.setAttribute("aria-label", self.showDanmaku ? "关闭弹幕" : "显示弹幕");
      });
      this.player.template.showDanmaku.setAttribute("aria-pressed", String(!!this.showDanmaku));
      this.player.template.showDanmaku.setAttribute("aria-label", this.showDanmaku ? "关闭弹幕" : "显示弹幕");
      this.unlimitDanmaku = this.player.user.get("unlimited");
      this.player.template.unlimitDanmakuToggle.checked = this.unlimitDanmaku;
      this.player.template.unlimitDanmakuToggle.addEventListener("change", function () {
        if (self.player.template.unlimitDanmakuToggle.checked) {
          self.unlimitDanmaku = true;
          self.player.danmaku.unlimit(true);
        } else {
          self.unlimitDanmaku = false;
          self.player.danmaku.unlimit(false);
        }
        self.player.user.set("unlimited", self.unlimitDanmaku ? 1 : 0);
      });
      this.player.template.speed.addEventListener("click", function () {
        self.player.template.settingBox.classList.add("xplayer-setting-box-narrow");
        self.player.template.settingBox.classList.add("xplayer-setting-box-speed");
      });
      for (var index2 = 0; index2 < this.player.template.speedItem.length; index2++) {
        (function (argument9) {
          self.player.template.speedItem[argument9].addEventListener("click", function () {
            self.player.speed(self.player.template.speedItem[argument9].dataset.speed);
            self.hide();
          });
        })(index2);
      }
      if (this.player.danmaku) {
        this.player.on("danmaku_opacity", function (argument0) {
          var input = self.player.template.danmakuDisplayBox.querySelector('[data-danmaku-display="opacity"]');
          input.value = Math.round(argument0 * 100);
          input.parentElement.querySelector("output").textContent = input.value + "%";
          self.player.user.set("opacity", argument0);
        });
        this.player.danmaku.opacity(this.player.user.get("opacity"));
        var methods = {area: "displayArea", size: "displaySize", speed: "displaySpeed"};
        this.player.template.danmakuDisplayBox.querySelectorAll("[data-danmaku-display]").forEach(function (input) {
          var kind = input.dataset.danmakuDisplay;
          var method = methods[kind];
          if (method) {
            var stored = self.player.user.get(method);
            if (Number.isFinite(stored)) self.player.danmaku[method](stored);
            input.value = self.player.danmaku[method]();
          }
          function paint() {
            var amount = Number(input.value);
            input.parentElement.querySelector("output").textContent = kind === "speed" ? (amount === 1 ? "适中" : amount + "×") : amount + "%";
          }
          paint();
          input.addEventListener("input", function () {
            if (kind === "opacity") self.player.danmaku.opacity(Number(input.value) / 100);
            else {
              self.player.danmaku[method](Number(input.value));
              self.player.user.set(method, self.player.danmaku[method]());
            }
            paint();
          });
        });
        var filterKeys = {right: "displayRight", fixed: "displayFixed", color: "displayColor"};
        this.player.template.danmakuDisplayBox.querySelectorAll("[data-danmaku-filter]").forEach(function (input) {
          var kind = input.dataset.danmakuFilter;
          var stored = self.player.user.get(filterKeys[kind]);
          input.checked = stored !== 0;
          self.player.danmaku.displayFilter(kind, input.checked);
          input.addEventListener("change", function () {
            self.player.danmaku.displayFilter(kind, input.checked);
            self.player.user.set(filterKeys[kind], input.checked ? 1 : 0);
          });
        });
      }
    }
    value(Settings, [{
      key: "hide",
      value: function () {
        var self2 = this;
        this.player.template.settingBox.classList.remove("xplayer-setting-box-open");
        this.player.template.settingButton.setAttribute("aria-expanded", "false");
        this.player.template.settingBox.setAttribute("aria-hidden", "true");
        this.player.template.mask.classList.remove("xplayer-mask-show");
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(function () {
          self2.resetTimer = null;
          self2.player.template.settingBox.classList.remove("xplayer-setting-box-narrow");
          self2.player.template.settingBox.classList.remove("xplayer-setting-box-speed");
        }, 300);
        this.player.controller.disableAutoHide = false;
      }
    }, {
      key: "show",
      value: function () {
        clearTimeout(this.resetTimer);
        this.resetTimer = null;
        this.player.template.settingBox.classList.remove("xplayer-setting-box-narrow");
        this.player.template.settingBox.classList.remove("xplayer-setting-box-speed");
        if (this.player.comment) this.player.comment.hide();
        this.player.template.settingBox.classList.add("xplayer-setting-box-open");
        this.player.template.settingButton.setAttribute("aria-expanded", "true");
        this.player.template.settingBox.setAttribute("aria-hidden", "false");
        this.player.template.mask.classList.add("xplayer-mask-show");
        this.player.controller.disableAutoHide = true;
      }
    }, {
      key: "toggle",
      value: function () {
        if (this.player.template.settingBox.classList.contains("xplayer-setting-box-open")) this.hide();
        else this.show();
      }
    }]);
    return Settings;
  }();
  exports.default = SettingsExport;
},
/* Independent viewing settings and authored styles for the danmaku composer. */
function (module, exports, requireModule) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});

  function Comment(player) {
    this.player = player;
    this.cleanups = [];
    this.openDocument = null;
    var self = this, template = player.template;
    this.outside = function (event) {
      if (!template.controller.contains(event.target)) self.hide();
      else if (!template.commentSettingBox.contains(event.target) &&
        !template.danmakuDisplayBox.contains(event.target) &&
        !template.sendStyleButton.contains(event.target) &&
        !template.commentButton.contains(event.target) &&
        !template.showDanmaku.contains(event.target) &&
        !template.commentSettingButton.contains(event.target) &&
        !template.yzmcomment.contains(event.target) &&
        !template.commentInput.contains(event.target)) self.hide();
    };
    this.escape = function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        var button = template.danmakuDisplayBox.classList.contains("xplayer-danmaku-display-open") ? template.commentSettingButton : template.sendStyleButton;
        self.hide(); button.focus();
      }
    };
    this.listen(template.mask, "click", function () { self.hide(); });
    this.listen(template.commentButton, "click", function () { self.show(); });
    this.listen(template.yzmcomment, "click", function () { self.show(false); self.hideSetting(); self.hideDisplay(); });
    this.listen(template.commentSettingButton, "click", function () { self.toggleDisplay(); });
    this.listen(template.sendStyleButton, "click", function () { self.toggleSetting(); });
    this.listen(template.commentColorSettingBox, "change", function () { self.syncColor(); });
    this.listen(template.commentInput, "click", function () { self.hideSetting(); self.hideDisplay(); });
    this.listen(template.commentInput, "keydown", function (event) {
      if (!event.isComposing && (event.key === "Enter" || event.keyCode === 13)) self.send();
    });
    this.listen(template.commentSendButton, "click", function () { self.send(); });
    this.syncColor();
    function syncLayout() { self.syncMobileComposer(); self.positionPanels(); }
    player.on("resize", syncLayout);
    ["fullscreen", "fullscreen_cancel", "webfullscreen", "webfullscreen_cancel"].forEach(function (event) {
      player.on(event, syncLayout);
    });
    if (window.addEventListener) {
      this.listen(window, "resize", syncLayout);
      this.listen(window, "orientationchange", syncLayout);
    }
    this.syncMobileComposer();
    player.on("destroy", function () {
      self.unbindDocument();
      self.cleanups.forEach(function (cleanup) { cleanup(); });
    });
  }
  Comment.prototype.listen = function (target, type, handler) {
    target.addEventListener(type, handler);
    this.cleanups.push(function () { target.removeEventListener(type, handler); });
  };
  Comment.prototype.bindDocument = function () {
    var owner = this.player.container.ownerDocument || document;
    if (this.openDocument === owner) return;
    this.unbindDocument(); this.openDocument = owner;
    owner.addEventListener("click", this.outside);
    owner.addEventListener("keydown", this.escape);
  };
  Comment.prototype.unbindDocument = function () {
    if (!this.openDocument) return;
    this.openDocument.removeEventListener("click", this.outside);
    this.openDocument.removeEventListener("keydown", this.escape);
    this.openDocument = null;
  };
  Comment.prototype.show = function (focus) {
    if (this.player.container.classList.contains("xplayer-mobile") && !this.player.container.classList.contains("xplayer-mobile-danmaku-visible")) return false;
    if (this.player.template.settingBox.classList.contains("xplayer-setting-box-open")) this.player.setting.hide();
    this.player.controller.disableAutoHide = true;
    var expanded = !this.player.template.controller.classList.contains("xplayer-controller-comment");
    this.player.template.controller.classList.add("xplayer-controller-comment");
    this.player.template.mask.classList.add("xplayer-mask-show");
    this.player.container.classList.add("xplayer-show-controller");
    this.bindDocument();
    if (expanded) this.player.resize();
    if (focus !== false) {
      (this.player.container.classList.contains("xplayer-mobile") ? this.player.template.commentInput : this.player.template.yzmcomment).focus();
    }
    return true;
  };
  Comment.prototype.syncMobileComposer = function () {
    var container = this.player.container;
    if (!container.classList.contains("xplayer-mobile")) return;
    var owner = container.ownerDocument || document;
    var fullscreen = owner.fullscreenElement || owner.webkitFullscreenElement || owner.mozFullScreenElement;
    var bounds = container.getBoundingClientRect();
    var visible = !!(container.classList.contains("xplayer-fulled") || fullscreen && (fullscreen === container || fullscreen.contains(container))) && bounds.width > bounds.height;
    var changed = visible !== container.classList.contains("xplayer-mobile-danmaku-visible");
    container.classList.toggle("xplayer-mobile-danmaku-visible", visible);
    this.player.template.sendStyleButton.parentElement.setAttribute("aria-hidden", String(!visible));
    if (!visible) {
      var list = container.querySelector(".xplayer-danmu");
      if (list) list.classList.remove("show");
      var listButton = container.querySelector(".xplayer-list-icon");
      if (listButton) listButton.setAttribute("aria-expanded", "false");
    }
    if (!visible && this.player.template.controller.classList.contains("xplayer-controller-comment")) this.hide();
    if (changed) this.player.danmaku.resize();
  };
  Comment.prototype.hide = function () {
    this.hideSetting(); this.hideDisplay();
    var expanded = this.player.template.controller.classList.contains("xplayer-controller-comment");
    this.player.template.controller.classList.remove("xplayer-controller-comment");
    if (!this.player.template.settingBox.classList.contains("xplayer-setting-box-open")) this.player.template.mask.classList.remove("xplayer-mask-show");
    this.player.container.classList.remove("xplayer-show-controller");
    this.player.controller.disableAutoHide = this.player.template.settingBox.classList.contains("xplayer-setting-box-open");
    this.unbindDocument();
    if (expanded) this.player.resize();
  };
  Comment.prototype.positionPanels = function () {
    var template = this.player.template;
    var root = this.player.container.getBoundingClientRect();
    var composer = template.sendStyleButton.parentElement.getBoundingClientRect();
    this.player.container.style.setProperty("--xplayer-panel-height", Math.max(60, composer.top - root.top - 24) + "px");
    [[template.danmakuDisplayBox, template.commentSettingButton], [template.commentSettingBox, template.sendStyleButton]].forEach(function (pair) {
      var panel = pair[0], button = pair[1].getBoundingClientRect();
      var width = Math.min(panel.offsetWidth, root.width - 24);
      var left = Math.max(root.left + 12, Math.min(button.left, root.right - width - 12));
      panel.style.left = left - composer.left + "px";
    });
  };
  Comment.prototype.showSetting = function () {
    if (this.show(false) === false) return;
    this.hideDisplay();
    this.player.template.commentSettingBox.classList.add("xplayer-comment-setting-open");
    this.player.template.commentSettingBox.setAttribute("aria-hidden", "false");
    this.player.template.sendStyleButton.setAttribute("aria-expanded", "true");
    this.positionPanels();
  };
  Comment.prototype.hideSetting = function () {
    this.player.template.commentSettingBox.classList.remove("xplayer-comment-setting-open");
    this.player.template.commentSettingBox.setAttribute("aria-hidden", "true");
    this.player.template.sendStyleButton.setAttribute("aria-expanded", "false");
  };
  Comment.prototype.toggleSetting = function () {
    if (this.player.template.commentSettingBox.classList.contains("xplayer-comment-setting-open")) this.hide();
    else this.showSetting();
  };
  Comment.prototype.hideDisplay = function () {
    this.player.template.danmakuDisplayBox.classList.remove("xplayer-danmaku-display-open");
    this.player.template.danmakuDisplayBox.setAttribute("aria-hidden", "true");
    this.player.template.commentSettingButton.setAttribute("aria-expanded", "false");
  };
  Comment.prototype.toggleDisplay = function () {
    if (this.player.template.danmakuDisplayBox.classList.contains("xplayer-danmaku-display-open")) this.hide();
    else {
      if (this.show(false) === false) return;
      this.hideSetting();
      this.player.template.danmakuDisplayBox.classList.add("xplayer-danmaku-display-open");
      this.player.template.danmakuDisplayBox.setAttribute("aria-hidden", "false");
      this.player.template.commentSettingButton.setAttribute("aria-expanded", "true");
      this.positionPanels();
    }
  };
  Comment.prototype.syncColor = function () {
    var template = this.player.template;
    var selected = template.commentColorSettingBox.querySelector("input:checked");
    if (!selected) return;
    template.commentSettingFill.style.color = selected.value;
    template.commentInput.style.color = selected.value;
    template.yzmcomment.style.color = selected.value;
    if (template.commentSendFill) template.commentSendFill.style.fill = selected.value;
  };
  Comment.prototype.send = function () {
    var self = this, template = this.player.template;
    template.commentInput.blur();
    if (!template.commentInput.value.trim()) {
      this.player.notice(this.player.tran("Please input danmaku content!")); return;
    }
    this.player.danmaku.send({
      text: template.commentInput.value,
      color: template.commentSettingBox.querySelector(".xplayer-comment-setting-color input:checked").value,
      type: template.commentSettingBox.querySelector(".xplayer-comment-setting-type input:checked").value,
      size: template.commentSettingBox.querySelector(".xplayer-comment-setting-font input:checked").value
    }, function (error) {
      if (error) return;
      template.commentInput.value = ""; self.hide();
    });
  };
  exports.default = Comment;
},
/* Recovered original module 47: dom-parser. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument, argument2) {
    if (!(argument instanceof argument2)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var helper2 = function value(argument3) {
    helper(this, value);
    if (argument3.options.hotkey) {
      document.addEventListener("keydown", function (argument4) {
        if (argument3.focus) {
          var value2 = document.activeElement.tagName.toUpperCase();
          var value3 = document.activeElement.getAttribute("contenteditable");
          if ("INPUT" !== value2 && "TEXTAREA" !== value2 && "SELECT" !== value2 && !document.activeElement.closest('.xplayer-feature-dialog') && "" !== value3 && "true" !== value3) {
            var value4 = argument4 || window.event;
            var value5 = undefined;
            switch (value4.keyCode) {
              case 32:
                value4.preventDefault();
                argument3.toggle();
                break;
              case 37:
                value4.preventDefault();
                argument3.seek(argument3.video.currentTime - 5);
                argument3.controller.setAutoHide();
                break;
              case 39:
                value4.preventDefault();
                argument3.seek(argument3.video.currentTime + 5);
                argument3.controller.setAutoHide();
                break;
              case 38:
                value4.preventDefault();
                value5 = argument3.volume() + 0.1;
                argument3.volume(value5);
                break;
              case 40:
                value4.preventDefault();
                value5 = argument3.volume() - 0.1;
                argument3.volume(value5);
            }
          }
        }
      });
    }
    document.addEventListener("keydown", function (argument5) {
      switch ((argument5 || window.event).keyCode) {
        case 27:
          if (argument3.fullScreen.isFullScreen("web")) {
            argument3.fullScreen.cancel("web");
          }
      }
    });
  };
  exports.default = helper2;
},
/* Recovered original module 48: context-menu. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
  "use strict";

  function helper(argument) {
    if (Array.isArray(argument)) {
      for (var index = 0, value3 = Array(argument.length); index < argument.length; index++) {
        value3[index] = argument[index];
      }
      return value3;
    }
    return Array.from(argument);
  }
  function helper2(argument2, argument3) {
    if (!(argument2 instanceof argument3)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var value = function () {
    function helper3(argument4, argument5) {
      for (var index2 = 0; index2 < argument5.length; index2++) {
        var value4 = argument5[index2];
        value4.enumerable = value4.enumerable || false;
        value4.configurable = true;
        if ("value" in value4) {
          value4.writable = true;
        }
        Object.defineProperty(argument4, value4.key, value4);
      }
    }
    return function (argument6, argument7, argument8) {
      if (argument7) {
        helper3(argument6.prototype, argument7);
      }
      if (argument8) {
        helper3(argument6, argument8);
      }
      return argument6;
    };
  }();
  var ContextMenuExport = function () {
    function ContextMenu(player) {
      var self = this;
      helper2(this, ContextMenu);
      this.player = player;
      [].concat(helper(this.player.template.menuItem)).map(function (argument9, argument0) {
        if (self.player.options.contextmenu[argument0].click) {
          argument9.addEventListener("click", function () {
            self.hide();
            self.player.options.contextmenu[argument0].click(self.player);
          });
        }
        return argument9;
      });
      this.player.template.mask.addEventListener("click", function () { self.hide(); });
      this.player.container.addEventListener("contextmenu", function (argument1) {
        var value5 = argument1 || window.event;
        value5.preventDefault();
        var value6 = self.player.container.getBoundingClientRect();
        self.show(value5.clientX - value6.left, value5.clientY - value6.top);

      });
    }
    value(ContextMenu, [{
      key: "show",
      value: function (argument10, argument11) {
        this.player.template.menu.classList.add("xplayer-menu-show");
        var value7 = this.player.container.getBoundingClientRect();
        if (argument10 + this.player.template.menu.offsetWidth >= value7.width) {
          this.player.template.menu.style.right = value7.width - argument10 + "px";
          this.player.template.menu.style.left = "initial";
        } else {
          this.player.template.menu.style.left = argument10 + "px";
          this.player.template.menu.style.right = "initial";
        }
        if (argument11 + this.player.template.menu.offsetHeight >= value7.height) {
          this.player.template.menu.style.bottom = value7.height - argument11 + "px";
          this.player.template.menu.style.top = "initial";
        } else {
          this.player.template.menu.style.top = argument11 + "px";
          this.player.template.menu.style.bottom = "initial";
        }
        this.player.template.mask.classList.add("xplayer-mask-show");
        this.player.events.trigger("contextmenu_show");
      }
    }, {
      key: "hide",
      value: function () {
        this.player.template.mask.classList.remove("xplayer-mask-show");
        this.player.template.menu.classList.remove("xplayer-menu-show");
        this.player.events.trigger("contextmenu_hide");
      }
    }]);
    return ContextMenu;
  }();
  exports.default = ContextMenuExport;
},
/* Recovered original module 49: info-panel. Bindings renamed by scope, not rewritten. */
function (module, exports, requireModule) {
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
  var InfoPanelExport = function () {
    function InfoPanel(player) {
      var self = this;
      helper(this, InfoPanel);
      this.container = player.template.infoPanel;
      this.template = player.template;
      this.video = player.video;
      this.player = player;
      this.template.infoPanelClose.addEventListener("click", function () {
        self.hide();
      });
    }
    value(InfoPanel, [{
      key: "show",
      value: function () {
        this.beginTime = Date.now();
        this.update();
        this.player.time.enable("info");
        this.player.time.enable("fps");
        this.container.classList.remove("xplayer-info-panel-hide");
      }
    }, {
      key: "hide",
      value: function () {
        this.player.time.disable("info");
        this.player.time.disable("fps");
        this.container.classList.add("xplayer-info-panel-hide");
      }
    }, {
      key: "triggle",
      value: function () {
        if (this.container.classList.contains("xplayer-info-panel-hide")) {
          this.show();
        } else {
          this.hide();
        }
      }
    }, {
      key: "update",
      value: function () {
        function helper4(argument8) {
          return [parseInt(argument8 / 60 / 60), parseInt(argument8 / 60 % 60), parseInt(argument8 % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
        }
        this.template.infoVersion.textContent = "Xplayer Pro";
        this.template.infoType.textContent = this.player.type;
        this.template.infoUrl.textContent = getRootUrl(this.player.options.video.url);
        this.template.infoResolution.textContent = this.player.video.videoWidth + " x " + this.player.video.videoHeight;
        this.template.infoDuration.textContent = helper4(this.player.video.duration);
        if (this.player.options.danmaku) {
          this.template.infoDanmakuId.textContent = this.player.options.danmaku.id;
          this.template.infoDanmakuApi.textContent = this.player.options.danmaku.api;
          this.template.infoDanmakuAmount.textContent = this.player.danmaku.dan.length - 2;
        }
      }
    }, {
      key: "fps",
      value: function (argument9) {
        this.template.infoFPS.textContent = "" + argument9.toFixed(1);
      }
    }]);
    return InfoPanel;
  }();
  exports.default = InfoPanelExport;
}
];const cache={};
function requireModule(id){if(cache[id])return cache[id].exports;const module=cache[id]={i:id,l:false,exports:{}};modules[id].call(module.exports,module,module.exports,requireModule);module.l=true;return module.exports;}
requireModule.m=modules;requireModule.c=cache;requireModule.o=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
requireModule.d=(object,key,get)=>{if(!requireModule.o(object,key))Object.defineProperty(object,key,{configurable:false,enumerable:true,get});};
requireModule.n=module=>{const get=module&&module.__esModule?()=>module.default:()=>module;requireModule.d(get,'a',get);return get;};
requireModule.p='/';requireModule.s=5;global.xplayer=requireModule(5).default;
})(window);
