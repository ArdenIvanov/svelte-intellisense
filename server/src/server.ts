'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments
} from 'vscode-languageserver';

import {
	ConfigurationItem,
	ImportedComponent,
	ComponentMetadata
} from './interfaces';

import * as svelteLanguage from './svelteLanguage';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import * as docUtils from './svelteDocUtils';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let workspaceNodeModulesPath = null;
let workspaceNodeModulesPathInitialized = false;

const mappingConfigurations: Array<ConfigurationItem> = [
    {documentationItemName: 'data', completionItemKind: CompletionItemKind.Field, metadataName: 'data', hasPublic: true},
    {documentationItemName: 'events', completionItemKind: CompletionItemKind.Event, metadataName: 'events', hasPublic: true},
    {documentationItemName: 'slots', completionItemKind: CompletionItemKind.Field, metadataName: 'slots', hasPublic: true},
    {documentationItemName: 'methods', completionItemKind: CompletionItemKind.Method, metadataName: 'methods', hasPublic: true},
    {documentationItemName: 'helpers', completionItemKind: CompletionItemKind.Method, metadataName: 'helpers', hasPublic: false},
    {documentationItemName: 'refs', completionItemKind: CompletionItemKind.Field, metadataName: 'refs', hasPublic: false},
    {documentationItemName: 'computed', completionItemKind: CompletionItemKind.Field, metadataName: 'computed', hasPublic: false},
    {documentationItemName: 'components', completionItemKind: CompletionItemKind.Class, metadataName: 'components', hasPublic: true}
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

let documentsCache: Map<string, ComponentMetadata> = new Map();
let documentImportsCache: Map<string, ImportedComponent[]> = new Map();
let documentsContent: Map<string, string> = new Map();

documents.onDidChangeContent(change => {
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

    documentsContent.set(change.document.uri, change.document.getText());

    parse({
        fileContent: change.document.getText()
    }).then(sveltedoc => {
        const docPath = utils.Utils.fileUriToPath(change.document.uri);
        reloadDocumentImports(docPath, sveltedoc.components);
        reloadDocumentCompletions(docPath, sveltedoc);
    }).catch(() => {
        // supress error
    });
});

documents.onDidClose(event => {
    documentsContent.delete(utils.Utils.fileUriToPath(event.document.uri));
});

function reloadDocumentCompletions(documentPath: string, componentMetadata: any) {
    let metadata = {};
    mappingConfigurations.forEach((value) => {
        metadata[value.metadataName] = [];
        if (value.hasPublic) {
            metadata['public_' + value.metadataName] = [];
        }

        componentMetadata[value.documentationItemName].forEach((item) => {
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

    documentsCache.set(documentPath, <ComponentMetadata>metadata);
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
                        }).catch(() => {
                            // supress error
                        });;
                    }
                });
            } else {
                parse({
                    filename: realFilePath
                }).then(sveltedoc => {
                    reloadDocumentCompletions(importFilePath, sveltedoc);
                }).catch(() => {
                    // supress error
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

        const openComponentsBlockIndex = prevContent.lastIndexOf('components');
        if (/components\s*:\s*\{/g.test(prevContent) && prevContent.indexOf('}', openComponentsBlockIndex) < 0) {
            // Find open quote for component path
            let quote = '\'';
            let openQuoteIndex = prevContent.lastIndexOf(quote);
            if (openQuoteIndex < 0) {
                quote = '"';
                openQuoteIndex = prevContent.lastIndexOf(quote);
            }
            if (openQuoteIndex < 0) {
                quote = '`';
                openQuoteIndex = prevContent.lastIndexOf(quote);
            }

            // Check that cursor positioned in component path string
            if (openQuoteIndex > openComponentsBlockIndex 
                && prevContent.indexOf(quote, openQuoteIndex + 1) < 0
                && prevContent.lastIndexOf(quote, openQuoteIndex - 1) <= prevContent.lastIndexOf(':', openQuoteIndex - 1)
            ) {
                const partialPath = prevContent.substring(openQuoteIndex + 1);
                const baseDocumentPath = path.dirname(docPath);

                // Do nothing if partial path started from root folder
                if (partialPath.startsWith('/')) {
                    return [];
                }

                // Don't show auto-completion for hidden items
                if (/[\\\/]\.+$/g.test(partialPath)) {
                    return [];
                }

                const result = [];

                // Search in local folder
                if (partialPath.startsWith('./') || partialPath.startsWith('../')) {
                    const searchFolderPath = path.resolve(baseDocumentPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

                    if (fs.existsSync(searchFolderPath)) {
                        const foundItems = fs.readdirSync(searchFolderPath);
    
                        foundItems
                            .map((foundPath) => {
                                const basename = path.basename(foundPath);

                                // Don't include hidden items
                                if (basename.startsWith('.')) {
                                    return null;
                                }

                                const itemStats = fs.lstatSync(path.resolve(searchFolderPath, foundPath));
    
                                if (itemStats.isDirectory()) {
                                    return <CompletionItem>{
                                        label: path.basename(foundPath),
                                        kind: CompletionItemKind.Folder,
                                        commitCharacters: ['/'],
                                        sortText: `1.${basename}`
                                    };
                                }
    
                                if (itemStats.isFile() && path.extname(foundPath) === '.svelte') {
                                    return <CompletionItem>{
                                        label: path.basename(foundPath),
                                        kind: CompletionItemKind.Class,
                                        commitCharacters: ['/'],
                                        sortText: `2.${basename}`
                                    }
                                }
    
                                return null;
                            })
                            .filter(item => item != null)
                            .forEach(item => result.push(item));
                    }    
                } else if (!partialPath.startsWith('.')) {
                    // Search in node modules folder
                    if (workspaceNodeModulesPath != null) {
                        const searchFolderPath = path.resolve(workspaceNodeModulesPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

                        if (fs.existsSync(searchFolderPath)) {
                            const foundItems = fs.readdirSync(searchFolderPath);

                            foundItems
                                .map((foundPath) => {
                                    const basename = path.basename(foundPath);
                                    // Don't include hidden items
                                    if (basename.startsWith('.')) {
                                        return null;
                                    }

                                    const partialBaseName = path.basename(partialPath);

                                    const itemStats = fs.lstatSync(path.resolve(searchFolderPath, foundPath));

                                    if (itemStats.isDirectory()) {
                                        return <CompletionItem>{
                                            label: basename,
                                            kind: CompletionItemKind.Folder,
                                            detail: 'from node_modules',
                                            commitCharacters: ['/'],
                                            insertText: basename.startsWith('@') && partialBaseName.startsWith('@') 
                                                ? basename.substring(1) 
                                                : basename,
                                            filterText: basename.startsWith('@') 
                                                ? basename.substring(1) 
                                                : basename,
                                            sortText: `1.${basename}`
                                        }
                                    }

                                    if (itemStats.isFile() && path.extname(foundPath) === '.svelte') {
                                        return <CompletionItem>{
                                            label: basename,
                                            kind: CompletionItemKind.Class,
                                            detail: 'from node_modules',
                                            commitCharacters: ['/', '\''],
                                            sortText: `2.${basename}`
                                        }
                                    }

                                    return null;
                                })
                                .filter(item => item != null)
                                .forEach(item => result.push(item));
                        }
                    }  
                }

                return result;
            }
        }

        const openBlockIndex = prevContent.lastIndexOf('{#');
        if (openBlockIndex >= 0) {
            if (prevContent.indexOf('{/', openBlockIndex) < 0 || /\{\/[\w]*$/g.test(prevContent)) {
                const blockContent = prevContent.substring(openBlockIndex);

                if (prevContent.indexOf('}', openBlockIndex) < 0) {
                    if (/\{\#$/g.test(blockContent)) {
                        return svelteLanguage.markupBlockCompletitionItems;
                    }
                }

                const openBlockMatch = /^\{\#([\w]+)\s*/g.exec(blockContent);
                if (openBlockMatch) {
                    const blockName = openBlockMatch[1].toLowerCase();

                    if (/\{\/[\w]*$/g.test(blockContent)) {
                        return [
                            <CompletionItem>{
                                label: blockName,
                                kind: CompletionItemKind.Keyword,
                                preselect: true
                            }
                        ]
                    }

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
                            return importedMetadata.public_events;
                        }
                        return importedMetadata.public_data;
                    }
                }
            }
        }
        
        return [];
    }
);

documents.listen(connection);
connection.listen();