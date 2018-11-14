import { ICompletionService } from "../interfaces";
import { SvelteDocument } from "../../SvelteDocument";
import { Position, CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { findNearestNotClosedBlock, findLastCloseBlockIndex } from "./BlockHelpers";

export class BlockCloseCompletetionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: Position): boolean {
        const offset = document.offsetAt(position);
        return findNearestNotClosedBlock(document, offset) !== null
            && findLastCloseBlockIndex(document, offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: Position): Array<CompletionItem> {
        const offset = document.offsetAt(position);

        const notClosedBlock = findNearestNotClosedBlock(document, offset);
        if (notClosedBlock == null) {
            return [];
        }

        const startIndex = findLastCloseBlockIndex(document, offset);
        if (startIndex < 0) {
            return [];
        }

        const contentPart = document.content.substring(startIndex, offset);
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

        return [];
    }
}