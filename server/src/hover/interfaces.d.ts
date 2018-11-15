import { CompletionItem, Position, Hover } from 'vscode-languageserver';
import { SvelteDocument } from '../SvelteDocument';
import { DocumentPosition, WorkspaceContext } from '../interfaces';

/**
 * Provide methods to implementing a hover HFSM.
 */
export interface IHoverService {
    /**
     * Check that this service is applyable for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     */
    isApplyable(document: SvelteDocument, position: DocumentPosition): boolean;

    /**
     * Returns hover details for required context.
     * @param document The svelte document.
     * @param position The current cursor position in specified document.
     * @param context The workspace context data.
     */
    getHover(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Hover;
}