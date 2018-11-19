import { IHoverService } from './interfaces';
import { SvelteDocument } from '../SvelteDocument';
import { Hover } from 'vscode-languageserver';
import { DocumentPosition, WorkspaceContext } from '../interfaces';

/**
 * Implements a choosing hover services, find first applyable services 
 *  and use it to getting hover.
 */
export class ChoosingHoverService implements IHoverService {
    private _services: Array<IHoverService>;

    public constructor(services: Array<IHoverService>) {
        this._services = services;
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return this.findHoverService(document, position) != null;
    }

    public getHover(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Hover {
        const service = this.findHoverService(document, position);

        if (service == null) {
            return null;
        }

        return service.getHover(document, position, context);
    }

    private findHoverService(document: SvelteDocument, position: DocumentPosition): IHoverService {
        return this._services.find(service => service.isApplyable(document, position));
    }
}