import { Entity, InvalidArgumentError } from "@rodrigol/core"; import type { StageId } from "../identity/index.js";
export type StageType="league"|"group"|"knockout"|"final";
export class Stage extends Entity<StageId>{private constructor(id:StageId,public readonly name:string,public readonly type:StageType,public readonly order:number){super(id);}public static create(id:StageId,name:string,type:StageType,order:number):Stage{const n=name.trim();if(!n||!Number.isInteger(order)||order<1)throw new InvalidArgumentError("Fase inválida.","INVALID_STAGE");return new Stage(id,n,type,order);}}
