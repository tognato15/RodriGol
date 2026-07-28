import { InvariantViolationError } from "@rodrigol/core";
import type { PlayerId } from "../identity/index.js";
export class PlayerDiscipline {
  private yellows=0; private reds=0; private sentOff=false;
  public constructor(public readonly playerId: PlayerId) {}
  public registerYellow(): void { if(this.sentOff) throw new InvariantViolationError("Jogador expulso não pode receber novo cartão.","PLAYER_ALREADY_SENT_OFF"); this.yellows+=1; if(this.yellows===2){this.reds+=1;this.sentOff=true;} }
  public registerRed(): void { if(this.sentOff) throw new InvariantViolationError("Jogador já foi expulso.","PLAYER_ALREADY_SENT_OFF"); this.reds+=1; this.sentOff=true; }
  public get yellowCards(): number { return this.yellows; }
  public get redCards(): number { return this.reds; }
  public get isSentOff(): boolean { return this.sentOff; }
}
