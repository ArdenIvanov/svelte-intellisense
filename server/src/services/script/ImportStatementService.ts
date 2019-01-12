import { ChoosingService } from "../ChoosingService";
import { ComponentPathService, SupportedComponentFileExtensions } from "./ComponentPathService";
import { ScopeContext } from "../../interfaces";
import { ComponentNameService } from "./ComponentNameService";

const SupportedImportFileExtensions = [
    '.js',
    '.ts'
];

const ExcludedFileExtensions = [
    '.spec.js'
];

export class ImportStatementService extends ChoosingService {
    constructor() {
        super([
            new ComponentNameService(),
            new ComponentPathService({
                extensionsToSearch: [
                    ...SupportedComponentFileExtensions,
                    ...SupportedImportFileExtensions
                ],
                extensionsToExclude: ExcludedFileExtensions,
                includeFileExtensionToInsert: false
            })
        ]);
    }

    protected reduceContext(context: ScopeContext): ScopeContext {
        const startIndex = context.content.lastIndexOf('import ', context.offset);

        if (startIndex < 0) {
            return null;
        }

        const endIndex = context.content.indexOf(';', startIndex);

        const importStatementContent = endIndex < 0
            ? context.content.substring(startIndex)
            : context.content.substring(startIndex, endIndex);

        const _importStatementRegex = /^import\s+(({[^}]*}|[\w_][\w\d_]*|\*)\s+(as\s+[\w_][\w\d_]*\s+)?from\s+)/i;
        const match = _importStatementRegex.exec(importStatementContent);

        if (match) {
            return {
                content: importStatementContent,
                offset: context.offset - startIndex,
                documentOffset: context.documentOffset
            };
        }

        return null;
    }
}