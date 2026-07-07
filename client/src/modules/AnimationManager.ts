import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ReelSymbol } from './ReelSymbol';
import type { SpinResult } from './SpinManager';
import { AURORA_THEME } from '../theme/auroraTheme';

export class AnimationManager {
    private app: PIXI.Application;
    private particleContainer: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.particleContainer = new PIXI.Container();
        this.particleContainer.label = 'particles';
        this.app.stage.addChild(this.particleContainer);
    }

    /**
     * Highlight winning symbols with pulse + glow.
     */
    public playWinAnimation(result: SpinResult, getSymbolAt: (reel: number, row: number) => ReelSymbol | null): void {
        for (const line of result.winningLines) {
            for (const pos of line.symbols) {
                const sym = getSymbolAt(pos.reel, pos.row);
                if (sym) {
                    sym.pulse(0.6);
                    sym.glow(true);
                    // Stop glow after a delay
                    setTimeout(() => sym.glow(false), 2500);
                }
            }
        }
    }

    /**
     * Spawn coin particles bursting from center.
     */
    public spawnCoinBurst(x: number, y: number, count: number = 20): void {
        for (let i = 0; i < count; i++) {
            const coin = new PIXI.Graphics();
            coin.circle(0, 0, 8 + Math.random() * 6);
            coin.fill({ color: Math.random() > 0.5 ? AURORA_THEME.colors.gold : AURORA_THEME.colors.turquoise });
            coin.x = x;
            coin.y = y;
            this.particleContainer.addChild(coin);

            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 200;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 100;

            gsap.to(coin, {
                x: x + dx,
                y: y + dy,
                alpha: 0,
                duration: 1 + Math.random(),
                ease: 'power2.out',
                onComplete: () => coin.destroy(),
            });
            gsap.to(coin, {
                rotation: Math.random() * Math.PI * 4,
                duration: 1.2,
                ease: 'none',
            });
        }
    }

    /**
     * Screen shake on big win.
     */
    public screenShake(intensity: number = 10, duration: number = 0.4): void {
        const stage = this.app.stage;
        const origX = stage.x;
        const origY = stage.y;
        const tl = gsap.timeline();
        const steps = 8;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const decay = 1 - t;
            tl.to(stage, {
                x: origX + (Math.random() - 0.5) * intensity * decay,
                y: origY + (Math.random() - 0.5) * intensity * decay,
                duration: duration / steps,
                ease: 'none',
            });
        }
        tl.to(stage, { x: origX, y: origY, duration: 0.1 });
    }
}
