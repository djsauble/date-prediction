module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({

    // JSHint configuration options
    jshint: {
      all: ['Gruntfile.js', 'index.js', 'test/tests.js']
    },

    // Specify test locations for QUnit
    qunit: {
      browser: ['test/index.html']
    },

    // Configuration for browserify
    browserify: {
      tests: {
        src: 'test/tests.js',
        dest: 'test/bundle.js'
      }
    }
  });

  // Load browserify tasks. Needed for bundling.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Setup command line argument tasks. For e.g.:
  // $ grunt # executes jshint, browserify, qunit
  // $ grunt test # runs qunit task, only
  grunt.registerTask('default', ['jshint', 'browserify', 'qunit']);
  grunt.registerTask('test', ['browserify', 'qunit']);
};
