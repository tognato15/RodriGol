import type { PublicationChannel } from "../content/index.js";
export type OverlayCommandType="show"|"update"|"hide"|"clear";
export interface OverlayCommand{readonly type:OverlayCommandType;readonly channel:PublicationChannel;readonly payload:Readonly<Record<string,unknown>>;readonly durationMs?:number;}
