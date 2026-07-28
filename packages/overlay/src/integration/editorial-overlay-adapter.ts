import { PublicationChannel,type OverlayCommand as EditorialOverlayCommand } from "@rodrigol/editorial";import { RuntimeCommandFactory,type RuntimeCommand } from "../commands/index.js";import { OverlayRegion } from "../layout/index.js";
const regionByChannel:Partial<Record<PublicationChannel,OverlayRegion>>={
 [PublicationChannel.SCOREBOARD]:OverlayRegion.SCOREBOARD,[PublicationChannel.TICKER]:OverlayRegion.TICKER,[PublicationChannel.LOWER_THIRD]:OverlayRegion.LOWER_THIRD,[PublicationChannel.SIDE_ALERT]:OverlayRegion.SIDE_ALERT,[PublicationChannel.HEADLINE]:OverlayRegion.HEADLINE,[PublicationChannel.FULLSCREEN]:OverlayRegion.FULLSCREEN
};
export class EditorialOverlayAdapter{public adapt(command:EditorialOverlayCommand):RuntimeCommand|undefined{const region=regionByChannel[command.channel];if(!region)return undefined;return RuntimeCommandFactory.create(command.type,region,command.payload,command.durationMs);}}
