import { CompletionItem, MarkupKind, Location, Range } from "vscode-languageserver";
import { SvelteDocument } from "../SvelteDocument";
import { WorkspaceContext } from "../interfaces";
import { EmptyHoverContent } from "./Common";
import * as docUtils from "../svelteDocUtils";
import { pathToFileUri } from "../utils";

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

export function getImportedComponentDocumentation(componentName: string, document: SvelteDocument, workspace: WorkspaceContext) {
    if (componentName === null) {
        return null;
    }

    const componentDocument = findImportedComponent(componentName, document, workspace);
    
    if (componentDocument === null) {
        return EmptyHoverContent;
    }

    return { 
        contents: {
            kind: MarkupKind.Markdown,
            value: docUtils.buildDocumentation(componentDocument.sveltedoc)
        }
    };
}

export function getImportedComponentDefinition(componentName: string, document: SvelteDocument, workspace: WorkspaceContext) {
    const componentDocument = findImportedComponent(componentName, document, workspace);
    
    if (componentDocument === null) {
        return null;
    }

    return Location.create(pathToFileUri(componentDocument.path), Range.create(0, 0, 0, 0));
}

function findImportedComponent(componentName: string, document: SvelteDocument, workspace: WorkspaceContext) {
    if (componentName === null) {
        return null;
    }

    const component = document.importedComponents.find(c => c.name === componentName);
    if (component === undefined || !workspace.documentsCache.has(component.filePath)) {
        return null;
    }
    return workspace.documentsCache.get(component.filePath);
}