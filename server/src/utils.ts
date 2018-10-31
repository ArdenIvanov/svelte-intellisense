var sep = require('path').sep || '/';

export module Utils{
  /**
   * File URI to Path function. Taken from https://github.com/TooTallNate/file-uri-to-path.
   *
   * @param {String} uri
   * @return {String} path
   */
  export function fileUriToPath (uri) {
    if ('string' !== typeof uri ||
        uri.length <= 7 ||
        'file://' !== uri.substring(0, 7)) {
      throw new TypeError('must pass in a file:// URI to convert to a file path');
    }

    var rest = decodeURIComponent(uri.substring(7));
    var firstSlash = rest.indexOf('/');
    var host = rest.substring(0, firstSlash);
    var path = rest.substring(firstSlash + 1);

    // 2.  Scheme Definition
    // As a special case, <host> can be the string "localhost" or the empty
    // string; this is interpreted as "the machine from which the URL is
    // being interpreted".
    if ('localhost' === host) {
      host = '';
    }

    if (host) {
      host = sep + sep + host;
    }

    // 3.2  Drives, drive letters, mount points, file system root
    // Drive letters are mapped into the top of a file URI in various ways,
    // depending on the implementation; some applications substitute
    // vertical bar ("|") for the colon after the drive letter, yielding
    // "file:///c|/tmp/test.txt".  In some cases, the colon is left
    // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
    // colon is simply omitted, as in "file:///c/tmp/test.txt".
    path = path.replace(/^(.+)\|/, '$1:');

    // for Windows, we need to invert the path separators from what a URI uses
    if (sep == '\\') {
      path = path.replace(/\//g, '\\');
    }

    if (/^.+\:/.test(path)) {
      // has Windows drive at beginning of path
    } else {
      // unix path…
      path = sep + path;
    }

    return host + path;
  }
  
  export function offsetAt(content: string, position) :number {
    var lineOffsets = getLineOffsets(content);
    if (position.line >= lineOffsets.length) {
        return content.length;
    } else if (position.line < 0) {
        return 0;
    }
    var lineOffset = lineOffsets[position.line];
    var nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  }

  function getLineOffsets(content: string) {
    var offsets = [];
    var text = content;
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
