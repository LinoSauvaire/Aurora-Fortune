// BalanceManager.ts
export class BalanceManager {
    private balance: number;
    private listeners: Set<(balance: number) => void> = new Set();

    constructor() {
        this.balance = 1000.00; // Default startup balance
        console.log("BalanceManager initialized with balance:", this.balance);
    }

    public getBalance(): number {
        return this.balance;
    }

    public setBalance(newBalance: number): void {
        this.balance = newBalance;
        this.notifyListeners();
    }

    public deduct(amount: number): boolean {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.notifyListeners();
            return true;
        }
        return false;
    }

    public add(amount: number): void {
        this.balance += amount;
        this.notifyListeners();
    }

    public addListener(callback: (balance: number) => void): void {
        this.listeners.add(callback);
    }

    public removeListener(callback: (balance: number) => void): void {
        this.listeners.delete(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb(this.balance));
    }
}
