import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export interface EditorialContentValue { readonly headline: string; readonly summary?: string; readonly body?: string; readonly sourceLabel?: string; }
export class EditorialContent extends ValueObject<EditorialContentValue> {
  private constructor(value: EditorialContentValue) { super(Object.freeze(value)); }
  public static create(input: EditorialContentValue): EditorialContent {
    const headline=input.headline.trim();
    if (!headline) throw new InvalidArgumentError("A manchete editorial é obrigatória.","EMPTY_EDITORIAL_HEADLINE");
    if (headline.length>180) throw new InvalidArgumentError("A manchete editorial deve ter no máximo 180 caracteres.","EDITORIAL_HEADLINE_TOO_LONG");
    const value: EditorialContentValue = { headline };
    const summary = input.summary?.trim();
    const body = input.body?.trim();
    const sourceLabel = input.sourceLabel?.trim();
    if (summary) Object.assign(value, { summary });
    if (body) Object.assign(value, { body });
    if (sourceLabel) Object.assign(value, { sourceLabel });
    return new EditorialContent(value);
  }
  public get headline(){return this.value.headline;} public get summary(){return this.value.summary;} public get body(){return this.value.body;} public get sourceLabel(){return this.value.sourceLabel;}
}
