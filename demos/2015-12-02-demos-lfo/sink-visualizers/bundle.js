(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"babel-runtime/helpers/interop-require-default":13,"waves-lfo":120}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":15}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":16}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":17}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":18}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":19}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":20}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":21}],9:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],10:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":5}],11:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    _again = false;
    if (object === null) object = Function.prototype;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        desc = parent = undefined;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":6}],12:[function(require,module,exports){
"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Object$setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of")["default"];

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = _Object$create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/create":4,"babel-runtime/core-js/object/set-prototype-of":7}],13:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}],14:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj["default"] = obj;
    return newObj;
  }
};

exports.__esModule = true;
},{}],15:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/$.core').Array.from;
},{"../../modules/$.core":27,"../../modules/es6.array.from":73,"../../modules/es6.string.iterator":80}],16:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$.core').Object.assign;
},{"../../modules/$.core":27,"../../modules/es6.object.assign":75}],17:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":49}],18:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":49}],19:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.get-own-property-descriptor');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":49,"../../modules/es6.object.get-own-property-descriptor":76}],20:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$.core').Object.setPrototypeOf;
},{"../../modules/$.core":27,"../../modules/es6.object.set-prototype-of":77}],21:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":27,"../modules/es6.object.to-string":78,"../modules/es6.promise":79,"../modules/es6.string.iterator":80,"../modules/web.dom.iterable":81}],22:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],23:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],24:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":42}],25:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":26,"./$.wks":71}],26:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],27:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],28:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":22}],29:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],30:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":33}],31:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":35,"./$.is-object":42}],32:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":27,"./$.ctx":28,"./$.global":35}],33:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],34:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./$.an-object":24,"./$.ctx":28,"./$.is-array-iter":41,"./$.iter-call":43,"./$.to-length":68,"./core.get-iterator-method":72}],35:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],36:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],37:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":49,"./$.descriptors":30,"./$.property-desc":54}],38:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":35}],39:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],40:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":26}],41:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":48,"./$.wks":71}],42:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],43:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./$.an-object":24}],44:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , descriptor     = require('./$.property-desc')
  , setToStringTag = require('./$.set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./$":49,"./$.hide":37,"./$.property-desc":54,"./$.set-to-string-tag":60,"./$.wks":71}],45:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./$.library')
  , $export        = require('./$.export')
  , redefine       = require('./$.redefine')
  , hide           = require('./$.hide')
  , has            = require('./$.has')
  , Iterators      = require('./$.iterators')
  , $iterCreate    = require('./$.iter-create')
  , setToStringTag = require('./$.set-to-string-tag')
  , getProto       = require('./$').getProto
  , ITERATOR       = require('./$.wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , methods, key;
  // Fix native
  if($native){
    var IteratorPrototype = getProto($default.call(new Base));
    // Set @@toStringTag to native iterators
    setToStringTag(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    // fix Array#{values, @@iterator}.name in V8 / FF
    if(DEF_VALUES && $native.name !== VALUES){
      VALUES_BUG = true;
      $default = function values(){ return $native.call(this); };
    }
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES  ? $default : getMethod(VALUES),
      keys:    IS_SET      ? $default : getMethod(KEYS),
      entries: !DEF_VALUES ? $default : getMethod('entries')
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./$":49,"./$.export":32,"./$.has":36,"./$.hide":37,"./$.iter-create":44,"./$.iterators":48,"./$.library":50,"./$.redefine":56,"./$.set-to-string-tag":60,"./$.wks":71}],46:[function(require,module,exports){
var ITERATOR     = require('./$.wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":71}],47:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],48:[function(require,module,exports){
module.exports = {};
},{}],49:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],50:[function(require,module,exports){
module.exports = true;
},{}],51:[function(require,module,exports){
var global    = require('./$.global')
  , macrotask = require('./$.task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./$.cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, domain, fn;
  if(isNode && (parent = process.domain)){
    process.domain = null;
    parent.exit();
  }
  while(head){
    domain = head.domain;
    fn     = head.fn;
    if(domain)domain.enter();
    fn(); // <- currently we use it only for Promise - try / catch not required
    if(domain)domain.exit();
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
};

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = 1
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = -toggle;
  };
// environments with maybe non-completely correct, but existent Promise
} else if(Promise && Promise.resolve){
  notify = function(){
    Promise.resolve().then(flush);
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function asap(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./$.cof":26,"./$.global":35,"./$.task":65}],52:[function(require,module,exports){
// 19.1.2.1 Object.assign(target, source, ...)
var $        = require('./$')
  , toObject = require('./$.to-object')
  , IObject  = require('./$.iobject');

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = require('./$.fails')(function(){
  var a = Object.assign
    , A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , $$    = arguments
    , $$len = $$.length
    , index = 1
    , getKeys    = $.getKeys
    , getSymbols = $.getSymbols
    , isEnum     = $.isEnum;
  while($$len > index){
    var S      = IObject($$[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  }
  return T;
} : Object.assign;
},{"./$":49,"./$.fails":33,"./$.iobject":40,"./$.to-object":69}],53:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./$.export')
  , core    = require('./$.core')
  , fails   = require('./$.fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./$.core":27,"./$.export":32,"./$.fails":33}],54:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],55:[function(require,module,exports){
var redefine = require('./$.redefine');
module.exports = function(target, src){
  for(var key in src)redefine(target, key, src[key]);
  return target;
};
},{"./$.redefine":56}],56:[function(require,module,exports){
module.exports = require('./$.hide');
},{"./$.hide":37}],57:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],58:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./$":49,"./$.an-object":24,"./$.ctx":28,"./$.is-object":42}],59:[function(require,module,exports){
'use strict';
var core        = require('./$.core')
  , $           = require('./$')
  , DESCRIPTORS = require('./$.descriptors')
  , SPECIES     = require('./$.wks')('species');

module.exports = function(KEY){
  var C = core[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":49,"./$.core":27,"./$.descriptors":30,"./$.wks":71}],60:[function(require,module,exports){
var def = require('./$').setDesc
  , has = require('./$.has')
  , TAG = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./$":49,"./$.has":36,"./$.wks":71}],61:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":35}],62:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./$.an-object')
  , aFunction = require('./$.a-function')
  , SPECIES   = require('./$.wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./$.a-function":22,"./$.an-object":24,"./$.wks":71}],63:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],64:[function(require,module,exports){
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":29,"./$.to-integer":66}],65:[function(require,module,exports){
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listner = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./$.cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listner, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$.cof":26,"./$.ctx":28,"./$.dom-create":31,"./$.global":35,"./$.html":38,"./$.invoke":39}],66:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],67:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":29,"./$.iobject":40}],68:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":66}],69:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":29}],70:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],71:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":35,"./$.shared":61,"./$.uid":70}],72:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":25,"./$.core":27,"./$.iterators":48,"./$.wks":71}],73:[function(require,module,exports){
'use strict';
var ctx         = require('./$.ctx')
  , $export     = require('./$.export')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , $$      = arguments
      , $$len   = $$.length
      , mapfn   = $$len > 1 ? $$[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

},{"./$.ctx":28,"./$.export":32,"./$.is-array-iter":41,"./$.iter-call":43,"./$.iter-detect":46,"./$.to-length":68,"./$.to-object":69,"./core.get-iterator-method":72}],74:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./$.add-to-unscopables')
  , step             = require('./$.iter-step')
  , Iterators        = require('./$.iterators')
  , toIObject        = require('./$.to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./$.add-to-unscopables":23,"./$.iter-define":45,"./$.iter-step":47,"./$.iterators":48,"./$.to-iobject":67}],75:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./$.export');

$export($export.S + $export.F, 'Object', {assign: require('./$.object-assign')});
},{"./$.export":32,"./$.object-assign":52}],76:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./$.to-iobject');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./$.object-sap":53,"./$.to-iobject":67}],77:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./$.export');
$export($export.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.export":32,"./$.set-proto":58}],78:[function(require,module,exports){

},{}],79:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $export    = require('./$.export')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same-value')
  , SPECIES    = require('./$.wks')('species')
  , speciesConstructor = require('./$.species-constructor')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE]
  , Wrapper;

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var USE_NATIVE = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.descriptors')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
var sameConstructor = function(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
};
var getConstructor = function(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var PromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve),
  this.reject  = aFunction(reject)
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , result, then;
      try {
        if(handler){
          if(!ok)record.h = true;
          result = handler === true ? value : handler(value);
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      var promise = record.p
        , handler, console;
      if(isUnhandled(promise)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      } record.a = undefined;
    }, 1);
  });
};
var isUnhandled = function(promise){
  var record = promise._d
    , chain  = record.a || record.c
    , i      = 0
    , reaction;
  if(record.h)return false;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var $reject = function(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
};
var $resolve = function(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(record.p === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = this._d = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.redefine-all')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction = new PromiseCapability(speciesConstructor(this, P))
        , promise  = reaction.promise
        , record   = this._d;
      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      record.c.push(reaction);
      if(record.a)record.a.push(reaction);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
require('./$.set-to-string-tag')(P, PROMISE);
require('./$.set-species')(PROMISE);
Wrapper = require('./$.core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = new PromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof P && sameConstructor(x.constructor, this))return x;
    var capability = new PromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject
      , values     = [];
    var abrupt = perform(function(){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        var alreadyCalled = false;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled = true;
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./$":49,"./$.a-function":22,"./$.an-object":24,"./$.classof":25,"./$.core":27,"./$.ctx":28,"./$.descriptors":30,"./$.export":32,"./$.for-of":34,"./$.global":35,"./$.is-object":42,"./$.iter-detect":46,"./$.library":50,"./$.microtask":51,"./$.redefine-all":55,"./$.same-value":57,"./$.set-proto":58,"./$.set-species":59,"./$.set-to-string-tag":60,"./$.species-constructor":62,"./$.strict-new":63,"./$.wks":71}],80:[function(require,module,exports){
'use strict';
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":45,"./$.string-at":64}],81:[function(require,module,exports){
require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
},{"./$.iterators":48,"./es6.array.iterator":74}],82:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"base64-js":83,"ieee754":84,"is-array":85}],83:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],84:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],85:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],86:[function(require,module,exports){
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var id = 0;

var BaseLfo = (function () {
  function BaseLfo() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var defaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, BaseLfo);

    this.cid = id++;
    this.params = {};

    this.streamParams = {
      frameSize: 1,
      frameRate: 0,
      sourceSampleRate: 0
    };

    this.params = _Object$assign({}, defaults, options);
    this.children = [];
  }

  // WebAudioAPI `connect` like method

  _createClass(BaseLfo, [{
    key: 'connect',
    value: function connect(child) {
      if (this.streamParams === null) {
        throw new Error('cannot connect to a dead lfo node');
      }

      this.children.push(child);
      child.parent = this;
    }

    // initialize the current node stream and propagate to it's children
  }, {
    key: 'initialize',
    value: function initialize() {
      if (this.parent) {
        // defaults to inherit parent's stream parameters
        this.streamParams = _Object$assign(this.streamParams, this.parent.streamParams);
      }

      // entry point for stream params configuration in derived class
      this.configureStream();
      // create the `outFrame` arrayBuffer
      this.setupStream();

      // propagate initialization in lfo chain
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].initialize();
      }
    }

    // sources only
    // start() {
    //   this.initialize();
    //   this.reset();
    // }

    /**
     * override inherited streamParams, only if specified in `params`
     */
  }, {
    key: 'configureStream',
    value: function configureStream() {
      if (this.params.frameSize) {
        this.streamParams.frameSize = this.params.frameSize;
      }

      if (this.params.frameRate) {
        this.streamParams.frameRate = this.params.frameRate;
      }

      if (this.params.sourceSampleRate) {
        this.streamParams.sourceSampleRate = this.params.sourceSampleRate;
      }
    }

    /**
     * create the outputFrame according to the `streamParams`
     * @NOTE remove commented code ?
     */
  }, {
    key: 'setupStream',
    value: function setupStream() /* opts = {} */{
      // if (opts.frameRate) { this.streamParams.frameRate = opts.frameRate; }
      // if (opts.frameSize) { this.streamParams.frameSize = opts.frameSize; }
      // if (opts.sourceSampleRate) { this.streamParams.sourceSampleRate = opts.sourceSampleRate; }
      this.outFrame = new Float32Array(this.streamParams.frameSize);
    }

    // reset `outFrame` and call reset on children
  }, {
    key: 'reset',
    value: function reset() {
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].reset();
      }

      // sinks have no `outFrame`
      if (!this.outFrame) {
        return;
      }

      // this.outFrame.fill(0); // probably better but doesn't work yet
      for (var i = 0, l = this.outFrame.length; i < l; i++) {
        this.outFrame[i] = 0;
      }
    }

    // fill the on-going buffer with 0 (is done)
    // output it, then call reset on all the children (sure ?)
    // @NOTE: `reset` is called in `sources.start`,
    //  if is called here, it will be called more than once in a child node
    //  is this a problem ?
  }, {
    key: 'finalize',
    value: function finalize() {
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].finalize();
      }
    }

    // forward the current state (time, frame, metaData) to all the children
  }, {
    key: 'output',
    value: function output() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? this.time : arguments[0];
      var outFrame = arguments.length <= 1 || arguments[1] === undefined ? this.outFrame : arguments[1];
      var metaData = arguments.length <= 2 || arguments[2] === undefined ? this.metaData : arguments[2];

      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].process(time, outFrame, metaData);
      }
    }

    // main function to override, defaults to noop
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      this.time = time;
      this.outFrame = frame;
      this.metaData = metaData;

      this.output();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      // call `destroy` in all it's children
      var index = this.children.length;

      while (index--) {
        this.children[index].destroy();
      }

      // delete itself from the parent node
      if (this.parent) {
        var _index = this.parent.children.indexOf(this);
        this.parent.children.splice(_index, 1);
      }

      // cannot use a dead object as parent
      this.streamParams = null;

      // clean it's own references / disconnect audio nodes if needed
    }
  }]);

  return BaseLfo;
})();

exports['default'] = BaseLfo;
module.exports = exports['default'];

},{"babel-runtime/core-js/object/assign":3,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10}],87:[function(require,module,exports){
/**
 * @fileoverview WAVE LFO module: biquad filter.
 * @author Jean-Philippe.Lambert@ircam.fr, Norbert.Schnell@ircam.fr, victor.saiz@ircam.fr
 * @version 0.1.0
 *
 * @brief  Biquad filter and coefficients calculator
 *
 * Based on the "Cookbook formulae for audio EQ biquad filter
 * coefficients" by Robert Bristow-Johnson
 *
 */

/* y(n) = b0 x(n) + b1 x(n-1) + b2 x(n-2)  */
/*                - a1 x(n-1) - a2 x(n-2)  */

/* f0 is normalised by the nyquist frequency */
/* q must be > 0. */
/* gain must be > 0. and is linear */

/* when there is no gain parameter, one can simply multiply the b
 * coefficients by a (linear) gain */

/* a0 is always 1. as each coefficient is normalised by a0, including a0 */

/* a1 is a[0] and a2 is a[1] */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var BaseLfo = require('../core/base-lfo');

var sin = Math.sin;
var cos = Math.cos;
var M_PI = Math.PI;
var sqrt = Math.sqrt;

// coefs calculations
// ------------------

/* LPF: H(s) = 1 / (s^2 + s/Q + 1) */
function lowpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = (1.0 - c) * 0.5 * a0_inv;
  coefs.b1 = (1.0 - c) * a0_inv;
  coefs.b2 = coefs.b0;
}

/* HPF: H(s) = s^2 / (s^2 + s/Q + 1) */
function highpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = (1.0 + c) * 0.5 * a0_inv;
  coefs.b1 = (-1.0 - c) * a0_inv;
  coefs.b2 = coefs.b0;
}

/* BPF: H(s) = s / (s^2 + s/Q + 1)  (constant skirt gain, peak gain = Q) */
function bandpass_constant_skirt_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var s = sin(w0);
  var alpha = s / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = s * 0.5 * a0_inv;
  coefs.b1 = 0.0;
  coefs.b2 = -coefs.b0;
}

/* BPF: H(s) = (s/Q) / (s^2 + s/Q + 1)      (constant 0 dB peak gain) */
function bandpass_constant_peak_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = alpha * a0_inv;
  coefs.b1 = 0.0;
  coefs.b2 = -coefs.b0;
}

/* notch: H(s) = (s^2 + 1) / (s^2 + s/Q + 1) */
function notch_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = a0_inv;
  coefs.b1 = coefs.a1;
  coefs.b2 = coefs.b0;
}

/* APF: H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1) */
function allpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = coefs.a2;
  coefs.b1 = coefs.a1;
  coefs.b2 = 1.0;
}

/* peakingEQ: H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function peaking_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);
  var g_inv = 1.0 / g;

  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha * g_inv);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha * g_inv) * a0_inv;

  coefs.b0 = (1.0 + alpha * g) * a0_inv;
  coefs.b1 = coefs.a1;
  coefs.b2 = (1.0 - alpha * g) * a0_inv;
}

/* lowShelf: H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function lowshelf_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);

  var w0 = M_PI * f0;
  var alpha_2_sqrtg = sin(w0) * sqrt(g) / q;
  var c = cos(w0);

  var a0_inv = 1.0 / (g + 1.0 + (g - 1.0) * c + alpha_2_sqrtg);

  coefs.a1 = -2.0 * (g - 1.0 + (g + 1.0) * c) * a0_inv;
  coefs.a2 = (g + 1.0 + (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;

  coefs.b0 = g * (g + 1.0 - (g - 1.0) * c + alpha_2_sqrtg) * a0_inv;
  coefs.b1 = 2.0 * g * (g - 1.0 - (g + 1.0) * c) * a0_inv;
  coefs.b2 = g * (g + 1.0 - (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;
}

/* highShelf: H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function highshelf_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);

  var w0 = M_PI * f0;
  var alpha_2_sqrtg = sin(w0) * sqrt(g) / q;
  var c = cos(w0);

  var a0_inv = 1.0 / (g + 1.0 - (g - 1.0) * c + alpha_2_sqrtg);

  coefs.a1 = 2.0 * (g - 1.0 - (g + 1.0) * c) * a0_inv;
  coefs.a2 = (g + 1.0 - (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;

  coefs.b0 = g * (g + 1.0 + (g - 1.0) * c + alpha_2_sqrtg) * a0_inv;
  coefs.b1 = -2.0 * g * (g - 1.0 + (g + 1.0) * c) * a0_inv;
  coefs.b2 = g * (g + 1.0 + (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;
}

/* helper */
function calculateCoefs(type, f0, q, gain, coefs) {

  switch (type) {
    case 'lowpass':
      lowpass_coefs(f0, q, coefs);
      break;

    case 'highpass':
      highpass_coefs(f0, q, coefs);
      break;

    case 'bandpass_constant_skirt':
      bandpass_constant_skirt_coefs(f0, q, coefs);
      break;

    case 'bandpass_constant_peak':
      bandpass_constant_peak_coefs(f0, q, coefs);
      break;

    case 'notch':
      notch_coefs(f0, q, coefs);
      break;

    case 'allpass':
      allpass_coefs(f0, q, coefs);
      break;

    case 'peaking':
      peaking_coefs(f0, q, gain, coefs);
      break;

    case 'lowshelf':
      lowshelf_coefs(f0, q, gain, coefs);
      break;

    case 'highshelf':
      highshelf_coefs(f0, q, gain, coefs);
      break;
  }

  // apply gain
  switch (type) {
    case 'lowpass':
    case 'highpass':
    case 'bandpass_constant_skirt':
    case 'bandpass_constant_peak':
    case 'notch':
    case 'allpass':
      if (gain != 1.0) {
        coefs.b0 *= gain;
        coefs.b1 *= gain;
        coefs.b2 *= gain;
      }
      break;
    /* gain is already integrated for the following */
    case 'peaking':
    case 'lowshelf':
    case 'highshelf':
      break;
  }
}

/* direct form I */
/* a0 = 1, a1 = a[0], a2 = a[1] */
/* 4 states (in that order): x(n-1), x(n-2), y(n-1), y(n-2)  */
function biquadArrayDf1(coefs, state, inFrame, outFrame, size) {
  for (var i = 0; i < size; i++) {
    var y = coefs.b0 * inFrame[i] + coefs.b1 * state.xn_1[i] + coefs.b2 * state.xn_2[i] - coefs.a1 * state.yn_1[i] - coefs.a2 * state.yn_2[i];

    outFrame[i] = y;

    // update states
    state.xn_2[i] = state.xn_1[i];
    state.xn_1[i] = inFrame[i];

    state.yn_2[i] = state.yn_1[i];
    state.yn_1[i] = y;
  }
}

/* transposed direct form II */
/* a0 = 1, a1 = a[0], a2 = a[1] */
/* 2 states */
function biquadArrayDf2(coefs, state, inFrame, outFrame, size) {
  for (var i = 0; i < size; i++) {
    outFrame[i] = coefs.b0 * inFrame[i] + state.xn_1[i];

    // update states
    state.xn_1[i] = coefs.b1 * inFrame[i] - coefs.a1[i] * outFrame[i] + state.xn_2[i];
    state.xn_2[i] = coefs.b2 * inFrame[i] - coefs.a2[i] * outFrame[i];
  }
}

var Biquad = (function (_BaseLfo) {
  _inherits(Biquad, _BaseLfo);

  function Biquad(options) {
    _classCallCheck(this, Biquad);

    var defaults = {
      filterType: 'lowpass',
      f0: 1.0,
      gain: 1.0,
      q: 1.0
    };

    _get(Object.getPrototypeOf(Biquad.prototype), 'constructor', this).call(this, options, defaults);
    // this.type = 'biquad';

    // from here on options is this.params

    // to implement
    // if(opts.damp) …
    // if(opts.decay) …
    // if(opts.over) …

    // var frameRate = this.streamParams.frameRate;
    // // if no frameRate or framerate is 0 we shall halt!
    // if (!frameRate || frameRate <= 0) {
    //   throw new Error('This Operator requires a frameRate higher than 0.');
    // }

    // var normF0 = this.params.f0 / frameRate,
    //     gain = this.params.gain,
    //     q;

    // if (this.params.q)  { q = this.params.q; }
    // if (this.params.bw) { q = this.params.f0 / this.params.bw; }

    // this.coefs = {
    //   b0: 0,
    //   b1: 0,
    //   b2: 0,
    //   a1: 0,
    //   a2: 0
    // };

    // var frameSize = this.streamParams.frameSize;
    // this.state = {
    //   xn_1: new Float32Array(frameSize),
    //   xn_2: new Float32Array(frameSize),
    //   yn_1: new Float32Array(frameSize),
    //   yn_2: new Float32Array(frameSize)
    // };

    // calculateCoefs(this.params.filterType, normF0, q, gain, this.coefs);
    // this.setupStream();
  }

  _createClass(Biquad, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Biquad.prototype), 'initialize', this).call(this);

      var frameRate = this.streamParams.frameRate;
      // if no frameRate or framerate is 0 we shall halt!
      if (!frameRate || frameRate <= 0) {
        throw new Error('This Operator requires a frameRate higher than 0.');
      }

      var normF0 = this.params.f0 / frameRate,
          gain = this.params.gain,
          q;

      if (this.params.q) {
        q = this.params.q;
      }
      if (this.params.bw) {
        q = this.params.f0 / this.params.bw;
      }

      this.coefs = {
        b0: 0,
        b1: 0,
        b2: 0,
        a1: 0,
        a2: 0
      };

      var frameSize = this.streamParams.frameSize;
      this.state = {
        xn_1: new Float32Array(frameSize),
        xn_2: new Float32Array(frameSize),
        yn_1: new Float32Array(frameSize),
        yn_2: new Float32Array(frameSize)
      };

      calculateCoefs(this.params.filterType, normF0, q, gain, this.coefs);
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      biquadArrayDf1(this.coefs, this.state, frame, this.outFrame, frame.length);
      // console.log(this.outFrame);
      this.output(time, this.outFrame, metaData);
    }
  }]);

  return Biquad;
})(BaseLfo);

exports['default'] = Biquad;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12}],88:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var _jsfft = require('jsfft');

var _jsfft2 = _interopRequireDefault(_jsfft);

var _jsfftLibComplex_array = require('jsfft/lib/complex_array');

var _jsfftLibComplex_array2 = _interopRequireDefault(_jsfftLibComplex_array);

var _utilsFftWindows = require('../utils/fft-windows');

// const PI   = Math.PI;
// const cos  = Math.cos;
// const sin  = Math.sin;

var _utilsFftWindows2 = _interopRequireDefault(_utilsFftWindows);

var sqrt = Math.sqrt;

var isPowerOfTwo = function isPowerOfTwo(number) {
  while (number % 2 === 0 && number > 1) {
    number = number / 2;
  }

  return number === 1;
};

var Fft = (function (_BaseLfo) {
  _inherits(Fft, _BaseLfo);

  function Fft(options) {
    _classCallCheck(this, Fft);

    var defaults = {
      fftSize: 1024,
      windowName: 'hann',
      outType: 'magnitude'
    };

    _get(Object.getPrototypeOf(Fft.prototype), 'constructor', this).call(this, options, defaults);

    if (!isPowerOfTwo(this.params.fftSize)) {
      throw new Error('fftSize must be a power of two');
    }
  }

  _createClass(Fft, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Fft.prototype), 'initialize', this).call(this);

      var inFrameSize = this.parent.streamParams.frameSize;
      var fftSize = this.params.fftSize;
      // keep of the window size to be applied
      this.appliedWindowSize = inFrameSize < fftSize ? inFrameSize : fftSize;
      // references to populate in window functions
      this.normalizeCoefs = { linear: 0, power: 0 };
      this.window = new Float32Array(this.appliedWindowSize);
      // init the complex array to reuse for the FFT
      this.complexFrame = new _jsfftLibComplex_array2['default'].ComplexArray(fftSize);

      (0, _utilsFftWindows2['default'])(this.params.windowName, this.window, // buffer to populate with the window
      this.appliedWindowSize, // buffer.length
      this.normalizeCoefs // an object to populate with the normalization coefs
      );

      // ArrayBuffers to reuse in process
      this.windowedFrame = new Float32Array(fftSize);
    }
  }, {
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = this.params.fftSize / 2 + 1;
    }

    /**
     * the first call of this method can be quite long (~4ms),
     * the subsequent ones are faster (~0.5ms) for fftSize = 1024
     */
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var _this = this;

      var inFrameSize = this.parent.streamParams.frameSize;
      var outFrameSize = this.streamParams.frameSize;
      var sampleRate = this.streamParams.sourceSampleRate;
      var fftSize = this.params.fftSize;
      // clip frame if bigger than fftSize
      frame = inFrameSize > fftSize ? frame.subarray(0, fftSize) : frame;

      // apply window on frame
      // => `this.window` and `frame` have the same length
      // => if `this.windowedFrame` is bigger, it's filled with zero
      // and window don't apply there
      for (var i = 0; i < this.appliedWindowSize; i++) {
        this.windowedFrame[i] = frame[i] * this.window[i];
      }

      // FFT
      // this.complexFrame = new complexArray.ComplexArray(fftSize);
      // reuse the same complexFrame
      this.complexFrame.map(function (value, i) {
        value.real = _this.windowedFrame[i];
        value.imag = 0;
      });

      var complexSpectrum = this.complexFrame.FFT();
      var scale = 1 / fftSize;
      // DC index
      var realDc = complexSpectrum.real[0];
      var imagDc = complexSpectrum.imag[0];
      this.outFrame[0] = (realDc * realDc + imagDc * imagDc) * scale;
      // Nquyst index
      var realNy = complexSpectrum.real[fftSize / 2];
      var imagNy = complexSpectrum.imag[fftSize / 2];
      this.outFrame[fftSize / 2] = (realNy * realNy + imagNy * imagNy) * scale;

      // power spectrum
      for (var i = 1, j = fftSize - 1; i < fftSize / 2; i++, j--) {
        var real = complexSpectrum.real[i] + complexSpectrum.real[j];
        var imag = complexSpectrum.imag[i] - complexSpectrum.imag[j];

        this.outFrame[i] = (real * real + imag * imag) * scale;
      }

      // magnitude spectrum
      // @NOTE maybe check how to remove this loop properly
      if (this.params.outType === 'magnitude') {
        for (var i = 0; i < outFrameSize; i++) {
          this.outFrame[i] = sqrt(this.outFrame[i]);
        }
      }

      // @NOTE what shall we do with `this.normalizeCoefs` ?
      // time is centered on the frame ?
      this.time = time + inFrameSize / sampleRate / 2;

      this.output();
    }
  }]);

  return Fft;
})(_coreBaseLfo2['default']);

exports['default'] = Fft;
module.exports = exports['default'];

},{"../core/base-lfo":86,"../utils/fft-windows":115,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13,"jsfft":118,"jsfft/lib/complex_array":117}],89:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var Framer = (function (_BaseLfo) {
  _inherits(Framer, _BaseLfo);

  function Framer(options) {
    _classCallCheck(this, Framer);

    var defaults = {
      frameSize: 512,
      centeredTimeTag: false
    };

    _get(Object.getPrototypeOf(Framer.prototype), 'constructor', this).call(this, options, defaults);

    this.frameIndex = 0;
  }

  _createClass(Framer, [{
    key: 'configureStream',
    value: function configureStream() {
      // defaults to `hopSize` === `frameSize`
      if (!this.params.hopSize) {
        this.params.hopSize = this.params.frameSize;
      }

      this.streamParams.frameSize = this.params.frameSize;
      this.streamParams.frameRate = this.streamParams.sourceSampleRate / this.params.hopSize;
    }

    // @NOTE must be tested
  }, {
    key: 'reset',
    value: function reset() {
      this.frameIndex = 0;
      _get(Object.getPrototypeOf(Framer.prototype), 'reset', this).call(this);
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      // @NOTE what about time ?
      // fill the ongoing buffer with 0
      for (var i = this.frameIndex, l = this.outFrame.length; i < l; i++) {
        this.outFrame[i] = 0;
      }
      // output it
      this.output();

      _get(Object.getPrototypeOf(Framer.prototype), 'finalize', this).call(this);
    }
  }, {
    key: 'process',
    value: function process(time, block, metaData) {
      var sampleRate = this.streamParams.sourceSampleRate;
      var samplePeriod = 1 / sampleRate;

      var frameIndex = this.frameIndex;
      var frameSize = this.streamParams.frameSize;
      var blockSize = block.length;
      var blockIndex = 0;
      var hopSize = this.params.hopSize;

      var outFrame = this.outFrame;

      while (blockIndex < blockSize) {
        var numSkip = 0;

        // skip block samples for negative frameIndex
        if (frameIndex < 0) {
          numSkip = -frameIndex;
        }

        if (numSkip < blockSize) {
          blockIndex += numSkip; // skip block segment
          // can copy all the rest of the incoming block
          var numCopy = blockSize - blockIndex;
          // connot copy more than what fits into the frame
          var maxCopy = frameSize - frameIndex;

          if (numCopy >= maxCopy) {
            numCopy = maxCopy;
          }

          // copy block segment into frame
          var copy = block.subarray(blockIndex, blockIndex + numCopy);
          // console.log(blockIndex, frameIndex, numCopy);
          outFrame.set(copy, frameIndex);

          // advance block and frame index
          blockIndex += numCopy;
          frameIndex += numCopy;

          // send frame when completed
          if (frameIndex === frameSize) {
            // define time tag for the outFrame according to configuration
            if (this.params.centeredTimeTag) {
              this.time = time + (blockIndex - frameSize / 2) * samplePeriod;
            } else {
              this.time = time + (blockIndex - frameSize) * samplePeriod;
            }

            // forward metaData ?
            this.metaData = metaData;

            // forward to next nodes
            this.output();

            // shift frame left
            if (hopSize < frameSize) {
              outFrame.set(outFrame.subarray(hopSize, frameSize), 0);
            }

            frameIndex -= hopSize; // hop forward
          }
        } else {
            // skip entire block
            var blockRest = blockSize - blockIndex;
            frameIndex += blockRest;
            blockIndex += blockRest;
          }
      }

      this.frameIndex = frameIndex;
    }
  }]);

  return Framer;
})(_coreBaseLfo2['default']);

exports['default'] = Framer;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],90:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var Magnitude = (function (_BaseLfo) {
  _inherits(Magnitude, _BaseLfo);

  function Magnitude(options) {
    _classCallCheck(this, Magnitude);

    var defaults = {
      normalize: false
    };

    _get(Object.getPrototypeOf(Magnitude.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(Magnitude, [{
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = 1;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var frameSize = frame.length;
      var sum = 0;

      for (var i = 0; i < frameSize; i++) {
        sum += frame[i] * frame[i];
      }

      if (this.params.normalize) {
        // sum is a mean here (for rms)
        sum /= frameSize;
      }

      this.time = time;
      this.outFrame[0] = Math.sqrt(sum);
      this.metaData = metaData;

      this.output();
    }
  }]);

  return Magnitude;
})(_coreBaseLfo2['default']);

exports['default'] = Magnitude;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],91:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

/**
 * Returns the min and max values from each frame
 */

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var MinMax = (function (_BaseLfo) {
  _inherits(MinMax, _BaseLfo);

  function MinMax(options) {
    _classCallCheck(this, MinMax);

    var defaults = {};
    _get(Object.getPrototypeOf(MinMax.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(MinMax, [{
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = 2;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var min = +Infinity;
      var max = -Infinity;

      for (var i = 0, l = frame.length; i < l; i++) {
        var value = frame[i];
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }

      this.time = time;
      this.outFrame[0] = min;
      this.outFrame[1] = max;
      this.metaData = metaData;

      this.output();
    }
  }]);

  return MinMax;
})(_coreBaseLfo2['default']);

exports['default'] = MinMax;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],92:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

// NOTES:
// - add 'symetrical' option (how to deal with values between frames ?) ?
// - can we improve algorithm implementation ?

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var MovingAverage = (function (_BaseLfo) {
  _inherits(MovingAverage, _BaseLfo);

  function MovingAverage(options) {
    _classCallCheck(this, MovingAverage);

    var defaults = {
      order: 100
    };

    _get(Object.getPrototypeOf(MovingAverage.prototype), 'constructor', this).call(this, options, defaults);

    this.sum = 0;
    this.counter = 0;
    this.queue = new Float32Array(this.params.order);
  }

  // streamParams should not change from parent

  _createClass(MovingAverage, [{
    key: 'reset',
    value: function reset() {
      _get(Object.getPrototypeOf(MovingAverage.prototype), 'reset', this).call(this);

      for (var i = 0, l = this.queue.length; i < l; i++) {
        this.queue[i] = 0;
      }

      this.sum = 0;
      this.counter = 0;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var outFrame = this.outFrame;
      var frameSize = this.streamParams.frameSize;
      var order = this.params.order;
      var pushIndex = this.params.order - 1;
      var divisor = undefined;

      for (var i = 0; i < frameSize; i++) {
        var current = frame[i];

        // is this necessary, or is it overhead ?
        if (this.counter < order) {
          this.counter += 1;
          divisor = this.counter;
        } else {
          divisor = order;
        }

        this.sum -= this.queue[0];
        this.sum += current;
        outFrame[i] = this.sum / divisor;
        // outFrame[i] = this.sum / order;

        // maintain stack
        this.queue.set(this.queue.subarray(1), 0);
        this.queue[pushIndex] = current;
      }

      this.output(time, outFrame, metaData);
    }
  }]);

  return MovingAverage;
})(_coreBaseLfo2['default']);

exports['default'] = MovingAverage;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],93:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Array$from = require('babel-runtime/core-js/array/from')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var MovingMedian = (function (_BaseLfo) {
  _inherits(MovingMedian, _BaseLfo);

  function MovingMedian(options) {
    _classCallCheck(this, MovingMedian);

    var defaults = {
      order: 9
    };

    _get(Object.getPrototypeOf(MovingMedian.prototype), 'constructor', this).call(this, options, defaults);

    if (this.params.order % 2 === 0) {
      throw new Error('order must be an odd number');
    }

    this.queue = new Float32Array(this.params.order);
    this.sorter = [];
  }

  _createClass(MovingMedian, [{
    key: 'reset',
    value: function reset() {
      _get(Object.getPrototypeOf(MovingMedian.prototype), 'reset', this).call(this);

      for (var i = 0, l = this.queue.length; i < l; i++) {
        this.queue[i] = 0;
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var outFrame = this.outFrame;
      var frameSize = frame.length;
      var order = this.params.order;
      var pushIndex = this.params.order - 1;
      var medianIndex = Math.floor(order / 2);

      for (var i = 0; i < frameSize; i++) {
        var current = frame[i];
        // update queue
        this.queue.set(this.queue.subarray(1), 0);
        this.queue[pushIndex] = current;
        // get median
        this.sorter = _Array$from(this.queue.values());
        this.sorter.sort(function (a, b) {
          return a - b;
        });

        outFrame[i] = this.sorter[medianIndex];
      }

      this.output(time, outFrame, metaData);
    }
  }]);

  return MovingMedian;
})(_coreBaseLfo2['default']);

exports['default'] = MovingMedian;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/core-js/array/from":2,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],94:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

/**
 * a NoOp Lfo
 */

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var Noop = (function (_BaseLfo) {
  _inherits(Noop, _BaseLfo);

  function Noop(options) {
    _classCallCheck(this, Noop);

    _get(Object.getPrototypeOf(Noop.prototype), 'constructor', this).call(this, options, {});
  }

  _createClass(Noop, [{
    key: 'process',
    value: function process(time, frame, metaData) {
      this.outFrame.set(frame, 0);
      this.time = time;
      this.metaData = metaData;

      this.output();
    }
  }]);

  return Noop;
})(_coreBaseLfo2['default']);

exports['default'] = Noop;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],95:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

/**
 * apply a given function on each frame
 *
 * @SIGNATURE scalar callback
 * function(value, index, frame) {
 *   return doSomething(value)
 * }
 *
 * @SIGNATURE vector callback
 * function(time, inFrame, outFrame) {
 *   outFrame.set(inFrame, 0);
 *   return time + 1;
 * }
 *
 */

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var Operator = (function (_BaseLfo) {
  _inherits(Operator, _BaseLfo);

  function Operator(options) {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), 'constructor', this).call(this, options, {});

    this.params.type = this.params.type || 'scalar';

    if (this.params.onProcess) {
      this.callback = this.params.onProcess.bind(this);
    }
  }

  _createClass(Operator, [{
    key: 'configureStream',
    value: function configureStream() {
      if (this.params.type === 'vector' && this.params.frameSize) {
        this.streamParams.frameSize = this.params.frameSize;
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      // apply the callback to the frame
      if (this.params.type === 'vector') {
        var outTime = this.callback(time, frame, this.outFrame);

        if (outTime !== undefined) {
          time = outTime;
        }
      } else {
        for (var i = 0, l = frame.length; i < l; i++) {
          this.outFrame[i] = this.callback(frame[i], i);
        }
      }

      this.time = time;
      this.metaData = metaData;

      this.output();
    }
  }]);

  return Operator;
})(_coreBaseLfo2['default']);

exports['default'] = Operator;
;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],96:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var worker = '\nvar isInfiniteBuffer = false;\nvar stack = [];\nvar buffer;\nvar bufferLength;\nvar currentIndex;\n\nfunction init() {\n  buffer = new Float32Array(bufferLength);\n  stack.length = 0;\n  currentIndex = 0;\n}\n\nfunction append(block) {\n  var availableSpace = bufferLength - currentIndex;\n  var currentBlock;\n  // return if already full\n  if (availableSpace <= 0) { return; }\n\n  if (availableSpace < block.length) {\n    currentBlock = block.subarray(0, availableSpace);\n  } else {\n    currentBlock = block;\n  }\n\n  buffer.set(currentBlock, currentIndex);\n  currentIndex += currentBlock.length;\n\n  if (isInfiniteBuffer && currentIndex === buffer.length) {\n    stack.push(buffer);\n\n    currentBlock = block.subarray(availableSpace);\n    buffer = new Float32Array(buffer.length);\n    buffer.set(currentBlock, 0);\n    currentIndex = currentBlock.length;\n  }\n}\n\nself.addEventListener(\'message\', function(e) {\n  switch (e.data.command) {\n    case \'init\':\n      if (isFinite(e.data.duration)) {\n        bufferLength = e.data.sampleRate * e.data.duration;\n      } else {\n        isInfiniteBuffer = true;\n        bufferLength = e.data.sampleRate * 10;\n      }\n\n      init();\n      break;\n\n    case \'process\':\n      var block = new Float32Array(e.data.buffer);\n      append(block);\n\n      // if the buffer is full return it, only works with finite buffers\n      if (!isInfiniteBuffer && currentIndex === bufferLength) {\n        var buf = buffer.buffer.slice(0);\n        self.postMessage({ buffer: buf }, [buf]);\n        init();\n      }\n      break;\n\n    case \'finalize\':\n      if (!isInfiniteBuffer) {\n        // @TODO add option to not clip the returned buffer\n        // values in FLoat32Array are 4 bytes long (32 / 8)\n        var copy = buffer.buffer.slice(0, currentIndex * (32 / 8));\n        self.postMessage({ buffer: copy }, [copy]);\n      } else {\n        var copy = new Float32Array(stack.length * bufferLength + currentIndex);\n        stack.forEach(function(buffer, index) {\n          copy.set(buffer, bufferLength * index);\n        });\n\n        copy.set(buffer.subarray(0, currentIndex), stack.length * bufferLength);\n        self.postMessage({ buffer: copy.buffer }, [copy.buffer]);\n      }\n      init();\n      break;\n  }\n}, false)';

var audioContext = undefined;

/**
 * Record an audio stream
 */

var AudioRecorder = (function (_BaseLfo) {
  _inherits(AudioRecorder, _BaseLfo);

  function AudioRecorder(options) {
    _classCallCheck(this, AudioRecorder);

    var defaults = {
      duration: 10 };

    // seconds
    _get(Object.getPrototypeOf(AudioRecorder.prototype), 'constructor', this).call(this, options, defaults);
    this.metaData = {};

    // needed to retrive an AudioBuffer
    if (!this.params.ctx) {
      if (!audioContext) {
        audioContext = new window.AudioContext();
      }
      this.ctx = audioContext;
    } else {
      this.ctx = this.params.ctx;
    }

    var blob = new Blob([worker], { type: 'text/javascript' });
    this.worker = new Worker(window.URL.createObjectURL(blob));
  }

  _createClass(AudioRecorder, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(AudioRecorder.prototype), 'initialize', this).call(this);
      // propagate `streamParams` to the worker
      this.worker.postMessage({
        command: 'init',
        duration: this.params.duration,
        sampleRate: this.streamParams.sourceSampleRate
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this._isStarted = true;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.finalize();
      this._isStarted = false;
    }

    // called when `stop` is triggered on the source
  }, {
    key: 'finalize',
    value: function finalize() {
      if (!this._isStarted) {
        return;
      } // don't finalize if not started
      this.worker.postMessage({ command: 'finalize' });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      if (!this._isStarted) {
        return;
      }
      // `this.outFrame` must be recreated each time because
      // it is copied in the worker and lost for this context
      this.outFrame = new Float32Array(frame);

      var buffer = this.outFrame.buffer;
      this.worker.postMessage({ command: 'process', buffer: buffer }, [buffer]);
    }

    /**
     * retrieve the created audioBuffer
     * @return {Promise}
     */
  }, {
    key: 'retrieve',
    value: function retrieve() {
      var _this = this;

      return new _Promise(function (resolve, reject) {
        var callback = function callback(e) {
          // if called when buffer is full, stop the recorder too
          _this._isStarted = false;

          _this.worker.removeEventListener('message', callback, false);
          // create an audio buffer from the data
          var buffer = new Float32Array(e.data.buffer);
          var length = buffer.length;
          var sampleRate = _this.streamParams.sourceSampleRate;

          var audioBuffer = _this.ctx.createBuffer(1, length, sampleRate);
          var audioArrayBuffer = audioBuffer.getChannelData(0);
          audioArrayBuffer.set(buffer, 0);

          resolve(audioBuffer);
        };

        _this.worker.addEventListener('message', callback, false);
      });
    }
  }]);

  return AudioRecorder;
})(_coreBaseLfo2['default']);

exports['default'] = AudioRecorder;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/core-js/promise":8,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],97:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var BaseDraw = (function (_BaseLfo) {
  _inherits(BaseDraw, _BaseLfo);

  function BaseDraw() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var extendDefaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, BaseDraw);

    var defaults = _Object$assign({
      duration: 1,
      min: -1,
      max: 1,
      width: 300,
      height: 150, // default canvas size in DOM too
      isSynchronized: false // is set to true if used in a synchronizedSink
    }, extendDefaults);

    _get(Object.getPrototypeOf(BaseDraw.prototype), 'constructor', this).call(this, options, defaults);

    if (!this.params.canvas) {
      throw new Error('params.canvas is mandatory and must be canvas DOM element');
    }

    // prepare canvas
    this.canvas = this.params.canvas;
    this.ctx = this.canvas.getContext('2d');

    this.cachedCanvas = document.createElement('canvas');
    this.cachedCtx = this.cachedCanvas.getContext('2d');

    this.ctx.canvas.width = this.cachedCtx.canvas.width = this.params.width;
    this.ctx.canvas.height = this.cachedCtx.canvas.height = this.params.height;

    this.previousTime = 0;
    this.lastShiftError = 0;
    this.currentPartialShift = 0;

    // this._cache = [];
    // this._rafId;
    // this.draw = this.draw.bind(this);
  }

  // initialize() {
  //   super.initialize();
  //   // this._rafId = requestAnimationFrame(this.draw);
  // }

  // finalize() {
  //   super.finalize();
  //   // cancelAnimationFrame(this._rafId);
  // }

  // draw() {
  //   console.log('draw', this._cache.length);
  //   this._cache.forEach((infos) => {
  //     console.log(infos);
  //     this.scrollModeDraw(infos.time, infos.frame);
  //   });

  //   this._cache.length = 0;
  //   this._rafId = requestAnimationFrame(this.draw);
  // }

  _createClass(BaseDraw, [{
    key: 'reset',
    value: function reset() {
      _get(Object.getPrototypeOf(BaseDraw.prototype), 'reset', this).call(this);
      this.ctx.clearRect(0, 0, this.params.width, this.params.height);
      this.cachedCtx.clearRect(0, 0, this.params.width, this.params.height);
    }
  }, {
    key: 'setupStream',
    value: function setupStream() {
      _get(Object.getPrototypeOf(BaseDraw.prototype), 'setupStream', this).call(this);
      this.previousFrame = new Float32Array(this.streamParams.frameSize);
    }

    // http://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
    //        (b-a)(x - min)
    // f(x) = -------------- + a
    //          max - min
  }, {
    key: 'getYPosition',
    value: function getYPosition(value) {
      // a = height
      // b = 0
      var min = this.params.min;
      var max = this.params.max;
      var height = this.params.height;

      return (0 - height) * (value - min) / (max - min) + height;
    }

    // params modifiers
  }, {
    key: 'process',

    // main process method
    value: function process(time, frame, metaData) {
      _get(Object.getPrototypeOf(BaseDraw.prototype), 'process', this).call(this, time, frame, metaData);
    }

    // default draw mode
  }, {
    key: 'scrollModeDraw',
    value: function scrollModeDraw(time, frame) {
      var width = this.params.width;
      var height = this.params.height;
      var duration = this.params.duration;
      var ctx = this.ctx;

      var dt = time - this.previousTime;
      var fShift = dt / duration * width - this.lastShiftError;
      var iShift = Math.round(fShift);
      this.lastShiftError = iShift - fShift;

      var partialShift = iShift - this.currentPartialShift;
      this.shiftCanvas(partialShift);

      // shift all siblings if synchronized
      if (this.params.isSynchronized && this.synchronizer) {
        this.synchronizer.shiftSiblings(partialShift, this);
      }

      // translate to the current frame and draw a new polygon
      ctx.save();
      ctx.translate(width, 0);
      this.drawCurve(frame, this.previousFrame, iShift);
      ctx.restore();
      // update `currentPartialShift`
      this.currentPartialShift -= iShift;
      // save current state into buffer canvas
      this.cachedCtx.clearRect(0, 0, width, height);
      this.cachedCtx.drawImage(this.canvas, 0, 0, width, height);

      this.previousFrame.set(frame, 0);
      this.previousTime = time;
    }
  }, {
    key: 'shiftCanvas',
    value: function shiftCanvas(shift) {
      var width = this.params.width;
      var height = this.params.height;
      var ctx = this.ctx;

      this.currentPartialShift += shift;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      ctx.drawImage(this.cachedCanvas, this.currentPartialShift, 0, width - this.currentPartialShift, height, 0, 0, width - this.currentPartialShift, height);

      ctx.restore();
    }

    // Must implement the logic to draw the shape between
    // the previous and the current frame.
    // Assuming the context is centered on the current frame
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      console.error('must be implemented');
    }
  }, {
    key: 'duration',
    set: function set(duration) {
      this.params.duration = duration;
    }
  }, {
    key: 'min',
    set: function set(min) {
      this.params.min = min;
    }
  }, {
    key: 'max',
    set: function set(max) {
      this.params.max = max;
    }
  }]);

  return BaseDraw;
})(_coreBaseLfo2['default']);

exports['default'] = BaseDraw;

module.exports = BaseDraw;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/core-js/object/assign":3,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],98:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _utilsDrawUtils = require('../utils/draw-utils');

var Bpf = (function (_BaseDraw) {
  _inherits(Bpf, _BaseDraw);

  function Bpf(options) {
    _classCallCheck(this, Bpf);

    var defaults = {
      trigger: false,
      radius: 0,
      line: true
    };

    _get(Object.getPrototypeOf(Bpf.prototype), 'constructor', this).call(this, options, defaults);
    // for loop mode
    this.currentXPosition = 0;
  }

  _createClass(Bpf, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Bpf.prototype), 'initialize', this).call(this);

      // create an array of colors according to the `outFrame` size
      if (!this.params.colors) {
        this.params.colors = [];
        for (var i = 0, l = this.streamParams.frameSize; i < l; i++) {
          this.params.colors.push((0, _utilsDrawUtils.getRandomColor)());
        }
      }
    }

    // allow to witch easily between the 2 modes
  }, {
    key: 'setTrigger',
    value: function setTrigger(bool) {
      this.params.trigger = bool;
      // clear canvas and cache
      this.ctx.clearRect(0, 0, this.params.width, this.params.height);
      this.cachedCtx.clearRect(0, 0, this.params.width, this.params.height);
      // reset currentXPosition
      this.currentXPosition = 0;
      this.lastShiftError = 0;
    }
  }, {
    key: 'process',
    value: function process(time, frame) {
      // @TODO: compare dt - if dt < fps return; (?)
      if (this.params.trigger) {
        this.triggerModeDraw(time, frame);
      } else {
        this.scrollModeDraw(time, frame);
      }

      _get(Object.getPrototypeOf(Bpf.prototype), 'process', this).call(this, time, frame);
    }

    // add an alternative drawing mode
    // draw from left to right, go back to left when > width
  }, {
    key: 'triggerModeDraw',
    value: function triggerModeDraw(time, frame) {
      var width = this.params.width;
      var height = this.params.height;
      var duration = this.params.duration;
      var ctx = this.ctx;

      var dt = time - this.previousTime;
      var fShift = dt / duration * width - this.lastShiftError; // px
      var iShift = Math.round(fShift);
      this.lastShiftError = iShift - fShift;

      this.currentXPosition += iShift;

      // draw the right part
      ctx.save();
      ctx.translate(this.currentXPosition, 0);
      ctx.clearRect(-iShift, 0, iShift, height);
      this.drawCurve(frame, iShift);
      ctx.restore();

      // go back to the left of the canvas and redraw the same thing
      if (this.currentXPosition > width) {
        // go back to start
        this.currentXPosition -= width;

        ctx.save();
        ctx.translate(this.currentXPosition, 0);
        ctx.clearRect(-iShift, 0, iShift, height);
        this.drawCurve(frame, this.previousFrame, iShift);
        ctx.restore();
      }
    }

    // implements drawCurve
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      var colors = this.params.colors;
      var ctx = this.ctx;
      var radius = this.params.radius;
      // @TODO this can and should be abstracted
      for (var i = 0, l = frame.length; i < l; i++) {
        ctx.save();
        // color should bechosen according to index
        ctx.fillStyle = colors[i];
        ctx.strokeStyle = colors[i];

        var posY = this.getYPosition(frame[i]);
        // as an options ? radius ?
        if (radius > 0) {
          ctx.beginPath();
          ctx.arc(0, posY, radius, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.closePath();
        }

        if (prevFrame && this.params.line) {
          var lastPosY = this.getYPosition(prevFrame[i]);
          // draw line
          ctx.beginPath();
          ctx.moveTo(-iShift, lastPosY);
          ctx.lineTo(0, posY);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.restore();
      }
    }
  }]);

  return Bpf;
})(_baseDraw2['default']);

exports['default'] = Bpf;
module.exports = exports['default'];

},{"../utils/draw-utils":114,"./base-draw":97,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],99:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

/**
 *  accumulate intput and expose it - allow view (see waves-ui) to pull data for rendering
 *  brodge between `push` to `pull` paradigm
 */

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var Bridge = (function (_BaseLfo) {
  _inherits(Bridge, _BaseLfo);

  function Bridge(options, process) {
    _classCallCheck(this, Bridge);

    _get(Object.getPrototypeOf(Bridge.prototype), 'constructor', this).call(this, options, {});

    this.process = process.bind(this);
    this.data = this.outFrame = [];
  }

  _createClass(Bridge, [{
    key: 'setupStream',
    value: function setupStream() {
      _get(Object.getPrototypeOf(Bridge.prototype), 'setupStream', this).call(this);
      this.data.length = 0;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.data.length = 0;
    }
  }]);

  return Bridge;
})(_coreBaseLfo2['default']);

exports['default'] = Bridge;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],100:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var worker = '\nvar _separateArrays = false;\nvar _data = [];\nvar _separateArraysData = { time: [], data: [] };\n\nfunction init() {\n  _data.length = 0;\n  _separateArraysData.time.length = 0;\n  _separateArraysData.data.length = 0;\n}\n\nfunction process(time, data) {\n  if (_separateArrays) {\n    _separateArraysData.time.push(time);\n    _separateArraysData.data.push(data);\n  } else {\n    var datum = { time: time, data: data };\n    _data.push(datum);\n  }\n}\n\nself.addEventListener(\'message\', function(e) {\n  switch (e.data.command) {\n    case \'init\':\n      _separateArrays = e.data.separateArrays;\n      init();\n      break;\n    case \'process\':\n      var time = e.data.time;\n      var data = new Float32Array(e.data.buffer);\n      process(time, data);\n      break;\n    case \'finalize\':\n      var data = _separateArrays ? _separateArraysData : _data;\n      self.postMessage({ data: data });\n      init();\n      break;\n  }\n});\n';

var DataRecorder = (function (_BaseLfo) {
  _inherits(DataRecorder, _BaseLfo);

  function DataRecorder(options) {
    _classCallCheck(this, DataRecorder);

    var defaults = {
      // default format is [{time, data}, {time, data}]
      // if set to `true` format is { time: [...], data: [...] }
      separateArrays: false
    };

    _get(Object.getPrototypeOf(DataRecorder.prototype), 'constructor', this).call(this, options, defaults);
    this._isStarted = false;

    // init worker
    var blob = new Blob([worker], { type: 'text/javascript' });
    this.worker = new Worker(window.URL.createObjectURL(blob));
  }

  _createClass(DataRecorder, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(DataRecorder.prototype), 'initialize', this).call(this);

      this.worker.postMessage({
        command: 'init',
        separateArrays: this.params.separateArrays
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this._isStarted = true;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.finalize();
      this._isStarted = false;
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      if (!this._isStarted) {
        return;
      }
      this.worker.postMessage({ command: 'finalize' });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      if (!this._isStarted) {
        return;
      }

      this.outFrame = new Float32Array(frame);
      var buffer = this.outFrame.buffer;

      this.worker.postMessage({
        command: 'process',
        time: time,
        buffer: buffer
      }, [buffer]);
    }
  }, {
    key: 'retrieve',
    value: function retrieve() {
      var _this = this;

      return new _Promise(function (resolve, reject) {
        var callback = function callback(e) {
          _this._started = false;

          _this.worker.removeEventListener('message', callback, false);
          resolve(e.data.data);
        };

        _this.worker.addEventListener('message', callback, false);
      });
    }
  }]);

  return DataRecorder;
})(_coreBaseLfo2['default']);

exports['default'] = DataRecorder;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/core-js/promise":8,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],101:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var _utilsSocketUtils = require('../utils/socket-utils');

// send an Lfo stream from the browser over the network
// through a WebSocket - should be paired with a SocketSourceServer
// @NOTE: does it need to implement some ping process to maintain connection ?

var SocketClient = (function (_BaseLfo) {
  _inherits(SocketClient, _BaseLfo);

  function SocketClient(options) {
    _classCallCheck(this, SocketClient);

    var defaults = {
      port: 3030,
      address: window.location.hostname
    };

    _get(Object.getPrototypeOf(SocketClient.prototype), 'constructor', this).call(this, options, defaults);

    this.socket = null;
    this.initConnection();
  }

  _createClass(SocketClient, [{
    key: 'initConnection',
    value: function initConnection() {
      var _this = this;

      var socketAddr = 'ws://' + this.params.address + ':' + this.params.port;
      this.socket = new WebSocket(socketAddr);
      this.socket.binaryType = 'arraybuffer';

      // callback to start to when WebSocket is connected
      this.socket.onopen = function () {
        _this.params.onopen();
      };

      this.socket.onclose = function () {};

      this.socket.onmessage = function () {};

      this.socket.onerror = function (err) {
        console.error(err);
      };
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var buffer = (0, _utilsSocketUtils.encodeMessage)(time, frame, metaData);
      this.socket.send(buffer);
    }
  }]);

  return SocketClient;
})(_coreBaseLfo2['default']);

exports['default'] = SocketClient;
module.exports = exports['default'];

},{"../core/base-lfo":86,"../utils/socket-utils":116,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],102:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var _utilsSocketUtils = require('../utils/socket-utils');

var SocketServer = (function (_BaseLfo) {
  _inherits(SocketServer, _BaseLfo);

  function SocketServer(options) {
    _classCallCheck(this, SocketServer);

    var defaults = {
      port: 3031
    };

    _get(Object.getPrototypeOf(SocketServer.prototype), 'constructor', this).call(this, options, defaults);

    this.server = null;
    this.initServer();
  }

  _createClass(SocketServer, [{
    key: 'initServer',
    value: function initServer() {
      this.server = new ws.Server({ port: this.params.port });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var arrayBuffer = (0, _utilsSocketUtils.encodeMessage)(time, frame, metaData);
      var buffer = (0, _utilsSocketUtils.arrayBufferToBuffer)(arrayBuffer);

      this.server.clients.forEach(function (client) {
        client.send(buffer);
      });
    }
  }]);

  return SocketServer;
})(_coreBaseLfo2['default']);

exports['default'] = SocketServer;
module.exports = exports['default'];

},{"../core/base-lfo":86,"../utils/socket-utils":116,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13,"babel-runtime/helpers/interop-require-wildcard":14,"ws":119}],103:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _utilsDrawUtils = require('../utils/draw-utils');

var counter = 0;

var Sonogram = (function (_BaseDraw) {
  _inherits(Sonogram, _BaseDraw);

  function Sonogram(options) {
    _classCallCheck(this, Sonogram);

    var defaults = {
      scale: 1
    };

    _get(Object.getPrototypeOf(Sonogram.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(Sonogram, [{
    key: 'process',
    value: function process(time, frame, metaData) {
      this.scrollModeDraw(time, frame);
      _get(Object.getPrototypeOf(Sonogram.prototype), 'process', this).call(this, time, frame, metaData);
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, previousFrame, iShift) {
      var ctx = this.ctx;
      var height = this.params.height;
      var scale = this.params.scale;
      var binPerPixel = frame.length / this.params.height;

      for (var i = 0; i < height; i++) {
        // interpolate between prev and next bins
        // is not a very good strategy if more than two bins per pixels
        // some values won't be taken into account
        // this hack is not reliable
        // -> could we resample the frame in frequency domain ?
        var fBin = i * binPerPixel;
        var prevBinIndex = Math.floor(fBin);
        var nextBinIndex = Math.ceil(fBin);

        var prevBin = frame[prevBinIndex];
        var nextBin = frame[nextBinIndex];

        var position = fBin - prevBinIndex;
        var slope = nextBin - prevBin;
        var intercept = prevBin;
        var weightedBin = slope * position + intercept;

        var y = this.params.height - i;
        var c = Math.round(weightedBin * scale * 255);

        ctx.fillStyle = 'rgba(' + c + ', ' + c + ', ' + c + ', 1)';
        ctx.fillRect(-iShift, y, iShift, -1);
      }
    }
  }, {
    key: 'scale',
    set: function set(value) {
      this.params.scale = value;
    },
    get: function get() {
      return this.params.scale;
    }
  }]);

  return Sonogram;
})(_baseDraw2['default']);

exports['default'] = Sonogram;
module.exports = exports['default'];

},{"../utils/draw-utils":114,"./base-draw":97,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],104:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _utilsDrawUtils = require('../utils/draw-utils');

var Spectrogram = (function (_BaseDraw) {
  _inherits(Spectrogram, _BaseDraw);

  function Spectrogram(options) {
    _classCallCheck(this, Spectrogram);

    var defaults = {
      min: 0,
      max: 1,
      scale: 1
    };

    _get(Object.getPrototypeOf(Spectrogram.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(Spectrogram, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Spectrogram.prototype), 'initialize', this).call(this);

      this._rafFlag = true;
      if (!this.params.color) {
        this.params.color = (0, _utilsDrawUtils.getRandomColor)();
      }
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      _get(Object.getPrototypeOf(Spectrogram.prototype), 'finalize', this).call(this);
      this._rafFlag = false;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var _this = this;

      if (this._rafFlag) {
        this._rafFlag = false;
        requestAnimationFrame(function () {
          return _this.drawCurve(frame);
        });
      }

      _get(Object.getPrototypeOf(Spectrogram.prototype), 'process', this).call(this, time, frame, metaData);
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame) {
      var nbrBins = frame.length;
      var width = this.params.width;
      var height = this.params.height;
      var binWidth = width / nbrBins;
      var scale = this.params.scale;
      var ctx = this.ctx;

      ctx.fillStyle = this.params.color;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nbrBins; i++) {
        var x = i / nbrBins * width;
        var y = this.getYPosition(frame[i] * scale);

        ctx.fillRect(x, y, binWidth, height - y);
      }

      this._rafFlag = true;
    }
  }, {
    key: 'scale',
    set: function set(value) {
      this.params.scale = value;
    }
  }]);

  return Spectrogram;
})(_baseDraw2['default']);

exports['default'] = Spectrogram;
module.exports = exports['default'];

},{"../utils/draw-utils":114,"./base-draw":97,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],105:[function(require,module,exports){
/**
 * is used to keep several draw in sync
 * when a view is installed in a synchronized draw
 * the meta view is installed as a member of all it's children
 */
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var SynchronizedDraw = (function () {
  function SynchronizedDraw() {
    _classCallCheck(this, SynchronizedDraw);

    this.views = [];

    for (var _len = arguments.length, views = Array(_len), _key = 0; _key < _len; _key++) {
      views[_key] = arguments[_key];
    }

    this.add.apply(this, views);
  }

  _createClass(SynchronizedDraw, [{
    key: "add",
    value: function add() {
      var _this = this;

      for (var _len2 = arguments.length, views = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        views[_key2] = arguments[_key2];
      }

      views.forEach(function (view) {
        _this.install(view);
      });
    }
  }, {
    key: "install",
    value: function install(view) {
      this.views.push(view);
      view.params.isSynchronized = true;
      view.synchronizer = this;
    }
  }, {
    key: "shiftSiblings",
    value: function shiftSiblings(iShift, view) {
      this.views.forEach(function (child) {
        if (child === view) {
          return;
        }
        child.shiftCanvas(iShift);
      });
    }
  }]);

  return SynchronizedDraw;
})();

exports["default"] = SynchronizedDraw;
module.exports = exports["default"];

},{"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10}],106:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _utilsDrawUtils = require('../utils/draw-utils');

var Trace = (function (_BaseDraw) {
  _inherits(Trace, _BaseDraw);

  function Trace(options) {
    _classCallCheck(this, Trace);

    var defaults = {
      colorScheme: 'none' // color, opacity
    };

    _get(Object.getPrototypeOf(Trace.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(Trace, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Trace.prototype), 'initialize', this).call(this);

      if (!this.params.color) {
        this.params.color = (0, _utilsDrawUtils.getRandomColor)();
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame) {
      this.scrollModeDraw(time, frame);
      _get(Object.getPrototypeOf(Trace.prototype), 'process', this).call(this, time, frame);
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      var ctx = this.ctx;
      var color = undefined,
          gradient = undefined;

      var halfRange = frame[1] / 2;
      var mean = this.getYPosition(frame[0]);
      var min = this.getYPosition(frame[0] - halfRange);
      var max = this.getYPosition(frame[0] + halfRange);

      var prevHalfRange = undefined;
      var prevMin = undefined;
      var prevMax = undefined;

      if (prevFrame) {
        prevHalfRange = prevFrame[1] / 2;
        prevMin = this.getYPosition(prevFrame[0] - prevHalfRange);
        prevMax = this.getYPosition(prevFrame[0] + prevHalfRange);
      }

      switch (this.params.colorScheme) {
        case 'none':
          ctx.fillStyle = this.params.color;
          break;
        case 'hue':
          gradient = ctx.createLinearGradient(-iShift, 0, 0, 0);

          if (prevFrame) {
            gradient.addColorStop(0, 'hsl(' + (0, _utilsDrawUtils.getHue)(prevFrame[2]) + ', 100%, 50%)');
          } else {
            gradient.addColorStop(0, 'hsl(' + (0, _utilsDrawUtils.getHue)(frame[2]) + ', 100%, 50%)');
          }

          gradient.addColorStop(1, 'hsl(' + (0, _utilsDrawUtils.getHue)(frame[2]) + ', 100%, 50%)');
          ctx.fillStyle = gradient;
          break;
        case 'opacity':
          var rgb = (0, _utilsDrawUtils.hexToRGB)(this.params.color);
          gradient = ctx.createLinearGradient(-iShift, 0, 0, 0);

          if (prevFrame) {
            gradient.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + prevFrame[2] + ')');
          } else {
            gradient.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + frame[2] + ')');
          }

          gradient.addColorStop(1, 'rgba(' + rgb.join(',') + ',' + frame[2] + ')');
          ctx.fillStyle = gradient;
          break;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, mean);
      ctx.lineTo(0, max);

      if (prevFrame) {
        ctx.lineTo(-iShift, prevMax);
        ctx.lineTo(-iShift, prevMin);
      }

      ctx.lineTo(0, min);
      ctx.closePath();

      ctx.fill();
      ctx.restore();
    }
  }]);

  return Trace;
})(_baseDraw2['default']);

exports['default'] = Trace;
;

module.exports = Trace;
module.exports = exports['default'];

},{"../utils/draw-utils":114,"./base-draw":97,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],107:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _utilsDrawUtils = require('../utils/draw-utils');

var Waveform = (function (_BaseDraw) {
  _inherits(Waveform, _BaseDraw);

  function Waveform(options) {
    _classCallCheck(this, Waveform);

    var defaults = {};
    _get(Object.getPrototypeOf(Waveform.prototype), 'constructor', this).call(this, options, defaults);
  }

  _createClass(Waveform, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(Waveform.prototype), 'initialize', this).call(this);

      if (!this.params.color) {
        this.params.color = (0, _utilsDrawUtils.getRandomColor)();
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      this.scrollModeDraw(time, frame);
      // this._cache.push({ time, frame });
      _get(Object.getPrototypeOf(Waveform.prototype), 'process', this).call(this, time, frame, metaData);
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, previousFrame, iShift) {
      var ctx = this.ctx;
      var min = this.getYPosition(frame[0]);
      var max = this.getYPosition(frame[1]);

      ctx.save();

      ctx.fillStyle = this.params.color;
      ctx.beginPath();

      ctx.moveTo(0, this.getYPosition(0));
      ctx.lineTo(0, max);

      if (previousFrame) {
        var prevMin = this.getYPosition(previousFrame[0]);
        var prevMax = this.getYPosition(previousFrame[1]);
        ctx.lineTo(-iShift, prevMax);
        ctx.lineTo(-iShift, prevMin);
      }

      ctx.lineTo(0, min);

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }]);

  return Waveform;
})(_baseDraw2['default']);

exports['default'] = Waveform;
module.exports = exports['default'];

},{"../utils/draw-utils":114,"./base-draw":97,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],108:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _audioIn = require('./audio-in');

var _audioIn2 = _interopRequireDefault(_audioIn);

var worker = '\nself.addEventListener(\'message\', function process(e) {\n  var blockSize = e.data.options.blockSize;\n  var sampleRate = e.data.options.sampleRate;\n  var buffer = new Float32Array(e.data.buffer);\n\n  var length = buffer.length;\n  // var block = new Float32Array(blockSize);\n\n  for (var index = 0; index < length; index += blockSize) {\n    var copySize = length - index;\n    if (copySize > blockSize) { copySize = blockSize; }\n\n    var block = buffer.subarray(index, index + copySize);\n    block = new Float32Array(block);\n\n    postMessage({ buffer: block.buffer, time: index / sampleRate }, [block.buffer]);\n  }\n}, false)';

/**
 * AudioBuffer as source, sliced it in blocks through a worker
 */

var AudioInBuffer = (function (_AudioIn) {
  _inherits(AudioInBuffer, _AudioIn);

  function AudioInBuffer() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AudioInBuffer);

    _get(Object.getPrototypeOf(AudioInBuffer.prototype), 'constructor', this).call(this, options, {});
    this.metaData = {};

    if (!this.params.src || !(this.params.src instanceof AudioBuffer)) {
      throw new Error('An AudioBuffer source must be given');
    }
  }

  _createClass(AudioInBuffer, [{
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = this.params.frameSize;
      this.streamParams.frameRate = this.params.src.sampleRate / this.params.frameSize;
      this.streamParams.sourceSampleRate = this.params.src.sampleRate;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(AudioInBuffer.prototype), 'initialize', this).call(this);
      // init worker
      // @NOTE: could be done once in constructor ?
      var blob = new Blob([worker], { type: "text/javascript" });
      this.worker = new Worker(window.URL.createObjectURL(blob));
      this.worker.addEventListener('message', this.process.bind(this), false);
    }
  }, {
    key: 'start',
    value: function start() {
      // propagate to the whole chain
      this.initialize();
      this.reset();

      var buffer = this.src.getChannelData(this.channel).buffer;

      this.worker.postMessage({
        options: {
          sampleRate: this.streamParams.sourceSampleRate,
          blockSize: this.streamParams.frameSize
        },
        buffer: buffer
      }, [buffer]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      // propagate to the whole chain
      this.finalize();
    }

    // callback of the worker
  }, {
    key: 'process',
    value: function process(e) {
      var block = new Float32Array(e.data.buffer);
      this.outFrame.set(block, 0);
      this.time = e.data.time;

      this.output();
    }
  }]);

  return AudioInBuffer;
})(_audioIn2['default']);

exports['default'] = AudioInBuffer;
module.exports = exports['default'];

},{"./audio-in":110,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],109:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _audioIn = require('./audio-in');

/**
 *  Use a WebAudio node as a source
 */

var _audioIn2 = _interopRequireDefault(_audioIn);

var AudioInNode = (function (_AudioIn) {
  _inherits(AudioInNode, _AudioIn);

  function AudioInNode() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AudioInNode);

    var defaults = {
      timeType: 'absolute'
    };

    _get(Object.getPrototypeOf(AudioInNode.prototype), 'constructor', this).call(this, options);

    this.metaData = {};
  }

  _createClass(AudioInNode, [{
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = this.params.frameSize;
      this.streamParams.frameRate = this.ctx.sampleRate / this.params.frameSize;
      this.streamParams.sourceSampleRate = this.ctx.sampleRate;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(AudioInNode.prototype), 'initialize', this).call(this);

      var blockSize = this.streamParams.frameSize;
      this.scriptProcessor = this.ctx.createScriptProcessor(blockSize, 1, 1);
      // prepare audio graph
      this.scriptProcessor.onaudioprocess = this.process.bind(this);
      this.src.connect(this.scriptProcessor);
    }

    // connect the audio nodes to start streaming
  }, {
    key: 'start',
    value: function start() {
      if (this.params.timeType === 'relative') {
        this.time = 0;
      }

      this.initialize();
      this.reset();
      // start "the patch" ;)
      this.scriptProcessor.connect(this.ctx.destination);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.finalize();
      this.scriptProcessor.disconnect();
    }

    // is basically the `scriptProcessor.onaudioprocess` callback
  }, {
    key: 'process',
    value: function process(e) {
      var block = e.inputBuffer.getChannelData(this.params.channel);

      this.time += block.length / this.streamParams.sourceSampleRate;
      this.outFrame.set(block, 0);
      this.output();
    }
  }]);

  return AudioInNode;
})(_audioIn2['default']);

exports['default'] = AudioInNode;
module.exports = exports['default'];

},{"./audio-in":110,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],110:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var audioContext = undefined; // for lazy audioContext creation

var AudioIn = (function (_BaseLfo) {
  _inherits(AudioIn, _BaseLfo);

  function AudioIn() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AudioIn);

    // defaults
    var defaults = {
      frameSize: 512,
      channel: 0
    };

    _get(Object.getPrototypeOf(AudioIn.prototype), 'constructor', this).call(this, options, defaults);

    // private
    if (!this.params.ctx) {
      if (!audioContext) {
        audioContext = new window.AudioContext();
      }

      this.ctx = audioContext;
    } else {
      this.ctx = this.params.ctx;
    }

    this.src = this.params.src;
    this.time = 0;
    this.metaData = {};
  }

  _createClass(AudioIn, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'stop',
    value: function stop() {}
  }]);

  return AudioIn;
})(_coreBaseLfo2['default']);

exports['default'] = AudioIn;

module.exports = AudioIn;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],111:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

/*
  can forward
    - relativeTime (according to it's start() method)
    - absoluteTime (audioContex time)
    - input time

  methods
    - `start()` -> call `reset()`
    - `stop()`  -> call `finalize()`
*/

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var EventIn = (function (_BaseLfo) {
  _inherits(EventIn, _BaseLfo);

  function EventIn(options) {
    _classCallCheck(this, EventIn);

    var defaults = {
      timeType: 'absolute'
    };
    // cannot have previous
    _get(Object.getPrototypeOf(EventIn.prototype), 'constructor', this).call(this, options, defaults);

    // test AudioContext for use in node environment
    if (!this.params.ctx && typeof process === 'undefined') {
      this.params.ctx = new AudioContext();
    }

    this._isStarted = false;
    this._startTime = undefined;
  }

  _createClass(EventIn, [{
    key: 'configureStream',
    value: function configureStream() {
      // throw error if some values are undefined ?
      this.streamParams.frameSize = this.params.frameSize;
      this.streamParams.frameRate = this.params.frameRate;
      // @NOTE what does make sens in this case ?
      // this.streamParams.sourceSampleRate = this.params.frameSize * this.params.frameRate;
      this.streamParams.sourceSampleRate = this.params.sourceSampleRate || this.params.frameRate;
    }
  }, {
    key: 'start',
    value: function start() {
      // should be setted in the first process call
      this._isStarted = true;
      this._startTime = undefined;

      this.initialize();
      this.reset();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._isStarted = false;
      this._startTime = undefined;
      this.finalize();
    }
  }, {
    key: 'process',
    value: function process(time, frame) {
      var metaData = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!this._isStarted) {
        return;
      }
      // à revoir
      // if no time provided, use audioContext.currentTime
      var frameTime = !isNaN(parseFloat(time)) && isFinite(time) ? time : this.params.ctx.currentTime;

      // set `startTime` if first call after a `start`
      if (!this._startTime) {
        this._startTime = frameTime;
      }

      // handle time according to config
      if (this.params.timeType === 'relative') {
        frameTime = time - this._startTime;
      }

      // if scalar, create a vector
      if (frame.length === undefined) {
        frame = [frame];
      }
      // works if frame is an array
      this.outFrame.set(frame, 0);
      this.time = frameTime;
      this.metaData = metaData;

      this.output();
    }
  }]);

  return EventIn;
})(_coreBaseLfo2['default']);

exports['default'] = EventIn;

module.exports = EventIn;
module.exports = exports['default'];

},{"../core/base-lfo":86,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],112:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var _utilsSocketUtils = require('../utils/socket-utils');

// @TODO: handle `start` and `stop`

var SocketClient = (function (_BaseLfo) {
  _inherits(SocketClient, _BaseLfo);

  function SocketClient(options) {
    _classCallCheck(this, SocketClient);

    var defaults = {
      port: 3031,
      address: window.location.hostname
    };

    _get(Object.getPrototypeOf(SocketClient.prototype), 'constructor', this).call(this, options, defaults);

    this.socket = null;
    this.initConnection();
  }

  _createClass(SocketClient, [{
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();
    }
  }, {
    key: 'configureStream',
    value: function configureStream() {
      this.streamParams.frameSize = this.params.frameSize;
      this.streamParams.frameRate = this.params.frameRate;
    }
  }, {
    key: 'initConnection',
    value: function initConnection() {
      var _this = this;

      var socketAddr = 'ws://' + this.params.address + ':' + this.params.port;
      this.socket = new WebSocket(socketAddr);
      this.socket.binaryType = 'arraybuffer';

      // callback to start to when WebSocket is connected
      this.socket.onopen = function () {
        _this.start();
      };

      this.socket.onclose = function () {};

      this.socket.onmessage = function (message) {
        _this.process(message.data);
      };

      this.socket.onerror = function (err) {
        console.error(err);
      };
    }
  }, {
    key: 'process',
    value: function process(buffer) {
      var message = (0, _utilsSocketUtils.decodeMessage)(buffer);

      this.time = message.time;
      this.outFrame = message.frame;
      this.metaData = message.metaData;

      this.output();
    }
  }]);

  return SocketClient;
})(_coreBaseLfo2['default']);

exports['default'] = SocketClient;
module.exports = exports['default'];

},{"../core/base-lfo":86,"../utils/socket-utils":116,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13}],113:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreBaseLfo = require('../core/base-lfo');

var _coreBaseLfo2 = _interopRequireDefault(_coreBaseLfo);

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var _utilsSocketUtils = require('../utils/socket-utils');

// @TODO: handle `start` and `stop`

var SocketServer = (function (_BaseLfo) {
  _inherits(SocketServer, _BaseLfo);

  function SocketServer(options) {
    _classCallCheck(this, SocketServer);

    var defaults = {
      port: 3030
    };

    _get(Object.getPrototypeOf(SocketServer.prototype), 'constructor', this).call(this, options, defaults);

    // @TODO handle disconnect and so on...
    this.clients = [];
    this.server = null;
    this.initServer();

    // @FIXME - right place ?
    this.start();
  }

  _createClass(SocketServer, [{
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();
    }
  }, {
    key: 'initServer',
    value: function initServer() {
      var _this = this;

      this.server = new ws.Server({ port: this.params.port });

      this.server.on('connection', function (socket) {
        // this.clients.push(socket);
        socket.on('message', _this.process.bind(_this));
      });
    }
  }, {
    key: 'process',
    value: function process(buffer) {
      var arrayBuffer = (0, _utilsSocketUtils.bufferToArrayBuffer)(buffer);
      var message = (0, _utilsSocketUtils.decodeMessage)(arrayBuffer);

      this.time = message.time;
      this.outFrame = message.frame;
      this.metaData = message.metaData;

      this.output();
    }
  }]);

  return SocketServer;
})(_coreBaseLfo2['default']);

exports['default'] = SocketServer;
module.exports = exports['default'];

},{"../core/base-lfo":86,"../utils/socket-utils":116,"babel-runtime/helpers/class-call-check":9,"babel-runtime/helpers/create-class":10,"babel-runtime/helpers/get":11,"babel-runtime/helpers/inherits":12,"babel-runtime/helpers/interop-require-default":13,"babel-runtime/helpers/interop-require-wildcard":14,"ws":119}],114:[function(require,module,exports){
// http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var getRandomColor = function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// scale from domain [0, 1] to range [270, 0] to consume in
// hsl(x, 100%, 50%) color scheme
var getHue = function getHue(x) {
  var domainMin = 0;
  var domainMax = 1;
  var rangeMin = 270;
  var rangeMax = 0;

  return (rangeMax - rangeMin) * (x - domainMin) / (domainMax - domainMin) + rangeMin;
};

var hexToRGB = function hexToRGB(hex) {
  hex = hex.substring(1, 7);
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
};

exports['default'] = { getRandomColor: getRandomColor, getHue: getHue, hexToRGB: hexToRGB };
module.exports = exports['default'];

},{}],115:[function(require,module,exports){

// shortcuts / helpers
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var sqrt = Math.sqrt;

// window creation functions
function initHannWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.5 - 0.5 * cos(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initHammingWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.54 - 0.46 * cos(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initBlackmanWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.42 - 0.5 * cos(phi) + 0.08 * cos(2 * phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initBlackmanHarrisWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var a0 = 0.35875;
  var a1 = 0.48829;
  var a2 = 0.14128;
  var a3 = 0.01168;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = a0 - a1 * cos(phi) + a2 * cos(2 * phi);-a3 * cos(3 * phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initSineWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = sin(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initRectangleWindow(buffer, size, normCoefs) {
  // @TODO normCoefs
  for (var i = 0; i < size; i++) {
    buffer[i] = 1;
  }
}

exports['default'] = (function () {
  // @NOTE implement some caching system (is this really usefull ?)
  var cache = {};

  return function (name, buffer, size, normCoefs) {
    name = name.toLowerCase();

    switch (name) {
      case 'hann':
      case 'hanning':
        initHannWindow(buffer, size, normCoefs);
        break;
      case 'hamming':
        initHammingWindow(buffer, size, normCoefs);
        break;
      case 'blackman':
        initBlackmanWindow(buffer, size, normCoefs);
        break;
      case 'blackmanharris':
        initBlackmanHarrisWindow(buffer, size, normCoefs);
        break;
      case 'sine':
        initSineWindow(buffer, size, normCoefs);
        break;
      case 'rectangle':
        initRectangleWindow(buffer, size, normCoefs);
        break;
    }
  };
})();

module.exports = exports['default'];

},{}],116:[function(require,module,exports){
(function (Buffer){
"use strict";

// http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function Uint16Array2str(buf) {
  return String.fromCharCode.apply(null, buf);
}

function str2Uint16Array(str) {
  var buffer = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufferView = new Uint16Array(buffer);

  for (var i = 0, l = str.length; i < l; i++) {
    bufferView[i] = str.charCodeAt(i);
  }
  return bufferView;
}

//http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
// converts a nodejs Buffer to ArrayBuffer
module.exports.bufferToArrayBuffer = function (buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
};

module.exports.arrayBufferToBuffer = function (arrayBuffer) {
  var buffer = new Buffer(arrayBuffer.byteLength);
  var view = new Uint8Array(arrayBuffer);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
};

// @TODO `encodeMessage` and `decodeMessage` could probably use DataView to parse the buffer

// concat the lfo stream, time and metaData into a single buffer
// the concatenation is done as follow :
//  * time          => 8 bytes
//  * frame.length  => 2 bytes
//  * frame         => 4 * frameLength bytes
//  * metaData      => rest of the message
// @return  ArrayBuffer of the created message
// @note    must create a new buffer each time because metaData length is not known
module.exports.encodeMessage = function (time, frame, metaData) {
  // should probably use use DataView instead
  // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
  var time64 = new Float64Array(1);
  time64[0] = time;
  var time16 = new Uint16Array(time64.buffer);

  var length16 = new Uint16Array(1);
  length16[0] = frame.length;

  var frame16 = new Uint16Array(frame.buffer);

  var metaData16 = str2Uint16Array(JSON.stringify(metaData));

  var bufferLength = time16.length + length16.length + frame16.length + metaData16.length;

  var buffer = new Uint16Array(bufferLength);

  // buffer is the concatenation of time, frameLength, frame, metaData
  buffer.set(time16, 0);
  buffer.set(length16, time16.length);
  buffer.set(frame16, time16.length + length16.length);
  buffer.set(metaData16, time16.length + length16.length + frame16.length);

  return buffer.buffer;
};

// recreate the Lfo stream (time, frame, metaData) form a buffer
// created with `encodeMessage`
module.exports.decodeMessage = function (buffer) {
  // time is a float64Array of size 1 (8 bytes)
  var timeArray = new Float64Array(buffer.slice(0, 8));
  var time = timeArray[0];

  // frame length is encoded in 2 bytes
  var frameLengthArray = new Uint16Array(buffer.slice(8, 10));
  var frameLength = frameLengthArray[0];

  // frame is a float32Array (4 bytes) * frameLength
  var frameByteLength = 4 * frameLength;
  var frame = new Float32Array(buffer.slice(10, 10 + frameByteLength));

  // metaData is the rest of the buffer
  var metaDataArray = new Uint16Array(buffer.slice(10 + frameByteLength));
  // JSON.parse here crashes node because of this character : `\u0000` (null in unicode) ??
  var metaData = Uint16Array2str(metaDataArray);
  metaData = JSON.parse(metaData.replace(/\u0000/g, ""));

  return { time: time, frame: frame, metaData: metaData };
};

}).call(this,require("buffer").Buffer)

},{"buffer":82}],117:[function(require,module,exports){
'use strict';

!function(exports, undefined) {

  var
    // If the typed array is unspecified, use this.
    DefaultArrayType = Float32Array,
    // Simple math functions we need.
    sqrt = Math.sqrt,
    sqr = function(number) {return Math.pow(number, 2)},
    // Internal convenience copies of the exported functions
    isComplexArray,
    ComplexArray

  exports.isComplexArray = isComplexArray = function(obj) {
    return obj !== undefined &&
      obj.hasOwnProperty !== undefined &&
      obj.hasOwnProperty('real') &&
      obj.hasOwnProperty('imag')
  }

  exports.ComplexArray = ComplexArray = function(other, opt_array_type){
    if (isComplexArray(other)) {
      // Copy constuctor.
      this.ArrayType = other.ArrayType
      this.real = new this.ArrayType(other.real)
      this.imag = new this.ArrayType(other.imag)
    } else {
      this.ArrayType = opt_array_type || DefaultArrayType
      // other can be either an array or a number.
      this.real = new this.ArrayType(other)
      this.imag = new this.ArrayType(this.real.length)
    }

    this.length = this.real.length
  }

  ComplexArray.prototype.toString = function() {
    var components = []

    this.forEach(function(c_value, i) {
      components.push(
        '(' +
        c_value.real.toFixed(2) + ',' +
        c_value.imag.toFixed(2) +
        ')'
      )
    })

    return '[' + components.join(',') + ']'
  }

  // In-place mapper.
  ComplexArray.prototype.map = function(mapper) {
    var
      i,
      n = this.length,
      // For GC efficiency, pass a single c_value object to the mapper.
      c_value = {}

    for (i = 0; i < n; i++) {
      c_value.real = this.real[i]
      c_value.imag = this.imag[i]
      mapper(c_value, i, n)
      this.real[i] = c_value.real
      this.imag[i] = c_value.imag
    }

    return this
  }

  ComplexArray.prototype.forEach = function(iterator) {
    var
      i,
      n = this.length,
      // For consistency with .map.
      c_value = {}

    for (i = 0; i < n; i++) {
      c_value.real = this.real[i]
      c_value.imag = this.imag[i]
      iterator(c_value, i, n)
    }
  }

  ComplexArray.prototype.conjugate = function() {
    return (new ComplexArray(this)).map(function(value) {
      value.imag *= -1
    })
  }

  // Helper so we can make ArrayType objects returned have similar interfaces
  //   to ComplexArrays.
  function iterable(obj) {
    if (!obj.forEach)
      obj.forEach = function(iterator) {
        var i, n = this.length

        for (i = 0; i < n; i++)
          iterator(this[i], i, n)
      }

    return obj
  }

  ComplexArray.prototype.magnitude = function() {
    var mags = new this.ArrayType(this.length)

    this.forEach(function(value, i) {
      mags[i] = sqrt(sqr(value.real) + sqr(value.imag))
    })

    // ArrayType will not necessarily be iterable: make it so.
    return iterable(mags)
  }
}(typeof exports === 'undefined' && (this.complex_array = {}) || exports)

},{}],118:[function(require,module,exports){
'use strict';

!function(exports, complex_array) {

  var
    ComplexArray = complex_array.ComplexArray,
    // Math constants and functions we need.
    PI = Math.PI,
    SQRT1_2 = Math.SQRT1_2,
    sqrt = Math.sqrt,
    cos = Math.cos,
    sin = Math.sin

  ComplexArray.prototype.FFT = function() {
    return FFT(this, false)
  }

  exports.FFT = function(input) {
    return ensureComplexArray(input).FFT()
  }

  ComplexArray.prototype.InvFFT = function() {
    return FFT(this, true)
  }

  exports.InvFFT = function(input) {
    return ensureComplexArray(input).InvFFT()
  }

  // Applies a frequency-space filter to input, and returns the real-space
  // filtered input.
  // filterer accepts freq, i, n and modifies freq.real and freq.imag.
  ComplexArray.prototype.frequencyMap = function(filterer) {
    return this.FFT().map(filterer).InvFFT()
  }

  exports.frequencyMap = function(input, filterer) {
    return ensureComplexArray(input).frequencyMap(filterer)
  }

  function ensureComplexArray(input) {
    return complex_array.isComplexArray(input) && input ||
        new ComplexArray(input)
  }

  function FFT(input, inverse) {
    var n = input.length

    if (n & (n - 1)) {
      return FFT_Recursive(input, inverse)
    } else {
      return FFT_2_Iterative(input, inverse)
    }
  }

  function FFT_Recursive(input, inverse) {
    var
      n = input.length,
      // Counters.
      i, j,
      output,
      // Complex multiplier and its delta.
      f_r, f_i, del_f_r, del_f_i,
      // Lowest divisor and remainder.
      p, m,
      normalisation,
      recursive_result,
      _swap, _real, _imag

    if (n === 1) {
      return input
    }

    output = new ComplexArray(n, input.ArrayType)

    // Use the lowest odd factor, so we are able to use FFT_2_Iterative in the
    // recursive transforms optimally.
    p = LowestOddFactor(n)
    m = n / p
    normalisation = 1 / sqrt(p)
    recursive_result = new ComplexArray(m, input.ArrayType)

    // Loops go like O(n Σ p_i), where p_i are the prime factors of n.
    // for a power of a prime, p, this reduces to O(n p log_p n)
    for(j = 0; j < p; j++) {
      for(i = 0; i < m; i++) {
        recursive_result.real[i] = input.real[i * p + j]
        recursive_result.imag[i] = input.imag[i * p + j]
      }
      // Don't go deeper unless necessary to save allocs.
      if (m > 1) {
        recursive_result = FFT(recursive_result, inverse)
      }

      del_f_r = cos(2*PI*j/n)
      del_f_i = (inverse ? -1 : 1) * sin(2*PI*j/n)
      f_r = 1
      f_i = 0

      for(i = 0; i < n; i++) {
        _real = recursive_result.real[i % m]
        _imag = recursive_result.imag[i % m]

        output.real[i] += f_r * _real - f_i * _imag
        output.imag[i] += f_r * _imag + f_i * _real

        _swap = f_r * del_f_r - f_i * del_f_i
        f_i = f_r * del_f_i + f_i * del_f_r
        f_r = _swap
      }
    }

    // Copy back to input to match FFT_2_Iterative in-placeness
    // TODO: faster way of making this in-place?
    for(i = 0; i < n; i++) {
      input.real[i] = normalisation * output.real[i]
      input.imag[i] = normalisation * output.imag[i]
    }

    return input
  }

  function FFT_2_Iterative(input, inverse) {
    var
      n = input.length,
      // Counters.
      i, j,
      output, output_r, output_i,
      // Complex multiplier and its delta.
      f_r, f_i, del_f_r, del_f_i, temp,
      // Temporary loop variables.
      l_index, r_index,
      left_r, left_i, right_r, right_i,
      // width of each sub-array for which we're iteratively calculating FFT.
      width

    output = BitReverseComplexArray(input)
    output_r = output.real
    output_i = output.imag
    // Loops go like O(n log n):
    //   width ~ log n; i,j ~ n
    width = 1
    while (width < n) {
      del_f_r = cos(PI/width)
      del_f_i = (inverse ? -1 : 1) * sin(PI/width)
      for (i = 0; i < n/(2*width); i++) {
        f_r = 1
        f_i = 0
        for (j = 0; j < width; j++) {
          l_index = 2*i*width + j
          r_index = l_index + width

          left_r = output_r[l_index]
          left_i = output_i[l_index]
          right_r = f_r * output_r[r_index] - f_i * output_i[r_index]
          right_i = f_i * output_r[r_index] + f_r * output_i[r_index]

          output_r[l_index] = SQRT1_2 * (left_r + right_r)
          output_i[l_index] = SQRT1_2 * (left_i + right_i)
          output_r[r_index] = SQRT1_2 * (left_r - right_r)
          output_i[r_index] = SQRT1_2 * (left_i - right_i)
          temp = f_r * del_f_r - f_i * del_f_i
          f_i = f_r * del_f_i + f_i * del_f_r
          f_r = temp
        }
      }
      width <<= 1
    }

    return output
  }

  function BitReverseIndex(index, n) {
    var bitreversed_index = 0

    while (n > 1) {
      bitreversed_index <<= 1
      bitreversed_index += index & 1
      index >>= 1
      n >>= 1
    }
    return bitreversed_index
  }

  function BitReverseComplexArray(array) {
    var n = array.length,
        flips = {},
        swap,
        i

    for(i = 0; i < n; i++) {
      var r_i = BitReverseIndex(i, n)

      if (flips.hasOwnProperty(i) || flips.hasOwnProperty(r_i)) continue

      swap = array.real[r_i]
      array.real[r_i] = array.real[i]
      array.real[i] = swap

      swap = array.imag[r_i]
      array.imag[r_i] = array.imag[i]
      array.imag[i] = swap

      flips[i] = flips[r_i] = true
    }

    return array
  }

  function LowestOddFactor(n) {
    var factor = 3,
        sqrt_n = sqrt(n)

    while(factor <= sqrt_n) {
      if (n % factor === 0) return factor
      factor = factor + 2
    }
    return n
  }

}(
  typeof exports === 'undefined' && (this.fft = {}) || exports,
  typeof require === 'undefined' && (this.complex_array) ||
    require('./complex_array')
)

},{"./complex_array":117}],119:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],120:[function(require,module,exports){
module.exports = {
  core: {
    BaseLfo           : require('./dist/core/base-lfo'),
  },
  sources: {
    AudioInBuffer     : require('./dist/sources/audio-in-buffer'),
    AudioInNode       : require('./dist/sources/audio-in-node'),
    EventIn           : require('./dist/sources/event-in'),
    // retest
    SocketClient      : require('./dist/sources/socket-client'),
    SocketServer      : require('./dist/sources/socket-server'),
  },
  sinks: {
    AudioRecorder     : require('./dist/sinks/audio-recorder'),
    Bpf               : require('./dist/sinks/bpf'),
    Bridge            : require('./dist/sinks/bridge'),
    DataRecorder      : require('./dist/sinks/data-recorder'),
    Trace             : require('./dist/sinks/trace'),
    Spectrogram       : require('./dist/sinks/spectrogram'),
    SocketClient      : require('./dist/sinks/socket-client'),
    SocketServer      : require('./dist/sinks/socket-server'),
    Sonogram          : require('./dist/sinks/sonogram'),
    SynchronizedDraw  : require('./dist/sinks/synchronized-draw'),
    Waveform          : require('./dist/sinks/waveform'),
  },
  operators: {
    Biquad            : require('./dist/operators/biquad'),
    Fft               : require('./dist/operators/fft'),
    // Ifft           : require('./dist/operators/ifft'),
    Framer            : require('./dist/operators/framer'),
    Magnitude         : require('./dist/operators/magnitude'),
    MinMax            : require('./dist/operators/min-max'),
    MovingAverage     : require('./dist/operators/moving-average'),
    MovingMedian      : require('./dist/operators/moving-median'),
    Noop              : require('./dist/operators/noop'),
    Operator          : require('./dist/operators/operator'),
  },
};

},{"./dist/core/base-lfo":86,"./dist/operators/biquad":87,"./dist/operators/fft":88,"./dist/operators/framer":89,"./dist/operators/magnitude":90,"./dist/operators/min-max":91,"./dist/operators/moving-average":92,"./dist/operators/moving-median":93,"./dist/operators/noop":94,"./dist/operators/operator":95,"./dist/sinks/audio-recorder":96,"./dist/sinks/bpf":98,"./dist/sinks/bridge":99,"./dist/sinks/data-recorder":100,"./dist/sinks/socket-client":101,"./dist/sinks/socket-server":102,"./dist/sinks/sonogram":103,"./dist/sinks/spectrogram":104,"./dist/sinks/synchronized-draw":105,"./dist/sinks/trace":106,"./dist/sinks/waveform":107,"./dist/sources/audio-in-buffer":108,"./dist/sources/audio-in-node":109,"./dist/sources/event-in":111,"./dist/sources/socket-client":112,"./dist/sources/socket-server":113}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2VzNi9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY2xhc3MtY2FsbC1jaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlLWNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9nZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2luaGVyaXRzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1yZXF1aXJlLXdpbGRjYXJkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9hcnJheS9mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmEtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jbGFzc29mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZmluZWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5leHBvcnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhhcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhpZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5odG1sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLXN0ZXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmxpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5taWNyb3Rhc2suanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnByb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNhbWUtdmFsdWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNldC10by1zdHJpbmctdGFnLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50YXNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC51aWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L2NvcmUvZXM2L2NvcmUvYmFzZS1sZm8uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2VzNi9vcGVyYXRvcnMvYmlxdWFkLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9lczYvb3BlcmF0b3JzL2ZmdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvZXM2L29wZXJhdG9ycy9mcmFtZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2VzNi9vcGVyYXRvcnMvbWFnbml0dWRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9lczYvb3BlcmF0b3JzL21pbi1tYXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2VzNi9vcGVyYXRvcnMvbW92aW5nLWF2ZXJhZ2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2VzNi9vcGVyYXRvcnMvbW92aW5nLW1lZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvZXM2L29wZXJhdG9ycy9ub29wLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9lczYvb3BlcmF0b3JzL29wZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2VzNi9zaW5rcy9hdWRpby1yZWNvcmRlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9lczYvc2lua3MvYmFzZS1kcmF3LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2VzNi9zaW5rcy9icGYuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvZXM2L3NpbmtzL2JyaWRnZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9lczYvc2lua3MvZGF0YS1yZWNvcmRlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9lczYvc2lua3Mvc29ja2V0LWNsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9lczYvc2lua3Mvc29ja2V0LXNlcnZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9lczYvc2lua3Mvc29ub2dyYW0uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvZXM2L3NpbmtzL3NwZWN0cm9ncmFtLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2VzNi9zaW5rL3N5bmNocm9uaXplZC1kcmF3LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2VzNi9zaW5rL3RyYWNlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2VzNi9zaW5rcy93YXZlZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2VzNi9zb3VyY2VzL2F1ZGlvLWluLWJ1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2VzNi9zb3VyY2VzL2F1ZGlvLWluLW5vZGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc291cmNlcy9lczYvc291cmNlcy9hdWRpby1pbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2VzNi9zb3VyY2VzL2V2ZW50LWluLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NvdXJjZXMvZXM2L3NvdXJjZXMvc29ja2V0LWNsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2VzNi9zb3VyY2VzL3NvY2tldC1zZXJ2ZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvdXRpbHMvZXM2L3V0aWxzL2RyYXctdXRpbHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvdXRpbHMvZXM2L3V0aWxzL2ZmdC13aW5kb3dzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3V0aWxzL25vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC91dGlscy9lczYvdXRpbHMvc29ja2V0LXV0aWxzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvanNmZnQvbGliL2NvbXBsZXhfYXJyYXkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9qc2ZmdC9saWIvZmZ0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvd3MvbGliL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL3dhdmVzLWxmby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7d0JDQWdCLFdBQVc7Ozs7QUFFM0IsU0FBUyxDQUFDLFlBQVksR0FBSSxTQUFTLENBQUMsWUFBWSxJQUN6QixTQUFTLENBQUMsa0JBQWtCLElBQzVCLFNBQVMsQ0FBQyxlQUFlLElBQ3pCLFNBQVMsQ0FBQyxjQUFjLEFBQUMsQ0FBQzs7QUFHakQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ2YsTUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdEMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0FBSXBELEFBQUMsR0FBQSxZQUFZOztBQUVYLFFBQU0sV0FBVyxHQUFHLElBQUksc0JBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM5QyxTQUFHLEVBQUUsR0FBRztBQUNSLFNBQUcsRUFBRSxZQUFZO0tBQ2xCLENBQUMsQ0FBQzs7QUFFSCxRQUFNLE1BQU0sR0FBRyxJQUFJLHNCQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDdEMsZUFBUyxFQUFFLEdBQUc7QUFDZCxhQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQzs7QUFFSCxRQUFNLEdBQUcsR0FBRyxJQUFJLHNCQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUM7QUFDaEMsYUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQyxDQUFDOztBQUVILFFBQU0sTUFBTSxHQUFHLElBQUksc0JBQUksU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3hDLFVBQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQUUsYUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUFFLENBQUE7O0FBRTlELFFBQU0sUUFBUSxHQUFHLElBQUksc0JBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUN0QyxZQUFNLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7QUFDM0MsV0FBSyxFQUFFLEdBQUc7S0FDWCxDQUFDLENBQUM7O0FBRUgsZUFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixVQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLE9BQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXRCLGVBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNyQixDQUFBLEVBQUUsQ0FBRTs7Ozs7QUFLTCxBQUFDLEdBQUEsWUFBVzs7QUFFVixRQUFNLFdBQVcsR0FBRyxJQUFJLHNCQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDOUMsU0FBRyxFQUFFLEdBQUc7QUFDUixTQUFHLEVBQUUsWUFBWTtLQUNsQixDQUFDLENBQUM7O0FBRUgsUUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBSSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3RDLGVBQVMsRUFBRSxHQUFHO0tBQ2YsQ0FBQyxDQUFDOztBQUVILFFBQU0sR0FBRyxHQUFHLElBQUksc0JBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUNoQyxhQUFPLEVBQUUsR0FBRztBQUNaLGdCQUFVLEVBQUUsTUFBTTtLQUNuQixDQUFDLENBQUM7O0FBRUgsUUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBSSxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ3hDLFlBQU0sRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQztBQUM5QyxXQUFLLEVBQUUsRUFBRTtBQUNULFdBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQzs7QUFFSCxlQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLFVBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEIsT0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQixlQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7R0FFckIsQ0FBQSxFQUFFLENBQUU7Ozs7O0FBS0wsQUFBQyxHQUFBLFlBQVc7O0FBRVYsUUFBTSxXQUFXLEdBQUcsSUFBSSxzQkFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO0FBQzlDLFNBQUcsRUFBRSxHQUFHO0FBQ1IsU0FBRyxFQUFFLFlBQVk7S0FDbEIsQ0FBQyxDQUFDOztBQUVILFFBQU0sTUFBTSxHQUFHLElBQUksc0JBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUUxQyxRQUFNLFFBQVEsR0FBRyxJQUFJLHNCQUFJLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDdEMsWUFBTSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO0FBQzNDLFdBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQzs7QUFFSCxlQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLFVBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsZUFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0dBRXJCLENBQUEsRUFBRSxDQUFFOzs7OztBQU1MLEFBQUMsR0FBQSxZQUFXOztBQUVWLFFBQU0sT0FBTyxHQUFHLElBQUksc0JBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUMxQyxTQUFHLEVBQUUsR0FBRztBQUNSLFNBQUcsRUFBRSxZQUFZO0tBQ2xCLENBQUMsQ0FBQzs7O0FBR0gsUUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRTFDLFFBQU0sUUFBUSxHQUFHLElBQUksc0JBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUN0QyxZQUFNLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQztBQUN4RCxXQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7O0FBRUgsV0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7QUFHekIsUUFBTSxHQUFHLEdBQUcsSUFBSSxzQkFBSSxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ3RDLGVBQVMsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQzs7QUFFSCxRQUFNLE1BQU0sR0FBRyxJQUFJLHNCQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDeEMsVUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLEVBQUUsQ0FBQztBQUNaLGVBQVMsRUFBRSxtQkFBUyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUMzQyxnQkFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixnQkFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMvQjtLQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFJLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDdkMsWUFBTSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUM7QUFDekQsV0FBSyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFDOztBQUVILFdBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsT0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixVQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUxQixRQUFJLHNCQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRXBELFdBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUVqQixDQUFBLEVBQUUsQ0FBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwRU47O0FBRUQsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBUyxHQUFHLEVBQUU7QUFDMUQsU0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUIsQ0FBQyxDQUFDOzs7QUNwT0g7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBOzs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4Z0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbkIsTUFBSSxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNuQixNQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRTtBQUMzQyxNQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRWhCLE1BQUksTUFBTSxHQUFHLEdBQUcsSUFBSyxBQUFDLENBQUMsR0FBQyxHQUFHLEdBQUksQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFBLEdBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQSxBQUFDLENBQUM7O0FBRTVELE9BQUssQ0FBQyxFQUFFLEdBQUcsQUFBQyxDQUFDLEdBQUcsSUFBUyxBQUFDLENBQUMsR0FBQyxHQUFHLEdBQUksQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFBLEdBQUksQ0FBQyxDQUFBLEFBQWlCLEdBQUssTUFBTSxDQUFDO0FBQzNFLE9BQUssQ0FBQyxFQUFFLEdBQUcsQ0FBYyxBQUFDLENBQUMsR0FBQyxHQUFHLEdBQUksQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFBLEdBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQSxHQUFNLE1BQU0sQ0FBQzs7QUFFM0UsT0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFRLENBQUMsSUFBSyxBQUFDLENBQUMsR0FBQyxHQUFHLEdBQUksQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFBLEdBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQSxBQUFDLEdBQUssTUFBTSxDQUFDO0FBQzNFLE9BQUssQ0FBQyxFQUFFLEdBQUcsQUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFLLEFBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBSSxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUEsR0FBSSxDQUFDLENBQUEsQUFBaUIsR0FBSyxNQUFNLENBQUM7QUFDM0UsT0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFRLENBQUMsSUFBSyxBQUFDLENBQUMsR0FBQyxHQUFH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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG5uYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG5cblxuZnVuY3Rpb24gaW5pdChlKSB7XG4gIGNvbnN0IGN0eCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG4gIGNvbnN0IHN0cmVhbVNvdXJjZSA9IGN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShlKTtcbiAgLyoqXG4gICAqIFNvbm9ncmFtXG4gICAqL1xuICAoZnVuY3Rpb24gKCkge1xuXG4gICAgY29uc3QgYXVkaW9Tb3VyY2UgPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGZyYW1lciA9IG5ldyBsZm8ub3BlcmF0b3JzLkZyYW1lcih7XG4gICAgICBmcmFtZVNpemU6IDI1NixcbiAgICAgIGhvcFNpemU6IDI1NixcbiAgICB9KTtcblxuICAgIGNvbnN0IGZmdCA9IG5ldyBsZm8ub3BlcmF0b3JzLkZmdCh7XG4gICAgICBmZnRTaXplOiAyNTYsXG4gICAgICB3aW5kb3dOYW1lOiAnaGFubicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsb2dnZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Ob29wKCk7XG4gICAgbG9nZ2VyLnByb2Nlc3MgPSBmdW5jdGlvbih0aW1lLCBmcmFtZSkgeyBjb25zb2xlLmxvZyhmcmFtZSk7IH1cblxuICAgIGNvbnN0IHNvbm9ncmFtID0gbmV3IGxmby5zaW5rcy5Tb25vZ3JhbSh7XG4gICAgICBjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb25vZ3JhbScpLFxuICAgICAgc2NhbGU6IDEwMCxcbiAgICB9KTtcblxuICAgIGF1ZGlvU291cmNlLmNvbm5lY3QoZnJhbWVyKTtcbiAgICBmcmFtZXIuY29ubmVjdChmZnQpO1xuICAgIGZmdC5jb25uZWN0KHNvbm9ncmFtKTtcblxuICAgIGF1ZGlvU291cmNlLnN0YXJ0KCk7XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIFNwZWN0cm9ncmFtXG4gICAqL1xuICAoZnVuY3Rpb24oKSB7XG5cbiAgICBjb25zdCBhdWRpb1NvdXJjZSA9IG5ldyBsZm8uc291cmNlcy5BdWRpb0luTm9kZSh7XG4gICAgICBjdHg6IGN0eCxcbiAgICAgIHNyYzogc3RyZWFtU291cmNlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZnJhbWVyID0gbmV3IGxmby5vcGVyYXRvcnMuRnJhbWVyKHtcbiAgICAgIGZyYW1lU2l6ZTogMjU2LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZmZ0ID0gbmV3IGxmby5vcGVyYXRvcnMuRmZ0KHtcbiAgICAgIGZmdFNpemU6IDI1NixcbiAgICAgIHdpbmRvd05hbWU6ICdoYW5uJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHNwZWN0cm8gPSBuZXcgbGZvLnNpbmtzLlNwZWN0cm9ncmFtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NwZWN0cm9ncmFtJyksXG4gICAgICBzY2FsZTogMTAsXG4gICAgICBjb2xvcjogJyMxNmEwODUnLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Tb3VyY2UuY29ubmVjdChmcmFtZXIpO1xuICAgIGZyYW1lci5jb25uZWN0KGZmdCk7XG4gICAgZmZ0LmNvbm5lY3Qoc3BlY3Rybyk7XG4gICAgYXVkaW9Tb3VyY2Uuc3RhcnQoKTtcblxuICB9KCkpO1xuXG4gIC8qKlxuICAgKiB3YXZlZm9ybVxuICAgKi9cbiAgKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgYXVkaW9Tb3VyY2UgPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IG1pbk1heCA9IG5ldyBsZm8ub3BlcmF0b3JzLk1pbk1heCgpO1xuXG4gICAgY29uc3Qgd2F2ZWZvcm0gPSBuZXcgbGZvLnNpbmtzLldhdmVmb3JtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dhdmVmb3JtJyksXG4gICAgICBjb2xvcjogJyMyOTgwYjknLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Tb3VyY2UuY29ubmVjdChtaW5NYXgpO1xuICAgIG1pbk1heC5jb25uZWN0KHdhdmVmb3JtKTtcbiAgICBhdWRpb1NvdXJjZS5zdGFydCgpO1xuXG4gIH0oKSk7XG5cblxuICAvKipcbiAgICogc3luY2hyb25pemVkIGRyYXdcbiAgICovXG4gIChmdW5jdGlvbigpIHtcblxuICAgIGNvbnN0IGF1ZGlvSW4gPSBuZXcgbGZvLnNvdXJjZXMuQXVkaW9Jbk5vZGUoe1xuICAgICAgY3R4OiBjdHgsXG4gICAgICBzcmM6IHN0cmVhbVNvdXJjZSxcbiAgICB9KTtcblxuICAgIC8vIHdhdmVmb3JtIGJyYW5jaFxuICAgIGNvbnN0IG1pbk1heCA9IG5ldyBsZm8ub3BlcmF0b3JzLk1pbk1heCgpO1xuXG4gICAgY29uc3Qgd2F2ZWZvcm0gPSBuZXcgbGZvLnNpbmtzLldhdmVmb3JtKHtcbiAgICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N5bmNocm9uaXplZC13YXZlZm9ybScpLFxuICAgICAgY29sb3I6ICcjZjM5YzEyJyxcbiAgICB9KTtcblxuICAgIGF1ZGlvSW4uY29ubmVjdChtaW5NYXgpO1xuICAgIG1pbk1heC5jb25uZWN0KHdhdmVmb3JtKTtcblxuICAgIC8vIHJtcyBicmFuY2hcbiAgICBjb25zdCBybXMgPSBuZXcgbGZvLm9wZXJhdG9ycy5NYWduaXR1ZGUoe1xuICAgICAgbm9ybWFsaXplOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZm9ybWF0ID0gbmV3IGxmby5vcGVyYXRvcnMuT3BlcmF0b3Ioe1xuICAgICAgdHlwZTogJ3ZlY3RvcicsXG4gICAgICBmcmFtZVNpemU6IDIsXG4gICAgICBvblByb2Nlc3M6IGZ1bmN0aW9uKHRpbWUsIGluRnJhbWUsIG91dEZyYW1lKSB7XG4gICAgICAgIG91dEZyYW1lWzBdID0gaW5GcmFtZVswXTtcbiAgICAgICAgb3V0RnJhbWVbMV0gPSAtMSAqIGluRnJhbWVbMF07XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWFnbml0dWRlID0gbmV3IGxmby5zaW5rcy5XYXZlZm9ybSh7XG4gICAgICBjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzeW5jaHJvbml6ZWQtbWFnbml0dWRlJyksXG4gICAgICBjb2xvcjogJyNlNjdlMjInLFxuICAgIH0pO1xuXG4gICAgYXVkaW9Jbi5jb25uZWN0KHJtcyk7XG4gICAgcm1zLmNvbm5lY3QoZm9ybWF0KTtcbiAgICBmb3JtYXQuY29ubmVjdChtYWduaXR1ZGUpO1xuXG4gICAgbmV3IGxmby5zaW5rcy5TeW5jaHJvbml6ZWREcmF3KHdhdmVmb3JtLCBtYWduaXR1ZGUpO1xuXG4gICAgYXVkaW9Jbi5zdGFydCgpO1xuXG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIGJwZlxuICAgKi9cbiAgLy8gKGZ1bmN0aW9uKCkge1xuICAvLyAgIGNvbnN0IGZyYW1lVGltZSA9IDAuMTtcbiAgLy8gICBjb25zdCBmcmFtZVJhdGUgPSAxIC8gZnJhbWVUaW1lO1xuICAvLyAgIGNvbnN0IGZyYW1lU2l6ZSA9IDM7XG5cbiAgLy8gICBjb25zdCBldmVudEluID0gbmV3IGxmby5zb3VyY2VzLkV2ZW50SW4oe1xuICAvLyAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gIC8vICAgICBmcmFtZVNpemU6IGZyYW1lU2l6ZSxcbiAgLy8gICAgIHJlbGF0aXZlOiB0cnVlLFxuICAvLyAgIH0pO1xuXG4gIC8vICAgY29uc3QgYnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuICAvLyAgICAgcmFkaXVzOiAyLFxuICAvLyAgICAgbWluOiAwLFxuICAvLyAgICAgY2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnBmJyksXG4gIC8vICAgICBkdXJhdGlvbjogMixcbiAgLy8gICB9KTtcblxuICAvLyAgIGV2ZW50SW4uY29ubmVjdChicGYpO1xuICAvLyAgIGV2ZW50SW4uc3RhcnQoKTtcblxuICAvLyAgIChmdW5jdGlvbiBsb29wKCkge1xuICAvLyAgICAgY29uc3QgZnJhbWUgPSBbTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKV07XG4gIC8vICAgICBldmVudEluLnByb2Nlc3MobnVsbCwgZnJhbWUpO1xuICAvLyAgICAgc2V0VGltZW91dChsb29wLCBmcmFtZVRpbWUgKiAxMDAwKTtcbiAgLy8gICB9KCkpO1xuICAvLyB9KCkpO1xuXG4gIC8vIC8qKlxuICAvLyAgKiB0cmFjZVxuICAvLyAgKi9cbiAgLy8gKGZ1bmN0aW9uKCkge1xuICAvLyAgIGNvbnN0IGZyYW1lVGltZSA9IDAuMDU7XG4gIC8vICAgY29uc3QgZnJhbWVSYXRlID0gMSAvIGZyYW1lVGltZTtcbiAgLy8gICBjb25zdCBmcmFtZVNpemUgPSAzO1xuXG4gIC8vICAgY29uc3QgZXZlbnRJbiA9IG5ldyBsZm8uc291cmNlcy5FdmVudEluKHtcbiAgLy8gICAgIGZyYW1lUmF0ZTogZnJhbWVSYXRlLFxuICAvLyAgICAgZnJhbWVTaXplOiBmcmFtZVNpemUsXG4gIC8vICAgfSk7XG5cbiAgLy8gICBjb25zdCB0cmFjZSA9IG5ldyBsZm8uc2lua3MuVHJhY2Uoe1xuICAvLyAgICAgY29sb3JTY2hlbWU6ICdvcGFjaXR5JyxcbiAgLy8gICAgIGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RyYWNlJyksXG4gIC8vICAgICBkdXJhdGlvbjogNixcbiAgLy8gICB9KTtcblxuICAvLyAgIGV2ZW50SW4uY29ubmVjdCh0cmFjZSk7XG4gIC8vICAgZXZlbnRJbi5zdGFydCgpO1xuXG4gIC8vICAgbGV0IG1lYW4gPSAwO1xuICAvLyAgIGxldCByYW5nZSA9IDA7XG4gIC8vICAgbGV0IG9wYWNpdHkgPSAxO1xuICAvLyAgIGNvbnN0IFBJMiA9IDIgKiBNYXRoLlBJO1xuXG4gIC8vICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgLy8gICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgLy8gICAgIHZhciB0ID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQpIC8gMTAwMDtcbiAgLy8gICAgIG1lYW4gID0gMC4yICogTWF0aC5zaW4oMiAqIFBJMiAqIHQpO1xuICAvLyAgICAgcmFuZ2UgPSAwLjMgKiBNYXRoLnNpbigzICogUEkyICogdCkgLyAyICsgMC41O1xuICAvLyAgICAgb3BhY2l0eSA9ICgwLjcgKiBNYXRoLnNpbig0ICogUEkyICogdCkgLyAyICsgMC41KSArIDAuMztcblxuICAvLyAgICAgZXZlbnRJbi5wcm9jZXNzKG51bGwsIFttZWFuLCByYW5nZSwgb3BhY2l0eV0pO1xuXG4gIC8vICAgICBzZXRUaW1lb3V0KGxvb3AsIGZyYW1lVGltZSAqIDEwMDApO1xuICAvLyAgIH0oKSk7XG5cbiAgLy8gfSgpKTtcbn1cblxubmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0sIGluaXQsIGZ1bmN0aW9uKGVycikge1xuICBjb25zb2xlLmVycm9yKGVyci5zdGFjayk7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9hcnJheS9mcm9tXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ25cIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG5cbiAgICAgIF9PYmplY3QkZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94Mykge1xuICB2YXIgX2FnYWluID0gdHJ1ZTtcblxuICBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHtcbiAgICB2YXIgb2JqZWN0ID0gX3gsXG4gICAgICAgIHByb3BlcnR5ID0gX3gyLFxuICAgICAgICByZWNlaXZlciA9IF94MztcbiAgICBfYWdhaW4gPSBmYWxzZTtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgICB2YXIgZGVzYyA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfeCA9IHBhcmVudDtcbiAgICAgICAgX3gyID0gcHJvcGVydHk7XG4gICAgICAgIF94MyA9IHJlY2VpdmVyO1xuICAgICAgICBfYWdhaW4gPSB0cnVlO1xuICAgICAgICBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250aW51ZSBfZnVuY3Rpb247XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRjcmVhdGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGVcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX09iamVjdCRzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBfT2JqZWN0JGNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgX09iamVjdCRzZXRQcm90b3R5cGVPZiA/IF9PYmplY3Qkc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG5cbiAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3T2JqW1wiZGVmYXVsdFwiXSA9IG9iajtcbiAgICByZXR1cm4gbmV3T2JqO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLkFycmF5LmZyb207IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5hc3NpZ247IiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJC5jcmVhdGUoUCwgRCk7XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJC5zZXREZXNjKGl0LCBrZXksIGRlc2MpO1xufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkLmdldERlc2MoaXQsIGtleSk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LnNldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvJC5jb3JlJykuUHJvbWlzZTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTsiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59OyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGRvY3VtZW50ID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKHBhcmFtKXtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDID8gbmV3IEMocGFyYW0pIDogQyhwYXJhbSk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIGlmKElTX1BST1RPKShleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgLy8gd3JhcFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldEl0ZXJGbihpdGVyYWJsZSlcbiAgICAsIGYgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgaW5kZXggID0gMFxuICAgICwgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvcjtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgfSBlbHNlIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyApe1xuICAgIGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCIvLyBmYXN0IGFwcGx5LCBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59OyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoKGUpe1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYocmV0ICE9PSB1bmRlZmluZWQpYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgSXRlcmF0b3JzICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGdldFByb3RvICAgICAgID0gcmVxdWlyZSgnLi8kJykuZ2V0UHJvdG9cbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEJVR0dZICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpe1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihraW5kKXtcbiAgICBpZighQlVHR1kgJiYga2luZCBpbiBwcm90bylyZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVNcbiAgICAsIFZBTFVFU19CVUcgPSBmYWxzZVxuICAgICwgcHJvdG8gICAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCAkbmF0aXZlICAgID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCAkZGVmYXVsdCAgID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVClcbiAgICAsIG1ldGhvZHMsIGtleTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZigkbmF0aXZlKXtcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90bygkZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCFMSUJSQVJZICYmIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gICAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUyl7XG4gICAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gICAgfVxuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogICAgSVNfU0VUICAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTsiLCJ2YXIgSVRFUkFUT1IgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYywgc2tpcENsb3Npbmcpe1xuICBpZighc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlOyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBtYWNyb3Rhc2sgPSByZXF1aXJlKCcuLyQudGFzaycpLnNldFxuICAsIE9ic2VydmVyICA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyXG4gICwgcHJvY2VzcyAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBQcm9taXNlICAgPSBnbG9iYWwuUHJvbWlzZVxuICAsIGlzTm9kZSAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKShwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBoZWFkLCBsYXN0LCBub3RpZnk7XG5cbnZhciBmbHVzaCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwYXJlbnQsIGRvbWFpbiwgZm47XG4gIGlmKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKXtcbiAgICBwcm9jZXNzLmRvbWFpbiA9IG51bGw7XG4gICAgcGFyZW50LmV4aXQoKTtcbiAgfVxuICB3aGlsZShoZWFkKXtcbiAgICBkb21haW4gPSBoZWFkLmRvbWFpbjtcbiAgICBmbiAgICAgPSBoZWFkLmZuO1xuICAgIGlmKGRvbWFpbilkb21haW4uZW50ZXIoKTtcbiAgICBmbigpOyAvLyA8LSBjdXJyZW50bHkgd2UgdXNlIGl0IG9ubHkgZm9yIFByb21pc2UgLSB0cnkgLyBjYXRjaCBub3QgcmVxdWlyZWRcbiAgICBpZihkb21haW4pZG9tYWluLmV4aXQoKTtcbiAgICBoZWFkID0gaGVhZC5uZXh0O1xuICB9IGxhc3QgPSB1bmRlZmluZWQ7XG4gIGlmKHBhcmVudClwYXJlbnQuZW50ZXIoKTtcbn07XG5cbi8vIE5vZGUuanNcbmlmKGlzTm9kZSl7XG4gIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG4vLyBicm93c2VycyB3aXRoIE11dGF0aW9uT2JzZXJ2ZXJcbn0gZWxzZSBpZihPYnNlcnZlcil7XG4gIHZhciB0b2dnbGUgPSAxXG4gICAgLCBub2RlICAgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG5ldyBPYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9IC10b2dnbGU7XG4gIH07XG4vLyBlbnZpcm9ubWVudHMgd2l0aCBtYXliZSBub24tY29tcGxldGVseSBjb3JyZWN0LCBidXQgZXhpc3RlbnQgUHJvbWlzZVxufSBlbHNlIGlmKFByb21pc2UgJiYgUHJvbWlzZS5yZXNvbHZlKXtcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZsdXNoKTtcbiAgfTtcbi8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4vLyAtIHNldEltbWVkaWF0ZVxuLy8gLSBNZXNzYWdlQ2hhbm5lbFxuLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuLy8gLSBvbnJlYWR5c3RhdGVjaGFuZ2Vcbi8vIC0gc2V0VGltZW91dFxufSBlbHNlIHtcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgbWFjcm90YXNrLmNhbGwoZ2xvYmFsLCBmbHVzaCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNhcChmbil7XG4gIHZhciB0YXNrID0ge2ZuOiBmbiwgbmV4dDogdW5kZWZpbmVkLCBkb21haW46IGlzTm9kZSAmJiBwcm9jZXNzLmRvbWFpbn07XG4gIGlmKGxhc3QpbGFzdC5uZXh0ID0gdGFzaztcbiAgaWYoIWhlYWQpe1xuICAgIGhlYWQgPSB0YXNrO1xuICAgIG5vdGlmeSgpO1xuICB9IGxhc3QgPSB0YXNrO1xufTsiLCIvLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpO1xuXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgdmFyIGEgPSBPYmplY3QuYXNzaWduXG4gICAgLCBBID0ge31cbiAgICAsIEIgPSB7fVxuICAgICwgUyA9IFN5bWJvbCgpXG4gICAgLCBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oayl7IEJba10gPSBrOyB9KTtcbiAgcmV0dXJuIGEoe30sIEEpW1NdICE9IDcgfHwgT2JqZWN0LmtleXMoYSh7fSwgQikpLmpvaW4oJycpICE9IEs7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgICAgID0gdG9PYmplY3QodGFyZ2V0KVxuICAgICwgJCQgICAgPSBhcmd1bWVudHNcbiAgICAsICQkbGVuID0gJCQubGVuZ3RoXG4gICAgLCBpbmRleCA9IDFcbiAgICAsIGdldEtleXMgICAgPSAkLmdldEtleXNcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHNcbiAgICAsIGlzRW51bSAgICAgPSAkLmlzRW51bTtcbiAgd2hpbGUoJCRsZW4gPiBpbmRleCl7XG4gICAgdmFyIFMgICAgICA9IElPYmplY3QoJCRbaW5kZXgrK10pXG4gICAgICAsIGtleXMgICA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailpZihpc0VudW0uY2FsbChTLCBrZXkgPSBrZXlzW2orK10pKVRba2V5XSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn0gOiBPYmplY3QuYXNzaWduOyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCBjb3JlICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGZhaWxzICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5oaWRlJyk7IiwiLy8gNy4yLjkgU2FtZVZhbHVlKHgsIHkpXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5pcyB8fCBmdW5jdGlvbiBpcyh4LCB5KXtcbiAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XG59OyIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciBnZXREZXNjICA9IHJlcXVpcmUoJy4vJCcpLmdldERlc2NcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xudmFyIGNoZWNrID0gZnVuY3Rpb24oTywgcHJvdG8pe1xuICBhbk9iamVjdChPKTtcbiAgaWYoIWlzT2JqZWN0KHByb3RvKSAmJiBwcm90byAhPT0gbnVsbCl0aHJvdyBUeXBlRXJyb3IocHJvdG8gKyBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBmdW5jdGlvbih0ZXN0LCBidWdneSwgc2V0KXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBnZXREZXNjKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICBzZXQodGVzdCwgW10pO1xuICAgICAgICBidWdneSA9ICEodGVzdCBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKE8sIHByb3RvKXtcbiAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XG4gICAgICAgIHJldHVybiBPO1xuICAgICAgfTtcbiAgICB9KHt9LCBmYWxzZSkgOiB1bmRlZmluZWQpLFxuICBjaGVjazogY2hlY2tcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNvcmUgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpXG4gICwgU1BFQ0lFUyAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVkpe1xuICB2YXIgQyA9IGNvcmVbS0VZXTtcbiAgaWYoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkkLnNldERlc2MoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9XG4gIH0pO1xufTsiLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi8kJykuc2V0RGVzY1xuICAsIGhhcyA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpXG4gICwgU1BFQ0lFUyAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE8sIEQpe1xuICB2YXIgQyA9IGFuT2JqZWN0KE8pLmNvbnN0cnVjdG9yLCBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IEQgOiBhRnVuY3Rpb24oUyk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIGRlZmluZWQgICA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59OyIsInZhciBjdHggICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBpbnZva2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBodG1sICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaHRtbCcpXG4gICwgY2VsICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxuICAsIGNsZWFyVGFzayAgICAgICAgICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcbiAgLCBxdWV1ZSAgICAgICAgICAgICAgPSB7fVxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG52YXIgcnVuID0gZnVuY3Rpb24oKXtcbiAgdmFyIGlkID0gK3RoaXM7XG4gIGlmKHF1ZXVlLmhhc093blByb3BlcnR5KGlkKSl7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufTtcbnZhciBsaXN0bmVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn07XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZighc2V0VGFzayB8fCAhY2xlYXJUYXNrKXtcbiAgc2V0VGFzayA9IGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbil7XG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcbiAgICAgIGludm9rZSh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhclRhc2sgPSBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShpZCl7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmKHJlcXVpcmUoJy4vJC5jb2YnKShwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjdHgocnVuLCBpZCwgMSkpO1xuICAgIH07XG4gIC8vIEJyb3dzZXJzIHdpdGggTWVzc2FnZUNoYW5uZWwsIGluY2x1ZGVzIFdlYldvcmtlcnNcbiAgfSBlbHNlIGlmKE1lc3NhZ2VDaGFubmVsKXtcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZihnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiB0eXBlb2YgcG9zdE1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJyAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKGlkICsgJycsICcqJyk7XG4gICAgfTtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcbiAgLy8gSUU4LVxuICB9IGVsc2UgaWYoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0Jykpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuLmNhbGwoaWQpO1xuICAgICAgfTtcbiAgICB9O1xuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xuICB9IGVsc2Uge1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgc2V0VGltZW91dChjdHgocnVuLCBpZCwgMSksIDApO1xuICAgIH07XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6ICAgc2V0VGFzayxcbiAgY2xlYXI6IGNsZWFyVGFza1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vJC5pb2JqZWN0JylcbiAgLCBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59OyIsInZhciBzdG9yZSAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgU3ltYm9sID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLlN5bWJvbDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFN5bWJvbCAmJiBTeW1ib2xbbmFtZV0gfHwgKFN5bWJvbCB8fCB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRleHBvcnQgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChhcnJheUxpa2UpXG4gICAgICAsIEMgICAgICAgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5XG4gICAgICAsICQkICAgICAgPSBhcmd1bWVudHNcbiAgICAgICwgJCRsZW4gICA9ICQkLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gJCRsZW4gPiAxID8gJCRbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgJCRsZW4gPiAyID8gJCRbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLyQuYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuLyQub2JqZWN0LWFzc2lnbicpfSk7IiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0Jyk7XG4kZXhwb3J0KCRleHBvcnQuUywgJ09iamVjdCcsIHtzZXRQcm90b3R5cGVPZjogcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldH0pOyIsIiIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBMSUJSQVJZICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsIGdsb2JhbCAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjdHggICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2xhc3NvZiAgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCAkZXhwb3J0ICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgaXNPYmplY3QgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKVxuICAsIHN0cmljdE5ldyAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZm9yT2YgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNldFByb3RvICAgPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0XG4gICwgc2FtZSAgICAgICA9IHJlcXVpcmUoJy4vJC5zYW1lLXZhbHVlJylcbiAgLCBTUEVDSUVTICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJylcbiAgLCBzcGVjaWVzQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuLyQuc3BlY2llcy1jb25zdHJ1Y3RvcicpXG4gICwgYXNhcCAgICAgICA9IHJlcXVpcmUoJy4vJC5taWNyb3Rhc2snKVxuICAsIFBST01JU0UgICAgPSAnUHJvbWlzZSdcbiAgLCBwcm9jZXNzICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBpc05vZGUgICAgID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBQICAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgV3JhcHBlcjtcblxudmFyIHRlc3RSZXNvbHZlID0gZnVuY3Rpb24oc3ViKXtcbiAgdmFyIHRlc3QgPSBuZXcgUChmdW5jdGlvbigpe30pO1xuICBpZihzdWIpdGVzdC5jb25zdHJ1Y3RvciA9IE9iamVjdDtcbiAgcmV0dXJuIFAucmVzb2x2ZSh0ZXN0KSA9PT0gdGVzdDtcbn07XG5cbnZhciBVU0VfTkFUSVZFID0gZnVuY3Rpb24oKXtcbiAgdmFyIHdvcmtzID0gZmFsc2U7XG4gIGZ1bmN0aW9uIFAyKHgpe1xuICAgIHZhciBzZWxmID0gbmV3IFAoeCk7XG4gICAgc2V0UHJvdG8oc2VsZiwgUDIucHJvdG90eXBlKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuICB0cnkge1xuICAgIHdvcmtzID0gUCAmJiBQLnJlc29sdmUgJiYgdGVzdFJlc29sdmUoKTtcbiAgICBzZXRQcm90byhQMiwgUCk7XG4gICAgUDIucHJvdG90eXBlID0gJC5jcmVhdGUoUC5wcm90b3R5cGUsIHtjb25zdHJ1Y3Rvcjoge3ZhbHVlOiBQMn19KTtcbiAgICAvLyBhY3R1YWwgRmlyZWZveCBoYXMgYnJva2VuIHN1YmNsYXNzIHN1cHBvcnQsIHRlc3QgdGhhdFxuICAgIGlmKCEoUDIucmVzb2x2ZSg1KS50aGVuKGZ1bmN0aW9uKCl7fSkgaW5zdGFuY2VvZiBQMikpe1xuICAgICAgd29ya3MgPSBmYWxzZTtcbiAgICB9XG4gICAgLy8gYWN0dWFsIFY4IGJ1ZywgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxNjJcbiAgICBpZih3b3JrcyAmJiByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKSl7XG4gICAgICB2YXIgdGhlbmFibGVUaGVuR290dGVuID0gZmFsc2U7XG4gICAgICBQLnJlc29sdmUoJC5zZXREZXNjKHt9LCAndGhlbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyB0aGVuYWJsZVRoZW5Hb3R0ZW4gPSB0cnVlOyB9XG4gICAgICB9KSk7XG4gICAgICB3b3JrcyA9IHRoZW5hYmxlVGhlbkdvdHRlbjtcbiAgICB9XG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cbiAgcmV0dXJuIHdvcmtzO1xufSgpO1xuXG4vLyBoZWxwZXJzXG52YXIgc2FtZUNvbnN0cnVjdG9yID0gZnVuY3Rpb24oYSwgYil7XG4gIC8vIGxpYnJhcnkgd3JhcHBlciBzcGVjaWFsIGNhc2VcbiAgaWYoTElCUkFSWSAmJiBhID09PSBQICYmIGIgPT09IFdyYXBwZXIpcmV0dXJuIHRydWU7XG4gIHJldHVybiBzYW1lKGEsIGIpO1xufTtcbnZhciBnZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKEMpe1xuICB2YXIgUyA9IGFuT2JqZWN0KEMpW1NQRUNJRVNdO1xuICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcbn07XG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHRoZW47XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgdHlwZW9mICh0aGVuID0gaXQudGhlbikgPT0gJ2Z1bmN0aW9uJyA/IHRoZW4gOiBmYWxzZTtcbn07XG52YXIgUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbihDKXtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdGhpcy5wcm9taXNlID0gbmV3IEMoZnVuY3Rpb24oJCRyZXNvbHZlLCAkJHJlamVjdCl7XG4gICAgaWYocmVzb2x2ZSAhPT0gdW5kZWZpbmVkIHx8IHJlamVjdCAhPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcignQmFkIFByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICByZXNvbHZlID0gJCRyZXNvbHZlO1xuICAgIHJlamVjdCAgPSAkJHJlamVjdDtcbiAgfSk7XG4gIHRoaXMucmVzb2x2ZSA9IGFGdW5jdGlvbihyZXNvbHZlKSxcbiAgdGhpcy5yZWplY3QgID0gYUZ1bmN0aW9uKHJlamVjdClcbn07XG52YXIgcGVyZm9ybSA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIGV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4ge2Vycm9yOiBlfTtcbiAgfVxufTtcbnZhciBub3RpZnkgPSBmdW5jdGlvbihyZWNvcmQsIGlzUmVqZWN0KXtcbiAgaWYocmVjb3JkLm4pcmV0dXJuO1xuICByZWNvcmQubiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHJlY29yZC5jO1xuICBhc2FwKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHZhbHVlID0gcmVjb3JkLnZcbiAgICAgICwgb2sgICAgPSByZWNvcmQucyA9PSAxXG4gICAgICAsIGkgICAgID0gMDtcbiAgICB2YXIgcnVuID0gZnVuY3Rpb24ocmVhY3Rpb24pe1xuICAgICAgdmFyIGhhbmRsZXIgPSBvayA/IHJlYWN0aW9uLm9rIDogcmVhY3Rpb24uZmFpbFxuICAgICAgICAsIHJlc29sdmUgPSByZWFjdGlvbi5yZXNvbHZlXG4gICAgICAgICwgcmVqZWN0ICA9IHJlYWN0aW9uLnJlamVjdFxuICAgICAgICAsIHJlc3VsdCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgIGlmKCFvaylyZWNvcmQuaCA9IHRydWU7XG4gICAgICAgICAgcmVzdWx0ID0gaGFuZGxlciA9PT0gdHJ1ZSA/IHZhbHVlIDogaGFuZGxlcih2YWx1ZSk7XG4gICAgICAgICAgaWYocmVzdWx0ID09PSByZWFjdGlvbi5wcm9taXNlKXtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJlc3VsdCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJlc3VsdCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2UgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgcmVqZWN0KHZhbHVlKTtcbiAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpcnVuKGNoYWluW2krK10pOyAvLyB2YXJpYWJsZSBsZW5ndGggLSBjYW4ndCB1c2UgZm9yRWFjaFxuICAgIGNoYWluLmxlbmd0aCA9IDA7XG4gICAgcmVjb3JkLm4gPSBmYWxzZTtcbiAgICBpZihpc1JlamVjdClzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcHJvbWlzZSA9IHJlY29yZC5wXG4gICAgICAgICwgaGFuZGxlciwgY29uc29sZTtcbiAgICAgIGlmKGlzVW5oYW5kbGVkKHByb21pc2UpKXtcbiAgICAgICAgaWYoaXNOb2RlKXtcbiAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGlmKGhhbmRsZXIgPSBnbG9iYWwub251bmhhbmRsZWRyZWplY3Rpb24pe1xuICAgICAgICAgIGhhbmRsZXIoe3Byb21pc2U6IHByb21pc2UsIHJlYXNvbjogdmFsdWV9KTtcbiAgICAgICAgfSBlbHNlIGlmKChjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGUpICYmIGNvbnNvbGUuZXJyb3Ipe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSByZWNvcmQuYSA9IHVuZGVmaW5lZDtcbiAgICB9LCAxKTtcbiAgfSk7XG59O1xudmFyIGlzVW5oYW5kbGVkID0gZnVuY3Rpb24ocHJvbWlzZSl7XG4gIHZhciByZWNvcmQgPSBwcm9taXNlLl9kXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVhY3Rpb247XG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3Rpb24gPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0aW9uLmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0aW9uLnByb21pc2UpKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn07XG52YXIgJHJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXM7XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICByZWNvcmQudiA9IHZhbHVlO1xuICByZWNvcmQucyA9IDI7XG4gIHJlY29yZC5hID0gcmVjb3JkLmMuc2xpY2UoKTtcbiAgbm90aWZ5KHJlY29yZCwgdHJ1ZSk7XG59O1xudmFyICRyZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgdGhlbjtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHRyeSB7XG4gICAgaWYocmVjb3JkLnAgPT09IHZhbHVlKXRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICBhc2FwKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICRyZWplY3QuY2FsbCh3cmFwcGVyLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC52ID0gdmFsdWU7XG4gICAgICByZWNvcmQucyA9IDE7XG4gICAgICBub3RpZnkocmVjb3JkLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoKGUpe1xuICAgICRyZWplY3QuY2FsbCh7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGUpOyAvLyB3cmFwXG4gIH1cbn07XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighVVNFX05BVElWRSl7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gIFAgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKXtcbiAgICBhRnVuY3Rpb24oZXhlY3V0b3IpO1xuICAgIHZhciByZWNvcmQgPSB0aGlzLl9kID0ge1xuICAgICAgcDogc3RyaWN0TmV3KHRoaXMsIFAsIFBST01JU0UpLCAgICAgICAgIC8vIDwtIHByb21pc2VcbiAgICAgIGM6IFtdLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBhd2FpdGluZyByZWFjdGlvbnNcbiAgICAgIGE6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXG4gICAgICBkOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gZG9uZVxuICAgICAgdjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICBoOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cbiAgICAgIG46IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBub3RpZnlcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBleGVjdXRvcihjdHgoJHJlc29sdmUsIHJlY29yZCwgMSksIGN0eCgkcmVqZWN0LCByZWNvcmQsIDEpKTtcbiAgICB9IGNhdGNoKGVycil7XG4gICAgICAkcmVqZWN0LmNhbGwocmVjb3JkLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpKFAucHJvdG90eXBlLCB7XG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcbiAgICAgIHZhciByZWFjdGlvbiA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShzcGVjaWVzQ29uc3RydWN0b3IodGhpcywgUCkpXG4gICAgICAgICwgcHJvbWlzZSAgPSByZWFjdGlvbi5wcm9taXNlXG4gICAgICAgICwgcmVjb3JkICAgPSB0aGlzLl9kO1xuICAgICAgcmVhY3Rpb24ub2sgICA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlY29yZC5jLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYocmVjb3JkLmEpcmVjb3JkLmEucHVzaChyZWFjdGlvbik7XG4gICAgICBpZihyZWNvcmQucylub3RpZnkocmVjb3JkLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwge1Byb21pc2U6IFB9KTtcbnJlcXVpcmUoJy4vJC5zZXQtdG8tc3RyaW5nLXRhZycpKFAsIFBST01JU0UpO1xucmVxdWlyZSgnLi8kLnNldC1zcGVjaWVzJykoUFJPTUlTRSk7XG5XcmFwcGVyID0gcmVxdWlyZSgnLi8kLmNvcmUnKVtQUk9NSVNFXTtcblxuLy8gc3RhdGljc1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKXtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKVxuICAgICAgLCAkJHJlamVjdCAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgJCRyZWplY3Qocik7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCB0ZXN0UmVzb2x2ZSh0cnVlKSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XG4gICAgLy8gaW5zdGFuY2VvZiBpbnN0ZWFkIG9mIGludGVybmFsIHNsb3QgY2hlY2sgYmVjYXVzZSB3ZSBzaG91bGQgZml4IGl0IHdpdGhvdXQgcmVwbGFjZW1lbnQgbmF0aXZlIFByb21pc2UgY29yZVxuICAgIGlmKHggaW5zdGFuY2VvZiBQICYmIHNhbWVDb25zdHJ1Y3Rvcih4LmNvbnN0cnVjdG9yLCB0aGlzKSlyZXR1cm4geDtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKVxuICAgICAgLCAkJHJlc29sdmUgID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICQkcmVzb2x2ZSh4KTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIShVU0VfTkFUSVZFICYmIHJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpe1xuICBQLmFsbChpdGVyKVsnY2F0Y2gnXShmdW5jdGlvbigpe30pO1xufSkpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC4xIFByb21pc2UuYWxsKGl0ZXJhYmxlKVxuICBhbGw6IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSl7XG4gICAgdmFyIEMgICAgICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxuICAgICAgLCBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpXG4gICAgICAsIHJlc29sdmUgICAgPSBjYXBhYmlsaXR5LnJlc29sdmVcbiAgICAgICwgcmVqZWN0ICAgICA9IGNhcGFiaWxpdHkucmVqZWN0XG4gICAgICAsIHZhbHVlcyAgICAgPSBbXTtcbiAgICB2YXIgYWJydXB0ID0gcGVyZm9ybShmdW5jdGlvbigpe1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCB2YWx1ZXMucHVzaCwgdmFsdWVzKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcbiAgICAgIGlmKHJlbWFpbmluZykkLmVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcbiAgICAgICAgdmFyIGFscmVhZHlDYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIGlmKGFscmVhZHlDYWxsZWQpcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgICAgZWxzZSByZXNvbHZlKHJlc3VsdHMpO1xuICAgIH0pO1xuICAgIGlmKGFicnVwdClyZWplY3QoYWJydXB0LmVycm9yKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9LFxuICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXG4gIHJhY2U6IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgICAgID0gZ2V0Q29uc3RydWN0b3IodGhpcylcbiAgICAgICwgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgICAgLCByZWplY3QgICAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKGFicnVwdClyZWplY3QoYWJydXB0LmVycm9yKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7IiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpcy1hcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG52YXIgcm9vdFBhcmVudCA9IHt9XG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIER1ZSB0byB2YXJpb3VzIGJyb3dzZXIgYnVncywgc29tZXRpbWVzIHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24gd2lsbCBiZSB1c2VkIGV2ZW5cbiAqIHdoZW4gdGhlIGJyb3dzZXIgc3VwcG9ydHMgdHlwZWQgYXJyYXlzLlxuICpcbiAqIE5vdGU6XG4gKlxuICogICAtIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcyxcbiAqICAgICBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOC5cbiAqXG4gKiAgIC0gU2FmYXJpIDUtNyBsYWNrcyBzdXBwb3J0IGZvciBjaGFuZ2luZyB0aGUgYE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3JgIHByb3BlcnR5XG4gKiAgICAgb24gb2JqZWN0cy5cbiAqXG4gKiAgIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgIGluY29ycmVjdCBsZW5ndGggaW4gc29tZSBzaXR1YXRpb25zLlxuXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleVxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlQgIT09IHVuZGVmaW5lZFxuICA/IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gIDogdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIGZ1bmN0aW9uIEJhciAoKSB7fVxuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgYXJyLmNvbnN0cnVjdG9yID0gQmFyXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgYXJyLmNvbnN0cnVjdG9yID09PSBCYXIgJiYgLy8gY29uc3RydWN0b3IgY2FuIGJlIHNldFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBhcnIuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ga01heExlbmd0aCAoKSB7XG4gIHJldHVybiBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxufVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChhcmcpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAvLyBBdm9pZCBnb2luZyB0aHJvdWdoIGFuIEFyZ3VtZW50c0FkYXB0b3JUcmFtcG9saW5lIGluIHRoZSBjb21tb24gY2FzZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHJldHVybiBuZXcgQnVmZmVyKGFyZywgYXJndW1lbnRzWzFdKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZylcbiAgfVxuXG4gIHRoaXMubGVuZ3RoID0gMFxuICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZFxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gZnJvbU51bWJlcih0aGlzLCBhcmcpXG4gIH1cblxuICAvLyBTbGlnaHRseSBsZXNzIGNvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGlzLCBhcmcsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogJ3V0ZjgnKVxuICB9XG5cbiAgLy8gVW51c3VhbC5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhpcywgYXJnKVxufVxuXG5mdW5jdGlvbiBmcm9tTnVtYmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChsZW5ndGgpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIC8vIEFzc3VtcHRpb246IGJ5dGVMZW5ndGgoKSByZXR1cm4gdmFsdWUgaXMgYWx3YXlzIDwga01heExlbmd0aC5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG5cbiAgdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmplY3QpKSByZXR1cm4gZnJvbUJ1ZmZlcih0aGF0LCBvYmplY3QpXG5cbiAgaWYgKGlzQXJyYXkob2JqZWN0KSkgcmV0dXJuIGZyb21BcnJheSh0aGF0LCBvYmplY3QpXG5cbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzdGFydCB3aXRoIG51bWJlciwgYnVmZmVyLCBhcnJheSBvciBzdHJpbmcnKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAob2JqZWN0LmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gZnJvbVR5cGVkQXJyYXkodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgfVxuXG4gIGlmIChvYmplY3QubGVuZ3RoKSByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmplY3QpXG5cbiAgcmV0dXJuIGZyb21Kc29uT2JqZWN0KHRoYXQsIG9iamVjdClcbn1cblxuZnVuY3Rpb24gZnJvbUJ1ZmZlciAodGhhdCwgYnVmZmVyKSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGJ1ZmZlci5sZW5ndGgpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuICBidWZmZXIuY29weSh0aGF0LCAwLCAwLCBsZW5ndGgpXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8vIER1cGxpY2F0ZSBvZiBmcm9tQXJyYXkoKSB0byBrZWVwIGZyb21BcnJheSgpIG1vbm9tb3JwaGljLlxuZnVuY3Rpb24gZnJvbVR5cGVkQXJyYXkgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIC8vIFRydW5jYXRpbmcgdGhlIGVsZW1lbnRzIGlzIHByb2JhYmx5IG5vdCB3aGF0IHBlb3BsZSBleHBlY3QgZnJvbSB0eXBlZFxuICAvLyBhcnJheXMgd2l0aCBCWVRFU19QRVJfRUxFTUVOVCA+IDEgYnV0IGl0J3MgY29tcGF0aWJsZSB3aXRoIHRoZSBiZWhhdmlvclxuICAvLyBvZiB0aGUgb2xkIEJ1ZmZlciBjb25zdHJ1Y3Rvci5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXkpIHtcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYXJyYXkuYnl0ZUxlbmd0aFxuICAgIHRoYXQgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbVR5cGVkQXJyYXkodGhhdCwgbmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vLyBEZXNlcmlhbGl6ZSB7IHR5cGU6ICdCdWZmZXInLCBkYXRhOiBbMSwyLDMsLi4uXSB9IGludG8gYSBCdWZmZXIgb2JqZWN0LlxuLy8gUmV0dXJucyBhIHplcm8tbGVuZ3RoIGJ1ZmZlciBmb3IgaW5wdXRzIHRoYXQgZG9uJ3QgY29uZm9ybSB0byB0aGUgc3BlYy5cbmZ1bmN0aW9uIGZyb21Kc29uT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgdmFyIGFycmF5XG4gIHZhciBsZW5ndGggPSAwXG5cbiAgaWYgKG9iamVjdC50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iamVjdC5kYXRhKSkge1xuICAgIGFycmF5ID0gb2JqZWN0LmRhdGFcbiAgICBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIH1cbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcbn1cblxuZnVuY3Rpb24gYWxsb2NhdGUgKHRoYXQsIGxlbmd0aCkge1xuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQubGVuZ3RoID0gbGVuZ3RoXG4gICAgdGhhdC5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgZnJvbVBvb2wgPSBsZW5ndGggIT09IDAgJiYgbGVuZ3RoIDw9IEJ1ZmZlci5wb29sU2l6ZSA+Pj4gMVxuICBpZiAoZnJvbVBvb2wpIHRoYXQucGFyZW50ID0gcm9vdFBhcmVudFxuXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBrTWF4TGVuZ3RoYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNsb3dCdWZmZXIpKSByZXR1cm4gbmV3IFNsb3dCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcpXG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGRlbGV0ZSBidWYucGFyZW50XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIHZhciBpID0gMFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgYnJlYWtcblxuICAgICsraVxuICB9XG5cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignbGlzdCBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHN0cmluZyA9ICcnICsgc3RyaW5nXG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAvLyBEZXByZWNhdGVkXG4gICAgICBjYXNlICdyYXcnOlxuICAgICAgY2FzZSAncmF3cyc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0IHwgMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPT09IEluZmluaXR5ID8gdGhpcy5sZW5ndGggOiBlbmQgfCAwXG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcbiAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKGVuZCA8PSBzdGFydCkgcmV0dXJuICcnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYmluYXJ5U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiAwXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICBieXRlT2Zmc2V0ID4+PSAwXG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVybiAtMVxuXG4gIC8vIE5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gTWF0aC5tYXgodGhpcy5sZW5ndGggKyBieXRlT2Zmc2V0LCAwKVxuXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSByZXR1cm4gLTEgLy8gc3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcgYWx3YXlzIGZhaWxzXG4gICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YodGhpcywgWyB2YWwgXSwgYnl0ZU9mZnNldClcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yICh2YXIgaSA9IDA7IGJ5dGVPZmZzZXQgKyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyW2J5dGVPZmZzZXQgKyBpXSA9PT0gdmFsW2ZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4XSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbC5sZW5ndGgpIHJldHVybiBieXRlT2Zmc2V0ICsgZm91bmRJbmRleFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuLy8gYGdldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aCB8IDBcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld0J1Zi5sZW5ndGgpIG5ld0J1Zi5wYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gdmFsdWUgPCAwID8gMSA6IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRTdGFydClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gdmFsdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gdXRmOFRvQnl0ZXModmFsdWUudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpc1tpXSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gdG9BcnJheUJ1ZmZlciAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gX2F1Z21lbnQgKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IHNldCBtZXRob2QgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWRcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuZXF1YWxzID0gQlAuZXF1YWxzXG4gIGFyci5jb21wYXJlID0gQlAuY29tcGFyZVxuICBhcnIuaW5kZXhPZiA9IEJQLmluZGV4T2ZcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludExFID0gQlAucmVhZFVJbnRMRVxuICBhcnIucmVhZFVJbnRCRSA9IEJQLnJlYWRVSW50QkVcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50TEUgPSBCUC5yZWFkSW50TEVcbiAgYXJyLnJlYWRJbnRCRSA9IEJQLnJlYWRJbnRCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnRMRSA9IEJQLndyaXRlVUludExFXG4gIGFyci53cml0ZVVJbnRCRSA9IEJQLndyaXRlVUludEJFXG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnRMRSA9IEJQLndyaXRlSW50TEVcbiAgYXJyLndyaXRlSW50QkUgPSBCUC53cml0ZUludEJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiXG4vKipcbiAqIGlzQXJyYXlcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogdG9TdHJpbmdcbiAqL1xuXG52YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBXaGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gYHZhbGBcbiAqIGlzIGFuIGFycmF5LlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIGlzQXJyYXkoW10pO1xuICogICAgICAgIC8vID4gdHJ1ZVxuICogICAgICAgIGlzQXJyYXkoYXJndW1lbnRzKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKiAgICAgICAgaXNBcnJheSgnJyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICpcbiAqIEBwYXJhbSB7bWl4ZWR9IHZhbFxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gISEgdmFsICYmICdbb2JqZWN0IEFycmF5XScgPT0gc3RyLmNhbGwodmFsKTtcbn07XG4iLCJsZXQgaWQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9LCBkZWZhdWx0cyA9IHt9KSB7XG4gICAgdGhpcy5jaWQgPSBpZCsrO1xuICAgIHRoaXMucGFyYW1zID0ge307XG5cbiAgICB0aGlzLnN0cmVhbVBhcmFtcyA9IHtcbiAgICAgIGZyYW1lU2l6ZTogMSxcbiAgICAgIGZyYW1lUmF0ZTogMCxcbiAgICAgIHNvdXJjZVNhbXBsZVJhdGU6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICB9XG5cbiAgLy8gV2ViQXVkaW9BUEkgYGNvbm5lY3RgIGxpa2UgbWV0aG9kXG4gIGNvbm5lY3QoY2hpbGQpIHtcbiAgICBpZiAodGhpcy5zdHJlYW1QYXJhbXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGNvbm5lY3QgdG8gYSBkZWFkIGxmbyBub2RlJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuICB9XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgY3VycmVudCBub2RlIHN0cmVhbSBhbmQgcHJvcGFnYXRlIHRvIGl0J3MgY2hpbGRyZW5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIC8vIGRlZmF1bHRzIHRvIGluaGVyaXQgcGFyZW50J3Mgc3RyZWFtIHBhcmFtZXRlcnNcbiAgICAgIHRoaXMuc3RyZWFtUGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0cmVhbVBhcmFtcywgdGhpcy5wYXJlbnQuc3RyZWFtUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBlbnRyeSBwb2ludCBmb3Igc3RyZWFtIHBhcmFtcyBjb25maWd1cmF0aW9uIGluIGRlcml2ZWQgY2xhc3NcbiAgICB0aGlzLmNvbmZpZ3VyZVN0cmVhbSgpO1xuICAgIC8vIGNyZWF0ZSB0aGUgYG91dEZyYW1lYCBhcnJheUJ1ZmZlclxuICAgIHRoaXMuc2V0dXBTdHJlYW0oKTtcblxuICAgIC8vIHByb3BhZ2F0ZSBpbml0aWFsaXphdGlvbiBpbiBsZm8gY2hhaW5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuW2ldLmluaXRpYWxpemUoKTtcbiAgICB9XG4gIH1cblxuICAvLyBzb3VyY2VzIG9ubHlcbiAgLy8gc3RhcnQoKSB7XG4gIC8vICAgdGhpcy5pbml0aWFsaXplKCk7XG4gIC8vICAgdGhpcy5yZXNldCgpO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIG92ZXJyaWRlIGluaGVyaXRlZCBzdHJlYW1QYXJhbXMsIG9ubHkgaWYgc3BlY2lmaWVkIGluIGBwYXJhbXNgXG4gICAqL1xuICBjb25maWd1cmVTdHJlYW0oKSB7XG4gICAgaWYgKHRoaXMucGFyYW1zLmZyYW1lU2l6ZSkge1xuICAgICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhcmFtcy5mcmFtZVJhdGUpIHtcbiAgICAgIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZSA9IHRoaXMucGFyYW1zLmZyYW1lUmF0ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYXJhbXMuc291cmNlU2FtcGxlUmF0ZSkge1xuICAgICAgdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IHRoaXMucGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSB0aGUgb3V0cHV0RnJhbWUgYWNjb3JkaW5nIHRvIHRoZSBgc3RyZWFtUGFyYW1zYFxuICAgKiBATk9URSByZW1vdmUgY29tbWVudGVkIGNvZGUgP1xuICAgKi9cbiAgc2V0dXBTdHJlYW0oLyogb3B0cyA9IHt9ICovKSB7XG4gICAgLy8gaWYgKG9wdHMuZnJhbWVSYXRlKSB7IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZSA9IG9wdHMuZnJhbWVSYXRlOyB9XG4gICAgLy8gaWYgKG9wdHMuZnJhbWVTaXplKSB7IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IG9wdHMuZnJhbWVTaXplOyB9XG4gICAgLy8gaWYgKG9wdHMuc291cmNlU2FtcGxlUmF0ZSkgeyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlID0gb3B0cy5zb3VyY2VTYW1wbGVSYXRlOyB9XG4gICAgdGhpcy5vdXRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKTtcbiAgfVxuXG4gIC8vIHJlc2V0IGBvdXRGcmFtZWAgYW5kIGNhbGwgcmVzZXQgb24gY2hpbGRyZW5cbiAgcmVzZXQoKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5jaGlsZHJlbltpXS5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIHNpbmtzIGhhdmUgbm8gYG91dEZyYW1lYFxuICAgIGlmICghdGhpcy5vdXRGcmFtZSkgeyByZXR1cm4gfVxuXG4gICAgLy8gdGhpcy5vdXRGcmFtZS5maWxsKDApOyAvLyBwcm9iYWJseSBiZXR0ZXIgYnV0IGRvZXNuJ3Qgd29yayB5ZXRcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMub3V0RnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLm91dEZyYW1lW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyBmaWxsIHRoZSBvbi1nb2luZyBidWZmZXIgd2l0aCAwIChpcyBkb25lKVxuICAvLyBvdXRwdXQgaXQsIHRoZW4gY2FsbCByZXNldCBvbiBhbGwgdGhlIGNoaWxkcmVuIChzdXJlID8pXG4gIC8vIEBOT1RFOiBgcmVzZXRgIGlzIGNhbGxlZCBpbiBgc291cmNlcy5zdGFydGAsXG4gIC8vICBpZiBpcyBjYWxsZWQgaGVyZSwgaXQgd2lsbCBiZSBjYWxsZWQgbW9yZSB0aGFuIG9uY2UgaW4gYSBjaGlsZCBub2RlXG4gIC8vICBpcyB0aGlzIGEgcHJvYmxlbSA/XG4gIGZpbmFsaXplKCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baV0uZmluYWxpemUoKTtcbiAgICB9XG4gIH1cblxuICAvLyBmb3J3YXJkIHRoZSBjdXJyZW50IHN0YXRlICh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHRvIGFsbCB0aGUgY2hpbGRyZW5cbiAgb3V0cHV0KHRpbWUgPSB0aGlzLnRpbWUsIG91dEZyYW1lID0gdGhpcy5vdXRGcmFtZSwgbWV0YURhdGEgPSB0aGlzLm1ldGFEYXRhKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5jaGlsZHJlbltpXS5wcm9jZXNzKHRpbWUsIG91dEZyYW1lLCBtZXRhRGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLy8gbWFpbiBmdW5jdGlvbiB0byBvdmVycmlkZSwgZGVmYXVsdHMgdG8gbm9vcFxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHRoaXMudGltZSA9IHRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZSA9IGZyYW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIC8vIGNhbGwgYGRlc3Ryb3lgIGluIGFsbCBpdCdzIGNoaWxkcmVuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgdGhpcy5jaGlsZHJlbltpbmRleF0uZGVzdHJveSgpO1xuICAgIH1cblxuICAgIC8vIGRlbGV0ZSBpdHNlbGYgZnJvbSB0aGUgcGFyZW50IG5vZGVcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gIHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YodGhpcyk7XG4gICAgICB0aGlzLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgIC8vIGNhbm5vdCB1c2UgYSBkZWFkIG9iamVjdCBhcyBwYXJlbnRcbiAgICB0aGlzLnN0cmVhbVBhcmFtcyA9IG51bGw7XG5cbiAgICAvLyBjbGVhbiBpdCdzIG93biByZWZlcmVuY2VzIC8gZGlzY29ubmVjdCBhdWRpbyBub2RlcyBpZiBuZWVkZWRcbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgTEZPIG1vZHVsZTogYmlxdWFkIGZpbHRlci5cbiAqIEBhdXRob3IgSmVhbi1QaGlsaXBwZS5MYW1iZXJ0QGlyY2FtLmZyLCBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIHZpY3Rvci5zYWl6QGlyY2FtLmZyXG4gKiBAdmVyc2lvbiAwLjEuMFxuICpcbiAqIEBicmllZiAgQmlxdWFkIGZpbHRlciBhbmQgY29lZmZpY2llbnRzIGNhbGN1bGF0b3JcbiAqXG4gKiBCYXNlZCBvbiB0aGUgXCJDb29rYm9vayBmb3JtdWxhZSBmb3IgYXVkaW8gRVEgYmlxdWFkIGZpbHRlclxuICogY29lZmZpY2llbnRzXCIgYnkgUm9iZXJ0IEJyaXN0b3ctSm9obnNvblxuICpcbiAqL1xuXG4vKiB5KG4pID0gYjAgeChuKSArIGIxIHgobi0xKSArIGIyIHgobi0yKSAgKi9cbi8qICAgICAgICAgICAgICAgIC0gYTEgeChuLTEpIC0gYTIgeChuLTIpICAqL1xuXG4vKiBmMCBpcyBub3JtYWxpc2VkIGJ5IHRoZSBueXF1aXN0IGZyZXF1ZW5jeSAqL1xuLyogcSBtdXN0IGJlID4gMC4gKi9cbi8qIGdhaW4gbXVzdCBiZSA+IDAuIGFuZCBpcyBsaW5lYXIgKi9cblxuLyogd2hlbiB0aGVyZSBpcyBubyBnYWluIHBhcmFtZXRlciwgb25lIGNhbiBzaW1wbHkgbXVsdGlwbHkgdGhlIGJcbiAqIGNvZWZmaWNpZW50cyBieSBhIChsaW5lYXIpIGdhaW4gKi9cblxuLyogYTAgaXMgYWx3YXlzIDEuIGFzIGVhY2ggY29lZmZpY2llbnQgaXMgbm9ybWFsaXNlZCBieSBhMCwgaW5jbHVkaW5nIGEwICovXG5cbi8qIGExIGlzIGFbMF0gYW5kIGEyIGlzIGFbMV0gKi9cblxudmFyIEJhc2VMZm8gPSByZXF1aXJlKCcuLi9jb3JlL2Jhc2UtbGZvJyk7XG5cbnZhciBzaW4gPSBNYXRoLnNpbjtcbnZhciBjb3MgPSBNYXRoLmNvcztcbnZhciBNX1BJID0gTWF0aC5QSTtcbnZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuXG4vLyBjb2VmcyBjYWxjdWxhdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiBMUEY6IEgocykgPSAxIC8gKHNeMiArIHMvUSArIDEpICovXG5mdW5jdGlvbiBsb3dwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICgoMS4wIC0gYykgKiAwLjUpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICgxLjAgLSBjKSAqIGEwX2ludjtcbiAgY29lZnMuYjIgPSBjb2Vmcy5iMDtcbn1cblxuICAvKiBIUEY6IEgocykgPSBzXjIgLyAoc14yICsgcy9RICsgMSkgKi9cbmZ1bmN0aW9uIGhpZ2hwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICgoMS4wICsgYykgKiAwLjUpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICgtMS4wIC0gYykgKiBhMF9pbnY7XG4gIGNvZWZzLmIyID0gY29lZnMuYjA7XG59XG5cbi8qIEJQRjogSChzKSA9IHMgLyAoc14yICsgcy9RICsgMSkgIChjb25zdGFudCBza2lydCBnYWluLCBwZWFrIGdhaW4gPSBRKSAqL1xuZnVuY3Rpb24gYmFuZHBhc3NfY29uc3RhbnRfc2tpcnRfY29lZnMoZjAsIHEsIGNvZWZzKSB7XG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIHMgPSBzaW4odzApO1xuICB2YXIgYWxwaGEgPSBzIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAocyAqIDAuNSkgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gMC4wO1xuICBjb2Vmcy5iMiA9IC1jb2Vmcy5iMDtcbn1cblxuLyogQlBGOiBIKHMpID0gKHMvUSkgLyAoc14yICsgcy9RICsgMSkgICAgICAoY29uc3RhbnQgMCBkQiBwZWFrIGdhaW4pICovXG5mdW5jdGlvbiBiYW5kcGFzc19jb25zdGFudF9wZWFrX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9IGFscGhhICogYTBfaW52O1xuICBjb2Vmcy5iMSA9IDAuMDtcbiAgY29lZnMuYjIgPSAtY29lZnMuYjA7XG59XG5cbi8qIG5vdGNoOiBIKHMpID0gKHNeMiArIDEpIC8gKHNeMiArIHMvUSArIDEpICovXG5mdW5jdGlvbiBub3RjaF9jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSBhMF9pbnY7XG4gIGNvZWZzLmIxID0gY29lZnMuYTE7XG4gIGNvZWZzLmIyID0gY29lZnMuYjA7XG59XG5cbi8qIEFQRjogSChzKSA9IChzXjIgLSBzL1EgKyAxKSAvIChzXjIgKyBzL1EgKyAxKSAqL1xuZnVuY3Rpb24gYWxscGFzc19jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSBjb2Vmcy5hMjtcbiAgY29lZnMuYjEgPSBjb2Vmcy5hMTtcbiAgY29lZnMuYjIgPSAxLjA7XG59XG5cbi8qIHBlYWtpbmdFUTogSChzKSA9IChzXjIgKyBzKihBL1EpICsgMSkgLyAoc14yICsgcy8oQSpRKSArIDEpICovXG4vKiBBID0gc3FydCggMTBeKGRCZ2Fpbi8yMCkgKSA9IDEwXihkQmdhaW4vNDApICovXG4vKiBnYWluIGlzIGxpbmVhciBoZXJlICovXG5mdW5jdGlvbiBwZWFraW5nX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcykge1xuICB2YXIgZyA9IHNxcnQoZ2Fpbik7XG4gIHZhciBnX2ludiA9IDEuMCAvIGc7XG5cbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSAqIGdfaW52KTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhICogZ19pbnYpICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKDEuMCArIGFscGhhICogZykgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gY29lZnMuYTE7XG4gIGNvZWZzLmIyID0gKDEuMCAtIGFscGhhICogZykgKiBhMF9pbnY7XG59XG5cbi8qIGxvd1NoZWxmOiBIKHMpID0gQSAqIChzXjIgKyAoc3FydChBKS9RKSpzICsgQSkvKEEqc14yICsgKHNxcnQoQSkvUSkqcyArIDEpICovXG4vKiBBID0gc3FydCggMTBeKGRCZ2Fpbi8yMCkgKSA9IDEwXihkQmdhaW4vNDApICovXG4vKiBnYWluIGlzIGxpbmVhciBoZXJlICovXG5mdW5jdGlvbiBsb3dzaGVsZl9jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpIHtcbiAgdmFyIGcgPSBzcXJ0KGdhaW4pO1xuXG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhXzJfc3FydGcgPSBzaW4odzApICogc3FydChnKSAvIHEgO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICggKGcrMS4wKSArIChnLTEuMCkgKiBjICsgYWxwaGFfMl9zcXJ0Zyk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqICAgICAoIChnLTEuMCkgKyAoZysxLjApICogYyAgICAgICAgICAgICAgICApICkgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKCAgICAgICAgICAgICAoZysxLjApICsgKGctMS4wKSAqIGMgLSBhbHBoYV8yX3NxcnRnICApICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKCAgICAgICBnICogKCAoZysxLjApIC0gKGctMS4wKSAqIGMgKyBhbHBoYV8yX3NxcnRnKSApICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICggMi4wICogZyAqICggKGctMS4wKSAtIChnKzEuMCkgKiBjICAgICAgICAgICAgICAgICkgKSAqIGEwX2ludjtcbiAgY29lZnMuYjIgPSAoICAgICAgIGcgKiAoIChnKzEuMCkgLSAoZy0xLjApICogYyAtIGFscGhhXzJfc3FydGcpICkgKiBhMF9pbnY7XG59XG5cbi8qIGhpZ2hTaGVsZjogSChzKSA9IEEgKiAoQSpzXjIgKyAoc3FydChBKS9RKSpzICsgMSkvKHNeMiArIChzcXJ0KEEpL1EpKnMgKyBBKSAqL1xuLyogQSA9IHNxcnQoIDEwXihkQmdhaW4vMjApICkgPSAxMF4oZEJnYWluLzQwKSAqL1xuLyogZ2FpbiBpcyBsaW5lYXIgaGVyZSAqL1xuZnVuY3Rpb24gaGlnaHNoZWxmX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcykge1xuICB2YXIgZyA9IHNxcnQoZ2Fpbik7XG5cbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGFfMl9zcXJ0ZyA9IHNpbih3MCkgKiBzcXJ0KGcpIC8gcSA7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKCAoZysxLjApIC0gKGctMS4wKSAqIGMgKyBhbHBoYV8yX3NxcnRnKTtcblxuICBjb2Vmcy5hMSA9ICggMi4wICogICAgICggKGctMS4wKSAtIChnKzEuMCkgKiBjICAgICAgICAgICAgICAgICkgKSAqIGEwX2ludjtcbiAgY29lZnMuYTIgPSAoICAgICAgICAgICAgIChnKzEuMCkgLSAoZy0xLjApICogYyAtIGFscGhhXzJfc3FydGcgICkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAoICAgICAgZyAqICggIChnKzEuMCkgKyAoZy0xLjApICogYyArIGFscGhhXzJfc3FydGcpICkgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gKC0yLjAgKiBnICogKCAoZy0xLjApICsgKGcrMS4wKSAqIGMgICAgICAgICAgICAgICAgKSApICogYTBfaW52O1xuICBjb2Vmcy5iMiA9ICggICAgICBnICogKCAgKGcrMS4wKSArIChnLTEuMCkgKiBjIC0gYWxwaGFfMl9zcXJ0ZykgKSAqIGEwX2ludjtcbn1cblxuICAvKiBoZWxwZXIgKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvZWZzKHR5cGUsIGYwLCBxLCBnYWluLCBjb2Vmcykge1xuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSAnbG93cGFzcyc6XG4gICAgICBsb3dwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hpZ2hwYXNzJzpcbiAgICAgIGhpZ2hwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3NraXJ0JzpcbiAgICAgIGJhbmRwYXNzX2NvbnN0YW50X3NraXJ0X2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3BlYWsnOlxuICAgICAgYmFuZHBhc3NfY29uc3RhbnRfcGVha19jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdub3RjaCc6XG4gICAgICBub3RjaF9jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGxwYXNzJzpcbiAgICAgIGFsbHBhc3NfY29lZnMoZjAsIHEsIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncGVha2luZyc6XG4gICAgICBwZWFraW5nX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2xvd3NoZWxmJzpcbiAgICAgIGxvd3NoZWxmX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hpZ2hzaGVsZic6XG4gICAgICBoaWdoc2hlbGZfY29lZnMoZjAsIHEsIGdhaW4sIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gYXBwbHkgZ2FpblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdsb3dwYXNzJzpcbiAgICBjYXNlICdoaWdocGFzcyc6XG4gICAgY2FzZSAnYmFuZHBhc3NfY29uc3RhbnRfc2tpcnQnOlxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3BlYWsnOlxuICAgIGNhc2UgJ25vdGNoJzpcbiAgICBjYXNlICdhbGxwYXNzJzpcbiAgICAgIGlmIChnYWluICE9IDEuMCkge1xuICAgICAgICBjb2Vmcy5iMCAqPSBnYWluO1xuICAgICAgICBjb2Vmcy5iMSAqPSBnYWluO1xuICAgICAgICBjb2Vmcy5iMiAqPSBnYWluO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgLyogZ2FpbiBpcyBhbHJlYWR5IGludGVncmF0ZWQgZm9yIHRoZSBmb2xsb3dpbmcgKi9cbiAgICBjYXNlICdwZWFraW5nJzpcbiAgICBjYXNlICdsb3dzaGVsZic6XG4gICAgY2FzZSAnaGlnaHNoZWxmJzpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qIGRpcmVjdCBmb3JtIEkgKi9cbi8qIGEwID0gMSwgYTEgPSBhWzBdLCBhMiA9IGFbMV0gKi9cbi8qIDQgc3RhdGVzIChpbiB0aGF0IG9yZGVyKTogeChuLTEpLCB4KG4tMiksIHkobi0xKSwgeShuLTIpICAqL1xuZnVuY3Rpb24gYmlxdWFkQXJyYXlEZjEoY29lZnMsIHN0YXRlLCBpbkZyYW1lLCBvdXRGcmFtZSwgc2l6ZSkge1xuICBmb3IobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgdmFyIHkgPSBjb2Vmcy5iMCAqIGluRnJhbWVbaV1cbiAgICAgICAgICArIGNvZWZzLmIxICogc3RhdGUueG5fMVtpXSArIGNvZWZzLmIyICogc3RhdGUueG5fMltpXVxuICAgICAgICAgIC0gY29lZnMuYTEgKiBzdGF0ZS55bl8xW2ldIC0gY29lZnMuYTIgKiBzdGF0ZS55bl8yW2ldO1xuXG4gICAgb3V0RnJhbWVbaV0gPSB5O1xuXG4gICAgLy8gdXBkYXRlIHN0YXRlc1xuICAgIHN0YXRlLnhuXzJbaV0gPSBzdGF0ZS54bl8xW2ldO1xuICAgIHN0YXRlLnhuXzFbaV0gPSBpbkZyYW1lW2ldO1xuXG4gICAgc3RhdGUueW5fMltpXSA9IHN0YXRlLnluXzFbaV07XG4gICAgc3RhdGUueW5fMVtpXSA9IHk7XG4gIH1cbn1cblxuLyogdHJhbnNwb3NlZCBkaXJlY3QgZm9ybSBJSSAqL1xuLyogYTAgPSAxLCBhMSA9IGFbMF0sIGEyID0gYVsxXSAqL1xuLyogMiBzdGF0ZXMgKi9cbmZ1bmN0aW9uIGJpcXVhZEFycmF5RGYyKGNvZWZzLCBzdGF0ZSwgaW5GcmFtZSwgb3V0RnJhbWUsIHNpemUpIHtcbiAgZm9yKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIG91dEZyYW1lW2ldID0gY29lZnMuYjAgKiBpbkZyYW1lW2ldICsgc3RhdGUueG5fMVtpXTtcblxuICAgIC8vIHVwZGF0ZSBzdGF0ZXNcbiAgICBzdGF0ZS54bl8xW2ldID0gY29lZnMuYjEgKiBpbkZyYW1lW2ldIC0gY29lZnMuYTFbaV0gKiBvdXRGcmFtZVtpXSArIHN0YXRlLnhuXzJbaV07XG4gICAgc3RhdGUueG5fMltpXSA9IGNvZWZzLmIyICogaW5GcmFtZVtpXSAtIGNvZWZzLmEyW2ldICogb3V0RnJhbWVbaV07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmlxdWFkIGV4dGVuZHMgQmFzZUxmbyB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIGZpbHRlclR5cGU6J2xvd3Bhc3MnLFxuICAgICAgZjA6IDEuMCxcbiAgICAgIGdhaW46IDEuMCxcbiAgICAgIHE6IDEuMFxuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG4gICAgLy8gdGhpcy50eXBlID0gJ2JpcXVhZCc7XG5cbiAgICAvLyBmcm9tIGhlcmUgb24gb3B0aW9ucyBpcyB0aGlzLnBhcmFtc1xuXG4gICAgLy8gdG8gaW1wbGVtZW50XG4gICAgLy8gaWYob3B0cy5kYW1wKSDigKZcbiAgICAvLyBpZihvcHRzLmRlY2F5KSDigKZcbiAgICAvLyBpZihvcHRzLm92ZXIpIOKAplxuXG4gICAgLy8gdmFyIGZyYW1lUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZTtcbiAgICAvLyAvLyBpZiBubyBmcmFtZVJhdGUgb3IgZnJhbWVyYXRlIGlzIDAgd2Ugc2hhbGwgaGFsdCFcbiAgICAvLyBpZiAoIWZyYW1lUmF0ZSB8fCBmcmFtZVJhdGUgPD0gMCkge1xuICAgIC8vICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIE9wZXJhdG9yIHJlcXVpcmVzIGEgZnJhbWVSYXRlIGhpZ2hlciB0aGFuIDAuJyk7XG4gICAgLy8gfVxuXG4gICAgLy8gdmFyIG5vcm1GMCA9IHRoaXMucGFyYW1zLmYwIC8gZnJhbWVSYXRlLFxuICAgIC8vICAgICBnYWluID0gdGhpcy5wYXJhbXMuZ2FpbixcbiAgICAvLyAgICAgcTtcblxuICAgIC8vIGlmICh0aGlzLnBhcmFtcy5xKSAgeyBxID0gdGhpcy5wYXJhbXMucTsgfVxuICAgIC8vIGlmICh0aGlzLnBhcmFtcy5idykgeyBxID0gdGhpcy5wYXJhbXMuZjAgLyB0aGlzLnBhcmFtcy5idzsgfVxuXG4gICAgLy8gdGhpcy5jb2VmcyA9IHtcbiAgICAvLyAgIGIwOiAwLFxuICAgIC8vICAgYjE6IDAsXG4gICAgLy8gICBiMjogMCxcbiAgICAvLyAgIGExOiAwLFxuICAgIC8vICAgYTI6IDBcbiAgICAvLyB9O1xuXG4gICAgLy8gdmFyIGZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcbiAgICAvLyB0aGlzLnN0YXRlID0ge1xuICAgIC8vICAgeG5fMTogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgIC8vICAgeG5fMjogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgIC8vICAgeW5fMTogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgIC8vICAgeW5fMjogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpXG4gICAgLy8gfTtcblxuICAgIC8vIGNhbGN1bGF0ZUNvZWZzKHRoaXMucGFyYW1zLmZpbHRlclR5cGUsIG5vcm1GMCwgcSwgZ2FpbiwgdGhpcy5jb2Vmcyk7XG4gICAgLy8gdGhpcy5zZXR1cFN0cmVhbSgpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG5cbiAgICB2YXIgZnJhbWVSYXRlID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlO1xuICAgIC8vIGlmIG5vIGZyYW1lUmF0ZSBvciBmcmFtZXJhdGUgaXMgMCB3ZSBzaGFsbCBoYWx0IVxuICAgIGlmICghZnJhbWVSYXRlIHx8IGZyYW1lUmF0ZSA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgT3BlcmF0b3IgcmVxdWlyZXMgYSBmcmFtZVJhdGUgaGlnaGVyIHRoYW4gMC4nKTtcbiAgICB9XG5cbiAgICB2YXIgbm9ybUYwID0gdGhpcy5wYXJhbXMuZjAgLyBmcmFtZVJhdGUsXG4gICAgICAgIGdhaW4gPSB0aGlzLnBhcmFtcy5nYWluLFxuICAgICAgICBxO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLnEpICB7IHEgPSB0aGlzLnBhcmFtcy5xOyB9XG4gICAgaWYgKHRoaXMucGFyYW1zLmJ3KSB7IHEgPSB0aGlzLnBhcmFtcy5mMCAvIHRoaXMucGFyYW1zLmJ3OyB9XG5cbiAgICB0aGlzLmNvZWZzID0ge1xuICAgICAgYjA6IDAsXG4gICAgICBiMTogMCxcbiAgICAgIGIyOiAwLFxuICAgICAgYTE6IDAsXG4gICAgICBhMjogMFxuICAgIH07XG5cbiAgICB2YXIgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB4bl8xOiBuZXcgRmxvYXQzMkFycmF5KGZyYW1lU2l6ZSksXG4gICAgICB4bl8yOiBuZXcgRmxvYXQzMkFycmF5KGZyYW1lU2l6ZSksXG4gICAgICB5bl8xOiBuZXcgRmxvYXQzMkFycmF5KGZyYW1lU2l6ZSksXG4gICAgICB5bl8yOiBuZXcgRmxvYXQzMkFycmF5KGZyYW1lU2l6ZSlcbiAgICB9O1xuXG4gICAgY2FsY3VsYXRlQ29lZnModGhpcy5wYXJhbXMuZmlsdGVyVHlwZSwgbm9ybUYwLCBxLCBnYWluLCB0aGlzLmNvZWZzKTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgYmlxdWFkQXJyYXlEZjEodGhpcy5jb2VmcywgdGhpcy5zdGF0ZSwgZnJhbWUsIHRoaXMub3V0RnJhbWUsIGZyYW1lLmxlbmd0aCk7XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5vdXRGcmFtZSk7XG4gICAgdGhpcy5vdXRwdXQodGltZSwgdGhpcy5vdXRGcmFtZSwgbWV0YURhdGEpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCBqc2ZmdCBmcm9tICdqc2ZmdCc7XG5pbXBvcnQgY29tcGxleEFycmF5IGZyb20gJ2pzZmZ0L2xpYi9jb21wbGV4X2FycmF5JztcbmltcG9ydCBpbml0V2luZG93IGZyb20gJy4uL3V0aWxzL2ZmdC13aW5kb3dzJztcblxuXG4vLyBjb25zdCBQSSAgID0gTWF0aC5QSTtcbi8vIGNvbnN0IGNvcyAgPSBNYXRoLmNvcztcbi8vIGNvbnN0IHNpbiAgPSBNYXRoLnNpbjtcbmNvbnN0IHNxcnQgPSBNYXRoLnNxcnQ7XG5cbmNvbnN0IGlzUG93ZXJPZlR3byA9IGZ1bmN0aW9uKG51bWJlcikge1xuICB3aGlsZSAoKG51bWJlciAlIDIgPT09IDApICYmIG51bWJlciA+IDEpIHtcbiAgICBudW1iZXIgPSBudW1iZXIgLyAyO1xuICB9XG5cbiAgcmV0dXJuIG51bWJlciA9PT0gMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmZ0IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIGZmdFNpemU6IDEwMjQsXG4gICAgICB3aW5kb3dOYW1lOiAnaGFubicsXG4gICAgICBvdXRUeXBlOiAnbWFnbml0dWRlJ1xuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cbiAgICBpZiAoIWlzUG93ZXJPZlR3byh0aGlzLnBhcmFtcy5mZnRTaXplKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmZnRTaXplIG11c3QgYmUgYSBwb3dlciBvZiB0d28nKTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcblxuICAgIGNvbnN0IGluRnJhbWVTaXplID0gdGhpcy5wYXJlbnQuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcbiAgICBjb25zdCBmZnRTaXplID0gdGhpcy5wYXJhbXMuZmZ0U2l6ZTtcbiAgICAvLyBrZWVwIG9mIHRoZSB3aW5kb3cgc2l6ZSB0byBiZSBhcHBsaWVkXG4gICAgdGhpcy5hcHBsaWVkV2luZG93U2l6ZSA9IGluRnJhbWVTaXplIDwgZmZ0U2l6ZSA/IGluRnJhbWVTaXplIDogZmZ0U2l6ZTtcbiAgICAvLyByZWZlcmVuY2VzIHRvIHBvcHVsYXRlIGluIHdpbmRvdyBmdW5jdGlvbnNcbiAgICB0aGlzLm5vcm1hbGl6ZUNvZWZzID0geyBsaW5lYXI6IDAsIHBvd2VyOiAwIH07XG4gICAgdGhpcy53aW5kb3cgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuYXBwbGllZFdpbmRvd1NpemUpO1xuICAgIC8vIGluaXQgdGhlIGNvbXBsZXggYXJyYXkgdG8gcmV1c2UgZm9yIHRoZSBGRlRcbiAgICB0aGlzLmNvbXBsZXhGcmFtZSA9IG5ldyBjb21wbGV4QXJyYXkuQ29tcGxleEFycmF5KGZmdFNpemUpO1xuXG4gICAgaW5pdFdpbmRvdyhcbiAgICAgIHRoaXMucGFyYW1zLndpbmRvd05hbWUsXG4gICAgICB0aGlzLndpbmRvdywgLy8gYnVmZmVyIHRvIHBvcHVsYXRlIHdpdGggdGhlIHdpbmRvd1xuICAgICAgdGhpcy5hcHBsaWVkV2luZG93U2l6ZSwgLy8gYnVmZmVyLmxlbmd0aFxuICAgICAgdGhpcy5ub3JtYWxpemVDb2VmcyAvLyBhbiBvYmplY3QgdG8gcG9wdWxhdGUgd2l0aCB0aGUgbm9ybWFsaXphdGlvbiBjb2Vmc1xuICAgICk7XG5cbiAgICAvLyBBcnJheUJ1ZmZlcnMgdG8gcmV1c2UgaW4gcHJvY2Vzc1xuICAgIHRoaXMud2luZG93ZWRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmZ0U2l6ZSk7XG4gIH1cblxuICBjb25maWd1cmVTdHJlYW0oKSB7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZmZ0U2l6ZSAvIDIgKyAxO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZSBmaXJzdCBjYWxsIG9mIHRoaXMgbWV0aG9kIGNhbiBiZSBxdWl0ZSBsb25nICh+NG1zKSxcbiAgICogdGhlIHN1YnNlcXVlbnQgb25lcyBhcmUgZmFzdGVyICh+MC41bXMpIGZvciBmZnRTaXplID0gMTAyNFxuICAgKi9cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCBpbkZyYW1lU2l6ZSA9IHRoaXMucGFyZW50LnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG4gICAgY29uc3Qgb3V0RnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IHNhbXBsZVJhdGUgPSB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlO1xuICAgIGNvbnN0IGZmdFNpemUgPSB0aGlzLnBhcmFtcy5mZnRTaXplO1xuICAgIC8vIGNsaXAgZnJhbWUgaWYgYmlnZ2VyIHRoYW4gZmZ0U2l6ZVxuICAgIGZyYW1lID0gKGluRnJhbWVTaXplID4gZmZ0U2l6ZSkgPyBmcmFtZS5zdWJhcnJheSgwLCBmZnRTaXplKSA6IGZyYW1lO1xuXG4gICAgLy8gYXBwbHkgd2luZG93IG9uIGZyYW1lXG4gICAgLy8gPT4gYHRoaXMud2luZG93YCBhbmQgYGZyYW1lYCBoYXZlIHRoZSBzYW1lIGxlbmd0aFxuICAgIC8vID0+IGlmIGB0aGlzLndpbmRvd2VkRnJhbWVgIGlzIGJpZ2dlciwgaXQncyBmaWxsZWQgd2l0aCB6ZXJvXG4gICAgLy8gYW5kIHdpbmRvdyBkb24ndCBhcHBseSB0aGVyZVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hcHBsaWVkV2luZG93U2l6ZTsgaSsrKSB7XG4gICAgICB0aGlzLndpbmRvd2VkRnJhbWVbaV0gPSBmcmFtZVtpXSAqIHRoaXMud2luZG93W2ldO1xuICAgIH1cblxuICAgIC8vIEZGVFxuICAgIC8vIHRoaXMuY29tcGxleEZyYW1lID0gbmV3IGNvbXBsZXhBcnJheS5Db21wbGV4QXJyYXkoZmZ0U2l6ZSk7XG4gICAgLy8gcmV1c2UgdGhlIHNhbWUgY29tcGxleEZyYW1lXG4gICAgdGhpcy5jb21wbGV4RnJhbWUubWFwKCh2YWx1ZSwgaSkgPT4ge1xuICAgICAgdmFsdWUucmVhbCA9IHRoaXMud2luZG93ZWRGcmFtZVtpXTtcbiAgICAgIHZhbHVlLmltYWcgPSAwO1xuICAgIH0pO1xuXG4gICAgY29uc3QgY29tcGxleFNwZWN0cnVtID0gdGhpcy5jb21wbGV4RnJhbWUuRkZUKCk7XG4gICAgY29uc3Qgc2NhbGUgPSAxIC8gZmZ0U2l6ZTtcbiAgICAvLyBEQyBpbmRleFxuICAgIGNvbnN0IHJlYWxEYyA9IGNvbXBsZXhTcGVjdHJ1bS5yZWFsWzBdO1xuICAgIGNvbnN0IGltYWdEYyA9IGNvbXBsZXhTcGVjdHJ1bS5pbWFnWzBdO1xuICAgIHRoaXMub3V0RnJhbWVbMF0gPSAocmVhbERjICogcmVhbERjICsgaW1hZ0RjICogaW1hZ0RjKSAqIHNjYWxlO1xuICAgIC8vIE5xdXlzdCBpbmRleFxuICAgIGNvbnN0IHJlYWxOeSA9IGNvbXBsZXhTcGVjdHJ1bS5yZWFsW2ZmdFNpemUgLyAyXTtcbiAgICBjb25zdCBpbWFnTnkgPSBjb21wbGV4U3BlY3RydW0uaW1hZ1tmZnRTaXplIC8gMl07XG4gICAgdGhpcy5vdXRGcmFtZVtmZnRTaXplIC8gMl0gPSAocmVhbE55ICogcmVhbE55ICsgaW1hZ055ICogaW1hZ055KSAqIHNjYWxlO1xuXG4gICAgLy8gcG93ZXIgc3BlY3RydW1cbiAgICBmb3IgKGxldCBpID0gMSwgaiA9IGZmdFNpemUgLSAxOyBpIDwgZmZ0U2l6ZSAvIDI7IGkrKywgai0tKSB7XG4gICAgICBjb25zdCByZWFsID0gY29tcGxleFNwZWN0cnVtLnJlYWxbaV0gKyBjb21wbGV4U3BlY3RydW0ucmVhbFtqXTtcbiAgICAgIGNvbnN0IGltYWcgPSBjb21wbGV4U3BlY3RydW0uaW1hZ1tpXSAtIGNvbXBsZXhTcGVjdHJ1bS5pbWFnW2pdO1xuXG4gICAgICB0aGlzLm91dEZyYW1lW2ldID0gKHJlYWwgKiByZWFsICsgaW1hZyAqIGltYWcpICogc2NhbGU7XG4gICAgfVxuXG4gICAgLy8gbWFnbml0dWRlIHNwZWN0cnVtXG4gICAgLy8gQE5PVEUgbWF5YmUgY2hlY2sgaG93IHRvIHJlbW92ZSB0aGlzIGxvb3AgcHJvcGVybHlcbiAgICBpZiAodGhpcy5wYXJhbXMub3V0VHlwZSA9PT0gJ21hZ25pdHVkZScpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0RnJhbWVTaXplOyBpKyspIHtcbiAgICAgICAgdGhpcy5vdXRGcmFtZVtpXSA9IHNxcnQodGhpcy5vdXRGcmFtZVtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQE5PVEUgd2hhdCBzaGFsbCB3ZSBkbyB3aXRoIGB0aGlzLm5vcm1hbGl6ZUNvZWZzYCA/XG4gICAgLy8gdGltZSBpcyBjZW50ZXJlZCBvbiB0aGUgZnJhbWUgP1xuICAgIHRoaXMudGltZSA9IHRpbWUgKyAoaW5GcmFtZVNpemUgLyBzYW1wbGVSYXRlIC8gMik7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG5cblxuXG5cblxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhbWVyIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICBmcmFtZVNpemU6IDUxMixcbiAgICAgIGNlbnRlcmVkVGltZVRhZzogZmFsc2VcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5mcmFtZUluZGV4ID0gMDtcbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICAvLyBkZWZhdWx0cyB0byBgaG9wU2l6ZWAgPT09IGBmcmFtZVNpemVgXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5ob3BTaXplKSB7XG4gICAgICB0aGlzLnBhcmFtcy5ob3BTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuICAgIH1cblxuICAgIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcbiAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVJhdGUgPSB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlIC8gdGhpcy5wYXJhbXMuaG9wU2l6ZTtcbiAgfVxuXG4gIC8vIEBOT1RFIG11c3QgYmUgdGVzdGVkXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZnJhbWVJbmRleCA9IDA7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIC8vIEBOT1RFIHdoYXQgYWJvdXQgdGltZSA/XG4gICAgLy8gZmlsbCB0aGUgb25nb2luZyBidWZmZXIgd2l0aCAwXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuZnJhbWVJbmRleCwgbCA9IHRoaXMub3V0RnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLm91dEZyYW1lW2ldID0gMDtcbiAgICB9XG4gICAgLy8gb3V0cHV0IGl0XG4gICAgdGhpcy5vdXRwdXQoKTtcblxuICAgIHN1cGVyLmZpbmFsaXplKCk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGJsb2NrLCBtZXRhRGF0YSkge1xuICAgIHZhciBzYW1wbGVSYXRlID0gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZTtcbiAgICB2YXIgc2FtcGxlUGVyaW9kID0gMSAvIHNhbXBsZVJhdGU7XG5cbiAgICB2YXIgZnJhbWVJbmRleCA9IHRoaXMuZnJhbWVJbmRleDtcbiAgICB2YXIgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIHZhciBibG9ja1NpemUgPSBibG9jay5sZW5ndGg7XG4gICAgdmFyIGJsb2NrSW5kZXggPSAwO1xuICAgIHZhciBob3BTaXplID0gdGhpcy5wYXJhbXMuaG9wU2l6ZTtcblxuICAgIHZhciBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG5cbiAgICB3aGlsZSAoYmxvY2tJbmRleCA8IGJsb2NrU2l6ZSkge1xuICAgICAgdmFyIG51bVNraXAgPSAwO1xuXG4gICAgICAvLyBza2lwIGJsb2NrIHNhbXBsZXMgZm9yIG5lZ2F0aXZlIGZyYW1lSW5kZXhcbiAgICAgIGlmIChmcmFtZUluZGV4IDwgMCkge1xuICAgICAgICBudW1Ta2lwID0gLWZyYW1lSW5kZXg7XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1Ta2lwIDwgYmxvY2tTaXplKSB7XG4gICAgICAgIGJsb2NrSW5kZXggKz0gbnVtU2tpcDsgLy8gc2tpcCBibG9jayBzZWdtZW50XG4gICAgICAgIC8vIGNhbiBjb3B5IGFsbCB0aGUgcmVzdCBvZiB0aGUgaW5jb21pbmcgYmxvY2tcbiAgICAgICAgdmFyIG51bUNvcHkgPSBibG9ja1NpemUgLSBibG9ja0luZGV4O1xuICAgICAgICAvLyBjb25ub3QgY29weSBtb3JlIHRoYW4gd2hhdCBmaXRzIGludG8gdGhlIGZyYW1lXG4gICAgICAgIHZhciBtYXhDb3B5ID0gZnJhbWVTaXplIC0gZnJhbWVJbmRleDtcblxuICAgICAgICBpZiAobnVtQ29weSA+PSBtYXhDb3B5KSB7XG4gICAgICAgICAgbnVtQ29weSA9IG1heENvcHk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb3B5IGJsb2NrIHNlZ21lbnQgaW50byBmcmFtZVxuICAgICAgICB2YXIgY29weSA9IGJsb2NrLnN1YmFycmF5KGJsb2NrSW5kZXgsIGJsb2NrSW5kZXggKyBudW1Db3B5KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYmxvY2tJbmRleCwgZnJhbWVJbmRleCwgbnVtQ29weSk7XG4gICAgICAgIG91dEZyYW1lLnNldChjb3B5LCBmcmFtZUluZGV4KTtcblxuICAgICAgICAvLyBhZHZhbmNlIGJsb2NrIGFuZCBmcmFtZSBpbmRleFxuICAgICAgICBibG9ja0luZGV4ICs9IG51bUNvcHk7XG4gICAgICAgIGZyYW1lSW5kZXggKz0gbnVtQ29weTtcblxuICAgICAgICAvLyBzZW5kIGZyYW1lIHdoZW4gY29tcGxldGVkXG4gICAgICAgIGlmIChmcmFtZUluZGV4ID09PSBmcmFtZVNpemUpIHtcbiAgICAgICAgICAvLyBkZWZpbmUgdGltZSB0YWcgZm9yIHRoZSBvdXRGcmFtZSBhY2NvcmRpbmcgdG8gY29uZmlndXJhdGlvblxuICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5jZW50ZXJlZFRpbWVUYWcpIHtcbiAgICAgICAgICAgIHRoaXMudGltZSA9IHRpbWUgKyAoYmxvY2tJbmRleCAtIGZyYW1lU2l6ZSAvIDIpICogc2FtcGxlUGVyaW9kO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSB0aW1lICsgKGJsb2NrSW5kZXggLSBmcmFtZVNpemUpICogc2FtcGxlUGVyaW9kO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGZvcndhcmQgbWV0YURhdGEgP1xuICAgICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgICAgICAgIC8vIGZvcndhcmQgdG8gbmV4dCBub2Rlc1xuICAgICAgICAgIHRoaXMub3V0cHV0KCk7XG5cbiAgICAgICAgICAvLyBzaGlmdCBmcmFtZSBsZWZ0XG4gICAgICAgICAgaWYgKGhvcFNpemUgPCBmcmFtZVNpemUpIHtcbiAgICAgICAgICAgIG91dEZyYW1lLnNldChvdXRGcmFtZS5zdWJhcnJheShob3BTaXplLCBmcmFtZVNpemUpLCAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmcmFtZUluZGV4IC09IGhvcFNpemU7IC8vIGhvcCBmb3J3YXJkXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNraXAgZW50aXJlIGJsb2NrXG4gICAgICAgIHZhciBibG9ja1Jlc3QgPSBibG9ja1NpemUgLSBibG9ja0luZGV4O1xuICAgICAgICBmcmFtZUluZGV4ICs9IGJsb2NrUmVzdDtcbiAgICAgICAgYmxvY2tJbmRleCArPSBibG9ja1Jlc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mcmFtZUluZGV4ID0gZnJhbWVJbmRleDtcbiAgfVxufVxuIiwiXG5pbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFnbml0dWRlIGV4dGVuZHMgQmFzZUxmbyB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgbm9ybWFsaXplOiBmYWxzZVxuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG4gIH1cblxuICBjb25maWd1cmVTdHJlYW0oKSB7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gMTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgY29uc3QgZnJhbWVTaXplID0gZnJhbWUubGVuZ3RoO1xuICAgIGxldCBzdW0gPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZVNpemU7IGkrKykge1xuICAgICAgc3VtICs9IChmcmFtZVtpXSAqIGZyYW1lW2ldKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYXJhbXMubm9ybWFsaXplKSB7XG4gICAgICAvLyBzdW0gaXMgYSBtZWFuIGhlcmUgKGZvciBybXMpXG4gICAgICBzdW0gLz0gZnJhbWVTaXplO1xuICAgIH1cblxuICAgIHRoaXMudGltZSA9IHRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZVswXSA9IE1hdGguc3FydChzdW0pO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBmcm9tIGVhY2ggZnJhbWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluTWF4IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHt9O1xuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSAyO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBsZXQgbWluID0gK0luZmluaXR5O1xuICAgIGxldCBtYXggPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgdmFsdWUgPSBmcmFtZVtpXTtcbiAgICAgIGlmICh2YWx1ZSA8IG1pbikgeyBtaW4gPSB2YWx1ZTsgfVxuICAgICAgaWYgKHZhbHVlID4gbWF4KSB7IG1heCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm91dEZyYW1lWzBdID0gbWluO1xuICAgIHRoaXMub3V0RnJhbWVbMV0gPSBtYXg7XG4gICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cblxuLy8gTk9URVM6XG4vLyAtIGFkZCAnc3ltZXRyaWNhbCcgb3B0aW9uIChob3cgdG8gZGVhbCB3aXRoIHZhbHVlcyBiZXR3ZWVuIGZyYW1lcyA/KSA/XG4vLyAtIGNhbiB3ZSBpbXByb3ZlIGFsZ29yaXRobSBpbXBsZW1lbnRhdGlvbiA/XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZpbmdBdmVyYWdlIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIG9yZGVyOiAxMDBcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgdGhpcy5xdWV1ZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIpO1xuICB9XG5cbiAgLy8gc3RyZWFtUGFyYW1zIHNob3VsZCBub3QgY2hhbmdlIGZyb20gcGFyZW50XG5cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5xdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMucXVldWVbaV0gPSAwO1xuICAgIH1cblxuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG4gICAgY29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IG9yZGVyID0gdGhpcy5wYXJhbXMub3JkZXI7XG4gICAgY29uc3QgcHVzaEluZGV4ID0gdGhpcy5wYXJhbXMub3JkZXIgLSAxO1xuICAgIGxldCBkaXZpc29yO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZVNpemU7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudCA9IGZyYW1lW2ldO1xuXG4gICAgICAvLyBpcyB0aGlzIG5lY2Vzc2FyeSwgb3IgaXMgaXQgb3ZlcmhlYWQgP1xuICAgICAgaWYgKHRoaXMuY291bnRlciA8IG9yZGVyKSB7XG4gICAgICAgIHRoaXMuY291bnRlciArPSAxO1xuICAgICAgICBkaXZpc29yID0gdGhpcy5jb3VudGVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGl2aXNvciA9IG9yZGVyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN1bSAtPSB0aGlzLnF1ZXVlWzBdO1xuICAgICAgdGhpcy5zdW0gKz0gY3VycmVudDtcbiAgICAgIG91dEZyYW1lW2ldID0gdGhpcy5zdW0gLyBkaXZpc29yO1xuICAgICAgLy8gb3V0RnJhbWVbaV0gPSB0aGlzLnN1bSAvIG9yZGVyO1xuXG4gICAgICAvLyBtYWludGFpbiBzdGFja1xuICAgICAgdGhpcy5xdWV1ZS5zZXQodGhpcy5xdWV1ZS5zdWJhcnJheSgxKSwgMCk7XG4gICAgICB0aGlzLnF1ZXVlW3B1c2hJbmRleF0gPSBjdXJyZW50O1xuICAgIH1cblxuICAgIHRoaXMub3V0cHV0KHRpbWUsIG91dEZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmluZ01lZGlhbiBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBvcmRlcjogOSxcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLm9yZGVyICUgMiA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvcmRlciBtdXN0IGJlIGFuIG9kZCBudW1iZXInKTtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBhcmFtcy5vcmRlcik7XG4gICAgdGhpcy5zb3J0ZXIgPSBbXTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHN1cGVyLnJlc2V0KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMucXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLnF1ZXVlW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGNvbnN0IG91dEZyYW1lID0gdGhpcy5vdXRGcmFtZTtcbiAgICBjb25zdCBmcmFtZVNpemUgPSBmcmFtZS5sZW5ndGg7XG4gICAgY29uc3Qgb3JkZXIgPSB0aGlzLnBhcmFtcy5vcmRlcjtcbiAgICBjb25zdCBwdXNoSW5kZXggPSB0aGlzLnBhcmFtcy5vcmRlciAtIDE7XG4gICAgY29uc3QgbWVkaWFuSW5kZXggPSBNYXRoLmZsb29yKG9yZGVyIC8gMik7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyYW1lU2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gZnJhbWVbaV07XG4gICAgICAvLyB1cGRhdGUgcXVldWVcbiAgICAgIHRoaXMucXVldWUuc2V0KHRoaXMucXVldWUuc3ViYXJyYXkoMSksIDApO1xuICAgICAgdGhpcy5xdWV1ZVtwdXNoSW5kZXhdID0gY3VycmVudDtcbiAgICAgIC8vIGdldCBtZWRpYW5cbiAgICAgIHRoaXMuc29ydGVyID0gQXJyYXkuZnJvbSh0aGlzLnF1ZXVlLnZhbHVlcygpKTtcbiAgICAgIHRoaXMuc29ydGVyLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcblxuICAgICAgb3V0RnJhbWVbaV0gPSB0aGlzLnNvcnRlclttZWRpYW5JbmRleF07XG4gICAgfVxuXG4gICAgdGhpcy5vdXRwdXQodGltZSwgb3V0RnJhbWUsIG1ldGFEYXRhKTtcbiAgfVxufSIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqIGEgTm9PcCBMZm9cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9vcCBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucywge30pO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB0aGlzLm91dEZyYW1lLnNldChmcmFtZSwgMCk7XG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuLyoqXG4gKiBhcHBseSBhIGdpdmVuIGZ1bmN0aW9uIG9uIGVhY2ggZnJhbWVcbiAqXG4gKiBAU0lHTkFUVVJFIHNjYWxhciBjYWxsYmFja1xuICogZnVuY3Rpb24odmFsdWUsIGluZGV4LCBmcmFtZSkge1xuICogICByZXR1cm4gZG9Tb21ldGhpbmcodmFsdWUpXG4gKiB9XG4gKlxuICogQFNJR05BVFVSRSB2ZWN0b3IgY2FsbGJhY2tcbiAqIGZ1bmN0aW9uKHRpbWUsIGluRnJhbWUsIG91dEZyYW1lKSB7XG4gKiAgIG91dEZyYW1lLnNldChpbkZyYW1lLCAwKTtcbiAqICAgcmV0dXJuIHRpbWUgKyAxO1xuICogfVxuICpcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlTGZvIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucywge30pO1xuXG4gICAgdGhpcy5wYXJhbXMudHlwZSA9IHRoaXMucGFyYW1zLnR5cGUgfHzCoCdzY2FsYXInO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLm9uUHJvY2Vzcykge1xuICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMucGFyYW1zLm9uUHJvY2Vzcy5iaW5kKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICBpZiAodGhpcy5wYXJhbXMudHlwZSA9PT0gJ3ZlY3RvcicgJiYgdGhpcy5wYXJhbXMuZnJhbWVTaXplKSB7XG4gICAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICAvLyBhcHBseSB0aGUgY2FsbGJhY2sgdG8gdGhlIGZyYW1lXG4gICAgaWYgKHRoaXMucGFyYW1zLnR5cGUgPT09ICd2ZWN0b3InKSB7XG4gICAgICB2YXIgb3V0VGltZSA9IHRoaXMuY2FsbGJhY2sodGltZSwgZnJhbWUsIHRoaXMub3V0RnJhbWUpO1xuXG4gICAgICBpZiAob3V0VGltZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRpbWUgPSBvdXRUaW1lO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLm91dEZyYW1lW2ldID0gdGhpcy5jYWxsYmFjayhmcmFtZVtpXSwgaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbmNvbnN0IHdvcmtlciA9IGBcbnZhciBpc0luZmluaXRlQnVmZmVyID0gZmFsc2U7XG52YXIgc3RhY2sgPSBbXTtcbnZhciBidWZmZXI7XG52YXIgYnVmZmVyTGVuZ3RoO1xudmFyIGN1cnJlbnRJbmRleDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXJMZW5ndGgpO1xuICBzdGFjay5sZW5ndGggPSAwO1xuICBjdXJyZW50SW5kZXggPSAwO1xufVxuXG5mdW5jdGlvbiBhcHBlbmQoYmxvY2spIHtcbiAgdmFyIGF2YWlsYWJsZVNwYWNlID0gYnVmZmVyTGVuZ3RoIC0gY3VycmVudEluZGV4O1xuICB2YXIgY3VycmVudEJsb2NrO1xuICAvLyByZXR1cm4gaWYgYWxyZWFkeSBmdWxsXG4gIGlmIChhdmFpbGFibGVTcGFjZSA8PSAwKSB7IHJldHVybjsgfVxuXG4gIGlmIChhdmFpbGFibGVTcGFjZSA8IGJsb2NrLmxlbmd0aCkge1xuICAgIGN1cnJlbnRCbG9jayA9IGJsb2NrLnN1YmFycmF5KDAsIGF2YWlsYWJsZVNwYWNlKTtcbiAgfSBlbHNlIHtcbiAgICBjdXJyZW50QmxvY2sgPSBibG9jaztcbiAgfVxuXG4gIGJ1ZmZlci5zZXQoY3VycmVudEJsb2NrLCBjdXJyZW50SW5kZXgpO1xuICBjdXJyZW50SW5kZXggKz0gY3VycmVudEJsb2NrLmxlbmd0aDtcblxuICBpZiAoaXNJbmZpbml0ZUJ1ZmZlciAmJiBjdXJyZW50SW5kZXggPT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBzdGFjay5wdXNoKGJ1ZmZlcik7XG5cbiAgICBjdXJyZW50QmxvY2sgPSBibG9jay5zdWJhcnJheShhdmFpbGFibGVTcGFjZSk7XG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIubGVuZ3RoKTtcbiAgICBidWZmZXIuc2V0KGN1cnJlbnRCbG9jaywgMCk7XG4gICAgY3VycmVudEluZGV4ID0gY3VycmVudEJsb2NrLmxlbmd0aDtcbiAgfVxufVxuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihlKSB7XG4gIHN3aXRjaCAoZS5kYXRhLmNvbW1hbmQpIHtcbiAgICBjYXNlICdpbml0JzpcbiAgICAgIGlmIChpc0Zpbml0ZShlLmRhdGEuZHVyYXRpb24pKSB7XG4gICAgICAgIGJ1ZmZlckxlbmd0aCA9IGUuZGF0YS5zYW1wbGVSYXRlICogZS5kYXRhLmR1cmF0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNJbmZpbml0ZUJ1ZmZlciA9IHRydWU7XG4gICAgICAgIGJ1ZmZlckxlbmd0aCA9IGUuZGF0YS5zYW1wbGVSYXRlICogMTA7XG4gICAgICB9XG5cbiAgICAgIGluaXQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncHJvY2Vzcyc6XG4gICAgICB2YXIgYmxvY2sgPSBuZXcgRmxvYXQzMkFycmF5KGUuZGF0YS5idWZmZXIpO1xuICAgICAgYXBwZW5kKGJsb2NrKTtcblxuICAgICAgLy8gaWYgdGhlIGJ1ZmZlciBpcyBmdWxsIHJldHVybiBpdCwgb25seSB3b3JrcyB3aXRoIGZpbml0ZSBidWZmZXJzXG4gICAgICBpZiAoIWlzSW5maW5pdGVCdWZmZXIgJiYgY3VycmVudEluZGV4ID09PSBidWZmZXJMZW5ndGgpIHtcbiAgICAgICAgdmFyIGJ1ZiA9IGJ1ZmZlci5idWZmZXIuc2xpY2UoMCk7XG4gICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBidWZmZXI6IGJ1ZiB9LCBbYnVmXSk7XG4gICAgICAgIGluaXQoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZmluYWxpemUnOlxuICAgICAgaWYgKCFpc0luZmluaXRlQnVmZmVyKSB7XG4gICAgICAgIC8vIEBUT0RPIGFkZCBvcHRpb24gdG8gbm90IGNsaXAgdGhlIHJldHVybmVkIGJ1ZmZlclxuICAgICAgICAvLyB2YWx1ZXMgaW4gRkxvYXQzMkFycmF5IGFyZSA0IGJ5dGVzIGxvbmcgKDMyIC8gOClcbiAgICAgICAgdmFyIGNvcHkgPSBidWZmZXIuYnVmZmVyLnNsaWNlKDAsIGN1cnJlbnRJbmRleCAqICgzMiAvIDgpKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGJ1ZmZlcjogY29weSB9LCBbY29weV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNvcHkgPSBuZXcgRmxvYXQzMkFycmF5KHN0YWNrLmxlbmd0aCAqIGJ1ZmZlckxlbmd0aCArIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIHN0YWNrLmZvckVhY2goZnVuY3Rpb24oYnVmZmVyLCBpbmRleCkge1xuICAgICAgICAgIGNvcHkuc2V0KGJ1ZmZlciwgYnVmZmVyTGVuZ3RoICogaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb3B5LnNldChidWZmZXIuc3ViYXJyYXkoMCwgY3VycmVudEluZGV4KSwgc3RhY2subGVuZ3RoICogYnVmZmVyTGVuZ3RoKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGJ1ZmZlcjogY29weS5idWZmZXIgfSwgW2NvcHkuYnVmZmVyXSk7XG4gICAgICB9XG4gICAgICBpbml0KCk7XG4gICAgICBicmVhaztcbiAgfVxufSwgZmFsc2UpYDtcblxubGV0IGF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBSZWNvcmQgYW4gYXVkaW8gc3RyZWFtXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvUmVjb3JkZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgZHVyYXRpb246IDEwLCAvLyBzZWNvbmRzXG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgICB0aGlzLm1ldGFEYXRhID0ge307XG5cbiAgICAvLyBuZWVkZWQgdG8gcmV0cml2ZSBhbiBBdWRpb0J1ZmZlclxuICAgIGlmICghdGhpcy5wYXJhbXMuY3R4KSB7XG4gICAgICBpZiAoIWF1ZGlvQ29udGV4dCkgeyBhdWRpb0NvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpOyB9XG4gICAgICB0aGlzLmN0eCA9IGF1ZGlvQ29udGV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdHggPSB0aGlzLnBhcmFtcy5jdHg7XG4gICAgfVxuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgICAvLyBwcm9wYWdhdGUgYHN0cmVhbVBhcmFtc2AgdG8gdGhlIHdvcmtlclxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIGNvbW1hbmQ6ICdpbml0JyxcbiAgICAgIGR1cmF0aW9uOiB0aGlzLnBhcmFtcy5kdXJhdGlvbixcbiAgICAgIHNhbXBsZVJhdGU6IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGVcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX2lzU3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuZmluYWxpemUoKTtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIGBzdG9wYCBpcyB0cmlnZ2VyZWQgb24gdGhlIHNvdXJjZVxuICBmaW5hbGl6ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhcnRlZCkgeyByZXR1cm47IH0gLy8gZG9uJ3QgZmluYWxpemUgaWYgbm90IHN0YXJ0ZWRcbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdmaW5hbGl6ZScgfSk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSB7IHJldHVybjsgfVxuICAgIC8vIGB0aGlzLm91dEZyYW1lYCBtdXN0IGJlIHJlY3JlYXRlZCBlYWNoIHRpbWUgYmVjYXVzZVxuICAgIC8vIGl0IGlzIGNvcGllZCBpbiB0aGUgd29ya2VyIGFuZCBsb3N0IGZvciB0aGlzIGNvbnRleHRcbiAgICB0aGlzLm91dEZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShmcmFtZSk7XG5cbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLm91dEZyYW1lLmJ1ZmZlcjtcbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdwcm9jZXNzJywgYnVmZmVyOiBidWZmZXIgfSwgW2J1ZmZlcl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIHJldHJpZXZlIHRoZSBjcmVhdGVkIGF1ZGlvQnVmZmVyXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICByZXRyaWV2ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoZSkgPT4ge1xuICAgICAgICAvLyBpZiBjYWxsZWQgd2hlbiBidWZmZXIgaXMgZnVsbCwgc3RvcCB0aGUgcmVjb3JkZXIgdG9vXG4gICAgICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICAvLyBjcmVhdGUgYW4gYXVkaW8gYnVmZmVyIGZyb20gdGhlIGRhdGFcbiAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2FtcGxlUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG5cbiAgICAgICAgY29uc3QgYXVkaW9CdWZmZXIgPSB0aGlzLmN0eC5jcmVhdGVCdWZmZXIoMSwgbGVuZ3RoLCBzYW1wbGVSYXRlKTtcbiAgICAgICAgY29uc3QgYXVkaW9BcnJheUJ1ZmZlciA9IGF1ZGlvQnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgICBhdWRpb0FycmF5QnVmZmVyLnNldChidWZmZXIsIDApO1xuXG4gICAgICAgIHJlc29sdmUoYXVkaW9CdWZmZXIpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cbn0iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRHJhdyBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30sIGV4dGVuZERlZmF1bHRzID0ge30pIHtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBkdXJhdGlvbjogMSxcbiAgICAgIG1pbjogLTEsXG4gICAgICBtYXg6IDEsXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAxNTAsIC8vIGRlZmF1bHQgY2FudmFzIHNpemUgaW4gRE9NIHRvb1xuICAgICAgaXNTeW5jaHJvbml6ZWQ6IGZhbHNlIC8vIGlzIHNldCB0byB0cnVlIGlmIHVzZWQgaW4gYSBzeW5jaHJvbml6ZWRTaW5rXG4gICAgfSwgZXh0ZW5kRGVmYXVsdHMpO1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jYW52YXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncGFyYW1zLmNhbnZhcyBpcyBtYW5kYXRvcnkgYW5kIG11c3QgYmUgY2FudmFzIERPTSBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBjYW52YXNcbiAgICB0aGlzLmNhbnZhcyA9IHRoaXMucGFyYW1zLmNhbnZhcztcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICB0aGlzLmNhY2hlZENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMuY2FjaGVkQ3R4ID0gdGhpcy5jYWNoZWRDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCAgPSB0aGlzLmNhY2hlZEN0eC5jYW52YXMud2lkdGggID0gdGhpcy5wYXJhbXMud2lkdGg7XG4gICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuY2FjaGVkQ3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cbiAgICB0aGlzLnByZXZpb3VzVGltZSA9IDA7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IDA7XG4gICAgdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0ID0gMDtcblxuICAgIC8vIHRoaXMuX2NhY2hlID0gW107XG4gICAgLy8gdGhpcy5fcmFmSWQ7XG4gICAgLy8gdGhpcy5kcmF3ID0gdGhpcy5kcmF3LmJpbmQodGhpcyk7XG4gIH1cblxuICAvLyBpbml0aWFsaXplKCkge1xuICAvLyAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgLy8gICAvLyB0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRyYXcpO1xuICAvLyB9XG5cbiAgLy8gZmluYWxpemUoKSB7XG4gIC8vICAgc3VwZXIuZmluYWxpemUoKTtcbiAgLy8gICAvLyBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XG4gIC8vIH1cblxuICAvLyBkcmF3KCkge1xuICAvLyAgIGNvbnNvbGUubG9nKCdkcmF3JywgdGhpcy5fY2FjaGUubGVuZ3RoKTtcbiAgLy8gICB0aGlzLl9jYWNoZS5mb3JFYWNoKChpbmZvcykgPT4ge1xuICAvLyAgICAgY29uc29sZS5sb2coaW5mb3MpO1xuICAvLyAgICAgdGhpcy5zY3JvbGxNb2RlRHJhdyhpbmZvcy50aW1lLCBpbmZvcy5mcmFtZSk7XG4gIC8vICAgfSk7XG5cbiAgLy8gICB0aGlzLl9jYWNoZS5sZW5ndGggPSAwO1xuICAvLyAgIHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZHJhdyk7XG4gIC8vIH1cblxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcbiAgICB0aGlzLmNhY2hlZEN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCk7XG4gIH1cblxuICBzZXR1cFN0cmVhbSgpIHtcbiAgICBzdXBlci5zZXR1cFN0cmVhbSgpO1xuICAgIHRoaXMucHJldmlvdXNGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKTtcbiAgfVxuXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTI5NDk1NS9ob3ctdG8tc2NhbGUtZG93bi1hLXJhbmdlLW9mLW51bWJlcnMtd2l0aC1hLWtub3duLW1pbi1hbmQtbWF4LXZhbHVlXG4gIC8vICAgICAgICAoYi1hKSh4IC0gbWluKVxuICAvLyBmKHgpID0gLS0tLS0tLS0tLS0tLS0gKyBhXG4gIC8vICAgICAgICAgIG1heCAtIG1pblxuICBnZXRZUG9zaXRpb24odmFsdWUpIHtcbiAgICAvLyBhID0gaGVpZ2h0XG4gICAgLy8gYiA9IDBcbiAgICBjb25zdCBtaW4gPSB0aGlzLnBhcmFtcy5taW47XG4gICAgY29uc3QgbWF4ID0gdGhpcy5wYXJhbXMubWF4O1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcblxuICAgIHJldHVybiAoKCgwIC0gaGVpZ2h0KSAqICh2YWx1ZSAtIG1pbikpIC8gKG1heCAtIG1pbikpICsgaGVpZ2h0O1xuICB9XG5cbiAgLy8gcGFyYW1zIG1vZGlmaWVyc1xuICBzZXQgZHVyYXRpb24oZHVyYXRpb24pIHtcbiAgICB0aGlzLnBhcmFtcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICB9XG5cbiAgc2V0IG1pbihtaW4pIHtcbiAgICB0aGlzLnBhcmFtcy5taW4gPSBtaW47XG4gIH1cblxuICBzZXQgbWF4KG1heCkge1xuICAgIHRoaXMucGFyYW1zLm1heCA9IG1heDtcbiAgfVxuXG4gIC8vIG1haW4gcHJvY2VzcyBtZXRob2RcbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBzdXBlci5wcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cblxuICAvLyBkZWZhdWx0IGRyYXcgbW9kZVxuICBzY3JvbGxNb2RlRHJhdyh0aW1lLCBmcmFtZSkge1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5wYXJhbXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5wYXJhbXMuZHVyYXRpb247XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG5cbiAgICBjb25zdCBkdCA9IHRpbWUgLSB0aGlzLnByZXZpb3VzVGltZTtcbiAgICBjb25zdCBmU2hpZnQgPSAoZHQgLyBkdXJhdGlvbikgKiB3aWR0aCAtIHRoaXMubGFzdFNoaWZ0RXJyb3I7XG4gICAgY29uc3QgaVNoaWZ0ID0gTWF0aC5yb3VuZChmU2hpZnQpO1xuICAgIHRoaXMubGFzdFNoaWZ0RXJyb3IgPSBpU2hpZnQgLSBmU2hpZnQ7XG5cbiAgICBjb25zdCBwYXJ0aWFsU2hpZnQgPSBpU2hpZnQgLSB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQ7XG4gICAgdGhpcy5zaGlmdENhbnZhcyhwYXJ0aWFsU2hpZnQpO1xuXG4gICAgLy8gc2hpZnQgYWxsIHNpYmxpbmdzIGlmIHN5bmNocm9uaXplZFxuICAgIGlmICh0aGlzLnBhcmFtcy5pc1N5bmNocm9uaXplZCAmJiB0aGlzLnN5bmNocm9uaXplcikge1xuICAgICAgdGhpcy5zeW5jaHJvbml6ZXIuc2hpZnRTaWJsaW5ncyhwYXJ0aWFsU2hpZnQsIHRoaXMpO1xuICAgIH1cblxuICAgIC8vIHRyYW5zbGF0ZSB0byB0aGUgY3VycmVudCBmcmFtZSBhbmQgZHJhdyBhIG5ldyBwb2x5Z29uXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNsYXRlKHdpZHRoLCAwKTtcbiAgICB0aGlzLmRyYXdDdXJ2ZShmcmFtZSwgdGhpcy5wcmV2aW91c0ZyYW1lLCBpU2hpZnQpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgLy8gdXBkYXRlIGBjdXJyZW50UGFydGlhbFNoaWZ0YFxuICAgIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdCAtPSBpU2hpZnQ7XG4gICAgLy8gc2F2ZSBjdXJyZW50IHN0YXRlIGludG8gYnVmZmVyIGNhbnZhc1xuICAgIHRoaXMuY2FjaGVkQ3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLmNhY2hlZEN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgdGhpcy5wcmV2aW91c0ZyYW1lLnNldChmcmFtZSwgMCk7XG4gICAgdGhpcy5wcmV2aW91c1RpbWUgPSB0aW1lO1xuICB9XG5cbiAgc2hpZnRDYW52YXMoc2hpZnQpIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcblxuICAgIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdCArPSBzaGlmdDtcblxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgY3R4LnNhdmUoKTtcblxuICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5jYWNoZWRDYW52YXMsXG4gICAgICB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQsIDAsIHdpZHRoIC0gdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0LCBoZWlnaHQsXG4gICAgICAwLCAwLCB3aWR0aCAtIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdCwgaGVpZ2h0XG4gICAgKTtcblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cblxuICAvLyBNdXN0IGltcGxlbWVudCB0aGUgbG9naWMgdG8gZHJhdyB0aGUgc2hhcGUgYmV0d2VlblxuICAvLyB0aGUgcHJldmlvdXMgYW5kIHRoZSBjdXJyZW50IGZyYW1lLlxuICAvLyBBc3N1bWluZyB0aGUgY29udGV4dCBpcyBjZW50ZXJlZCBvbiB0aGUgY3VycmVudCBmcmFtZVxuICBkcmF3Q3VydmUoZnJhbWUsIHByZXZGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc29sZS5lcnJvcignbXVzdCBiZSBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZURyYXc7XG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnBmIGV4dGVuZHMgQmFzZURyYXcge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICB0cmlnZ2VyOiBmYWxzZSxcbiAgICAgIHJhZGl1czogMCxcbiAgICAgIGxpbmU6IHRydWVcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuICAgIC8vIGZvciBsb29wIG1vZGVcbiAgICB0aGlzLmN1cnJlbnRYUG9zaXRpb24gPSAwO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG5cbiAgICAvLyBjcmVhdGUgYW4gYXJyYXkgb2YgY29sb3JzIGFjY29yZGluZyB0byB0aGUgYG91dEZyYW1lYCBzaXplXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jb2xvcnMpIHtcbiAgICAgIHRoaXMucGFyYW1zLmNvbG9ycyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5wYXJhbXMuY29sb3JzLnB1c2goZ2V0UmFuZG9tQ29sb3IoKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gYWxsb3cgdG8gd2l0Y2ggZWFzaWx5IGJldHdlZW4gdGhlIDIgbW9kZXNcbiAgc2V0VHJpZ2dlcihib29sKSB7XG4gICAgdGhpcy5wYXJhbXMudHJpZ2dlciA9IGJvb2w7XG4gICAgLy8gY2xlYXIgY2FudmFzIGFuZCBjYWNoZVxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcbiAgICB0aGlzLmNhY2hlZEN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCk7XG4gICAgLy8gcmVzZXQgY3VycmVudFhQb3NpdGlvblxuICAgIHRoaXMuY3VycmVudFhQb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IDA7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lKSB7XG4gICAgLy8gQFRPRE86IGNvbXBhcmUgZHQgLSBpZiBkdCA8IGZwcyByZXR1cm47ICg/KVxuICAgIGlmICh0aGlzLnBhcmFtcy50cmlnZ2VyKSB7XG4gICAgICB0aGlzLnRyaWdnZXJNb2RlRHJhdyh0aW1lLCBmcmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2Nyb2xsTW9kZURyYXcodGltZSwgZnJhbWUpO1xuICAgIH1cblxuICAgIHN1cGVyLnByb2Nlc3ModGltZSwgZnJhbWUpO1xuICB9XG5cbiAgLy8gYWRkIGFuIGFsdGVybmF0aXZlIGRyYXdpbmcgbW9kZVxuICAvLyBkcmF3IGZyb20gbGVmdCB0byByaWdodCwgZ28gYmFjayB0byBsZWZ0IHdoZW4gPiB3aWR0aFxuICB0cmlnZ2VyTW9kZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICBjb25zdCB3aWR0aCAgPSB0aGlzLnBhcmFtcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnBhcmFtcy5kdXJhdGlvbjtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcblxuICAgIGNvbnN0IGR0ID0gdGltZSAtIHRoaXMucHJldmlvdXNUaW1lO1xuICAgIGNvbnN0IGZTaGlmdCA9IChkdCAvIGR1cmF0aW9uKSAqIHdpZHRoIC0gdGhpcy5sYXN0U2hpZnRFcnJvcjsgLy8gcHhcbiAgICBjb25zdCBpU2hpZnQgPSBNYXRoLnJvdW5kKGZTaGlmdCk7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IGlTaGlmdCAtIGZTaGlmdDtcblxuICAgIHRoaXMuY3VycmVudFhQb3NpdGlvbiArPSBpU2hpZnQ7XG5cbiAgICAvLyBkcmF3IHRoZSByaWdodCBwYXJ0XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNsYXRlKHRoaXMuY3VycmVudFhQb3NpdGlvbiwgMCk7XG4gICAgY3R4LmNsZWFyUmVjdCgtaVNoaWZ0LCAwLCBpU2hpZnQsIGhlaWdodCk7XG4gICAgdGhpcy5kcmF3Q3VydmUoZnJhbWUsIGlTaGlmdCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIC8vIGdvIGJhY2sgdG8gdGhlIGxlZnQgb2YgdGhlIGNhbnZhcyBhbmQgcmVkcmF3IHRoZSBzYW1lIHRoaW5nXG4gICAgaWYgKHRoaXMuY3VycmVudFhQb3NpdGlvbiA+IHdpZHRoKSB7XG4gICAgICAvLyBnbyBiYWNrIHRvIHN0YXJ0XG4gICAgICB0aGlzLmN1cnJlbnRYUG9zaXRpb24gLT0gd2lkdGg7XG5cbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICBjdHgudHJhbnNsYXRlKHRoaXMuY3VycmVudFhQb3NpdGlvbiwgMCk7XG4gICAgICBjdHguY2xlYXJSZWN0KC1pU2hpZnQsIDAsIGlTaGlmdCwgaGVpZ2h0KTtcbiAgICAgIHRoaXMuZHJhd0N1cnZlKGZyYW1lLCB0aGlzLnByZXZpb3VzRnJhbWUsIGlTaGlmdCk7XG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGltcGxlbWVudHMgZHJhd0N1cnZlXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnBhcmFtcy5jb2xvcnM7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5wYXJhbXMucmFkaXVzO1xuICAgIC8vIEBUT0RPIHRoaXMgY2FuIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZFxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjdHguc2F2ZSgpO1xuICAgICAgLy8gY29sb3Igc2hvdWxkIGJlY2hvc2VuIGFjY29yZGluZyB0byBpbmRleFxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yc1tpXTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yc1tpXTtcblxuICAgICAgY29uc3QgcG9zWSA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lW2ldKTtcbiAgICAgIC8vIGFzIGFuIG9wdGlvbnMgPyByYWRpdXMgP1xuICAgICAgaWYgKHJhZGl1cyA+IDApIHtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguYXJjKDAsIHBvc1ksIHJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJldkZyYW1lICYmIHRoaXMucGFyYW1zLmxpbmUpIHtcbiAgICAgICAgY29uc3QgbGFzdFBvc1kgPSB0aGlzLmdldFlQb3NpdGlvbihwcmV2RnJhbWVbaV0pO1xuICAgICAgICAvLyBkcmF3IGxpbmVcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1pU2hpZnQsIGxhc3RQb3NZKTtcbiAgICAgICAgY3R4LmxpbmVUbygwLCBwb3NZKTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICB9XG5cbiAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuXG4vKipcbiAqICBhY2N1bXVsYXRlIGludHB1dCBhbmQgZXhwb3NlIGl0IC0gYWxsb3cgdmlldyAoc2VlIHdhdmVzLXVpKSB0byBwdWxsIGRhdGEgZm9yIHJlbmRlcmluZ1xuICogIGJyb2RnZSBiZXR3ZWVuIGBwdXNoYCB0byBgcHVsbGAgcGFyYWRpZ21cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZGdlIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMsIHByb2Nlc3MpIHtcbiAgICBzdXBlcihvcHRpb25zLCB7fSk7XG5cbiAgICB0aGlzLnByb2Nlc3MgPSBwcm9jZXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kYXRhID0gdGhpcy5vdXRGcmFtZSA9IFtdO1xuICB9XG5cbiAgc2V0dXBTdHJlYW0oKSB7XG4gICAgc3VwZXIuc2V0dXBTdHJlYW0oKTtcbiAgICB0aGlzLmRhdGEubGVuZ3RoID0gMDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xuICB9XG59IiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbmNvbnN0IHdvcmtlciA9IGBcbnZhciBfc2VwYXJhdGVBcnJheXMgPSBmYWxzZTtcbnZhciBfZGF0YSA9IFtdO1xudmFyIF9zZXBhcmF0ZUFycmF5c0RhdGEgPSB7IHRpbWU6IFtdLCBkYXRhOiBbXSB9O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBfZGF0YS5sZW5ndGggPSAwO1xuICBfc2VwYXJhdGVBcnJheXNEYXRhLnRpbWUubGVuZ3RoID0gMDtcbiAgX3NlcGFyYXRlQXJyYXlzRGF0YS5kYXRhLmxlbmd0aCA9IDA7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3ModGltZSwgZGF0YSkge1xuICBpZiAoX3NlcGFyYXRlQXJyYXlzKSB7XG4gICAgX3NlcGFyYXRlQXJyYXlzRGF0YS50aW1lLnB1c2godGltZSk7XG4gICAgX3NlcGFyYXRlQXJyYXlzRGF0YS5kYXRhLnB1c2goZGF0YSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGRhdHVtID0geyB0aW1lOiB0aW1lLCBkYXRhOiBkYXRhIH07XG4gICAgX2RhdGEucHVzaChkYXR1bSk7XG4gIH1cbn1cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZSkge1xuICBzd2l0Y2ggKGUuZGF0YS5jb21tYW5kKSB7XG4gICAgY2FzZSAnaW5pdCc6XG4gICAgICBfc2VwYXJhdGVBcnJheXMgPSBlLmRhdGEuc2VwYXJhdGVBcnJheXM7XG4gICAgICBpbml0KCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcm9jZXNzJzpcbiAgICAgIHZhciB0aW1lID0gZS5kYXRhLnRpbWU7XG4gICAgICB2YXIgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZS5kYXRhLmJ1ZmZlcik7XG4gICAgICBwcm9jZXNzKHRpbWUsIGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmluYWxpemUnOlxuICAgICAgdmFyIGRhdGEgPSBfc2VwYXJhdGVBcnJheXMgPyBfc2VwYXJhdGVBcnJheXNEYXRhIDogX2RhdGE7XG4gICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIGluaXQoKTtcbiAgICAgIGJyZWFrO1xuICB9XG59KTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFSZWNvcmRlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICAvLyBkZWZhdWx0IGZvcm1hdCBpcyBbe3RpbWUsIGRhdGF9LCB7dGltZSwgZGF0YX1dXG4gICAgICAvLyBpZiBzZXQgdG8gYHRydWVgIGZvcm1hdCBpcyB7IHRpbWU6IFsuLi5dLCBkYXRhOiBbLi4uXSB9XG4gICAgICBzZXBhcmF0ZUFycmF5czogZmFsc2UsXG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIGluaXQgd29ya2VyXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcblxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIGNvbW1hbmQ6ICdpbml0JyxcbiAgICAgIHNlcGFyYXRlQXJyYXlzOiB0aGlzLnBhcmFtcy5zZXBhcmF0ZUFycmF5cyxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX2lzU3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuZmluYWxpemUoKTtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSB7IHJldHVybjsgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ2ZpbmFsaXplJyB9KTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YXJ0ZWQpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLm91dEZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShmcmFtZSk7XG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5vdXRGcmFtZS5idWZmZXI7XG5cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICBjb21tYW5kOiAncHJvY2VzcycsXG4gICAgICB0aW1lOiB0aW1lLFxuICAgICAgYnVmZmVyOiBidWZmZXIsXG4gICAgfSwgW2J1ZmZlcl0pO1xuXG4gIH1cblxuICByZXRyaWV2ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy53b3JrZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIHJlc29sdmUoZS5kYXRhLmRhdGEpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cbn0iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCB7IGVuY29kZU1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG4vLyBzZW5kIGFuIExmbyBzdHJlYW0gZnJvbSB0aGUgYnJvd3NlciBvdmVyIHRoZSBuZXR3b3JrXG4vLyB0aHJvdWdoIGEgV2ViU29ja2V0IC0gc2hvdWxkIGJlIHBhaXJlZCB3aXRoIGEgU29ja2V0U291cmNlU2VydmVyXG4vLyBATk9URTogZG9lcyBpdCBuZWVkIHRvIGltcGxlbWVudCBzb21lIHBpbmcgcHJvY2VzcyB0byBtYWludGFpbiBjb25uZWN0aW9uID9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldENsaWVudCBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgcG9ydDogMzAzMCxcbiAgICAgIGFkZHJlc3M6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZVxuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgdGhpcy5pbml0Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgaW5pdENvbm5lY3Rpb24oKSB7XG4gICAgdmFyIHNvY2tldEFkZHIgPSAnd3M6Ly8nICsgdGhpcy5wYXJhbXMuYWRkcmVzcyArICc6JyArIHRoaXMucGFyYW1zLnBvcnQ7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHNvY2tldEFkZHIpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgLy8gY2FsbGJhY2sgdG8gc3RhcnQgdG8gd2hlbiBXZWJTb2NrZXQgaXMgY29ubmVjdGVkXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5wYXJhbXMub25vcGVuKCk7XG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25tZXNzYWdlID0gKCkgPT4ge1xuXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdmFyIGJ1ZmZlciA9IGVuY29kZU1lc3NhZ2UodGltZSwgZnJhbWUsIG1ldGFEYXRhKTtcbiAgICB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcik7XG4gIH1cbn0iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCAqIGFzIHdzIGZyb20gJ3dzJztcbmltcG9ydCB7IGVuY29kZU1lc3NhZ2UsIGFycmF5QnVmZmVyVG9CdWZmZXIgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldFNlcnZlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgcG9ydDogMzAzMVxuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cbiAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgdGhpcy5pbml0U2VydmVyKCk7XG4gIH1cblxuICBpbml0U2VydmVyKCkge1xuICAgIHRoaXMuc2VydmVyID0gbmV3IHdzLlNlcnZlcih7IHBvcnQ6IHRoaXMucGFyYW1zLnBvcnQgfSk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHZhciBhcnJheUJ1ZmZlciA9IGVuY29kZU1lc3NhZ2UodGltZSwgZnJhbWUsIG1ldGFEYXRhKTtcbiAgICB2YXIgYnVmZmVyID0gYXJyYXlCdWZmZXJUb0J1ZmZlcihhcnJheUJ1ZmZlcik7XG5cbiAgICB0aGlzLnNlcnZlci5jbGllbnRzLmZvckVhY2goZnVuY3Rpb24oY2xpZW50KSB7XG4gICAgICBjbGllbnQuc2VuZChidWZmZXIpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxubGV0IGNvdW50ZXIgPSAwO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29ub2dyYW0gZXh0ZW5kcyBCYXNlRHJhdyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIHNjYWxlOiAxXG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgfVxuXG4gIHNldCBzY2FsZSh2YWx1ZSkge1xuICAgIHRoaXMucGFyYW1zLnNjYWxlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgc2NhbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zLnNjYWxlO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB0aGlzLnNjcm9sbE1vZGVEcmF3KHRpbWUsIGZyYW1lKTtcbiAgICBzdXBlci5wcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cblxuICBkcmF3Q3VydmUoZnJhbWUsIHByZXZpb3VzRnJhbWUsIGlTaGlmdCkge1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMucGFyYW1zLnNjYWxlO1xuICAgIGNvbnN0IGJpblBlclBpeGVsID0gZnJhbWUubGVuZ3RoIC8gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgICAgLy8gaW50ZXJwb2xhdGUgYmV0d2VlbiBwcmV2IGFuZCBuZXh0IGJpbnNcbiAgICAgIC8vIGlzIG5vdCBhIHZlcnkgZ29vZCBzdHJhdGVneSBpZiBtb3JlIHRoYW4gdHdvIGJpbnMgcGVyIHBpeGVsc1xuICAgICAgLy8gc29tZSB2YWx1ZXMgd29uJ3QgYmUgdGFrZW4gaW50byBhY2NvdW50XG4gICAgICAvLyB0aGlzIGhhY2sgaXMgbm90IHJlbGlhYmxlXG4gICAgICAvLyAtPiBjb3VsZCB3ZSByZXNhbXBsZSB0aGUgZnJhbWUgaW4gZnJlcXVlbmN5IGRvbWFpbiA/XG4gICAgICBjb25zdCBmQmluID0gaSAqIGJpblBlclBpeGVsO1xuICAgICAgY29uc3QgcHJldkJpbkluZGV4ID0gTWF0aC5mbG9vcihmQmluKTtcbiAgICAgIGNvbnN0IG5leHRCaW5JbmRleCA9IE1hdGguY2VpbChmQmluKTtcblxuICAgICAgY29uc3QgcHJldkJpbiA9IGZyYW1lW3ByZXZCaW5JbmRleF07XG4gICAgICBjb25zdCBuZXh0QmluID0gZnJhbWVbbmV4dEJpbkluZGV4XTtcblxuICAgICAgY29uc3QgcG9zaXRpb24gPSBmQmluIC0gcHJldkJpbkluZGV4O1xuICAgICAgY29uc3Qgc2xvcGUgPSAobmV4dEJpbiAtIHByZXZCaW4pO1xuICAgICAgY29uc3QgaW50ZXJjZXB0ID0gcHJldkJpbjtcbiAgICAgIGNvbnN0IHdlaWdodGVkQmluID0gc2xvcGUgKiBwb3NpdGlvbiArIGludGVyY2VwdDtcblxuICAgICAgY29uc3QgeSA9IHRoaXMucGFyYW1zLmhlaWdodCAtIGk7XG4gICAgICBjb25zdCBjID0gTWF0aC5yb3VuZCh3ZWlnaHRlZEJpbiAqIHNjYWxlICogMjU1KTtcblxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGByZ2JhKCR7Y30sICR7Y30sICR7Y30sIDEpYDtcbiAgICAgIGN0eC5maWxsUmVjdCgtaVNoaWZ0LCB5LCBpU2hpZnQsIC0xKTtcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVjdHJvZ3JhbSBleHRlbmRzIEJhc2VEcmF3IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgbWluOiAwLFxuICAgICAgbWF4OiAxLFxuICAgICAgc2NhbGU6IDFcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuICB9XG5cbiAgc2V0IHNjYWxlKHZhbHVlKSB7XG4gICAgdGhpcy5wYXJhbXMuc2NhbGUgPSB2YWx1ZTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgdGhpcy5fcmFmRmxhZyA9IHRydWU7XG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jb2xvcikgeyB0aGlzLnBhcmFtcy5jb2xvciA9IGdldFJhbmRvbUNvbG9yKCk7IH1cbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIHN1cGVyLmZpbmFsaXplKCk7XG4gICAgdGhpcy5fcmFmRmxhZyA9IGZhbHNlO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBpZiAodGhpcy5fcmFmRmxhZykge1xuICAgICAgdGhpcy5fcmFmRmxhZyA9IGZhbHNlO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZHJhd0N1cnZlKGZyYW1lKSk7XG4gICAgfVxuXG4gICAgc3VwZXIucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuICB9XG5cbiAgZHJhd0N1cnZlKGZyYW1lKSB7XG4gICAgY29uc3QgbmJyQmlucyA9IGZyYW1lLmxlbmd0aDtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBiaW5XaWR0aCA9IHdpZHRoIC8gbmJyQmlucztcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMucGFyYW1zLnNjYWxlO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGFyYW1zLmNvbG9yO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ickJpbnM7IGkrKykge1xuICAgICAgY29uc3QgeCA9IGkgLyBuYnJCaW5zICogd2lkdGg7XG4gICAgICBjb25zdCB5ID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbaV0gKiBzY2FsZSk7XG5cbiAgICAgIGN0eC5maWxsUmVjdCh4LCB5LCBiaW5XaWR0aCwgaGVpZ2h0IC0geSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmFmRmxhZyA9IHRydWU7XG4gIH1cbn0iLCIvKipcbiAqIGlzIHVzZWQgdG8ga2VlcCBzZXZlcmFsIGRyYXcgaW4gc3luY1xuICogd2hlbiBhIHZpZXcgaXMgaW5zdGFsbGVkIGluIGEgc3luY2hyb25pemVkIGRyYXdcbiAqIHRoZSBtZXRhIHZpZXcgaXMgaW5zdGFsbGVkIGFzIGEgbWVtYmVyIG9mIGFsbCBpdCdzIGNoaWxkcmVuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bmNocm9uaXplZERyYXcge1xuICBjb25zdHJ1Y3RvciguLi52aWV3cykge1xuICAgIHRoaXMudmlld3MgPSBbXTtcbiAgICB0aGlzLmFkZC5hcHBseSh0aGlzLCB2aWV3cyk7XG4gIH1cblxuICBhZGQoLi4udmlld3MpIHtcbiAgICB2aWV3cy5mb3JFYWNoKHZpZXcgPT4geyB0aGlzLmluc3RhbGwodmlldyk7IH0pO1xuICB9XG5cbiAgaW5zdGFsbCh2aWV3KSB7XG4gICAgdGhpcy52aWV3cy5wdXNoKHZpZXcpO1xuICAgIHZpZXcucGFyYW1zLmlzU3luY2hyb25pemVkID0gdHJ1ZTtcbiAgICB2aWV3LnN5bmNocm9uaXplciA9IHRoaXM7XG4gIH1cblxuICBzaGlmdFNpYmxpbmdzKGlTaGlmdCwgdmlldykge1xuICAgIHRoaXMudmlld3MuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZCA9PT0gdmlldykgeyByZXR1cm47IH1cbiAgICAgIGNoaWxkLnNoaWZ0Q2FudmFzKGlTaGlmdCk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlRHJhdyBmcm9tICcuL2Jhc2UtZHJhdyc7XG5pbXBvcnQgeyBnZXRSYW5kb21Db2xvciwgZ2V0SHVlLCBoZXhUb1JHQiB9IGZyb20gJy4uL3V0aWxzL2RyYXctdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFjZSBleHRlbmRzIEJhc2VEcmF3IHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBjb2xvclNjaGVtZTogJ25vbmUnIC8vIGNvbG9yLCBvcGFjaXR5XG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jb2xvcikgeyB0aGlzLnBhcmFtcy5jb2xvciA9IGdldFJhbmRvbUNvbG9yKCk7IH1cbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUpIHtcbiAgICB0aGlzLnNjcm9sbE1vZGVEcmF3KHRpbWUsIGZyYW1lKTtcbiAgICBzdXBlci5wcm9jZXNzKHRpbWUsIGZyYW1lKTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBsZXQgY29sb3IsIGdyYWRpZW50O1xuXG4gICAgY29uc3QgaGFsZlJhbmdlID0gZnJhbWVbMV0gLyAyO1xuICAgIGNvbnN0IG1lYW4gPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVswXSk7XG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMF0gLSBoYWxmUmFuZ2UpO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lWzBdICsgaGFsZlJhbmdlKTtcblxuICAgIGxldCBwcmV2SGFsZlJhbmdlO1xuICAgIGxldCBwcmV2TWluO1xuICAgIGxldCBwcmV2TWF4O1xuXG4gICAgaWYgKHByZXZGcmFtZSkge1xuICAgICAgcHJldkhhbGZSYW5nZSA9IHByZXZGcmFtZVsxXSAvIDI7XG4gICAgICBwcmV2TWluID0gdGhpcy5nZXRZUG9zaXRpb24ocHJldkZyYW1lWzBdIC0gcHJldkhhbGZSYW5nZSk7XG4gICAgICBwcmV2TWF4ID0gdGhpcy5nZXRZUG9zaXRpb24ocHJldkZyYW1lWzBdICsgcHJldkhhbGZSYW5nZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5jb2xvclNjaGVtZSkge1xuICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhcmFtcy5jb2xvcjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaHVlJzpcbiAgICAgICAgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoLWlTaGlmdCwgMCwgMCwgMCk7XG5cbiAgICAgICAgaWYgKHByZXZGcmFtZSkge1xuICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAnaHNsKCcgKyBnZXRIdWUocHJldkZyYW1lWzJdKSArICcsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ2hzbCgnICsgZ2V0SHVlKGZyYW1lWzJdKSArICcsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAnaHNsKCcgKyBnZXRIdWUoZnJhbWVbMl0pICsgJywgMTAwJSwgNTAlKScpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29wYWNpdHknOlxuICAgICAgICBjb25zdCByZ2IgPSBoZXhUb1JHQih0aGlzLnBhcmFtcy5jb2xvcik7XG4gICAgICAgIGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KC1pU2hpZnQsIDAsIDAsIDApO1xuXG4gICAgICAgIGlmIChwcmV2RnJhbWUpIHtcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoJyArIHJnYi5qb2luKCcsJykgKyAnLCcgKyBwcmV2RnJhbWVbMl0gKyAnKScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAncmdiYSgnICsgcmdiLmpvaW4oJywnKSArICcsJyArIGZyYW1lWzJdICsgJyknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgnICsgcmdiLmpvaW4oJywnKSArICcsJyArIGZyYW1lWzJdICsgJyknKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCBtZWFuKTtcbiAgICBjdHgubGluZVRvKDAsIG1heCk7XG5cbiAgICBpZiAocHJldkZyYW1lKSB7XG4gICAgICBjdHgubGluZVRvKC1pU2hpZnQsIHByZXZNYXgpO1xuICAgICAgY3R4LmxpbmVUbygtaVNoaWZ0LCBwcmV2TWluKTtcbiAgICB9XG5cbiAgICBjdHgubGluZVRvKDAsIG1pbik7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNlO1xuIiwiaW1wb3J0IEJhc2VEcmF3IGZyb20gJy4vYmFzZS1kcmF3JztcbmltcG9ydCB7IGdldFJhbmRvbUNvbG9yIH0gZnJvbSAnLi4vdXRpbHMvZHJhdy11dGlscyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZWZvcm0gZXh0ZW5kcyBCYXNlRHJhdyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHt9O1xuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jb2xvcikgeyB0aGlzLnBhcmFtcy5jb2xvciA9IGdldFJhbmRvbUNvbG9yKCk7IH1cbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdGhpcy5zY3JvbGxNb2RlRHJhdyh0aW1lLCBmcmFtZSk7XG4gICAgLy8gdGhpcy5fY2FjaGUucHVzaCh7IHRpbWUsIGZyYW1lIH0pO1xuICAgIHN1cGVyLnByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldmlvdXNGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMF0pO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lWzFdKTtcblxuICAgIGN0eC5zYXZlKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXJhbXMuY29sb3I7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgY3R4Lm1vdmVUbygwLCB0aGlzLmdldFlQb3NpdGlvbigwKSk7XG4gICAgY3R4LmxpbmVUbygwLCBtYXgpO1xuXG4gICAgaWYgKHByZXZpb3VzRnJhbWUpIHtcbiAgICAgIGNvbnN0IHByZXZNaW4gPSB0aGlzLmdldFlQb3NpdGlvbihwcmV2aW91c0ZyYW1lWzBdKTtcbiAgICAgIGNvbnN0IHByZXZNYXggPSB0aGlzLmdldFlQb3NpdGlvbihwcmV2aW91c0ZyYW1lWzFdKTtcbiAgICAgIGN0eC5saW5lVG8oLWlTaGlmdCwgcHJldk1heCk7XG4gICAgICBjdHgubGluZVRvKC1pU2hpZnQsIHByZXZNaW4pO1xuICAgIH1cblxuICAgIGN0eC5saW5lVG8oMCwgbWluKTtcblxuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cbiIsImltcG9ydCBBdWRpb0luIGZyb20gJy4vYXVkaW8taW4nO1xuXG5jb25zdCB3b3JrZXIgPSBgXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBwcm9jZXNzKGUpIHtcbiAgdmFyIGJsb2NrU2l6ZSA9IGUuZGF0YS5vcHRpb25zLmJsb2NrU2l6ZTtcbiAgdmFyIHNhbXBsZVJhdGUgPSBlLmRhdGEub3B0aW9ucy5zYW1wbGVSYXRlO1xuICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcblxuICB2YXIgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgLy8gdmFyIGJsb2NrID0gbmV3IEZsb2F0MzJBcnJheShibG9ja1NpemUpO1xuXG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGJsb2NrU2l6ZSkge1xuICAgIHZhciBjb3B5U2l6ZSA9IGxlbmd0aCAtIGluZGV4O1xuICAgIGlmIChjb3B5U2l6ZSA+IGJsb2NrU2l6ZSkgeyBjb3B5U2l6ZSA9IGJsb2NrU2l6ZTsgfVxuXG4gICAgdmFyIGJsb2NrID0gYnVmZmVyLnN1YmFycmF5KGluZGV4LCBpbmRleCArIGNvcHlTaXplKTtcbiAgICBibG9jayA9IG5ldyBGbG9hdDMyQXJyYXkoYmxvY2spO1xuXG4gICAgcG9zdE1lc3NhZ2UoeyBidWZmZXI6IGJsb2NrLmJ1ZmZlciwgdGltZTogaW5kZXggLyBzYW1wbGVSYXRlIH0sIFtibG9jay5idWZmZXJdKTtcbiAgfVxufSwgZmFsc2UpYDtcblxuLyoqXG4gKiBBdWRpb0J1ZmZlciBhcyBzb3VyY2UsIHNsaWNlZCBpdCBpbiBibG9ja3MgdGhyb3VnaCBhIHdvcmtlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb0luQnVmZmVyIGV4dGVuZHMgQXVkaW9JbiB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMsIHt9KTtcbiAgICB0aGlzLm1ldGFEYXRhID0ge307XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLnNyYyB8fCAhKHRoaXMucGFyYW1zLnNyYyBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBBdWRpb0J1ZmZlciBzb3VyY2UgbXVzdCBiZSBnaXZlbicpO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gdGhpcy5wYXJhbXMuc3JjLnNhbXBsZVJhdGUgLyB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IHRoaXMucGFyYW1zLnNyYy5zYW1wbGVSYXRlO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gICAgLy8gaW5pdCB3b3JrZXJcbiAgICAvLyBATk9URTogY291bGQgYmUgZG9uZSBvbmNlIGluIGNvbnN0cnVjdG9yID9cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlcl0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KTtcbiAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIod2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgIHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSwgZmFsc2UpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgLy8gcHJvcGFnYXRlIHRvIHRoZSB3aG9sZSBjaGFpblxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuc3JjLmdldENoYW5uZWxEYXRhKHRoaXMuY2hhbm5lbCkuYnVmZmVyXG5cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIHNhbXBsZVJhdGU6IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUsXG4gICAgICAgIGJsb2NrU2l6ZTogdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplXG4gICAgICB9LFxuICAgICAgYnVmZmVyOiBidWZmZXJcbiAgICB9LCBbYnVmZmVyXSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIC8vIHByb3BhZ2F0ZSB0byB0aGUgd2hvbGUgY2hhaW5cbiAgICB0aGlzLmZpbmFsaXplKCk7XG4gIH1cblxuICAvLyBjYWxsYmFjayBvZiB0aGUgd29ya2VyXG4gIHByb2Nlc3MoZSkge1xuICAgIGNvbnN0IGJsb2NrID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcbiAgICB0aGlzLm91dEZyYW1lLnNldChibG9jaywgMCk7XG4gICAgdGhpcy50aW1lID0gZS5kYXRhLnRpbWU7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9JbiBmcm9tICcuL2F1ZGlvLWluJztcblxuLyoqXG4gKiAgVXNlIGEgV2ViQXVkaW8gbm9kZSBhcyBhIHNvdXJjZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb0luTm9kZSBleHRlbmRzIEF1ZGlvSW4ge1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgdGltZVR5cGU6ICdhYnNvbHV0ZScsXG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgdGhpcy5tZXRhRGF0YSA9IHt9O1xuICB9XG5cbiAgY29uZmlndXJlU3RyZWFtKCkge1xuICAgIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcbiAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlIC8gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuICAgIHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG5cbiAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKGJsb2NrU2l6ZSwgMSwgMSk7XG4gICAgLy8gcHJlcGFyZSBhdWRpbyBncmFwaFxuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLm9uYXVkaW9wcm9jZXNzID0gdGhpcy5wcm9jZXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zcmMuY29ubmVjdCh0aGlzLnNjcmlwdFByb2Nlc3Nvcik7XG4gIH1cblxuICAvLyBjb25uZWN0IHRoZSBhdWRpbyBub2RlcyB0byBzdGFydCBzdHJlYW1pbmdcbiAgc3RhcnQoKSB7XG4gICAgaWYgKHRoaXMucGFyYW1zLnRpbWVUeXBlID09PSAncmVsYXRpdmUnKSB7IHRoaXMudGltZSA9IDA7IH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICAvLyBzdGFydCBcInRoZSBwYXRjaFwiIDspXG4gICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IuY29ubmVjdCh0aGlzLmN0eC5kZXN0aW5hdGlvbik7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuZmluYWxpemUoKTtcbiAgICB0aGlzLnNjcmlwdFByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XG4gIH1cblxuICAvLyBpcyBiYXNpY2FsbHkgdGhlIGBzY3JpcHRQcm9jZXNzb3Iub25hdWRpb3Byb2Nlc3NgIGNhbGxiYWNrXG4gIHByb2Nlc3MoZSkge1xuICAgIGNvbnN0IGJsb2NrID0gZS5pbnB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSh0aGlzLnBhcmFtcy5jaGFubmVsKTtcblxuICAgIHRoaXMudGltZSArPSBibG9jay5sZW5ndGggLyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlO1xuICAgIHRoaXMub3V0RnJhbWUuc2V0KGJsb2NrLCAwKTtcbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxubGV0IGF1ZGlvQ29udGV4dDsgLy8gZm9yIGxhenkgYXVkaW9Db250ZXh0IGNyZWF0aW9uXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvSW4gZXh0ZW5kcyBCYXNlTGZvIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAvLyBkZWZhdWx0c1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgZnJhbWVTaXplOiA1MTIsXG4gICAgICBjaGFubmVsOiAwLFxuICAgIH07XG5cbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cbiAgICAvLyBwcml2YXRlXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jdHgpIHtcbiAgICAgIGlmICghYXVkaW9Db250ZXh0KSB7XG4gICAgICAgIGF1ZGlvQ29udGV4dCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3R4ID0gYXVkaW9Db250ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN0eCA9IHRoaXMucGFyYW1zLmN0eDtcbiAgICB9XG5cbiAgICB0aGlzLnNyYyA9IHRoaXMucGFyYW1zLnNyYztcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMubWV0YURhdGEgPSB7fTtcbiAgfVxuXG4gIHN0YXJ0KCkge31cbiAgc3RvcCgpIHt9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXVkaW9JbjtcbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKlxuICBjYW4gZm9yd2FyZFxuICAgIC0gcmVsYXRpdmVUaW1lIChhY2NvcmRpbmcgdG8gaXQncyBzdGFydCgpIG1ldGhvZClcbiAgICAtIGFic29sdXRlVGltZSAoYXVkaW9Db250ZXggdGltZSlcbiAgICAtIGlucHV0IHRpbWVcblxuICBtZXRob2RzXG4gICAgLSBgc3RhcnQoKWAgLT4gY2FsbCBgcmVzZXQoKWBcbiAgICAtIGBzdG9wKClgICAtPiBjYWxsIGBmaW5hbGl6ZSgpYFxuKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRJbiBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICB0aW1lVHlwZTogJ2Fic29sdXRlJ1xuICAgIH07XG4gICAgLy8gY2Fubm90IGhhdmUgcHJldmlvdXNcbiAgICBzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cbiAgICAvLyB0ZXN0IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUgZW52aXJvbm1lbnRcbiAgICBpZiAoIXRoaXMucGFyYW1zLmN0eCAmJiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnKSkge1xuICAgICAgdGhpcy5wYXJhbXMuY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICAvLyB0aHJvdyBlcnJvciBpZiBzb21lIHZhbHVlcyBhcmUgdW5kZWZpbmVkID9cbiAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gdGhpcy5wYXJhbXMuZnJhbWVSYXRlO1xuICAgIC8vIEBOT1RFIHdoYXQgZG9lcyBtYWtlIHNlbnMgaW4gdGhpcyBjYXNlID9cbiAgICAvLyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplICogdGhpcy5wYXJhbXMuZnJhbWVSYXRlO1xuICAgIHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgPSAodGhpcy5wYXJhbXMuc291cmNlU2FtcGxlUmF0ZSB8fMKgdGhpcy5wYXJhbXMuZnJhbWVSYXRlKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIC8vIHNob3VsZCBiZSBzZXR0ZWQgaW4gdGhlIGZpcnN0IHByb2Nlc3MgY2FsbFxuICAgIHRoaXMuX2lzU3RhcnRlZCA9IHRydWU7XG4gICAgdGhpcy5fc3RhcnRUaW1lID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5maW5hbGl6ZSgpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEgPSB7fSkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSB7IHJldHVybjsgfVxuICAgIC8vIMOgIHJldm9pclxuICAgIC8vIGlmIG5vIHRpbWUgcHJvdmlkZWQsIHVzZSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWVcbiAgICB2YXIgZnJhbWVUaW1lID0gIWlzTmFOKHBhcnNlRmxvYXQodGltZSkpICYmIGlzRmluaXRlKHRpbWUpID9cbiAgICAgIHRpbWUgOiB0aGlzLnBhcmFtcy5jdHguY3VycmVudFRpbWU7XG5cbiAgICAvLyBzZXQgYHN0YXJ0VGltZWAgaWYgZmlyc3QgY2FsbCBhZnRlciBhIGBzdGFydGBcbiAgICBpZiAoIXRoaXMuX3N0YXJ0VGltZSkgeyB0aGlzLl9zdGFydFRpbWUgPSBmcmFtZVRpbWU7IH1cblxuICAgIC8vIGhhbmRsZSB0aW1lIGFjY29yZGluZyB0byBjb25maWdcbiAgICBpZiAodGhpcy5wYXJhbXMudGltZVR5cGUgPT09ICdyZWxhdGl2ZScpIHtcbiAgICAgIGZyYW1lVGltZSA9IHRpbWUgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgfVxuXG4gICAgLy8gaWYgc2NhbGFyLCBjcmVhdGUgYSB2ZWN0b3JcbiAgICBpZiAoZnJhbWUubGVuZ3RoID09PSB1bmRlZmluZWQpIHsgZnJhbWUgPSBbZnJhbWVdOyB9XG4gICAgLy8gd29ya3MgaWYgZnJhbWUgaXMgYW4gYXJyYXlcbiAgICB0aGlzLm91dEZyYW1lLnNldChmcmFtZSwgMCk7XG4gICAgdGhpcy50aW1lID0gZnJhbWVUaW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEluO1xuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQgeyBkZWNvZGVNZXNzYWdlIH0gZnJvbSAnLi4vdXRpbHMvc29ja2V0LXV0aWxzJztcblxuXG4vLyBAVE9ETzogaGFuZGxlIGBzdGFydGAgYW5kIGBzdG9wYFxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29ja2V0Q2xpZW50IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICBwb3J0OiAzMDMxLFxuICAgICAgYWRkcmVzczogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lXG4gICAgfTtcblxuICAgIHN1cGVyKG9wdGlvbnMsIGRlZmF1bHRzKTtcblxuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICB0aGlzLmluaXRDb25uZWN0aW9uKCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBjb25maWd1cmVTdHJlYW0oKSB7XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuICAgIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZSA9IHRoaXMucGFyYW1zLmZyYW1lUmF0ZTtcbiAgfVxuXG4gIGluaXRDb25uZWN0aW9uKCkge1xuICAgIHZhciBzb2NrZXRBZGRyID0gJ3dzOi8vJyArIHRoaXMucGFyYW1zLmFkZHJlc3MgKyAnOicgKyB0aGlzLnBhcmFtcy5wb3J0O1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChzb2NrZXRBZGRyKTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIC8vIGNhbGxiYWNrIHRvIHN0YXJ0IHRvIHdoZW4gV2ViU29ja2V0IGlzIGNvbm5lY3RlZFxuICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9ICgpID0+IHtcblxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5wcm9jZXNzKG1lc3NhZ2UuZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfTtcbiAgfVxuXG4gIHByb2Nlc3MoYnVmZmVyKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBkZWNvZGVNZXNzYWdlKGJ1ZmZlcik7XG5cbiAgICB0aGlzLnRpbWUgPSBtZXNzYWdlLnRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZSA9IG1lc3NhZ2UuZnJhbWU7XG4gICAgdGhpcy5tZXRhRGF0YSA9IG1lc3NhZ2UubWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCAqIGFzIHdzIGZyb20gJ3dzJztcbmltcG9ydCB7IGJ1ZmZlclRvQXJyYXlCdWZmZXIsIGRlY29kZU1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG5cbi8vIEBUT0RPOiBoYW5kbGUgYHN0YXJ0YCBhbmQgYHN0b3BgXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NrZXRTZXJ2ZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIHBvcnQ6IDMwMzBcbiAgICB9O1xuXG4gICAgc3VwZXIob3B0aW9ucywgZGVmYXVsdHMpO1xuXG4gICAgLy8gQFRPRE8gaGFuZGxlIGRpc2Nvbm5lY3QgYW5kIHNvIG9uLi4uXG4gICAgdGhpcy5jbGllbnRzID0gW107XG4gICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgLy8gQEZJWE1FIC0gcmlnaHQgcGxhY2UgP1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIGluaXRTZXJ2ZXIoKSB7XG4gICAgdGhpcy5zZXJ2ZXIgPSBuZXcgd3MuU2VydmVyKHsgcG9ydDogdGhpcy5wYXJhbXMucG9ydCB9KTtcblxuICAgIHRoaXMuc2VydmVyLm9uKCdjb25uZWN0aW9uJywgc29ja2V0ID0+IHtcbiAgICAgIC8vIHRoaXMuY2xpZW50cy5wdXNoKHNvY2tldCk7XG4gICAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzKGJ1ZmZlcikge1xuICAgIHZhciBhcnJheUJ1ZmZlciA9IGJ1ZmZlclRvQXJyYXlCdWZmZXIoYnVmZmVyKTtcbiAgICB2YXIgbWVzc2FnZSA9IGRlY29kZU1lc3NhZ2UoYXJyYXlCdWZmZXIpO1xuXG4gICAgdGhpcy50aW1lID0gbWVzc2FnZS50aW1lO1xuICAgIHRoaXMub3V0RnJhbWUgPSBtZXNzYWdlLmZyYW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXNzYWdlLm1ldGFEYXRhO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxufSIsIi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ4NDUwNi9yYW5kb20tY29sb3ItZ2VuZXJhdG9yLWluLWphdmFzY3JpcHRcbmNvbnN0IGdldFJhbmRvbUNvbG9yID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcbiAgdmFyIGNvbG9yID0gJyMnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKyApIHtcbiAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gIH1cbiAgcmV0dXJuIGNvbG9yO1xufTtcblxuLy8gc2NhbGUgZnJvbSBkb21haW4gWzAsIDFdIHRvIHJhbmdlIFsyNzAsIDBdIHRvIGNvbnN1bWUgaW5cbi8vIGhzbCh4LCAxMDAlLCA1MCUpIGNvbG9yIHNjaGVtZVxuY29uc3QgZ2V0SHVlID0gZnVuY3Rpb24oeCkge1xuICB2YXIgZG9tYWluTWluID0gMDtcbiAgdmFyIGRvbWFpbk1heCA9IDE7XG4gIHZhciByYW5nZU1pbiA9IDI3MDtcbiAgdmFyIHJhbmdlTWF4ID0gMDtcblxuICByZXR1cm4gKCgocmFuZ2VNYXggLSByYW5nZU1pbikgKiAoeCAtIGRvbWFpbk1pbikpIC8gKGRvbWFpbk1heCAtIGRvbWFpbk1pbikpICsgcmFuZ2VNaW47XG59O1xuXG5jb25zdCBoZXhUb1JHQiA9IGZ1bmN0aW9uKGhleCkge1xuICBoZXggPSBoZXguc3Vic3RyaW5nKDEsIDcpO1xuICB2YXIgciA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoMCwgMiksIDE2KTtcbiAgdmFyIGcgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gIHZhciBiID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyg0LCA2KSwgMTYpO1xuICByZXR1cm4gW3IsIGcsIGJdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgeyBnZXRSYW5kb21Db2xvciwgZ2V0SHVlLCBoZXhUb1JHQiB9OyIsIlxuLy8gc2hvcnRjdXRzIC8gaGVscGVyc1xuY29uc3QgUEkgICA9IE1hdGguUEk7XG5jb25zdCBjb3MgID0gTWF0aC5jb3M7XG5jb25zdCBzaW4gID0gTWF0aC5zaW47XG5jb25zdCBzcXJ0ID0gTWF0aC5zcXJ0O1xuXG4vLyB3aW5kb3cgY3JlYXRpb24gZnVuY3Rpb25zXG5mdW5jdGlvbiBpbml0SGFubldpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IHN0ZXAgPSAyICogUEkgLyBzaXplO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgcGhpID0gaSAqIHN0ZXA7XG4gICAgY29uc3QgdmFsdWUgPSAwLjUgLSAwLjUgKiBjb3MocGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRIYW1taW5nV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gIGxldCBsaW5TdW0gPSAwO1xuICBsZXQgcG93U3VtID0gMDtcbiAgY29uc3Qgc3RlcCA9IDIgKiBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IDAuNTQgLSAwLjQ2ICogY29zKHBoaSk7XG5cbiAgICBidWZmZXJbaV0gPSB2YWx1ZTtcblxuICAgIGxpblN1bSArPSB2YWx1ZTtcbiAgICBwb3dTdW0gKz0gdmFsdWUgKiB2YWx1ZTtcbiAgfVxuXG4gIG5vcm1Db2Vmcy5saW5lYXIgPSBzaXplIC8gbGluU3VtO1xuICBub3JtQ29lZnMucG93ZXIgPSBzcXJ0KHNpemUgLyBwb3dTdW0pO1xufVxuXG5mdW5jdGlvbiBpbml0QmxhY2ttYW5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgbGV0IGxpblN1bSA9IDA7XG4gIGxldCBwb3dTdW0gPSAwO1xuICBjb25zdCBzdGVwID0gMiAqIFBJIC8gc2l6ZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIGNvbnN0IHBoaSA9IGkgKiBzdGVwO1xuICAgIGNvbnN0IHZhbHVlID0gMC40MiAtIDAuNSAqIGNvcyhwaGkpICsgMC4wOCAqIGNvcygyICogcGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRCbGFja21hbkhhcnJpc1dpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IGEwID0gMC4zNTg3NTtcbiAgY29uc3QgYTEgPSAwLjQ4ODI5O1xuICBjb25zdCBhMiA9IDAuMTQxMjg7XG4gIGNvbnN0IGEzID0gMC4wMTE2ODtcbiAgY29uc3Qgc3RlcCA9IDIgKiBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IGEwIC0gYTEgKiBjb3MocGhpKSArIGEyICogY29zKDIgKiBwaGkpOyAtIGEzICogY29zKDMgKiBwaGkpO1xuXG4gICAgYnVmZmVyW2ldID0gdmFsdWU7XG5cbiAgICBsaW5TdW0gKz0gdmFsdWU7XG4gICAgcG93U3VtICs9IHZhbHVlICogdmFsdWU7XG4gIH1cblxuICBub3JtQ29lZnMubGluZWFyID0gc2l6ZSAvIGxpblN1bTtcbiAgbm9ybUNvZWZzLnBvd2VyID0gc3FydChzaXplIC8gcG93U3VtKTtcbn1cblxuZnVuY3Rpb24gaW5pdFNpbmVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgbGV0IGxpblN1bSA9IDA7XG4gIGxldCBwb3dTdW0gPSAwO1xuICBjb25zdCBzdGVwID0gUEkgLyBzaXplO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgcGhpID0gaSAqIHN0ZXA7XG4gICAgY29uc3QgdmFsdWUgPSBzaW4ocGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRSZWN0YW5nbGVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgLy8gQFRPRE8gbm9ybUNvZWZzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgYnVmZmVyW2ldID0gMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24oKSB7XG4gIC8vIEBOT1RFIGltcGxlbWVudCBzb21lIGNhY2hpbmcgc3lzdGVtIChpcyB0aGlzIHJlYWxseSB1c2VmdWxsID8pXG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgY2FzZSAnaGFubic6XG4gICAgICBjYXNlICdoYW5uaW5nJzpcbiAgICAgICAgaW5pdEhhbm5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hhbW1pbmcnOlxuICAgICAgICBpbml0SGFtbWluZ1dpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmxhY2ttYW4nOlxuICAgICAgICBpbml0QmxhY2ttYW5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JsYWNrbWFuaGFycmlzJzpcbiAgICAgICAgaW5pdEJsYWNrbWFuSGFycmlzV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgaW5pdFNpbmVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JlY3RhbmdsZSc6XG4gICAgICAgIGluaXRSZWN0YW5nbGVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn0oKSk7IiwiXG4vLyBodHRwOi8vdXBkYXRlcy5odG1sNXJvY2tzLmNvbS8yMDEyLzA2L0hvdy10by1jb252ZXJ0LUFycmF5QnVmZmVyLXRvLWFuZC1mcm9tLVN0cmluZ1xuZnVuY3Rpb24gVWludDE2QXJyYXkyc3RyKGJ1Zikge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBidWYpO1xufVxuXG5mdW5jdGlvbiBzdHIyVWludDE2QXJyYXkoc3RyKSB7XG4gIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyLmxlbmd0aCAqIDIpOyAvLyAyIGJ5dGVzIGZvciBlYWNoIGNoYXJcbiAgdmFyIGJ1ZmZlclZpZXcgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyKTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHN0ci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBidWZmZXJWaWV3W2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclZpZXc7XG59XG5cbi8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjA5Mjg5L2NvbnZlcnQtYS1iaW5hcnktbm9kZWpzLWJ1ZmZlci10by1qYXZhc2NyaXB0LWFycmF5YnVmZmVyXG4vLyBjb252ZXJ0cyBhIG5vZGVqcyBCdWZmZXIgdG8gQXJyYXlCdWZmZXJcbm1vZHVsZS5leHBvcnRzLmJ1ZmZlclRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgdmFyIGFiID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlci5sZW5ndGgpO1xuICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyArK2kpIHtcbiAgICB2aWV3W2ldID0gYnVmZmVyW2ldO1xuICB9XG4gIHJldHVybiBhYjtcbn1cblxubW9kdWxlLmV4cG9ydHMuYXJyYXlCdWZmZXJUb0J1ZmZlciA9IGZ1bmN0aW9uKGFycmF5QnVmZmVyKSB7XG4gIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyArK2kpIHtcbiAgICBidWZmZXJbaV0gPSB2aWV3W2ldO1xuICB9XG4gIHJldHVybiBidWZmZXI7XG59XG5cbi8vIEBUT0RPIGBlbmNvZGVNZXNzYWdlYCBhbmQgYGRlY29kZU1lc3NhZ2VgIGNvdWxkIHByb2JhYmx5IHVzZSBEYXRhVmlldyB0byBwYXJzZSB0aGUgYnVmZmVyXG5cbi8vIGNvbmNhdCB0aGUgbGZvIHN0cmVhbSwgdGltZSBhbmQgbWV0YURhdGEgaW50byBhIHNpbmdsZSBidWZmZXJcbi8vIHRoZSBjb25jYXRlbmF0aW9uIGlzIGRvbmUgYXMgZm9sbG93IDpcbi8vICAqIHRpbWUgICAgICAgICAgPT4gOCBieXRlc1xuLy8gICogZnJhbWUubGVuZ3RoICA9PiAyIGJ5dGVzXG4vLyAgKiBmcmFtZSAgICAgICAgID0+IDQgKiBmcmFtZUxlbmd0aCBieXRlc1xuLy8gICogbWV0YURhdGEgICAgICA9PiByZXN0IG9mIHRoZSBtZXNzYWdlXG4vLyBAcmV0dXJuICBBcnJheUJ1ZmZlciBvZiB0aGUgY3JlYXRlZCBtZXNzYWdlXG4vLyBAbm90ZSAgICBtdXN0IGNyZWF0ZSBhIG5ldyBidWZmZXIgZWFjaCB0aW1lIGJlY2F1c2UgbWV0YURhdGEgbGVuZ3RoIGlzIG5vdCBrbm93blxubW9kdWxlLmV4cG9ydHMuZW5jb2RlTWVzc2FnZSA9IGZ1bmN0aW9uKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgLy8gc2hvdWxkIHByb2JhYmx5IHVzZSB1c2UgRGF0YVZpZXcgaW5zdGVhZFxuICAvLyBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy93ZWJnbC90eXBlZF9hcnJheXMvXG4gIHZhciB0aW1lNjQgPSBuZXcgRmxvYXQ2NEFycmF5KDEpO1xuICB0aW1lNjRbMF0gPSB0aW1lO1xuICB2YXIgdGltZTE2ID0gbmV3IFVpbnQxNkFycmF5KHRpbWU2NC5idWZmZXIpO1xuXG4gIHZhciBsZW5ndGgxNiA9IG5ldyBVaW50MTZBcnJheSgxKTtcbiAgbGVuZ3RoMTZbMF0gPSBmcmFtZS5sZW5ndGg7XG5cbiAgdmFyIGZyYW1lMTYgPSBuZXcgVWludDE2QXJyYXkoZnJhbWUuYnVmZmVyKTtcblxuICB2YXIgbWV0YURhdGExNiA9IHN0cjJVaW50MTZBcnJheShKU09OLnN0cmluZ2lmeShtZXRhRGF0YSkpO1xuXG4gIHZhciBidWZmZXJMZW5ndGggPSB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoICsgZnJhbWUxNi5sZW5ndGggKyBtZXRhRGF0YTE2Lmxlbmd0aDtcblxuICB2YXIgYnVmZmVyID0gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlckxlbmd0aCk7XG5cbiAgLy8gYnVmZmVyIGlzIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRpbWUsIGZyYW1lTGVuZ3RoLCBmcmFtZSwgbWV0YURhdGFcbiAgYnVmZmVyLnNldCh0aW1lMTYsIDApO1xuICBidWZmZXIuc2V0KGxlbmd0aDE2LCB0aW1lMTYubGVuZ3RoKTtcbiAgYnVmZmVyLnNldChmcmFtZTE2LCB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoKTtcbiAgYnVmZmVyLnNldChtZXRhRGF0YTE2LCB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoICsgZnJhbWUxNi5sZW5ndGgpO1xuXG4gIHJldHVybiBidWZmZXIuYnVmZmVyO1xufVxuXG4vLyByZWNyZWF0ZSB0aGUgTGZvIHN0cmVhbSAodGltZSwgZnJhbWUsIG1ldGFEYXRhKSBmb3JtIGEgYnVmZmVyXG4vLyBjcmVhdGVkIHdpdGggYGVuY29kZU1lc3NhZ2VgXG5tb2R1bGUuZXhwb3J0cy5kZWNvZGVNZXNzYWdlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIC8vIHRpbWUgaXMgYSBmbG9hdDY0QXJyYXkgb2Ygc2l6ZSAxICg4IGJ5dGVzKVxuICB2YXIgdGltZUFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIuc2xpY2UoMCwgOCkpO1xuICB2YXIgdGltZSA9IHRpbWVBcnJheVswXTtcblxuICAvLyBmcmFtZSBsZW5ndGggaXMgZW5jb2RlZCBpbiAyIGJ5dGVzXG4gIHZhciBmcmFtZUxlbmd0aEFycmF5ID0gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlci5zbGljZSg4LCAxMCkpO1xuICB2YXIgZnJhbWVMZW5ndGggPSBmcmFtZUxlbmd0aEFycmF5WzBdO1xuXG4gIC8vIGZyYW1lIGlzIGEgZmxvYXQzMkFycmF5ICg0IGJ5dGVzKSAqIGZyYW1lTGVuZ3RoXG4gIHZhciBmcmFtZUJ5dGVMZW5ndGggPSA0ICogZnJhbWVMZW5ndGg7XG4gIHZhciBmcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLnNsaWNlKDEwLCAxMCArIGZyYW1lQnl0ZUxlbmd0aCkpO1xuXG4gIC8vIG1ldGFEYXRhIGlzIHRoZSByZXN0IG9mIHRoZSBidWZmZXJcbiAgdmFyIG1ldGFEYXRhQXJyYXkgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyLnNsaWNlKDEwICsgZnJhbWVCeXRlTGVuZ3RoKSk7XG4gIC8vIEpTT04ucGFyc2UgaGVyZSBjcmFzaGVzIG5vZGUgYmVjYXVzZSBvZiB0aGlzIGNoYXJhY3RlciA6IGBcXHUwMDAwYCAobnVsbCBpbiB1bmljb2RlKSA/P1xuICB2YXIgbWV0YURhdGEgPSBVaW50MTZBcnJheTJzdHIobWV0YURhdGFBcnJheSk7XG4gIG1ldGFEYXRhID0gSlNPTi5wYXJzZShtZXRhRGF0YS5yZXBsYWNlKC9cXHUwMDAwL2csICcnKSk7XG5cbiAgcmV0dXJuIHsgdGltZSwgZnJhbWUsIG1ldGFEYXRhIH07XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKGV4cG9ydHMsIHVuZGVmaW5lZCkge1xuXG4gIHZhclxuICAgIC8vIElmIHRoZSB0eXBlZCBhcnJheSBpcyB1bnNwZWNpZmllZCwgdXNlIHRoaXMuXG4gICAgRGVmYXVsdEFycmF5VHlwZSA9IEZsb2F0MzJBcnJheSxcbiAgICAvLyBTaW1wbGUgbWF0aCBmdW5jdGlvbnMgd2UgbmVlZC5cbiAgICBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIHNxciA9IGZ1bmN0aW9uKG51bWJlcikge3JldHVybiBNYXRoLnBvdyhudW1iZXIsIDIpfSxcbiAgICAvLyBJbnRlcm5hbCBjb252ZW5pZW5jZSBjb3BpZXMgb2YgdGhlIGV4cG9ydGVkIGZ1bmN0aW9uc1xuICAgIGlzQ29tcGxleEFycmF5LFxuICAgIENvbXBsZXhBcnJheVxuXG4gIGV4cG9ydHMuaXNDb21wbGV4QXJyYXkgPSBpc0NvbXBsZXhBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogIT09IHVuZGVmaW5lZCAmJlxuICAgICAgb2JqLmhhc093blByb3BlcnR5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eSgncmVhbCcpICYmXG4gICAgICBvYmouaGFzT3duUHJvcGVydHkoJ2ltYWcnKVxuICB9XG5cbiAgZXhwb3J0cy5Db21wbGV4QXJyYXkgPSBDb21wbGV4QXJyYXkgPSBmdW5jdGlvbihvdGhlciwgb3B0X2FycmF5X3R5cGUpe1xuICAgIGlmIChpc0NvbXBsZXhBcnJheShvdGhlcikpIHtcbiAgICAgIC8vIENvcHkgY29uc3R1Y3Rvci5cbiAgICAgIHRoaXMuQXJyYXlUeXBlID0gb3RoZXIuQXJyYXlUeXBlXG4gICAgICB0aGlzLnJlYWwgPSBuZXcgdGhpcy5BcnJheVR5cGUob3RoZXIucmVhbClcbiAgICAgIHRoaXMuaW1hZyA9IG5ldyB0aGlzLkFycmF5VHlwZShvdGhlci5pbWFnKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLkFycmF5VHlwZSA9IG9wdF9hcnJheV90eXBlIHx8IERlZmF1bHRBcnJheVR5cGVcbiAgICAgIC8vIG90aGVyIGNhbiBiZSBlaXRoZXIgYW4gYXJyYXkgb3IgYSBudW1iZXIuXG4gICAgICB0aGlzLnJlYWwgPSBuZXcgdGhpcy5BcnJheVR5cGUob3RoZXIpXG4gICAgICB0aGlzLmltYWcgPSBuZXcgdGhpcy5BcnJheVR5cGUodGhpcy5yZWFsLmxlbmd0aClcbiAgICB9XG5cbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMucmVhbC5sZW5ndGhcbiAgfVxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29tcG9uZW50cyA9IFtdXG5cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oY192YWx1ZSwgaSkge1xuICAgICAgY29tcG9uZW50cy5wdXNoKFxuICAgICAgICAnKCcgK1xuICAgICAgICBjX3ZhbHVlLnJlYWwudG9GaXhlZCgyKSArICcsJyArXG4gICAgICAgIGNfdmFsdWUuaW1hZy50b0ZpeGVkKDIpICtcbiAgICAgICAgJyknXG4gICAgICApXG4gICAgfSlcblxuICAgIHJldHVybiAnWycgKyBjb21wb25lbnRzLmpvaW4oJywnKSArICddJ1xuICB9XG5cbiAgLy8gSW4tcGxhY2UgbWFwcGVyLlxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKG1hcHBlcikge1xuICAgIHZhclxuICAgICAgaSxcbiAgICAgIG4gPSB0aGlzLmxlbmd0aCxcbiAgICAgIC8vIEZvciBHQyBlZmZpY2llbmN5LCBwYXNzIGEgc2luZ2xlIGNfdmFsdWUgb2JqZWN0IHRvIHRoZSBtYXBwZXIuXG4gICAgICBjX3ZhbHVlID0ge31cblxuICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNfdmFsdWUucmVhbCA9IHRoaXMucmVhbFtpXVxuICAgICAgY192YWx1ZS5pbWFnID0gdGhpcy5pbWFnW2ldXG4gICAgICBtYXBwZXIoY192YWx1ZSwgaSwgbilcbiAgICAgIHRoaXMucmVhbFtpXSA9IGNfdmFsdWUucmVhbFxuICAgICAgdGhpcy5pbWFnW2ldID0gY192YWx1ZS5pbWFnXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGl0ZXJhdG9yKSB7XG4gICAgdmFyXG4gICAgICBpLFxuICAgICAgbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggLm1hcC5cbiAgICAgIGNfdmFsdWUgPSB7fVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgY192YWx1ZS5yZWFsID0gdGhpcy5yZWFsW2ldXG4gICAgICBjX3ZhbHVlLmltYWcgPSB0aGlzLmltYWdbaV1cbiAgICAgIGl0ZXJhdG9yKGNfdmFsdWUsIGksIG4pXG4gICAgfVxuICB9XG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKG5ldyBDb21wbGV4QXJyYXkodGhpcykpLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFsdWUuaW1hZyAqPSAtMVxuICAgIH0pXG4gIH1cblxuICAvLyBIZWxwZXIgc28gd2UgY2FuIG1ha2UgQXJyYXlUeXBlIG9iamVjdHMgcmV0dXJuZWQgaGF2ZSBzaW1pbGFyIGludGVyZmFjZXNcbiAgLy8gICB0byBDb21wbGV4QXJyYXlzLlxuICBmdW5jdGlvbiBpdGVyYWJsZShvYmopIHtcbiAgICBpZiAoIW9iai5mb3JFYWNoKVxuICAgICAgb2JqLmZvckVhY2ggPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgICAgICB2YXIgaSwgbiA9IHRoaXMubGVuZ3RoXG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG47IGkrKylcbiAgICAgICAgICBpdGVyYXRvcih0aGlzW2ldLCBpLCBuKVxuICAgICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5tYWduaXR1ZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFncyA9IG5ldyB0aGlzLkFycmF5VHlwZSh0aGlzLmxlbmd0aClcblxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaSkge1xuICAgICAgbWFnc1tpXSA9IHNxcnQoc3FyKHZhbHVlLnJlYWwpICsgc3FyKHZhbHVlLmltYWcpKVxuICAgIH0pXG5cbiAgICAvLyBBcnJheVR5cGUgd2lsbCBub3QgbmVjZXNzYXJpbHkgYmUgaXRlcmFibGU6IG1ha2UgaXQgc28uXG4gICAgcmV0dXJuIGl0ZXJhYmxlKG1hZ3MpXG4gIH1cbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnICYmICh0aGlzLmNvbXBsZXhfYXJyYXkgPSB7fSkgfHwgZXhwb3J0cylcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKGV4cG9ydHMsIGNvbXBsZXhfYXJyYXkpIHtcblxuICB2YXJcbiAgICBDb21wbGV4QXJyYXkgPSBjb21wbGV4X2FycmF5LkNvbXBsZXhBcnJheSxcbiAgICAvLyBNYXRoIGNvbnN0YW50cyBhbmQgZnVuY3Rpb25zIHdlIG5lZWQuXG4gICAgUEkgPSBNYXRoLlBJLFxuICAgIFNRUlQxXzIgPSBNYXRoLlNRUlQxXzIsXG4gICAgc3FydCA9IE1hdGguc3FydCxcbiAgICBjb3MgPSBNYXRoLmNvcyxcbiAgICBzaW4gPSBNYXRoLnNpblxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUuRkZUID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEZGVCh0aGlzLCBmYWxzZSlcbiAgfVxuXG4gIGV4cG9ydHMuRkZUID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gZW5zdXJlQ29tcGxleEFycmF5KGlucHV0KS5GRlQoKVxuICB9XG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5JbnZGRlQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRkZUKHRoaXMsIHRydWUpXG4gIH1cblxuICBleHBvcnRzLkludkZGVCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIGVuc3VyZUNvbXBsZXhBcnJheShpbnB1dCkuSW52RkZUKClcbiAgfVxuXG4gIC8vIEFwcGxpZXMgYSBmcmVxdWVuY3ktc3BhY2UgZmlsdGVyIHRvIGlucHV0LCBhbmQgcmV0dXJucyB0aGUgcmVhbC1zcGFjZVxuICAvLyBmaWx0ZXJlZCBpbnB1dC5cbiAgLy8gZmlsdGVyZXIgYWNjZXB0cyBmcmVxLCBpLCBuIGFuZCBtb2RpZmllcyBmcmVxLnJlYWwgYW5kIGZyZXEuaW1hZy5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5mcmVxdWVuY3lNYXAgPSBmdW5jdGlvbihmaWx0ZXJlcikge1xuICAgIHJldHVybiB0aGlzLkZGVCgpLm1hcChmaWx0ZXJlcikuSW52RkZUKClcbiAgfVxuXG4gIGV4cG9ydHMuZnJlcXVlbmN5TWFwID0gZnVuY3Rpb24oaW5wdXQsIGZpbHRlcmVyKSB7XG4gICAgcmV0dXJuIGVuc3VyZUNvbXBsZXhBcnJheShpbnB1dCkuZnJlcXVlbmN5TWFwKGZpbHRlcmVyKVxuICB9XG5cbiAgZnVuY3Rpb24gZW5zdXJlQ29tcGxleEFycmF5KGlucHV0KSB7XG4gICAgcmV0dXJuIGNvbXBsZXhfYXJyYXkuaXNDb21wbGV4QXJyYXkoaW5wdXQpICYmIGlucHV0IHx8XG4gICAgICAgIG5ldyBDb21wbGV4QXJyYXkoaW5wdXQpXG4gIH1cblxuICBmdW5jdGlvbiBGRlQoaW5wdXQsIGludmVyc2UpIHtcbiAgICB2YXIgbiA9IGlucHV0Lmxlbmd0aFxuXG4gICAgaWYgKG4gJiAobiAtIDEpKSB7XG4gICAgICByZXR1cm4gRkZUX1JlY3Vyc2l2ZShpbnB1dCwgaW52ZXJzZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEZGVF8yX0l0ZXJhdGl2ZShpbnB1dCwgaW52ZXJzZSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBGRlRfUmVjdXJzaXZlKGlucHV0LCBpbnZlcnNlKSB7XG4gICAgdmFyXG4gICAgICBuID0gaW5wdXQubGVuZ3RoLFxuICAgICAgLy8gQ291bnRlcnMuXG4gICAgICBpLCBqLFxuICAgICAgb3V0cHV0LFxuICAgICAgLy8gQ29tcGxleCBtdWx0aXBsaWVyIGFuZCBpdHMgZGVsdGEuXG4gICAgICBmX3IsIGZfaSwgZGVsX2ZfciwgZGVsX2ZfaSxcbiAgICAgIC8vIExvd2VzdCBkaXZpc29yIGFuZCByZW1haW5kZXIuXG4gICAgICBwLCBtLFxuICAgICAgbm9ybWFsaXNhdGlvbixcbiAgICAgIHJlY3Vyc2l2ZV9yZXN1bHQsXG4gICAgICBfc3dhcCwgX3JlYWwsIF9pbWFnXG5cbiAgICBpZiAobiA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlucHV0XG4gICAgfVxuXG4gICAgb3V0cHV0ID0gbmV3IENvbXBsZXhBcnJheShuLCBpbnB1dC5BcnJheVR5cGUpXG5cbiAgICAvLyBVc2UgdGhlIGxvd2VzdCBvZGQgZmFjdG9yLCBzbyB3ZSBhcmUgYWJsZSB0byB1c2UgRkZUXzJfSXRlcmF0aXZlIGluIHRoZVxuICAgIC8vIHJlY3Vyc2l2ZSB0cmFuc2Zvcm1zIG9wdGltYWxseS5cbiAgICBwID0gTG93ZXN0T2RkRmFjdG9yKG4pXG4gICAgbSA9IG4gLyBwXG4gICAgbm9ybWFsaXNhdGlvbiA9IDEgLyBzcXJ0KHApXG4gICAgcmVjdXJzaXZlX3Jlc3VsdCA9IG5ldyBDb21wbGV4QXJyYXkobSwgaW5wdXQuQXJyYXlUeXBlKVxuXG4gICAgLy8gTG9vcHMgZ28gbGlrZSBPKG4gzqMgcF9pKSwgd2hlcmUgcF9pIGFyZSB0aGUgcHJpbWUgZmFjdG9ycyBvZiBuLlxuICAgIC8vIGZvciBhIHBvd2VyIG9mIGEgcHJpbWUsIHAsIHRoaXMgcmVkdWNlcyB0byBPKG4gcCBsb2dfcCBuKVxuICAgIGZvcihqID0gMDsgaiA8IHA7IGorKykge1xuICAgICAgZm9yKGkgPSAwOyBpIDwgbTsgaSsrKSB7XG4gICAgICAgIHJlY3Vyc2l2ZV9yZXN1bHQucmVhbFtpXSA9IGlucHV0LnJlYWxbaSAqIHAgKyBqXVxuICAgICAgICByZWN1cnNpdmVfcmVzdWx0LmltYWdbaV0gPSBpbnB1dC5pbWFnW2kgKiBwICsgal1cbiAgICAgIH1cbiAgICAgIC8vIERvbid0IGdvIGRlZXBlciB1bmxlc3MgbmVjZXNzYXJ5IHRvIHNhdmUgYWxsb2NzLlxuICAgICAgaWYgKG0gPiAxKSB7XG4gICAgICAgIHJlY3Vyc2l2ZV9yZXN1bHQgPSBGRlQocmVjdXJzaXZlX3Jlc3VsdCwgaW52ZXJzZSlcbiAgICAgIH1cblxuICAgICAgZGVsX2ZfciA9IGNvcygyKlBJKmovbilcbiAgICAgIGRlbF9mX2kgPSAoaW52ZXJzZSA/IC0xIDogMSkgKiBzaW4oMipQSSpqL24pXG4gICAgICBmX3IgPSAxXG4gICAgICBmX2kgPSAwXG5cbiAgICAgIGZvcihpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICBfcmVhbCA9IHJlY3Vyc2l2ZV9yZXN1bHQucmVhbFtpICUgbV1cbiAgICAgICAgX2ltYWcgPSByZWN1cnNpdmVfcmVzdWx0LmltYWdbaSAlIG1dXG5cbiAgICAgICAgb3V0cHV0LnJlYWxbaV0gKz0gZl9yICogX3JlYWwgLSBmX2kgKiBfaW1hZ1xuICAgICAgICBvdXRwdXQuaW1hZ1tpXSArPSBmX3IgKiBfaW1hZyArIGZfaSAqIF9yZWFsXG5cbiAgICAgICAgX3N3YXAgPSBmX3IgKiBkZWxfZl9yIC0gZl9pICogZGVsX2ZfaVxuICAgICAgICBmX2kgPSBmX3IgKiBkZWxfZl9pICsgZl9pICogZGVsX2ZfclxuICAgICAgICBmX3IgPSBfc3dhcFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvcHkgYmFjayB0byBpbnB1dCB0byBtYXRjaCBGRlRfMl9JdGVyYXRpdmUgaW4tcGxhY2VuZXNzXG4gICAgLy8gVE9ETzogZmFzdGVyIHdheSBvZiBtYWtpbmcgdGhpcyBpbi1wbGFjZT9cbiAgICBmb3IoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGlucHV0LnJlYWxbaV0gPSBub3JtYWxpc2F0aW9uICogb3V0cHV0LnJlYWxbaV1cbiAgICAgIGlucHV0LmltYWdbaV0gPSBub3JtYWxpc2F0aW9uICogb3V0cHV0LmltYWdbaV1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5wdXRcbiAgfVxuXG4gIGZ1bmN0aW9uIEZGVF8yX0l0ZXJhdGl2ZShpbnB1dCwgaW52ZXJzZSkge1xuICAgIHZhclxuICAgICAgbiA9IGlucHV0Lmxlbmd0aCxcbiAgICAgIC8vIENvdW50ZXJzLlxuICAgICAgaSwgaixcbiAgICAgIG91dHB1dCwgb3V0cHV0X3IsIG91dHB1dF9pLFxuICAgICAgLy8gQ29tcGxleCBtdWx0aXBsaWVyIGFuZCBpdHMgZGVsdGEuXG4gICAgICBmX3IsIGZfaSwgZGVsX2ZfciwgZGVsX2ZfaSwgdGVtcCxcbiAgICAgIC8vIFRlbXBvcmFyeSBsb29wIHZhcmlhYmxlcy5cbiAgICAgIGxfaW5kZXgsIHJfaW5kZXgsXG4gICAgICBsZWZ0X3IsIGxlZnRfaSwgcmlnaHRfciwgcmlnaHRfaSxcbiAgICAgIC8vIHdpZHRoIG9mIGVhY2ggc3ViLWFycmF5IGZvciB3aGljaCB3ZSdyZSBpdGVyYXRpdmVseSBjYWxjdWxhdGluZyBGRlQuXG4gICAgICB3aWR0aFxuXG4gICAgb3V0cHV0ID0gQml0UmV2ZXJzZUNvbXBsZXhBcnJheShpbnB1dClcbiAgICBvdXRwdXRfciA9IG91dHB1dC5yZWFsXG4gICAgb3V0cHV0X2kgPSBvdXRwdXQuaW1hZ1xuICAgIC8vIExvb3BzIGdvIGxpa2UgTyhuIGxvZyBuKTpcbiAgICAvLyAgIHdpZHRoIH4gbG9nIG47IGksaiB+IG5cbiAgICB3aWR0aCA9IDFcbiAgICB3aGlsZSAod2lkdGggPCBuKSB7XG4gICAgICBkZWxfZl9yID0gY29zKFBJL3dpZHRoKVxuICAgICAgZGVsX2ZfaSA9IChpbnZlcnNlID8gLTEgOiAxKSAqIHNpbihQSS93aWR0aClcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuLygyKndpZHRoKTsgaSsrKSB7XG4gICAgICAgIGZfciA9IDFcbiAgICAgICAgZl9pID0gMFxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgICAgIGxfaW5kZXggPSAyKmkqd2lkdGggKyBqXG4gICAgICAgICAgcl9pbmRleCA9IGxfaW5kZXggKyB3aWR0aFxuXG4gICAgICAgICAgbGVmdF9yID0gb3V0cHV0X3JbbF9pbmRleF1cbiAgICAgICAgICBsZWZ0X2kgPSBvdXRwdXRfaVtsX2luZGV4XVxuICAgICAgICAgIHJpZ2h0X3IgPSBmX3IgKiBvdXRwdXRfcltyX2luZGV4XSAtIGZfaSAqIG91dHB1dF9pW3JfaW5kZXhdXG4gICAgICAgICAgcmlnaHRfaSA9IGZfaSAqIG91dHB1dF9yW3JfaW5kZXhdICsgZl9yICogb3V0cHV0X2lbcl9pbmRleF1cblxuICAgICAgICAgIG91dHB1dF9yW2xfaW5kZXhdID0gU1FSVDFfMiAqIChsZWZ0X3IgKyByaWdodF9yKVxuICAgICAgICAgIG91dHB1dF9pW2xfaW5kZXhdID0gU1FSVDFfMiAqIChsZWZ0X2kgKyByaWdodF9pKVxuICAgICAgICAgIG91dHB1dF9yW3JfaW5kZXhdID0gU1FSVDFfMiAqIChsZWZ0X3IgLSByaWdodF9yKVxuICAgICAgICAgIG91dHB1dF9pW3JfaW5kZXhdID0gU1FSVDFfMiAqIChsZWZ0X2kgLSByaWdodF9pKVxuICAgICAgICAgIHRlbXAgPSBmX3IgKiBkZWxfZl9yIC0gZl9pICogZGVsX2ZfaVxuICAgICAgICAgIGZfaSA9IGZfciAqIGRlbF9mX2kgKyBmX2kgKiBkZWxfZl9yXG4gICAgICAgICAgZl9yID0gdGVtcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aWR0aCA8PD0gMVxuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXRcbiAgfVxuXG4gIGZ1bmN0aW9uIEJpdFJldmVyc2VJbmRleChpbmRleCwgbikge1xuICAgIHZhciBiaXRyZXZlcnNlZF9pbmRleCA9IDBcblxuICAgIHdoaWxlIChuID4gMSkge1xuICAgICAgYml0cmV2ZXJzZWRfaW5kZXggPDw9IDFcbiAgICAgIGJpdHJldmVyc2VkX2luZGV4ICs9IGluZGV4ICYgMVxuICAgICAgaW5kZXggPj49IDFcbiAgICAgIG4gPj49IDFcbiAgICB9XG4gICAgcmV0dXJuIGJpdHJldmVyc2VkX2luZGV4XG4gIH1cblxuICBmdW5jdGlvbiBCaXRSZXZlcnNlQ29tcGxleEFycmF5KGFycmF5KSB7XG4gICAgdmFyIG4gPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGZsaXBzID0ge30sXG4gICAgICAgIHN3YXAsXG4gICAgICAgIGlcblxuICAgIGZvcihpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgdmFyIHJfaSA9IEJpdFJldmVyc2VJbmRleChpLCBuKVxuXG4gICAgICBpZiAoZmxpcHMuaGFzT3duUHJvcGVydHkoaSkgfHwgZmxpcHMuaGFzT3duUHJvcGVydHkocl9pKSkgY29udGludWVcblxuICAgICAgc3dhcCA9IGFycmF5LnJlYWxbcl9pXVxuICAgICAgYXJyYXkucmVhbFtyX2ldID0gYXJyYXkucmVhbFtpXVxuICAgICAgYXJyYXkucmVhbFtpXSA9IHN3YXBcblxuICAgICAgc3dhcCA9IGFycmF5LmltYWdbcl9pXVxuICAgICAgYXJyYXkuaW1hZ1tyX2ldID0gYXJyYXkuaW1hZ1tpXVxuICAgICAgYXJyYXkuaW1hZ1tpXSA9IHN3YXBcblxuICAgICAgZmxpcHNbaV0gPSBmbGlwc1tyX2ldID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgZnVuY3Rpb24gTG93ZXN0T2RkRmFjdG9yKG4pIHtcbiAgICB2YXIgZmFjdG9yID0gMyxcbiAgICAgICAgc3FydF9uID0gc3FydChuKVxuXG4gICAgd2hpbGUoZmFjdG9yIDw9IHNxcnRfbikge1xuICAgICAgaWYgKG4gJSBmYWN0b3IgPT09IDApIHJldHVybiBmYWN0b3JcbiAgICAgIGZhY3RvciA9IGZhY3RvciArIDJcbiAgICB9XG4gICAgcmV0dXJuIG5cbiAgfVxuXG59KFxuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKHRoaXMuZmZ0ID0ge30pIHx8IGV4cG9ydHMsXG4gIHR5cGVvZiByZXF1aXJlID09PSAndW5kZWZpbmVkJyAmJiAodGhpcy5jb21wbGV4X2FycmF5KSB8fFxuICAgIHJlcXVpcmUoJy4vY29tcGxleF9hcnJheScpXG4pXG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZ2xvYmFsID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSkoKTtcblxuLyoqXG4gKiBXZWJTb2NrZXQgY29uc3RydWN0b3IuXG4gKi9cblxudmFyIFdlYlNvY2tldCA9IGdsb2JhbC5XZWJTb2NrZXQgfHwgZ2xvYmFsLk1veldlYlNvY2tldDtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldCA/IHdzIDogbnVsbDtcblxuLyoqXG4gKiBXZWJTb2NrZXQgY29uc3RydWN0b3IuXG4gKlxuICogVGhlIHRoaXJkIGBvcHRzYCBvcHRpb25zIG9iamVjdCBnZXRzIGlnbm9yZWQgaW4gd2ViIGJyb3dzZXJzLCBzaW5jZSBpdCdzXG4gKiBub24tc3RhbmRhcmQsIGFuZCB0aHJvd3MgYSBUeXBlRXJyb3IgaWYgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2VpbmFyb3Mvd3MvaXNzdWVzLzIyN1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmlcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3RvY29scyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge09iamVjdCkgb3B0cyAob3B0aW9uYWwpXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHdzKHVyaSwgcHJvdG9jb2xzLCBvcHRzKSB7XG4gIHZhciBpbnN0YW5jZTtcbiAgaWYgKHByb3RvY29scykge1xuICAgIGluc3RhbmNlID0gbmV3IFdlYlNvY2tldCh1cmksIHByb3RvY29scyk7XG4gIH0gZWxzZSB7XG4gICAgaW5zdGFuY2UgPSBuZXcgV2ViU29ja2V0KHVyaSk7XG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5pZiAoV2ViU29ja2V0KSB3cy5wcm90b3R5cGUgPSBXZWJTb2NrZXQucHJvdG90eXBlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvcmU6IHtcbiAgICBCYXNlTGZvICAgICAgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9jb3JlL2Jhc2UtbGZvJyksXG4gIH0sXG4gIHNvdXJjZXM6IHtcbiAgICBBdWRpb0luQnVmZmVyICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zb3VyY2VzL2F1ZGlvLWluLWJ1ZmZlcicpLFxuICAgIEF1ZGlvSW5Ob2RlICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NvdXJjZXMvYXVkaW8taW4tbm9kZScpLFxuICAgIEV2ZW50SW4gICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NvdXJjZXMvZXZlbnQtaW4nKSxcbiAgICAvLyByZXRlc3RcbiAgICBTb2NrZXRDbGllbnQgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zb3VyY2VzL3NvY2tldC1jbGllbnQnKSxcbiAgICBTb2NrZXRTZXJ2ZXIgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zb3VyY2VzL3NvY2tldC1zZXJ2ZXInKSxcbiAgfSxcbiAgc2lua3M6IHtcbiAgICBBdWRpb1JlY29yZGVyICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zaW5rcy9hdWRpby1yZWNvcmRlcicpLFxuICAgIEJwZiAgICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL2JwZicpLFxuICAgIEJyaWRnZSAgICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL2JyaWRnZScpLFxuICAgIERhdGFSZWNvcmRlciAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL2RhdGEtcmVjb3JkZXInKSxcbiAgICBUcmFjZSAgICAgICAgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zaW5rcy90cmFjZScpLFxuICAgIFNwZWN0cm9ncmFtICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL3NwZWN0cm9ncmFtJyksXG4gICAgU29ja2V0Q2xpZW50ICAgICAgOiByZXF1aXJlKCcuL2Rpc3Qvc2lua3Mvc29ja2V0LWNsaWVudCcpLFxuICAgIFNvY2tldFNlcnZlciAgICAgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL3NvY2tldC1zZXJ2ZXInKSxcbiAgICBTb25vZ3JhbSAgICAgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9zaW5rcy9zb25vZ3JhbScpLFxuICAgIFN5bmNocm9uaXplZERyYXcgIDogcmVxdWlyZSgnLi9kaXN0L3NpbmtzL3N5bmNocm9uaXplZC1kcmF3JyksXG4gICAgV2F2ZWZvcm0gICAgICAgICAgOiByZXF1aXJlKCcuL2Rpc3Qvc2lua3Mvd2F2ZWZvcm0nKSxcbiAgfSxcbiAgb3BlcmF0b3JzOiB7XG4gICAgQmlxdWFkICAgICAgICAgICAgOiByZXF1aXJlKCcuL2Rpc3Qvb3BlcmF0b3JzL2JpcXVhZCcpLFxuICAgIEZmdCAgICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L29wZXJhdG9ycy9mZnQnKSxcbiAgICAvLyBJZmZ0ICAgICAgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9vcGVyYXRvcnMvaWZmdCcpLFxuICAgIEZyYW1lciAgICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L29wZXJhdG9ycy9mcmFtZXInKSxcbiAgICBNYWduaXR1ZGUgICAgICAgICA6IHJlcXVpcmUoJy4vZGlzdC9vcGVyYXRvcnMvbWFnbml0dWRlJyksXG4gICAgTWluTWF4ICAgICAgICAgICAgOiByZXF1aXJlKCcuL2Rpc3Qvb3BlcmF0b3JzL21pbi1tYXgnKSxcbiAgICBNb3ZpbmdBdmVyYWdlICAgICA6IHJlcXVpcmUoJy4vZGlzdC9vcGVyYXRvcnMvbW92aW5nLWF2ZXJhZ2UnKSxcbiAgICBNb3ZpbmdNZWRpYW4gICAgICA6IHJlcXVpcmUoJy4vZGlzdC9vcGVyYXRvcnMvbW92aW5nLW1lZGlhbicpLFxuICAgIE5vb3AgICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9kaXN0L29wZXJhdG9ycy9ub29wJyksXG4gICAgT3BlcmF0b3IgICAgICAgICAgOiByZXF1aXJlKCcuL2Rpc3Qvb3BlcmF0b3JzL29wZXJhdG9yJyksXG4gIH0sXG59O1xuIl19
