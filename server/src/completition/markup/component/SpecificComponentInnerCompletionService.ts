import { ChoosingCompletionService } from "../../ChoosingCompletionService";
import { SvelteDocument } from "../../../SvelteDocument";
import { ComponentEventCompletionService } from "./ComponentEventCompletionService";
import { ComponentDataCompletionService } from "./ComponentDataCompletionService";

export class SpecificComponentCompletionService extends ChoosingCompletionService {
    public constructor(document: SvelteDocument) {
        super([
            new ComponentEventCompletionService(document),
            new ComponentDataCompletionService(document)
        ]);
    }
}