'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _wavesLoaders = require('waves-loaders');

var _wavesLoaders2 = _interopRequireDefault(_wavesLoaders);

var _wavesUi = require('waves-ui');

var _wavesUi2 = _interopRequireDefault(_wavesUi);

var _wavesAudio = require('waves-audio');

var _wavesAudio2 = _interopRequireDefault(_wavesAudio);

var loader = new _wavesLoaders2['default'].AudioBufferLoader();

loader.load('assets/drum-loop.wav').then(function (audioBuffer) {
  var $track = document.querySelector('#track');
  var visibleWidth = 1000,
      height = 120;
  var pixelsPerSecond = visibleWidth / audioBuffer.duration;

  // setup ui rendering components
  var timeline = new _wavesUi2['default'].core.Timeline(pixelsPerSecond, visibleWidth);
  var axis = new _wavesUi2['default'].helpers.TimeAxisLayer({ height: 12 });
  var waveform = new _wavesUi2['default'].helpers.WaveformLayer(audioBuffer, { height: height });
  var cursor = new _wavesUi2['default'].helpers.CursorLayer({ height: height });

  timeline.createTrack($track, height, 'main-track');
  timeline.addLayer(axis, 'main-track', 'axis', true);
  timeline.addLayer(waveform, 'main-track');
  timeline.addLayer(cursor, 'main-track');

  // setup audio rendering components
  var playerEngine = new _wavesAudio2['default'].PlayerEngine();
  playerEngine.buffer = audioBuffer;
  playerEngine.cyclic = true;
  playerEngine.connect(_wavesAudio2['default'].audioContext.destination);

  var playControl = new _wavesAudio2['default'].PlayControl(playerEngine);
  playControl.setLoopBoundaries(0, audioBuffer.duration);
  playControl.loop = true;
  playControl.start();

  // setup mouse interaction
  timeline.on('event', function (e) {
    if (e.type !== 'mousedown' && e.type !== 'mousemove') {
      return;
    }
    var position = timeline.timeToPixel.invert(e.x);
    playControl.seek(position);
  });

  (function updateCursor() {
    cursor.currentPosition = playControl.currentPosition;
    cursor.update();
    requestAnimationFrame(updateCursor);
  })();
})['catch'](function (err) {
  console.error(err.message);
});
//# sourceMappingURL=data:application/json;base64,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LEVBQUs7QUFBRSxTQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUFFLENBQUMsQ0FBQyIsImZpbGUiOiJlczYvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsb2FkZXJzIGZyb20gJ3dhdmVzLWxvYWRlcnMnO1xuaW1wb3J0IHVpIGZyb20gJ3dhdmVzLXVpJztcbmltcG9ydCBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG5jb25zdCBsb2FkZXIgPSBuZXcgbG9hZGVycy5BdWRpb0J1ZmZlckxvYWRlcigpO1xuXG5sb2FkZXIubG9hZCgnYXNzZXRzL2RydW0tbG9vcC53YXYnKS50aGVuKChhdWRpb0J1ZmZlcikgPT4ge1xuICBjb25zdCAkdHJhY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdHJhY2snKTtcbiAgY29uc3QgdmlzaWJsZVdpZHRoID0gMTAwMCwgaGVpZ2h0ICA9IDEyMDtcbiAgY29uc3QgcGl4ZWxzUGVyU2Vjb25kID0gdmlzaWJsZVdpZHRoIC8gYXVkaW9CdWZmZXIuZHVyYXRpb247XG5cbiAgLy8gc2V0dXAgdWkgcmVuZGVyaW5nIGNvbXBvbmVudHNcbiAgY29uc3QgdGltZWxpbmUgPSBuZXcgdWkuY29yZS5UaW1lbGluZShwaXhlbHNQZXJTZWNvbmQsIHZpc2libGVXaWR0aCk7XG4gIGNvbnN0IGF4aXMgICAgID0gbmV3IHVpLmhlbHBlcnMuVGltZUF4aXNMYXllcih7IGhlaWdodDogMTIgfSk7XG4gIGNvbnN0IHdhdmVmb3JtID0gbmV3IHVpLmhlbHBlcnMuV2F2ZWZvcm1MYXllcihhdWRpb0J1ZmZlciwgeyBoZWlnaHQgfSk7XG4gIGNvbnN0IGN1cnNvciAgID0gbmV3IHVpLmhlbHBlcnMuQ3Vyc29yTGF5ZXIoeyBoZWlnaHQgfSk7XG5cbiAgdGltZWxpbmUuY3JlYXRlVHJhY2soJHRyYWNrLCBoZWlnaHQsICdtYWluLXRyYWNrJyk7XG4gIHRpbWVsaW5lLmFkZExheWVyKGF4aXMsICdtYWluLXRyYWNrJywgJ2F4aXMnLCB0cnVlKTtcbiAgdGltZWxpbmUuYWRkTGF5ZXIod2F2ZWZvcm0sICdtYWluLXRyYWNrJyk7XG4gIHRpbWVsaW5lLmFkZExheWVyKGN1cnNvciwgJ21haW4tdHJhY2snKTtcblxuICAvLyBzZXR1cCBhdWRpbyByZW5kZXJpbmcgY29tcG9uZW50c1xuICBjb25zdCBwbGF5ZXJFbmdpbmUgPSBuZXcgYXVkaW8uUGxheWVyRW5naW5lKCk7XG4gIHBsYXllckVuZ2luZS5idWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgcGxheWVyRW5naW5lLmN5Y2xpYyA9IHRydWU7XG4gIHBsYXllckVuZ2luZS5jb25uZWN0KGF1ZGlvLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG5cbiAgY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wocGxheWVyRW5naW5lKTtcbiAgcGxheUNvbnRyb2wuc2V0TG9vcEJvdW5kYXJpZXMoMCwgYXVkaW9CdWZmZXIuZHVyYXRpb24pO1xuICBwbGF5Q29udHJvbC5sb29wID0gdHJ1ZTtcbiAgcGxheUNvbnRyb2wuc3RhcnQoKTtcblxuICAvLyBzZXR1cCBtb3VzZSBpbnRlcmFjdGlvblxuICB0aW1lbGluZS5vbignZXZlbnQnLCAoZSkgPT4ge1xuICAgIGlmIChlLnR5cGUgIT09ICdtb3VzZWRvd24nICYmIGUudHlwZSAhPT0gJ21vdXNlbW92ZScpIHsgcmV0dXJuOyB9XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aW1lbGluZS50aW1lVG9QaXhlbC5pbnZlcnQoZS54KTtcbiAgICBwbGF5Q29udHJvbC5zZWVrKHBvc2l0aW9uKTtcbiAgfSk7XG5cbiAgKGZ1bmN0aW9uIHVwZGF0ZUN1cnNvcigpIHtcbiAgICBjdXJzb3IuY3VycmVudFBvc2l0aW9uID0gcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICAgIGN1cnNvci51cGRhdGUoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlQ3Vyc29yKTtcbiAgfSgpKTtcbn0pLmNhdGNoKChlcnIpID0+IHsgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7IH0pO1xuIl19