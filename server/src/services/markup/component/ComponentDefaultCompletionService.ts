import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { CompletionItemKind } from "vscode-languageserver";
import { DefaultRefCompletionItem, DefaultEventHandlerCompletionItem, DefaultBindCompletionItem } from "../../../svelteLanguage";
import { cloneCompletionItem } from "../../Utils";

export class ComponentDefaultCompletionService extends BaseComponentCompletionService {

    public getCompletitionItems() {
        const result = [];

        result.push(...this.componentDocument.metadata.public_events
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

        result.push(...this.componentDocument.metadata.public_data
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