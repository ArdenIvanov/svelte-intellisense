export function findLastOpenBlockIndex(content: string, position: number) {
    const openBlockIndex = content.lastIndexOf('{#', position);
    if (openBlockIndex >= 0) {
        const closeBlockIndex = content.indexOf('}', openBlockIndex);
        if (closeBlockIndex > 0 && closeBlockIndex < position) {
            return -1;
        }
    }

    return openBlockIndex;
}

export function findLastInnerBlockIndex(content: string, position: number): number {
    const openIndex = content.lastIndexOf('{:', position);
    if (openIndex < 0) {
        return -1;
    }

    const closeIndex = content.indexOf('}', openIndex);
    if (closeIndex > 0 && closeIndex < position) {
        return -1;
    }

    return openIndex;
}

export function findLastCloseBlockIndex(content: string, position: number) {
    const openIndex = content.lastIndexOf('{/', position);
    if (openIndex < 0) {
        return -1;
    }

    const endIndex = content.indexOf('}', openIndex);
    if (endIndex > 0 && endIndex < position) {
        return -1;
    }

    return openIndex;
}

export function findNearestOpenBlockRange(content: string, position: number) {
    const blockStartIndex = content.lastIndexOf('{#', position);
    if (blockStartIndex < 0) {
        return null;
    }

    const blockEndTagIndex = content.indexOf('}', blockStartIndex);
    if (blockEndTagIndex < 0) {
        return null;
    }

    return {
        startIndex: blockStartIndex,
        endIndex: blockEndTagIndex + 1
    };
}

export function findNearestCloseBlockIndex(content: string, blockName: string, blockStartIndex: number) {
    return content.indexOf(`{/${blockName}}`, blockStartIndex);
}

export function findNearestNotClosedBlock(content: string, offset: number) {
    let positionToSearch = offset;

    while (positionToSearch > 0) {
        const openBlockRange = this.findNearestOpenBlockRange(content, positionToSearch);
        if (openBlockRange == null) {
            return null;
        }

        const blockContent = content.substring(openBlockRange.startIndex, openBlockRange.endIndex);
        const match = /^{#([\w\d_]+).*}$/g.exec(blockContent);
        if (match) {
            const blockName = match[1];
            
            const closeBlockIndex = this.findNearestCloseBlockIndex(content, blockName, openBlockRange.endIndex);
            if (closeBlockIndex < 0 || closeBlockIndex >= offset) {
                return {
                    blockName,
                    range: openBlockRange
                }
            }
        }

        positionToSearch = openBlockRange.startIndex - 1;
    }

    return null;
}