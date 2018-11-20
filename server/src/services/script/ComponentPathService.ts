import * as path from 'path';
import * as fs from 'fs';

import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { WorkspaceContext, ScopeContext } from '../../interfaces';

export class ComponentPathService extends BaseService {

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

                if (itemStats.isDirectory()) {
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

                if (itemStats.isFile() && path.extname(foundPath) === '.svelte') {
                    return <CompletionItem>{
                        label: basename,
                        kind: CompletionItemKind.Class,
                        detail: isFromNodeModules ? 'from node_modules' : null,
                        commitCharacters: ['/', '\''],
                        sortText: `2.${basename}`
                    }
                }

                return null;
            })
            .filter(item => item != null);
    }
}