import { CompletionItem } from "vscode-languageserver";
import { BaseService } from "../Common";
import { ScopeContext } from "../../interfaces";
import { SvelteDocument, SVELTE_VERSION_2 } from "../../SvelteDocument";
import { svelte2DefaultComponentMethods } from "../../svelte2Language";
import { findItemInSvelteDoc, findLocationForItemInSvelteDoc } from "../../SvelteItemsHelpers";
import { buildPropertyDocumentation, buildComputedDocumentation, buildMethodDocumentation } from "../../svelteDocUtils";
import { getIdentifierAtOffset } from "../../StringHelpers";

export class ExpressionService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const index = this.findLastOpenExpressionIndex(context.content, context.offset);
        if (index < 0) {
            return null;
        }

        const result = [];

        if (document.svelteVersion() === SVELTE_VERSION_2) {
            result.push(...svelte2DefaultComponentMethods);
        }

        if (document.metadata) {
            result.push(...[
                ...document.metadata.data,
                ...document.metadata.computed,
                ...document.metadata.methods,
                ...document.metadata.helpers
            ]);
        }


        return result;
    }

    public getHover(document: SvelteDocument, context: ScopeContext) {
        if (!this.isInsideExpression(context.content, context.offset)) {
            return null;
        }

        return findItemInSvelteDoc([
            {items: document.sveltedoc.helpers, handler: buildMethodDocumentation},
            {items: document.sveltedoc.computed, handler: buildComputedDocumentation},
            {items: document.sveltedoc.data, handler: buildPropertyDocumentation},
            {items: document.sveltedoc.methods, handler: buildMethodDocumentation},
        ], getIdentifierAtOffset(context.content, context.offset));
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext)
    {
        if (!this.isInsideExpression(context.content, context.offset)) {
            return null;
        }

        return findLocationForItemInSvelteDoc(
            document,
            [
                ...document.sveltedoc.helpers,
                ...document.sveltedoc.computed,
                ...document.sveltedoc.data,
                ...document.sveltedoc.methods
            ], 
            getIdentifierAtOffset(context.content, context.offset));
    }

    private isInsideExpression(content: string, offset: number) {
        return this.findLastOpenExpressionIndex(content, offset) >= 0;
    }

    private findLastOpenExpressionIndex(content: string, offset: number): number {
        const openIndex = content.lastIndexOf('"', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = content.indexOf('"', openIndex + 1);
        if (endIndex > 0 && endIndex < offset) {
            return -1;
        }

        const spaceIndex = content.lastIndexOf(' ', openIndex);
        if (spaceIndex < 0) {
            return -1;
        }

        if (content.startsWith('on:', spaceIndex + 1)) {
            return openIndex + 1;
        }

        return -1;
    }
}