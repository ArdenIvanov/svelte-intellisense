import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";

export abstract class BaseComponentCompletionService extends BaseService {
    protected componentDocument: SvelteDocument;
    
    public constructor(componentDocument: SvelteDocument) {
        super();

        this.componentDocument = componentDocument;
    }
}