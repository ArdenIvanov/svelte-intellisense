import { ChoosingService } from "../ChoosingService";
import { ScopeContext, GenericScopeContext } from "../../interfaces";
import { findLastOpenTag } from "./TagHelpers";
import { ComponentInnerService } from "./component/ComponentInnerService";
import { HtmlTagInnerService } from "./html/HtmlTagInnerService";
import { SlotService } from "./SlotService";

export interface TagData {
    name: string;
    namespace: string;
}

export interface TagScopeContext extends GenericScopeContext<TagData> {}

export class TagInnerService extends ChoosingService {
    public constructor() {
        super([
            new SlotService(),
            new ComponentInnerService(),
            new HtmlTagInnerService
        ]);
    }

    protected reduceContext(context: ScopeContext): TagScopeContext {
        const openTag = findLastOpenTag(context.content, context.offset);

        if (openTag === null) {
            return null;
        }

        return {
            documentOffset: context.documentOffset,
            content: openTag.content,
            offset: context.offset - openTag.startIndex,
            data: {
                name: openTag.tagName,
                namespace: openTag.tagNamespace
            }
        };
    }
}