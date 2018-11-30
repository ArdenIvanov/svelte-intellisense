import { CompletionItem } from "vscode-languageserver";
import { BaseService } from "../Common";
import { ScopeContext } from "../../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { DefaultComponentMethods } from "../../svelteLanguage";

export class ExpressionCompletionService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const index = this.findLastOpenExpressionIndex(context.content, context.offset);
        if (index < 0) {
            return null;
        }

        const result = [
            ...DefaultComponentMethods
        ];

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

    private findLastOpenExpressionIndex(content: string, offset: number): number {
        const openIndex = content.lastIndexOf('"', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = content.indexOf('"', openIndex);
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