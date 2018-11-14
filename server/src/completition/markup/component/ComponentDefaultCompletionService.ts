import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { CompletionItem } from "vscode-languageserver";

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