import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { DefaultBindCompletionItem, DefaultSlotCompletionItem } from "../../../svelteLanguage";
import { svelte2DefaultRefCompletionItem, svelte2DefaultEventHandlerCompletionItem } from "../../../svelte2Language";
import { cloneCompletionItem } from "../../Utils";
import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { findNearestOpenComponent } from "../TagHelpers";
import { WorkspaceContext } from "../../../interfaces";

export class ComponentDefaultCompletionService extends BaseService {

    public getCompletitionItems(document: SvelteDocument, context: ComponentScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const result = [];

        result.push(...context.data.component.metadata.public_events
            .map(cloneCompletionItem)
            .map(item => {
                item.detail = '[Svelte] Event';
                item.filterText = `on:${item.label}`;
                item.sortText = `on:${item.label}`;
                item.insertText = `on:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...context.data.component.metadata.public_data
            .map(cloneCompletionItem)
            .map(item => {
                item.kind = CompletionItemKind.Property;
                item.detail = '[Svelte] Binding';
                item.filterText = `bind:${item.label}`;
                item.sortText = `bind:${item.label}`;
                item.insertText = `bind:${item.label}`;
                item.commitCharacters = ['='];
                return item;
            })
        );

        result.push(...[
            DefaultBindCompletionItem,
            svelte2DefaultEventHandlerCompletionItem,
            svelte2DefaultRefCompletionItem
        ]);

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