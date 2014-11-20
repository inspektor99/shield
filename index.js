var gpio = require('pi-gpio');
var _ = require('lodash');

//TODO: use events to better handle opening and closing of GPIOs
// var events = require('events');
// var eventEmitter = new events.EventEmitter();

var durationId;

/**
 * targetSim
 * 
 * @type {Array}
 */
var targetSim = [
  {
    id: 1,
    isHit: false,
    led: {pin: 11, mode: 1, iid: null},
    button: {pin: 7, mode: 1, iid: null, set: false}
  },
  {
    id: 2,
    isHit: false,
    led: {pin: 15, mode: 1, iid: null},
    button: {pin: 13, mode: 1, iid: null, set: false}
  },
  {
    id: 3,
    isHit: false,
    led: {pin: 16, mode: 1, iid: null},
    button: {pin: 12, mode: 1, iid: null, set: false}
  },
  {
    id: 4,
    isHit: false,
    led: {pin: 22, mode: 1, iid: null},
    button: {pin: 18, mode: 1, iid: null, set: false}
  }
];

var len = targetSim.length;

var blinkLed = function(targetIndex) {
  var target = targetSim[targetIndex];
  var led = targetSim[targetIndex].led;

  gpio.close(led.pin, function() {
    gpio.open(led.pin, 'output', function(err) {
      console.log('opening led pin ' + led.pin + ' target ' + target.id);

      led.iid = setInterval(function() {
        gpio.write(led.pin, led.mode, function() {
          led.mode = (led.mode + 1) % 2; 
        });
      }, 100);
    });
  });
};

var initLeds = function(targetIndex) {
  blinkLed(targetIndex);
  if (targetIndex < len - 1) {
    targetIndex = targetIndex + 1;
    initLeds(targetIndex);
  }
};

var initButtons = function(targetIndex){
  var target = targetSim[targetIndex];

  var button = target.button;
  var led = target.led;

  gpio.close(button.pin, function() {
    gpio.open(button.pin, 'input', function(err) {
      console.log('opening button pin ' + button.pin + ' target ' + target.id);

      button.iid = setInterval(function() {

        gpio.read(button.pin, function(err, value){

          if (value === 0 && !button.set) {
            button.mode = (button.mode + 1) % 2;
            button.set = true;

            var index = _.indexOf(targetSim, target);
            if (!button.mode) {
              target.isHit = true;

              console.log('target ' + target.id + ' hit!');
              stopLed(index);
            }
            else {
              //reset target
              target.isHit = false;

              console.log('target ' + target.id + ' revived!');
              blinkLed(index);
            }
          }
          else if (value === 1) {
            button.set = false;
          }
        });
      }, 25);
      
    });
  });

  if (targetIndex < len - 1) {
    targetIndex = targetIndex + 1;
    initButtons(targetIndex);
  }
};

var initSimulator = function() {
  initLeds(0);
  initButtons(0);
};

initSimulator();

var stopLed = function(targetIndex) {
  var target = targetSim[targetIndex];
  var led = targetSim[targetIndex].led;

  clearInterval(led.iid);

  gpio.write(led.pin, 0, function() {
    gpio.close(led.pin, function() {
      
    });
  });
};
