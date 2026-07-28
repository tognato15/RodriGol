import { Entity, InvalidArgumentError } from "@rodrigol/core";
import { EditorialContent } from "../content/index.js";
import type { TemplateId } from "../identity/index.js";
export class EditorialTemplate extends Entity<TemplateId>{
  public constructor(id:TemplateId,public readonly name:string,private readonly headlinePattern:string,private readonly summaryPattern?:string){super(id);if(!name.trim()||!headlinePattern.trim())throw new InvalidArgumentError("Nome e padrão de manchete são obrigatórios.","INVALID_EDITORIAL_TEMPLATE");}
  public render(values:Readonly<Record<string,string>>):EditorialContent{const render=(pattern:string)=>pattern.replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key:string)=>values[key]??`{${key}}`);const headline = render(this.headlinePattern); const summary = this.summaryPattern ? render(this.summaryPattern) : undefined; return EditorialContent.create(summary === undefined ? { headline } : { headline, summary });}
}
