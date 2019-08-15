import { BaseService } from "../../Common";
import { DefaultBindCompletionItem, getHtmlTagDefaultBindCompletionItems, DefaultTransitionCompletionItems, DefaultSlotCompletionItem, getVersionSpecificSelection } from "../../../svelteLanguage";
import { svelte2DefaultRefCompletionItem, svelte2DefaultClassCompletionItem, svelte2DefaultActionCompletionItem, svelte2DefaultHtmlTagBindCompletionItems } from "../../../svelte2Language";
import { svelte3DefaultClassCompletionItem, svelte3DefaultActionCompletionItem, svelte3DefaultHtmlTagBindCompletionItems, svelte3DefaultSlotPropertyCompletionItem } from "../../../svelte3Language";
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../../../SvelteDocument";
import { TagScopeContext } from "../TagInnerService";
import { cloneCompletionItem } from "../../Utils";
import { findNearestOpenComponent, getNamedSlotName } from "../TagHelpers";
import { WorkspaceContext } from "../../../interfaces";

export class HtmlTagDefaultService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext) {
        const classVersionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2DefaultClassCompletionItem },
            { version: SVELTE_VERSION_3, specific: svelte3DefaultClassCompletionItem }
        ];
        const actionVersionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2DefaultActionCompletionItem },
            { version: SVELTE_VERSION_3, specific: svelte3DefaultActionCompletionItem }
        ];
        const htmlTagVersionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2DefaultHtmlTagBindCompletionItems },
            { version: SVELTE_VERSION_3, specific: svelte3DefaultHtmlTagBindCompletionItems }
        ];

        const result = [
            DefaultBindCompletionItem,
            getVersionSpecificSelection(document, classVersionsSpecific),
            getVersionSpecificSelection(document, actionVersionsSpecific),
            ...DefaultTransitionCompletionItems
        ];

        if (document.svelteVersion() === SVELTE_VERSION_2) {
            result.push(svelte2DefaultRefCompletionItem);
        }

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

        result.push(...getHtmlTagDefaultBindCompletionItems(context.data.name, getVersionSpecificSelection(document, htmlTagVersionsSpecific))
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

            const slotName = getNamedSlotName(context.content);
            if (slotName) {
                const namedSlotMetadata = nearestComponent.metadata.slotsMetadata.find(s => s.name === slotName);
                if (namedSlotMetadata) {
                    result.push(
                        svelte3DefaultSlotPropertyCompletionItem,
                        ...namedSlotMetadata.parameters
                            .map(cloneCompletionItem)
                            .map(item => {
                                item.detail = `[Svelte] Prop of slot ${namedSlotMetadata.name} for ${nearestComponent.sveltedoc.name}`;
                                item.filterText = `let:${item.label}`;
                                item.sortText = `let:"${item.label}`;
                                item.insertText = `let:${item.label}`;
                                return item;
                            })
                    );
                }
            }
        }

        return result;
    }
}