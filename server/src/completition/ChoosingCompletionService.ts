import { ICompletionService } from './interfaces';
import { SvelteDocument } from '../SvelteDocument';
import { CompletionItem } from 'vscode-languageserver';
import { DocumentPosition, WorkspaceContext } from '../interfaces';

/**
 * Implements a choosing completition services, find first applyable services 
 *  and use it to getting completion items.
 */
export class ChoosingCompletionService implements ICompletionService {
    private _services: Array<ICompletionService>;

    public constructor(services: Array<ICompletionService>) {
        this._services = services;
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findCompletitionService(document, position) != null;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Array<CompletionItem> {
        const service = this.findCompletitionService(document, position);

        if (service == null) {
            return [];
        }

        return service.getCompletitionItems(document, position, context);
    }

    private findCompletitionService(document: SvelteDocument, position: DocumentPosition): ICompletionService {
        return this._services.find(service => service.isApplyable(document, position));
    }
}