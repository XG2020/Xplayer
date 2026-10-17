/* Recovered original module 7: player. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
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
};
