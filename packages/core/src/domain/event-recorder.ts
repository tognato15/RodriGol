export class EventRecorder<TEvent> {
  private readonly events: TEvent[] = [];

  public record(event: TEvent): void {
    this.events.push(event);
  }

  public pull(): readonly TEvent[] {
    const pulledEvents = [...this.events];

    this.events.length = 0;

    return pulledEvents;
  }

  public get hasEvents(): boolean {
    return this.events.length > 0;
  }

  public get size(): number {
    return this.events.length;
  }

  public clear(): void {
    this.events.length = 0;
  }
}