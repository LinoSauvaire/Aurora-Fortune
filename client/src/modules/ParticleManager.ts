import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { AURORA_THEME } from '../theme/auroraTheme';

type ParticleType = 'crystal' | 'magic' | 'aurora' | 'sparkle' | 'ice';

interface Particle {
    sprite: PIXI.Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    type: ParticleType;
}

/**
 * Manages all VFX particles: crystal bursts, magic dust, aurora trails, sparkles, ice shards.
 */
export class ParticleManager {
    public container: PIXI.Container;
    private app: PIXI.Application;
    private particles: Particle[] = [];
    private ambientActive: boolean = false;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.label = 'particles';
    }

    public startAmbient(): void {
        if (this.ambientActive) return;
        this.ambientActive = true;
        const spawn = () => {
            if (!this.ambientActive) return;
            this.spawnAmbientParticle();
            setTimeout(spawn, 200 + Math.random() * 300);
        };
        spawn();
    }

    public stopAmbient(): void {
        this.ambientActive = false;
    }

    private spawnAmbientParticle(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const x = Math.random() * w;
        const y = h + 10;

        const p = this.createParticle('magic', x, y);
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = -0.3 - Math.random() * 0.5;
        p.maxLife = 8000;
        p.life = p.maxLife;

        const colors = [
            AURORA_THEME.colors.auroraGreen,
            AURORA_THEME.colors.auroraBlue,
            AURORA_THEME.colors.turquoise,
            AURORA_THEME.colors.iceWhite,
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 3;
        p.sprite.circle(0, 0, size);
        p.sprite.fill({ color, alpha: 0.6 });
        p.sprite.x = x;
        p.sprite.y = y;

        this.container.addChild(p.sprite);
        this.particles.push(p);

        gsap.to(p.sprite, {
            alpha: 0,
            duration: p.maxLife / 1000,
            ease: 'none',
        });
    }

    public crystalBurst(x: number, y: number, count: number = 20, intensity: number = 1): void {
        for (let i = 0; i < count; i++) {
            const p = this.createParticle('crystal', x, y);
            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 4) * intensity;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - 2;
            p.maxLife = 1500;
            p.life = p.maxLife;

            const colors = [
                AURORA_THEME.colors.turquoise,
                AURORA_THEME.colors.iceWhite,
                AURORA_THEME.colors.gold,
                AURORA_THEME.colors.crystal,
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = (4 + Math.random() * 6) * intensity;
            p.sprite.circle(0, 0, size);
            p.sprite.fill({ color, alpha: 0.9 });
            p.sprite.x = x;
            p.sprite.y = y;

            this.container.addChild(p.sprite);
            this.particles.push(p);

            gsap.to(p.sprite, {
                x: x + p.vx * 60,
                y: y + p.vy * 60 + 100,
                alpha: 0,
                rotation: Math.random() * Math.PI * 4,
                duration: 1.5,
                ease: 'power2.out',
                onComplete: () => this.removeParticle(p),
            });
        }
    }

    public crystalRain(count: number = 50, duration: number = 3): void {
        const w = this.app.screen.width;
        let spawned = 0;
        const spawn = () => {
            if (spawned >= count) return;
            const x = Math.random() * w;
            const p = this.createParticle('crystal', x, -20);
            p.vx = (Math.random() - 0.5) * 1;
            p.vy = 2 + Math.random() * 3;
            p.maxLife = 3000;
            p.life = p.maxLife;

            const colors = [
                AURORA_THEME.colors.gold,
                AURORA_THEME.colors.turquoise,
                AURORA_THEME.colors.iceWhite,
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 5 + Math.random() * 8;
            p.sprite.circle(0, 0, size);
            p.sprite.fill({ color, alpha: 0.9 });
            p.sprite.x = x;
            p.sprite.y = -20;

            this.container.addChild(p.sprite);
            this.particles.push(p);

            gsap.to(p.sprite, {
                y: this.app.screen.height + 30,
                x: x + p.vx * 100,
                rotation: Math.random() * Math.PI * 6,
                duration: 2.5,
                ease: 'power1.in',
                onComplete: () => this.removeParticle(p),
            });

            spawned++;
            setTimeout(spawn, (duration * 1000) / count);
        };
        spawn();
    }

    public auroraBeam(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const beam = new PIXI.Graphics();

        const drawBeam = (offset: number) => {
            beam.clear();
            beam.moveTo(0, h * 0.3);
            for (let i = 0; i <= 20; i++) {
                const x = (w / 20) * i;
                const y = h * 0.3 + Math.sin(offset + i * 0.3) * 50;
                beam.lineTo(x, y);
            }
            for (let i = 20; i >= 0; i--) {
                const x = (w / 20) * i;
                const y = h * 0.3 + Math.sin(offset + i * 0.3) * 50 + 80;
                beam.lineTo(x, y);
            }
            beam.closePath();
            beam.fill({ color: AURORA_THEME.colors.auroraGreen, alpha: 0.4 });
        };

        drawBeam(0);
        this.container.addChild(beam);

        const obj = { offset: 0 };
        gsap.to(obj, {
            offset: Math.PI * 4,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => drawBeam(obj.offset),
        });
        gsap.to(beam, {
            alpha: 0,
            duration: 2,
            ease: 'power2.out',
            onComplete: () => beam.destroy(),
        });
    }

    public sparkle(x: number, y: number, count: number = 8): void {
        for (let i = 0; i < count; i++) {
            const p = this.createParticle('sparkle', x, y);
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1 + Math.random() * 2;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.maxLife = 800;
            p.life = p.maxLife;

            const size = 3 + Math.random() * 4;
            p.sprite.star(0, 0, 4, size, size * 0.4);
            p.sprite.fill({ color: AURORA_THEME.colors.gold, alpha: 1 });
            p.sprite.x = x;
            p.sprite.y = y;

            this.container.addChild(p.sprite);
            this.particles.push(p);

            gsap.to(p.sprite, {
                x: x + p.vx * 40,
                y: y + p.vy * 40,
                alpha: 0,
                scale: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => this.removeParticle(p),
            });
        }
    }

    public iceShatter(x: number, y: number, count: number = 30): void {
        for (let i = 0; i < count; i++) {
            const p = this.createParticle('ice', x, y);
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.maxLife = 1200;
            p.life = p.maxLife;

            const size = 4 + Math.random() * 8;
            p.sprite.moveTo(0, -size);
            p.sprite.lineTo(size * 0.6, size * 0.5);
            p.sprite.lineTo(-size * 0.6, size * 0.5);
            p.sprite.closePath();
            p.sprite.fill({ color: AURORA_THEME.colors.iceWhite, alpha: 0.9 });
            p.sprite.x = x;
            p.sprite.y = y;
            p.sprite.rotation = Math.random() * Math.PI * 2;

            this.container.addChild(p.sprite);
            this.particles.push(p);

            gsap.to(p.sprite, {
                x: x + p.vx * 80,
                y: y + p.vy * 80 + 120,
                alpha: 0,
                rotation: Math.random() * Math.PI * 8,
                duration: 1.2,
                ease: 'power2.out',
                onComplete: () => this.removeParticle(p),
            });
        }
    }

    private createParticle(type: ParticleType, _x: number, _y: number): Particle {
        const sprite = new PIXI.Graphics();
        return { sprite, vx: 0, vy: 0, life: 0, maxLife: 0, type };
    }

    private removeParticle(p: Particle): void {
        const idx = this.particles.indexOf(p);
        if (idx >= 0) this.particles.splice(idx, 1);
        if (p.sprite && !p.sprite.destroyed) {
            p.sprite.destroy();
        }
    }

    public update(delta: number): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta * 16;
            if (p.life <= 0) {
                this.removeParticle(p);
            }
        }
    }

    public destroy(): void {
        this.stopAmbient();
        this.particles.forEach(p => p.sprite.destroy());
        this.particles = [];
        this.container.destroy({ children: true });
    }
}
