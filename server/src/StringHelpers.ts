export function regexLastIndexOf(content: string, regex: RegExp, startPos?: number): number {
    let index = content.substring(0, startPos || content.length).search(regex);
    while (index >= 0) {
        let nextIndex = content.substring(index + 1, startPos || content.length).search(regex);
        if (nextIndex < 0) {
            return index + 1;
        }

        index += nextIndex + 1;
    }

    return -1;
}

export function regexIndexOf(content: string, regex: RegExp, startPos?: number): number {
    var indexOf = content.substring(startPos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startPos || 0)) : indexOf;
}

export function getIdentifierAtOffset(text: string, offset: number) {
    let result = '';
    let position = offset;

    while (text.length > position) {
        const char = text[position];
        if (char && /^[\w\d_$]$/.test(char)) {
            result += char;
            position++;
        } else {
            break;
        }
    }

    position = offset - 1;
    while (position >= 0) {
        const char = text[position];
        if (char && /^[\w\d_$]$/.test(char)) {
            result = char + result;
            position--;
        } else {
            break;
        }
    }

    return result;
}

export function isInsideAttributeAssign(content: string, position: number) {
    const openMustacheIndex = content.lastIndexOf('{', position);
    if (openMustacheIndex >= 2) {
        let quotesUsed = '';
        let prevChar = content.charAt(openMustacheIndex - 1);

        if (prevChar === '\'') {
            quotesUsed = '\'';
            prevChar = content.charAt(openMustacheIndex - 2);
        } else if (prevChar === '\"') {
            quotesUsed = '\"';
            prevChar = content.charAt(openMustacheIndex - 2);
        }

        if (prevChar !== '=') {
            return false;
        }

        const closeMustacheIndex = content.indexOf('}' + quotesUsed, openMustacheIndex);
        return closeMustacheIndex > 0 && closeMustacheIndex >= position;
    }
    
    return false;
}