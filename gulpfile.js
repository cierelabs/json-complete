const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpBetterRollup = require('gulp-better-rollup');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpTerser = require('gulp-terser');
const gulpWatch = require('gulp-watch');
const path = require('path');
const rollupPluginRootImport = require('rollup-plugin-root-import');
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

function onError(e) {
    console.error(e); // eslint-disable-line no-console
    this.emit('end');
}

const rollupJs = (stream, format) => {
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            rollupPluginRootImport({
                root: './src',
            }),
        ],
    }, {
        format: format,
    }));
    stream = stream.on('error', onError);

    return stream;
};

const babelModern = (stream) => {
    stream = stream.pipe(gulpBabel({
        presets: [
            ['@babel/env', {
                targets: {
                    browsers: [
                        '> 0.2%, ie >= 9, not ie <= 8, not op_mini all',
                    ],
                },
                loose: true, // Safe because typeof x === 'object' will never be called relative to a Symbol
            }],
        ],
    }));
    stream = stream.on('error', onError);

    return stream;
};

const js = (options) => {
    const format = options.format || 'esm';

    let stream = gulp.src(options.entry);
    stream = rollupJs(stream, format);

    stream = stream.pipe(gulpRename({
        basename: options.filename,
        suffix: `.${options.format}`,
    }));

    if (format !== 'esm') {
        stream = babelModern(stream);
    }

    if (options.unminify) {
        stream = stream.pipe(gulp.dest(options.destination));
    }

    if (options.minify) {
        stream = stream.pipe(gulpTerser({
            mangle: {
                toplevel: true,
                properties: {
                    regex: /_\w+/,
                },
            },
            compress: {
                inline: true,
            },
        }));

        stream = stream.on('error', onError);

        stream = stream.pipe(gulpRename({
            suffix: '.min',
        }));

        stream = stream.pipe(gulp.dest(options.destination));
    }

    return stream;
};



gulp.task('clear-browser', () => {
    return del([
        './_testing/browser/**/*',
    ]);
});

gulp.task('test-browser-js-tests', () => {
    var b = browserify({
        entries: './src/tests/tests.js',
        debug: false,
    });
    b.transform('babelify', {
        plugins: [
            ['module-resolver', { root: ['./src'] }],
            'babel-plugin-transform-esm-to-cjs',
        ],
    });

    let stream = b.bundle();
    stream = stream.on('error', onError);
    stream = stream.pipe(vinylSourceStream('tests.js'));
    stream = stream.pipe(vinylBuffer());
    stream = stream.on('error', onError);
    stream = babelModern(stream);
    stream = stream.pipe(gulp.dest('./_testing/browser'));

    return stream;
});

gulp.task('test-browser-html', () => {
    return gulp.src('./src/tests/browser-tester.html')
        .pipe(gulpRename({
            basename: 'index',
        }))
        .pipe(gulp.dest('./_testing/browser'));
});

gulp.task('test-browser-builder', (end) => {
    runSequence(
        ['test-browser-js-tests', 'test-browser-html'],
        end
    );
});

gulp.task('test-browser-watcher', () => {
    return gulpWatch([
        './src/**/*.*',
    ], { ignoreInitial: true }, () => {
        runSequence(
            ['test-browser-builder'],
            () => {} // never ends
        );
    });
});

gulp.task('test-serve', () => {
    browserSync.init({
        files: ['./_testing/browser/**/*.*'],
        reloadDebounce: 400,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: './_testing/browser',
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

gulp.task('test-browser', (end) => {
    runSequence(
        ['clear-browser'],
        ['test-browser-builder'],
        ['test-serve'],
        ['test-browser-watcher'],
        end
    );
});



gulp.task('clear-node', () => {
    return del([
        './_testing/node',
    ]);
});

gulp.task('test-node-js-library', () => {
    return gulp.src(['./src/**/*.js', '!./src/tests/**/*.js'])
        .pipe(gulpBabel({
            plugins: [
                ['module-resolver', { root: ['./src'] }],
                'babel-plugin-transform-esm-to-cjs'
            ],
        }))
        .pipe(gulp.dest('./_testing/node'));
});

gulp.task('test-node-js-test', () => {
    return gulp.src(['./src/tests/**/*.js'])
        .pipe(gulpBabel({
            plugins: [
                ['module-resolver', { root: ['./src'] }],
            ],
        }))
        .pipe(gulp.dest('./_testing/node/tests'));
});

gulp.task('test-node', () => {
    return gulp.src(['./_testing/node/tests/FeatureTests/*.js'])
        .pipe(gulpTape({
            bail: true,
            nyc: true,
        }))
        .on('error', onError);
});

gulp.task('test', (end) => {
    runSequence(
        ['clear-node'],
        ['test-node-js-library', 'test-node-js-test'],
        ['test-node'],
        ['clear-node'],
        end
    );
});



gulp.task('clear-dist', () => {
    return del([
        './dist/**/*',
    ]);
});

gulp.task('prod-esm', () => {
    return js({
        entry: './src/main.js',
        filename: 'json_complete',
        format: 'esm',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('prod-cjs', () => {
    return js({
        entry: './src/main.js',
        filename: 'json_complete',
        format: 'cjs',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('prod', (end) => {
    runSequence(
        ['clear-dist'],
        ['prod-esm', 'prod-cjs'],
        end
    );
});

const gulpGzip = require('gulp-gzip');
const gulpZopfliGreen = require('gulp-zopfli-green');
const gulpBrotli = require('gulp-brotli');

const compressionPath = './_testing/compression';

gulp.task('clear-compression', () => {
    return del([
        compressionPath,
    ]);
});

gulp.task('compress-gzip', () => {
    return gulp.src('./dist/*.min.js')
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpGzip({
            extension: 'zip',
        }))
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-zopfli', () => {
    return gulp.src('./dist/*.min.js')
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpZopfliGreen())
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-brotli', () => {
    return gulp.src('./dist/*.min.js')
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpBrotli.compress())
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-calculate', (end) => {
    const onEnd = (manifest) => {
        const extensionToCompression = {
            js: 'base',
            zip: 'gzip',
            gz: 'zopfli',
            br: 'brotli',
        };

        // Convert data to usable form
        const types = {};
        Object.keys(manifest).forEach((file) => {
            const type = file.replace(/^[^.]+\.|\.min.+$/g, '');
            types[type] = types[type] || {};

            types[type][extensionToCompression[file.match(/\.(.{1,4})$/)[1]]] = manifest[file];
        });

        // Convert data to displayable form
        const esmBaseSize = types.esm.base;
        const cjsBaseSize = types.cjs.base;



        const table = `
| Compression | ES Module  | CommonJS |
|-------------|------------|----------|
| Minified    | ${esmBaseSize} bytes | ${cjsBaseSize} bytes |
| gzip        | ${types.esm.gzip} bytes | ${types.cjs.gzip} bytes |
| zopfli      | ${types.esm.zopfli} bytes | ${types.cjs.zopfli} bytes |
| brotli      | ${types.esm.brotli} bytes | ${types.cjs.brotli} bytes |
`;

        console.log(table); // eslint-disable-line no-console

        end();
    };

    fs.readdir(compressionPath, (err, files) => {
        let fileCount = files.length;

        const manifest = {};

        files.forEach((file) => {
            fs.stat(path.join(compressionPath, file), (err, stats) => {
                manifest[file] = stats.size;
                fileCount -= 1;

                if (fileCount === 0) {
                    onEnd(manifest);
                }
            });
        });
    });
});

gulp.task('compression-report', (end) => {
    runSequence(
        ['clear-compression'],
        ['compress-gzip', 'compress-zopfli', 'compress-brotli'],
        ['compress-calculate'],
        ['clear-compression'],
        end
    );
});
