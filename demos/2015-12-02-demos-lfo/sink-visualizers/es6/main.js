import lfo from 'waves-lfo';

navigator.getUserMedia = (navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);


function init(e) {
  const ctx = new window.AudioContext();
  const streamSource = ctx.createMediaStreamSource(e);
  /**
   * Sonogram
   */
  (function () {

    const audioSource = new lfo.sources.AudioInNode({
      ctx: ctx,
      src: streamSource,
    });

    const framer = new lfo.operators.Framer({
      frameSize: 256,
      hopSize: 256,
    });

    const fft = new lfo.operators.Fft({
      fftSize: 256,
      windowName: 'hann',
    });

    const logger = new lfo.operators.Noop();
    logger.process = function(time, frame) { console.log(frame); }

    const sonogram = new lfo.sinks.Sonogram({
      canvas: document.querySelector('#sonogram'),
      scale: 100,
    });

    audioSource.connect(framer);
    framer.connect(fft);
    fft.connect(sonogram);

    audioSource.start();
  }());

  /**
   * Spectrogram
   */
  (function() {

    const audioSource = new lfo.sources.AudioInNode({
      ctx: ctx,
      src: streamSource,
    });

    const framer = new lfo.operators.Framer({
      frameSize: 256,
    });

    const fft = new lfo.operators.Fft({
      fftSize: 256,
      windowName: 'hann',
    });

    const spectro = new lfo.sinks.Spectrogram({
      canvas: document.querySelector('#spectrogram'),
      scale: 10,
      color: '#16a085',
    });

    audioSource.connect(framer);
    framer.connect(fft);
    fft.connect(spectro);
    audioSource.start();

  }());

  /**
   * waveform
   */
  (function() {

    const audioSource = new lfo.sources.AudioInNode({
      ctx: ctx,
      src: streamSource,
    });

    const minMax = new lfo.operators.MinMax();

    const waveform = new lfo.sinks.Waveform({
      canvas: document.querySelector('#waveform'),
      color: '#2980b9',
    });

    audioSource.connect(minMax);
    minMax.connect(waveform);
    audioSource.start();

  }());


  /**
   * synchronized draw
   */
  (function() {

    const audioIn = new lfo.sources.AudioInNode({
      ctx: ctx,
      src: streamSource,
    });

    // waveform branch
    const minMax = new lfo.operators.MinMax();

    const waveform = new lfo.sinks.Waveform({
      canvas: document.querySelector('#synchronized-waveform'),
      color: '#f39c12',
    });

    audioIn.connect(minMax);
    minMax.connect(waveform);

    // rms branch
    const rms = new lfo.operators.Magnitude({
      normalize: true,
    });

    const format = new lfo.operators.Operator({
      type: 'vector',
      frameSize: 2,
      onProcess: function(time, inFrame, outFrame) {
        outFrame[0] = inFrame[0];
        outFrame[1] = -1 * inFrame[0];
      },
    });

    const magnitude = new lfo.sinks.Waveform({
      canvas: document.querySelector('#synchronized-magnitude'),
      color: '#e67e22',
    });

    audioIn.connect(rms);
    rms.connect(format);
    format.connect(magnitude);

    new lfo.sinks.SynchronizedDraw(waveform, magnitude);

    audioIn.start();

  }());

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

navigator.getUserMedia({ audio: true }, init, function(err) {
  console.error(err.stack);
});
