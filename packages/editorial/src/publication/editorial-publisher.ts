import { Instant } from "@rodrigol/core";
import type { EditorialItem } from "./editorial-item.js";
import type { PublicationRule } from "./publication-rule.js";
import type { Publication } from "./publication.js";
export class EditorialPublisher{public constructor(private readonly rule:PublicationRule){} public publish(item:EditorialItem,at=Instant.fromDate(new Date()),payload:Readonly<Record<string,unknown>>={}):readonly Publication[]{return item.publish(this.rule.evaluate(item),at,payload);}}
