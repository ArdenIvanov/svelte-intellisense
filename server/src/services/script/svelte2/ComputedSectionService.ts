import { ChoosingService } from "../../ChoosingService";
import { ScopeContext } from "../../../interfaces";
import { ComputedDependencyService } from "./ComputedDependencyService";
import { SVELTE_VERSION_2 } from "../../../SvelteDocument";

export class ComputedSectionService extends ChoosingService {
    public constructor() {
        super([
            new ComputedDependencyService()
        ]);
    }

    public getSupportedSvelteVersions() {
        return [SVELTE_VERSION_2];
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        const openBlockIndex = context.content.lastIndexOf('computed', context.offset);

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

        const match = /computed\s*:\s*\{/gi.exec(innerContent);
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