import { ChoosingService } from "../ChoosingService";
import { BlockInnerService } from "./block/BlockInnerService";
import { BlockOpenService } from "./block/BlockOpenService";
import { BlockCloseService } from "./block/BlockCloseService";
import { OpenTagService } from "./OpenTagService";
import { GenericComponentInnerService } from "./component/GenericComponentInnerService";
import { PlaceholdersService } from "./PlaceholdersService";
import { HtmlTagInnerService } from "./html/HtmlTagInnerService";

export class MarkupService extends ChoosingService {
    public constructor() {
        super([
            new OpenTagService(),
            new GenericComponentInnerService(),
            new HtmlTagInnerService(),

            new BlockOpenService(),
            new BlockInnerService(),
            new BlockCloseService(),
            
            new PlaceholdersService(),
        ]);
    }
}