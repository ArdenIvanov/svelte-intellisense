import { BaseService } from "../../Common";
import { DefaultRefCompletionItem, DefaultBindCompletionItem, DefaultClassCompletionItem, getHtmlTagDefaultBindCompletionItems, DefaultActionCompletionItem } from "../../../svelteLanguage";
import { CompletionItem } from "vscode-languageserver";
import { SvelteDocument } from "../../../SvelteDocument";
import { findLastOpenTag } from "../TagHelpers";
import { HtmlTagScopeContext } from "./HtmlTagInnerService";

export class HtmlTagDefaultService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: HtmlTagScopeContext) {
        const result = [
            DefaultBindCompletionItem,
            DefaultClassCompletionItem,
            DefaultActionCompletionItem,
            DefaultRefCompletionItem
        ];

        result.push(...document.metadata.actions
            .map(this.cloneItem)
            .map(item => {
                item.filterText = `use:${item.label}`;
                item.sortText = `use:${item.label}`;
                item.insertText = `use:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...getHtmlTagDefaultBindCompletionItems(context.data.name)
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