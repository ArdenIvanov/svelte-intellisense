import { DocumentsCache } from "../DocumentsCache";
import { AliasImportResolver } from "./AliasImportResolver";

export class RollupImportResolver extends AliasImportResolver {
    private resolvePlugins: Array<any>;

    constructor(documentsCache: DocumentsCache, documentPath: string, plugins: Array<any>) {
        super(documentsCache, documentPath);
        this.resolvePlugins = plugins.filter(x => x.hasOwnProperty('resolveId'));
    }

    protected findFileWithAlias(partialPath: string) : string {
        let importFilePath = null;

        this.resolvePlugins.forEach(plugin => {
            try {
                const resolvedId = plugin.resolveId(partialPath, this.documentPath);
                if (resolvedId && (typeof resolvedId === 'string')) {
                    importFilePath = resolvedId;
                }
            } catch {}
        });

        return importFilePath;
    }
}
