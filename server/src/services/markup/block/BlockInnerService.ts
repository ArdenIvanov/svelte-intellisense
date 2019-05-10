import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { markupBlockInnerCompletitionItems, getVersionSpecificSelection } from "../../../svelteLanguage";
import { svelte2MarkupBlockInnerCompletitionItems } from "../../../svelte2Language";
import { svelte3MarkupBlockInnerCompletitionItems } from "../../../svelte3Language";
import { findNearestNotClosedBlock, findLastInnerBlockIndex } from "./BlockHelpers";
import { ScopeContext } from "../../../interfaces";

export class BlockInnerService extends BaseService {

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const versionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2MarkupBlockInnerCompletitionItems },
            { version: SVELTE_VERSION_3, specific: svelte3MarkupBlockInnerCompletitionItems}
        ];
        
        var aggregatedItems = Object.assign({}, markupBlockInnerCompletitionItems, getVersionSpecificSelection(document, versionsSpecific));
        const nearestBlock = findNearestNotClosedBlock(context.content, context.offset);
        if (nearestBlock == null) {
            return null;
        }

        const openIndex = findLastInnerBlockIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        if (!aggregatedItems.hasOwnProperty(nearestBlock.blockName)) {
            return null;
        };

        const contentPart = document.content.substring(openIndex, context.offset);
        if (/{:[\w\d_]*$/g.test(contentPart)) {
            return aggregatedItems[nearestBlock.blockName];
        }

        return null;
    }
}