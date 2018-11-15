import { ICompletionService } from "../../interfaces";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { markupBlockInnerCompletitionItems } from "../../../svelteLanguage";
import { findNearestNotClosedBlock, findLastInnerBlockIndex } from "./BlockHelpers";
import { DocumentPosition } from "../../../interfaces";

export class BlockInnerCompletionService implements ICompletionService {

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findNearestNotClosedBlock(document, position.offset) !== null
            && findLastInnerBlockIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const nearestBlock = findNearestNotClosedBlock(document, position.offset);
        if (nearestBlock == null) {
            return [];
        }

        if (!markupBlockInnerCompletitionItems.hasOwnProperty(nearestBlock.blockName)) {
            return [];
        };

        const openIndex = findLastInnerBlockIndex(document, position.offset);
        const contentPart = document.content.substring(openIndex, position.offset);
        if (/{:[\w\d_]*$/g.test(contentPart)) {
            return markupBlockInnerCompletitionItems[nearestBlock.blockName];
        }

        return [];
    }
}