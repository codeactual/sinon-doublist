module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

  grunt.initConfig({
    jshint: {
      src: {
        files: {
          src: ['index.js', 'lib/**/*.js', '!lib/jquery.js']
        }
      },
      grunt: {
        files: {
          src: ['Gruntfile.js']
        }
      },
      tests: {
        options: {
          expr: true
        },
        files: {
          src: ['test/**/*.js']
        }
      },
      json: {
        files: {
          src: ['*.json']
        }
      }
    },
    uglify: {
      dist: {
        options: {
          compress: false,
          mangle: false,
          beautify: true
        },
        files: {
          'dist/sinon-doublist.js': 'dist/sinon-doublist.js'
        }
      }
    },
    shell: {
      options: {
        failOnError: true,
        stdout: true,
        stderr: true
      },
      build: {
        command: 'component install --dev && component build --standalone sinonDoublist --name sinon-doublist --out dist --dev'
      },
      dist: {
        command: 'component build --standalone sinonDoublist --name sinon-doublist --out dist'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['default', 'shell:build']);
  grunt.registerTask('dist', ['default', 'shell:dist', 'uglify:dist']);
};
