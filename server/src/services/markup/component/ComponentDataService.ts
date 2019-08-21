import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { CompletionItem, Hover, Definition } from "vscode-languageserver";
import { buildPropertyDocumentation } from "../../../svelteDocUtils";
import { regexIndexOf, regexLastIndexOf } from "../../../StringHelpers";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../../SvelteItemsHelpers";

export class ComponentDataService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        return context.data.component.metadata.public_data;
    }

    public getHover(_document: SvelteDocument, context: ComponentScopeContext): Hover {
        return findItemInSvelteDoc([
            {items: context.data.component.sveltedoc.data, handler: buildPropertyDocumentation}
        ], this.getAttributeNameAtOffset(context));
    }

    public getDefinitions(_document: SvelteDocument, context: ComponentScopeContext): Definition[] {
        return findLocationForItemInSvelteDoc(
            context.data.component,
            [
                ...context.data.component.sveltedoc.data
            ], 
            this.getAttributeNameAtOffset(context));
    }

    private getAttributeNameAtOffset(context: ComponentScopeContext): string {
        const startIndex = regexLastIndexOf(context.content, /\s/, context.offset);
        const endIndex = regexIndexOf(context.content, /[\s=]/, context.offset);
        if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
            return null;
        }

        const name = context.content.substring(startIndex, endIndex);
        const match = /^([\w\d_]+)$/.exec(name);

        if (match) {
            return match[1];
        }

        return null;
    }
}