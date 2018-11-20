import { SvelteDocument } from "../../SvelteDocument";
import { ScopeContext } from "../../interfaces";
import { BaseService } from "../Common";
import { CompletionItem } from "vscode-languageserver";
import { PlaceholderModifiers } from "../../svelteLanguage";

export class PlaceholdersService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const openIndex = this.findLastOpenPlaceholderIndex(context.content, context.offset);

        if (openIndex < 0) {
            return null;
        }

        const contentPart = document.content.substring(openIndex, context.offset);
        if (/{@[\w\d_]*$/.test(contentPart)) {
            return PlaceholderModifiers;
        }

        const result = [
            ...document.metadata.data,
            ...document.metadata.computed,
            ...document.metadata.helpers,
        ];

        if (openIndex + 1 === context.offset) {
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

    private findLastOpenPlaceholderIndex(content: string, offset: number): number {
        const openIndex = content.lastIndexOf('{', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = content.indexOf('}', openIndex);
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