/* Recovered original module 4: video-template. Bindings renamed by scope, not rewritten. */
module.exports = function (module, exports, requireModule) {
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
};
