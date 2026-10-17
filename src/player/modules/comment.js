/* Recovered original module 46: comment. Bindings renamed by scope, not rewritten. */
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
  var CommentExport = function () {
    function Comment(player) {
      var self = this;
      helper(this, Comment);
      this.player = player;
      this.player.template.mask.addEventListener("click", function () {
        self.hide();
      });
      this.player.template.commentButton.addEventListener("click", function () {
        self.show();
      });
      this.player.template.yzmcomment.addEventListener("click", function () {
        self.show();
      });
      this.player.template.commentSettingButton.addEventListener("click", function () {
        self.toggleSetting();
      });
      this.player.template.commentColorSettingBox.addEventListener("click", function () {
        if (self.player.template.commentColorSettingBox.querySelector("input:checked+span")) {
          var value4 = self.player.template.commentColorSettingBox.querySelector("input:checked").value;
          self.player.template.commentSettingFill.style.fill = value4;
          self.player.template.commentInput.style.color = value4;
          self.player.template.commentSendFill.style.fill = value4;
        }
      });
      this.player.template.commentInput.addEventListener("click", function () {
        self.hideSetting();
      });
      this.player.template.commentInput.addEventListener("keydown", function (argument8) {
        if (13 === (argument8 || window.event).keyCode) {
          self.send();
        }
      });
      this.player.template.commentSendButton.addEventListener("click", function () {
        self.send();
      });
    }
    value(Comment, [{
      key: "show",
      value: function () {
        this.player.controller.disableAutoHide = true;
        this.player.template.controller.classList.add("xplayer-controller-comment");
        this.player.template.mask.classList.add("xplayer-mask-show");
        this.player.container.classList.add("xplayer-show-controller");
        (this.player.template.yzmcomment || this.player.template.commentInput).focus();
      }
    }, {
      key: "hide",
      value: function () {
        this.player.template.controller.classList.remove("xplayer-controller-comment");
        this.player.template.mask.classList.remove("xplayer-mask-show");
        this.player.container.classList.remove("xplayer-show-controller");
        this.player.controller.disableAutoHide = false;
        this.hideSetting();
      }
    }, {
      key: "showSetting",
      value: function () {
        this.player.template.commentSettingBox.classList.add("xplayer-comment-setting-open");
      }
    }, {
      key: "hideSetting",
      value: function () {
        this.player.template.commentSettingBox.classList.remove("xplayer-comment-setting-open");
      }
    }, {
      key: "toggleSetting",
      value: function () {
        if (this.player.template.commentSettingBox.classList.contains("xplayer-comment-setting-open")) {
          this.hideSetting();
        } else {
          this.showSetting();
        }
      }
    }, {
      key: "send",
      value: function () {
        var self2 = this;
        this.player.template.commentInput.blur();
        if (!this.player.template.commentInput.value.replace(/^\s+|\s+$/g, "")) {
          this.player.notice(this.player.tran("Please input danmaku content!"));
          return;
        }
        this.player.danmaku.send({
          text: this.player.template.commentInput.value,
          color: this.player.container.querySelector(".xplayer-comment-setting-color input:checked").value,
          type: this.player.container.querySelector(".xplayer-comment-setting-type input:checked").value,
          size: this.player.container.querySelector(".xplayer-comment-setting-font input:checked").value
        }, function (error) {
          if (error) return;
          self2.player.template.commentInput.value = "";
          self2.hide();
        });
      }
    }]);
    return Comment;
  }();
  exports.default = CommentExport;
};
