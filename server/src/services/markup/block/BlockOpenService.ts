import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { markupBlockCompletitionItems } from "../../../svelteLanguage";
import { findLastOpenBlockIndex } from "./BlockHelpers";
import { ScopeContext } from "../../../interfaces";

export class BlockOpenService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const openBlockIndex = findLastOpenBlockIndex(context.content, context.offset);
        if (openBlockIndex < 0) {
            return null;
        }

        const blockContent = document.content.substring(openBlockIndex, context.offset);
        if (/^{#([\w\d_]*)$/g.test(blockContent)) {
            return markupBlockCompletitionItems;
        }

        const match = /^{([#:][\w\d_]*)\s*[^}]*/g.exec(blockContent);
        if (match) {
            const blockName = match[1];
            if (blockName === '#if' || blockName === ':elseif' || blockName === '#await' || blockName === '#each') {
                return [
                    ...document.metadata.data,
                    ...document.metadata.computed,
                    ...document.metadata.helpers,
                ]
            }
        }

        return null;
    }
}