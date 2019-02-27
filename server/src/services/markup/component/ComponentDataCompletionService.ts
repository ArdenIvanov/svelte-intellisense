import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { CompletionItem, Hover, MarkupKind, Definition } from "vscode-languageserver";
import { buildPropertyDocumentation } from "../../../svelteDocUtils";
import { regexIndexOf, regexLastIndexOf } from "../../../StringHelpers";

export class ComponentDataCompletionService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        return context.data.component.metadata.public_data;
    }

    public getHover(_document: SvelteDocument, context: ComponentScopeContext): Hover {
        const name = this.getAttributeNameAtOffset(context);
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
        const name = this.getAttributeNameAtOffset(context);
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

    private getAttributeNameAtOffset(context: ComponentScopeContext): string {
        const startIndex = regexLastIndexOf(context.content, /\s/, context.offset);
        const endIndex = regexIndexOf(context.content, /[\s=]/, context.offset);
        if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
            return null;
        }

        const name = context.content.substring(startIndex, endIndex);
        const match = /^([\w\d_]+)$/.exec(name);

        if (match) {
            return match[1];
        }

        return null;
    }
}