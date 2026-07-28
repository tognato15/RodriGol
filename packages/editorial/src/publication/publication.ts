import { Entity, Instant } from "@rodrigol/core";
import type { PublicationId } from "../identity/index.js";
import type { PublicationChannel } from "../content/index.js";
export class Publication extends Entity<PublicationId>{
  public constructor(id:PublicationId,public readonly channel:PublicationChannel,public readonly publishedAt:Instant,public readonly payload:Readonly<Record<string,unknown>>){super(id);}
}
