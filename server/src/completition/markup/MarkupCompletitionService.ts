import { CompositeCompletitionService } from "../CompositeCompletitionService";

export class MarkupCompletitionService extends CompositeCompletitionService {
    public constructor() {
        super([]);
    }

    public isApplyable(): boolean {
        return true;
    }
}