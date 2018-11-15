import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition } from "../../interfaces";
import { SpecialComponents, SpecialComponentNamespace } from "../../svelteLanguage";

export class OpenTagCompletionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const openIndex = findLastOpenTagIndex(document, position.offset);
        if (openIndex < 0) {
            return false;
        }

        const spaceIndex = document.content.indexOf(' ', openIndex);
        if (spaceIndex > 0 && spaceIndex < position.offset) {
            return false;
        }

        return true;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const openIndex = findLastOpenTagIndex(document, position.offset);
        if (openIndex < 0) {
            return [];
        }

        const tagContent = document.content.substring(openIndex, position.offset);

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

        return [];
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