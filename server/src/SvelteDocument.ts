import { ConfigurationItem, ImportedComponent, ComponentMetadata } from './interfaces';

export class SvelteDocument {
    constructor(path: string) {
        this.path = path;
        this.importedComponents = [];
    }

    path: string;
    metadata: ComponentMetadata;
    importedComponents: ImportedComponent[];
    content: string;
}