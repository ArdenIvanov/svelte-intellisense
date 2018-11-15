import { SvelteDocument } from "../../SvelteDocument";
import { DocumentPosition } from "../../interfaces";
import { ICompletionService } from "../interfaces";
import { CompletionItem } from "vscode-languageserver";
import { PlaceholderModifiers } from "../../svelteLanguage";

export class PlaceholdersCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findLastOpenPlaceholderIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const openIndex = this.findLastOpenPlaceholderIndex(document, position.offset);

        if (openIndex < 0) {
            return [];
        }

        const contentPart = document.content.substring(openIndex, position.offset);
        if (/{@[\w\d_]*$/.test(contentPart)) {
            return PlaceholderModifiers;
        }

        const result = [
            ...document.metadata.data,
            ...document.metadata.computed,
            ...document.metadata.helpers,
        ];

        if (openIndex + 1 === position.offset) {
            result.push(...PlaceholderModifiers
                .map(this.cloneItem)
                .map(item => {
                    item.insertText = `@${item.label}`;
                    item.filterText = `@${item.label}`;
                    return item;
                }));
        }

        return result;
    }

    private findLastOpenPlaceholderIndex(document: SvelteDocument, offset: number): number {
        const openIndex = document.content.lastIndexOf('{', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = document.content.indexOf('}', openIndex);
        if (endIndex > 0 && endIndex < offset) {
            return -1;
        }

        return openIndex;
    }

    private cloneItem(item: CompletionItem): CompletionItem {
        return <CompletionItem>{
            additionalTextEdits: item.additionalTextEdits,
            command: item.command,
            commitCharacters: item.commitCharacters,
            data: item.data,
            deprecated: item.deprecated,
            detail: item.detail,
            documentation: item.documentation,
            filterText: item.filterText,
            insertText: item.insertText,
            insertTextFormat: item.insertTextFormat,
            kind: item.kind,
            label: item.label,
            preselect: item.preselect,
            sortText: item.sortText,
            textEdit: item.textEdit
        };
    }
}