import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { ScopeContext } from "../../interfaces";

export class BindTargetPropertyService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext) {
        const contentPart = context.content.substring(0, context.offset);
        if (/\bbind:[\w\d_]*=[\w\d_]*$/g.test(contentPart)) {
            return document.metadata.data;
        }

        return null;
    }
}