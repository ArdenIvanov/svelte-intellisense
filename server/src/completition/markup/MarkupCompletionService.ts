import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { BlockInnerCompletionService } from "./BlockInnerCompletionService";
import { BlockOpenCompletionService } from "./BlockOpenCompletionService";
import { BlockCloseCompletetionService } from "./BlockCloseCompletionService";

export class MarkupCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new BlockOpenCompletionService(),
            new BlockInnerCompletionService(),
            new BlockCloseCompletetionService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}