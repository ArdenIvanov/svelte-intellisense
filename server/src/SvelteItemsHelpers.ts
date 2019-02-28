import { MarkupKind, Hover, Definition } from "vscode-languageserver";
import { SvelteDocument } from "./SvelteDocument";
import { ISvelteItem } from "sveltedoc-parser/typings";

export interface IItemsWithHandlers {
    items: Array<ISvelteItem>;
    handler(item: ISvelteItem): string;
}

export function findItemInSvelteDoc(itemsWithHandlers: Array<IItemsWithHandlers>, name: string) : Hover {
    if (!name) {
        return null;
    }

    for (let index = 0; index < itemsWithHandlers.length; index++) {
        const itemTypeAndHandler = itemsWithHandlers[index];
        let foundItem = itemTypeAndHandler.items.find(item => item.name === name);
        if (foundItem) {
            return {
                contents: { kind: MarkupKind.Markdown, value: itemTypeAndHandler.handler(foundItem)}
            };
        }
    }

    return null;
}

export function findLocationForItemInSvelteDoc(document: SvelteDocument, items: Array<ISvelteItem>, name: string) : Definition {
    if (!name) {
        return null;
    }

    let item = items.find(item => item.name === name);
    if (item && item.loc) {
        return {
            uri: document.document.uri,
            range: {
                start: document.positionAt(item.loc.start),
                end: document.positionAt(item.loc.end)
            }
        };
    }

    return null;
}