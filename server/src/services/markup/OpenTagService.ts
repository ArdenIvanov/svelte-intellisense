import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem, Hover, MarkupContent } from "vscode-languageserver";
import { ScopeContext, WorkspaceContext } from "../../interfaces";
import { SpecialComponents, SpecialComponentNamespace } from "../../svelteLanguage";
import { cloneCompletionItem, getImportedComponentDocumentation } from "../Utils";

export class OpenTagService extends BaseService {
    private regexIndexOf(content, regex, startpos) {
        var indexOf = content.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const openIndex = findLastOpenTagIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        const spaceIndex = this.regexIndexOf(context.content, /\s/, openIndex);
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
                    ...document.metadata.components
                        .map(cloneCompletionItem)
                        .map(item => { 
                            item.documentation = <MarkupContent>getImportedComponentDocumentation(item.label, document, workspace).contents;
                            
                            return item;
                        }),
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

    public getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover {
        const openIndex = findLastOpenTagIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        const spaceIndex = this.regexIndexOf(context.content, /\s/, openIndex);
        if (spaceIndex > 0 && spaceIndex < context.offset) {
            return null;
        }

        const tagContent = context.content.substring(openIndex + 1, spaceIndex);

        return getImportedComponentDocumentation(tagContent, document, workspace);
    }
}