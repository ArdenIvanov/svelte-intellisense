import { ICompletionService } from "../../interfaces";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem } from "vscode-languageserver";
import { DocumentPosition, WorkspaceContext } from "../../../interfaces";

export abstract class BaseComponentCompletionService implements ICompletionService {
    protected componentDocument: SvelteDocument;

    public constructor(componentDocument: SvelteDocument) {
        this.componentDocument = componentDocument;
    }

    public abstract isApplyable(document: SvelteDocument, position: DocumentPosition): boolean;

    public abstract getCompletitionItems(document: SvelteDocument, position: DocumentPosition, context: WorkspaceContext): Array<CompletionItem>;
}