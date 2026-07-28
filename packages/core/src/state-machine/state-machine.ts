import { InvariantViolationError } from "../errors/index.js";

export interface StateTransition<TState extends string> {
  readonly from: TState;
  readonly to: TState;
}

export type TransitionGuard<TState extends string, TContext> = (
  transition: StateTransition<TState>,
  context: TContext,
) => boolean;

export interface StateMachineOptions<TState extends string, TContext> {
  readonly initialState: TState;
  readonly transitions: Readonly<
    Partial<Record<TState, readonly TState[]>>
  >;
  readonly guard?: TransitionGuard<TState, TContext>;
}

export class StateMachine<TState extends string, TContext = undefined> {
  private currentState: TState;

  public constructor(
    private readonly options: StateMachineOptions<TState, TContext>,
  ) {
    this.currentState = options.initialState;
  }

  public get state(): TState {
    return this.currentState;
  }

  public canTransitionTo(nextState: TState, context: TContext): boolean {
    const allowed = this.options.transitions[this.currentState] ?? [];

    if (!allowed.includes(nextState)) {
      return false;
    }

    return this.options.guard?.(
      { from: this.currentState, to: nextState },
      context,
    ) ?? true;
  }

  public transitionTo(nextState: TState, context: TContext): void {
    if (!this.canTransitionTo(nextState, context)) {
      throw new InvariantViolationError(
        `Transição inválida de "${this.currentState}" para "${nextState}".`,
        "INVALID_STATE_TRANSITION",
      );
    }

    this.currentState = nextState;
  }
}
