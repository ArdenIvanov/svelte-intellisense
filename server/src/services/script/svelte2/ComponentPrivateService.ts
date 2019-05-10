import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2 } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../../interfaces";
import { svelte2DefaultComponentMethods, svelte2DefaultComponentGetMethodCompletionItem, svelte2DefaultScriptRefsCompletionItem } from "../../../svelte2Language";
import { cloneCompletionItem } from "../../Utils";

export class ComponentPrivateService extends BaseService {
    public getSupportedSvelteVersions() {
        return [SVELTE_VERSION_2];
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        if (/\bthis(\s)*.(\s)*[\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            const result = [
                ...svelte2DefaultComponentMethods,
                svelte2DefaultComponentGetMethodCompletionItem,
                svelte2DefaultScriptRefsCompletionItem,
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

            return  result;
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
