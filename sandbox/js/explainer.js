//
//  main functions
//
//  xac@ucla.edu, 7/25/2019
//

var XDOLLAR = XDOLLAR || {};

XDOLLAR.explain = function (points, recognize, name) {
    let minSeg = (points.length / 5) | 0,
        maxSeg = points.length;
    let maxScore = -Infinity,
        maxScoreSegIndices;
    console.log([minSeg, maxSeg]);

    time();
    for (let s = minSeg; s <= maxSeg; s++) {
        for (let i = 0; i + s <= points.length; i++) {
            let seg = points.slice(i, i + s);
            let gesture = recognize(seg);
            // console.log(s, i, i + s, gesture.Score);
            if (gesture.Name == name && gesture.Score > maxScore) {
                maxScore = gesture.Score;
                maxScoreSegIndices = [i, i + s];
            }
        }
    }
    time('done!');

    return {
        maxScore: maxScore,
        maxScoreSeg: points.slice(maxScoreSegIndices[0], maxScoreSegIndices[1])
    }
}