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
