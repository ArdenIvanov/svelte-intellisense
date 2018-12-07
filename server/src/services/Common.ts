import { CompletionItem, Hover, Definition } from 'vscode-languageserver';
import { SvelteDocument } from '../SvelteDocument';
import { WorkspaceContext, ScopeContext } from '../interfaces';

/**
 * Provide methods to implementing a completions HFSM.
 */
export interface IService {
    /**
     * Returns all applyable completition items for required context.
     * @param document The svelte document.
     * @param context The current document position context.
     * @param workspace The workspace context data.
     * @returns {CompletionItem|null} Returns null, when scope context is not correct for this service compatibility.
     */
    getCompletitionItems(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Array<CompletionItem>;

    /**
     * Returns hover details for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     * @param context The workspace context data.
     * @returns {CompletionItem|null} Returns null, when scope context is not correct for this service compatibility.
     */
    getHover(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Hover;

    /**
     * Returns definition for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     * @param context The workspace context data.
     * @returns {Definition|null} Returns null, when scope context is not correct for this service compatibility.
     */
    getDefinition(document: SvelteDocument, context: ScopeContext, workspace: WorkspaceContext): Definition;
}

export abstract class BaseService implements IService {
    public getCompletitionItems(_document: SvelteDocument, _context: ScopeContext, _workspace: WorkspaceContext): Array<CompletionItem> {
        return null;
    }

    public getHover(_document: SvelteDocument, _context: ScopeContext, _workspace: WorkspaceContext): Hover {
        return null;
    }

    public getDefinition(_document: SvelteDocument, _context: ScopeContext, _workspace: WorkspaceContext): Definition {
        return null;
    }
}

export const EmptyHoverContent: Hover = {
    contents: null
};