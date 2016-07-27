(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var regression = require('regression');

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
var predict = function(futureValue, series) {
  var actualTrend,
      polynomialPrediction,
      linearPrediction;

  // Try to fit the trend with a second-degree polynomial
  actualTrend = regression('polynomial', series.map(function(w) {
    return [w.timestamp.getTime(), w.value];
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
    return [w.timestamp.getTime(), w.value];
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

},{"regression":2}],2:[function(require,module,exports){
module.exports = require('./src/regression');
},{"./src/regression":3}],3:[function(require,module,exports){
/**
* @license
*
* Regression.JS - Regression functions for javascript
* http://tom-alexander.github.com/regression-js/
*
* copyright(c) 2013 Tom Alexander
* Licensed under the MIT license.
*
**/

;(function() {
    'use strict';

    var gaussianElimination = function(a, o) {
           var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
           for (i = 0; i < n; i++) {
              maxrow = i;
              for (j = i + 1; j < n; j++) {
                 if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
                    maxrow = j;
              }
              for (k = i; k < n + 1; k++) {
                 tmp = a[k][i];
                 a[k][i] = a[k][maxrow];
                 a[k][maxrow] = tmp;
              }
              for (j = i + 1; j < n; j++) {
                 for (k = n; k >= i; k--) {
                    a[k][j] -= a[k][i] * a[i][j] / a[i][i];
                 }
              }
           }
           for (j = n - 1; j >= 0; j--) {
              tmp = 0;
              for (k = j + 1; k < n; k++)
                 tmp += a[k][j] * x[k];
              x[j] = (a[n][j] - tmp) / a[j][j];
           }
           return (x);
    };

        var methods = {
            linear: function(data) {
                var sum = [0, 0, 0, 0, 0], n = 0, results = [];

                for (; n < data.length; n++) {
                  if (data[n][1] != null) {
                    sum[0] += data[n][0];
                    sum[1] += data[n][1];
                    sum[2] += data[n][0] * data[n][0];
                    sum[3] += data[n][0] * data[n][1];
                    sum[4] += data[n][1] * data[n][1];
                  }
                }

                var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
                var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
              //  var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], data[i][0] * gradient + intercept];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(gradient*100) / 100 + 'x + ' + Math.round(intercept*100) / 100;

                return {equation: [gradient, intercept], points: results, string: string};
            },

            linearThroughOrigin: function(data) {
                var sum = [0, 0], n = 0, results = [];

                for (; n < data.length; n++) {
                    if (data[n][1] != null) {
                        sum[0] += data[n][0] * data[n][0]; //sumSqX
                        sum[1] += data[n][0] * data[n][1]; //sumXY
                    }
                }

                var gradient = sum[1] / sum[0];

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], data[i][0] * gradient];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(gradient*100) / 100 + 'x';

                return {equation: [gradient], points: results, string: string};
            },

            exponential: function(data) {
                var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                  if (data[n][1] != null) {
                    sum[0] += data[n][0];
                    sum[1] += data[n][1];
                    sum[2] += data[n][0] * data[n][0] * data[n][1];
                    sum[3] += data[n][1] * Math.log(data[n][1]);
                    sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
                    sum[5] += data[n][0] * data[n][1];
                  }
                }

                var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
                var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
                var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(A*100) / 100 + 'e^(' + Math.round(B*100) / 100 + 'x)';

                return {equation: [A, B], points: results, string: string};
            },

            logarithmic: function(data) {
                var sum = [0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                  if (data[n][1] != null) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += data[n][1] * Math.log(data[n][0]);
                    sum[2] += data[n][1];
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);
                  }
                }

                var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
                var A = (sum[2] - B * sum[0]) / n;

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(A*100) / 100 + ' + ' + Math.round(B*100) / 100 + ' ln(x)';

                return {equation: [A, B], points: results, string: string};
            },

            power: function(data) {
                var sum = [0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                  if (data[n][1] != null) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
                    sum[2] += Math.log(data[n][1]);
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);
                  }
                }

                var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
                var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A * Math.pow(data[i][0] , B)];
                    results.push(coordinate);
                }

                 var string = 'y = ' + Math.round(A*100) / 100 + 'x^' + Math.round(B*100) / 100;

                return {equation: [A, B], points: results, string: string};
            },

            polynomial: function(data, order) {
                if(typeof order == 'undefined'){
                    order = 2;
                }
                 var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

                        for (; i < k; i++) {
                           for (var l = 0, len = data.length; l < len; l++) {
                              if (data[l][1] != null) {
                               a += Math.pow(data[l][0], i) * data[l][1];
                              }
                            }
                            lhs.push(a), a = 0;
                            var c = [];
                            for (var j = 0; j < k; j++) {
                               for (var l = 0, len = data.length; l < len; l++) {
                                  if (data[l][1] != null) {
                                   b += Math.pow(data[l][0], i + j);
                                  }
                                }
                                c.push(b), b = 0;
                            }
                            rhs.push(c);
                        }
                rhs.push(lhs);

               var equation = gaussianElimination(rhs, k);

                    for (var i = 0, len = data.length; i < len; i++) {
                        var answer = 0;
                        for (var w = 0; w < equation.length; w++) {
                            answer += equation[w] * Math.pow(data[i][0], w);
                        }
                        results.push([data[i][0], answer]);
                    }

                    var string = 'y = ';

                    for(var i = equation.length-1; i >= 0; i--){
                      if(i > 1) string += Math.round(equation[i] * Math.pow(10, i)) / Math.pow(10, i)  + 'x^' + i + ' + ';
                      else if (i == 1) string += Math.round(equation[i]*100) / 100 + 'x' + ' + ';
                      else string += Math.round(equation[i]*100) / 100;
                    }

                return {equation: equation, points: results, string: string};
            },

            lastvalue: function(data) {
              var results = [];
              var lastvalue = null;
              for (var i = 0; i < data.length; i++) {
                if (data[i][1]) {
                  lastvalue = data[i][1];
                  results.push([data[i][0], data[i][1]]);
                }
                else {
                  results.push([data[i][0], lastvalue]);
                }
              }

              return {equation: [lastvalue], points: results, string: "" + lastvalue};
            }
        };

var regression = (function(method, data, order) {

       if (typeof method == 'string') {
           return methods[method](data, order);
       }
    });

if (typeof exports !== 'undefined') {
    module.exports = regression;
} else {
    window.regression = regression;
}

}());

},{}],4:[function(require,module,exports){
var predict = require('../index');

QUnit.test( 'Predict increase where none expected', function(assert) {
  var date, last;

  // Constant function (no increase)
  date = predict(2, [
    {
      timestamp: new Date("June 1, 2016 GMT-0000"),
      value: 1
    },
    {
      timestamp: new Date("June 2, 2016 GMT-0000"),
      value: 1
    },
    {
      timestamp: new Date("June 3, 2016 GMT-0000"),
      value: 1
    }
  ]);
  assert.ok( date === undefined, 'Constant function cannot increase' );

  // Linear decrease
  var linearDecrease = [
    {
      timestamp: new Date("June 1, 2016 GMT-0000"),
      value: 3
    },
    {
      timestamp: new Date("June 2, 2016 GMT-0000"),
      value: 2
    },
    {
      timestamp: new Date("June 3, 2016 GMT-0000"),
      value: 1
    }
  ];
  last = linearDecrease[linearDecrease.length - 1];
  date = predict(4, linearDecrease);
  assert.ok( last.timestamp.getTime() > date.getTime(), 'Decreasing linear function cannot increase' );

  // Polynomial decrease
  var polynomialDecrease = [
    {
      timestamp: new Date("June 1, 2016 GMT-0000"),
      value: 3
    },
    {
      timestamp: new Date("June 2, 2016 GMT-0000"),
      value: 2.7
    },
    {
      timestamp: new Date("June 3, 2016 GMT-0000"),
      value: 2.43
    }
  ];
  last = polynomialDecrease[polynomialDecrease.length - 1];
  date = predict(4, polynomialDecrease);
  assert.ok( last.timestamp.getTime() > date.getTime(), 'Decreasing polynomial function cannot increase' );
});

QUnit.test( 'Predict increase type correctly', function(assert) {
  var date, prediction;

  // Polynomial increase (second-degree)
  date = predict(10, [
    {
      timestamp: new Date("June 1, 2016 GMT-0000"),
      value: 1
    },
    {
      timestamp: new Date("June 2, 2016 GMT-0000"),
      value: 1.1
    },
    {
      timestamp: new Date("June 3, 2016 GMT-0000"),
      value: 1.21
    }
  ]);
  prediction = new Date("Aug 20 2016 22:35:57 GMT-0700 (PDT)");
  prediction.setMilliseconds(393);
  assert.deepEqual(date, prediction, 'Polynomial increase detected');

  // Linear increase
  date = predict(10, [
    {
      timestamp: new Date("June 1, 2016 GMT-0000"),
      value: 1
    },
    {
      timestamp: new Date("June 2, 2016 GMT-0000"),
      value: 2
    },
    {
      timestamp: new Date("June 3, 2016 GMT-0000"),
      value: 3
    }
  ]);
  prediction = new Date("Jun 09 2016 16:56:33 GMT-0700 (PDT)");
  prediction.setMilliseconds(360);
  assert.deepEqual(date, prediction, 'Linear increase detected');
});

},{"../index":1}]},{},[4]);
