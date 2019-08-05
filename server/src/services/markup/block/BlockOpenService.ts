import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../../../SvelteDocument";
import { CompletionItem, Definition } from "vscode-languageserver";
import { markupBlockCompletitionItems, getVersionSpecificSelection, getVersionSpecificMetadataForMarkup, getVersionSpecificDocForMarkup } from "../../../svelteLanguage";
import { svelte2MarkupBlockCompletitionItems } from "../../../svelte2Language";
import { svelte3MarkupBlockCompletitionItems } from "../../../svelte3Language";
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

        const versionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2MarkupBlockCompletitionItems },
            { version: SVELTE_VERSION_3, specific: svelte3MarkupBlockCompletitionItems}
        ];
        
        const blockContent = document.content.substring(openBlockIndex, context.offset);
        if (/^{#([\w\d_]*)$/g.test(blockContent)) {
            return [...markupBlockCompletitionItems, ...getVersionSpecificSelection(document, versionsSpecific)];
        }

        const match = /^{([#:][\w\d_]*)\s*[^}]*/g.exec(blockContent);
        if (match) {
            const blockName = match[1];
            if (blockName === '#if' || blockName === ':elseif' || blockName === '#await' || blockName === '#each') {
                return document.metadata ? [
                    ...document.metadata.data,
                    ...document.metadata.computed,
                    ...getVersionSpecificMetadataForMarkup(document)
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
            {items: getVersionSpecificDocForMarkup(document), handler: buildMethodDocumentation},
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
                ...getVersionSpecificDocForMarkup(document),
                ...document.sveltedoc.computed,
                ...document.sveltedoc.data
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }
}