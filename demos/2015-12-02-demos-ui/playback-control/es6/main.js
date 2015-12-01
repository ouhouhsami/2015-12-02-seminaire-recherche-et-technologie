import loaders from 'waves-loaders';
import ui from 'waves-ui';
import audio from 'waves-audio';
const loader = new loaders.AudioBufferLoader();

loader.load('assets/drum-loop.wav').then((audioBuffer) => {
  const $track = document.querySelector('#track');
  const visibleWidth = 1000, height  = 120;
  const pixelsPerSecond = visibleWidth / audioBuffer.duration;

  // setup ui rendering components
  const timeline = new ui.core.Timeline(pixelsPerSecond, visibleWidth);
  const axis     = new ui.helpers.TimeAxisLayer({ height: 12 });
  const waveform = new ui.helpers.WaveformLayer(audioBuffer, { height });
  const cursor   = new ui.helpers.CursorLayer({ height });

  timeline.createTrack($track, height, 'main-track');
  timeline.addLayer(axis, 'main-track', 'axis', true);
  timeline.addLayer(waveform, 'main-track');
  timeline.addLayer(cursor, 'main-track');

  // setup audio rendering components
  const playerEngine = new audio.PlayerEngine();
  playerEngine.buffer = audioBuffer;
  playerEngine.cyclic = true;
  playerEngine.connect(audio.audioContext.destination);

  const playControl = new audio.PlayControl(playerEngine);
  playControl.setLoopBoundaries(0, audioBuffer.duration);
  playControl.loop = true;
  playControl.start();

  // setup mouse interaction
  timeline.on('event', (e) => {
    if (e.type !== 'mousedown' && e.type !== 'mousemove') { return; }
    const position = timeline.timeToPixel.invert(e.x);
    playControl.seek(position);
  });

  (function updateCursor() {
    cursor.currentPosition = playControl.currentPosition;
    cursor.update();
    requestAnimationFrame(updateCursor);
  }());
}).catch((err) => { console.error(err.message); });
