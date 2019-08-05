import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { BaseService } from "../../Common";
import { findLastDirectiveIndex } from "../TagHelpers";
import { getHtmlTagDefaultBindCompletionItems, getVersionSpecificSelection } from "../../../svelteLanguage";
import { svelte2DefaultHtmlTagBindCompletionItems } from "../../../svelte2Language";
import { svelte3DefaultHtmlTagBindCompletionItems } from "../../../svelte3Language";
import { TagScopeContext } from "../TagInnerService";

export class HtmlTagBindService extends BaseService {
    
    public getCompletitionItems(document: SvelteDocument, context: TagScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'bind');
        if (index < 0) {
            return null;
        }

        const versionsSpecific = [
            { version: SVELTE_VERSION_2, specific: svelte2DefaultHtmlTagBindCompletionItems },
            { version: SVELTE_VERSION_3, specific: svelte3DefaultHtmlTagBindCompletionItems}
        ];
        
        const contentPart = context.content.substring(index, context.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return getHtmlTagDefaultBindCompletionItems(context.data.name, getVersionSpecificSelection(document, versionsSpecific));
        }

        return null;        
    }
}