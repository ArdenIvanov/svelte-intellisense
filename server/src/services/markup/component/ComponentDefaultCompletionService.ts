import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { DefaultRefCompletionItem, DefaultEventHandlerCompletionItem, DefaultBindCompletionItem } from "../../../svelteLanguage";

export class ComponentDefaultCompletionService extends BaseComponentCompletionService {

    public getCompletitionItems() {
        const result = [];

        result.push(...this.componentDocument.metadata.public_events
            .map(this.cloneItem)
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
            .map(this.cloneItem)
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