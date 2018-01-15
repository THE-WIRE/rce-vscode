
const diff = require('diff');

class TextChange{

    constructor(){}
    
    get(oldText, newText){
        
        return this.findAddedRanges(oldText, newText);
    }

    findAddedRanges(before, after) {

        var newRanges = [];
        var lineNumber = 0;
        var column = 0;
    
        // Compute the diff using `jsdiff`
        const parts = diff.diffChars(before, after);
    
        // Loop over every part, keeping track of:
        // 1. The current line no. and column in the `after` string
        // 2. Character ranges for all "added" parts in the `after` string
        for (var partIndex = 0; partIndex < parts.length; partIndex++) {
    
            const part = parts[partIndex];
    
            // Skip any parts that aren't in `after`
            if (part.removed === true) {
            continue;
            }
    
            const startLineNumber = lineNumber;
            const startColumn = column;
    
            // Split the part into lines. Loop throug these lines to find
            // the line no. and column at the end of this part.
            const substring = part.value;
            const lines = substring.split("\n");
            lines.forEach((line, lineIndex) => {
            // The first `line` is actually just a continuation of the last line
            if (lineIndex === 0) {
                column += line.length;
            // All other lines come after a line break.
            } else if (lineIndex > 0) {
                lineNumber += 1;
                column = line.length;
            }
            });
    
            // Save a range for all of the parts that are only in the `after` string.
            if (part.added === true) {
            newRanges.push({
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: lineNumber,
                endColumn: column,
                text: part.value
            });
            }
        }
        return newRanges;
    }
}

module.exports = TextChange