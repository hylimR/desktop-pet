import { Application } from '@pixi/app';
import { Renderer } from '@pixi/core';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { InteractionManager } from '@pixi/interaction';
import { Live2DModel } from 'pixi-live2d-display';

// register the Ticker to support automatic updating of Live2D models
Application.registerPlugin(TickerPlugin);
Live2DModel.registerTicker(Ticker);

// register the InteractionManager to support automatic interaction of Live2D models
Renderer.registerPlugin('interaction', InteractionManager);

async function main() {
  const app = new Application({
    backgroundAlpha: 0,
    autoStart: true,
    resizeTo: window,
  });

  document.body.appendChild(app.view);
  const model = await Live2DModel.from('./assets/QD4/QD4.model3.json');

  app.stage.addChild(model);
  // model.x = 0;
  // model.y = 0;
  model.interactive = true;
  model.dragging = false;
  model.scale.set(0.2, 0.2);
  model.anchor.set(0.5, 0.5);

  model.on('mousedown', function (e) {
    model.dragging = true;
  });

  model.on('mousemove', function (e) {
    if (model.dragging) {
      model.x = e.data.global.x;
      model.y = e.data.global.y;
    }
  });

  model.on('mouseout', function (e) {
    model.dragging = false;
  });

  model.on('mouseup', function (e) {
    model.x = e.data.global.x;
    model.y = e.data.global.y;
    model.dragging = false;
  });
}

main();
