import { AggregateId, EntityId } from "@rodrigol/core";
export type EditorialItemId = AggregateId<"EditorialItem">;
export const EditorialItemId = { create: (): EditorialItemId => AggregateId.create<"EditorialItem">(), from: (value: string): EditorialItemId => AggregateId.from<"EditorialItem">(value) };
export type PublicationId = EntityId<"Publication">;
export const PublicationId = { create: (): PublicationId => EntityId.create<"Publication">(), from: (value: string): PublicationId => EntityId.from<"Publication">(value) };
export type TemplateId = EntityId<"EditorialTemplate">;
export const TemplateId = { create: (): TemplateId => EntityId.create<"EditorialTemplate">(), from: (value: string): TemplateId => EntityId.from<"EditorialTemplate">(value) };
