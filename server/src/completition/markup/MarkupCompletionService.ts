import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { BlockInnerCompletionService } from "./BlockInnerCompletionService";
import { BlockOpenCompletionService } from "./BlockOpenCompletionService";
import { BlockCloseCompletetionService } from "./BlockCloseCompletionService";
import { OpenTagCompletionService } from "./OpenTagCompletionService";
import { GenericComponentInnerCompletionService } from "./GenericComponentInnerCompletionService";

export class MarkupCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new BlockOpenCompletionService(),
            new BlockInnerCompletionService(),
            new BlockCloseCompletetionService(),
            new OpenTagCompletionService(),
            new GenericComponentInnerCompletionService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}