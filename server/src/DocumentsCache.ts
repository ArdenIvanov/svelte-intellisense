import { SvelteDocument } from "./SvelteDocument";

export class DocumentsCache {
    private cache: Map<string, SvelteDocument> = new Map();

    public has(path: string): boolean {
        return this.cache.has(path);
    }

    public get(path: string): SvelteDocument {
        return this.cache.get(path);
    }

    public getOrCreateDocumentFromCache(path: string, createIfNotExists = true): SvelteDocument {
        if (!this.cache.has(path)) {
            if (createIfNotExists) {
                this.cache.set(path, new SvelteDocument(path));
            } else {
                return null;
            }
        }

        return this.cache.get(path);
    }
}