import { ChoosingHoverService } from "./ChoosingHoverService";
import { ScriptHoverService } from "./scriptHoverService";
//import { MarkupHoverService } from "./MarkupHoverService";

export class DocumentHoverService extends ChoosingHoverService {
    public constructor() {
        super([
            new ScriptHoverService(),
            //new MarkupHoverService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}