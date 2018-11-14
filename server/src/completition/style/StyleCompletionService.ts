import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { SvelteDocument } from "../../SvelteDocument";
import { Position } from "vscode-languageserver";

export class StyleCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([]);
    }

    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const positionIndex = document.offsetAt(position);
        const previousContent = document.content.substr(0, positionIndex);

        const openStyleTagIndex = previousContent.lastIndexOf("<style");
        if (openStyleTagIndex < 0) {
            return false;
        }

        const closeStyleTagIndex = previousContent.indexOf("</style>", openStyleTagIndex);
        
        return closeStyleTagIndex < 0;
    }
}