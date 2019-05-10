import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2 } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../../interfaces";

export class ComponentSetDataService extends BaseService {
    public getSupportedSvelteVersions() {
        return [SVELTE_VERSION_2];
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const indexOfLastOpenBrace = this.findNearestOpenBraceIndex(context.content, context.offset);
        if (indexOfLastOpenBrace < 0) {
            return null;
        }

        if (/\s*this\s*\.\s*set\s*\(\s*$/g.test(context.content.substring(0, indexOfLastOpenBrace))) {
            return document.metadata 
                ? document.metadata.data 
                : [];
        }

        return null;
    }

    private findNearestOpenBraceIndex(content: string, offset: number) {
        let currentPosition = offset - 1;
        let countOfUnclosedBraces = 0;
    
        while (currentPosition >= 0) {
            const currentChar = content.charAt(currentPosition);
            if (currentChar === '}') {
                countOfUnclosedBraces++;
            } else if (currentChar === '{') {
                if (countOfUnclosedBraces === 0) {
                    return currentPosition;
                } else {
                    countOfUnclosedBraces--;
                }
            }
            currentPosition--;
        }
    
        return -1;
    }
}
