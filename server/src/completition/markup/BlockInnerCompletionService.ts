import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { Position, CompletionItem } from "vscode-languageserver";
import { markupBlockInnerCompletitionItems } from "../../svelteLanguage";
import { findNearestNotClosedBlock, findLastInnerBlockIndex } from "./BlockHelpers";

export class BlockInnerCompletionService implements ICompletionService {

    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const offset = document.offsetAt(position);
        return findNearestNotClosedBlock(document, offset) !== null
            && findLastInnerBlockIndex(document, offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: Position): Array<CompletionItem> {
        const offset = document.offsetAt(position);
        const nearestBlock = findNearestNotClosedBlock(document, offset);
        if (nearestBlock == null) {
            return [];
        }

        if (!markupBlockInnerCompletitionItems.hasOwnProperty(nearestBlock.blockName)) {
            return [];
        };

        const openIndex = findLastInnerBlockIndex(document, offset);
        const contentPart = document.content.substring(openIndex, offset);
        if (/{:[\w\d_]*$/g.test(contentPart)) {
            return markupBlockInnerCompletitionItems[nearestBlock.blockName];
        }

        return [];
    }
}