require.config({
  baseUrl: './js/vendor',
  packages: [
    {
      name: 'physicsjs',
      location: 'physicsjs-0.6.0',
      main: 'physicsjs-0.6.0.min'
    }
  ],
});

console.log("OK");
require(['physicsjs',
         'physicsjs/renderers/canvas',
         'physicsjs/bodies/circle',
         'physicsjs/behaviors/constant-acceleration',
         'physicsjs/behaviors/body-impulse-response',
         'physicsjs/behaviors/body-collision-detection',
         'physicsjs/behaviors/edge-collision-detection',
         'physicsjs/behaviors/sweep-prune'], function (Physics) {

  Physics(function (world) {
    var renderer = Physics.renderer('canvas', {
      el: 'viewport',
      width: 500,
      height: 500
    });
    world.add(renderer);

    world.add(Physics.body('circle', {
      x: 250,
      y: 250,
      vx: 0.01,
      radius: 10,
    }));

    world.add(Physics.body('circle', {
      x: 250,
      y: 280,
      vx: 0.01,
      radius: 10,
    }));

    world.render();

    Physics.util.ticker.on(function (time, dt) {
      world.step(time);
    });

    Physics.util.ticker.start();

    world.on('step', function () {
      world.render();
    });

    world.add(Physics.behavior('constant-acceleration'));

    var bounds = Physics.aabb(0, 0, 500, 500);

    world.add(Physics.behavior('edge-collision-detection', {
      aabb: bounds,
      restitution: 0.3
    }));
    world.add(Physics.behavior('body-impulse-response'));
    world.add(Physics.behavior('body-collision-detection'));
    world.add(Physics.behavior('sweep-prune'));
  });
});
