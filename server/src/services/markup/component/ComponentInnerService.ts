import { SvelteDocument } from "../../../SvelteDocument";
import { WorkspaceContext, GenericScopeContext } from "../../../interfaces";
import { ComponentEventCompletionService } from "./ComponentEventCompletionService";
import { ComponentDataCompletionService } from "./ComponentDataCompletionService";
import { ComponentBindCompletionService } from "./ComponentBindCompletionService";
import { ComponentDefaultCompletionService } from "./ComponentDefaultCompletionService";
import { CompositeCompletionService } from "../../CompositeService";
import { ExpressionCompletionService } from "../ExpressionCompletionService";
import { ChoosingService } from "../../ChoosingService";
import { TagData, TagScopeContext } from "../TagInnerService";
import { findImportedComponent } from "../TagHelpers";
import { BindTargetPropertyService } from "../BindTargetPropertyService";

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
            new BindTargetPropertyService(),

            // Fallback
            new CompositeCompletionService([
                new ComponentDataCompletionService(),
                new ComponentDefaultCompletionService()
            ])
        ]);
    }

    protected reduceContext(context: TagScopeContext, document: SvelteDocument, workspace: WorkspaceContext): ComponentScopeContext {
        const component = findImportedComponent(context.data.name, document, workspace.documentsCache);
        if (component === null) {
            return null;
        }

        return {
            documentOffset: context.documentOffset,
            content: context.content,
            offset: context.offset,
            data: Object.assign({}, context.data, { component: component })
        };
    }
}