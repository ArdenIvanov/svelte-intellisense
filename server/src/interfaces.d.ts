import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

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

    refs: CompletionItem[];
    computed: CompletionItem[];
    helpers: CompletionItem[];
    components: CompletionItem[];
}