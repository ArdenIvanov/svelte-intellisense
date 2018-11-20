import { ChoosingService } from "../../ChoosingService";
import { HtmlTagBindService } from "./HtmlTagBindService";
import { HtmlTagDefaultService } from "./HtmlTagDefaultService";
import { HtmlTagActionService } from "./HtmlTagActionService";

export class HtmlTagInnerService extends ChoosingService {
    public constructor() {
        super([
            new HtmlTagBindService(),
            new HtmlTagActionService(),
            new HtmlTagDefaultService()
        ]);
    }
}