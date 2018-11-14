import { SvelteDocument } from "../../SvelteDocument";

export function findLastOpenTagIndex(document: SvelteDocument, offset: number): number {
    const startIndex = document.content.lastIndexOf('<', offset);
    if (startIndex < 0) {
        return -1;
    }

    const endIndex = document.content.indexOf('>', offset);
    if (endIndex > 0 && endIndex < offset) {
        return -1;
    }

    return startIndex;
}

export function findLastOpenTag(document: SvelteDocument, offset: number) {
    const startIndex = findLastOpenTagIndex(document, offset);
    if (startIndex < 0) {
        return null;
    }

    const tagContent = document.content.substring(startIndex, offset);

    const match = /<([\w_]+[\w\d_]*)\s*/g.exec(tagContent);
    if (match) {
        return {
            tagName: match[1],
            startIndex: startIndex,
            content: tagContent,
        };
    }

    return null;
}