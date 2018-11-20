import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { DefaultRefCompletionItem, DefaultEventHandlerCompletionItem, DefaultBindCompletionItem } from "../../../svelteLanguage";
import { cloneCompletionItem } from "../../Utils";
import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";

export class ComponentDefaultCompletionService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        const result = [];

        result.push(...context.data.component.metadata.public_events
            .map(cloneCompletionItem)
            .map(item => {
                item.detail = '[Svelte] Event';
                item.filterText = `on:${item.label}`;
                item.sortText = `on:${item.label}`;
                item.insertText = `on:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...context.data.component.metadata.public_data
            .map(cloneCompletionItem)
            .map(item => {
                item.kind = CompletionItemKind.Property;
                item.detail = '[Svelte] Binding';
                item.filterText = `bind:${item.label}`;
                item.sortText = `bind:${item.label}`;
                item.insertText = `bind:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...[
            DefaultBindCompletionItem,
            DefaultEventHandlerCompletionItem,
            DefaultRefCompletionItem
        ]);

        return result;
    }
}