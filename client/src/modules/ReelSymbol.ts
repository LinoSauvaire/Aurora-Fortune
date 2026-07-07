import * as PIXI from 'pixi.js';

export class ReelSymbol {
    public container: PIXI.Container;
    private sprite: PIXI.Sprite;
    private name: string;
    private size: number;
    private blurFilter: PIXI.BlurFilter | null = null;
    private baseScale: number = 1;

    constructor(name: string, size: number) {
        this.name = name;
        this.size = size;
        this.container = new PIXI.Container();
        
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);
        
        this.updateSymbol(name);
    }

    public updateSymbol(newName: string): void {
        this.name = newName;
        try {
            // Get texture from Assets
            const texture = PIXI.Assets.get(newName);
            if (texture) {
                this.sprite.texture = texture;
                
                // Scale sprite to fit the target size
                const maxDim = Math.max(texture.width, texture.height);
                const scale = (this.size * 0.85) / maxDim; // Keep 15% margin
                this.sprite.scale.set(scale);
                this.baseScale = scale;
            } else {
                console.warn(`Texture not found for symbol: ${newName}`);
            }
        } catch (error) {
            console.error(`Error loading texture for symbol: ${newName}`, error);
        }
    }

    public getName(): string {
        return this.name;
    }

    public setPosition(x: number, y: number): void {
        this.container.x = x;
        this.container.y = y;
    }

    public setBlur(blurAmount: number): void {
        if (blurAmount > 0) {
            if (!this.blurFilter) {
                this.blurFilter = new PIXI.BlurFilter();
                this.blurFilter.blurX = 0;
                this.container.filters = [this.blurFilter];
            }
            this.blurFilter.blurY = blurAmount;
        } else {
            this.container.filters = null;
            this.blurFilter = null;
        }
    }

    public pulse(durationSec: number = 0.5): void {
        // Simple GSAP pulse animation (assuming gsap is globally imported or we import it)
        // Since GSAP was installed, we can import it.
        import('gsap').then(({ gsap }) => {
            gsap.killTweensOf(this.sprite.scale);
            gsap.killTweensOf(this.container);
            
            this.sprite.scale.set(this.baseScale);
            this.container.angle = 0;

            gsap.to(this.sprite.scale, {
                x: this.baseScale * 1.25,
                y: this.baseScale * 1.25,
                duration: durationSec / 2,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut"
            });
        });
    }

    public glow(active: boolean): void {
        if (active) {
            import('gsap').then(({ gsap }) => {
                gsap.killTweensOf(this.sprite);
                gsap.to(this.sprite, {
                    alpha: 0.5,
                    duration: 0.3,
                    yoyo: true,
                    repeat: -1,
                    ease: "power1.inOut"
                });
            });
        } else {
            import('gsap').then(({ gsap }) => {
                gsap.killTweensOf(this.sprite);
                this.sprite.alpha = 1;
            });
        }
    }

    public destroy(): void {
        this.container.destroy({ children: true });
    }
}
