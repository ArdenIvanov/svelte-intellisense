import { BaseService } from "../Common";
import { SvelteDocument } from "../../SvelteDocument";
import { findLastOpenTagIndex } from "./TagHelpers";
import { CompletionItem, Hover, MarkupContent, Definition } from "vscode-languageserver";
import { ScopeContext, WorkspaceContext } from "../../interfaces";
import { SpecialComponentNamespace } from "../../svelteLanguage";
import { svelte2SpecialComponents } from "../../svelte2Language";
import { cloneCompletionItem, getImportedComponentDocumentation, getImportedComponentDefinition } from "../Utils";
import { regexIndexOf } from "../../StringHelpers";

export class OpenTagService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const openIndex = findLastOpenTagIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        const spaceIndex = regexIndexOf(context.content, /\s/, openIndex);
        if (spaceIndex > 0 && spaceIndex < context.offset) {
            return null;
        }

        const tagContent = context.content.substring(openIndex, context.offset);

        const match = /<([\w\d_]+:)?[\w\d_]*$/g.exec(tagContent);

        if (match) {
            if (!document.metadata || match[1] === `${SpecialComponentNamespace}:`) {
                return [
                    ...svelte2SpecialComponents
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
                    ...svelte2SpecialComponents
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
        return getImportedComponentDocumentation(this.getTagContent(context), document, workspace);
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Definition {
        return getImportedComponentDefinition(this.getTagContent(context), document, workspace);
    }

    private getTagContent(context: ScopeContext) {
        const openIndex = findLastOpenTagIndex(context.content, context.offset);
        if (openIndex < 0) {
            return null;
        }

        const spaceIndex = regexIndexOf(context.content, /\s/, openIndex);
        if (spaceIndex > 0 && spaceIndex < context.offset) {
            return null;
        }

        return context.content.substring(openIndex + 1, spaceIndex);
    }
}