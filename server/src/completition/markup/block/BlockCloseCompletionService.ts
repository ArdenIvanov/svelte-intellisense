import { ICompletionService } from "../../interfaces";
import { SvelteDocument } from "../../../SvelteDocument";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { findNearestNotClosedBlock, findLastCloseBlockIndex } from "./BlockHelpers";
import { DocumentPosition } from "../../../interfaces";

export class BlockCloseCompletetionService implements ICompletionService {
    public isApplyable(document: SvelteDocument, position: DocumentPosition): boolean {
        return findNearestNotClosedBlock(document, position.offset) !== null
            && findLastCloseBlockIndex(document, position.offset) >= 0;
    }

    public getCompletitionItems(document: SvelteDocument, position: DocumentPosition): Array<CompletionItem> {
        const notClosedBlock = findNearestNotClosedBlock(document, position.offset);
        if (notClosedBlock == null) {
            return [];
        }

        const startIndex = findLastCloseBlockIndex(document, position.offset);
        if (startIndex < 0) {
            return [];
        }

        const contentPart = document.content.substring(startIndex, position.offset);
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