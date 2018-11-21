import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { BaseService } from "../../Common";
import { findLastDirectiveIndex } from "../TagHelpers";
import { TagScopeContext } from "../TagInnerService";

export class HtmlTagTransionOutService extends BaseService {
    
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'out');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/out:[\w\d_]*$/g.test(contentPart)) {
            return document.metadata.transitions;
        }

        return null;        
    }
}