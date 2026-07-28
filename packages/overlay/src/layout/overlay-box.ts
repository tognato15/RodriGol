import { InvalidArgumentError,ValueObject } from "@rodrigol/core";
export interface OverlayBoxValue{readonly x:number;readonly y:number;readonly width:number;readonly height:number;readonly zIndex:number;}
export class OverlayBox extends ValueObject<OverlayBoxValue>{
 private constructor(value:OverlayBoxValue){super(Object.freeze(value));}
 public static create(input:Omit<OverlayBoxValue,"zIndex">&{readonly zIndex?:number}):OverlayBox{const {x,y,width,height}=input;if([x,y,width,height].some(v=>!Number.isFinite(v))||width<=0||height<=0)throw new InvalidArgumentError("A caixa do componente é inválida.","INVALID_OVERLAY_BOX");return new OverlayBox({x,y,width,height,zIndex:input.zIndex??0});}
 public get x(){return this.value.x;} public get y(){return this.value.y;} public get width(){return this.value.width;} public get height(){return this.value.height;} public get zIndex(){return this.value.zIndex;}
}
