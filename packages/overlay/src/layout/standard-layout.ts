import { OverlayBox } from "./overlay-box.js";import { OverlayRegion } from "./overlay-region.js";import type { Viewport } from "./viewport.js";
export class StandardOverlayLayout{
 public static for(viewport:Viewport):ReadonlyMap<OverlayRegion,OverlayBox>{const w=viewport.width,h=viewport.height,m=viewport.safeMargin;return new Map([
 [OverlayRegion.SCOREBOARD,OverlayBox.create({x:m,y:m,width:Math.min(560,w-m*2),height:104,zIndex:30})],
 [OverlayRegion.HEADLINE,OverlayBox.create({x:m,y:m,width:w-m*2,height:130,zIndex:40})],
 [OverlayRegion.SIDE_ALERT,OverlayBox.create({x:w-Math.min(520,w-m*2)-m,y:Math.round(h*.25),width:Math.min(520,w-m*2),height:220,zIndex:35})],
 [OverlayRegion.LOWER_THIRD,OverlayBox.create({x:m,y:h-300-m,width:w-m*2,height:190,zIndex:25})],
 [OverlayRegion.TICKER,OverlayBox.create({x:0,y:h-96,width:w,height:96,zIndex:50})],
 [OverlayRegion.FULLSCREEN,OverlayBox.create({x:0,y:0,width:w,height:h,zIndex:100})]
 ]);}
}
