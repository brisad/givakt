require.config({
  baseUrl: './',
  packages: [
    {
      name: 'physicsjs',
      location: 'js/vendor/physicsjs-0.6.0',
      main: 'physicsjs-0.6.0.min'
    }
  ],
});

var worldWidth = 500;
var worldHeight = 500;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

require(['require',
         'physicsjs',
         'physicsjs/renderers/canvas',
         'physicsjs/bodies/circle',
         'physicsjs/behaviors/body-impulse-response',
         'physicsjs/behaviors/body-collision-detection',
         'physicsjs/behaviors/edge-collision-detection',
         'physicsjs/behaviors/sweep-prune'], function (require, Physics) {

  var createWorld = function (freeIonImg) {

    Physics(function (world) {

      var addIon = function () {
        var radius = 30;
        var ion = Physics.body('circle', {
          x: getRandomInt(radius, worldWidth - radius),
          y: getRandomInt(radius, worldHeight - radius),
          vx: 0.4,
          vy: 0.2,
          radius: 30,
          restitution: 1,
        });

        ion.view = new Image();
        ion.view.src = freeIonImg;
        world.add(ion);
      };

      var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: worldWidth,
        height: worldHeight
      });
      world.add(renderer);

      addIon();
      addIon();
      addIon();
      addIon();

      Physics.util.ticker.on(function (time, dt) {
        world.step(time);
      });

      Physics.util.ticker.start();

      world.on('step', function () {
        world.render();
      });

      var bounds = Physics.aabb(0, 0, worldWidth, worldHeight);

      world.add(Physics.behavior('edge-collision-detection', {
        aabb: bounds,
        restitution: 1,
        cof: 0
      }));
      world.add(Physics.behavior('body-impulse-response'));
      world.add(Physics.behavior('body-collision-detection'));
      world.add(Physics.behavior('sweep-prune'));
    });
  }

  var loadImage = function (url, width, height, callback) {
    var img = new Image();
    img.src = require.toUrl(url);
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL());
    }
  };

  // Load the free ion image and create the world when finished
  loadImage('img/freeion1.png', 100, 70, createWorld);
});
