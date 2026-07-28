import type { Instant } from "@rodrigol/core";import type { CommandId } from "../identity/index.js";import type { OverlayRegion } from "../layout/index.js";
export type RuntimeCommandType="show"|"update"|"hide"|"clear"|"clear-all";
export interface RuntimeCommand{readonly id:CommandId;readonly type:RuntimeCommandType;readonly region?:OverlayRegion;readonly payload:Readonly<Record<string,unknown>>;readonly durationMs?:number;readonly issuedAt:Instant;}
