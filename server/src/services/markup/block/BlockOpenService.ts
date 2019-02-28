import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, Definition } from "vscode-languageserver";
import { markupBlockCompletitionItems } from "../../../svelteLanguage";
import { findLastOpenBlockIndex, isInsideOpenBlock } from "./BlockHelpers";
import { ScopeContext } from "../../../interfaces";
import { buildPropertyDocumentation, buildComputedDocumentation, buildMethodDocumentation } from "../../../svelteDocUtils";
import { getIdentifierAtOffset } from "../../../StringHelpers";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../../SvelteItemsHelpers";

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
                return document.metadata ? [
                    ...document.metadata.data,
                    ...document.metadata.computed,
                    ...document.metadata.helpers,
                ] : [];
            }
        }

        return null;
    }

    public getHover(document: SvelteDocument, context: ScopeContext) {
        if (!isInsideOpenBlock(context.content, context.offset)) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: document.sveltedoc.helpers, handler: buildMethodDocumentation},
            {items: document.sveltedoc.computed, handler: buildComputedDocumentation},
            {items: document.sveltedoc.data, handler: buildPropertyDocumentation}
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext): Definition
    {
        if (!isInsideOpenBlock(context.content, context.offset)) {
            return null;
        }

        return findLocationForItemInSvelteDoc(
            document,
            [
                ...document.sveltedoc.helpers,
                ...document.sveltedoc.computed,
                ...document.sveltedoc.data
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }
}