import { CompletionItem, Position } from 'vscode-languageserver';
import { SvelteDocument } from '../SvelteDocument';

/**
 * Provide methods to implementing a completions HFSM.
 */
export interface ICompletionService {
    /**
     * Check that this service is applyable for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     */
    isApplyable(document: SvelteDocument, position: DocumentPosition): boolean;

    /**
     * Returns all applyable completition items for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     * @param context The workspace context data.
     */
    getCompletitionItems(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Array<CompletionItem>;
}

export interface DocumentPosition extends Position {
    /**
     * Index of cursor offset in document.
     * Handful to use with `String.substr` like methods.
     */
    offset: number;
}

export interface WorkspaceContext {
    nodeModulesPath: string|null;
}