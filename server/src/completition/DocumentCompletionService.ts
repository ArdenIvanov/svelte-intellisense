import { ChoosingCompletionService } from "./ChoosingCompletionService";
import { ScriptCompletionService } from "./script/ScriptCompletionService";
import { StyleCompletionService } from "./style/StyleCompletionService";
import { MarkupCompletionService } from "./markup/MarkupCompletionService";

export class DocumentCompletionService extends ChoosingCompletionService {
    public constructor() {
        super([
            new ScriptCompletionService(),
            new StyleCompletionService(),
            new MarkupCompletionService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}