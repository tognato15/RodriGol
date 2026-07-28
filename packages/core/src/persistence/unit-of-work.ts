export interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;

  execute<TValue>(operation: () => Promise<TValue>): Promise<TValue>;
}

export abstract class BaseUnitOfWork implements UnitOfWork {
  public abstract begin(): Promise<void>;
  public abstract commit(): Promise<void>;
  public abstract rollback(): Promise<void>;

  public async execute<TValue>(
    operation: () => Promise<TValue>,
  ): Promise<TValue> {
    await this.begin();

    try {
      const value = await operation();
      await this.commit();
      return value;
    } catch (error: unknown) {
      await this.rollback();
      throw error;
    }
  }
}
