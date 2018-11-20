import { BaseService, EmptyHoverContent } from "../Common";
import { ScopeContext, WorkspaceContext } from "../../interfaces";
import { Hover, MarkupKind } from "vscode-languageserver";
import { SvelteDocument } from "../../SvelteDocument";

import * as docUtils from "../../svelteDocUtils";

export class ComponentNameService extends BaseService {
    public getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover {
        const prevContent = context.content.substring(0, context.offset);
        const nextContent = context.content.substring(context.offset);
            
        const componentNameStartSearchResult = /\b([\w\d_]+)$/g.exec(prevContent);
        const componentNameEndSearchResult = /^([\w\d_]+)\s*[:,]?/g.exec(nextContent);           
            
        if (componentNameStartSearchResult !== null && componentNameEndSearchResult != null) {
            const componentName = componentNameStartSearchResult[1] + componentNameEndSearchResult[1];

            const component = document.importedComponents.find(c => c.name === componentName);

            if (component === undefined || !workspace.documentsCache.has(component.filePath)) {
                return EmptyHoverContent;
            }

            const componentDocument = workspace.documentsCache.get(component.filePath);
            if (componentDocument === null) {
                return EmptyHoverContent;
            }

            return { 
                contents: {
                    kind: MarkupKind.Markdown,
                    value: docUtils.buildDocumentation(componentDocument.sveltedoc)
                }
            };
        }
        
        return null;
    }
}