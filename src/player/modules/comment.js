/* Independent viewing settings and authored styles for the danmaku composer. */
module.exports = function (module, exports, requireModule) {
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
};
