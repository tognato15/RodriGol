import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export interface StatLineValue { readonly shots:number; readonly shotsOnTarget:number; readonly possession:number; readonly corners:number; readonly fouls:number; readonly offsides:number; readonly passes:number; readonly accuratePasses:number; readonly saves:number; }
export class StatLine extends ValueObject<StatLineValue> {
  private constructor(value: StatLineValue){super(value);}
  public static zero(): StatLine { return new StatLine({shots:0,shotsOnTarget:0,possession:0,corners:0,fouls:0,offsides:0,passes:0,accuratePasses:0,saves:0}); }
  public static create(value: StatLineValue): StatLine { const nums=Object.values(value); if(nums.some(v=>!Number.isFinite(v)||v<0)) throw new InvalidArgumentError("Estatística inválida.","INVALID_MATCH_STATISTIC"); if(value.shotsOnTarget>value.shots||value.accuratePasses>value.passes||value.possession>100) throw new InvalidArgumentError("Estatísticas inconsistentes.","INCONSISTENT_MATCH_STATISTICS"); return new StatLine(value); }
}
