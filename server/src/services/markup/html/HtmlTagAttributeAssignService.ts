import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { TagScopeContext } from "../TagInnerService";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../../SvelteItemsHelpers";
import { getIdentifierAtOffset, isInsideAttributeAssign } from "../../../StringHelpers";
import { buildMethodDocumentation, buildComputedDocumentation, buildPropertyDocumentation } from "../../../svelteDocUtils";
import { getVersionSpecificMetadataForMarkup, getVersionSpecificDocForMarkup } from "../../../svelteLanguage";

export class HtmlTagAttributeAssignService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext) {
        const contentPart = context.content.substring(0, context.offset);

        const match = /\s+(([\w\d_:]+)=)?(['"]?\{[^}]*|'[^']*|"[^"]*)$/.exec(contentPart);
        if (match) {
            // When source name are provided we can use 
            //  any valid evaluatable expression with using helpers, data and computed properties
            if (match[1]) {
                const sourcePropertyName = match[3];

                if (sourcePropertyName.startsWith('"{') || sourcePropertyName.startsWith('\'{') || sourcePropertyName.startsWith('{')) {
                    return document.metadata ? [
                        ...getVersionSpecificMetadataForMarkup(document),
                        ...document.metadata.computed,
                        ...document.metadata.data
                    ] : [];
                }
            }
        }

        return null;
    }

    public getHover(document: SvelteDocument, context: TagScopeContext) {
        if (!isInsideAttributeAssign(context.content, context.offset)) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: getVersionSpecificDocForMarkup(document), handler: buildMethodDocumentation},
            {items: document.sveltedoc.computed, handler: buildComputedDocumentation},
            {items: document.sveltedoc.data, handler: buildPropertyDocumentation}
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinitions(document: SvelteDocument, context: TagScopeContext)
    {
        if (!isInsideAttributeAssign(context.content, context.offset)) {
            return null;
        }

        return findLocationForItemInSvelteDoc(
            document,
            [
                ...getVersionSpecificDocForMarkup(document),
                ...document.sveltedoc.computed,
                ...document.sveltedoc.data
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }
}