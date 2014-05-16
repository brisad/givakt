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

var energyPerIon = 0.5;
var controlsWidth = 100;
$('#controls').css('width', controlsWidth);

var borderWidth = parseInt($('#viewport').css('border-left-width'));
var worldWidth = window.innerWidth - borderWidth * 2 - controlsWidth;
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

      var ions = [];

      var makeIon = function (options) {
        var energy = energyPerIon;
        var direction = Math.random() * Math.PI;
        return Physics.body(
          'circle',
          $.extend({
            x: getRandomInt(ionRadius, worldWidth - ionRadius),
            y: getRandomInt(ionRadius, worldHeight - ionRadius),
            vx: energy * Math.cos(direction),
            vy: energy * Math.sin(direction),
            radius: ionRadius,
            restitution: 1,
          }, options));
      };

      var addFreeIon = function (options) {
        var ion = makeIon(options);
        ion.view = new Image();
        ion.view.src = freeIonImg;
        ions.push(ion);
        world.add(ion);
      };

      var addUnknownIon = function () {
        var radius = getRandomInt(ionRadius - 20, ionRadius + 10);
        var c = getRandomInt(100, 200);
        var color = 'rgb(' + c + ',' + c + ',' + c + ')';
        var ion = makeIon({radius: radius,
                           styles: {
                             fillStyle: color,
                             angleIndicator: color
                           }});
        ions.push(ion);
        world.add(ion);
      };

      var addIonsToWorld = function (alternative) {
        if (alternative < 3) {
          addFreeIon({x: ionRadius, y: worldHeight - ionRadius});
          addFreeIon({x: worldWidth - ionRadius, y: ionRadius});
        } else {
          addFreeIon();
        }

        if (alternative > 1) {
          for (var i = 0; i < 12; i++) {
            addUnknownIon();
          }
        }
      }

      var setTitleBackground = function (alternative) {
        if (alternative == 3) {
          $('canvas').addClass('title');
        } else {
          $('canvas').removeClass('title');
        }
      }

      setTitleBackground(parseInt($('#alternative').val()));
      addIonsToWorld(parseInt($('#alternative').val()));

      var self = this;
      $('#alternative').on('change', function () {
        var alternative = parseInt($(this).val());
        setTitleBackground(alternative);
        // Remove all ions
        self.remove(ions);
        ions.length = 0;
        // Add new ions
        addIonsToWorld(alternative);
      });

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

      Physics.util.ticker.on(function (time, dt) {
        world.step(time);
      });

      Physics.util.ticker.start();

      world.on('step', function () {
        var targetEnergy = energyPerIon * ions.length;
        var currentEnergy = ions.reduce(function (prev, curr) {
          return prev + curr.state.vel.norm();
        }, 0);

        var diff = targetEnergy - currentEnergy;
        if (diff > 0) {
          ions.forEach(function (ion) {
            var length = ion.state.vel.norm();
            ion.state.vel.vadd(ion.state.vel.clone().normalize().mult(
              length / currentEnergy * diff));
          });
        }

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
        worldWidth = window.innerWidth - borderWidth * 2 - controlsWidth;
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
