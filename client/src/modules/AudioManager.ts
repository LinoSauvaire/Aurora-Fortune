// Procedurally generated sounds via WebAudio (no external files needed)
export class AudioManager {
    private ctx: AudioContext | null = null;
    private muted: boolean = false;

    constructor() {
        // Lazy-init on first play (browsers require user gesture)
    }

    private ensureContext(): void {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2): void {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playSpin(): void {
        // Whirring sound
        this.playTone(120, 0.3, 'sawtooth', 0.08);
    }

    public playReelStop(): void {
        this.playTone(300, 0.08, 'square', 0.12);
    }

    public playWin(): void {
        // Ascending arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.2, 'triangle', 0.15), i * 100);
        });
    }

    public playBigWin(): void {
        const notes = [523, 659, 784, 1047, 1319, 1568];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.3, 'triangle', 0.2), i * 80);
        });
    }

    public playClick(): void {
        this.playTone(800, 0.05, 'square', 0.1);
    }

    public setMuted(muted: boolean): void {
        this.muted = muted;
    }

    public isMuted(): boolean {
        return this.muted;
    }
}
