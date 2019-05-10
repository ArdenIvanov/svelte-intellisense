import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2 } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../../interfaces";

export class ComponentGetDataService extends BaseService {
    public getSupportedSvelteVersions() {
        return [SVELTE_VERSION_2];
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const contentPart = context.content.substring(0, context.offset);
        if (/\b(const|var|let)\s*{\s*[\w\d_,\s]*$/g.test(contentPart) 
            || /\bthis\s*\.\s*get\s*\(\s*\)\s*\.\s*[\w\d_]*$/g.test(contentPart)
        ) {
            return document.metadata ? [
                ...document.metadata.data,
                ...document.metadata.computed
            ] : [];
        }

        return null;
    }
}
