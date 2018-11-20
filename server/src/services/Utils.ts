import { CompletionItem } from "vscode-languageserver";

export function cloneCompletionItem(item: CompletionItem): CompletionItem {
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