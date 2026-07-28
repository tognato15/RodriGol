import type { FootballMatchEvent } from "@rodrigol/football";
import { EditorialContent, EditorialPriority } from "../content/index.js";
import { EditorialItem } from "../publication/index.js";
export class FootballEditorialMapper{
  public map(event:FootballMatchEvent):EditorialItem{
    const minute=event.minute?` ${event.minute.toString()}`:"";
    const score=event.score?` — ${event.score.toString()}`:"";
    const data:Record<FootballMatchEvent["eventName"],{headline:string;priority:EditorialPriority}>={
      "football.match.created":{headline:"Partida cadastrada",priority:EditorialPriority.LOW},
      "football.match.started":{headline:"Bola rolando",priority:EditorialPriority.NORMAL},
      "football.match.period-changed":{headline:"Mudança de período da partida",priority:EditorialPriority.NORMAL},
      "football.match.goal-registered":{headline:`GOL!${minute}${score}`,priority:EditorialPriority.HIGH},
      "football.match.card-registered":{headline:`Cartão na partida${minute}`,priority:EditorialPriority.NORMAL},
      "football.match.substitution-registered":{headline:`Substituição${minute}`,priority:EditorialPriority.NORMAL},
      "football.match.var-registered":{headline:`VAR em ação${minute}`,priority:EditorialPriority.HIGH},
      "football.match.status-changed":{headline:"Situação da partida atualizada",priority:EditorialPriority.HIGH},
      "football.match.finished":{headline:`Fim de jogo${score}`,priority:EditorialPriority.HIGH}
    };
    const mapped=data[event.eventName];
    return EditorialItem.create({content:EditorialContent.create(event.details === undefined ? {headline:mapped.headline} : {headline:mapped.headline,summary:event.details}),priority:mapped.priority,sourceEventName:event.eventName,sourceAggregateId:event.aggregateId.toString(),createdAt:event.occurredAt});
  }
}
