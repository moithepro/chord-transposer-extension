'use strict'

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt)

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {})

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  }

  grunt.initConfig({
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      sass: {
        files: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
        tasks: ['sass']
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['debug']
      },
      images: {
        files: ['<%= config.app %>/images/{,*/}*.{gif,jpeg,jpg,png}'],
        tasks: ['imagemin']
      },
      svg: {
        files: ['<%= config.app %>/images/{,*/}*.{svg}'],
        tasks: ['svgmin']
      },
      scripts: {
        files: ['<%= config.app %>/scripts/{,*/}*.{js}'],
        tasks: ['sass']
      }
    },

    // Empties folders to start fresh
    clean: {
      tasks: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: false
      },
      dist: {
        files: {
          '<%= config.dist %>/styles/content.css': '<%= config.app %>/sass/content.scss',
          '<%= config.dist %>/styles/popup.css': '<%= config.app %>/sass/popup.scss'
        }
      }
    },

    // The following *-min tasks produce minifies files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/styles',
          src: ['*.css'],
          dest: '<%= config.dist %>/styles'
        }]
      }
    },

    concat: {
      content: {
        src: [
          '<%= config.app %>/scripts/vendor/jquery.js',
          '<%= config.app %>/scripts/helpers/chord.helper.js',
          '<%= config.app %>/scripts/helpers/dom.helper.js',
          '<%= config.app %>/scripts/content.js'
        ],
        dest: '<%= config.dist %>/scripts/content.js'
      },
      background: {
        src: [
          '<%= config.app %>/scripts/background.js'
        ],
        dest: '<%= config.dist %>/scripts/background.js'
      },
      popup: {
        src: [
          '<%= config.app %>/scripts/vendor/jquery.js',
          '<%= config.app %>/scripts/popup.js'
        ],
        dest: '<%= config.dist %>/scripts/popup.js'
      }
    },

    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/scripts',
          src: ['*.js'],
          dest: '<%= config.dist %>/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{webp,gif}',
            '{,*/}*.html',
            'manifest.json'
          ]
        }]
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      tasks: [
        'sass',
        'imagemin',
        'svgmin',
        'concat',
        'copy'
      ]
    }
  })

  grunt.registerTask('debug', function () {
    grunt.task.run([
      'clean',
      'concurrent',
      'watch'
    ])
  })

  grunt.registerTask('build', [
    'clean',
    'concurrent',
    'cssmin',
    'uglify'
  ])
}
