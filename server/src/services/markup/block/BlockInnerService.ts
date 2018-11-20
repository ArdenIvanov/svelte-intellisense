import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { markupBlockInnerCompletitionItems } from "../../../svelteLanguage";
import { findNearestNotClosedBlock, findLastInnerBlockIndex } from "./BlockHelpers";
import { ScopeContext } from "../../../interfaces";

export class BlockInnerService extends BaseService {

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const nearestBlock = findNearestNotClosedBlock(context.content, context.offset);
        if (nearestBlock == null) {
            return null;
        }

        const openIndex = findLastInnerBlockIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        if (!markupBlockInnerCompletitionItems.hasOwnProperty(nearestBlock.blockName)) {
            return null;
        };

        const contentPart = document.content.substring(openIndex, context.offset);
        if (/{:[\w\d_]*$/g.test(contentPart)) {
            return markupBlockInnerCompletitionItems[nearestBlock.blockName];
        }

        return null;
    }
}