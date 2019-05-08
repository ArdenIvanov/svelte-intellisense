import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { cloneCompletionItem } from "../Utils";
import { svelte2DefaultRefCompletionItem } from "../../svelte2Language";

export class RefsStyleService extends BaseService {
    public getCompletitionItems(document: SvelteDocument): Array<CompletionItem> {
        let result = [
            svelte2DefaultRefCompletionItem
        ];
        
        if (document.metadata) {
            result.push(
                ...document.metadata.refs
                .map(cloneCompletionItem)
                .map(item => {
                    item.filterText = `ref:${item.label}`;
                    item.sortText = `ref:${item.label}`;
                    item.insertText = `ref:${item.label}`;
                    item.detail = `[Svelte] ref:${item.label}`;
                    item.commitCharacters = [' '];
                    return item;
                })
            );
        }

        return result;
    }
}