import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { TagScopeContext } from "./TagInnerService";
import { cloneCompletionItem } from "../Utils";
import { findNearestOpenComponent, findLastDirectiveIndex, getAttributeLetNameAtOffset, getNamedSlotName } from "./TagHelpers";
import { WorkspaceContext } from "../../interfaces";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../SvelteItemsHelpers";
import { buildSlotPerameterDocumentation } from "../../svelteDocUtils";

export class NamedSlotParamsService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'let');
        if (index < 0) {
            return null;
        }
        const contentPart = context.content.substring(index, context.offset);
        if (/let:[\w\d_]*$/g.test(contentPart)) {
            const slotName = getNamedSlotName(context.content);
            if (!slotName) {
                return null;
            }
            
            const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
            if (component === null) {
                return null;
            }

            const namedSlotMetadata = component.metadata.slotsMetadata.find(s => s.name === slotName);
            if (!namedSlotMetadata) {
                return null;
            }
            
            return [
                ...namedSlotMetadata.parameters
                .map(cloneCompletionItem)
                .map(item => {
                    item.detail = `[Svelte] Prop of "${slotName}" slot for ${component.sveltedoc.name}`;
                    return item;
                })
            ];
        }

        return null;
    }

    public getHover(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext) {
        const slotName = getNamedSlotName(context.content);
        if (!slotName) {
            return null;
        }
        
        const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
        if (component === null) {
            return null;
        }

        const slotDoc = this.getNamedSlotDocumentation(component, slotName);
        if (!slotDoc) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: slotDoc.parameters, handler: buildSlotPerameterDocumentation}
        ], getAttributeLetNameAtOffset(context));
    }

    public getDefinitions(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext)
    {
        const slotName = getNamedSlotName(context.content);
        if (!slotName) {
            return null;
        }
        
        const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
        if (component === null) {
            return null;
        }

        const slotDoc = this.getNamedSlotDocumentation(component, slotName);
        if (!slotDoc) {
            return null;
        }

        return findLocationForItemInSvelteDoc(component, slotDoc.parameters, getAttributeLetNameAtOffset(context));
    }

    private getNamedSlotDocumentation(component: SvelteDocument, name: string) {
        return component.sveltedoc.slots.find(s => s.name === name);
    }
}