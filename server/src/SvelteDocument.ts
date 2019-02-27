import { ImportedComponent, ComponentMetadata, ImportResolver } from './interfaces';
import { SvelteComponentDoc } from 'sveltedoc-parser/typings';
import { Position, TextDocument } from 'vscode-languageserver';

export class SvelteDocument {
    constructor(path: string) {
        this.path = path;
        this.importedComponents = [];
        this.importResolver = null;
    }

    path: string;
    sveltedoc: SvelteComponentDoc;
    metadata: ComponentMetadata;
    importedComponents: ImportedComponent[];
    content: string;
    importResolver: ImportResolver;
    document: TextDocument;

    public offsetAt(position: Position): number {
        return this.document.offsetAt(position);
    }

    public positionAt(offset: number): Position {
        return this.document.positionAt(offset);
    }
}