'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _wavesLfo = require('waves-lfo');

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function init(e) {
  var ctx = new window.AudioContext();
  var streamSource = ctx.createMediaStreamSource(e);
  /**
   * Sonogram
   */
  (function () {

    var audioSource = new _wavesLfo2['default'].sources.AudioInNode({
      ctx: ctx,
      src: streamSource
    });

    var framer = new _wavesLfo2['default'].operators.Framer({
      frameSize: 256,
      hopSize: 256
    });

    var fft = new _wavesLfo2['default'].operators.Fft({
      fftSize: 256,
      windowName: 'hann'
    });

    var logger = new _wavesLfo2['default'].operators.Noop();
    logger.process = function (time, frame) {
      console.log(frame);
    };

    var sonogram = new _wavesLfo2['default'].sinks.Sonogram({
      canvas: document.querySelector('#sonogram'),
      scale: 100
    });

    audioSource.connect(framer);
    framer.connect(fft);
    fft.connect(sonogram);

    audioSource.start();
  })();

  /**
   * Spectrogram
   */
  (function () {

    var audioSource = new _wavesLfo2['default'].sources.AudioInNode({
      ctx: ctx,
      src: streamSource
    });

    var framer = new _wavesLfo2['default'].operators.Framer({
      frameSize: 256
    });

    var fft = new _wavesLfo2['default'].operators.Fft({
      fftSize: 256,
      windowName: 'hann'
    });

    var spectro = new _wavesLfo2['default'].sinks.Spectrogram({
      canvas: document.querySelector('#spectrogram'),
      scale: 10,
      color: '#16a085'
    });

    audioSource.connect(framer);
    framer.connect(fft);
    fft.connect(spectro);
    audioSource.start();
  })();

  /**
   * waveform
   */
  (function () {

    var audioSource = new _wavesLfo2['default'].sources.AudioInNode({
      ctx: ctx,
      src: streamSource
    });

    var minMax = new _wavesLfo2['default'].operators.MinMax();

    var waveform = new _wavesLfo2['default'].sinks.Waveform({
      canvas: document.querySelector('#waveform'),
      color: '#2980b9'
    });

    audioSource.connect(minMax);
    minMax.connect(waveform);
    audioSource.start();
  })();

  /**
   * synchronized draw
   */
  (function () {

    var audioIn = new _wavesLfo2['default'].sources.AudioInNode({
      ctx: ctx,
      src: streamSource
    });

    // waveform branch
    var minMax = new _wavesLfo2['default'].operators.MinMax();

    var waveform = new _wavesLfo2['default'].sinks.Waveform({
      canvas: document.querySelector('#synchronized-waveform'),
      color: '#f39c12'
    });

    audioIn.connect(minMax);
    minMax.connect(waveform);

    // rms branch
    var rms = new _wavesLfo2['default'].operators.Magnitude({
      normalize: true
    });

    var format = new _wavesLfo2['default'].operators.Operator({
      type: 'vector',
      frameSize: 2,
      onProcess: function onProcess(time, inFrame, outFrame) {
        outFrame[0] = inFrame[0];
        outFrame[1] = -1 * inFrame[0];
      }
    });

    var magnitude = new _wavesLfo2['default'].sinks.Waveform({
      canvas: document.querySelector('#synchronized-magnitude'),
      color: '#e67e22'
    });

    audioIn.connect(rms);
    rms.connect(format);
    format.connect(magnitude);

    new _wavesLfo2['default'].sinks.SynchronizedDraw(waveform, magnitude);

    audioIn.start();
  })();

  /**
   * bpf
   */
  // (function() {
  //   const frameTime = 0.1;
  //   const frameRate = 1 / frameTime;
  //   const frameSize = 3;

  //   const eventIn = new lfo.sources.EventIn({
  //     frameRate: frameRate,
  //     frameSize: frameSize,
  //     relative: true,
  //   });

  //   const bpf = new lfo.sinks.Bpf({
  //     radius: 2,
  //     min: 0,
  //     canvas: document.querySelector('#bpf'),
  //     duration: 2,
  //   });

  //   eventIn.connect(bpf);
  //   eventIn.start();

  //   (function loop() {
  //     const frame = [Math.random(), Math.random(), Math.random()];
  //     eventIn.process(null, frame);
  //     setTimeout(loop, frameTime * 1000);
  //   }());
  // }());

  // /**
  //  * trace
  //  */
  // (function() {
  //   const frameTime = 0.05;
  //   const frameRate = 1 / frameTime;
  //   const frameSize = 3;

  //   const eventIn = new lfo.sources.EventIn({
  //     frameRate: frameRate,
  //     frameSize: frameSize,
  //   });

  //   const trace = new lfo.sinks.Trace({
  //     colorScheme: 'opacity',
  //     canvas: document.querySelector('#trace'),
  //     duration: 6,
  //   });

  //   eventIn.connect(trace);
  //   eventIn.start();

  //   let mean = 0;
  //   let range = 0;
  //   let opacity = 1;
  //   const PI2 = 2 * Math.PI;

  //   var start = new Date().getTime();

  //   (function loop() {
  //     var t = (new Date().getTime() - start) / 1000;
  //     mean  = 0.2 * Math.sin(2 * PI2 * t);
  //     range = 0.3 * Math.sin(3 * PI2 * t) / 2 + 0.5;
  //     opacity = (0.7 * Math.sin(4 * PI2 * t) / 2 + 0.5) + 0.3;

  //     eventIn.process(null, [mean, range, opacity]);

  //     setTimeout(loop, frameTime * 1000);
  //   }());

  // }());
}

navigator.getUserMedia({ audio: true }, init, function (err) {
  console.error(err.stack);
});
//# sourceMappingURL=data:application/json;base64,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UyxHQUFHLEVBQUU7QUFDMUQsU0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUIsQ0FBQyxDQUFDIiwiZmlsZSI6ImVzNi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG5uYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG5cblxuZnVuY3Rpb24gaW5pdChlKSB7XG4gIGNvbnN0IGN0eCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG4gIGNvbnN0IHN0cmVhbVNvdXJjZSA9IGN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShlKTtcbiAgLyoqXG4gICAqIFNvbm9ncmFtXG4gICAqL1xuICAoZnVuY3Rpb24gKCkge1xuXG4gICAgY29uc3QgYXVkaW9Tb3VyY2UgPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGZyYW1lciA9IG5ldyBsZm8ub3BlcmF0b3JzLkZyYW1lcih7XG4gICAgICBmcmFtZVNpemU6IDI1NixcbiAgICAgIGhvcFNpemU6IDI1NixcbiAgICB9KTtcblxuICAgIGNvbnN0IGZmdCA9IG5ldyBsZm8ub3BlcmF0b3JzLkZmdCh7XG4gICAgICBmZnRTaXplOiAyNTYsXG4gICAgICB3aW5kb3dOYW1lOiAnaGFubicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsb2dnZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Ob29wKCk7XG4gICAgbG9nZ2VyLnByb2Nlc3MgPSBmdW5jdGlvbih0aW1lLCBmcmFtZSkgeyBjb25zb2xlLmxvZyhmcmFtZSk7IH1cblxuICAgIGNvbnN0IHNvbm9ncmFtID0gbmV3IGxmby5zaW5rcy5Tb25vZ3JhbSh7XG4gICAgICBjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb25vZ3JhbScpLFxuICAgICAgc2NhbGU6IDEwMCxcbiAgICB9KTtcblxuICAgIGF1ZGlvU291cmNlLmNvbm5lY3QoZnJhbWVyKTtcbiAgICBmcmFtZXIuY29ubmVjdChmZnQpO1xuICAgIGZmdC5jb25uZWN0KHNvbm9ncmFtKTtcblxuICAgIGF1ZGlvU291cmNlLnN0YXJ0KCk7XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIFNwZWN0cm9ncmFtXG4gICAqL1xuICAoZnVuY3Rpb24oKSB7XG5cbiAgICBjb25zdCBhdWRpb1NvdXJjZSA9IG5ldyBsZm8uc291cmNlcy5BdWRpb0luTm9kZSh7XG4gICAgICBjdHg6IGN0eCxcbiAgICAgIHNyYzogc3RyZWFtU291cmNlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZnJhbWVyID0gbmV3IGxmby5vcGVyYXRvcnMuRnJhbWVyKHtcbiAgICAgIGZyYW1lU2l6ZTogMjU2LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZmZ0ID0gbmV3IGxmby5vcGVyYXRvcnMuRmZ0KHtcbiAgICAgIGZmdFNpemU6IDI1NixcbiAgICAgIHdpbmRvd05hbWU6ICdoYW5uJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHNwZWN0cm8gPSBuZXcgbGZvLnNpbmtzLlNwZWN0cm9ncmFtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NwZWN0cm9ncmFtJyksXG4gICAgICBzY2FsZTogMTAsXG4gICAgICBjb2xvcjogJyMxNmEwODUnLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Tb3VyY2UuY29ubmVjdChmcmFtZXIpO1xuICAgIGZyYW1lci5jb25uZWN0KGZmdCk7XG4gICAgZmZ0LmNvbm5lY3Qoc3BlY3Rybyk7XG4gICAgYXVkaW9Tb3VyY2Uuc3RhcnQoKTtcblxuICB9KCkpO1xuXG4gIC8qKlxuICAgKiB3YXZlZm9ybVxuICAgKi9cbiAgKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgYXVkaW9Tb3VyY2UgPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IG1pbk1heCA9IG5ldyBsZm8ub3BlcmF0b3JzLk1pbk1heCgpO1xuXG4gICAgY29uc3Qgd2F2ZWZvcm0gPSBuZXcgbGZvLnNpbmtzLldhdmVmb3JtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dhdmVmb3JtJyksXG4gICAgICBjb2xvcjogJyMyOTgwYjknLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Tb3VyY2UuY29ubmVjdChtaW5NYXgpO1xuICAgIG1pbk1heC5jb25uZWN0KHdhdmVmb3JtKTtcbiAgICBhdWRpb1NvdXJjZS5zdGFydCgpO1xuXG4gIH0oKSk7XG5cblxuICAvKipcbiAgICogc3luY2hyb25pemVkIGRyYXdcbiAgICovXG4gIChmdW5jdGlvbigpIHtcblxuICAgIGNvbnN0IGF1ZGlvSW4gPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIC8vIHdhdmVmb3JtIGJyYW5jaFxuICAgIGNvbnN0IG1pbk1heCA9IG5ldyBsZm8ub3BlcmF0b3JzLk1pbk1heCgpO1xuXG4gICAgY29uc3Qgd2F2ZWZvcm0gPSBuZXcgbGZvLnNpbmtzLldhdmVmb3JtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N5bmNocm9uaXplZC13YXZlZm9ybScpLFxuICAgICAgY29sb3I6ICcjZjM5YzEyJyxcbiAgICB9KTtcblxuICAgIGF1ZGlvSW4uY29ubmVjdChtaW5NYXgpO1xuICAgIG1pbk1heC5jb25uZWN0KHdhdmVmb3JtKTtcblxuICAgIC8vIHJtcyBicmFuY2hcbiAgICBjb25zdCBybXMgPSBuZXcgbGZvLm9wZXJhdG9ycy5NYWduaXR1ZGUoe1xuICAgICAgbm9ybWFsaXplOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZm9ybWF0ID0gbmV3IGxmby5vcGVyYXRvcnMuT3BlcmF0b3Ioe1xuICAgICAgdHlwZTogJ3ZlY3RvcicsXG4gICAgICBmcmFtZVNpemU6IDIsXG4gICAgICBvblByb2Nlc3M6IGZ1bmN0aW9uKHRpbWUsIGluRnJhbWUsIG91dEZyYW1lKSB7XG4gICAgICAgIG91dEZyYW1lWzBdID0gaW5GcmFtZVswXTtcbiAgICAgICAgb3V0RnJhbWVbMV0gPSAtMSAqIGluRnJhbWVbMF07XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWFnbml0dWRlID0gbmV3IGxmby5zaW5rcy5XYXZlZm9ybSh7XG4gICAgICBjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzeW5jaHJvbml6ZWQtbWFnbml0dWRlJyksXG4gICAgICBjb2xvcjogJyNlNjdlMjInLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Jbi5jb25uZWN0KHJtcyk7XG4gICAgcm1zLmNvbm5lY3QoZm9ybWF0KTtcbiAgICBmb3JtYXQuY29ubmVjdChtYWduaXR1ZGUpO1xuXG4gICAgbmV3IGxmby5zaW5rcy5TeW5jaHJvbml6ZWREcmF3KHdhdmVmb3JtLCBtYWduaXR1ZGUpO1xuXG4gICAgYXVkaW9Jbi5zdGFydCgpO1xuXG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIGJwZlxuICAgKi9cbiAgLy8gKGZ1bmN0aW9uKCkge1xuICAvLyAgIGNvbnN0IGZyYW1lVGltZSA9IDAuMTtcbiAgLy8gICBjb25zdCBmcmFtZVJhdGUgPSAxIC8gZnJhbWVUaW1lO1xuICAvLyAgIGNvbnN0IGZyYW1lU2l6ZSA9IDM7XG5cbiAgLy8gICBjb25zdCBldmVudEluID0gbmV3IGxmby5zb3VyY2VzLkV2ZW50SW4oe1xuICAvLyAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gIC8vICAgICBmcmFtZVNpemU6IGZyYW1lU2l6ZSxcbiAgLy8gICAgIHJlbGF0aXZlOiB0cnVlLFxuICAvLyAgIH0pO1xuXG4gIC8vICAgY29uc3QgYnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuICAvLyAgICAgcmFkaXVzOiAyLFxuICAvLyAgICAgbWluOiAwLFxuICAvLyAgICAgY2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnBmJyksXG4gIC8vICAgICBkdXJhdGlvbjogMixcbiAgLy8gICB9KTtcblxuICAvLyAgIGV2ZW50SW4uY29ubmVjdChicGYpO1xuICAvLyAgIGV2ZW50SW4uc3RhcnQoKTtcblxuICAvLyAgIChmdW5jdGlvbiBsb29wKCkge1xuICAvLyAgICAgY29uc3QgZnJhbWUgPSBbTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKV07XG4gIC8vICAgICBldmVudEluLnByb2Nlc3MobnVsbCwgZnJhbWUpO1xuICAvLyAgICAgc2V0VGltZW91dChsb29wLCBmcmFtZVRpbWUgKiAxMDAwKTtcbiAgLy8gICB9KCkpO1xuICAvLyB9KCkpO1xuXG4gIC8vIC8qKlxuICAvLyAgKiB0cmFjZVxuICAvLyAgKi9cbiAgLy8gKGZ1bmN0aW9uKCkge1xuICAvLyAgIGNvbnN0IGZyYW1lVGltZSA9IDAuMDU7XG4gIC8vICAgY29uc3QgZnJhbWVSYXRlID0gMSAvIGZyYW1lVGltZTtcbiAgLy8gICBjb25zdCBmcmFtZVNpemUgPSAzO1xuXG4gIC8vICAgY29uc3QgZXZlbnRJbiA9IG5ldyBsZm8uc291cmNlcy5FdmVudEluKHtcbiAgLy8gICAgIGZyYW1lUmF0ZTogZnJhbWVSYXRlLFxuICAvLyAgICAgZnJhbWVTaXplOiBmcmFtZVNpemUsXG4gIC8vICAgfSk7XG5cbiAgLy8gICBjb25zdCB0cmFjZSA9IG5ldyBsZm8uc2lua3MuVHJhY2Uoe1xuICAvLyAgICAgY29sb3JTY2hlbWU6ICdvcGFjaXR5JyxcbiAgLy8gICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RyYWNlJyksXG4gIC8vICAgICBkdXJhdGlvbjogNixcbiAgLy8gICB9KTtcblxuICAvLyAgIGV2ZW50SW4uY29ubmVjdCh0cmFjZSk7XG4gIC8vICAgZXZlbnRJbi5zdGFydCgpO1xuXG4gIC8vICAgbGV0IG1lYW4gPSAwO1xuICAvLyAgIGxldCByYW5nZSA9IDA7XG4gIC8vICAgbGV0IG9wYWNpdHkgPSAxO1xuICAvLyAgIGNvbnN0IFBJMiA9IDIgKiBNYXRoLlBJO1xuXG4gIC8vICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgLy8gICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgLy8gICAgIHZhciB0ID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQpIC8gMTAwMDtcbiAgLy8gICAgIG1lYW4gID0gMC4yICogTWF0aC5zaW4oMiAqIFBJMiAqIHQpO1xuICAvLyAgICAgcmFuZ2UgPSAwLjMgKiBNYXRoLnNpbigzICogUEkyICogdCkgLyAyICsgMC41O1xuICAvLyAgICAgb3BhY2l0eSA9ICgwLjcgKiBNYXRoLnNpbig0ICogUEkyICogdCkgLyAyICsgMC41KSArIDAuMztcblxuICAvLyAgICAgZXZlbnRJbi5wcm9jZXNzKG51bGwsIFttZWFuLCByYW5nZSwgb3BhY2l0eV0pO1xuXG4gIC8vICAgICBzZXRUaW1lb3V0KGxvb3AsIGZyYW1lVGltZSAqIDEwMDApO1xuICAvLyAgIH0oKSk7XG5cbiAgLy8gfSgpKTtcbn1cblxubmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0sIGluaXQsIGZ1bmN0aW9uKGVycikge1xuICBjb25zb2xlLmVycm9yKGVyci5zdGFjayk7XG59KTtcbiJdfQ==