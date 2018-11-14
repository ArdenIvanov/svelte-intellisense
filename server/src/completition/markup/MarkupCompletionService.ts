import { ChoosingCompletionService } from "../ChoosingCompletionService";
import { BlockInnerCompletionService } from "./block/BlockInnerCompletionService";
import { BlockOpenCompletionService } from "./block/BlockOpenCompletionService";
import { BlockCloseCompletetionService } from "./block/BlockCloseCompletionService";
import { OpenTagCompletionService } from "./OpenTagCompletionService";
import { GenericComponentInnerCompletionService } from "./component/GenericComponentInnerCompletionService";
import { PlaceholdersCompletionService } from "./PlaceholdersCompletionService";

export class MarkupCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new BlockOpenCompletionService(),
            new BlockInnerCompletionService(),
            new BlockCloseCompletetionService(),

            new PlaceholdersCompletionService(),
            
            new OpenTagCompletionService(),
            new GenericComponentInnerCompletionService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}