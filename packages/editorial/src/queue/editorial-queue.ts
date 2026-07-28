import type { EditorialItem } from "../publication/index.js";
export class EditorialQueue{
  private readonly items:EditorialItem[]=[];
  public enqueue(item:EditorialItem):void{if(!this.items.some(candidate=>candidate.id.equals(item.id)))this.items.push(item);}
  public remove(item:EditorialItem):void{const index=this.items.findIndex(candidate=>candidate.id.equals(item.id));if(index>=0)this.items.splice(index,1);}
  public next():EditorialItem|undefined{return this.ordered()[0];}
  public ordered():readonly EditorialItem[]{return [...this.items].sort((a,b)=>b.priority-a.priority||a.createdAt.epochMilliseconds-b.createdAt.epochMilliseconds);}
  public get size():number{return this.items.length;}
}
