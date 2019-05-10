import { ChoosingService } from "../../ChoosingService";
import { HtmlTagBindService } from "./HtmlTagBindService";
import { HtmlTagDefaultService } from "./HtmlTagDefaultService";
import { HtmlTagActionService } from "./HtmlTagActionService";
import { HtmlTagTransionService } from "./HtmlTagTransitionService";
import { HtmlTagTransionOutService } from "./HtmlTagTransitionOutService";
import { HtmlTagTransionInService } from "./HtmlTagTransitionInService";
import { ExpressionService } from "../ExpressionService";
import { BindTargetPropertyService } from "../BindTargetPropertyService";
import { HtmlTagAttributeAssignService } from "./HtmlTagAttributeAssignService";
import { HtmlTagEventService } from "./HtmlTagEventService";

export class HtmlTagInnerService extends ChoosingService {
    public constructor() {
        super([
            new ExpressionService(),
            new HtmlTagBindService(),
            new HtmlTagActionService(),
            new HtmlTagTransionService(),
            new HtmlTagTransionInService(),
            new HtmlTagTransionOutService(),

            new BindTargetPropertyService(),
            new HtmlTagAttributeAssignService(),
            new HtmlTagEventService(),
            
            // Fallback service
            new HtmlTagDefaultService()
        ]);
    }
}