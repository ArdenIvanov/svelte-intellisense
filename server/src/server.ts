'use strict';

import {
	createConnection,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
    TextDocumentPositionParams,
    TextDocuments,
    Hover,
    Definition
} from 'vscode-languageserver';

import cosmic from 'cosmiconfig';

import { ConfigurationItem, ComponentMetadata, WorkspaceContext, ScopeContext } from './interfaces';
import { SvelteDocument, SVELTE_VERSION_3 } from './SvelteDocument';

import {parse} from 'sveltedoc-parser';
import * as path from 'path';
import * as utils from './utils';
import { DocumentService } from './services/DocumentService';
import { DocumentsCache } from './DocumentsCache';
import { NodeModulesImportResolver } from './ImportResolvers/NodeModulesImportResolver';
import { WebpackImportResolver } from './ImportResolvers/WebpackImportResolver';
import { RollupImportResolver } from './ImportResolvers/RollupImportResolver';

// run babel for rollup config
require('@babel/register')({ 
    only: [ /rollup.config.js/ ], 
    presets: [ "@babel/preset-env" ], 
    cwd: __dirname });

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

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
                triggerCharacters: ['<', '.', ':', '#', '/', '@', '"', '|']
            },
            textDocumentSync: documents.syncKind,
            hoverProvider : true,
            definitionProvider : true
		}
	};
});

const documentsCache: DocumentsCache = new DocumentsCache();


const cosmicWebpack = cosmic('webpack', {packageProp: false });
const cosmicRollup = cosmic('rollup', {packageProp: false });

documents.onDidChangeContent(change => {
    const document = documentsCache.getOrCreateDocumentFromCache(utils.fileUriToPath(change.document.uri));
    if (!document.document) {
        document.document = change.document;
    }
    
    document.content = change.document.getText();

    parse({
        fileContent: document.content,
        ignoredVisibilities: [],
        includeSourceLocations: true,
        defaultVersion: SVELTE_VERSION_3
    }).then(sveltedoc => {
        if (sveltedoc.name === null) {
            sveltedoc.name = path.basename(document.path, path.extname(document.path));
        }
        if (document.importResolver === null) {
            try {
                const { config } = cosmicWebpack.searchSync(document.path);
                if (config && config.resolve && config.resolve.alias) {
                    document.importResolver = new WebpackImportResolver(documentsCache, document.path, config.resolve.alias);
                }
            }
            catch {}
            if (document.importResolver === null) {
                try {                    
                    const { config } = cosmicRollup.searchSync(document.path);
                    if (config && config.default && config.default.plugins) {
                        document.importResolver = new RollupImportResolver(documentsCache, document.path, config.default.plugins);
                    }
                }
                catch (er){
                    //console.log(er);
                }
            }
            if (document.importResolver === null) {
                document.importResolver = new NodeModulesImportResolver(documentsCache, document.path);
            }
        }
        reloadDocumentImports(document, sveltedoc.components || []);
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

        if (!componentMetadata[value.metadataName]) {
            componentMetadata[value.metadataName] = [];
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
        const importedDocument = document.importResolver.resolve(c.value);

        if (importedDocument !== null) {
            document.importedComponents.push({name: c.name, filePath: importedDocument.path});
            if (!document.document) {
                document.document = utils.createTextDocument(importedDocument.path);
            }
            
            parse({
                filename: importedDocument.path,
                ignoredVisibilities: [],
                includeSourceLocations: true,
                defaultVersion: SVELTE_VERSION_3
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

    const path = utils.fileUriToPath(_textDocumentPosition.textDocument.uri);
    const document = documentsCache.getOrCreateDocumentFromCache(path);
    if (!document.document) {
        document.document = utils.createTextDocument(path, _textDocumentPosition.textDocument.uri);
    }

    const offset = document.offsetAt(_textDocumentPosition.position);

    const scopeContext = <ScopeContext>{
        documentOffset: offset,
        content: document.content,
        offset: offset
    };

    const workspaceContext = <WorkspaceContext>{
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

connection.onDefinition(
    (_textDocumentPosition: TextDocumentPositionParams) : Definition => {
        return executeActionInContext(_textDocumentPosition, (document, scopeContext, workspaceContext) => {
            return svelteDocumentService.getDefinition(document, scopeContext, workspaceContext);
        });
    }
);

documents.listen(connection);
connection.listen();
