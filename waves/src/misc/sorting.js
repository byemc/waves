
const levDistance = (a, b) => {
    // Calculates the Levenshtein distance between `a` and `b`
    // Adapted from the pseudocode on https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm

    a = a.toLowerCase()
    b = b.toLowerCase()

    const lenA = a.length;  // |a|
    const lenB = b.length;  // |b|

    if (lenA === 0) return lenB;
    if (lenB === 0) return lenA;

    let d = new Array(lenA+1).fill(Array(lenB+1).fill(0));

    for (let i = 1; i < lenA; i++) {
        d[i][0] = i
    }

    for (let j = 1; j < lenB; j++) {
        d[0][j] = j
    }

    let substitutionCost;
    for (let j = 1; j <= lenB; j++) {
        for (let i = 1; i <= lenA; i++) {
            if (a.substring(i, i+1) === b.substring(j, j+1)) {
                substitutionCost = 0
            } else {
                substitutionCost = 1
            }

            d[i][j] = Math.min(
                d[i-1][j] + 1,              // Deletion
                d[i][j-1] + 1,                  // Insertion
                d[i-1][j-1] + substitutionCost) // Substitution
        }
    }

    return d[lenA][lenB]
}

export {levDistance};
