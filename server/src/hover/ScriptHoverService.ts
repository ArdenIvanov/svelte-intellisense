import { ChoosingHoverService } from "./ChoosingHoverService";
import { SvelteDocument } from "../SvelteDocument";
import { ComponentDetailsHoverService } from "./ComponentDetailsHoverService";
import { DocumentPosition } from "../interfaces";

export class ScriptHoverService extends ChoosingHoverService {
    public constructor() {
        super([
            new ComponentDetailsHoverService()
        ]);
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const previousContent = document.content.substr(0, position.offset);

        const openScriptTagIndex = previousContent.lastIndexOf("<script");
        if (openScriptTagIndex < 0) {
            return false;
        }

        const closeScriptTagIndex = previousContent.indexOf("</script>", openScriptTagIndex);
        
        return closeScriptTagIndex < 0;
    }
}