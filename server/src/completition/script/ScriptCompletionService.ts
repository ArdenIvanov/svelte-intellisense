import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { SvelteDocument } from "../../SvelteDocument";
import { ComponentPathCompletionService } from "./ComponentPathCompletionService";
import { DocumentPosition } from "../interfaces";

export class ScriptCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new ComponentPathCompletionService()
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