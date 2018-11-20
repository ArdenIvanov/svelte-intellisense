import { BaseService } from "../../Common";
import { DefaultRefCompletionItem, DefaultBindCompletionItem, DefaultClassCompletionItem, getHtmlTagDefaultBindCompletionItems, DefaultActionCompletionItem } from "../../../svelteLanguage";
import { CompletionItem } from "vscode-languageserver";
import { SvelteDocument } from "../../../SvelteDocument";
import { HtmlTagScopeContext } from "./HtmlTagInnerService";
import { cloneCompletionItem } from "../../Utils";

export class HtmlTagDefaultService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: HtmlTagScopeContext) {
        const result = [
            DefaultBindCompletionItem,
            DefaultClassCompletionItem,
            DefaultActionCompletionItem,
            DefaultRefCompletionItem
        ];

        result.push(...document.metadata.actions
            .map(cloneCompletionItem)
            .map(item => {
                item.filterText = `use:${item.label}`;
                item.sortText = `use:${item.label}`;
                item.insertText = `use:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...getHtmlTagDefaultBindCompletionItems(context.data.name)
            .map(cloneCompletionItem)
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
}