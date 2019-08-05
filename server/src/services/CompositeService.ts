import { IService } from "./Common";
import { SvelteDocument, SVELTE_VERSION_2, SVELTE_VERSION_3 } from "../SvelteDocument";
import { WorkspaceContext, ScopeContext } from "../interfaces";
import { CompletionItem, Hover, MarkupContent, MarkedString, MarkupKind, Definition } from "vscode-languageserver";
import { isArray } from "util";

/**
 * Implements a composite completion services that find all appliable services
 *  and merge it completion items to one resulting list.
 */
export class CompositeCompletionService implements IService {
    private _services: Array<IService>;

    public constructor(services: Array<IService>) {
        this._services = services;
    }

    public getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem> {
        const reducedContext = this.reduceContext(context);
        if (reducedContext === null) {
            return null;
        }

        return this.findServiceResults(
            document,
            service => service.getCompletitionItems(document, reducedContext, workspace)
        );
    }

    public getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover {
        const reducedContext = this.reduceContext(context);
        if (reducedContext === null) {
            return null;
        }

        const results = this.findServiceResults(
            document,
            service => service.getHover(document, reducedContext, workspace)
        );
        if (results && results.length > 0) {
            let aggregatedHover = <Hover>{ contents: <MarkupContent>{ kind: MarkupKind.Markdown, value: '' } };
            results.forEach((element: Hover) => {
                (<MarkupContent>aggregatedHover.contents).value += (<MarkupContent>element.contents).value;
            });
            return aggregatedHover;
        } else {
            return null;
        }
    }

    public getDefinition(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Definition {
        const reducedContext = this.reduceContext(context);
        if (reducedContext === null) {
            return null;
        }

        return this.findServiceResults(
            document,
            service => service.getDefinition(document, reducedContext, workspace)
        );
    }

    public getSupportedSvelteVersions(): number[] {
        return [SVELTE_VERSION_2, SVELTE_VERSION_3];
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        return context;
    }

    private findServiceResults(document: SvelteDocument, callback: (service: IService) => any|null) {
        let result = null;

        this._services.forEach(service => {
            if (service.getSupportedSvelteVersions().indexOf(document.svelteVersion()) < 0) {
                return;
            }
            
            const serviceResult = callback(service);

            if (serviceResult !== null) {
                if (result === null) {
                    result = [];
                }

                if (isArray(serviceResult)) {
                    result.push(...serviceResult);
                } else {
                    result.push(serviceResult);
                }
            }
        });

        return result;
    }
}