import { EditorialPriority, PublicationChannel } from "../content/index.js";
import type { EditorialItem } from "./editorial-item.js";
import type { PublicationRule } from "./publication-rule.js";
export class DefaultPublicationRule implements PublicationRule{
  public readonly name="default-priority-routing";
  public evaluate(item:EditorialItem):readonly PublicationChannel[]{
    const channels=new Set<PublicationChannel>([PublicationChannel.NEWSROOM,PublicationChannel.TIMELINE]);
    if(item.priority>=EditorialPriority.NORMAL)channels.add(PublicationChannel.TICKER);
    if(item.priority>=EditorialPriority.HIGH)channels.add(PublicationChannel.LOWER_THIRD);
    if(item.priority>=EditorialPriority.URGENT)channels.add(PublicationChannel.SIDE_ALERT);
    if(item.priority>=EditorialPriority.BREAKING){channels.add(PublicationChannel.HEADLINE);channels.add(PublicationChannel.FULLSCREEN);}
    return [...channels];
  }
}
