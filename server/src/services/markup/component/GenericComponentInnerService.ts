import { SvelteDocument } from "../../../SvelteDocument";
import { IService, BaseService } from "../../Common";
import { findLastOpenTag } from "../TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { WorkspaceContext, ScopeContext, GenericScopeContext } from "../../../interfaces";
import { SpecificComponentInnerService } from "./SpecificComponentInnerService";

export interface ComponentScopeContext extends GenericScopeContext<SvelteDocument> {}

// TODO Change to ChoosingService and remove SpecificComponentService
export class GenericComponentInnerService extends BaseService {
    private componentsCompletionCache: Map<string, IService> = new Map();

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const reducedScope = this.reduceScope(document, context, workspace);
        if (reducedScope === null) {
            return null;
        }

        const componentService = this.getServiceForComponent(reducedScope.data);
        if (componentService == null) {
            return null;
        }

        return componentService.getCompletitionItems(document, reducedScope, workspace);
    }

    private reduceScope(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): ComponentScopeContext {
        const openTag = findLastOpenTag(context.content, context.offset);
        if (openTag == null) {
            return null;
        }

        const component = document.importedComponents.find(c => c.name === openTag.tagName);

        if (component === undefined) {
            return null;
        }

        const componentDocument = workspace.documentsCache.get(component.filePath);
        if (componentDocument === null) {
            return null;
        }

        return {
            content: openTag.content,
            offset: context.offset - openTag.startIndex,
            data: componentDocument
        };
    }

    private getServiceForComponent(componentDocument: SvelteDocument) {
        if (!this.componentsCompletionCache.has(componentDocument.path)) {
            const service = new SpecificComponentInnerService(componentDocument);
            this.componentsCompletionCache.set(componentDocument.path, service);
        }

        return this.componentsCompletionCache.get(componentDocument.path);
    }
}