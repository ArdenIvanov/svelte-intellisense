import { ChoosingCompletionService } from "../../ChoosingCompletionService";
import { HtmlTagBindCompletionService } from "./HtmlTagBindCompletionService";
import { HtmlTagDefaultCompletionService } from "./HtmlTagDefaultCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { DocumentPosition } from "../../../interfaces";
import { findLastOpenTag } from "../TagHelpers";

export class HtmlTagInnerCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new HtmlTagBindCompletionService(),
            new HtmlTagDefaultCompletionService()
        ]);
    }

    public isApplyable(document: SvelteDocument, position: DocumentPosition) {
        const openTag = findLastOpenTag(document, position.offset);

        return openTag != null;
    }
}