import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { markupBlockCompletitionItems } from "../../svelteLanguage";
import { findLastOpenBlockIndex } from "./BlockHelpers";
import { DocumentPosition } from "../../interfaces";

export class BlockOpenCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findLastOpenBlockIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const openBlockIndex = findLastOpenBlockIndex(document, position.offset);
        if (openBlockIndex < 0) {
            return [];
        }

        const blockContent = document.content.substring(openBlockIndex, position.offset);
        if (/^{#([\w\d_]*)$/g.test(blockContent)) {
            return markupBlockCompletitionItems;
        }

        return [];
    }
}