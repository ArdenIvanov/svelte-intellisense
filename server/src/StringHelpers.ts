export function regexLastIndexOf(content: string, regex: RegExp, startPos?: number): number {
    let index = content.substring(0, startPos || content.length).search(regex);
    while (index >= 0) {
        let nextIndex = content.substring(0, index).search(regex);
        if (nextIndex < 0) {
            return index + 1;
        }

        index = nextIndex;
    }

    return -1;
}

export function regexIndexOf(content: string, regex: RegExp, startPos?: number): number {
    var indexOf = content.substring(startPos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startPos || 0)) : indexOf;
}