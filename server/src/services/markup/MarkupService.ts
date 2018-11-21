import { ChoosingService } from "../ChoosingService";
import { BlockInnerService } from "./block/BlockInnerService";
import { BlockOpenService } from "./block/BlockOpenService";
import { BlockCloseService } from "./block/BlockCloseService";
import { OpenTagService } from "./OpenTagService";
import { PlaceholdersService } from "./PlaceholdersService";
import { TagInnerService } from "./TagInnerService";

export class MarkupService extends ChoosingService {
    public constructor() {
        super([
            new OpenTagService(),
            new TagInnerService(),

            new BlockOpenService(),
            new BlockInnerService(),
            new BlockCloseService(),
            
            new PlaceholdersService(),
        ]);
    }
}