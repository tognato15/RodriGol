import type { EditorialItem } from "./editorial-item.js";
import type { PublicationChannel } from "../content/index.js";
export interface PublicationRule { readonly name:string; evaluate(item:EditorialItem):readonly PublicationChannel[]; }
