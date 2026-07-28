import { EntityId } from "../identity/index.js";

export abstract class Entity<
  TId extends EntityId = EntityId,
> {
  protected constructor(
    private readonly entityId: TId,
  ) {}

  public get id(): TId {
    return this.entityId;
  }

  public equals(other: Entity | null | undefined): boolean {
    if (other == null) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.entityId.equals(other.entityId);
  }
}