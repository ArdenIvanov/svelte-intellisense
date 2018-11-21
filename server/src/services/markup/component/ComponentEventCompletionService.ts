import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { findLastDirectiveIndex } from "../TagHelpers";
import { BaseService } from "../../Common";
import { ComponentScopeContext } from "./ComponentInnerService";

export class ComponentEventCompletionService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'on');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/on:[\w\d_]*$/g.test(contentPart)) {
            return context.data.component.metadata.public_events;
        }

        return null;
    }
}