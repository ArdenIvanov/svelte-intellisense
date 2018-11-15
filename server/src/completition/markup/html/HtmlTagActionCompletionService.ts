import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../../interfaces";
import { ICompletionService } from "../../interfaces";
import { findLastDirectiveIndex, findLastOpenTag } from "../TagHelpers";

export class HtmlTagActionCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findLastDirectiveIndex(document, position.offset, 'use') >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const index = findLastDirectiveIndex(document, position.offset, 'use');
        if (index < 0) {
            return [];
        }

        const contentPart = document.content.substring(index, position.offset);
        if (/use:[\w\d_]*$/g.test(contentPart)) {
            return document.metadata.actions;
        }

        return [];        
    }
}