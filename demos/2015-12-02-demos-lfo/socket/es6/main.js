import lfo from 'waves-lfo';
import motionInput from 'motion-input';


const $canvas = document.querySelector('#canvas');

// switch app
if (document.body.classList.contains('source')) {
  runSource();
} else if (document.body.classList.contains('sink')) {
  runSink();
}

// mobile side
function runSource() {
  motionInput
    .init(['orientation'])
    .then((modules) => {
      const orientation = modules[0];
      const width = document.body.getBoundingClientRect().width;

      if (!orientation.isValid) {
        throw new Error('orientation not working');
      }

      const eventIn = new lfo.sources.EventIn({
        frameSize: 3,
      });

      const breakpoint = new lfo.sinks.Bpf({
        canvas: $canvas,
        min: -360,
        max: 360,
        duration: 10,
        width: width,
        height: 300,
        colors: ['orange', 'steelblue', 'lightgreen'],
      });

      const socketSink = new lfo.sinks.SocketClient({
        port: 3030,
        onopen: onopen,
      });

      eventIn.connect(breakpoint);
      eventIn.connect(socketSink);

      function onopen() {
        eventIn.start();

        motionInput.addListener('orientation', (val) => {
          eventIn.process(null, val);
        });
      }

    }).catch((err) => {
      console.error(err.stack);
    });
}

// desktop side
function runSink() {
  const socketSource = new lfo.sources.SocketClient({
    port: 3031,
    address: '127.0.0.1',
    frameSize: 3,
  });

  const breakpoint = new lfo.sinks.Bpf({
    canvas: $canvas,
    min: -360,
    max: 360,
    duration: 10,
    width: 800,
    height: 300,
    colors: ['orange', 'steelblue', 'lightgreen'],
  });

  socketSource.connect(breakpoint);
}

