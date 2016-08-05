/**
 * Given an array of timeseries data ordered from oldest to
 * newest, predict when a future value is likely to be hit.
 *
 * The series is expected to be an array of objects of the
 * following format:
 *
 * {
 *   timestamp: Date,
 *   value: Number
 * }
 *
 * The algorithm will try to fit the series with a second-degree
 * polynomial and a linear regression. The quickest one wins.
 *
 * This method works best when the future value is larger than 
 * any of the items in the series.
 *
 * The output is a Date, or null if no prediction can be made.
 */
var regression = require('regression');

var predict = function(futureValue, series) {
  var actualTrend,
      polynomialPrediction,
      linearPrediction;

  // Try to fit the trend with a second-degree polynomial
  actualTrend = regression('polynomial', series.map(function(w) {
    return [(new Date(w.timestamp)).getTime(), w.value];
  }), 2).equation;
  if (actualTrend[2]) {
    var a = actualTrend[0],
        b = actualTrend[1],
        c = actualTrend[2],
        x = (Math.sqrt((-4*a*c) + (b*b) + (4*c*futureValue)) - b) / (2*c);

    if (x > 0) {
      polynomialPrediction = x;
    }
  }

  // Try to fit the trend with a linear equation
  actualTrend = regression('linear', series.map(function(w) {
    return [(new Date(w.timestamp)).getTime(), w.value];
  })).equation;
  linearPrediction = (futureValue - actualTrend[1]) / actualTrend[0];

  // Return the closest prediction
  if (linearPrediction === Infinity) {
    return undefined;
  }
  else if (polynomialPrediction && linearPrediction) {
    var poly = polynomialPrediction;
    var linr = linearPrediction;

    return new Date(poly < linr ? poly : linr);
  }
  else if (polynomialPrediction) {
    return new Date(polynomialPrediction);
  }
  else {
    return new Date(linearPrediction);
  }
};

module.exports = predict;
