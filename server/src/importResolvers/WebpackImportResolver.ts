import * as path from "path";
import { DocumentsCache } from "../DocumentsCache";
import { AliasImportResolver } from "./AliasImportResolver";

export class WebpackImportResolver extends AliasImportResolver {
    constructor(documentsCache: DocumentsCache, documentPath: string, private alias: Object) {
        super(documentsCache, documentPath);
    }

    private isAlias(file: string, alias: string) {
        const trueAlias = alias.endsWith('$') ? alias.substring(0, alias.length - 1) : alias;

        if (trueAlias === file) {
            return true;
        }
        if (!file.startsWith(trueAlias)) {
            return false;
        }
        return file[trueAlias.length] === '/';
    }
    
    private getAlias(file: string, aliases: Object) {
        for (const p in aliases) {
            if (aliases.hasOwnProperty(p) && this.isAlias(file, p)) {
                return p;
            }
        }
        return null;
    }
    
    protected findFileWithAlias(partialPath: string) : string {
        let importFilePath = null;
    
        let alias = this.getAlias(partialPath, this.alias);
        if (alias === null) {
            return null;
        }
        importFilePath = partialPath.substr(alias.length - (alias.endsWith('$') ? 1 : 0));
        if (importFilePath !== '') {
            importFilePath = '.' + importFilePath;
        }
        importFilePath = path.resolve(this.alias[alias], importFilePath);

        return importFilePath;
    }
}
