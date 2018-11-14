import { SvelteDocument } from "../../../SvelteDocument";
import { ICompletionService } from "../../interfaces";
import { findLastOpenTag } from "../TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition, WorkspaceContext } from "../../../interfaces";
import { SpecificComponentCompletionService } from "./SpecificComponentInnerCompletionService";

export class GenericComponentInnerCompletionService implements ICompletionService {
    private componentsCompletionCache: Map<string, ICompletionService> = new Map();

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const openTag = findLastOpenTag(document, position.offset);
        if (openTag == null) {
            return false;
        }

        const component = document.importedComponents.find(c => c.name == openTag.tagName);

        return component != null;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Array<CompletionItem> {
        const openTag = findLastOpenTag(document, position.offset);
        if (openTag == null) {
            return [];
        }

        const component = document.importedComponents.find(c => c.name === openTag.tagName);

        if (component == null) {
            return [];
        }

        const componentDocument = context.documentsCache.getOrCreateDocumentFromCache(component.filePath);

        if (componentDocument == null) {
            return [];
        }

        const componentService = this.getCompletionServiceForComponent(componentDocument);
        if (componentService == null) {
            return [];
        }

        return componentService.getCompletitionItems(document, position, context);
    }

    private getCompletionServiceForComponent(componentDocument: SvelteDocument) {
        if (!this.componentsCompletionCache.has(componentDocument.path)) {
            const service = new SpecificComponentCompletionService(componentDocument);
            this.componentsCompletionCache.set(componentDocument.path, service);
        }

        return this.componentsCompletionCache.get(componentDocument.path);
    }
}