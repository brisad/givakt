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

var borderWidth = parseInt($('#viewport').css('border-left-width'));
var worldWidth = window.innerWidth - borderWidth * 2;
var worldHeight = window.innerHeight - borderWidth * 2;
var ionRadius = Math.max(worldWidth, worldHeight) / 20;

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
        var ion = Physics.body('circle', {
          x: getRandomInt(ionRadius, worldWidth - ionRadius),
          y: getRandomInt(ionRadius, worldHeight - ionRadius),
          vx: 0.4,
          vy: 0.2,
          radius: ionRadius,
          restitution: 1,
        });

        ion.view = new Image();
        ion.view.src = freeIonImg;
        world.add(ion);
      };

      var addUnknownIon = function () {
        var radius = getRandomInt(ionRadius - 10, ionRadius + 10);
        var c = getRandomInt(100, 200);
        var color = 'rgb(' + c + ',' + c + ',' + c + ')';
        var ion = Physics.body('circle', {
          x: getRandomInt(radius, worldWidth - radius),
          y: getRandomInt(radius, worldHeight - radius),
          vx: 0.4,
          vy: 0.2,
          radius: radius,
          restitution: 1,
          styles: {
            fillStyle: color,
            angleIndicator: color
          }
        });
        world.add(ion);
      };

      var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: worldWidth,
        height: worldHeight,

        styles: {
          'circle': {
            strokeStyle: 'rgb(0, 30, 0)',
            lineWidth: 4,
            fillStyle: 'rgb(200, 200, 200)',
            angleIndicator: false
          }
        }
      });
      world.add(renderer);

      addIon();
      addIon();
      for (var i = 0; i < 12; i++) {
        addUnknownIon();
      }

      Physics.util.ticker.on(function (time, dt) {
        world.step(time);
      });

      Physics.util.ticker.start();

      world.on('step', function () {
        world.render();
      });

      var bounds = Physics.aabb(0, 0, worldWidth, worldHeight);

      var edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: bounds,
        restitution: 1,
        cof: 0
      });

      world.add(edgeBounce);
      world.add(Physics.behavior('body-impulse-response'));
      world.add(Physics.behavior('body-collision-detection'));
      world.add(Physics.behavior('sweep-prune'));

      window.addEventListener('resize', function () {
        var borderWidth = parseInt($('#viewport').css('border-left-width'));
        worldWidth = window.innerWidth - borderWidth * 2;
        worldHeight = window.innerHeight - borderWidth * 2;
        renderer.el.width = worldWidth;
        renderer.el.height = worldHeight;
        bounds = Physics.aabb(0, 0, worldWidth, worldHeight);
        edgeBounce.setAABB(bounds);
      }, true);

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
  loadImage('img/freeion1.png', ionRadius*3.33, ionRadius*2.33, createWorld);
});
