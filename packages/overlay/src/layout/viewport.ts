import { InvalidArgumentError,ValueObject } from "@rodrigol/core";
export interface ViewportValue{readonly width:number;readonly height:number;readonly safeMargin:number;}
export class Viewport extends ValueObject<ViewportValue>{
 private constructor(value:ViewportValue){super(Object.freeze(value));}
 public static create(width:number,height:number,safeMargin=0):Viewport{if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0)throw new InvalidArgumentError("A resolução do overlay é inválida.","INVALID_OVERLAY_VIEWPORT");if(safeMargin<0||safeMargin*2>=Math.min(width,height))throw new InvalidArgumentError("A margem segura do overlay é inválida.","INVALID_SAFE_MARGIN");return new Viewport({width,height,safeMargin});}
 public static fullHd():Viewport{return Viewport.create(1920,1080,48);} public get width(){return this.value.width;} public get height(){return this.value.height;} public get safeMargin(){return this.value.safeMargin;}
}
