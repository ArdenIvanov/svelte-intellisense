import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../interfaces";

export class ComponentGetDataService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const contentPart = context.content.substring(0, context.offset);
        if (/\b(const|var|let)\s*{\s*[\w\d_,\s]*$/g.test(contentPart)) {
            return [
                ...document.metadata.data,
                ...document.metadata.computed
            ];
        }

        if (/\bthis\s*\.\s*get\s*\(\s*\)\s*\.\s*[\w\d_]*$/g.test(contentPart)) {
            return [
                ...document.metadata.data,
                ...document.metadata.computed
            ];
        }

        return null;
    }
}
