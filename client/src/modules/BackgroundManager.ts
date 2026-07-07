import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { AURORA_THEME } from '../theme/auroraTheme';

/**
 * Animated Nordic background: aurora borealis, snow, stars, moon.
 * Uses the generated temple image as base layer.
 */
export class BackgroundManager {
    public container: PIXI.Container;
    private app: PIXI.Application;

    private auroraLayers: PIXI.Graphics[] = [];
    private stars: PIXI.Graphics[] = [];
    private snowflakes: PIXI.Graphics[] = [];
    private moon!: PIXI.Graphics;
    private bgSprite: PIXI.Sprite | null = null;

    private auroraTweens: gsap.core.Tween[] = [];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.label = 'background';
    }

    public init(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;

        // Base gradient background
        this.createGradientBase(w, h);

        // Try to load the generated background image
        try {
            const bgTexture = PIXI.Assets.get('background');
            if (bgTexture) {
                this.bgSprite = new PIXI.Sprite(bgTexture);
                this.bgSprite.width = w;
                this.bgSprite.height = h;
                this.container.addChild(this.bgSprite);
            }
        } catch {
            // Fallback: draw a mountain silhouette
            this.createMountainSilhouette(w, h);
        }

        // Moon
        this.createMoon(w, h);

        // Stars
        this.createStars(w, h);

        // Aurora borealis layers (animated)
        this.createAurora(w, h);

        // Snow particles
        this.createSnow(w, h);

        // Fog overlay
        this.createFog(w, h);
    }

    private createGradientBase(w: number, h: number): void {
        const g = new PIXI.Graphics();
        // Vertical gradient: midnight at top to deep blue
        const steps = 40;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const r = Math.round(0x05 + (0x11 - 0x05) * t);
            const gC = Math.round(0x08 + (0x19 - 0x08) * t);
            const b = Math.round(0x18 + (0x36 - 0x18) * t);
            const color = (r << 16) | (gC << 8) | b;
            g.rect(0, (h / steps) * i, w, h / steps + 1);
            g.fill({ color });
        }
        this.container.addChild(g);
    }

    private createMountainSilhouette(w: number, h: number): void {
        const g = new PIXI.Graphics();
        g.moveTo(0, h);
        // Back mountains
        g.lineTo(0, h * 0.65);
        g.lineTo(w * 0.15, h * 0.5);
        g.lineTo(w * 0.3, h * 0.6);
        g.lineTo(w * 0.45, h * 0.45);
        g.lineTo(w * 0.6, h * 0.55);
        g.lineTo(w * 0.75, h * 0.4);
        g.lineTo(w * 0.9, h * 0.5);
        g.lineTo(w, h * 0.6);
        g.lineTo(w, h);
        g.closePath();
        g.fill({ color: 0x0a1530, alpha: 0.8 });

        // Front mountains with snow caps
        g.moveTo(0, h);
        g.lineTo(0, h * 0.8);
        g.lineTo(w * 0.1, h * 0.7);
        g.lineTo(w * 0.2, h * 0.75);
        g.lineTo(w * 0.35, h * 0.65);
        g.lineTo(w * 0.5, h * 0.72);
        g.lineTo(w * 0.65, h * 0.6);
        g.lineTo(w * 0.8, h * 0.68);
        g.lineTo(w * 0.95, h * 0.62);
        g.lineTo(w, h * 0.7);
        g.lineTo(w, h);
        g.closePath();
        g.fill({ color: 0x0d1a3a, alpha: 0.9 });

        // Snow caps
        g.moveTo(w * 0.32, h * 0.66);
        g.lineTo(w * 0.35, h * 0.65);
        g.lineTo(w * 0.38, h * 0.67);
        g.fill({ color: 0xe0f7ff, alpha: 0.6 });

        this.container.addChild(g);
    }

    private createMoon(w: number, h: number): void {
        this.moon = new PIXI.Graphics();
        // Glow
        this.moon.circle(0, 0, 70);
        this.moon.fill({ color: 0xe0f7ff, alpha: 0.08 });
        this.moon.circle(0, 0, 55);
        this.moon.fill({ color: 0xe0f7ff, alpha: 0.12 });
        // Moon body
        this.moon.circle(0, 0, 45);
        this.moon.fill({ color: 0xf0f8ff, alpha: 0.95 });
        // Craters
        this.moon.circle(-12, -8, 8);
        this.moon.fill({ color: 0xc0d8e8, alpha: 0.4 });
        this.moon.circle(15, 10, 6);
        this.moon.fill({ color: 0xc0d8e8, alpha: 0.3 });
        this.moon.circle(5, -15, 5);
        this.moon.fill({ color: 0xc0d8e8, alpha: 0.35 });

        this.moon.x = w * 0.82;
        this.moon.y = h * 0.18;

        // Pulsing glow
        gsap.to(this.moon, {
            alpha: 0.85,
            duration: 4,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });

        this.container.addChild(this.moon);
    }

    private createStars(w: number, h: number): void {
        const count = 80;
        for (let i = 0; i < count; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 2 + 0.5;
            star.circle(0, 0, size);
            star.fill({ color: 0xffffff, alpha: 0.6 + Math.random() * 0.4 });
            star.x = Math.random() * w;
            star.y = Math.random() * h * 0.6;

            // Twinkle
            gsap.to(star, {
                alpha: 0.2,
                duration: 1 + Math.random() * 3,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
                delay: Math.random() * 2,
            });

            this.stars.push(star);
            this.container.addChild(star);
        }
    }

    private createAurora(w: number, h: number): void {
        // 3 aurora ribbons with different colors and speeds
        const auroraColors = [
            AURORA_THEME.colors.auroraGreen,
            AURORA_THEME.colors.auroraBlue,
            AURORA_THEME.colors.auroraViolet,
        ];

        for (let layer = 0; layer < 3; layer++) {
            const aurora = new PIXI.Graphics();
            this.drawAuroraRibbon(aurora, w, h, auroraColors[layer], layer);
            aurora.alpha = 0.35 - layer * 0.08;
            this.auroraLayers.push(aurora);
            this.container.addChild(aurora);

            // Animate the aurora by redrawing periodically
            const animTween = gsap.to({ phase: 0 }, {
                phase: Math.PI * 2,
                duration: 8 + layer * 4,
                repeat: -1,
                ease: 'none',
                onUpdate: function () {
                    const target = aurora;
                    const phase = this.targets()[0].phase;
                    target.clear();
                    drawRibbon(target, w, h, auroraColors[layer], layer, phase);
                },
            });
            this.auroraTweens.push(animTween);
        }

        // Local function for the ribbon drawing
        function drawRibbon(g: PIXI.Graphics, w: number, h: number, color: number, layerIdx: number, phase: number) {
            const baseY = h * 0.15 + layerIdx * 30;
            const amplitude = 40 + layerIdx * 20;
            const segments = 60;

            g.moveTo(0, baseY);
            for (let i = 0; i <= segments; i++) {
                const x = (w / segments) * i;
                const wave1 = Math.sin(phase + i * 0.15) * amplitude;
                const wave2 = Math.sin(phase * 0.7 + i * 0.08) * (amplitude * 0.5);
                const y = baseY + wave1 + wave2;
                g.lineTo(x, y);
            }
            // Close the ribbon downward
            for (let i = segments; i >= 0; i--) {
                const x = (w / segments) * i;
                const wave1 = Math.sin(phase + i * 0.15) * amplitude;
                const wave2 = Math.sin(phase * 0.7 + i * 0.08) * (amplitude * 0.5);
                const y = baseY + wave1 + wave2 + 120 + layerIdx * 40;
                g.lineTo(x, y);
            }
            g.closePath();
            g.fill({ color, alpha: 0.25 });

            // Bright edge
            g.moveTo(0, baseY);
            for (let i = 0; i <= segments; i++) {
                const x = (w / segments) * i;
                const wave1 = Math.sin(phase + i * 0.15) * amplitude;
                const wave2 = Math.sin(phase * 0.7 + i * 0.08) * (amplitude * 0.5);
                const y = baseY + wave1 + wave2;
                g.lineTo(x, y);
            }
            g.stroke({ width: 3, color, alpha: 0.6 });
        }
    }

    private drawAuroraRibbon(g: PIXI.Graphics, w: number, h: number, color: number, layer: number): void {
        // Initial draw — the animation tween will redraw
        g.moveTo(0, h * 0.15 + layer * 30);
        g.lineTo(w, h * 0.15 + layer * 30);
        g.fill({ color, alpha: 0.2 });
    }

    private createSnow(w: number, h: number): void {
        const count = 60;
        for (let i = 0; i < count; i++) {
            const flake = new PIXI.Graphics();
            const size = Math.random() * 3 + 1;
            flake.circle(0, 0, size);
            flake.fill({ color: 0xffffff, alpha: 0.4 + Math.random() * 0.4 });
            flake.x = Math.random() * w;
            flake.y = Math.random() * h;

            // Falling animation
            const fallDuration = 6 + Math.random() * 8;
            const drift = (Math.random() - 0.5) * 100;

            gsap.to(flake, {
                y: h + 20,
                x: `+=${drift}`,
                duration: fallDuration,
                repeat: -1,
                ease: 'none',
                delay: -Math.random() * fallDuration,
                onRepeat: () => {
                    flake.y = -10;
                    flake.x = Math.random() * w;
                },
            });

            this.snowflakes.push(flake);
            this.container.addChild(flake);
        }
    }

    private createFog(w: number, h: number): void {
        const fog = new PIXI.Graphics();
        fog.rect(0, h * 0.7, w, h * 0.3);
        fog.fill({ color: 0x0a0e27, alpha: 0.5 });
        this.container.addChild(fog);

        // Drifting fog
        gsap.to(fog, {
            alpha: 0.35,
            duration: 6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    /**
     * Intensify the aurora for free spins mode.
     */
    public setFreeSpinsMode(active: boolean): void {
        for (const layer of this.auroraLayers) {
            gsap.to(layer, {
                alpha: active ? 0.6 : 0.3,
                duration: 1,
            });
        }
    }

    public destroy(): void {
        this.auroraTweens.forEach(t => t.kill());
        this.container.destroy({ children: true });
    }
}
