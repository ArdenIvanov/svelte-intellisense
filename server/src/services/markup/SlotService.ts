import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { TagScopeContext } from "./TagInnerService";
import { cloneCompletionItem } from "../Utils";
import { findNearestOpenComponent } from "./TagHelpers";
import { WorkspaceContext } from "../../interfaces";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../SvelteItemsHelpers";
import { buildPropertyDocumentation } from "../../svelteDocUtils";
import { getIdentifierAtOffset } from "../../StringHelpers";

export class SlotService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        if (/\sslot(\s)*=?(\s)*[\'|\"][\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
            if (component === null) {
                return null;
            }

            return [
                ...component.metadata.slots
                .map(cloneCompletionItem)
                .map(item => {
                    item.detail = `[Svelte] Slot of ${component.sveltedoc.name}`;
                    return item;
                })
            ];
        }

        return null;
    }

    public getHover(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext) {
        if (!this.isInsideSlot(context.content, context.offset)) {
            return null;
        }

        const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
        if (component === null) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: component.sveltedoc.slots, handler: buildPropertyDocumentation}
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinition(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext)
    {
        if (!this.isInsideSlot(context.content, context.offset)) {
            return null;
        }
        
        const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
        if (component === null) {
            return null;
        }

        return findLocationForItemInSvelteDoc(
            component,
            [
                ...component.sveltedoc.slots
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }

    private isInsideSlot(content: string, offset: number) {
        if (!/\sslot(\s)*=?(\s)*[\'|\"][\w\d_$]*$/.test(content.substring(0, offset))) {
            return false;
        }
        if (!/^[\w\d_$]*/.test(content.substring(offset))) {
            return false;
        }
        return true;
    }
}