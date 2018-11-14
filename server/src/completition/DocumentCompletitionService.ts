import { CompositeCompletitionService } from "./CompositeCompletitionService";
import { ScriptCompletitionService } from "./script/ScriptCompletitionService";
import { StyleCompletitionService } from "./style/StyleCompletitionService";
import { MarkupCompletitionService } from "./markup/MarkupCompletitionService";

export class DocumentCompletitionService extends CompositeCompletitionService {
    public constructor() {
        super([
            new ScriptCompletitionService(),
            new StyleCompletitionService(),
            new MarkupCompletitionService()
        ]);
    }

    public isApplyable(): boolean {
        return true;
    }
}