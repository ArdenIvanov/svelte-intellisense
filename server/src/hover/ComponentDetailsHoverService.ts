import { IHoverService } from "./interfaces";
import { SvelteDocument } from "../SvelteDocument";
import { DocumentPosition, WorkspaceContext } from "../interfaces";
import { Hover } from "vscode-languageserver";
import * as docUtils from '../svelteDocUtils';

export class ComponentDetailsHoverService implements IHoverService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const prevContent = document.content.substring(0, position.offset);

        const openComponentsBlockIndex = prevContent.lastIndexOf('components');
        if (/components\s*:\s*\{/g.test(prevContent) && prevContent.indexOf('}', openComponentsBlockIndex) < 0) {
            const nextContent = document.content.substring(position.offset);
            
            const componentNameStartSearchResult = /[{,]+\s*([\w\d_]+)$/g.exec(prevContent);
            const componentNameEndSearchResult = /^([\w\d_]+)\s*[:,]*/g.exec(nextContent);
            
            if (componentNameStartSearchResult !== null && componentNameEndSearchResult != null) {
                const componentName = componentNameStartSearchResult[1] + componentNameEndSearchResult[1];

                const component = document.importedComponents.find(c => c.name === componentName);
                
                return component !== null;
            }
            
        }

        return false;
    }

    public getHover(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Hover {
        const prevContent = document.content.substring(0, position.offset);

        const openComponentsBlockIndex = prevContent.lastIndexOf('components');
        if (/components\s*:\s*\{/g.test(prevContent) && prevContent.indexOf('}', openComponentsBlockIndex) < 0) {
            const nextContent = document.content.substring(position.offset);
            
            const componentNameStartSearchResult = /[{,]+\s*([\w\d_]+)$/g.exec(prevContent);
            const componentNameEndSearchResult = /^([\w\d_]+)\s*[:,]*/g.exec(nextContent);
            
            if (componentNameStartSearchResult !== null && componentNameEndSearchResult != null) {
                const componentName = componentNameStartSearchResult[1] + componentNameEndSearchResult[1];

                const component = document.importedComponents.find(c => c.name === componentName);

                return { contents: docUtils.buildDocumentation(context.documentsCache.get(component.filePath).sveltedoc) } ;
            }
            
        }
        return null;
    }
}