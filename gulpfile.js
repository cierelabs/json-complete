const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpBetterRollup = require('gulp-better-rollup');
const gulpFile = require('gulp-file');
const gulpModifyFile = require('gulp-modify-file');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpTerser = require('gulp-terser');
const gulpWatch = require('gulp-watch');
const path = require('path');
const readableStream = require('stream').Readable;
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

const baseIndexHtml = (scripts) => {
    return `<!doctype html><meta charset="utf-8"><title>json-complete In-Browser Tester</title><p>Open console.</p>${scripts.map((script) => {
        return `<script src="${script.src}" ${script.isModule ? `type="module"` : ''}></script>`;
    }).join('')}`;
};

function onError(e) {
    console.error(e);
    this.emit('end');
}

gulp.task('clear', () => {
    return del([
        './tests/_BrowserTesting/**/*',
        './tests/_NodeTesting/**/*',
    ]);
});

const js = (options) => {
    const format = options.format || 'esm';

    let stream = gulp.src(options.entry);
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            {
                resolveId(importee) {
                    if (/^[\\/]/.test(importee)) {
                        return path.resolve(fs.realpathSync('./'), importee.replace(/^\//, ''));
                    }

                    return importee;
                },
            },
        ],
    }, {
        format: options.format || 'esm',
        name: options.name || 'json-complete',
        preferBuiltins: false,
        external: options.external || [],
    }));
    stream = stream.on('error', onError);

    if (!options.keepName) {
        stream = stream.pipe(gulpRename({
            suffix: `.${format}`,
        }));
    }

    if (format !== 'esm') {
        stream = stream.pipe(gulpBabel({
            presets: ['@babel/env'],
        }));
        stream = stream.on('error', onError);
    }

    if (options.onBuilt) {
        stream = stream.pipe(gulpModifyFile(options.onBuilt));
    }

    if (options.unminify) {
        stream = stream.pipe(gulp.dest(options.destination));
    }

    if (options.minify) {
        stream = stream.pipe(gulpTerser({
            mangle: {
                toplevel: format === 'esm',
                properties: {
                    keep_quoted: true,
                    regex: /attachments|build|decoded|deferred|deferredEncode|encoded|encodeValue|explore|generateReference|ignoreIndices|index|indices|key|parts|pointer|references|systemName|value/,
                    // debug: true,
                },
            },
            compress: {
                inline: true,
            },
            // output: {
            //     beautify: true,
            // },
        }));
        stream = stream.on('error', onError);

        if (!options.keepName) {
            stream = stream.pipe(gulpRename({
                suffix: '.min',
            }));
        }

        stream = stream.pipe(gulp.dest(options.destination));
    }

    return stream;
};

gulp.task('browser-test-vendor', () => {
    // http://stackoverflow.com/a/36042506
    const s = new readableStream();
    s.push(`'';`); // No contents required, because require option adds the exported dependencies
    s.push(null);

    const browserifyOptions = {
        require: ['tape'],
        debug: false,
    };

    return browserify(s, browserifyOptions).bundle()
    .on('error', onError)
    .pipe(vinylSourceStream('vendor.js'))
    .pipe(vinylBuffer())
    .on('error', onError)
    .pipe(gulp.dest('./tests/_BrowserTesting'));
});

gulp.task('browser-test-esm-TypeTests', () => {
    gulp.src('./tests/TypeTests/*.mjs')
    .pipe(gulp.dest('./tests/_BrowserTesting/tests/TypeTests'));
});

gulp.task('browser-test-esm-testHelpers', () => {
    gulp.src('./tests/testHelpers.mjs')
    .pipe(gulp.dest('./tests/_BrowserTesting/tests'));
});

gulp.task('browser-test-esm-tests', () => {
    gulp.src('./tests/tests.mjs')
    .pipe(gulp.dest('./tests/_BrowserTesting'));
});

gulp.task('browser-test-umd-tests', () => {
    return js({
        entry: './tests/tests.mjs',
        format: 'umd',
        unminify: true,
        minify: false,
        destination: './tests/_BrowserTesting',
    });
});

gulp.task('browser-test-umd-tests-min', () => {
    return js({
        entry: './tests/tests.mjs',
        format: 'umd',
        unminify: false,
        minify: true,
        destination: './tests/_BrowserTesting',
    });
});

gulp.task('browser-test-esm-main', () => {
    return js({
        entry: './src/main.mjs',
        format: 'esm',
        unminify: true,
        minify: false,
        keepName: true,
        destination: './tests/_BrowserTesting/src',
    });
});

gulp.task('browser-test-esm-main-min', () => {
    return js({
        entry: './src/main.mjs',
        format: 'esm',
        unminify: false,
        minify: true,
        keepName: true,
        destination: './tests/_BrowserTesting/src',
    });
});

gulp.task('browser-test-esm-html', () => {
    const scripts = [
        {
            src: '/vendor.js',
            isModule: false,
        },
        {
            src: '/tests.mjs',
            isModule: true,
        },
    ]
    return gulpFile('index.html', baseIndexHtml(scripts), { src: true })
    .pipe(gulp.dest('./tests/_BrowserTesting'));
});

gulp.task('browser-test-umd-html', () => {
    const scripts = [
        {
            src: '/vendor.js',
            isModule: false,
        },
        {
            src: '/tests.umd.js',
            isModule: false,
        },
    ]
    return gulpFile('index.html', baseIndexHtml(scripts), { src: true })
    .pipe(gulp.dest('./tests/_BrowserTesting'));
});

gulp.task('browser-test-umd-min-html', () => {
    const scripts = [
        {
            src: '/vendor.js',
            isModule: false,
        },
        {
            src: '/tests.umd.min.js',
            isModule: false,
        },
    ]
    return gulpFile('index.html', baseIndexHtml(scripts), { src: true })
    .pipe(gulp.dest('./tests/_BrowserTesting'));
});

gulp.task('browser-test-esm', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-vendor', 'browser-test-esm-TypeTests', 'browser-test-esm-testHelpers', 'browser-test-esm-tests', 'browser-test-esm-main', 'browser-test-esm-html'],
        end
    );
});

gulp.task('browser-test-umd', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-vendor', 'browser-test-umd-tests', 'browser-test-umd-html'],
        end
    );
});

gulp.task('browser-test-esm-min', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-vendor', 'browser-test-esm-TypeTests', 'browser-test-esm-testHelpers', 'browser-test-esm-tests', 'browser-test-esm-main-min', 'browser-test-esm-html'],
        end
    );
});

gulp.task('browser-test-umd-min', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-vendor', 'browser-test-umd-tests-min', 'browser-test-umd-min-html'],
        end
    );
});

const browserTestWatcher = (triggeredTaskName) => {
    return gulpWatch([
        './src/**/*.*',
        './tests/TypeTests/**/*.*',
        './tests/testHelpers.mjs',
        './tests/tests.mjs',
     ], { ignoreInitial: true }, () => {
        runSequence(
            [triggeredTaskName],
            () => {} // never ends
        );
    });
};

gulp.task('browser-test-esm-watcher', () => {
    return browserTestWatcher('browser-test-esm');
});

gulp.task('browser-test-esm-min-watcher', () => {
    return browserTestWatcher('browser-test-esm-min');
});

gulp.task('browser-test-umd-watcher', () => {
    return browserTestWatcher('browser-test-umd');
});

gulp.task('browser-test-umd-min-watcher', () => {
    return browserTestWatcher('browser-test-umd-min');
});

gulp.task('serve', () => {
    browserSync.init({
        files: ['./tests/_BrowserTesting/**/*.*'],
        reloadDebounce: 400,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: './tests/_BrowserTesting',
        },
        ghostMode: false,
        snippetOptions: {
            rule: {
                match: /(?:<\/body>)|$/i,
                fn: (snippet, match) => {
                    return '\n\n' + snippet + match;
                },
            },
        },
    });
});



gulp.task('browser-test-esm-watch', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-esm'],
        ['serve'],
        ['browser-test-esm-watcher'],
        end
    );
});

gulp.task('browser-test-umd-watch', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-umd'],
        ['serve'],
        ['browser-test-umd-watcher'],
        end
    );
});

gulp.task('browser-test-esm-min-watch', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-esm-min'],
        ['serve'],
        ['browser-test-esm-min-watcher'],
        end
    );
});

gulp.task('browser-test-umd-min-watch', (end) => {
    runSequence(
        ['clear'],
        ['browser-test-umd-min'],
        ['serve'],
        ['browser-test-umd-min-watcher'],
        end
    );
});

gulp.task('testBrowser', (end) => {
    runSequence(['browser-test-esm-watch'], end);
});



gulp.task('node-test-TypeTests', () => {
    const externalPaths = ['/src/main.mjs', '/tests/testHelpers.mjs'];
    const baseDirectory = fs.realpathSync('./');

    let stream = gulp.src('./tests/TypeTests/*.mjs');
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            {
                resolveId(importee) {
                    if (externalPaths.includes(importee)) {
                        return false;
                    }

                    if ((/^\//).test(importee)) {
                        return path.resolve(baseDirectory, importee.replace(/^\//, ''));
                    }

                    return importee;
                },
            },
        ],
    }, {
        output: {
            format: 'cjs'
        },
    }));
    stream = stream.on('error', onError);


    stream = stream.pipe(gulpModifyFile((content) => {
        // Ignore branching on generated commonjs interop code
        content = content.replace('function _interopDefault', '/* istanbul ignore next */ function _interopDefault')

        // Stupid hack because I can't figure out how to get Rollup to do what I want
        content = content.replace(/(require\(')[./]+tests\/(testHelpers)\.mjs/, '$1../$2.js');
        content = content.replace(/(require\(')[./]+src\/(main)\.mjs/, '$1../$2.js');
        return content;
    }));

    stream = stream.pipe(gulpRename({
        extname: '.js',
    }));

    stream = stream.pipe(gulp.dest('./tests/_NodeTesting/TypeTests'));

    return stream;
});

gulp.task('node-test-other', () => {
    const baseDirectory = fs.realpathSync('./');

    let stream = gulp.src(['./src/main.mjs', './tests/testHelpers.mjs']);
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            {
                resolveId(importee) {
                    if ((/^\//).test(importee)) {
                        return path.resolve(baseDirectory, importee.replace(/^\//, ''));
                    }

                    return importee;
                },
            },
        ],
    }, {
        output: {
            format: 'cjs'
        },
    }));
    stream = stream.on('error', onError);

    stream = stream.pipe(gulpRename({
        extname: '.js',
    }));

    stream = stream.pipe(gulp.dest('./tests/_NodeTesting'));

    return stream;
});

gulp.task('node-test-run', () => {
    return gulp.src(['./tests/_NodeTesting/TypeTests/*.js'])
    .pipe(gulpTape({
        bail: true,
        nyc: true,
    }))
    .on('error', onError);
});

gulp.task('test', (end) => {
    runSequence(
        ['clear'],
        ['node-test-TypeTests', 'node-test-other'],
        ['node-test-run'],
        ['clear'],
        end
    );
});



gulp.task('dev', (end) => {
    runSequence(['browser-test-esm'], end);
});



gulp.task('devWatch', (end) => {
    runSequence(['browser-test-esm-watch'], end);
});



gulp.task('js-esm-prod', () => {
    return js({
        entry: './src/main.mjs',
        format: 'esm',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('js-umd-prod', () => {
    return js({
        entry: './src/main.mjs',
        format: 'umd',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('prod', (end) => {
    runSequence(
        ['js-esm-prod', 'js-umd-prod'],
        end
    );
});
