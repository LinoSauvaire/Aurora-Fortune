// RngService.ts
export class RngService {
    generate(): number[] {
        // Basic RNG, to be replaced with a more robust version
        return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
    }
}
