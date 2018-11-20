import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../../interfaces";
import { findLastDirectiveIndex } from "../TagHelpers";

export class ComponentBindCompletionService extends BaseComponentCompletionService {

    public getCompletitionItems(_document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'bind');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return this.componentDocument.metadata.public_data;
        }

        return null;
    }
}