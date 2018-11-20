import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { ScopeContext } from "../../interfaces";
import { SpecialComponents, SpecialComponentNamespace } from "../../svelteLanguage";

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
                        .map(this.cloneItem)
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

    private cloneItem(item: CompletionItem): CompletionItem {
        return <CompletionItem>{
            additionalTextEdits: item.additionalTextEdits,
            command: item.command,
            commitCharacters: item.commitCharacters,
            data: item.data,
            deprecated: item.deprecated,
            detail: item.detail,
            documentation: item.documentation,
            filterText: item.filterText,
            insertText: item.insertText,
            insertTextFormat: item.insertTextFormat,
            kind: item.kind,
            label: item.label,
            preselect: item.preselect,
            sortText: item.sortText,
            textEdit: item.textEdit
        };
    }
}