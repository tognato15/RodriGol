export interface EventHandlerFailure {
  readonly handlerIndex: number;
  readonly cause: unknown;
}

export class EventDispatchError extends Error {
  public constructor(
    public readonly eventName: string,
    public readonly failures: readonly EventHandlerFailure[],
  ) {
    super(
      `Falha ao publicar o evento "${eventName}" em ${failures.length} manipulador(es).`,
    );

    this.name = "EventDispatchError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
