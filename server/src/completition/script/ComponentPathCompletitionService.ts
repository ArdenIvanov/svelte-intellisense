import * as path from 'path';
import * as fs from 'fs';

import { ICompletitionService, WorkspaceContext } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { Position, CompletionItem, CompletionItemKind } from "vscode-languageserver";

export class ComponentPathCompletitionService implements ICompletitionService {

    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const offsetIndex = document.offsetAt(position);
        const prevContent = document.content.substring(0, offsetIndex);

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
                return true;
            }
        }

        return false;
    }

    public getCompletitionItems(document: SvelteDocument, position: Position, context: WorkspaceContext): Array<CompletionItem> {
        const offsetIndex = document.offsetAt(position);
        const prevContent = document.content.substring(0, offsetIndex);

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
            if (context.nodeModulesPath != null) {
                const searchFolderPath = path.resolve(context.nodeModulesPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

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