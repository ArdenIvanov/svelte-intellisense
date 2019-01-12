import { CompletionItem, CompletionItemKind, Position } from 'vscode-languageserver';
import { DocumentsCache } from './DocumentsCache';
import { SvelteDocument } from './SvelteDocument';

export interface ConfigurationItem {
    completionItemKind: CompletionItemKind;
    metadataName: string;
    hasPublic: boolean;
}

export interface ImportedComponent {
    name: string;
    filePath: string;
}

export interface ComponentMetadata {
    data: CompletionItem[];
    public_data: CompletionItem[];

    events: CompletionItem[];
    public_events: CompletionItem[];

    methods: CompletionItem[];
    public_methods: CompletionItem[];

    slots:  CompletionItem[];
    public_slots:  CompletionItem[];

    transitions: CompletionItem[];

    actions: CompletionItem[];
    refs: CompletionItem[];
    computed: CompletionItem[];
    helpers: CompletionItem[];
    components: CompletionItem[];
}

export interface DocumentPosition extends Position {
    /**
     * Index of cursor offset in document.
     * Handful to use with `String.substr` like methods.
     */
    offset: number;
}

export interface GenericScopeContext<TData> {
    content: string;
    offset: number;
    data?: TData;
    
    documentOffset: number;
}

export interface ScopeContext extends GenericScopeContext<any> {
    
}

export interface WorkspaceContext {
    documentsCache: DocumentsCache;
}

export interface ImportResolver {
    resolve(importee: string): SvelteDocument;
    resolvePath(partialPath: string): string;
}