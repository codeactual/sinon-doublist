module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

  var mochaShelljsOpt = {stdout: true, stderr: false};

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
      },
      test_lib: {
        options: mochaShelljsOpt,
        command: 'mocha --colors --async-only --recursive --reporter spec test/lib'
      },
      test_mocha: {
        options: mochaShelljsOpt,
        command: 'mocha --colors --async-only --reporter spec test/mocha.js'
      },
      dox_lib: {
        command: 'apidox --input lib/sinon-doublist/index.js --output docs/sinon-doublist.md'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dox', ['shell:dox_lib']);
  grunt.registerTask('build', ['default', 'shell:build']);
  grunt.registerTask('dist', ['default', 'shell:dist', 'uglify:dist', 'dox']);
  grunt.registerTask('test', ['build', 'shell:test_lib', 'shell:test_mocha']);
};
