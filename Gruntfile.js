'use strict';

module.exports = function (grunt) {

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Automatically load required Grunt tasks
	require('jit-grunt')(grunt, {});

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist',
		srcScript: '<%= config.app %>/scripts'
	};

	grunt.initConfig({

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			js: {
				files: ['<%= config.srcScript %>/{,*/}*.js'],
				tasks: ['jshint']
			},
			compass: {
				files: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
				tasks: ['compass:debug']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			images: {
				files: ['<%= config.app %>/images/{,*/}*.{gif,jpeg,jpg,png}',],
				tasks: ['imagemin']
			},
			svg: {
				files: ['<%= config.app %>/images/{,*/}*.{svg}',],
				tasks: ['svgmin']
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= config.srcScript %>/{,*/}*.js',
				'!<%= config.app %>/scripts/vendor/*'
			]
		},

		 // Compiles Sass to CSS and generates necessary files if requested
		compass: {
			options: {
				sassDir: '<%= config.app %>/sass',
				cssDir: '<%= config.dist %>/styles',
				generatedImagesDir: '<%= config.dist %>/images/generated',
				imagesDir: '<%= config.app %>/images',
				javascriptsDir: '<%= config.app %>/scripts',
				fontsDir: '<%= config.app %>/sass/fonts',
				httpImagesPath: '/images',
				httpGeneratedImagesPath: '/images/generated',
				httpFontsPath: '/sass/fonts',
				relativeAssets: false,
				assetCacheBuster: false
			},
			debug:{
			},
			dist: {
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
				dest: '<%= config.dist %>/scripts/content.js',
			},
			background: {
				src: [
					'<%= config.app %>/scripts/background.js'
				],
				dest: '<%= config.dist %>/scripts/background.js',
			},
			popup: {
				src: [
					'<%= config.app %>/scripts/vendor/jquery.js',
					'<%= config.app %>/scripts/popup.js'
				],
				dest: '<%= config.dist %>/scripts/popup.js',
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
						'manifest.json',
					]
				}]
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			debug: [
				'compass:debug',
				'imagemin',
				'svgmin',
				'concat',
				'copy'
			],
			dist: [
				'compass:dist',
				'imagemin',
				'svgmin',
				'concat',
				'copy'
			]
		},

		// Compress dist files to package
		compress: {
			dist: {
				options: {
					archive: function() {
						var manifest = grunt.file.readJSON('app/manifest.json');
						return 'bin/Chord Transposer-' + manifest.version + '.zip';
					}
				},
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['**/*'],
					dest: ''
				}]
			}
		}
	});

	grunt.registerTask('debug', function () {
		grunt.task.run([
			'clean:dist',
			'jshint',
			'concurrent:debug',
			'watch'
		]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:dist',
		'cssmin',
		'uglify',
		'compress'
	]);

	grunt.registerTask('default', [
		'jshint',
		'build'
	]);
};
