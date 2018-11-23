import * as path from 'path';
import * as fs from 'fs';

import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { WorkspaceContext, ScopeContext } from '../../interfaces';

export const SupportedComponentFileExtensions = [
    '.svelte',
    '.html'
];

export interface ComponentPathServiceOptions {
    extensionsToSearch?: string[];
    extensionsToExclude?: string[];
    includeFileExtensionToInsert?: boolean;
}

const __defaultOptions: ComponentPathServiceOptions = {
    extensionsToSearch: SupportedComponentFileExtensions,
    extensionsToExclude: [],
    includeFileExtensionToInsert: true
}

export class ComponentPathService extends BaseService {

    private _options: ComponentPathServiceOptions;

    constructor(options?: ComponentPathServiceOptions) {
        super();

        this._options = Object.assign({}, __defaultOptions, options);
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const prevContent = context.content.substring(0, context.offset);

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

        if (openQuoteIndex <= 0) {
            return null;
        }

        // Check that cursor positioned in component path string

        if (prevContent.indexOf(quote, openQuoteIndex + 1) < 0
            && prevContent.lastIndexOf(quote, openQuoteIndex - 1) <= prevContent.lastIndexOf(':', openQuoteIndex - 1)
        ) {
            const partialPath = prevContent.substring(openQuoteIndex + 1);
            const baseDocumentPath = path.dirname(document.path);

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
                    result.push(...this.searchFolderItems(searchFolderPath, partialPath, false));
                }    
            } else if (!partialPath.startsWith('.')) {
                // Search in node modules folder
                if (workspace.nodeModulesPath != null) {
                    const searchFolderPath = path.resolve(workspace.nodeModulesPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

                    if (fs.existsSync(searchFolderPath)) {
                        result.push(...this.searchFolderItems(searchFolderPath, partialPath, true));
                    }
                }  
            }

            return result;
        }

        return null;
    }

    private searchFolderItems(searchFolderPath, partialPath, isFromNodeModules) {
        return fs.readdirSync(searchFolderPath)
            .map((foundPath) => {
                const basename = path.basename(foundPath);

                // Don't include hidden items
                if (basename.startsWith('.')) {
                    return null;
                }

                const partialBaseName = path.basename(partialPath);

                const itemStats = fs.lstatSync(path.resolve(searchFolderPath, foundPath));

                if (itemStats.isDirectory() || itemStats.isSymbolicLink()) {
                    return <CompletionItem>{
                        label: basename,
                        kind: CompletionItemKind.Folder,
                        detail: isFromNodeModules ? 'from node_modules' : null,
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

                if (itemStats.isFile()) {
                    const extname = path.extname(foundPath);

                    if (this.isIncludedFileName(basename)) {
                        const fileNameToInsert = this._options.includeFileExtensionToInsert
                            ? basename
                            : path.basename(basename, extname);

                        // Check that file is a Svelte component file or not?
                        if (SupportedComponentFileExtensions.indexOf(extname) >= 0) {
                            return <CompletionItem>{
                                label: basename,
                                kind: CompletionItemKind.Class,
                                detail: '[Svelte] component' + (isFromNodeModules ? ' from node_modules' : ''),
                                commitCharacters: ['\''],
                                sortText: `2.${basename}`,
                                insertText: fileNameToInsert
                            }
                        }

                        // Return a default file item statement
                        return <CompletionItem>{
                            label: basename,
                            kind: CompletionItemKind.File,
                            detail: isFromNodeModules ? 'from node_modules' : null,
                            commitCharacters: ['\''],
                            sortText: `2.${basename}`,
                            insertText: fileNameToInsert
                        }
                    }
                }

                return null;
            })
            .filter(item => item != null);
    }

    private isIncludedFileName(basename: string): boolean {
        return this._options.extensionsToSearch.some(ext => basename.endsWith(ext))
            && !this._options.extensionsToExclude.some(ext => basename.endsWith(ext));
    }
}