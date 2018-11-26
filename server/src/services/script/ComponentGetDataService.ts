import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../interfaces";

export class ComponentGetDataService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        if (/\s*(const|var|let)\s*{\s*[\w\d_,\s]*$/g.test(context.content.substring(0, context.offset))) {
            return [
                ...document.metadata.data,
                ...document.metadata.computed
            ];
        }

        return null;
    }
}
