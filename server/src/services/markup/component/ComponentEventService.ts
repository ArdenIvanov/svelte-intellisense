import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, Hover, Definition } from "vscode-languageserver";
import { findLastDirectiveIndex } from "../TagHelpers";
import { BaseService } from "../../Common";
import { ComponentScopeContext } from "./ComponentInnerService";
import { regexLastIndexOf, regexIndexOf } from "../../../StringHelpers";
import { buildPropertyDocumentation } from "../../../svelteDocUtils";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../../SvelteItemsHelpers";

export class ComponentEventService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'on');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/on:[\w\d_]*$/g.test(contentPart)) {
            return context.data.component.metadata.public_events;
        }

        return null;
    }

    public getHover(_document: SvelteDocument, context: ComponentScopeContext): Hover {
        if (!context.data.component.sveltedoc) {
            return null;
        }
        
        return findItemInSvelteDoc([
            {items: context.data.component.sveltedoc.events, handler: buildPropertyDocumentation}
        ], this.getAttributeEventNameAtOffset(context));
    }

    public getDefinition(_document: SvelteDocument, context: ComponentScopeContext): Definition {
        return findLocationForItemInSvelteDoc(
            context.data.component,
            [
                ...context.data.component.sveltedoc.events
            ], 
            this.getAttributeEventNameAtOffset(context));
    }

    private getAttributeEventNameAtOffset(context: ComponentScopeContext): string {
        const startIndex = regexLastIndexOf(context.content, /\son:/, context.offset);
        let endIndex = regexIndexOf(context.content, /[\s=]/, context.offset);
        if (endIndex < 0) {
            endIndex = context.content.length;
        }

        if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
            return null;
        }

        const name = context.content.substring(startIndex, endIndex);
        const match = /^on:([\w\d_]+)$/.exec(name);

        if (match) {
            return match[1];
        }

        return null;
    }
}