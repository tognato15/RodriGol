import { EntityId } from "@rodrigol/core";
export type SceneId = EntityId<"OverlayScene">;
export const SceneId={create:():SceneId=>EntityId.create<"OverlayScene">(),from:(value:string):SceneId=>EntityId.from<"OverlayScene">(value)};
export type ComponentId = EntityId<"OverlayComponent">;
export const ComponentId={create:():ComponentId=>EntityId.create<"OverlayComponent">(),from:(value:string):ComponentId=>EntityId.from<"OverlayComponent">(value)};
export type CommandId = EntityId<"OverlayRuntimeCommand">;
export const CommandId={create:():CommandId=>EntityId.create<"OverlayRuntimeCommand">(),from:(value:string):CommandId=>EntityId.from<"OverlayRuntimeCommand">(value)};
