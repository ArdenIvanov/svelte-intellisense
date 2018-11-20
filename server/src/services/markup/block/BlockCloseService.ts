import { BaseService } from "../../Common";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { findNearestNotClosedBlock, findLastCloseBlockIndex } from "./BlockHelpers";
import { ScopeContext } from "../../../interfaces";

export class BlockCloseService extends BaseService {
    public getCompletitionItems(document: SvelteDocument, context: ScopeContext): Array<CompletionItem> {
        const notClosedBlock = findNearestNotClosedBlock(context.content, context.offset);
        if (notClosedBlock == null) {
            return null;
        }

        const startIndex = findLastCloseBlockIndex(context.content, context.offset);
        if (startIndex < 0) {
            return null;
        }

        const contentPart = document.content.substring(startIndex, context.offset);
        if (/{\/[\w\d_]*$/g.test(contentPart)) {
            return [
                <CompletionItem>{
                    label: notClosedBlock.blockName,
                    kind: CompletionItemKind.Keyword,
                    preselect: true,
                    commitCharacters: ['}']
                }
            ];
        }

        return null;
    }
}