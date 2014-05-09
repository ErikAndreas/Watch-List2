module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'js/*.js', '!js/bundle.js'],
      options: {
        // options here to override JSHint defaults
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'js/*.js', '!js/bundle.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: ['Gruntfile.js', 'js/*.js', '!js/bundle.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    simplemocha: {
      options: {
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },

      all: {
        src: ['tests/**.js']
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.registerTask('default', ['jsbeautifier:verify', 'jshint']);
  grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);
  grunt.registerTask('test', ['jsbeautifier:modify', 'jshint', 'simplemocha:all']);
};
