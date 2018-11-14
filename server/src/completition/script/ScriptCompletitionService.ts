import { CompositeCompletitionService } from "../CompositeCompletitionService";
import { SvelteDocument } from "../../SvelteDocument";
import { Position } from "vscode-languageserver";
import { ComponentPathCompletitionService } from "./ComponentPathCompletitionService";

export class ScriptCompletitionService extends CompositeCompletitionService {
    public constructor() {
        super([
            new ComponentPathCompletitionService()
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