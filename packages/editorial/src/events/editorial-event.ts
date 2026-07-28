import type { DomainEvent, Instant } from "@rodrigol/core";
import type { EditorialItemId } from "../identity/index.js";
import type { EditorialPriority, EditorialStatus, PublicationChannel } from "../content/index.js";
export type EditorialEventName="editorial.item.created"|"editorial.item.ready"|"editorial.item.published"|"editorial.item.retracted"|"editorial.item.archived";
export interface EditorialEvent extends DomainEvent<EditorialItemId>{readonly eventName:EditorialEventName;readonly occurredAt:Instant;readonly status:EditorialStatus;readonly priority:EditorialPriority;readonly channels?:readonly PublicationChannel[];readonly reason?:string;}
