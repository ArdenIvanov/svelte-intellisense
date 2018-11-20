import { ImportedComponent, ComponentMetadata } from './interfaces';
import { SvelteComponentDoc } from 'sveltedoc-parser/typings';
import { Position } from 'vscode-languageserver';

export class SvelteDocument {
    constructor(path: string) {
        this.path = path;
        this.importedComponents = [];
    }

    path: string;
    sveltedoc: SvelteComponentDoc;
    metadata: ComponentMetadata;
    importedComponents: ImportedComponent[];
    content: string;

    public offsetAt(position: Position): number {
        var lineOffsets = this.getLineOffsets();

        if (position.line >= lineOffsets.length) {
            return this.content.length;
        } else if (position.line < 0) {
            return 0;
        }

        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = (position.line + 1 < lineOffsets.length) 
            ? lineOffsets[position.line + 1] 
            : this.content.length;

        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
    }
    
    private getLineOffsets() {
        var offsets = [];
        var text = this.content;
        var isLineStart = true;
        var i = 0;

        while (i < text.length) {
            if (isLineStart) {
                offsets.push(i);
                isLineStart = false;
            }

            var ch = text.charAt(i);
            isLineStart = (ch === '\r' || ch === '\n');
            if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
                i++;
            }

            i++;
        }

        if (isLineStart && text.length > 0) {
            offsets.push(text.length);
        }
    
        return offsets;
    }
}