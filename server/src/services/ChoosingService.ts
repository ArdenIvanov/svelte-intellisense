import { IService, EmptyHoverContent } from './Common';
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from '../SvelteDocument';
import { CompletionItem, Hover, Definition } from 'vscode-languageserver';
import { WorkspaceContext, ScopeContext } from '../interfaces';

export interface ChoosingServiceOptions {
    exclusive?: boolean;
}

const __defaultServiceOptions: ChoosingServiceOptions = {
    exclusive: false
};

/**
 * Implements a choosing completition services, find first applyable services 
 *  and use it to getting completion items.
 */
export class ChoosingService implements IService {
    private _services: Array<IService>;
    private _options: ChoosingServiceOptions;

    public constructor(services: Array<IService>, options?: ChoosingServiceOptions) {
        this._services = services;
        this._options = Object.assign({}, __defaultServiceOptions, options);
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const reducedContext = this.reduceContext(context, document, workspace);
        if (reducedContext === null) {
            return null;
        }

        return this.findServiceResults(
            document,
            service => service.getCompletitionItems(document, reducedContext, workspace),
            []
        );
    }

    public getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover {
        const reducedContext = this.reduceContext(context, document, workspace);
        if (reducedContext === null) {
            return null;
        }

        return this.findServiceResults(
            document,
            service => service.getHover(document, reducedContext, workspace),
            EmptyHoverContent
        );
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Definition {
        const reducedContext = this.reduceContext(context, document, workspace);
        if (reducedContext === null) {
            return null;
        }

        return this.findServiceResults(
            document,
            service => service.getDefinition(document, reducedContext, workspace),
            null
        );
    }

    public getSupportedSvelteVersions(): number[] {
        return [SVELTE_VERSION_2, SVELTE_VERSION_3];
    }

    protected reduceContext(context: ScopeContext, _document: SvelteDocument, _workspace: WorkspaceContext): ScopeContext {
        return context;
    }

    private findServiceResults(
        document: SvelteDocument,
        callback: (service: IService) => any|null,
        emptyValue: any
    ) {
        let result = null;

        this._services.some(service => {
            if (service.getSupportedSvelteVersions().indexOf(document.svelteVersion()) < 0) {
                return false;
            }
            
            const serviceResult = callback(service);
            
            if (serviceResult) {
                result = serviceResult;
                return true;
            }

            return false;
        });

        if (result === null && this._options.exclusive) {
            return emptyValue;
        }

        return result;
    }
}