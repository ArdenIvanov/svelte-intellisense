import { ICompletionService } from "../../interfaces";
import { DefaultRefCompletionItem, DefaultBindCompletionItem, DefaultClassCompletionItem, getHtmlTagDefaultBindCompletionItems } from "../../../svelteLanguage";
import { CompletionItem } from "vscode-languageserver";
import { SvelteDocument } from "../../../SvelteDocument";
import { DocumentPosition } from "../../../interfaces";
import { findLastOpenTag } from "../TagHelpers";

export class HtmlTagDefaultCompletionService implements ICompletionService {
    public isApplyable() {
        return true;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition) {
        const result = [
            DefaultBindCompletionItem,
            DefaultClassCompletionItem,
            DefaultRefCompletionItem
        ];

        const openTag = findLastOpenTag(document, position.offset);

        result.push(...getHtmlTagDefaultBindCompletionItems(openTag.tagName)
            .map(this.cloneItem)
            .map(item => {
                item.filterText = `bind:${item.label}`;
                item.sortText = `bind:${item.label}`;
                item.insertText = `bind:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        return result;
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