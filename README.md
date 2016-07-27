Given an array of timeseries data ordered from oldest to
newest, predict when a future value is likely to be hit.

The series is expected to be an array of objects of the
following format:

    {
      timestamp: Date,
      value: Number
    }

The algorithm will try to fit the series with a second-degree
polynomial and a linear regression. The quickest one wins.

This method works best when the future value is larger than 
any of the items in the series. Don't try to match a value
in the past.

The output is a `Date`, or `undefined` if no prediction can
be made.

## Usage

Predict a future value of a non-linear trend (second-degree
polynomial):

    var predict = require('date-prediction');
    predict(10, [
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

Predict a future value of a linear trend (y = mx + c)

    var predict = require('date-prediction');
    predict(10, [
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
