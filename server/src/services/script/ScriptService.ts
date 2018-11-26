import { ChoosingService } from "../ChoosingService";
import { ScopeContext } from "../../interfaces";
import { ComponentsSectionService } from "./ComponentsSectionService";
import { ImportStatementService } from "./ImportStatementService";
import { ComponentPrivateService } from "./ComponentPrivateService";
import { ComponentGetDataService } from "./ComponentGetDataService";
import { ComponentSetDataService } from "./ComponentSetDataService";
import { ComputedSectionService } from "./ComputedSectionService";

export class ScriptService extends ChoosingService {
    public constructor() {
        super([
            new ImportStatementService(),
            new ComponentsSectionService(),
            new ComputedSectionService(),
            new ComponentPrivateService(),
            new ComponentGetDataService(),
            new ComponentSetDataService()
        ], {
            exclusive: true
        });
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        const openTagIndex = context.content.lastIndexOf("<script", context.offset);
        if (openTagIndex < 0) {
            return null;
        }

        const closeTagIndex = context.content.indexOf("</script>", context.offset);
        if (closeTagIndex < 0) {
            return null;
        }

        const tagContentIndex = context.content.indexOf(">", openTagIndex);
        if (tagContentIndex < 0) {
            return null;
        }

        const startPositionIndex = tagContentIndex + 1;
        return {
            documentOffset: context.documentOffset,
            content: context.content.substring(startPositionIndex, closeTagIndex),
            offset: context.offset - startPositionIndex
        };
    }
}