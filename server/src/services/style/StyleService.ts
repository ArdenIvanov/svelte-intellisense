import { ChoosingService } from "../ChoosingService";
import { ScopeContext } from "../../interfaces";
import { RefsStyleService } from "./svelte2/RefsStyleService";

export class StyleService extends ChoosingService {
    public constructor() {
        super([
            new RefsStyleService()
        ], {
            exclusive: true
        });
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        const openTagIndex = context.content.lastIndexOf("<style", context.offset);
        if (openTagIndex < 0) {
            return null;
        }

        const closeTagIndex = context.content.indexOf("</style>", context.offset);
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