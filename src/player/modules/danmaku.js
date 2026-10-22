/* Recovered original module 35: danmaku. Bindings renamed by scope, not rewritten. */
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
};
