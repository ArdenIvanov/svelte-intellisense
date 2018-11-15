import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../../interfaces";
import { ICompletionService } from "../../interfaces";
import { findLastDirectiveIndex, findLastOpenTag } from "../TagHelpers";
import { getHtmlTagDefaultBindCompletionItems } from "../../../svelteLanguage";

export class HtmlTagBindCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findLastDirectiveIndex(document, position.offset, 'bind') >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const index = findLastDirectiveIndex(document, position.offset, 'bind');
        if (index < 0) {
            return [];
        }

        const openTag = findLastOpenTag(document, position.offset);

        const contentPart = document.content.substring(index, position.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return getHtmlTagDefaultBindCompletionItems(openTag.tagName)
        }

        return [];        
    }
}