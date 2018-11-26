import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { ScopeContext } from "../../interfaces";

export class ComputedDependencyService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext) {
        const content = context.content.substring(0, context.offset);


        if (/[{,]?\s*[\w_]+[\w\d_]*\s*\:?\s*\(\s*\{\s*[\w\d_,\s]*$/g.test(content)) {
            return document.metadata.data;
        }

        return null;
    }
}