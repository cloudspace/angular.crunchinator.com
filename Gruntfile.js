// Generated on 2013-12-18 using generator-angular 0.6.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var httpsync = require('httpsync');

    // Get version of API needed to run Crunchinator
    var API_VERSION = require('./api-version.json').version;

    var aws = {
        key: grunt.option('key') || process.env.AWS_ACCESS_KEY_ID,
        secret: grunt.option('secret') || process.env.AWS_SECRET_ACCESS_KEY
    };
    var ENV = {};
    function isGitTag(err, stdout, stderr, cb) {
        if (!err) {
            aws.env = 'production';
        }
        cb();
    }

    function fetchCurrentRelease(env) {
        env = env || 'staging';
        var url = '';
        switch(env) {
            case 'production':
                url = 'http://s3.amazonaws.com/crunchinator.com/api/current_release.json';
                break;
            default:
                url = 'http://s3.amazonaws.com/staging.crunchinator.com/api/current_release.json';
                break;
        }
        var response = httpsync.get({url: url}).end();
        return JSON.parse(response.data.toString()).release;
    }

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'build'
        },
        aws: aws,
        ENV: ENV,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all']
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{less,css}'],
                tasks: ['less:server', 'newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>'
                }
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
                '<%= yeoman.app %>/scripts/{!(configuration),*/}*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/styles/fonts/*',
                        '<%= yeoman.dist %>/styles/data/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        cssmin: {
            options: {
                root: '<%= yeoman.app %>'
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }, {
                    expand: true,
                    cwd: '<%= yeoman.app %>/vendor',
                    src: ['**/*.{png,jpg,jpeg,gif}', '!**/node_modules/**'],
                    dest: '<%= yeoman.dist %>/vendor'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }, {
                    expand: true,
                    cwd: '<%= yeoman.app %>/vendor',
                    src: ['**/*.svg', '!**/node_modules/**'],
                    dest: '<%= yeoman.dist %>/vendor'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    // Optional configurations that you can uncomment to use
                    // removeCommentsFromCDATA: true,
                    // collapseBooleanAttributes: true,
                    // removeAttributeQuotes: true,
                    // removeRedundantAttributes: true,
                    // useShortDoctype: true,
                    // removeEmptyAttributes: true,
                    // removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.html', 'views/*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp}',
                        'fonts/*',
                        'data/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less:server',
                'copy:styles'
            ],
            test: [
                'less:dist',
                'copy:styles'
            ],
            dist: [
                'less:dist',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },


        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css',
        //         '<%= yeoman.app %>/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        ngconstant: {
            configuration: {
                dest: '<%= yeoman.app %>/scripts/configuration.js',
                name: 'configuration',
                constants: {
                    ENV: '<%= ENV.env || "production" %>',
                    API_VERSION: '<%= ENV.version %>'
                }
            }
        },

        s3: {
            options: {
                key: '<%= aws.key %>',
                secret: '<%= aws.secret %>',
                access: 'public-read',
                maxOperations: 20,
                verify: true,
                gzip: true,
                gzipExclude: [
                    '.png',
                    '.jpg',
                    '.jpeg',
                    '.gif',
                    '.webp',
                    '.svg',
                    '.eot',
                    '.woff',
                    '.ttf'
                ]
            },
            staging: {
                options: {
                    bucket: 'staging.crunchinator.com'
                },
                sync: [{
                    src: '<%= yeoman.dist %>/**/*.*',
                    dest: '/',
                    rel: '<%= yeoman.dist %>'
                }]
            },
            production: {
                options: {
                    bucket: 'crunchinator.com'
                },
                sync: [{
                    src: '<%= yeoman.dist %>/**/*.*',
                    dest: '/',
                    rel: '<%= yeoman.dist %>'
                }]
            }
        },
        shell: {
            isGitTag: {
                command: 'git describe --exact-match --tags HEAD',
                options: {
                    callback: isGitTag
                }
            }
        },

        less: {
            options: {
                paths: '<%= yeoman.app %>/styles',
                strictUnits: true
            },
            dist: {
                options: {
                    compress: true
                },
                files: {
                    '.tmp/styles/main.css':'app/styles/main.less'
                }
            },
            server: {
                files: {
                    '.tmp/styles/main.css':'app/styles/main.less'
                }
            }
        },
    });


    grunt.registerTask('serve', function (target) {
        target = target || 'development';
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'ENV:' + target,
            'ngconstant:configuration',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('test', [
        'clean:server',
        'ENV:test',
        'ngconstant:configuration',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'ngconstant:configuration',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngmin',
        'copy:dist',
        'cdnify',
        'cssmin',
        'uglify',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('ENV', function(env) {
        ENV.env = env;
        if(!ENV.version) {
            ENV.version = fetchCurrentRelease(env);
        }
    });

    grunt.registerTask('deploy', function(env) {
        var repo = process.env.TRAVIS_REPO_SLUG;
        var branch = process.env.TRAVIS_BRANCH;
        if (repo && repo !== 'cloudspace/angular.crunchinator.com') {
            return;
        }
        if (branch && branch !== 'master') {
            return;
        }

        if (!aws.key) {
            throw new Error('You must specify a `AWS_ACCESS_KEY_ID` ENV variable.');
        }
        if (!aws.secret) {
            throw new Error('You must specify a `AWS_SECRET_ACCESS_KEY` ENV variable.');
        }

        // will set aws.env to production if
        // this is a git tag.
        grunt.task.run('shell:isGitTag');
        env = env || aws.env || 'staging';

        if (env === 'production') {
            var parse_release_version = fetchCurrentRelease(env).split('.');
            var parse_api_version = API_VERSION.split('.');

            if (parse_api_version[0] !== parse_release_version[0] ||
                parse_api_version[1] !== parse_release_version[1] &&
                parse_api_version[1] !== '*') {
                throw new Error('Version does not match, cancelling the deploy.');
            }
        }

        grunt.task.run(['ENV:' + env, 'build', 's3:' + env]);
    });

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
