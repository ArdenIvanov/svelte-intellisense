import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, Hover, Definition } from "vscode-languageserver";
import { findLastDirectiveIndex, getAttributeLetNameAtOffset } from "../TagHelpers";
import { ComponentScopeContext } from "./ComponentInnerService";
import { buildSlotPerameterDocumentation } from "../../../svelteDocUtils";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../../SvelteItemsHelpers";

export class ComponentDefaultSlotParamsService extends BaseService {
    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        if (!context.data.component.metadata.slotsMetadata) {
            return null;
        }

        const defaultSlotMetadata = context.data.component.metadata.slotsMetadata.find(s => s.name === 'default');
        if (!defaultSlotMetadata) {
            return null;
        }

        const index = findLastDirectiveIndex(context.content, context.offset, 'let');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/let:[\w\d_]*$/g.test(contentPart)) {
            return defaultSlotMetadata.parameters;
        }

        return null;
    }

    public getHover(_document: SvelteDocument, context: ComponentScopeContext): Hover {
        const defaultSlotDoc = this.getDefaultSlotDocumentation(context);
        if (!defaultSlotDoc) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: defaultSlotDoc.parameters, handler: buildSlotPerameterDocumentation}
        ], getAttributeLetNameAtOffset(context));
    }

    public getDefinition(_document: SvelteDocument, context: ComponentScopeContext): Definition {
        const defaultSlotDoc = this.getDefaultSlotDocumentation(context);
        if (!defaultSlotDoc) {
            return null;
        }

        return findLocationForItemInSvelteDoc(context.data.component, defaultSlotDoc.parameters, getAttributeLetNameAtOffset(context));
    }

    private getDefaultSlotDocumentation(context: ComponentScopeContext) {
        return context.data.component.sveltedoc.slots.find(s => s.name === 'default');
    }
}