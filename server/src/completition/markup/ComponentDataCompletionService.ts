import { BaseComponentCompletionService } from "./BaseComponentCompletionService";

export class ComponentDataCompletionService extends BaseComponentCompletionService {
    public isApplyable() {
        return true;
    }

    public getCompletitionItems() {
        return this.componentDocument.metadata.data;
    }
}