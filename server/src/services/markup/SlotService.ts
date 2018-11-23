import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { TagScopeContext } from "./TagInnerService";
import { cloneCompletionItem } from "../Utils";
import { findNearestOpenTag } from "./TagHelpers";
import { WorkspaceContext } from "../../interfaces";

export class SlotService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        if (/\sslot(\s)*=?(\s)*[\'|\"][\w\d_]*$/g.test(context.content.substring(0, context.offset))) {
            
            const prevTag = findNearestOpenTag(document.content, context.documentOffset - context.offset - 1);
            
            if (prevTag === null) {
                return null;

            }
            const component = document.importedComponents.find(c => c.name === prevTag.tagName);

            if (component === undefined) {
                return null;
            }

            const componentDocument = workspace.documentsCache.get(component.filePath);
            if (componentDocument === null) {
                return null;
            }
            return [
                ...componentDocument.metadata.slots
                .map(cloneCompletionItem)
                .map(item => {
                    item.detail = `[Svelte] Slot of ${component.name}`;
                    return item;
                })
            ];
        }

        return null;
    }
}