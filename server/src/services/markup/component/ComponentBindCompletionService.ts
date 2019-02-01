import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, Hover, Definition, MarkupKind } from "vscode-languageserver";
import { findLastDirectiveIndex } from "../TagHelpers";
import { ComponentScopeContext } from "./ComponentInnerService";
import { regexLastIndexOf, regexIndexOf } from "../../../StringHelpers";
import { buildPropertyDocumentation } from "../../../svelteDocUtils";

export class ComponentBindCompletionService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        const index = findLastDirectiveIndex(context.content, context.offset, 'bind');
        if (index < 0) {
            return null;
        }

        const contentPart = context.content.substring(index, context.offset);
        if (/bind:[\w\d_]*$/g.test(contentPart)) {
            return context.data.component.metadata.public_data;
        }

        return null;
    }

    public getHover(_document: SvelteDocument, context: ComponentScopeContext): Hover {
        const name = this.getAttributeBindNameAtOffset(context);
        if (name === null) {
            return null;
        }

        const item = context.data.component.sveltedoc.data.find(item => item.name === name);
        if (item) {
            return {
                contents: {
                    kind: MarkupKind.Markdown,
                    value: buildPropertyDocumentation(item)
                }
            };
        }

        return null;
    }

    public getDefinition(_document: SvelteDocument, context: ComponentScopeContext): Definition {
        const name = this.getAttributeBindNameAtOffset(context);
        if (name === null) {
            return null;
        }

        const externalComponent = context.data.component;

        const item = externalComponent.sveltedoc.data.find(item => item.name === name);
        if (item && item.loc) {
            return {
                uri: externalComponent.document.uri,
                range: {
                    start: externalComponent.positionAt(item.loc.start),
                    end: externalComponent.positionAt(item.loc.end)
                }
            };
        }

        return null;
    }

    private getAttributeBindNameAtOffset(context: ComponentScopeContext): string {
        const startIndex = regexLastIndexOf(context.content, /\sbind:/, context.offset);
        let endIndex = regexIndexOf(context.content, /[\s=]/, context.offset);
        if (endIndex < 0) {
            endIndex = context.content.length;
        }

        if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
            return null;
        }

        const name = context.content.substring(startIndex, endIndex);
        const match = /^bind:([\w\d_]+)$/.exec(name);

        if (match) {
            return match[1];
        }

        return null;
    }
}