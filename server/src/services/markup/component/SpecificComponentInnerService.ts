import { ChoosingService } from "../../ChoosingService";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentEventCompletionService } from "./ComponentEventCompletionService";
import { ComponentDataCompletionService } from "./ComponentDataCompletionService";
import { ComponentBindCompletionService } from "./ComponentBindCompletionService";
import { ComponentDefaultCompletionService } from "./ComponentDefaultCompletionService";
import { CompositeCompletionService } from "../../CompositeService";
import { ExpressionCompletionService } from "./ExpressionCompletionService";

export class SpecificComponentInnerService extends ChoosingService {
    public constructor(document: SvelteDocument) {
        super([
            new ExpressionCompletionService(),
            new ComponentEventCompletionService(document),
            new ComponentBindCompletionService(document),
            new CompositeCompletionService([
                new ComponentDataCompletionService(document),
                new ComponentDefaultCompletionService(document)
            ])
        ]);
    }
}