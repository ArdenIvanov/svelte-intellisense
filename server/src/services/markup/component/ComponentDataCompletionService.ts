import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentScopeContext } from "./ComponentInnerService";
import { CompletionItem } from "vscode-languageserver";

export class ComponentDataCompletionService extends BaseService {

    public getCompletitionItems(_document: SvelteDocument, context: ComponentScopeContext): Array<CompletionItem> {
        return context.data.component.metadata.public_data;
    }
}