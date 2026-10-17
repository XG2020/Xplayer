/* Xplayer playback adjustment panels. Project author: XGGM. */
(function (global) {
    'use strict';
    const states = new WeakMap();
    const empty = value => value === undefined || value === null || value === '';
    // Dynamic compression, not a measurement of the video's integrated loudness.
    const NORMALIZATION_PRESETS = {
        standard: {threshold: -24, knee: 24, ratio: 4, attack: 0.003, release: 0.25},
        'high-dynamic': {threshold: -12, knee: 12, ratio: 2, attack: 0.02, release: 0.18}
    };
    function createAudioEngine(player) {
const engine = {
  normalizationMode: 'off',
  x: {
    default: {
      threshold: -24,
      knee: 30,
      ratio: 12,
      attack: 0.003,
      release: 0.25
    }
  },
  d: {
    10: {
      custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bassBooster: [5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
      bassReducer: [-5, -4, -3, -2, -1, 0, 0, 0, 0, 0],
      classical: [4.5, 4, 3, 2, -1, -1, 0, 2, 3, 4],
      dance: [4, 7, 5, 0, 2, 3, 5, 4, 3, 0],
      deep: [5, 3, 2, 1, 3, 2, 1, -2, -4, -5],
      electronic: [4.5, 3.5, 1, 0, -2, 2, 0.5, 1, 4, 5],
      hiphop: [5, 4, 1, 3, -1, -1, 1, -1, 2, 3],
      jazz: [4, 3, 1, 2, -2, -2, 0, 1, 3, 4],
      latin: [4.5, 3, 0, 0, -1.5, -1.5, -1.5, 0, 3, 4.5],
      loudness: [6, 4, 0, 0, -2, 0, -1, -5, 5, 1],
      lounge: [-3, -1.5, -0.5, 1.5, 4, 2, 0, -1.5, 2, 1],
      piano: [3, 2, 0, 2.5, 3, 1, 3.5, 4, 3, 3.5],
      pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
      rnb: [3, 7, 6, 2, -3, -2, 2, 3, 3, 4],
      rock: [5, 4, 3, 2, -1, -1, 1, 3, 4, 5],
      smallSpeakers: [5, 4, 3, 2, 1, 0, -1, -2, -3, -4],
      spokenWord: [-4, -1, 0, 1, 4, 5, 5, 4, 2, 0],
      trebleBooster: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
      trebleReducer: [0, 0, 0, 0, 0, -1, -2, -3, -4, -5],
      vocalBooster: [-2, -3, -3, 1, 4, 4, 3, 1, 0, -2],
      guitar: [-5, -3, -2, 2, -0.5, 0, 0, 2, 6, 0]
    },
    5: {
      custom: [0, 0, 0, 0, 0],
      default: [0, 0, 0, 0, 0],
      bassBooster: [3, 0, 0, 0, 0],
      bassReducer: [-3, 0, 0, 0, 0],
      classical: [2.5, -1, 0.5, 2.5, 4],
      dance: [3.6, 3, 4.75, 3.5, 0],
      deep: [2.8, 2, 0.25, -3, -5],
      electronic: [1.4, 2, 0.625, 2.5, 5],
      hiphop: [2.4, -1, 0.5, 0.5, 3],
      jazz: [1.6, -2, 0.25, 2, 4],
      latin: [1.2, -1.5, -1.125, 1.5, 4.5],
      loudness: [1.6, 0, -2, 0, 1],
      lounge: [0.1, 2, -0.375, 0.25, 1],
      piano: [2.1, 1, 3.625, 3.5, 3.5],
      pop: [0.6, 4, 1.5, -0.5, -2],
      rnb: [3, -2, 2.25, 3, 4],
      rock: [2.6, -1, 1.5, 3.5, 5],
      smallSpeakers: [3, 0, -1.25, -2.5, -4],
      spokenWord: [0, 5, 4.75, 3, 0],
      trebleBooster: [0, 1, 2.25, 3.5, 5],
      trebleReducer: [0, -1, -2.25, -3.5, -5],
      vocalBooster: [-0.6, 4, 2.5, 0.5, -2],
      guitar: [-1.7, 0, 0.5, 4, 0]
    },
    3: {
      custom: [0, 0, 0],
      default: [0, 0, 0],
      bassBooster: [2, 0, 0],
      bassReducer: [-2, 0, 0],
      classical: [2, 0, 3],
      dance: [0, 5, 3],
      deep: [1, 1, -4],
      electronic: [0, 0.5, 4],
      hiphop: [3, 1, 2],
      jazz: [2, 0, 3],
      latin: [0, -1.5, 3],
      loudness: [0, -1, 5],
      lounge: [1.5, 0, 2],
      piano: [2.5, 3.5, 3],
      pop: [2, 2, -1],
      rnb: [2, 2, 3],
      rock: [2, 1, 4],
      smallSpeakers: [2, -1, -3],
      spokenWord: [1, 5, 2],
      trebleBooster: [0, 2, 4],
      trebleReducer: [0, -2, -4],
      vocalBooster: [1, 3, 0],
      guitar: [2, 0, 6]
    }
  },
  h: {
    10: [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
    5: [400, 1000, 2500, 6000, 16000],
    3: [250, 2000, 8000]
  },
  u: {
    default: {
      mix: 0,
      decay: 0.3,
      fadeIn: 0.01,
      reverse: !1,
      ir: "moorer",
      highCut: 7000,
      lowCut: 0,
      gain: 1
    },
    hall: {
      mix: 0.5,
      decay: 1.8,
      fadeIn: 30,
      reverse: !1,
      ir: "moorer",
      highCut: 7000,
      lowCut: 0,
      gain: 1
    },
    room: {
      mix: 0.5,
      decay: 1.4,
      fadeIn: 10,
      reverse: !1,
      ir: "simple",
      highCut: 7000,
      lowCut: 80,
      gain: 1
    },
    live: {
      mix: 0.3,
      decay: 3,
      fadeIn: 17,
      reverse: !1,
      ir: "simple",
      highCut: 7000,
      lowCut: 0,
      gain: 1
    },
    bathroom: {
      mix: 0.9,
      decay: 0.6,
      fadeIn: 0.3,
      reverse: !1,
      ir: "moorer",
      highCut: 7000,
      lowCut: 0,
      gain: 2
    }
  },
  y: {
    init: function (_0x2f9b24) {
      this.audioCtx = _0x2f9b24, this.input = this.audioCtx.createPanner(), this.input.panningModel = "HRTF", this.input.distanceModel = "inverse", this.input.refDistance = 1, this.input.coneInnerAngle = 360, this.input.coneOuterAngle = 0, this.input.coneOuterGain = 0;
    },
    set3d: function (_0xcf9bf6, _0x5564d4, _0x1719e6) {
      void 0 === _0x1719e6 && (_0x1719e6 = 300), this.input.positionX ? (this.input.positionX.value = _0xcf9bf6, this.input.positionY.value = _0x5564d4, this.input.positionZ.value = _0x1719e6) : this.input.setPosition(_0xcf9bf6, _0x5564d4, _0x1719e6);
    },
    connect: function (_0x281496) {
      this.input.connect(_0x281496), this.start();
    },
    disconnect: function () {
      this.input.disconnect(), this.stop();
    },
    start: function () {
      {
        var _0x476d15 = this;
        if (!this.timer) {
          {
            var _0x4dd448 = 0;
            this.timer = window.setInterval(function () {
              _0x476d15.set3d(1.5 * Math.cos(_0x4dd448), 0, 1.5 * Math.sin(_0x4dd448)), _0x4dd448 += 0.5;
            }, 1000);
          }
        }
      }
    },
    stop: function () {
      clearInterval(this.timer), this.timer = 0;
    }
  },
  v: {
    init: function (_0x4dd414) {
      {
        var _0x3041d6 = "0|5|8|7|6|9|3|4|1|2".split("|"),
          _0x36a020 = 0;
        while (!![]) {
          switch (_0x3041d6[_0x36a020++]) {
            case "0":
              this.type = "10", this.presetName = "default";
              continue;
            case "1":
              this.resetEQ(this.eqSetting);
              continue;
            case "2":
              this.setData(this.data);
              continue;
            case "3":
              this.input = this.audioCtx.createGain();
              continue;
            case "4":
              this.output = this.audioCtx.createGain();
              continue;
            case "5":
              this.preset = engine.d[this.type];
              continue;
            case "6":
              this.eq = [];
              continue;
            case "7":
              this.data = this.preset[this.presetName];
              continue;
            case "8":
              this.eqSetting = engine.h[this.type];
              continue;
            case "9":
              this.audioCtx = _0x4dd414;
              continue;
          }
          break;
        }
      }
    },
    connect: function (_0x294efb) {
      this.output.connect(_0x294efb);
    },
    selectPreset: function (_0x4b2644) {
      {
        var _0x3d6229 = this.preset[_0x4b2644];
        _0x3d6229 && (this.presetName = _0x4b2644, this.setData(_0x3d6229, !1));
      }
    },
    setData: function (_0x585904, _0x18e163) {
      if (void 0 === _0x18e163 && (_0x18e163 = !0), Array.isArray(_0x585904) && _0x585904.length && this.audioCtx) {
        // Preset tables must stay immutable so Reset restores the original flat EQ.
        this.data = _0x585904.slice();
        for (var _0x18923b = 0; _0x18923b < this.eqSetting.length; _0x18923b++) this.data[_0x18923b] = _0x585904[_0x18923b], this.eq[_0x18923b] && this.eq[_0x18923b].gain.setTargetAtTime(_0x585904[_0x18923b] ? _0x585904[_0x18923b] : 0, this.audioCtx.currentTime, 0.015);
      }
    },
    resetEQ: function (_0x20b339) {
      {
        if (this.audioCtx && this.input && this.output) {
          {
            this.eqSetting = _0x20b339;
            var _0x4ac799 = this.audioCtx;
            this.eq.forEach(function (_0x8fc5ba) {
              _0x8fc5ba.disconnect();
            });
            for (var _0x4471a9 = 0; _0x4471a9 < _0x20b339.length; _0x4471a9++) {
              {
                var _0x4c0ae0 = void 0;
                this.eq[_0x4471a9] ? _0x4c0ae0 = this.eq[_0x4471a9] : (_0x4c0ae0 = _0x4ac799.createBiquadFilter(), this.eq.push(_0x4c0ae0)), _0x4c0ae0.frequency.setValueAtTime(_0x20b339[_0x4471a9], _0x4ac799.currentTime), _0x4c0ae0.Q.value = 0.7, _0x4c0ae0.type = "peaking";
              }
            }
            this.eq[0].type = "lowshelf", this.eq[_0x20b339.length - 1].type = "highshelf";
            for (var _0x3e3b7f = 1; _0x3e3b7f < _0x20b339.length; _0x3e3b7f++) this.eq[_0x3e3b7f - 1].connect(this.eq[_0x3e3b7f]);
            this.input.connect(this.eq[0]), this.eq[_0x20b339.length - 1].connect(this.output);
          }
        }
      }
    },
    disconnect: function () {
      this.output.disconnect();
    }
  },
  f: {
    init: function (_0xc20a76) {
      var _0x4e1b2c = "0|1|3|4|2".split("|"),
        _0x4dd190 = 0;
      while (!![]) {
        switch (_0x4e1b2c[_0x4dd190++]) {
          case "0":
            this.presetName = "default";
            continue;
          case "1":
            this.data = engine.x[this.presetName];
            continue;
          case "2":
            this.selectPreset(engine.f.presetName);
            continue;
          case "3":
            this.audioCtx = _0xc20a76;
            continue;
          case "4":
            this.input = this.audioCtx.createDynamicsCompressor();
            continue;
        }
        break;
      }
    },
    selectPreset: function (_0x2b6df3) {
      var _0x2063d4 = engine.x[_0x2b6df3];
      _0x2063d4 && (this.presetName = _0x2b6df3, this.setData(_0x2063d4));
    },
    setData: function (_0xee3951) {
      this.data = _0xee3951, this.input && (this.input.threshold.value = this.data.threshold, this.input.knee.value = this.data.knee, this.input.ratio.value = this.data.ratio, this.input.attack.value = this.data.attack, this.input.release.value = this.data.release);
    },
    connect: function (_0x1b3d3e) {
      this.input.connect(_0x1b3d3e);
    },
    disconnect: function () {
      this.input.disconnect();
    }
  },
  w: {
    init: function (_0x45685c) {
      this.audioCtx = _0x45685c, this.lpFreqStart = 15000, this.lpFreqEnd = 1000, this.presetName = "default", this.data = engine.u[this.presetName], this.input = this.audioCtx.createGain(), this.convolverNode = this.audioCtx.createConvolver(), this.outputNode = this.audioCtx.createGain(), this.wetGainNode = this.audioCtx.createGain(), this.dryGainNode = this.audioCtx.createGain(), this.highCutNode = this.audioCtx.createBiquadFilter(), this.lowCutNode = this.audioCtx.createBiquadFilter(), this.highCutNode.type = "lowpass", this.lowCutNode.type = "highpass", this.input.connect(this.highCutNode), this.highCutNode.connect(this.lowCutNode), this.lowCutNode.connect(this.convolverNode), this.convolverNode.connect(this.wetGainNode), this.wetGainNode.connect(this.outputNode), this.input.connect(this.dryGainNode), this.dryGainNode.connect(this.outputNode), this.mix = this.data.mix;
    },
    connect: function (_0x4475f5) {
      this.outputNode.connect(_0x4475f5);
    },
    disconnect: function () {
      this.outputNode.disconnect();
    },
    selectPreset: function (_0x11c477) {
      {
        var _0x97e80 = engine.u[_0x11c477];
        _0x97e80 && (this.presetName = _0x11c477, this.setData(_0x97e80));
      }
    },
    setData: function (_0x48c605) {
      {
        if (0 < Object.keys(_0x48c605).length) {
          {
            for (var _0x274dc8 in _0x48c605) "mix" === _0x274dc8 ? this.mix = _0x48c605[_0x274dc8] : "gain" === _0x274dc8 && (this.gain = _0x48c605[_0x274dc8]);
            this.data = _0x48c605, this.updateImpulse();
          }
        }
      }
    },
    applyGradualLowpass: function (_0x40c3f7, _0x3b8640, _0x538383) {
      var _0xce048f = this;
      if (this.convolverNode) {
        if (0 !== _0x3b8640) {
          for (var _0x50864b = [], _0x1e39e6 = 0; _0x1e39e6 < _0x40c3f7.numberOfChannels; _0x1e39e6++) _0x50864b[_0x1e39e6] = _0x40c3f7.getChannelData(_0x1e39e6);
          var _0x3e02d7 = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(_0x40c3f7.numberOfChannels, _0x50864b[0].length, _0x40c3f7.sampleRate),
            _0x38d980 = _0x3e02d7.createBufferSource();
          _0x38d980.buffer = _0x40c3f7;
          var _0x27af98 = _0x3e02d7.createBiquadFilter(),
            _0x374a8e = Math.min(_0x3b8640, _0x40c3f7.sampleRate / 2),
            _0x2ba739 = Math.min(_0x538383, _0x40c3f7.sampleRate / 2);
          _0x27af98.type = "lowpass", _0x27af98.Q.value = 0.0001, _0x27af98.frequency.setValueAtTime(_0x374a8e, 0), _0x27af98.frequency.linearRampToValueAtTime(_0x2ba739, this.data.decay), _0x38d980.connect(_0x27af98), _0x27af98.connect(_0x3e02d7.destination), _0x38d980.start(), _0x3e02d7.oncomplete = function (_0xe87064) {
            _0xce048f.convolverNode && (_0xce048f.convolverNode.buffer = _0xe87064.renderedBuffer);
          }, _0x3e02d7.startRendering();
        } else this.convolverNode.buffer = _0x40c3f7;
      }
    },
    updateImpulse: function () {
      this.audioCtx && ("moorer" === this.data.ir ? this.ir = function (_0x5dc453, _0x605475) {
        for (var _0x5bef6b, _0x3fe2df = _0x5dc453.sampleRate, _0x6ba915 = 1.5 * _0x605475.decay, _0x2acd10 = Math.round(_0x605475.decay * _0x3fe2df), _0x2e2694 = Math.round(_0x6ba915 * _0x3fe2df), _0x1c8a32 = Math.round((_0x605475.fadeIn || 0) * _0x3fe2df), _0x3e676a = Math.pow(0.001, 1 / _0x2acd10), _0x24ecce = _0x5dc453.createBuffer(2, _0x2e2694, _0x3fe2df), _0x22986b = _0x24ecce.getChannelData(0), _0x375b0d = _0x24ecce.getChannelData(1), _0x221176 = 0; _0x221176 < _0x2e2694; _0x221176++) _0x5bef6b = _0x605475.reverse ? _0x2e2694 - _0x221176 : _0x221176, _0x22986b[_0x221176] = (2 * Math.random() - 1) * Math.pow(_0x3e676a, _0x5bef6b), _0x375b0d[_0x221176] = (2 * Math.random() - 1) * Math.pow(_0x3e676a, _0x5bef6b);
        for (_0x221176 = 0; _0x221176 < _0x1c8a32; _0x221176++) _0x22986b[_0x5bef6b = _0x605475.reverse ? _0x1c8a32 - _0x221176 : _0x221176] *= _0x5bef6b / _0x1c8a32, _0x375b0d[_0x5bef6b] *= _0x5bef6b / _0x1c8a32;
        return _0x24ecce;
      }(this.audioCtx, this.data) : this.ir = function (_0x556e7b, _0x164af) {
        {
          for (var _0x16710b, _0x45172d = _0x556e7b.sampleRate * _0x164af.decay, _0x13dfb8 = _0x556e7b.createBuffer(2, _0x45172d, _0x556e7b.sampleRate), _0x4deea3 = _0x13dfb8.getChannelData(0), _0x3f0a97 = _0x13dfb8.getChannelData(1), _0x4cecb0 = 0; _0x4cecb0 < _0x45172d; _0x4cecb0++) _0x16710b = _0x164af.reverse ? _0x45172d - _0x4cecb0 : _0x4cecb0, _0x4deea3[_0x4cecb0] = (2 * Math.random() - 1) * Math.pow(1 - _0x16710b / _0x45172d, _0x164af.fadeIn), _0x3f0a97[_0x4cecb0] = (2 * Math.random() - 1) * Math.pow(1 - _0x16710b / _0x45172d, _0x164af.fadeIn);
          return _0x13dfb8;
        }
      }(this.audioCtx, this.data), this.applyGradualLowpass(this.ir, this.lpFreqStart || 0, this.lpFreqEnd || 0));
    }
  },
  g: {
    init: function (_0x481c66) {
      this.audioCtx = _0x481c66, this.input = this.audioCtx.createBiquadFilter(), this.input.type = "lowpass", this.input.frequency.value = 2000, this.lowPass2 = this.audioCtx.createBiquadFilter(), this.lowPass2.type = "lowpass", this.lowPass2.frequency.value = 2000, this.highPass = this.audioCtx.createBiquadFilter(), this.highPass.type = "highpass", this.highPass.frequency.value = 500, this.highPass2 = this.audioCtx.createBiquadFilter(), this.highPass2.type = "highpass", this.highPass2.frequency.value = 500, this.input.connect(this.lowPass2), this.lowPass2.connect(this.highPass), this.highPass.connect(this.highPass2);
    },
    connect: function (_0x169f04) {
      this.highPass2.connect(_0x169f04);
    },
    disconnect: function () {
      this.highPass2.disconnect();
    }
  },
  set: function (_0x401abe, _0x1d475b) {
    try {
      this.init(), this.setEffect(_0x401abe, _0x1d475b, !1);
    } catch (_0x3b419d) {
      throw _0x3b419d;
    }
  },
  setEffect: function (_0x4b259d, _0x4a26a1, _0x161a70) {
    {
      var _0x428bac,
        _0x4d8be4 = this;
      if (void 0 === _0x161a70 && (_0x161a70 = !1), !this.noCtx() && (this.currentEffect !== _0x4b259d || _0x161a70 || !empty(_0x4a26a1) && _0x4a26a1 != "default")) {
        {
          this.currentEffect = _0x4b259d, this.disconnect();
          var _0x4297cd = null === (_0x428bac = this.map3[_0x4b259d]) || void 0 === _0x428bac ? void 0 : _0x428bac.items;
          _0x4297cd && _0x4297cd.forEach(function (_0x36509e) {
            _0x4d8be4.effectsObj[_0x36509e.name].active = !0, _0x36509e.preset && _0x4d8be4.effectsObj[_0x36509e.name].node.selectPreset(_0x36509e.preset);
          });
          this.effectsObj.compressor.active = this.normalizationMode !== 'off';
          if (this.effectsObj.compressor.active) this.f.setData(NORMALIZATION_PRESETS[this.normalizationMode]);
          if (!empty(_0x4a26a1) && _0x4a26a1 != "default") {
            this.effectsObj.eq.active = !0, this.effectsObj.eq.node.selectPreset(_0x4a26a1);
          }
          this.connectAll();
        }
      }
    }
  },
  init: function () {
    var _0x386fe0 = player.video;
    if (this.noCtx() && _0x386fe0) {
      var _0x1279db = "4|2|1|0|5|3".split("|"),
        _0xfafb2b = 0;
      while (!![]) {
        switch (_0x1279db[_0xfafb2b++]) {
          case "0":
            this.gain = this.audioCtx.createGain();
            continue;
          case "1":
            this.destination = this.audioCtx.destination;
            continue;
          case "2":
            this.source = this.audioCtx.createMediaElementSource(_0x386fe0);
            continue;
          case "3":
            this.connectAll();
            continue;
          case "4":
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            continue;
          case "5":
            this.effectsObj = {
              eq: {
                active: !1,
                node: this.v,
                init: this.v.init(this.audioCtx)
              },
              reverb: {
                active: !1,
                node: this.w,
                init: this.w.init(this.audioCtx)
              },
              a3d: {
                active: !1,
                node: this.y,
                init: this.y.init(this.audioCtx)
              },
              phone: {
                active: !1,
                node: this.g,
                init: this.g.init(this.audioCtx)
              },
              compressor: {
                active: !1,
                node: this.f,
                init: this.f.init(this.audioCtx)
              }
            }, this.effectsList = Object.keys(this.effectsObj);
            continue;
        }
        break;
      }
    }
  },
  connectAll: function () {
    var _0x51fc41,
      _0xc89ba5 = this,
      _0xb81b2 = this.source;
    this.effectsList.forEach(function (_0x220269) {
      (null == (_0x51fc41 = _0xc89ba5.effectsObj[_0x220269]) ? void 0 : _0x51fc41.active) && _0x51fc41.node.input && (_0xb81b2.connect(_0x51fc41.node.input), _0xb81b2 = _0x51fc41.node);
    }), _0xb81b2.connect(this.gain), this.gain.connect(this.destination);
  },
  disconnect: function () {
    var _0x1f2df6,
      _0x345a7f = this;
    this.source.disconnect(), this.effectsList.forEach(function (_0x3835f5) {
      (null == (_0x1f2df6 = _0x345a7f.effectsObj[_0x3835f5]) ? void 0 : _0x1f2df6.active) && _0x1f2df6.node.input && (_0x1f2df6.node.disconnect(), _0x1f2df6.active = !1);
    }), this.gain.disconnect();
  },
  destroy: function () {
    this.disconnect(), this.audioCtx && this.audioCtx.close();
  },
  clear: function () {
    this.disconnect(), this.connectAll();
  },
  play: function () {
    this.audioCtx && this.audioCtx.resume(), this.setEffect(this.currentEffect, !0);
  },
  update: function () {
    this.destroy(), this.init(), this.play();
  },
  noCtx: function () {
    return !this.audioCtx || "closed" === this.audioCtx.state;
  },
  setGain: function (_0x30a696) {
    this.noCtx() || this.gain.gain.setTargetAtTime(this.db2gain(_0x30a696), this.audioCtx.currentTime, 0.015);
  },
  gain2db: function (_0x119902) {
    return Math.log(_0x119902) / Math.LN10 * 20;
  },
  db2gain: function (_0x39e7bf) {
    return Math.pow(10, _0x39e7bf / 20);
  },
  map: {
    a3d: "3D环绕",
    bassBooster: "超重低音",
    bathroom: "浴室",
    concertHall: "音乐厅",
    phone: "听筒",
    piano: "钢琴",
    pop: "流行时尚",
    rnb: "蓝调",
    spokenWord: "清澈人声"
  },
  map2: {
    default: "默认",
    classical: "古典",
    dance: "舞蹈",
    deep: "低沉",
    electronic: "电音",
    guitar: "吉他",
    hiphop: "嘻哈",
    jazz: "爵士",
    latin: "拉丁",
    piano: "钢琴",
    pop: "流行",
    rnb: "蓝调",
    rock: "摇滚",
    spokenWord: "说唱",
    bassBooster: "重低音",
    bassReducer: "弱低音",
    trebleBooster: "重高音",
    trebleReducer: "弱高音",
    vocalBooster: "人声强化",
    smallSpeakers: "弱人声",
    loudness: "响度模式",
    lounge: "休息室模式"
  },
  map3: {
    default: {
      items: [{
        name: "eq",
        preset: "default"
      }]
    },
    bassBooster: {
      items: [{
        name: "eq",
        preset: "bassBooster"
      }]
    },
    piano: {
      items: [{
        name: "eq",
        preset: "piano"
      }, {
        name: "reverb",
        preset: "room"
      }]
    },
    pop: {
      items: [{
        name: "eq",
        preset: "pop"
      }]
    },
    rnb: {
      items: [{
        name: "eq",
        preset: "rnb"
      }]
    },
    spokenWord: {
      items: [{
        name: "eq",
        preset: "spokenWord"
      }]
    },
    concertHall: {
      items: [{
        name: "reverb",
        preset: "hall"
      }]
    },
    bathroom: {
      items: [{
        name: "reverb",
        preset: "bathroom"
      }]
    },
    a3d: {
      items: [{
        name: "a3d"
      }]
    },
    phone: {
      items: [{
        name: "phone"
      }]
    }
  }
};
        return engine;
    }

    function stateFor(player) {
        if (states.has(player)) return states.get(player);
        const state = {player, color: [100, 100, 100], effect: 'default', eq: 'default', eqBands: 10, customEq: null, customEqByBands: {}, equalizerEnabled: false, gain: 0, normalization: 'off', normalizationRequest: 0, audio: null, dialog: null};
        states.set(player, state);
        const onKey = event => {
            const target = event.target;
            if (target?.closest?.('input,textarea,select,[contenteditable="true"],.xplayer-feature-dialog') || event.ctrlKey || event.altKey || event.metaKey) return;
            if (!player.focus || state.dialog !== null) return;
            if (event.code === 'KeyF') {event.preventDefault(); player.fullScreen.toggle('browser');}
            else if (event.code === 'BracketRight') {event.preventDefault(); global.XGGM?.video?.next();}
            else if (event.code === 'BracketLeft') {
                event.preventDefault();
                try {
                    const previous = new URL(document.referrer);
                    if(previous.origin === location.origin && previous.pathname === location.pathname && previous.searchParams.get('url') && previous.href !== location.href && global.history.length > 1) global.history.back();
                    else player.notice('暂无已播放的上一集');
                } catch (_) {player.notice('暂无已播放的上一集');}
            }
        };
        document.addEventListener('keydown', onKey);
        // Original Hammer gesture semantics: a 50px threshold, one second per pan event,
        // and an upward movement of 50px to cancel before releasing the pointer.
        let gesture = null, suppressClickUntil = 0;
        const pointerDown = event => {
            if(event.pointerType !== 'touch' || !event.isPrimary || !event.target.closest('.xplayer-video-wrap') || !Number.isFinite(player.video.duration)) return;
            gesture={id:event.pointerId,x:event.clientX,y:event.clientY,time:Math.round(player.video.currentTime),offset:0,cancelled:false};
            event.target.setPointerCapture?.(event.pointerId);
        };
        const pointerMove = event => {
            if(!gesture || event.pointerId !== gesture.id || gesture.cancelled) return;
            const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
            if(gesture.offset && dy < -50) {gesture.offset=0;gesture.cancelled=true;player.notice('取消');suppressClickUntil=Date.now()+500;return;}
            if((Math.abs(dx)>50 || gesture.offset) && Math.abs(dy)<50) {
                gesture.offset += dx > 0 ? 1 : -1;
                const seconds=Math.abs(gesture.offset);
                player.notice((gesture.offset>0?'快进 ':'快退 ')+seconds+' 秒，上滑取消');
                suppressClickUntil=Date.now()+500;
            }
        };
        const pointerEnd = event => {
            if(!gesture || event.pointerId !== gesture.id) return;
            if(!gesture.cancelled && gesture.offset && event.type !== 'pointercancel') player.seek(gesture.time+gesture.offset);
            gesture=null;
        };
        const gestureClick = event => {if(Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}};
        player.container.addEventListener('pointerdown',pointerDown);
        player.container.addEventListener('pointermove',pointerMove);
        player.container.addEventListener('pointerup',pointerEnd);
        player.container.addEventListener('pointercancel',pointerEnd);
        player.container.addEventListener('click',gestureClick,true);
        player.on('play', () => {if(state.audio?.audioCtx?.state === 'suspended') state.audio.audioCtx.resume().catch(() => {});});
        player.on('destroy', () => {
            document.removeEventListener('keydown', onKey);
            player.container.removeEventListener('pointerdown',pointerDown);
            player.container.removeEventListener('pointermove',pointerMove);
            player.container.removeEventListener('pointerup',pointerEnd);
            player.container.removeEventListener('pointercancel',pointerEnd);
            player.container.removeEventListener('click',gestureClick,true);
            if (state.dialog !== null) global.layer.close(state.dialog);
            if (state.audio?.audioCtx) {
                state.audio.y.stop();
                try {state.audio.disconnect();} catch (_) {}
                state.audio.audioCtx.close().catch(() => {});
            }
            states.delete(player);
        });
        return state;
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if(className) node.className = className;
        if(text !== undefined) node.textContent = text;
        return node;
    }
    function openDialog(state, title, content, reset, wide = false, options = {}) {
        if(state.dialog !== null) global.layer.close(state.dialog);
        content.classList.add('xplayer-feature-content');
        state.player.focus = false;
        // layer 3 wraps an existing DOM node; detached content otherwise remains detached.
        document.body.appendChild(content);
        let dialogId;
        dialogId = global.layer.open({
            type: 1, title: options.hideTitle ? false : title, content: global.jQuery(content), skin: 'xplayer-feature-dialog' + (options.className ? ' ' + options.className : ''),
            area: [Math.min(options.width || (wide ? 440 : 380), Math.max(260, global.innerWidth - 24)) + 'px', options.height ? options.height + 'px' : 'auto'],
            shade: 0, shadeClose: false, closeBtn: options.hideTitle ? 0 : 1, resize: false,
            btn: wide ? ['重置'] : reset ? ['确定', '重置'] : ['确定'],
            yes: wide ? () => {reset();return false;} : undefined,
            btn2: reset ? () => {reset(); return false;} : undefined,
            success: (layerElement, index) => {
                const fullscreen = document.fullscreenElement;
                if(fullscreen) {
                    fullscreen.appendChild(layerElement[0]);
                    const shade = document.getElementById('layui-layer-shade' + index);
                    if(shade) fullscreen.appendChild(shade);
                }
                content.querySelector('input,select,button')?.focus();
            },
            end: () => {content.remove();if(state.dialog === dialogId){state.dialog = null; state.player.focus = true;}}
        });
        state.dialog = dialogId;
    }
    function rangeRow(host, label, id, min, max, value, suffix, change) {
        const row = element('label', 'xplayer-feature-row'); row.htmlFor = id;
        row.appendChild(element('span', 'xplayer-feature-label', label));
        const output = element('output', 'xplayer-feature-value', value + suffix); output.id = id.replace('-input','-Value');
        const input = element('input'); input.id = id; input.type = 'range'; input.min = min; input.max = max; input.step = 1; input.value = value;
        const paint=next=>input.style.setProperty('--range-fill',((next-min)/(max-min)*100)+'%');paint(value);
        input.addEventListener('input', () => {const next = Number(input.value); output.textContent = next + suffix;paint(next);change(next);});
        row.append(input, output); host.append(row);
        return {input, output, update(next) {input.value=next; output.textContent=next+suffix;paint(next);}};
    }
    function showColor(player) {
        const state = stateFor(player), panel = element('div', 'xplayer-color-panel');
        const apply = () => {
            const wrap = player.container.querySelector('.xplayer-video-wrap');
            if(wrap) wrap.style.filter = `saturate(${state.color[0]/100}) brightness(${state.color[1]/100}) contrast(${state.color[2]/100})`;
        };
        const rows = [['饱和度','saturate'],['明亮度','brightness'],['对比度','contrast']].map(([label,id], index) =>
            rangeRow(panel,label,id+'-input',0,255,state.color[index],'',value=>{state.color[index]=value;apply();}));
        openDialog(state,'色彩调整',panel,()=>{state.color=[100,100,100];rows.forEach(row=>row.update(100));apply();});
    }
    function audioEligibility(player) {
        if(!global.AudioContext && !global.webkitAudioContext) return '当前浏览器不支持音效调节';
        const source = player.video.currentSrc || player.video.src;
        if(!source) return '请在视频加载后调节音效';
        return '';
    }
    async function prepareAudio(player, state) {
        const video=player.video,source=new URL(video.currentSrc||video.src,document.baseURI);
        if(source.protocol==='blob:'||source.origin===location.origin||video.crossOrigin)return;
        if(state.preparingAudio)return state.preparingAudio;
        state.preparingAudio=(async()=>{
            // Attempt the media load directly; never disable effects based on a URL/header pre-check.
            const position=video.currentTime,paused=video.paused,rate=video.playbackRate;
            const reload=()=>new Promise((resolve,reject)=>{
                const timer=setTimeout(()=>done(Error('音频加载超时')),10000);
                const ready=()=>done(),failed=()=>done(Error('音频加载失败'));
                function done(error){clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',failed);error?reject(error):resolve();}
                video.addEventListener('loadeddata',ready);video.addEventListener('error',failed);video.load();
            });
            player.audioReloading=true;video.crossOrigin='anonymous';
            try {await reload();}
            catch(error){video.removeAttribute('crossorigin');await reload().catch(()=>{});video.currentTime=position;video.playbackRate=rate;if(!paused)video.play().catch(()=>{});throw Error('该视频源无法以跨域音频模式加载，已恢复原声');}
            video.currentTime=Math.min(position,Number.isFinite(video.duration)?video.duration:position);video.playbackRate=rate;
            if(!paused)await video.play().catch(()=>{});
        })();
        try {await state.preparingAudio;} finally {player.audioReloading=false;state.preparingAudio=null;}
    }
    // Basic effects and custom EQ share one frame; changing views/bands never resizes it.
    const AUDIO_PANEL_SIZE = {width: 500, height: 390};
    function audioPanelSize() {
        return {width: Math.min(AUDIO_PANEL_SIZE.width, global.innerWidth - 24), height: Math.min(AUDIO_PANEL_SIZE.height, global.innerHeight - 24)};
    }
    async function applyAudioState(player, state, shouldApply = () => true) {
        const engine = state.audio || state.audioEngine || (state.audioEngine = createAudioEngine(player));
        if (!state.audio) await prepareAudio(player, state);
        if (!shouldApply()) return null;
        engine.init(); state.audio = engine;
        engine.audioCtx.resume().catch(() => {});
        const type = String(state.eqBands || 10);
        if (engine.v.type !== type) {
            engine.v.input.disconnect();
            engine.v.eq.forEach(node => node.disconnect());
            engine.v.eq = engine.v.eq.slice(0, Number(type));
            engine.v.type = type;
            engine.v.preset = engine.d[type];
            engine.v.resetEQ(engine.h[type]);
        }
        engine.normalizationMode = state.requestedNormalization || state.normalization;
        engine.setEffect(state.effect, state.equalizerEnabled ? 'custom' : state.eq, true);
        if (state.equalizerEnabled) {
            engine.v.presetName = state.eq;
            engine.v.setData(equalizerValues(state, engine));
        }
        engine.setGain(state.gain);
        return engine;
    }
    async function setNormalization(player, mode) {
        if (mode !== 'off' && !Object.prototype.hasOwnProperty.call(NORMALIZATION_PRESETS, mode)) throw Error('未知音量均衡模式');
        const state = stateFor(player), request = ++state.normalizationRequest;
        state.requestedNormalization = mode;
        // Opening settings, querying the preference or selecting Off must stay lazy.
        if (mode === 'off' && !state.audio) {state.normalization = mode;return mode;}
        const error = audioEligibility(player);
        if (error) {state.requestedNormalization = state.normalization;throw Error(error);}
        try {
            await applyAudioState(player, state, () => request === state.normalizationRequest);
            if (request === state.normalizationRequest) state.normalization = mode;
            return state.normalization;
        } catch (error) {
            if (request === state.normalizationRequest) state.requestedNormalization = state.normalization;
            throw error;
        }
    }
    function audioControls(player, state, message) {
        const engine = state.audio || state.audioEngine || (state.audioEngine = createAudioEngine(player));
        const error = audioEligibility(player);
        if (error) message.textContent = error;
        const apply = async () => {
            if (error) return;
            try {
                if (!state.audio) message.textContent = '正在准备音效…';
                await applyAudioState(player, state);
                message.textContent = '';
            } catch (error) {
                message.textContent = error.message || '音效暂不可用，请稍后重试';
                // A failed node setup must leave a direct route for the original audio.
                if (engine.source && engine.audioCtx) {
                    try {engine.source.disconnect(); engine.source.connect(engine.audioCtx.destination);} catch (_) {}
                }
            }
        };
        return {engine, unavailable: !!error, apply};
    }
    function equalizerValues(state, engine) {
        const count = state.eqBands || 10;
        const values = state.eq === 'custom' && state.customEq
            ? state.customEq : engine.d[count][state.eq] || engine.d[count].default;
        return Array.from({length: count}, (_, index) => Math.max(-12, Math.min(12, Number(values[index]) || 0)));
    }
    function showAudio(player) {
        const state = stateFor(player), panel = element('div', 'xplayer-audio-panel'), presets = element('div', 'btn-panel-box');
        presets.id = 'audio-panel';
        const message = element('p', 'xplayer-feature-message'); message.setAttribute('role', 'status');
        const {engine, unavailable, apply} = audioControls(player, state, message);
        const buttons = [];
        Object.entries(engine.map).forEach(([key, label]) => {
            const button = element('button', 'btn-panel-box-btn', label); button.type = 'button'; button.dataset.val = key;
            button.classList.toggle('selected', state.effect === key); button.disabled = unavailable;
            button.addEventListener('click', () => {
                state.effect = key; state.eq = 'default'; state.equalizerEnabled = false; state.customEq = null;
                buttons.forEach(item => item.classList.toggle('selected', item.dataset.val === key)); apply();
            });
            buttons.push(button); presets.append(button);
        });
        panel.append(presets);
        const gain = rangeRow(panel, '音量增强', 'volume-input', -12, 12, state.gain, 'dB', value => {
            state.gain = value; if (!state.audio) apply(); else engine.setGain(value);
        });
        gain.input.disabled = unavailable;
        gain.input.step = '0.1';
        gain.input.before(element('span', 'xplayer-range-limit', '−12dB'));
        gain.input.after(element('span', 'xplayer-range-limit', '+12dB'));
        gain.output.hidden = true;
        const gainTrack=element('span','xplayer-gain-track'),gainTip=element('output','xplayer-gain-tooltip');gainTip.hidden=true;
        gain.input.before(gainTrack);gainTrack.append(gain.input,gainTip);
        const gainTipValue=()=>{const value=Number(gain.input.value);gainTip.textContent=value.toFixed(1).replace(/\.0$/,'');gainTip.style.left=((value+12)/24*100)+'%';gain.input.setAttribute('aria-valuetext',value+' dB');};
        const showGainTip=()=>{gainTipValue();gainTip.hidden=false;};
        const hideGainTip=()=>{gainTip.hidden=true;};
        gain.input.addEventListener('pointerdown',event=>{showGainTip();try{gain.input.setPointerCapture(event.pointerId);}catch(_){}});
        gain.input.addEventListener('input',gainTipValue);
        gain.input.addEventListener('pointerup',hideGainTip);gain.input.addEventListener('pointercancel',hideGainTip);gain.input.addEventListener('lostpointercapture',hideGainTip);gain.input.addEventListener('blur',hideGainTip);
        gain.input.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))showGainTip();});gain.input.addEventListener('keyup',hideGainTip);
        panel.append(message);
        const customToggle = element('button', 'xplayer-audio-custom', '自定义'); customToggle.type = 'button';
        customToggle.setAttribute('aria-label', '自定义均衡器');
        customToggle.addEventListener('click', () => showEqualizer(player));
        openDialog(state, '音效调节', panel, () => {
            state.effect = 'default'; state.eq = 'default'; state.customEq = null; state.customEqByBands = {};
            state.equalizerEnabled = false; state.gain = 0; gain.update(0);
            buttons.forEach(button => button.classList.remove('selected')); if (state.audio) apply();
        }, true, {...audioPanelSize(), className: 'xplayer-audio-dialog'});
        document.getElementById('layui-layer' + state.dialog).querySelector('.layui-layer-btn').append(customToggle);
        apply();
    }
    function resampleEqualizer(values, fromFrequencies, toFrequencies) {
        return toFrequencies.map(frequency => {
            if (frequency <= fromFrequencies[0]) return values[0];
            const last = fromFrequencies.length - 1;
            if (frequency >= fromFrequencies[last]) return values[last];
            const high = fromFrequencies.findIndex(value => value >= frequency), low = high - 1;
            const ratio = Math.log(frequency / fromFrequencies[low]) / Math.log(fromFrequencies[high] / fromFrequencies[low]);
            return Math.round((values[low] + (values[high] - values[low]) * ratio) * 2) / 2;
        });
    }
    function showEqualizer(player) {
        const state = stateFor(player), panel = element('div', 'xplayer-equalizer-panel');
        const message = element('p', 'xplayer-feature-message'); message.setAttribute('role', 'status');
        const {engine, unavailable, apply} = audioControls(player, state, message);
        if (!state.equalizerEnabled) {
            const preset = engine.map3[state.effect]?.items.find(item => item.name === 'eq')?.preset;
            state.eq = preset || 'default'; state.customEq = null; state.equalizerEnabled = true;
        }
        const header = element('div', 'xplayer-eq-header');
        const back = element('button', 'xplayer-eq-back', '预设'); back.type = 'button'; back.setAttribute('aria-label', '返回预设音效');
        back.addEventListener('click', () => showAudio(player));
        const presetLabel = element('label', 'xplayer-eq-select-label'); presetLabel.htmlFor = 'eq_select';
        presetLabel.append(element('span', '', '均衡器:'));
        const presetSelect = element('select'); presetSelect.id = 'eq_select'; presetSelect.setAttribute('aria-label', '均衡器预设');
        Object.entries(engine.map2).forEach(([key, label]) => {const option = element('option', '', label); option.value = key; presetSelect.append(option);});
        // A hidden status option labels manual edits without adding a 23rd preset.
        const customOption = element('option', '', '自定义'); customOption.value = 'custom'; customOption.hidden = true; customOption.disabled = true; presetSelect.append(customOption);
        presetSelect.value = state.eq; presetSelect.disabled = unavailable; presetLabel.append(presetSelect);
        const countLabel = element('label', 'xplayer-eq-count-label'); countLabel.htmlFor = 'eq_bands'; countLabel.append(element('span', '', '分段:'));
        const countSelect = element('select'); countSelect.id = 'eq_bands'; countSelect.setAttribute('aria-label', '均衡器分段');
        [3, 5, 10].forEach(count => {const option = element('option', '', count + '段'); option.value = count; countSelect.append(option);});
        countSelect.value = state.eqBands; countSelect.disabled = unavailable; countLabel.append(countSelect);
        const close = element('button', 'xplayer-eq-close', '×'); close.type = 'button'; close.setAttribute('aria-label', '关闭均衡器');
        close.addEventListener('click', () => global.layer.close(state.dialog));
        header.append(back, presetLabel, countLabel, close);
        const chart = element('div', 'xplayer-eq-chart'), scale = element('div', 'xplayer-eq-scale'); scale.setAttribute('aria-hidden', 'true');
        ['+12', '0', '−12'].forEach(value => scale.append(element('span', '', value)));
        const bands = element('div', 'xplayer-eq-bands'); chart.append(scale, bands);
        let bandInputs = [];
        const renderBands = () => {
            bands.replaceChildren(); bands.style.setProperty('--eq-band-count', state.eqBands);
            const values = equalizerValues(state, engine);
            bandInputs = engine.h[state.eqBands].map((frequency, index) => {
                const label = element('label', 'xplayer-eq-band');
                const track = element('span', 'xplayer-eq-track');
                const input = element('input'); input.type = 'range'; input.min = -12; input.max = 12; input.step = 0.5; input.value = values[index]; input.disabled = unavailable;
                input.dataset.frequency = frequency; input.setAttribute('aria-label', frequency + ' Hz');
                const paint = () => {
                    input.style.setProperty('--eq-fill', ((Number(input.value) + 12) / 24 * 100) + '%');
                    input.setAttribute('aria-valuetext', input.value + ' dB'); input.title = frequency + ' Hz: ' + input.value + ' dB';
                };
                paint();
                input.addEventListener('input', () => {
                    if (unavailable) return;
                    state.customEq = bandInputs.map(item => Number(item.value));
                    state.customEqByBands[state.eqBands] = state.customEq.slice(); state.eq = 'custom'; presetSelect.value = 'custom';
                    paint(); apply();
                });
                track.append(input); label.append(track, element('span', 'xplayer-eq-frequency', frequency >= 1000 ? frequency / 1000 + 'k' : String(frequency)));
                bands.append(label); return input;
            });
        };
        presetSelect.addEventListener('change', () => {
            state.eq = presetSelect.value; state.customEq = null; renderBands(); apply();
        });
        countSelect.addEventListener('change', () => {
            const previous = state.eqBands, previousValues = equalizerValues(state, engine);
            state.eqBands = Number(countSelect.value);
            if (state.eq === 'custom') {
                state.customEq = (state.customEqByBands[state.eqBands] || resampleEqualizer(previousValues, engine.h[previous], engine.h[state.eqBands])).slice();
                state.customEqByBands[state.eqBands] = state.customEq.slice();
            }
            renderBands(); apply();
        });
        renderBands(); panel.append(header, chart, message);
        openDialog(state, '均衡器', panel, () => {
            state.eq = 'default'; state.customEq = null; state.customEqByBands = {}; presetSelect.value = 'default'; renderBands(); apply();
        }, true, {...audioPanelSize(), hideTitle: true, className: 'xplayer-equalizer-dialog'});
        apply();
    }
    function showShortcuts(player) {
        const panel=element('div','xplayer-shortcuts-panel');
        [['Space','播放/暂停'],['→','快进5秒'],['←','快退5秒'],['↑','音量增加10%'],['↓','音量降低10%'],['Esc','退出全屏'],['F','全屏/退出全屏'],['[','上一集（已播放过）'],[']','下一集'],['Enter','发弹幕'],['右滑','快进（手机）'],['左滑','快退（手机）'],['上滑','取消（快进快退中）']].forEach(([key,action])=>{
            const row=element('div','xplayer-shortcut-row');row.append(element('span','',key),element('span','',action));panel.append(row);
        });
        openDialog(stateFor(player),'快捷键说明',panel);
    }
    function siteMenuItem(button) {
        if (!button || typeof button.label !== 'string' || typeof button.url !== 'string') return null;
        const label = button.label.trim(), value = button.url.trim();
        if (!label || !value || value === '#' || value.startsWith('//') || /[\x00-\x20<>"'\\]/.test(value)) return null;
        try {
            const url = new URL(value, document.baseURI);
            if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
            // The core closes entries with a click handler; the anchor performs navigation.
            return {text: label, link: url.href, target: '_blank', click() {}};
        } catch (_) { return null; }
    }
    global.XplayerContextMenu = {
        create(button) {const items = [
            {text:'视频色彩调整',click:showColor},
            {text:'视频音效调节',click:showAudio},
            {text:'快捷键说明',click:showShortcuts},
            {text:'视频统计信息',click:player=>player.infoPanel.triggle()}
        ];const site = siteMenuItem(button);if (site) items.push(site);return items;},
        attach: stateFor,
        showColor, showAudio, showEqualizer, showShortcuts,
        setNormalization,
        getNormalization: player => states.get(player)?.normalization || 'off',
        getState: player=>states.get(player)
    };
})(window);
