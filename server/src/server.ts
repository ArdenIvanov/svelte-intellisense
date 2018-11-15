'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments
} from 'vscode-languageserver';

import { ConfigurationItem, ComponentMetadata, WorkspaceContext, DocumentPosition } from './interfaces';
import { SvelteDocument } from './SvelteDocument';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import * as docUtils from './svelteDocUtils';
import { DocumentCompletionService } from './completition/DocumentCompletionService';
import { DocumentsCache } from './DocumentsCache';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let workspaceNodeModulesPath = null;
let workspaceNodeModulesPathInitialized = false;

const mappingConfigurations: Array<ConfigurationItem> = [
    {completionItemKind: CompletionItemKind.Field, metadataName: 'data', hasPublic: true},
    {completionItemKind: CompletionItemKind.Event, metadataName: 'events', hasPublic: true},
    {completionItemKind: CompletionItemKind.Field, metadataName: 'slots', hasPublic: true},
    {completionItemKind: CompletionItemKind.Method, metadataName: 'methods', hasPublic: true},
    {completionItemKind: CompletionItemKind.Method, metadataName: 'helpers', hasPublic: false},
    {completionItemKind: CompletionItemKind.Field, metadataName: 'refs', hasPublic: false},
    {completionItemKind: CompletionItemKind.Field, metadataName: 'computed', hasPublic: false},
    {completionItemKind: CompletionItemKind.Class, metadataName: 'components', hasPublic: true}
];

connection.onInitialize(() => {
	return {
		capabilities: {
			completionProvider: {
                triggerCharacters: ['<', '.', ':', '#', '/', '@', '"']
            },
            textDocumentSync: documents.syncKind
		}
	};
});

const documentsCache: DocumentsCache = new DocumentsCache();

documents.onDidChangeContent(change => {
    const document = documentsCache.getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(change.document.uri));
    
    if (!workspaceNodeModulesPathInitialized) {
        workspaceNodeModulesPathInitialized = true;
        connection.workspace.getWorkspaceFolders()
            .then(folders => {
                const workspaceFolder = folders.find(folder => fs.existsSync(path.resolve(utils.Utils.fileUriToPath(folder.uri), 'node_modules')));
                if (workspaceFolder) {
                    workspaceNodeModulesPath = path.resolve(utils.Utils.fileUriToPath(workspaceFolder.uri), 'node_modules');
                }
            });
    }

    document.content = change.document.getText();

    parse({
        fileContent: document.content
    }).then(sveltedoc => {
        reloadDocumentImports(document, sveltedoc.components);
        reloadDocumentMetadata(document, sveltedoc);
    }).catch(() => {
        // supress error
    });
});

documents.onDidClose(event => {
    const document = documentsCache.getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(event.document.uri));

    document.content = null;
});

function reloadDocumentMetadata(document: SvelteDocument, componentMetadata: any) {
    let metadata = {};
    mappingConfigurations.forEach((value) => {
        metadata[value.metadataName] = [];
        if (value.hasPublic) {
            metadata['public_' + value.metadataName] = [];
        }

        componentMetadata[value.metadataName].forEach((item) => {
            let description =  item.description;

            if (value.metadataName === 'components') {
                description = documentsCache.has(item.value) 
                    ? {
                        value: docUtils.buildDocumentation(documentsCache.get(item.value)),
                        kind: 'markdown'
                    } 
                    : item.name;
            }

            const completionItem = <CompletionItem>{
                label: item.name,
                kind: value.completionItemKind,
                documentation: description,
                preselect: true
            };

            metadata[value.metadataName].push(completionItem);
            if (value.hasPublic && item.visibility === 'public') {
                metadata['public_' + value.metadataName].push(completionItem);
            }
        });
    });

    document.metadata = <ComponentMetadata>metadata;
}

function reloadDocumentImport(document: SvelteDocument, importedDocument: SvelteDocument, importName: string) {
    if (importedDocument !== null) {
        document.importedComponents.push({name: importName, filePath: importedDocument.path});
        
        parse({
            filename: importedDocument.path
        }).then(sveltedoc => {
            reloadDocumentMetadata(importedDocument, sveltedoc);
        }).catch(() => {
            // supress error
        });
    }
}

function reloadDocumentImports(document: SvelteDocument, components: any[]) {
    document.importedComponents = [];

    components.forEach(c => {
        const importFilePath = path.resolve(path.dirname(document.path), c.value);
        let importedDocument = documentsCache.getOrCreateDocumentFromCache(importFilePath, false);

        if (importedDocument === null) {
            if (fs.existsSync(importFilePath)) {
                importedDocument = documentsCache.getOrCreateDocumentFromCache(importFilePath);                        
            } else {
                connection.workspace.getWorkspaceFolders()
                    .then(folders => {
                        const workspaceFolder = folders.find(folder => fs.existsSync(path.resolve(utils.Utils.fileUriToPath(folder.uri), 'node_modules')));
                        if (workspaceFolder) {
                            const realFilePath = path.resolve(utils.Utils.fileUriToPath(workspaceFolder.uri), 'node_modules', c.value);
                            if (fs.existsSync(realFilePath)) {
                                importedDocument = documentsCache.getOrCreateDocumentFromCache(realFilePath);                        
                                reloadDocumentImport(document, importedDocument, c.name);
                            }
                        }
                    });
                    return;
            }
        }

        reloadDocumentImport(document, importedDocument, c.name);
    });
}

const completitionService = new DocumentCompletionService();

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        // The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        const document = documentsCache.getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(_textDocumentPosition.textDocument.uri))

        const position = <DocumentPosition>{
            line: _textDocumentPosition.position.line,
            character: _textDocumentPosition.position.character,
            offset: document.offsetAt(_textDocumentPosition.position)
        };

        const workspaceContext = <WorkspaceContext>{
            nodeModulesPath: workspaceNodeModulesPath,
            documentsCache: documentsCache
        };

        return completitionService.getCompletitionItems(document, position, workspaceContext);
    }
);

documents.listen(connection);
connection.listen();