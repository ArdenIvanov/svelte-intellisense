import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { SvelteDocument } from "../../SvelteDocument";
import { DocumentPosition } from "../../interfaces";

export class StyleCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([]);
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        const previousContent = document.content.substr(0, position.offset);

        const openStyleTagIndex = previousContent.lastIndexOf("<style");
        if (openStyleTagIndex < 0) {
            return false;
        }

        const closeStyleTagIndex = previousContent.indexOf("</style>", openStyleTagIndex);
        
        return closeStyleTagIndex < 0;
    }
}