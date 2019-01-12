import { ImportResolver } from "../interfaces";
import * as fs from "fs";
import * as path from "path";
import * as utils from '../utils';
import { DocumentsCache } from "../DocumentsCache";
import { SvelteDocument } from "../SvelteDocument";

export class NodeModulesImportResolver implements ImportResolver {
    private baseDocumentPath: string;
    private nodeModulesPath: string;

    constructor(protected documentsCache: DocumentsCache, protected documentPath: string) {
        this.baseDocumentPath = path.dirname(documentPath)
        this.nodeModulesPath = utils.findNodeModules(this.baseDocumentPath);
    }

    public resolve(importee: string): SvelteDocument {
        let importFilePath = path.resolve(this.baseDocumentPath, importee);
        let importedDocument = utils.findSvelteDocumentInCache(importFilePath, this.documentsCache);

        if (importedDocument === null) {
            importFilePath = utils.findSvelteFile(importFilePath);
            if (importFilePath !== null) {
                importedDocument = this.documentsCache.getOrCreateDocumentFromCache(importFilePath);                        
            } else if (this.nodeModulesPath) {
                const moduleFilePath = utils.findSvelteFile(path.resolve(this.nodeModulesPath, importee));
                if (moduleFilePath !== null) {
                    importedDocument = this.documentsCache.getOrCreateDocumentFromCache(moduleFilePath);
                }
            }
        }

        return importedDocument;
    }

    public resolvePath(partialPath: string): string {
        if (partialPath.startsWith('./') || partialPath.startsWith('../')) {
            const searchFolderPath = path.resolve(this.baseDocumentPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

            if (fs.existsSync(searchFolderPath)) {
                return searchFolderPath;
            }    
        } else if (!partialPath.startsWith('.')) {
            // Search in node modules folder
            if (this.nodeModulesPath) {
                const searchFolderPath = path.resolve(this.nodeModulesPath, partialPath.endsWith('/') ? partialPath : path.dirname(partialPath));

                if (fs.existsSync(searchFolderPath)) {
                    return searchFolderPath;
                }
            }  
        }

        return null;
    }
}

