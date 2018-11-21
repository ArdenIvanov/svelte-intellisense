import { SvelteDocument } from "../../../SvelteDocument";
import { WorkspaceContext, GenericScopeContext } from "../../../interfaces";
import { ComponentEventCompletionService } from "./ComponentEventCompletionService";
import { ComponentDataCompletionService } from "./ComponentDataCompletionService";
import { ComponentBindCompletionService } from "./ComponentBindCompletionService";
import { ComponentDefaultCompletionService } from "./ComponentDefaultCompletionService";
import { CompositeCompletionService } from "../../CompositeService";
import { ExpressionCompletionService } from "./ExpressionCompletionService";
import { ChoosingService } from "../../ChoosingService";
import { TagData, TagScopeContext } from "../TagInnerService";

export interface ComponentTagData extends TagData {
    component: SvelteDocument;
}

export interface ComponentScopeContext extends GenericScopeContext<ComponentTagData> {}

export class ComponentInnerService extends ChoosingService {
    public constructor() {
        super([
            new ExpressionCompletionService(),
            new ComponentEventCompletionService(),
            new ComponentBindCompletionService(),
            new CompositeCompletionService([
                new ComponentDataCompletionService(),
                new ComponentDefaultCompletionService()
            ])
        ]);
    }

    protected reduceContext(context: TagScopeContext, document: SvelteDocument, workspace: WorkspaceContext): ComponentScopeContext {
        const component = document.importedComponents.find(c => c.name === context.data.name);

        if (component === undefined) {
            return null;
        }

        const componentDocument = workspace.documentsCache.get(component.filePath);
        if (componentDocument === null) {
            return null;
        }

        return {
            content: context.content,
            offset: context.offset,
            data: Object.assign({}, context.data, { component: componentDocument })
        };
    }
}