import { ChoosingCompletionService } from "../../ChoosingCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentEventCompletionService } from "./ComponentEventCompletionService";
import { ComponentDataCompletionService } from "./ComponentDataCompletionService";
import { ComponentBindCompletionService } from "./ComponentBindCompletionService";
import { ComponentDefaultCompletionService } from "./ComponentDefaultCompletionService";
import { CompositeCompletionService } from "../../CompositeCompletionService";

export class SpecificComponentCompletionService extends ChoosingCompletionService {
    public constructor(document: SvelteDocument) {
        super([
            new ComponentEventCompletionService(document),
            new ComponentBindCompletionService(document),
            new CompositeCompletionService([
                new ComponentDataCompletionService(document),
                new ComponentDefaultCompletionService(document)
            ])
        ]);
    }
}