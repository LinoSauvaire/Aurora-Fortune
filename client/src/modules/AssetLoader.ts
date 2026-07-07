import * as PIXI from 'pixi.js';

type AssetManifest = {
    bundles: {
        name: string;
        assets: {
            name: string;
            srcs: string;
        }[];
    }[];
};

export class AssetLoader {
    private manifest: AssetManifest | null = null;

    constructor() {
        console.log("AssetLoader initialized");
    }

    public async init(manifestPath: string): Promise<void> {
        const response = await fetch(manifestPath);
        this.manifest = await response.json();
        // PIXI v8 expects assets in bundle to be { alias, src } format
        const pixiManifest = {
            bundles: this.manifest!.bundles.map((b) => ({
                name: b.name,
                assets: b.assets.map((a) => ({ alias: a.name, src: a.srcs })),
            })),
        };
        await PIXI.Assets.init({ manifest: pixiManifest as any });
    }

    public async loadBundle(bundleName: string, onProgress?: (progress: number) => void): Promise<void> {
        if (!this.manifest) {
            throw new Error("AssetLoader has not been initialized. Call init() first.");
        }
        await PIXI.Assets.loadBundle(bundleName, onProgress);
        console.log(`Bundle "${bundleName}" loaded.`);
    }

    public getTexture(assetName: string): PIXI.Texture {
        return PIXI.Assets.get(assetName);
    }
}
