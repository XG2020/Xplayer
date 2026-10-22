/* Original XGGM page behavior, statically decoded. See compatibility.js for security/interface patches. */
function getUrlParam(argument) {
  var value = new RegExp(argument + "=(.*)");
  var value2 = window.location.search.substr(1).match(value);
  if (value2 != null) {
    return value2[1];
  }
  return null;
}
function danmakuEndpoint() {
  const endpoint = new URL(config.api, document.baseURI);
  endpoint.searchParams.set('ac', 'dm');
  return endpoint.href;
}
var XGGM = {
  versions: function () {
    var userAgent = navigator.userAgent;
    var appVersion = navigator.appVersion;
    return {
      trident: userAgent.indexOf("Trident") > -1,
      presto: userAgent.indexOf("Presto") > -1,
      webKit: userAgent.indexOf("AppleWebKit") > -1,
      gecko: userAgent.indexOf("Gecko") > -1 && userAgent.indexOf("KHTML") == -1,
      mobile: !!userAgent.match(/AppleWebKit.*Mobile.*/),
      ios: !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
      android: userAgent.indexOf("Android") > -1 || userAgent.indexOf("Adr") > -1,
      iPhone: userAgent.indexOf("iPhone") > -1,
      iPad: userAgent.indexOf("iPad") > -1,
      webApp: userAgent.indexOf("Safari") == -1,
      weixin: userAgent.indexOf("MicroMessenger") > -1,
      qq: userAgent.match(/\sQQ/i) == " qq"
    };
  }(),
  start: function () {
    $.ajax({
      url: "./api.php",
      method: "GET",
      data: {
        type: "setting"
      },
      dataType: "json",
      success: function (argument2) {
        var value3 = "10|6|0|8|4|5|3|1|2|7|9".split("|");
        XGGM.waittime = argument2.data.waittime;
        XGGM.ads = argument2.data.ads;
        config.logo = argument2.data.logo;
        up.pbgjz = "";
        up.trysee = argument2.data.trytime;
        config.sendtime = argument2.data.sendtime;
        config.color = argument2.data.color;
        config.group_x = XGGM.ads.set.group;
        config.dmrule = argument2.data.dmrule;
        danmuon = argument2.data.danmuon;
        if (XGGM.ads.state == "on") {
          if (XGGM.ads.set.state == "1") {
            XGGM.MYad.vod(XGGM.ads.set.vod.url, XGGM.ads.set.vod.link);
          } else if (XGGM.ads.set.state == "2") {
            XGGM.MYad.pic(XGGM.ads.set.pic.link, XGGM.ads.set.pic.time, XGGM.ads.set.pic.img);
          }
        } else {
          XGGM.play(config.url);
        }
      }
    });
  },
  play: function (argument3) {
    if (!danmuon) {
      XGGM.player.play(argument3);
    } else {
      if (config.av != "") {
        XGGM.player.bdplay(argument3);
      } else {
        XGGM.player.dmplay(argument3);
      }
    }
    $(function () {
      $(".xplayer-setting-speeds,.xplayer-setting-speed-item").on("click", function () {
        $(".speed-stting").toggleClass("speed-stting-open");
      });
      $(".speed-stting .xplayer-setting-speed-item").click(function () {
        $(".xplayer-setting-speeds .title").text($(this).text());
      });
    });
    $(".xplayer-fulloff-icon").on("click", function () {
      XGGM.dp.fullScreen.cancel();
    });
    $(".xplayer-showing").on("click", function () {
      XGGM.dp.play();
      $(".vod-pic").remove();
    });
    if (config.title != "") {
      $("#vodtitle").text(config.title + "  " + config.sid);
    }
  },
  dmid: function () {
    if (up.diyid[0] == 0 && config.id != "") {
      a = config.id;
      b = config.sid;
    } else if (up.diyid[0] == 1 || !config.id) {
      a = up.diyid[1];
      b = up.diyid[2];
    }
    XGGM.id = a + " P" + b;
  },
  load: function () {
    setTimeout(function () {
      $("#link1").fadeIn();
    }, 100);
    setTimeout(function () {
      $("#link1-success").fadeIn();
    }, 500);
    setTimeout(function () {
      $("#link2").show();
    }, 1000);
    setTimeout(function () {
      $("#link3,#span").fadeIn();
    }, 2000);
    if (XGGM.versions.weixin && (XGGM.versions.ios || XGGM.versions.iPad)) {
      var value4 = "<style type=\"text/css\">";
      value4 += "#loading-box{display: none;}";
      value4 += "</style>";
      $("body").append(value4).addClass("");
    }
    XGGM.danmu.send();
    XGGM.danmu.list();
    XGGM.def();
    XGGM.video.try();
  },
  def: function () {
    var value5 = "9|8|7|2|10|3|12|6|11|13|5|0|4|1|14".split("|");
    XGGM.delCookie();
    XGGM.stime = 0;
    XGGM.headt = yzmck.get("headt");
    XGGM.lastt = yzmck.get("lastt");
    XGGM.last_tip = parseInt(XGGM.lastt) + 5;
    XGGM.frists = yzmck.get("frists");
    XGGM.lasts = yzmck.get("lasts");
    XGGM.playtime = Number(XGGM.getCookie("time_" + getUrlParam("url")));
    XGGM.ctime = XGGM.formatTime(XGGM.playtime);
    XGGM.dp.on("loadedmetadata", function () {
      XGGM.loadedmetadataHandler();
    });
    XGGM.dp.on("ended", function () {
      XGGM.endedHandler();
    });
    XGGM.dp.on("pause", function () {
      XGGM.MYad.pause.play(XGGM.ads.pause.link, XGGM.ads.pause.pic);
    });
    XGGM.dp.on("play", function () {
      XGGM.MYad.pause.out();
    });
    XGGM.dp.on("timeupdate", function (argument4) {
      XGGM.timeupdateHandler();
    });
    XGGM.jump.def();
  },
  video: {
    play: function () {
      $("#link3").text("视频已准备就绪，即将自动播放。如未自动播放请手动点击按钮");
      $("#loading-box").remove();
      XGGM.dp.play();
      XGGM.jump.head();
    },
    next: function () {
      window.location.href = up.mylink + config.next;
    },
    try: function () {
      if (up.trysee > 0 && config.group < config.group_x && config.group != "") {
        $("#dmtext").attr({
          disabled: true,
          placeholder: "登陆后才能发弹幕yo(・ω・)"
        });
        setInterval(function () {
          var value6 = up.trysee * 60;
          var currentTime = XGGM.dp.video.currentTime;
          if (currentTime > value6) {
            XGGM.dp.video.currentTime = 0;
            XGGM.dp.pause();
            layer.confirm(up.trysee + "分钟试看已结束，请登录继续播放完整视频", {
              anim: 1,
              title: "温馨提示",
              btn: ["登录", "注册"],
              yes: function (argument5, argument6) {
                top.location.href = up.mylink + "/index.php/user/login.html";
              },
              btn2: function (argument7, argument8) {
                top.location.href = up.mylink + "/index.php/user/reg.html";
              }
            });
          }
        }, 1000);
      }
    },
    seek: function () {
      XGGM.dp.seek(XGGM.playtime);
      XGGM.dp.notice("已为您定位至" + XGGM.ctime);
    },
    end: function () {
      layer.msg("播放结束啦=。=");
    },
    con_play: function () {
      XGGM.video.seek();
      XGGM.video.play();
      $(".close").on("click", function () {
        $(".memory-play-wrap").remove();
      });
      setTimeout(function () {
        $(".memory-play-wrap").remove();
      }, 20000);
      $(".conplaying").on("click", function () {
        $("#loading-box").remove();
        XGGM.video.play();
        XGGM.jump.head();
      });
      $(".conplay-jump,.play-jump").on("click", function () {
        $(".memory-play-wrap,#loading-box").remove();
        XGGM.video.seek();
        XGGM.video.play();
      });
    }
  },
  jump: {
    def: function () {
      h = ".xplayer-setting-jfrist label";
      l = ".xplayer-setting-jlast label";
      f = "#fristtime";
      j = "#jumptime";
      helper3(h, "frists", XGGM.frists, "headt", XGGM.headt, f);
      helper3(l, "lasts", XGGM.lasts, "lastt", XGGM.lastt, j);
      function helper() {
        layer.msg("请输入有效时间哟！");
      }
      function helper2() {
        layer.msg("设置完成，将在刷新或下一集生效");
      }
      function helper3(argument9, argument0, argument1, argument10, argument11, argument12) {
        $(argument9).on("click", function () {
          o = $(argument12).val();
          if (o > 0) {
            $(argument9).toggleClass("checked");
            helper2();
            argument11 = $(argument12).val();
            yzmck.set(argument10, argument11);
          } else {
            helper();
          }
        });
        if (argument1 == 1) {
          $(argument9).addClass("checked");
          $(argument9).click(function () {
            o = $(argument12).val();
            if (o > 0) {
              yzmck.set(argument0, 0);
            } else {
              helper();
            }
          });
        } else {
          $(argument9).click(function () {
            o = $(argument12).val();
            if (o > 0) {
              yzmck.set(argument0, 1);
            } else {
              helper();
            }
          });
        }
      }
      $(f).attr({
        value: XGGM.headt
      });
      $(j).attr({
        value: XGGM.lastt
      });
    },
    head: function () {
      if (XGGM.stime > XGGM.playtime) {
        XGGM.playtime = XGGM.stime;
      }
      if (XGGM.frists == 1) {
        if (XGGM.headt > XGGM.playtime || XGGM.playtime == 0) {
          XGGM.jump_f = 1;
        } else {
          XGGM.jump_f = 0;
        }
      }
      if (XGGM.jump_f == 1) {
        XGGM.dp.seek(XGGM.headt);
        XGGM.dp.notice("已为您跳过片头");
      }
    },
    last: function () {
      if (XGGM.lasts == 1) {
        var value7 = XGGM.dp.video.duration - XGGM.dp.video.currentTime;
        if (value7 < XGGM.last_tip) {
          XGGM.dp.notice("即将为您播放下一集");
        }
        if (XGGM.lastt > 0 && value7 < XGGM.lastt) {
          if (config.next != "") {
            XGGM.setCookie("time_" + getUrlParam("url"), "", -1);
            XGGM.video.next();
          } else {
            XGGM.dp.notice("暂无下一集，跳过片尾失败");
            XGGM.lasts = 0;
          }
        }
      }
      if (config.next == "") {
        $(".icon-xj").remove();
      }
    },
    ad: function (argument13, argument14) {}
  },
  danmu: {
    send: function () {
      g = $(".yzm-xplayer-send-icon");
      d = $("#dmtext");
      g.on("click", function () {
        a = document.getElementById("dmtext");
        a = a.value;
        var sending = XGGM.dp.template.commentSettingBox;
        b = sending.querySelector(".xplayer-comment-setting-type input:checked").value;
        c = sending.querySelector(".xplayer-comment-setting-color input:checked").value;
        z = sending.querySelector(".xplayer-comment-setting-font input:checked").value;
        if (up.trysee > 0 && config.group < config.group_x && config.group != "") {
          layer.msg("登陆后才能发弹幕yo(・ω・)");
          return;
        }
        for (var index = 0; index < up.pbgjz.length; index++) {
          if (a.search(up.pbgjz[index]) != -1) {
            layer.msg("请勿发送无意义内容，规范您的弹幕内容");
            return;
          }
        }
        if (a.length < 1) {
          layer.msg("要输入弹幕内容啊喂！");
          return;
        }
        var value8 = Date.parse(new Date());
        var value9 = yzmck.get("dmsent", value8);
        if (value8 - value9 < config.sendtime * 1000) {
          layer.msg("请勿频繁操作！发送弹幕需间隔" + config.sendtime + "秒~");
          return;
        }
        if (g.prop('disabled')) return;
        g.prop('disabled', true);
        XGGM.dp.danmaku.send({
          text: a,
          color: c,
          type: b,
          size: z
        }, function (error) {
          g.prop('disabled', false);
          if (!error) {
            d.val('');
            yzmck.set('dmsent', value8);
          }
        });
      });
      function helper4() {
        g.trigger("click");
      }
      d.keydown(function (argument15) {
        if (argument15.keyCode == 13) {
          helper4();
        }
      });
    },
    list: function () {
      $(".xplayer-list-icon,.yzm-xplayer-send-icon").on("click", function () {
        $(".list-show").empty();
        $.ajax({
          url: config.api + "?ac=get&id=" + XGGM.id,
          success: function (argument16) {
            if (argument16.code == 23) {
              var value10 = "3|1|4|0|2".split("|");
              a = argument16.danmuku;
              b = argument16.name;
              c = argument16.danum;
              $(".danmuku-num").text(c);
              $(a).each(function (argument17, argument18) {
                l = "<d class=\"danmuku-list\" time=\"" + argument18[0] + "\"><li>" + XGGM.formatTime(argument18[0]) + "</li><li title=\"" + argument18[4] + "\">" + argument18[4] + "</li><li title=\"用户：" + argument18[3] + "  IP地址：" + argument18[5] + "\">" + argument18[6] + "</li><li class=\"report\" onclick=\"XGGM.danmu.report('" + argument18[5] + "','" + b + "','" + argument18[4] + "','" + argument18[3] + "')\">举报</li></d>";
                $(".list-show").append(l);
              });
            }
            $(".danmuku-list").on("click", function () {
              XGGM.dp.seek($(this).attr("time"));
            });
          }
        });
      });
      var value0 = "<div class=\"dmrules\"><a target=\"_blank\" href=\"" + config.dmrule + "\">弹幕礼仪 </a></div>";
      $("div.xplayer-comment-box:last").append(value0);
      $(".xplayer-watching-number").text(up.usernum);
      $(".xplayer-info-panel-item-title-amount .xplayer-info-panel-item-title").html("违规词");
      for (var index2 = 0; index2 < up.pbgjz.length; index2++) {
        var value1 = "<e>" + up.pbgjz[index2] + "</e>";
        $("#vod-title").append(value1);
      }
      helper5(".xplayer-list-icon", ".xplayer-danmu", "show");
      function helper5(argument19, argument20, argument21, argument22) {
        $(argument19).click(function () {
          $(argument20).toggleClass(argument21);
          $(argument22).remove();
        });
      }
    },
    report: function (argument23, argument24, argument25, argument26) {
      layer.confirm("" + argument25 + "<!--br><br><span style=\"color:#333\">请选择需要举报的类型</span-->", {
        anim: 1,
        title: "举报弹幕",
        skin: 'xplayer-feature-dialog xplayer-report-dialog',
        area: [Math.min(440, window.innerWidth - 24) + 'px', 'auto'],
        shade: 0,
        resize: false,
        success: function (layerElement, index) {
          layerElement[0].style.setProperty('--xplayer-theme', config.color);
          if (document.fullscreenElement) {
            document.fullscreenElement.appendChild(layerElement[0]);
            const shade = document.getElementById('layui-layer-shade' + index);
            if (shade) document.fullscreenElement.appendChild(shade);
          }
        },
        btn: ["违法违禁", "色情低俗", "恶意刷屏", "赌博诈骗", "人身攻击", "侵犯隐私", "垃圾广告", "剧透", "引战"],
        btn3: function (argument27, argument28) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "恶意刷屏");
        },
        btn4: function (argument29, argument30) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "赌博诈骗");
        },
        btn5: function (argument31, argument32) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "人身攻击");
        },
        btn6: function (argument33, argument34) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "侵犯隐私");
        },
        btn7: function (argument35, argument36) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "垃圾广告");
        },
        btn8: function (argument37, argument38) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "剧透");
        },
        btn9: function (argument39, argument40) {
          XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "引战");
        }
      }, function (argument41, argument42) {
        XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "违法违禁");
      }, function (argument43) {
        XGGM.danmu.post_r(argument23, argument24, argument25, argument26, "色情低俗");
      });
    },
    post_r: function (argument44, argument45, argument46, argument47, argument48) {
      $.ajax({
        type: "get",
        url: config.api + "?ac=report&cid=" + argument47 + "&user=" + argument44 + "&type=" + argument48 + "&title=" + argument45 + "&text=" + argument46,
        cache: false,
        dataType: "json",
        beforeSend: function () {},
        success: function (argument49) {
          layer.msg("举报成功！感谢您为守护弹幕作出了贡献");
        },
        error: function (argument50) {
          var value11 = "服务故障 or 网络异常，稍后再试6！";
          layer.msg(value11);
        }
      });
    }
  },
  setCookie: function (argument51, argument52, argument53) {
    var value12 = new Date();
    value12.setHours(value12.getHours() + argument53);
    document.cookie = argument51 + "=" + escape(argument52) + (argument53 === null ? "" : ";expires=" + value12.toGMTString());
  },
  delCookie: function () {
    var value13 = document.cookie.split(";");
    var index3 = 0;
    var items = [];
    for (var value14 of value13) {
      value14 = value14.replace(/^\s+|\s+$/g, "");
      if (value14.indexOf("time_") == 0) {
        items[index3] = value14;
        index3++;
      }
    }
    if (index3 > 2) {
      var index4 = 0;
      for (var value14 of items) {
        if (index3 - 2 > index4) {
          _ckname = value14.split("=")[0];
          XGGM.setCookie(_ckname, "", -1);
          index4++;
        }
      }
    }
  },
  getCookie: function (argument54) {
    if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(argument54 + "=");
      if (c_start !== -1) {
        c_start = c_start + argument54.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end === -1) {
          c_end = document.cookie.length;
        }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return "";
  },
  formatTime: function (argument55) {
    return [parseInt(argument55 / 60 / 60), parseInt(argument55 / 60 % 60), parseInt(argument55 % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
  },
  loadedmetadataHandler: function () {
    XGGM.dp.notice("视频已准备就绪，即将为您播放。如未自动播放请手动点击播放");
    if (XGGM.playtime > 0 && XGGM.dp.video.currentTime < XGGM.playtime) {
      XGGM.video.con_play();
    } else {
      XGGM.video.play();
    }
    XGGM.dp.on("timeupdate", function () {
      XGGM.timeupdateHandler();
    });
  },
  timeupdateHandler: function () {
    XGGM.setCookie("time_" + getUrlParam("url"), XGGM.dp.video.currentTime, 24);
    XGGM.jump.last();
  },
  endedHandler: function () {
    XGGM.setCookie("time_" + getUrlParam("url"), "", -1);
    if (config.next != "") {
      XGGM.dp.notice("即将为您播放下一集");
      setTimeout(function () {
        XGGM.video.next();
      }, 3000);
    } else {
      XGGM.dp.notice("视频播放已结束");
      setTimeout(function () {
        XGGM.video.end();
      }, 2000);
    }
  },
  player: {
    play: function (argument56) {
      var value15 = "0|5|2|4|6|3|1".split("|");
      $("body").addClass("danmu-off");
      XGGM.dp = new xplayer({
        autoplay: config.autoplay,
        element: document.getElementById("player"),
        theme: config.color,
        logo: config.logo,
        video: {
          url: argument56,
          pic: config.pic,
          type: "auto"
        }
      });
      var value16 = "<style type=\"text/css\">";
      value16 += "#loading-box{display: none;}";
      value16 += "</style>";
      $("body").append(value16).addClass("");
      XGGM.def();
    },
    adplay: function (argument57) {
      $("body").addClass("danmu-off");
      XGGM.ad = new xplayer({
        autoplay: config.autoplay,
        element: document.getElementById("ADplayer"),
        theme: config.color,
        logo: config.logo,
        video: {
          url: argument57,
          pic: config.pic,
          type: "auto"
        }
      });
      $(".xplayer-controller,.xplayer-cplayer,.xplayer-logo,#loading-box,.xplayer-controller-mask").remove();
      $(".xplayer-mask").show();
      XGGM.ad.on("timeupdate", function () {
        document.getElementById("time_ad").innerHTML = formatSeconds(XGGM.ad.video.duration - XGGM.ad.video.currentTime);
        if (XGGM.ad.video.currentTime > XGGM.ad.video.duration - 0.1) {
          var value17 = "1|2|4|0|3".split("|");
          $("body").removeClass("danmu-off");
          XGGM.ad.destroy();
          $("#ADplayer").remove();
          $("#ADtip").remove();
          XGGM.play(config.url);
        }
      });
    },
    dmplay: function (argument58) {
      XGGM.dmid();
      XGGM.dp = new xplayer({
        autoplay: config.autoplay,
        element: document.getElementById("player"),
        theme: config.color,
        logo: config.logo,
        video: {
          url: argument58,
          pic: config.pic,
          type: "auto"
        },
        danmaku: {
          id: XGGM.id,
          api: danmakuEndpoint(),
          user: config.user
        }
      });
      XGGM.load();
    },
    bdplay: function (argument59) {
      XGGM.dmid();
      XGGM.dp = new xplayer({
        autoplay: config.autoplay,
        element: document.getElementById("player"),
        theme: config.color,
        logo: config.logo,
        video: {
          url: argument59,
          pic: config.pic,
          type: "auto"
        },
        danmaku: {
          id: XGGM.id,
          api: danmakuEndpoint(),
          user: config.user,
          addition: [config.api + "bilibili/?av=" + config.av]
        }
      });
      XGGM.load();
    }
  },
  MYad: {
    vod: function (argument60, argument61) {
      $("#player").html("");
      $("#ADtip").html("<a id=\"link\" href=\"" + argument61 + "\" target=\"_blank\"><span id=\"time_ad\"></span></a>");
      $("#ADplayer").click(function () {
        document.getElementById("link").click();
      });
      XGGM.player.adplay(argument60);
    },
    pic: function (argument62, argument63, argument64) {
      $("#player").html("");
      $("#ADtip").css("width", "100%");
      $("#ADtip").css("height", "100%");
      $("#ADtip").html("<a id=\"link\" href=\"" + argument62 + "\" target=\"_blank\"><span id=\"time_ad\">" + argument63 + "</span></a><img height=\"100%\" width=\"100%\" src=\"" + argument64 + "\">");
      $("#ADtip").click(function () {
        document.getElementById("link").click();
      });
      var value18 = document.getElementById("time_ad");
      var innerHTML = value18.innerHTML;
      var value19 = null;
      setTimeout(function () {
        value19 = setInterval(function () {
          innerHTML--;
          value18.innerHTML = innerHTML;
          if (innerHTML == 0) {
            clearInterval(value19);
            XGGM.play(config.url);
            $("#ADtip").remove();
            $("#ADplayer").remove();
          }
        }, 1000);
      }, 1);
    },
    pause: {
      play: function (argument65, argument66) {
        if (XGGM.ads.pause.state == "on") {
          if (argument65 == "#") {
            var value20 = "<div id=\"player_pause\" onclick=\"out()\"><div class=\"tip\">广告</div><div class=\"tip\" onclick=\"XGGM.MYad.pause.out()\" style=\"right:0;cursor:pointer;\">X</div><img src=\"" + argument66 + "\"></div>";
            $("#player").append(value20);
          } else {
            var value20 = "<div id=\"player_pause\" ><div class=\"tip\">广告</div><div class=\"tip\" onclick=\"XGGM.MYad.pause.out()\" style=\"right:0;cursor:pointer;\">X</div><a href=\"" + argument65 + "\" target=\"_blank\" ><img src=\"" + argument66 + "\"></a></div>";
            $("#player").append(value20);
          }
        }
      },
      out: function () {
        $("#player_pause").remove();
      }
    }
  }
};
function checkAutoPlay() {
  if (document.getElementsByClassName("xplayer-paused")) {
    $(".xplayer-play-icon").click();
  }
}
function out() {
  XGGM.dp.play();
  XGGM.MYad.pause.out();
}
function formatSeconds(argument67) {
  var value21 = parseInt(argument67);
  var index5 = 0;
  var index6 = 0;
  var index7 = 0;
  if (value21 > 60) {
    index5 = parseInt(value21 / 60);
    value21 = parseInt(value21 % 60);
    if (index5 > 60) {
      index6 = parseInt(index5 / 60);
      index5 = parseInt(index5 % 60);
      if (index6 > 24) {
        index7 = parseInt(index6 / 24);
        index6 = parseInt(index6 % 24);
      }
    }
  }
  var value22 = "";
  if (value21 > 0) {
    value22 = "" + parseInt(value21) + "s";
  }
  if (index5 > 0) {
    value22 = "" + parseInt(index5) + "m" + value22;
  }
  if (index6 > 0) {
    value22 = "" + parseInt(index6) + "h" + value22;
  }
  if (index7 > 0) {
    value22 = "" + parseInt(index7) + "d" + value22;
  }
  return value22;
}
