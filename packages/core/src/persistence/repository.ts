import type { Entity } from "../domain/index.js";
import type { EntityId } from "../identity/index.js";

export interface Repository<
  TEntity extends Entity<TId>,
  TId extends EntityId = TEntity["id"],
> {
  findById(id: TId): Promise<TEntity | null>;
  exists(id: TId): Promise<boolean>;
  save(entity: TEntity): Promise<void>;
  remove(entity: TEntity): Promise<void>;
}
