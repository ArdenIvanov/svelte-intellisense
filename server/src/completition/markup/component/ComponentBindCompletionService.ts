import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../../interfaces";
import { findLastDirectiveIndex } from "./ComponentHelpers";

export class ComponentBindCompletionService extends BaseComponentCompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findLastDirectiveIndex(document, position.offset, 'bind') >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const index = findLastDirectiveIndex(document, position.offset, 'bind');
        if (index < 0) {
            return [];
        }

        const contentPart = document.content.substring(index, position.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return this.componentDocument.metadata.public_data;
        }

        return [];
    }
}