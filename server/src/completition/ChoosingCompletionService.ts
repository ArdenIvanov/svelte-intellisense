import { ICompletionService } from './interfaces';
import { SvelteDocument } from '../SvelteDocument';
import { CompletionItem } from 'vscode-languageserver';
import { DocumentPosition, WorkspaceContext } from '../interfaces';

/**
 * Implements a composite completition services, that checks all inner services
 *  and find first applyable for current context.
 */
export class ChoosingCompletionService implements ICompletionService {
    private _innerServices: Array<ICompletionService>;

    public constructor(innerServices: Array<ICompletionService>) {
        this._innerServices = innerServices;
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
        return this._innerServices.find(service => service.isApplyable(document, position));
    }
}