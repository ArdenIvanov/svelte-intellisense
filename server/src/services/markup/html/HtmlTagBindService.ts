import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { BaseService } from "../../Common";
import { findLastDirectiveIndex } from "../TagHelpers";
import { getHtmlTagDefaultBindCompletionItems } from "../../../svelteLanguage";
import { TagScopeContext } from "../TagInnerService";

export class HtmlTagBindService extends BaseService {
    
    public getCompletitionItems(_document: SvelteDocument, context: TagScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'bind');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return getHtmlTagDefaultBindCompletionItems(context.data.name);
        }

        return null;        
    }
}