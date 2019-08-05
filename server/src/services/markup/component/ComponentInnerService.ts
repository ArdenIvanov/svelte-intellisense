import { SvelteDocument } from "../../../SvelteDocument";
import { WorkspaceContext, GenericScopeContext } from "../../../interfaces";
import { ComponentEventService } from "./ComponentEventService";
import { ComponentDataService } from "./ComponentDataService";
import { ComponentBindService } from "./ComponentBindService";
import { ComponentDefaultService } from "./ComponentDefaultService";
import { CompositeCompletionService } from "../../CompositeService";
import { ExpressionService } from "../ExpressionService";
import { ChoosingService } from "../../ChoosingService";
import { TagData, TagScopeContext } from "../TagInnerService";
import { findImportedComponent } from "../TagHelpers";
import { BindTargetPropertyService } from "../BindTargetPropertyService";
import { ComponentDataAssignService } from "./ComponentDataAssignService";

export interface ComponentTagData extends TagData {
    component: SvelteDocument;
}

export interface ComponentScopeContext extends GenericScopeContext<ComponentTagData> {}

export class ComponentInnerService extends ChoosingService {
    public constructor() {
        super([
            new ExpressionService(),
            new ComponentEventService(),
            new ComponentBindService(),
            new BindTargetPropertyService(),
            new ComponentDataAssignService(),

            // Fallback
            new CompositeCompletionService([
                new ComponentDataService(),
                new ComponentDefaultService()
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