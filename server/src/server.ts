'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments
} from 'vscode-languageserver';

import * as svelteLanguage from './svelteLanguage';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

connection.onInitialize(() => {
	return {
		capabilities: {
			completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['<', '.', ':', '#']
            },
            textDocumentSync: documents.syncKind
		}
	};
});

interface ImportedComponent {
    name: string;
    filePath: string;
}

interface ComponentMetadata {
    publicEvents: CompletionItem[];
    publicMethods: CompletionItem[];
    publicData: CompletionItem[];
    publicSlots:  CompletionItem[];
    
    data: CompletionItem[];
    events: CompletionItem[];
    methods: CompletionItem[];
    refs: CompletionItem[];
    computed: CompletionItem[];
    helpers: CompletionItem[];
    components: CompletionItem[];
}

let documentsCache: Map<string, ComponentMetadata> = new Map();
let documentImportsCache: Map<string, ImportedComponent[]> = new Map();
let documentsContent: Map<string, string> = new Map();

documents.onDidChangeContent(change => {
    documentsContent.set(change.document.uri, change.document.getText());

    parse({
        fileContent: change.document.getText()
    }).then(sveltedoc => {
        const docPath = utils.Utils.fileUriToPath(change.document.uri);
        reloadDocumentImports(docPath, sveltedoc.components);
        reloadDocumentCompletions(docPath, sveltedoc);
    }).catch(error => {
        console.log(error);
    });
});

documents.onDidClose(event => {
    documentsContent.delete(utils.Utils.fileUriToPath(event.document.uri));
});

function reloadDocumentCompletions(documentPath: string, componentMetadata: any) {
    const visibilityFilter = (item) => item.visibility === 'public';

    const metadata: ComponentMetadata = {
        data: (<Array<any>>componentMetadata.data).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Field,
                documentation: item.description,
                preselect: true
            };
        }),
        events: (<Array<any>>componentMetadata.events).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Event,
                documentation: item.description,
                preselect: true
            };
        }),
        publicEvents: (<Array<any>>componentMetadata.events).filter(visibilityFilter).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Event,
                documentation: item.description,
                preselect: true
            };
        }),
        publicSlots: (<Array<any>>componentMetadata.slots).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Field,
                documentation: item.description,
                preselect: true
            };
        }),        
        methods: (<Array<any>>componentMetadata.methods).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Method,
                documentation: item.description,
                preselect: true
            };
        }),
        publicMethods: (<Array<any>>componentMetadata.methods).filter(visibilityFilter).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Method,
                documentation: item.description,
                preselect: true
            };
        }),
        helpers: (<Array<any>>componentMetadata.helpers).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Method,
                documentation: item.description,
                preselect: true
            };
        }),
        refs: (<Array<any>>componentMetadata.refs).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Field,
                documentation: item.description,
                preselect: true
            };
        }),
        computed: (<Array<any>>componentMetadata.computed).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Field,
                documentation: item.description,
                preselect: true
            };
        }),
        publicData: (<Array<any>>componentMetadata.data).filter(visibilityFilter).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Field,
                documentation: item.description,
                preselect: true
            };
        }),
        components: (<Array<any>>componentMetadata.components).map((item) => {
            return <CompletionItem>{
                label: item.name,
                kind: CompletionItemKind.Class,
                documentation: item.description,
                preselect: true
            };
        })
    };

    documentsCache.set(documentPath, metadata);
}

function reloadDocumentImports(documentPath: string, components: any[]) {
    components.forEach(c => {
        const importFilePath = path.resolve(path.dirname(documentPath), c.value);
        if (!documentsCache.has(importFilePath)) {
            let realFilePath = importFilePath;
            
            if (!fs.existsSync(realFilePath))
            {
                connection.workspace.getWorkspaceFolders()
                .then(folders => {
                    const workspaceFolder = folders.find(folder => fs.existsSync(path.resolve(utils.Utils.fileUriToPath(folder.uri), 'node_modules')));
                    if (workspaceFolder) {
                        realFilePath = path.resolve(utils.Utils.fileUriToPath(workspaceFolder.uri), 'node_modules', c.value);
                        parse({
                            filename: realFilePath
                        }).then(sveltedoc => {
                            reloadDocumentCompletions(importFilePath, sveltedoc);
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                });
            } else {
                parse({
                    filename: realFilePath
                }).then(sveltedoc => {
                    reloadDocumentCompletions(importFilePath, sveltedoc);
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    });

    documentImportsCache.set(documentPath, components.map(item => {
        return {name: item.name, filePath: path.resolve(path.dirname(documentPath), item.value)}; 
    }));
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        // The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        const docPath = utils.Utils.fileUriToPath(_textDocumentPosition.textDocument.uri);
        const docImports = documentImportsCache.get(docPath) || [];
        const metadata = documentsCache.get(docPath);

        const content = documentsContent.get(_textDocumentPosition.textDocument.uri);
        const offset = utils.Utils.offsetAt(content, _textDocumentPosition.position);

        const prevContent = content.substring(0, offset);

        const openBlockIndex = prevContent.lastIndexOf('{#');
        if (openBlockIndex >= 0 && prevContent.indexOf('{/', openBlockIndex) < 0) {
            const blockContent = prevContent.substring(openBlockIndex);

            if (prevContent.indexOf('}', openBlockIndex) < 0) {
                if (/\{\#$/g.test(blockContent)) {
                    return svelteLanguage.markupBlockCompletitionItems;
                }
            }

            const openBlockMatch = /^\{\#([\w]+)\s*/g.exec(blockContent);
            console.log(openBlockMatch);
            if (openBlockMatch) {
                const blockName = openBlockMatch[1].toLowerCase();

                if (svelteLanguage.markupBlockInnerCompletitionItems.hasOwnProperty(blockName)) {
                    const innerBlockOpenIndex = blockContent.lastIndexOf('{:');
                    if (innerBlockOpenIndex >= 0 && blockContent.indexOf('}', innerBlockOpenIndex) <= 0) {
                        const innerBlockContent = blockContent.substring(innerBlockOpenIndex);
                        
                        if (/\{\:$/g.test(innerBlockContent)) {
                            return svelteLanguage.markupBlockInnerCompletitionItems[blockName];
                        }
                    }
                }
            }
        }

        const openTagIndex = prevContent.lastIndexOf('<');
        if (openTagIndex >= 0 && prevContent.indexOf('>', openTagIndex) < 0) {
            const tagContent = prevContent.substring(openTagIndex);

            if (metadata && /<[\w_-\d]*$/g.test(tagContent)) {
                return metadata.components;
            }

            const openedTagMatch = /<([\w_-\d]*)\s*/g.exec(tagContent);
            if (openedTagMatch) {
                const tagName = openedTagMatch[1];
                const importedComponent = docImports.find(c => c.name === tagName);
                if (importedComponent) {
                    const importedMetadata = documentsCache.get(importedComponent.filePath);
                    if (importedMetadata) {
                        if (/on:[\w_-\d]*$/.test(tagContent)) {
                            return importedMetadata.publicEvents;
                        }
                        return importedMetadata.publicData;
                    }
                }
            }
        }
        
        return [];
    }
);

connection.onCompletionResolve(item => item);

documents.listen(connection);
connection.listen();