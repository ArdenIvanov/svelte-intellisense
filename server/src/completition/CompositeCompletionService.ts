import { ICompletionService } from "./interfaces";
import { SvelteDocument } from "../SvelteDocument";
import { DocumentPosition, WorkspaceContext } from "../interfaces";
import { CompletionItem } from "vscode-languageserver";

/**
 * Implements a composite completion services that find all appliable services
 *  and merge it completion items to one resulting list.
 */
export class CompositeCompletionService implements ICompletionService {
    private _services: Array<ICompletionService>;

    public constructor(services: Array<ICompletionService>) {
        this._services = services;
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this._services.some(service => service.isApplyable(document, position));
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Array<CompletionItem> {
        const result = [];

        this._services.forEach(service => {
            result.push(...service.getCompletitionItems(document, position, context));
        })

        return result;
    }
}