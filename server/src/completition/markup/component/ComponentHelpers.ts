import { SvelteDocument } from "../../../SvelteDocument";

export function findLastDirectiveIndex(document: SvelteDocument, offset: number, directiveName: string) {
    const index = document.content.lastIndexOf(`${directiveName}:`, offset);
    if (index < 0) {
        return -1;
    }

    const equalIndex = document.content.indexOf('=', index);
    if (equalIndex > 0 && equalIndex < offset) {
        return -1;
    }

    const spaceIndex = document.content.indexOf(' ', index);
    if (spaceIndex > 0 && spaceIndex < offset) {
        return -1;
    }

    return index;
}