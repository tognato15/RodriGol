import type { PlayerId } from "../identity/index.js";
import { PlayerDiscipline } from "./player-discipline.js";
export class MatchDiscipline {
  private readonly records=new Map<string,PlayerDiscipline>();
  public forPlayer(id: PlayerId): PlayerDiscipline { const key=id.toString(); let item=this.records.get(key); if(!item){item=new PlayerDiscipline(id);this.records.set(key,item);} return item; }
  public get all(): readonly PlayerDiscipline[] { return [...this.records.values()]; }
}
