import { ICompletitionService, WorkspaceContext } from './interfaces';
import { SvelteDocument } from '../SvelteDocument';
import { Position, CompletionItem } from 'vscode-languageserver';

/**
 * Implements a composite completition services, that checks all inner services
 *  and find first applyable for current context.
 */
export class CompositeCompletitionService implements ICompletitionService {
    private _innerServices: Array<ICompletitionService>;

    public constructor(innerServices: Array<ICompletitionService>) {
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

    private findCompletitionService(document: SvelteDocument, position: Position): ICompletitionService {
        return this._innerServices.find(service => service.isApplyable(document, position));
    }
}