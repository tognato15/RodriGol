import test from "node:test";
import assert from "node:assert/strict";
import { PublicationChannel } from "@rodrigol/editorial";
import {
  EditorialOverlayAdapter,
  MemoryOverlayRenderer,
  OverlayRegion,
  OverlayRuntime,
  RuntimeCommandFactory,
  SceneFactory,
  StandardOverlayLayout,
  Viewport
} from "../dist/index.js";

test("cria uma cena padrão em Full HD",()=>{
  const scene=SceneFactory.newsroom();
  assert.equal(scene.viewport.width,1920);
  assert.equal(scene.all().length,6);
  assert.equal(scene.byRegion(OverlayRegion.TICKER).length,1);
});

test("layout padrão posiciona o ticker na parte inferior",()=>{
  const viewport=Viewport.fullHd();
  const ticker=StandardOverlayLayout.for(viewport).get(OverlayRegion.TICKER);
  assert.equal(ticker?.y,984);
  assert.equal(ticker?.width,1920);
});

test("runtime exibe e atualiza um componente",async()=>{
  const renderer=new MemoryOverlayRenderer();
  const runtime=new OverlayRuntime(SceneFactory.newsroom(),renderer);
  await runtime.execute(RuntimeCommandFactory.create("show",OverlayRegion.LOWER_THIRD,{headline:"GOL DO PALMEIRAS"}));
  const shown=renderer.latest()?.components.find(item=>item.region===OverlayRegion.LOWER_THIRD);
  assert.equal(shown?.visible,true);
  assert.equal(shown?.data.headline,"GOL DO PALMEIRAS");
  await runtime.execute(RuntimeCommandFactory.create("update",OverlayRegion.LOWER_THIRD,{summary:"Aos 32 minutos"}));
  const updated=renderer.latest()?.components.find(item=>item.region===OverlayRegion.LOWER_THIRD);
  assert.equal(updated?.data.summary,"Aos 32 minutos");
});

test("clear-all limpa toda a cena",async()=>{
  const renderer=new MemoryOverlayRenderer();
  const runtime=new OverlayRuntime(SceneFactory.newsroom(),renderer);
  await runtime.execute(RuntimeCommandFactory.create("show",OverlayRegion.TICKER,{text:"Bola rolando"}));
  await runtime.execute(RuntimeCommandFactory.create("show",OverlayRegion.SCOREBOARD,{home:1,away:0}));
  await runtime.execute(RuntimeCommandFactory.create("clear-all"));
  assert.equal(renderer.latest()?.components.every(item=>!item.visible),true);
});

test("adapta comando editorial para região de overlay",()=>{
  const adapted=new EditorialOverlayAdapter().adapt({type:"show",channel:PublicationChannel.TICKER,payload:{headline:"Gol"},durationMs:8000});
  assert.equal(adapted?.region,OverlayRegion.TICKER);
  assert.equal(adapted?.durationMs,8000);
});

test("ignora canais editoriais que não são gráficos",()=>{
  const adapted=new EditorialOverlayAdapter().adapt({type:"show",channel:PublicationChannel.NEWSROOM,payload:{headline:"Nota"}});
  assert.equal(adapted,undefined);
});

test("comando com duração esconde automaticamente",async()=>{
  const renderer=new MemoryOverlayRenderer();
  const runtime=new OverlayRuntime(SceneFactory.newsroom(),renderer);
  await runtime.execute(RuntimeCommandFactory.create("show",OverlayRegion.SIDE_ALERT,{headline:"VAR"},20));
  assert.equal(renderer.latest()?.components.find(item=>item.region===OverlayRegion.SIDE_ALERT)?.visible,true);
  await new Promise(resolve=>setTimeout(resolve,45));
  assert.equal(renderer.latest()?.components.find(item=>item.region===OverlayRegion.SIDE_ALERT)?.visible,false);
});
