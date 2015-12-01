import lfo from 'waves-lfo';
import ui from 'waves-ui';
import loaders from 'waves-loaders';

const ctx = new AudioContext();
const loader = new loaders.AudioBufferLoader();
loader.load('./assets/drum-loop.wav').then(run);

function run(buffer) {
  // GLOBALS
  const waveformData = [];
  const markerData = [];
  const duration = buffer.duration;

  const source = new lfo.sources.AudioInBuffer({
    ctx: ctx,
    src: buffer,
    timeType: 'relative',
  });

  const framer = new lfo.operators.Framer({
    frameSize: 512,
  });

  const minMax = new lfo.operators.MinMax();

  const waveform = new lfo.sinks.Waveform({
    duration: duration,
    canvas: document.querySelector('#canvas-1'),
    color: 'steelblue',
  });

  source.connect(framer);
  framer.connect(minMax);
  minMax.connect(waveform);

  // moving average 1
  const longMovingAverage = new lfo.operators.MovingAverage({ order: 30 });
  // moving average 2
  const shortMovingAverage = new lfo.operators.MovingAverage({ order: 10 });

  // difference
  let counter = 0;
  let stack = [];
  const diff = new lfo.operators.Noop();

  diff.process = function(time, frame, metaData) {
    const frameSize = this.outFrame.length;
    stack[counter] = frame;

    if (counter === 1) {
      for (let i = 0; i < frameSize; i++) {
        this.outFrame[i] = stack[1][i] - stack[0][i];
      }

      this.time = time;

      // reset
      stack.length = 0;
      this.output();
    }

    counter = (counter + 1) % 2;
  }

  const maxOptions = {
    frameSize: 1,
    type: 'vector',
    onProcess: function(time, frame, outFrame) {
      let max = -Infinity;
      let value;

      for (let i = 0, l = frame.length; i < l; i++) {
        value = frame[i];
        if (value > max) { max = value; }
      }

      outFrame[0] = max;
    }
  };

  const maxMA1 = new lfo.operators.Operator(maxOptions);
  const bpfMA1 = new lfo.sinks.Bpf({
    canvas: document.querySelector('#canvas-3'),
    duration: duration,
  });

  const maxMA2 = new lfo.operators.Operator(maxOptions);
  const bpfMA2 = new lfo.sinks.Bpf({
    canvas: document.querySelector('#canvas-4'),
    duration: duration,
  });


  // get max value from each frames
  const max = new lfo.operators.Operator(maxOptions);

  const bpf = new lfo.sinks.Bpf({
    canvas: document.querySelector('#canvas-2'),
    duration: duration,
  });

  const $onset = document.querySelector('#onset');
  const $timestamps = document.querySelector('#timestamps');
  const threshold = 0.04;
  let active = false;

  // log all new onsets
  const logger = new lfo.operators.Noop();
  logger.process = function(time, frame) {
    if (frame[0] > threshold) {
      if (!active) {
        active = true;
        $onset.classList.add('active');
        $timestamps.innerHTML = '<p>' + time + '</p>' + $timestamps.innerHTML;
        // update markers
        markerData.push({ time });
      }
    } else {
      active = false;
      $onset.classList.remove('active');
    }
  }

  source.connect(longMovingAverage);
  source.connect(shortMovingAverage);

  longMovingAverage.connect(diff);
  shortMovingAverage.connect(diff);

  longMovingAverage.connect(maxMA1);
  maxMA1.connect(bpfMA1);

  shortMovingAverage.connect(maxMA2);
  maxMA2.connect(bpfMA2);

  diff.connect(max);
  max.connect(bpf);
  max.connect(logger);

  // UI PART
  const displayedDuration = duration;
  const width = 800;
  const pixelsPerSecond = width / displayedDuration;

  const timeline = new ui.core.Timeline(pixelsPerSecond, width);
  timeline.createTrack(document.querySelector('#axis'), 16, 'axis');
  timeline.createTrack(document.querySelector('#track'), 200, 'main');

  const axis = new ui.helpers.TimeAxisLayer();
  timeline.addLayer(axis, 'axis', 'default', true);

  const waveformLayer = new ui.core.Layer('entity', waveformData, {
    height: 200,
    sampleRate: ctx.sampleRate,
    yDomain: [-1, 1],
  });

  waveformLayer.setTimeContext(new ui.core.LayerTimeContext(timeline.timeContext));
  waveformLayer.configureShape(ui.shapes.Waveform, {
    y: (d) => { return d; }
  }, {
    color: 'steelblue',
  });

  const markerLayer = new ui.helpers.MarkerLayer(markerData, {
    height: 200,
    displayHandlers: false,
  }, {
    color: () => { return 'red'; },
    x: (d) => { return d.time; },
  });

  timeline.addLayer(waveformLayer, 'main');
  timeline.addLayer(markerLayer, 'main');

  timeline.state = new ui.states.CenteredZoomState(timeline);

  timeline.tracks.render();

  // lfo to append values to the data of the waveform
  const appender = new lfo.operators.Noop();
  appender.process = function(time, frame) {
    Array.prototype.push.apply(waveformData, Array.from(frame.values()));
  }

  source.connect(appender);

  let rAFId;
  // update waveformLayer
  function loop() {
    const bufferDuration = waveformData.length / ctx.sampleRate;

    if (bufferDuration > displayedDuration) {
      const decayTime = bufferDuration - displayedDuration;

      timeline.offset = -decayTime;
      waveformLayer.duration = bufferDuration;
      markerLayer.duration = bufferDuration;
    }

    timeline.tracks.render();
    timeline.tracks.update();

    rAFId = requestAnimationFrame(loop);
  };

  function reset() {
    timeline.offset = 0;
    timeline.zoom = 1;
    waveformLayer.duration = displayedDuration;
    markerLayer.duration = displayedDuration;
    waveformData.length = 0;
    markerData.length = 0;
    $timestamps.innerHTML = '';
  }

  // controls
  const $start = document.querySelector('#start');
  $start.addEventListener('click', function(e) {
    // reset timeline
    reset();
    loop();

    source.start();
  });

  const $stop = document.querySelector('#stop');
  $stop.addEventListener('click', function(e) {
    source.stop();
    cancelAnimationFrame(rAFId);
  });
}










