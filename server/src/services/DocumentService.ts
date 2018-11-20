import { ChoosingService } from "./ChoosingService";
import { ScriptService } from "./script/ScriptService";
import { StyleService } from "./style/StyleService";
import { MarkupService } from "./markup/MarkupService";

export class DocumentService extends ChoosingService {
    public constructor() {
        super([
            new ScriptService(),
            new StyleService(),
            new MarkupService()
        ]);
    }
}