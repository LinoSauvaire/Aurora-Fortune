// BetManager.ts
export class BetManager {
    private betOptions: number[] = [0.2, 0.4, 0.6, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0];
    private currentBetIndex: number = 3; // Default is index 3 which is 1.0
    private listeners: Set<(bet: number) => void> = new Set();

    constructor() {
        console.log("BetManager initialized with bet:", this.getBet());
    }

    public setBetOptions(options: number[]): void {
        this.betOptions = options;
        this.currentBetIndex = Math.min(this.currentBetIndex, this.betOptions.length - 1);
        this.notifyListeners();
    }

    public getBet(): number {
        return this.betOptions[this.currentBetIndex];
    }

    public increaseBet(): void {
        if (this.currentBetIndex < this.betOptions.length - 1) {
            this.currentBetIndex++;
            this.notifyListeners();
        }
    }

    public decreaseBet(): void {
        if (this.currentBetIndex > 0) {
            this.currentBetIndex--;
            this.notifyListeners();
        }
    }

    public addListener(callback: (bet: number) => void): void {
        this.listeners.add(callback);
    }

    public removeListener(callback: (bet: number) => void): void {
        this.listeners.delete(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb(this.getBet()));
    }
}
