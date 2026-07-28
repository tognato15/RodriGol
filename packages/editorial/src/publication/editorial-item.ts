import { AggregateRoot, Instant, InvariantViolationError } from "@rodrigol/core";
import { EditorialContent, EditorialPriority, EditorialStatus, type PublicationChannel } from "../content/index.js";
import type { EditorialEvent } from "../events/index.js";
import { EditorialItemId, PublicationId, type PublicationId as PublicationIdType } from "../identity/index.js";
import { Publication } from "./publication.js";
export interface CreateEditorialItemInput{readonly content:EditorialContent;readonly priority?:EditorialPriority;readonly sourceEventName?:string;readonly sourceAggregateId?:string;readonly createdAt?:Instant;}
export class EditorialItem extends AggregateRoot<EditorialItemId,EditorialEvent>{
  private _status=EditorialStatus.DRAFT; private _priority:EditorialPriority; private _content:EditorialContent; private readonly _publications:Publication[]=[];
  public readonly sourceEventName: string | undefined; public readonly sourceAggregateId: string | undefined; public readonly createdAt:Instant;
  private constructor(id:EditorialItemId,input:CreateEditorialItemInput){super(id);this._content=input.content;this._priority=input.priority??EditorialPriority.NORMAL;this.sourceEventName=input.sourceEventName;this.sourceAggregateId=input.sourceAggregateId;this.createdAt=input.createdAt??Instant.fromDate(new Date());this.emit("editorial.item.created",this.createdAt);}
  public static create(input:CreateEditorialItemInput,id=EditorialItemId.create()):EditorialItem{return new EditorialItem(id,input);}
  public get status(){return this._status;} public get priority(){return this._priority;} public get content(){return this._content;} public get publications():readonly Publication[]{return [...this._publications];}
  public revise(content:EditorialContent,priority=this._priority):void{this.ensureEditable();this._content=content;this._priority=priority;}
  public markReady(at=Instant.fromDate(new Date())):void{if(this._status!==EditorialStatus.DRAFT)throw new InvariantViolationError("Somente itens em rascunho podem ficar prontos.","EDITORIAL_ITEM_NOT_DRAFT");this._status=EditorialStatus.READY;this.emit("editorial.item.ready",at);}
  public publish(channels:readonly PublicationChannel[],at=Instant.fromDate(new Date()),payload:Readonly<Record<string,unknown>>={}):readonly Publication[]{if(this._status!==EditorialStatus.READY&&this._status!==EditorialStatus.PUBLISHED)throw new InvariantViolationError("O item precisa estar pronto antes da publicação.","EDITORIAL_ITEM_NOT_READY");const unique=[...new Set(channels)];for(const channel of unique){if(!this._publications.some(p=>p.channel===channel)){this._publications.push(new Publication(PublicationId.create(),channel,at,payload));}}this._status=EditorialStatus.PUBLISHED;this.emit("editorial.item.published",at,unique);return this.publications;}
  public retract(reason:string,at=Instant.fromDate(new Date())):void{if(this._status!==EditorialStatus.PUBLISHED)throw new InvariantViolationError("Somente itens publicados podem ser retirados.","EDITORIAL_ITEM_NOT_PUBLISHED");this._status=EditorialStatus.RETRACTED;this.emit("editorial.item.retracted",at,undefined,reason.trim()||"Sem motivo informado");}
  public archive(at=Instant.fromDate(new Date())):void{if(this._status===EditorialStatus.ARCHIVED) return;this._status=EditorialStatus.ARCHIVED;this.emit("editorial.item.archived",at);}
  private ensureEditable():void{if(this._status!==EditorialStatus.DRAFT)throw new InvariantViolationError("Somente rascunhos podem ser alterados.","EDITORIAL_ITEM_NOT_EDITABLE");}
  private emit(eventName:EditorialEvent["eventName"],occurredAt:Instant,channels?:readonly PublicationChannel[],reason?:string):void{const event: EditorialEvent = { eventName, aggregateId: this.id, occurredAt, status: this._status, priority: this._priority }; if (channels !== undefined) Object.assign(event, { channels }); if (reason !== undefined) Object.assign(event, { reason }); this.recordDomainEvent(event);}
}
