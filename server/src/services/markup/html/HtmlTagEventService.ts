import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { findLastDirectiveIndex } from "../TagHelpers";
import { BaseService } from "../../Common";
import { TagScopeContext } from "../TagInnerService";
import { EventModifiers } from "../../../svelteLanguage";

export class HtmlTagEventService extends BaseService {
    public getCompletitionItems(_document: SvelteDocument, context: TagScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'on');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/on:[\w\d_|]*\|[\w\d_]*$/g.test(contentPart)) {
            return EventModifiers;
        }

        return null;
    }
}