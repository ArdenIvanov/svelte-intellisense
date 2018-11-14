import { ICompletionService, WorkspaceContext } from './interfaces';
import { SvelteDocument } from '../SvelteDocument';
import { Position, CompletionItem } from 'vscode-languageserver';

/**
 * Implements a composite completition services, that checks all inner services
 *  and find first applyable for current context.
 */
export class ChoosingCompletionService implements ICompletionService {
    private _innerServices: Array<ICompletionService>;

    public constructor(innerServices: Array<ICompletionService>) {
        this._innerServices = innerServices;
    }

    public isApplyable(document: SvelteDocument, position: Position): boolean {
        return this.findCompletitionService(document, position) != null;
    }

    public getCompletitionItems(document: SvelteDocument, position: Position, context: WorkspaceContext): Array<CompletionItem> {
        const service = this.findCompletitionService(document, position);

        if (service == null) {
            return [];
        }

        return service.getCompletitionItems(document, position, context);
    }

    private findCompletitionService(document: SvelteDocument, position: Position): ICompletionService {
        return this._innerServices.find(service => service.isApplyable(document, position));
    }
}