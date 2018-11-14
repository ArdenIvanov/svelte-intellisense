import { SvelteDocument } from "../../SvelteDocument";
import { DocumentPosition } from "../../interfaces";
import { ICompletionService } from "../interfaces";
import { CompletionItem } from "vscode-languageserver";

export class PlaceholdersCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findLastOpenPlaceholderIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument): Array<CompletionItem> {
        const result = [
            ...document.metadata.data,
            ...document.metadata.computed,
            ...document.metadata.helpers
        ];

        return result;
    }

    private findLastOpenPlaceholderIndex(document: SvelteDocument, offset: number): number {
        const openIndex = document.content.lastIndexOf('{', offset);
        if (openIndex < 0) {
            return -1;
        }

        const endIndex = document.content.indexOf('}', openIndex);
        if (endIndex > 0 && endIndex < offset) {
            return -1;
        }

        return openIndex;
    }
}