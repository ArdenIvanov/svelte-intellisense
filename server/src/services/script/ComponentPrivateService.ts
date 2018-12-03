import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../interfaces";
import { DefaultComponentMethods, DefaultRefCompletionItem, DefaultComponentGetMethodCompletionItem, DefaultScriptRefsCompletionItem } from "../../svelteLanguage";
import { cloneCompletionItem } from "../Utils";

export class ComponentPrivateService extends BaseService {

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        if (/\bthis(\s)*.(\s)*[\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            const result = [
                ...DefaultComponentMethods,
                DefaultComponentGetMethodCompletionItem,
                DefaultScriptRefsCompletionItem,
            ];

            if (document.metadata) {
                result.push(...[
                    ...document.metadata.methods,
                    ...document.metadata.refs
                        .map(cloneCompletionItem)
                        .map(item => {
                            item.detail = `[Svelte] Reference to element/component`;
                            item.filterText = `refs.${item.label}`;
                            item.sortText = `refs.${item.label}`;
                            item.insertText = `refs.${item.label}`;
    
                            return item;
                        })
                ]);
            }

            return  [
                ...DefaultComponentMethods,
                DefaultComponentGetMethodCompletionItem,
                DefaultScriptRefsCompletionItem,
            ];
        }

        if (/\bthis(\s)*.(\s)*refs(\s)*.(\s)*[\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            return document.metadata ? [
                ...document.metadata.refs
                .map(cloneCompletionItem)
                .map(item => {
                    item.detail = `[Svelte] Reference to element/component`;
                    return item;
                })
            ] : [];
        }

        return null;
    }
}
