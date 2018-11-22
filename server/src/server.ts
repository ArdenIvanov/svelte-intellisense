'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments,
    Hover
} from 'vscode-languageserver';

import { ConfigurationItem, ComponentMetadata, WorkspaceContext, ScopeContext } from './interfaces';
import { SvelteDocument } from './SvelteDocument';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import { DocumentService } from './services/DocumentService';
import { DocumentsCache } from './DocumentsCache';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let workspaceNodeModulesPath = null;
let workspaceNodeModulesPathInitialized = false;

const mappingConfigurations: Array<ConfigurationItem> = [
    {completionItemKind: CompletionItemKind.Field, metadataName: 'data', hasPublic: true},
    {completionItemKind: CompletionItemKind.Event, metadataName: 'events', hasPublic: true},
    {completionItemKind: CompletionItemKind.Reference, metadataName: 'slots', hasPublic: true},
    {completionItemKind: CompletionItemKind.Method, metadataName: 'methods', hasPublic: true},
    {completionItemKind: CompletionItemKind.Method, metadataName: 'helpers', hasPublic: false},
    {completionItemKind: CompletionItemKind.Method, metadataName: 'actions', hasPublic: false},
    {completionItemKind: CompletionItemKind.Reference, metadataName: 'refs', hasPublic: false},
    {completionItemKind: CompletionItemKind.Event, metadataName: 'transitions', hasPublic: false},
    {completionItemKind: CompletionItemKind.Property, metadataName: 'computed', hasPublic: false},
    {completionItemKind: CompletionItemKind.Class, metadataName: 'components', hasPublic: true}
];

connection.onInitialize(() => {
	return {
		capabilities: {
			completionProvider: {
                triggerCharacters: ['<', '.', ':', '#', '/', '@', '"']
            },
            textDocumentSync: documents.syncKind,
            hoverProvider : true,
		}
	};
});

const documentsCache: DocumentsCache = new DocumentsCache();

documents.onDidChangeContent(change => {
    const document = documentsCache.getOrCreateDocumentFromCache(utils.fileUriToPath(change.document.uri));
    
    if (!workspaceNodeModulesPathInitialized) {
        workspaceNodeModulesPathInitialized = true;
        connection.workspace.getWorkspaceFolders()
            .then(folders => {
                const workspaceFolder = folders.find(folder => fs.existsSync(path.resolve(utils.fileUriToPath(folder.uri), 'node_modules')));
                if (workspaceFolder) {
                    workspaceNodeModulesPath = path.resolve(utils.fileUriToPath(workspaceFolder.uri), 'node_modules');
                }
            });
    }

    document.content = change.document.getText();

    parse({
        fileContent: document.content,
        ignoredVisibilities: []
    }).then(sveltedoc => {
        reloadDocumentImports(document, sveltedoc.components);
        reloadDocumentMetadata(document, sveltedoc);
    }).catch(() => {
        // supress error
    });
});

documents.onDidClose(event => {
    const document = documentsCache.getOrCreateDocumentFromCache(utils.fileUriToPath(event.document.uri));
    // remove content to free some space
    document.content = null;
    // TODO remove also document or imported documents which are not required in other opened documents
});

function reloadDocumentMetadata(document: SvelteDocument, componentMetadata: any) {
    document.sveltedoc = componentMetadata;

    let metadata = {};
    mappingConfigurations.forEach((value) => {
        metadata[value.metadataName] = [];
        if (value.hasPublic) {
            metadata['public_' + value.metadataName] = [];
        }

        componentMetadata[value.metadataName].forEach((item) => {
            const completionItem = <CompletionItem>{
                label: item.name,
                kind: value.completionItemKind,
                documentation: item.description,
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

function reloadDocumentImports(document: SvelteDocument, components: any[]) {
    document.importedComponents = [];

    components.forEach(c => {
        let importedDocument = null;

        const importFilePath = utils.findSvelteFile(path.resolve(path.dirname(document.path), c.value));
        if (importFilePath !== null) {
            importedDocument = documentsCache.getOrCreateDocumentFromCache(importFilePath);                        
        } else if (workspaceNodeModulesPathInitialized){
            const moduleFilePath = utils.findSvelteFile(path.resolve(workspaceNodeModulesPath, c.value));
            if (moduleFilePath !== null) {
                importedDocument = documentsCache.getOrCreateDocumentFromCache(moduleFilePath);
            }
        }

        if (importedDocument !== null) {
            document.importedComponents.push({name: c.name, filePath: importedDocument.path});
            
            parse({
                filename: importedDocument.path,
                ignoredVisibilities: []
            }).then(sveltedoc => {
                reloadDocumentMetadata(importedDocument, sveltedoc);
            }).catch(() => {
                // supress error
            });
        }
    });
}

const svelteDocumentService = new DocumentService();

function executeActionInContext(_textDocumentPosition: TextDocumentPositionParams, 
        action: (document: SvelteDocument, scopeContext: ScopeContext, workspaceContext: WorkspaceContext) => any) {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.

    if (!svelteDocumentService) {
        return null;
    }

    const document = documentsCache.getOrCreateDocumentFromCache(utils.fileUriToPath(_textDocumentPosition.textDocument.uri));

    const scopeContext = <ScopeContext>{
        content: document.content,
        offset: document.offsetAt(_textDocumentPosition.position)
    };

    const workspaceContext = <WorkspaceContext>{
        nodeModulesPath: workspaceNodeModulesPath,
        documentsCache: documentsCache
    };

    return action(document, scopeContext, workspaceContext);
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        return executeActionInContext(_textDocumentPosition, (document, scopeContext, workspaceContext) => {
            return svelteDocumentService.getCompletitionItems(document, scopeContext, workspaceContext);
        });
    }
);

// This handler provides the hover information.
connection.onHover(
    (_textDocumentPosition: TextDocumentPositionParams) : Hover => {
        return executeActionInContext(_textDocumentPosition, (document, scopeContext, workspaceContext) => {
            return svelteDocumentService.getHover(document, scopeContext, workspaceContext);
        });
    }
);

documents.listen(connection);
connection.listen();