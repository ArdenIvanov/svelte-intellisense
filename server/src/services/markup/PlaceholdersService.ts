import { SvelteDocument } from "../../SvelteDocument";
import { ScopeContext } from "../../interfaces";
import { BaseService } from "../Common";
import { CompletionItem } from "vscode-languageserver";
import { PlaceholderModifiers } from "../../svelteLanguage";
import { cloneCompletionItem } from "../Utils";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../SvelteItemsHelpers";
import { buildMethodDocumentation, buildComputedDocumentation, buildPropertyDocumentation } from "../../svelteDocUtils";
import { getIdentifierAtOffset } from "../../StringHelpers";

export class PlaceholdersService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const openIndex = this.findLastOpenPlaceholderIndex(context.content, context.offset);

        if (openIndex < 0) {
            return null;
        }

        const contentPart = document.content.substring(openIndex, context.offset);
        if (/{@[\w\d_]*$/.test(contentPart)) {
            return PlaceholderModifiers;
        }

        const result = [];

        if (document.metadata) {
            result.push(...[
                ...document.metadata.data,
                ...document.metadata.computed,
                ...document.metadata.helpers,
            ]);
        }

        if (openIndex + 1 === context.offset) {
            result.push(...PlaceholderModifiers
                .map(cloneCompletionItem)
                .map(item => {
                    item.insertText = `@${item.label}`;
                    item.filterText = `@${item.label}`;
                    return item;
                }));
        }

        return result;
    }

    public getHover(document: SvelteDocument, context: ScopeContext) {
        if (!this.isInsidePlaceholder(context.content, context.offset)) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: document.sveltedoc.helpers, handler: buildMethodDocumentation},
            {items: document.sveltedoc.computed, handler: buildComputedDocumentation},
            {items: document.sveltedoc.data, handler: buildPropertyDocumentation},
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext)
    {
        if (!this.isInsidePlaceholder(context.content, context.offset)) {
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
    
    private isInsidePlaceholder(content: string, offset: number) {
        return this.findLastOpenPlaceholderIndex(content, offset) >= 0;
    }

    private findLastOpenPlaceholderIndex(content: string, offset: number): number {
        const openIndex = content.lastIndexOf('{', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = content.indexOf('}', openIndex);
        if (endIndex > 0 && endIndex < offset) {
            return -1;
        }

        return openIndex;
    }
}