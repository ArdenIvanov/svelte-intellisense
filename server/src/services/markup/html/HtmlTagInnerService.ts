import { ChoosingService } from "../../ChoosingService";
import { HtmlTagBindService } from "./HtmlTagBindService";
import { HtmlTagDefaultService } from "./HtmlTagDefaultService";
import { ScopeContext, GenericScopeContext } from "../../../interfaces";
import { findLastOpenTag } from "../TagHelpers";
import { HtmlTagActionService } from "./HtmlTagActionService";
import { HtmlTagTransionService } from "./HtmlTagTransitionService";
import { HtmlTagTransionOutService } from "./HtmlTagTransitionOutService";
import { HtmlTagTransionInService } from "./HtmlTagTransitionInService";

export interface HtmlTagData {
    name: string;
    namespace: string;
}

export interface HtmlTagScopeContext extends GenericScopeContext<HtmlTagData> {}

export class HtmlTagInnerService extends ChoosingService {
    public constructor() {
        super([
            new HtmlTagBindService(),
            new HtmlTagActionService(),
            new HtmlTagTransionService(),
            new HtmlTagTransionInService(),
            new HtmlTagTransionOutService(),

            // Fallback service
            new HtmlTagDefaultService()
        ]);
    }

    protected reduceContext(context: ScopeContext): HtmlTagScopeContext {
        const openTag = findLastOpenTag(context.content, context.offset);

        if (openTag === null) {
            return null;
        }

        return {
            content: openTag.content,
            offset: context.offset - openTag.startIndex,
            data: {
                name: openTag.tagName,
                namespace: openTag.tagNamespace
            }
        };
    }
}