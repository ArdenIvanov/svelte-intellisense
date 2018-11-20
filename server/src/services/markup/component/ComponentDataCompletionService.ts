import { BaseComponentCompletionService } from "./BaseComponentCompletionService";

export class ComponentDataCompletionService extends BaseComponentCompletionService {

    public getCompletitionItems() {
        return this.componentDocument.metadata.public_data;
    }
}