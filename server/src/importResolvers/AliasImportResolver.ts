import * as fs from "fs";
import * as utils from '../utils';
import { NodeModulesImportResolver } from "./NodeModulesImportResolver";
import { DocumentsCache } from "../DocumentsCache";
import { SvelteDocument } from "../SvelteDocument";

export class AliasImportResolver extends NodeModulesImportResolver {
        constructor(documentsCache: DocumentsCache, documentPath: string) {
        super(documentsCache, documentPath);
    }

    protected findFileWithAlias(_partialPath: string) : string {
        return null;
    }

    public resolve(importee: string) : SvelteDocument {
        const result = super.resolve(importee);

        if (result !== null) {
            return result;
        }
        
        let importFilePath = this.findFileWithAlias(importee);

        importFilePath = utils.findSvelteFile(importFilePath);
        if (importFilePath !== null) {
            return this.documentsCache.getOrCreateDocumentFromCache(importFilePath);
        }

        return null;
    }

    public resolvePath(partialPath: string): string {
        const result = super.resolvePath(partialPath);

        if (result !== null) {
            return result;
        }

        const importFilePath = this.findFileWithAlias(partialPath);

        if (fs.existsSync(importFilePath)) {
            return importFilePath;
        }

        return null;
    }
}
