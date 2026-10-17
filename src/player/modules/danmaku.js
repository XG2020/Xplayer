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
      key: "draw",
      value: function (argument20) {
        var self4 = this;
        if (this.showing) {
          var height = this.options.height;
          var offsetWidth = this.container.offsetWidth;
          var offsetHeight = this.container.offsetHeight;
          var value9 = parseInt(offsetHeight / height);
          function helper4(argument21) {
            var value1 = argument21.offsetWidth || parseInt(argument21.style.width);
            var value10 = argument21.getBoundingClientRect().right || self4.container.getBoundingClientRect().right + value1;
            return self4.container.getBoundingClientRect().right - value10;
          }
          function helper5(argument22) {
            return (offsetWidth + argument22) / 5;
          }
          function helper6(argument23, argument24, argument25) {
            var value11 = offsetWidth / helper5(argument25);
            for (var index6 = 0; self4.unlimited || index6 < value9; index6++) {
              var value12 = function (argument26) {
                var value13 = self4.danTunnel[argument24][argument26 + ""];
                if (!value13 || !value13.length) {
                  self4.danTunnel[argument24][argument26 + ""] = [argument23];
                  argument23.addEventListener("animationend", function () {
                    self4.danTunnel[argument24][argument26 + ""].splice(0, 1);
                  });
                  return {
                    v: argument26 % value9
                  };
                }
                if ("right" !== argument24) {
                  return "continue";
                }
                for (var index7 = 0; index7 < value13.length; index7++) {
                  var value14 = helper4(value13[index7]) - 10;
                  if (value14 <= offsetWidth - value11 * helper5(parseInt(value13[index7].style.width)) || value14 <= 0) {
                    break;
                  }
                  if (index7 === value13.length - 1) {
                    self4.danTunnel[argument24][argument26 + ""].push(argument23);
                    argument23.addEventListener("animationend", function () {
                      self4.danTunnel[argument24][argument26 + ""].splice(0, 1);
                    });
                    return {
                      v: argument26 % value9
                    };
                  }
                }
              }(index6);
              switch (value12) {
                case "continue":
                  continue;
                default:
                  if ("object" === (undefined === value12 ? "undefined" : value(value12))) {
                    return value12.v;
                  }
              }
            }
            return -1;
          }
          if ("[object Array]" !== Object.prototype.toString.call(argument20)) {
            argument20 = [argument20];
          }
          var value0 = document.createDocumentFragment();
          for (var index5 = 0; index5 < argument20.length; index5++) {
            (function (argument27) {
              argument20[argument27].type ||= "right";
              argument20[argument27].color ||= "#fff";
              if (!argument20[argument27].size) {
                argument20[argument27].fontSize = "27.5px";
              }
              var value15 = document.createElement("div");
              var canReport = !window.XplayerDanmakuSources || window.XplayerDanmakuSources.canReport();
              if (canReport) value15.addEventListener("click", function () {
                window.XGGM.danmu.report(String(argument20[argument27].commentId || ''), String(argument20[argument27].playerId || ''), String(argument20[argument27].text), String(argument20[argument27].author || ''));
              });
              value15.setAttribute("style", "pointer-events: auto !important;cursor:" + (canReport ? 'pointer' : 'default') + ";");
              if (canReport) {value15.setAttribute("data-balloon", "点击举报此弹幕");value15.setAttribute("data-balloon-pos", "down");}
              value15.addEventListener("mouseenter", function () {
                value15.style.animationPlayState = "paused";
              });
              value15.addEventListener("mouseleave", function () {
                value15.style.animationPlayState = "";
              });
              value15.classList.add("xplayer-danmaku-item");
              value15.classList.add("xplayer-danmaku-" + argument20[argument27].type);
              if(window.XplayerDanmakuContent)window.XplayerDanmakuContent.render(value15,argument20[argument27].text);
              else value15.textContent = String(argument20[argument27].text || '');
              if (argument20[argument27].border) value15.style.borderBottom = argument20[argument27].border;
              value15.style.opacity = self4._opacity;
              value15.style.color = argument20[argument27].color;
              var fontSize = window.XplayerDanmakuContent ? window.XplayerDanmakuContent.fontSize(argument20[argument27].size,self4.container.ownerDocument) : parseFloat(argument20[argument27].size)||27.5;
              value15.style.fontSize = fontSize + 'px';
              value15.addEventListener("animationend", function () {
                value15.remove();
              });
              var value16 = self4._measure(argument20[argument27].text,fontSize);
              var value17 = undefined;
              switch (argument20[argument27].type) {
                case "right":
                  value17 = helper6(value15, argument20[argument27].type, value16);
                  if (value17 >= 0) {
                    value15.style.width = value16 + 1 + "px";
                    value15.style.top = height * value17 + "px";
                    value15.style.transform = "translateX(-" + offsetWidth + "px)";
                  }
                  break;
                case "top":
                  value17 = helper6(value15, argument20[argument27].type);
                  if (value17 >= 0) {
                    value15.style.top = height * value17 + "px";
                  }
                  break;
                case "bottom":
                  value17 = helper6(value15, argument20[argument27].type);
                  if (value17 >= 0) {
                    value15.style.bottom = height * value17 + "px";
                  }
                  break;
                default:
                  console.error("Can't handled danmaku type: " + argument20[argument27].type);
              }
              if (value17 >= 0) {
                value15.classList.add("xplayer-danmaku-move");
                value0.appendChild(value15);
              }
            })(index5);
          }
          this.container.appendChild(value0);
          return value0;
        }
      }
    }, {
      key: "play",
      value: function () {
        this.paused = false;
      }
    }, {
      key: "pause",
      value: function () {
        this.paused = true;
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
        this.danTunnel = {
          right: {},
          top: {},
          bottom: {}
        };
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
        var offsetWidth2 = this.container.offsetWidth;
        for (var value19 = this.container.getElementsByClassName("xplayer-danmaku-item"), index8 = 0; index8 < value19.length; index8++) {
          value19[index8].style.transform = "translateX(-" + offsetWidth2 + "px)";
        }
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
