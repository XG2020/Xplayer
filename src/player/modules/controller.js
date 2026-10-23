/* Recovered original module 43: controller. Bindings renamed by scope, not rewritten. */
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
            self2.setAutoHide();
          });
          this.player.template.controllerMask.addEventListener("click", function () {
            self2.setAutoHide();
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
        this.cancelProgressDrag = function () {finishDrag(null, false);hideHover();};
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
        this.cancelVolumeDrag = helper8;
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
      key: "cancelInteraction",
      value: function () {
        if (this.cancelProgressDrag) this.cancelProgressDrag();
        if (this.cancelVolumeDrag) this.cancelVolumeDrag();
      }
    }, {
      key: "destroy",
      value: function () {
        this.cancelInteraction();
        if (this.progressDragCleanup) this.progressDragCleanup();
        clearTimeout(this.autoHideTimer);
      }
    }]);
    return Controller;
  }();
  exports.default = ControllerExport;
};
