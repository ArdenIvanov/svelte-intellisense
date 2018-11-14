import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { CompletionItem, MarkupContent, MarkupKind, CompletionItemKind } from "vscode-languageserver";

export class ComponentDefaultCompletionService extends BaseComponentCompletionService {
    public isApplyable() {
        return true;
    }

    public getCompletitionItems() {
        const result = [];

        result.push(...this.componentDocument.metadata.public_events
            .map(this.cloneItem)
            .map(item => {
                item.label = `on:${item.label}`,
                item.insertText = null;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...this.componentDocument.metadata.public_data
            .map(this.cloneItem)
            .map(item => {
                item.label = `bind:${item.label}`;
                item.insertText = null;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...[
            <CompletionItem>{
                label: 'bind:...',
                kind: CompletionItemKind.Keyword,
                detail: '[Svelte] bind:<data>={data}',
                commitCharacters: [':'],
                insertText: 'bind:',
                preselect: true,
            },
            <CompletionItem>{
                label: 'on:...',
                kind: CompletionItemKind.Keyword,
                detail: '[Svelte] on:<event>="handler"',
                commitCharacters: [':'],
                insertText: 'on:',
                preselect: true,
            },
            <CompletionItem>{
                label: 'class:...',
                kind: CompletionItemKind.Keyword,
                detail: '[Svelte] class:<css-class>="condition"',
                commitCharacters: [':'],
                insertText: 'class:',
                preselect: true,
            },
            <CompletionItem>{
                label: 'ref:...',
                kind: CompletionItemKind.Keyword,
                detail: '[Svelte] ref:<name>',
                commitCharacters: [':'],
                insertText: 'ref:',
                preselect: true,
            }
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