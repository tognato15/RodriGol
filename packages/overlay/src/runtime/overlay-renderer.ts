import type { OverlaySnapshot } from "./overlay-snapshot.js";export interface OverlayRenderer{render(snapshot:OverlaySnapshot):void|Promise<void>;}
