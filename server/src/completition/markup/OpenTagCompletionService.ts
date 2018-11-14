import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../interfaces";

export class OpenTagCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const openIndex = findLastOpenTagIndex(document, position.offset);
        if (openIndex < 0) {
            return false;
        }

        const spaceIndex = document.content.indexOf(' ', openIndex);
        if (spaceIndex > 0 && spaceIndex < position.offset) {
            return false;
        }

        return true;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const openIndex = findLastOpenTagIndex(document, position.offset);
        if (openIndex < 0) {
            return [];
        }

        const tagContent = document.content.substring(openIndex, position.offset);
        if (/<[\w\d_]*$/g.test(tagContent)) {
            return document.metadata.components;
        }

        return [];
    }
}