'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments
} from 'vscode-languageserver';

import { ConfigurationItem, ComponentMetadata } from './interfaces';
import { SvelteDocument } from './SvelteDocument';

import * as svelteLanguage from './svelteLanguage';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import * as docUtils from './svelteDocUtils';
import { DocumentCompletionService } from './completition/DocumentCompletionService';
import { WorkspaceContext, DocumentPosition } from './completition/interfaces';

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
                triggerCharacters: ['<', '.', ':', '#', '/', '@']
            },
            textDocumentSync: documents.syncKind
		}
	};
});

let documentsCache: Map<string, SvelteDocument> = new Map();

function getOrCreateDocumentFromCache(path: string, createIfNotExists = true) {
    if (!documentsCache.has(path)) {
        if (createIfNotExists) {
            documentsCache.set(path, new SvelteDocument(path));
        } else {
            return null;
        }
    }
    return documentsCache.get(path);
}

documents.onDidChangeContent(change => {
    const document = getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(change.document.uri));
    
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
    const document = getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(event.document.uri));

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
        let importedDocument = getOrCreateDocumentFromCache(importFilePath, false);

        if (importedDocument === null) {
            if (fs.existsSync(importFilePath)) {
                importedDocument = getOrCreateDocumentFromCache(importFilePath);                        
            } else {
                connection.workspace.getWorkspaceFolders()
                    .then(folders => {
                        const workspaceFolder = folders.find(folder => fs.existsSync(path.resolve(utils.Utils.fileUriToPath(folder.uri), 'node_modules')));
                        if (workspaceFolder) {
                            const realFilePath = path.resolve(utils.Utils.fileUriToPath(workspaceFolder.uri), 'node_modules', c.value);
                            if (fs.existsSync(realFilePath)) {
                                importedDocument = getOrCreateDocumentFromCache(realFilePath);                        
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
        const document = getOrCreateDocumentFromCache(utils.Utils.fileUriToPath(_textDocumentPosition.textDocument.uri))

        const position = <DocumentPosition>{
            line: _textDocumentPosition.position.line,
            character: _textDocumentPosition.position.character,
            offset: document.offsetAt(_textDocumentPosition.position)
        };

        const workspaceContext = <WorkspaceContext>{
            nodeModulesPath: workspaceNodeModulesPath
        };

        return completitionService.getCompletitionItems(document, position, workspaceContext);

        const offset = utils.Utils.offsetAt(document.content, _textDocumentPosition.position);

        const prevContent = document.content.substring(0, offset);

        const openTagIndex = prevContent.lastIndexOf('<');
        if (openTagIndex >= 0 && prevContent.indexOf('>', openTagIndex) < 0) {
            const tagContent = prevContent.substring(openTagIndex);

            if (document.metadata && /<[\w_-\d]*$/g.test(tagContent)) {
                return document.metadata.components;
            }

            const openedTagMatch = /<([\w_-\d]*)\s*/g.exec(tagContent);
            if (openedTagMatch) {
                const tagName = openedTagMatch[1];
                const importedComponent = document.importedComponents.find(c => c.name === tagName);
                if (importedComponent) {
                    const importedDocument = getOrCreateDocumentFromCache(importedComponent.filePath, false);
                    if (importedDocument !== null) {
                        if (/on:[\w_-\d]*$/.test(tagContent)) {
                            return importedDocument.metadata.public_events;
                        }
                        return importedDocument.metadata.public_data;
                    }
                }
            }
        }
        
        return [];
    }
);

documents.listen(connection);
connection.listen();