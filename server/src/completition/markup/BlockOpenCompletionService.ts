import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { Position, CompletionItem } from "vscode-languageserver";
import { markupBlockCompletitionItems } from "../../svelteLanguage";
import { findLastOpenBlockIndex } from "./BlockHelpers";

export class BlockOpenCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const offset = document.offsetAt(position);
        return findLastOpenBlockIndex(document, offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: Position): Array<CompletionItem> {
        const offset = document.offsetAt(position);
        const openBlockIndex = findLastOpenBlockIndex(document, offset);
        if (openBlockIndex < 0) {
            return [];
        }

        const blockContent = document.content.substring(openBlockIndex, offset);
        if (/^{#([\w\d_]*)$/g.test(blockContent)) {
            return markupBlockCompletitionItems;
        }

        return [];
    }
}