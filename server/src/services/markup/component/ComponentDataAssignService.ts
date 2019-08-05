import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { JSDocType } from "sveltedoc-parser/typings";
import { getVersionSpecificMetadataForMarkup } from "../../../svelteLanguage";

export class ComponentDataAssignService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ComponentScopeContext) {
        const contentPart = context.content.substring(0, context.offset);

        const match = /\s+(([\w\d_]+)=)?(['"]?\{[^}]*|'[^']*|"[^"]*)$/.exec(contentPart);

        if (match) {
            // When source name are provided we can use 
            //  any valid evaluatable expression with using helpers, data and computed properties
            if (match[1]) {
                const sourcePropertyName = match[2];

                if (match[3].startsWith('"{') || match[3].startsWith('\'{') || match[3].startsWith('{')) {
                    return document.metadata ? [
                        ...getVersionSpecificMetadataForMarkup(document),
                        ...document.metadata.data,
                        ...document.metadata.computed
                    ] : [];
                }
                
                const property = context.data.component.sveltedoc.data.find(p => p.name === sourcePropertyName && p.visibility === 'public');
                if (property.hasOwnProperty(sourcePropertyName)) {

                    if (property.type.kind === 'union') {
                        const types = <JSDocType[]>property.type.type;

                        return types
                            .filter(t => t.kind === 'const')
                            .map(t => <CompletionItem> {
                                label: t.value,
                                kind: CompletionItemKind.Constant,
                                detail: property.description
                            });
                    }
                }                

                return [];
            }

            // When source property is not specified we can use only data or computed with same names
            const items = document.metadata ? [
                ...document.metadata.data,
                ...document.metadata.computed
            ] : [];

            return items.filter(item => context.data.component.metadata.public_data.some(child_item => child_item.label === item.label));
        }

        return null;
    }
}