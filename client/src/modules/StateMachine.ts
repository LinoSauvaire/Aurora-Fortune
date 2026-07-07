// StateMachine.ts
export const GameState = {
    Idle: 'Idle',
    Bet: 'Bet',
    SpinStart: 'SpinStart',
    Spinning: 'Spinning',
    Stopping: 'Stopping',
    Evaluate: 'Evaluate',
    AnimateWin: 'AnimateWin',
    BonusIntro: 'BonusIntro',
    Bonus: 'Bonus',
    BonusEnd: 'BonusEnd',
    Collect: 'Collect',
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export type StateCallback = (state: GameState, context?: any) => void;

export class StateMachine {
    private currentState: GameState;
    private listeners: Map<GameState, Set<StateCallback>> = new Map();
    private globalListeners: Set<StateCallback> = new Set();

    constructor() {
        this.currentState = GameState.Idle;
        console.log("StateMachine initialized, current state:", GameState[this.currentState]);
    }

    public setState(newState: GameState, context?: any): void {
        if (this.currentState === newState) return;
        
        console.log(`State transition: ${GameState[this.currentState]} -> ${GameState[newState]}`);
        this.currentState = newState;

        // Trigger global listeners
        this.globalListeners.forEach(cb => cb(newState, context));

        // Trigger specific state listeners
        const stateListeners = this.listeners.get(newState);
        if (stateListeners) {
            stateListeners.forEach(cb => cb(newState, context));
        }
    }

    public getState(): GameState {
        return this.currentState;
    }

    public addListener(state: GameState, callback: StateCallback): void {
        if (!this.listeners.has(state)) {
            this.listeners.set(state, new Set());
        }
        this.listeners.get(state)!.add(callback);
    }

    public removeListener(state: GameState, callback: StateCallback): void {
        const stateListeners = this.listeners.get(state);
        if (stateListeners) {
            stateListeners.delete(callback);
        }
    }

    public addGlobalListener(callback: StateCallback): void {
        this.globalListeners.add(callback);
    }

    public removeGlobalListener(callback: StateCallback): void {
        this.globalListeners.delete(callback);
    }
}
