import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { BlockInnerCompletionService } from "./BlockInnerCompletionService";
import { BlockOpenCompletionService } from "./BlockOpenCompletionService";
import { BlockCloseCompletetionService } from "./BlockCloseCompletionService";
import { OpenTagCompletionService } from "./OpenTagCompletionService";

export class MarkupCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new BlockOpenCompletionService(),
            new BlockInnerCompletionService(),
            new BlockCloseCompletetionService(),
            new OpenTagCompletionService(),
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}