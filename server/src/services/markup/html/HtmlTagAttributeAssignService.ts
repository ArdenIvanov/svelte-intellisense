import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { TagScopeContext } from "../TagInnerService";

export class HtmlTagAttributeAssignService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext) {
        const contentPart = context.content.substring(0, context.offset);

        const match = /\s+(([\w\d_]+)=)?(['"]?\{[^}]*|'[^']*|"[^"]*)$/.exec(contentPart);
        if (match) {
            // When source name are provided we can use 
            //  any valid evaluatable expression with using helpers, data and computed properties
            if (match[1]) {
                const sourcePropertyName = match[2];

                if (match[3].startsWith('"{') || match[3].startsWith('\'{') || match[3].startsWith('{')) {
                    return document.metadata ? [
                        ...document.metadata.helpers,
                        ...document.metadata.data,
                        ...document.metadata.computed
                    ] : [];
                }
            }
        }

        return null;
    }
}