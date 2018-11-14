import { BaseComponentCompletionService } from "./BaseComponentCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../../interfaces";

export class ComponentEventCompletionService extends BaseComponentCompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findLastEventIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const index = this.findLastEventIndex(document, position.offset);
        if (index < 0) {
            return [];
        }

        const contentPart = document.content.substring(index, position.offset);
        if (/on:[\w\d_]*$/g.test(contentPart)) {
            return this.componentDocument.metadata.public_events;
        }

        return [];
    }

    private findLastEventIndex(document: SvelteDocument, offset: number) {
        const index = document.content.lastIndexOf('on:', offset);
        if (index < 0) {
            return -1;
        }

        const equalIndex = document.content.indexOf('=', index);
        if (equalIndex > 0 && equalIndex < offset) {
            return -1;
        }

        const spaceIndex = document.content.indexOf(' ', index);
        if (spaceIndex > 0 && spaceIndex < offset) {
            return -1;
        }

        return index;
    }
}