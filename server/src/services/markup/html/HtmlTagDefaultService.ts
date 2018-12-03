import { BaseService } from "../../Common";
import { DefaultRefCompletionItem, DefaultBindCompletionItem, DefaultClassCompletionItem, getHtmlTagDefaultBindCompletionItems, DefaultActionCompletionItem, DefaultTransitionCompletionItems, DefaultSlotCompletionItem } from "../../../svelteLanguage";
import { SvelteDocument } from "../../../SvelteDocument";
import { TagScopeContext } from "../TagInnerService";
import { cloneCompletionItem } from "../../Utils";
import { findNearestOpenComponent } from "../TagHelpers";
import { WorkspaceContext } from "../../../interfaces";

export class HtmlTagDefaultService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext) {
        const result = [
            DefaultBindCompletionItem,
            DefaultClassCompletionItem,
            DefaultActionCompletionItem,
            DefaultRefCompletionItem,
            ...DefaultTransitionCompletionItems
        ];

        // Document metadata can be is not parsed for this moment, we should check
        if (document.metadata) {
            result.push(...document.metadata.actions
                .map(cloneCompletionItem)
                .map(item => {
                    item.filterText = `use:${item.label}`;
                    item.sortText = `use:${item.label}`;
                    item.insertText = `use:${item.label}`;
                    item.commitCharacters = ['='];
                    return item;
                })
            );
        }

        result.push(...getHtmlTagDefaultBindCompletionItems(context.data.name)
            .map(cloneCompletionItem)
            .map(item => {
                item.filterText = `bind:${item.label}`;
                item.sortText = `bind:${item.label}`;
                item.insertText = `bind:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );
        
        const nearestComponent = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
        if (nearestComponent !== null && nearestComponent.metadata.slots.length > 0) {
            result.push(
                DefaultSlotCompletionItem,
                ...nearestComponent.metadata.slots
                    .map(cloneCompletionItem)
                    .map(item => {
                        item.detail = `[Svelte] Slot of ${nearestComponent.sveltedoc.name}`;
                        item.filterText = `slot="${item.label}"`;
                        item.sortText = `slot="${item.label}"`;
                        item.insertText = `slot="${item.label}"`;
                        return item;
                    })
            );
        }

        return result;
    }
}