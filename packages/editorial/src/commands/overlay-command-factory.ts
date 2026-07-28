import type { Publication } from "../publication/index.js";
import type { OverlayCommand } from "./overlay-command.js";
export class OverlayCommandFactory {
  public static fromPublication(publication: Publication, durationMs?: number): OverlayCommand {
    const command: OverlayCommand = { type: "show", channel: publication.channel, payload: publication.payload };
    return durationMs === undefined ? command : { ...command, durationMs };
  }
}
