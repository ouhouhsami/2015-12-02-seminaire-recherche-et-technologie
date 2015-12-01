const lfo = require('waves-lfo');

const socketSource = new lfo.sources.SocketServer({ port: 3030 });

const socketSink = new lfo.sinks.SocketServer({ port: 3031 });

const logger = new lfo.operators.Noop();
logger.process = function(time, frame) {
  console.log(time, frame);
}

socketSource.connect(logger);
socketSource.connect(socketSink);
