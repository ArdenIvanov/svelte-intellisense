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