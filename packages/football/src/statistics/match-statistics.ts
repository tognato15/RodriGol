import type { TeamSide } from "../match/team-side.js";
import { StatLine } from "./stat-line.js";
export class MatchStatistics {
  private homeLine=StatLine.zero(); private awayLine=StatLine.zero();
  public update(side:TeamSide,line:StatLine):void { if(side==="home") this.homeLine=line; else this.awayLine=line; }
  public for(side:TeamSide):StatLine { return side==="home"?this.homeLine:this.awayLine; }
  public get home():StatLine{return this.homeLine;} public get away():StatLine{return this.awayLine;}
}
