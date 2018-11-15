import { CompletionItem } from "vscode-languageserver";
import { ICompletionService } from "../../interfaces";
import { DocumentPosition } from "../../../interfaces";
import { SvelteDocument } from "../../../SvelteDocument";
import { DefaultComponentMethods } from "../../../svelteLanguage";

export class ExpressionCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findLastOpenExpressionIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument): Array<CompletionItem> {
        const result = [
            ...document.metadata.data,
            ...document.metadata.computed,
            ...document.metadata.methods,
            ...document.metadata.helpers,
            ...DefaultComponentMethods
        ];

        return result;
    }

    private findLastOpenExpressionIndex(document: SvelteDocument, offset: number): number {
        const openIndex = document.content.lastIndexOf('"', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = document.content.indexOf('"', openIndex);
        if (endIndex > 0 && endIndex < offset) {
            return -1;
        }

        const spaceIndex = document.content.lastIndexOf(' ', openIndex);
        if (spaceIndex < 0) {
            return -1;
        }

        if (document.content.startsWith('on:', spaceIndex + 1)) {
            return openIndex + 1;
        }

        return -1;
    }
}