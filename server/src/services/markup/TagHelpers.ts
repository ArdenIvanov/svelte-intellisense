import { SvelteDocument } from "../../SvelteDocument";
import { DocumentsCache } from "../../DocumentsCache";

import { createTextDocument } from "../../utils";

export function findLastOpenTagIndex(content: string, offset: number): number {
    const startIndex = content.lastIndexOf('<', offset);
    if (startIndex < 0) {
        return -1;
    }

    const endIndex = findTagInnerEndIndex(content, startIndex);
    if (endIndex > 0 && endIndex < offset) {
        return -1;
    }

    return startIndex;
}

export function findNearestOpenTag(content: string, offset: number) {
    let positionToSearch = offset;
    let countOfUnclosedTags = 0;

    while (positionToSearch > 0) {
        const startIndex = content.lastIndexOf('<', positionToSearch);
        if (startIndex < 0) {
            return null;
        }

        const endIndex = findTagInnerEndIndex(content, startIndex);
        if (endIndex < 0 || endIndex > positionToSearch) {
            return null;
        }
        
        if (content.charAt(endIndex - 1) !== '/') {
            if (content.charAt(startIndex + 1) === '/') {
                countOfUnclosedTags++;
            } else {
                if (countOfUnclosedTags > 0) {
                    countOfUnclosedTags--;
                } else {
                    const tagContent = endIndex < 0 
                        ? content.substring(startIndex) 
                        : content.substring(startIndex, endIndex);

                    const match = /<(([\w\d_]+:)?[\w_]+[\w\d_]*)\s*/g.exec(tagContent);
                    if (match) {
                        return {
                            tagName: match[1],
                            tagNamespace: match[2],
                            startIndex: startIndex,
                            endIndex: endIndex,
                            content: tagContent,
                        };
                    }
                }
            }
        }

        positionToSearch = startIndex - 1;
    }

    return null;
}

export function findLastOpenTag(content: string, offset: number) {
    const startIndex = content.lastIndexOf('<', offset);
    if (startIndex < 0) {
        return null;
    }

    const endIndex = findTagInnerEndIndex(content, startIndex);
    if (endIndex > 0 && endIndex < offset) {
        return null;
    }

    const tagContent = endIndex < 0 
        ? content.substring(startIndex) 
        : content.substring(startIndex, endIndex);

    const match = /<(([\w\d_]+:)?[\w_]+[\w\d_]*)\s*/g.exec(tagContent);
    if (match) {
        return {
            tagName: match[1],
            tagNamespace: match[2],
            startIndex: startIndex,
            endIndex: endIndex,
            content: tagContent,
        };
    }

    return null;
}

export function findTagInnerEndIndex(content: string, offset: number) {
    return content.indexOf('>', offset);
}

export function findLastDirectiveIndex(content: string, offset: number, directiveName: string) {
    const index = content.lastIndexOf(`${directiveName}:`, offset);
    if (index < 0) {
        return -1;
    }

    const equalIndex = content.indexOf('=', index);
    if (equalIndex > 0 && equalIndex < offset) {
        return -1;
    }

    const spaceIndex = content.indexOf(' ', index);
    if (spaceIndex > 0 && spaceIndex < offset) {
        return -1;
    }

    return index;
}

export function findImportedComponent(componentName: string, document: SvelteDocument, documentsCache: DocumentsCache) {
    const component = document.importedComponents.find(c => c.name === componentName);

    if (component === undefined) {
        return null;
    }

    const externalDocument = documentsCache.has(component.filePath) ? documentsCache.get(component.filePath) : null;
    if (externalDocument && !externalDocument.document) {
        externalDocument.document = createTextDocument(component.filePath);
    }

    return externalDocument;
}

export function findNearestOpenComponent(offset: number, document: SvelteDocument, documentsCache: DocumentsCache) {
    const prevTag = findNearestOpenTag(document.content, offset);
    return prevTag === null ? null : findImportedComponent(prevTag.tagName, document, documentsCache);
}