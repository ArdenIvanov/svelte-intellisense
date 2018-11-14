import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { SvelteDocument } from "../../SvelteDocument";
import { Position } from "vscode-languageserver";
import { ComponentPathCompletionService } from "./ComponentPathCompletionService";

export class ScriptCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new ComponentPathCompletionService()
        ]);
    }

    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const positionIndex = document.offsetAt(position);
        const previousContent = document.content.substr(0, positionIndex);

        const openScriptTagIndex = previousContent.lastIndexOf("<script");
        if (openScriptTagIndex < 0) {
            return false;
        }

        const closeScriptTagIndex = previousContent.indexOf("</script>", openScriptTagIndex);
        
        return closeScriptTagIndex < 0;
    }
}