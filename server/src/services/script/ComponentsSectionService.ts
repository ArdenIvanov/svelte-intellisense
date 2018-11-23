import { ChoosingService } from "../ChoosingService";
import { ScopeContext } from "../../interfaces";
import { ComponentPathService } from "./ComponentPathService";
import { ComponentNameService } from "./ComponentNameService";

export class ComponentsSectionService extends ChoosingService {
    public constructor() {
        super([
            new ComponentNameService(),
            new ComponentPathService()
        ]);
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        const openBlockIndex = context.content.lastIndexOf('components', context.offset);

        if (openBlockIndex < 0) {
            return null;
        }

        const closeBlockIndex = context.content.indexOf('}', openBlockIndex);

        if (closeBlockIndex > 0 && closeBlockIndex < context.offset) {
            return null;
        }

        const innerContent = closeBlockIndex < 0
            ? context.content.substring(openBlockIndex)
            : context.content.substring(openBlockIndex, closeBlockIndex);

        const match = /components\s*:\s*\{/gi.exec(innerContent);
        if (match) {
            const matchOffset = match.index + match[0].length;
            return {
                documentOffset: context.documentOffset,
                content: innerContent.substring(matchOffset),
                offset: context.offset - openBlockIndex - matchOffset,
                data: context.data
            };
        }

        return null;
    }
}