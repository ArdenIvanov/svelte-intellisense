import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../interfaces";
import { SpecialComponents, SpecialComponentNamespace } from "../../svelteLanguage";
import { cloneCompletionItem } from "../Utils";

export class OpenTagService extends BaseService {

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const openIndex = findLastOpenTagIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        const spaceIndex = context.content.indexOf(' ', openIndex);
        if (spaceIndex > 0 && spaceIndex < context.offset) {
            return null;
        }

        const tagContent = context.content.substring(openIndex, context.offset);

        const match = /<([\w\d_]+:)?[\w\d_]*$/g.exec(tagContent);

        if (match) {
            if (match[1] === `${SpecialComponentNamespace}:`) {
                return [
                    ...SpecialComponents
                ];
            }

            if (!match[1]) {
                return [
                    ...document.metadata.components,
                    ...SpecialComponents
                        .map(cloneCompletionItem)
                        .map(item => {
                            item.filterText = `${SpecialComponentNamespace}:${item.label}`;
                            item.sortText = `${SpecialComponentNamespace}:${item.label}`;
                            item.insertText = `${SpecialComponentNamespace}:${item.label}`;

                            return item;
                        })
                ];
            }
        }

        return null;
    }
}