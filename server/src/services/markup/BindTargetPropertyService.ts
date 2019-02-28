import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { ScopeContext } from "../../interfaces";
import { getIdentifierAtOffset } from "../../StringHelpers";
import { findLocationForItemInSvelteDoc, findItemInSvelteDoc } from "../../SvelteItemsHelpers";
import { buildPropertyDocumentation } from "../../svelteDocUtils";

export class BindTargetPropertyService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext) {
        const contentPart = context.content.substring(0, context.offset);
        if (/\bbind:[\w\d_]*=[\'\"]?[\w\d_]*$/g.test(contentPart)) {
            return document.metadata 
                ? document.metadata.data 
                : [];
        }

        return null;
    }

    public getHover(document: SvelteDocument, context: ScopeContext) {
        if (!this.isInsideBindTarget(context.content, context.offset)) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: document.sveltedoc.data, handler: buildPropertyDocumentation}
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext)
    {
        if (!this.isInsideBindTarget(context.content, context.offset)) {
            return null;
        }

        return findLocationForItemInSvelteDoc(
            document,
            [
                ...document.sveltedoc.data
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }

    isInsideBindTarget(content: string, offset: number) {
        if (!/\bbind:[\w\d_]*=[\'\"]?[\w\d_$]*$/.test(content.substring(0, offset))) {
            return false;
        }
        if (!/^[\w\d_$]*/.test(content.substring(offset))) {
            return false;
        }
        return true;
    }
}