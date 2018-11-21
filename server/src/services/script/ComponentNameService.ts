import { BaseService } from "../Common";
import { ScopeContext, WorkspaceContext } from "../../interfaces";
import { Hover } from "vscode-languageserver";
import { SvelteDocument } from "../../SvelteDocument";

import { getImportedComponentDocumentation } from "../Utils";

export class ComponentNameService extends BaseService {
    public getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover {
        const prevContent = context.content.substring(0, context.offset);
        const nextContent = context.content.substring(context.offset);
            
        const componentNameStartSearchResult = /\b([\w\d_]+)$/g.exec(prevContent);
        const componentNameEndSearchResult = /^([\w\d_]+)\s*[:,]?/g.exec(nextContent);           
            
        if (componentNameStartSearchResult !== null && componentNameEndSearchResult !== null) {
            const componentName = componentNameStartSearchResult[1] + componentNameEndSearchResult[1];
            return getImportedComponentDocumentation(componentName, document, workspace);
        }
        
        return null;
    }
}