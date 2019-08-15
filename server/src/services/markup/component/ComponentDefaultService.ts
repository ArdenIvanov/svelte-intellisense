import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { DefaultBindCompletionItem, DefaultSlotCompletionItem, getVersionSpecificSelection } from "../../../svelteLanguage";
import { svelte2DefaultRefCompletionItem, svelte2DefaultEventHandlerCompletionItem } from "../../../svelte2Language";
import { svelte3DefaultEventHandlerCompletionItem, svelte3DefaultBindInstanceCompletionItem, svelte3DefaultSlotPropertyCompletionItem } from "../../../svelte3Language";
import { cloneCompletionItem } from "../../Utils";
import { BaseService } from "../../Common";
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { findNearestOpenComponent } from "../TagHelpers";
import { WorkspaceContext } from "../../../interfaces";

export class ComponentDefaultService extends BaseService {

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

        const defaultSlotMetadata = context.data.component.metadata.slotsMetadata.find(s => s.name === 'default');
        if (defaultSlotMetadata) {
            result.push(...defaultSlotMetadata.parameters
                .map(cloneCompletionItem)
                .map(item => {
                    item.kind = CompletionItemKind.Property;
                    item.detail = '[Svelte] Slot prop';
                    item.filterText = `let:${item.label}`;
                    item.sortText = `let:${item.label}`;
                    item.insertText = `let:${item.label}`;
                    item.commitCharacters = ['='];
                    return item;
                })
            );
        }

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

        const versionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2DefaultEventHandlerCompletionItem },
            { version: SVELTE_VERSION_3, specific: svelte3DefaultEventHandlerCompletionItem}
        ];

        result.push(...[
            DefaultBindCompletionItem,
            getVersionSpecificSelection(document, versionsSpecific),
        ]);

        if (document.svelteVersion() === SVELTE_VERSION_2) {
            result.push(svelte2DefaultRefCompletionItem);
        } else if (document.svelteVersion() === SVELTE_VERSION_3) {
            result.push(svelte3DefaultBindInstanceCompletionItem);
            result.push(svelte3DefaultSlotPropertyCompletionItem);
        }

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