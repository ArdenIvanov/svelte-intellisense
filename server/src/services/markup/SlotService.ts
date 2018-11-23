import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { TagScopeContext } from "./TagInnerService";
import { cloneCompletionItem } from "../Utils";
import { findNearestOpenComponent } from "./TagHelpers";
import { WorkspaceContext } from "../../interfaces";

export class SlotService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        if (/\sslot(\s)*=?(\s)*[\'|\"][\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            const component = findNearestOpenComponent(context.documentOffset - context.offset - 1, document, workspace.documentsCache);
            if (component === null) {
                return null;
            }

            return [
                ...component.metadata.slots
                .map(cloneCompletionItem)
                .map(item => {
                    item.detail = `[Svelte] Slot of ${component.sveltedoc.name}`;
                    return item;
                })
            ];
        }

        return null;
    }
}