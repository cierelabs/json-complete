const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpBrotli = require('gulp-brotli');
const gulpGzip = require('gulp-gzip');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpTerser = require('gulp-terser');
const gulpZopfliGreen = require('gulp-zopfli-green');
const path = require('path');
const rollup = require('rollup');
const rollupPluginRootImport = require('rollup-plugin-root-import');
const rollupStream = require('rollup-stream');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

const browserOutputFiles = './_testing/browser/**/*';
const browserOutputPath = './_testing/browser';
const browserWatchFiles = './src/**/*.*';
const compressionPath = './_testing/compression';
const distFiles = './dist/**/*';
const distMinFiles = './dist/*.min.js';
const distPath = './dist';
const libraryEntry = './src/main.js';
const nodeOutputFiles = './_testing/node/tests/FeatureTests/*.js';
const nodeOutputPath = './_testing/node/tests';
const rootJavascriptFiles = './src/**/*.js';
const rootPath = './src';
const testEntry = './src/tests/tests.js';
const testOutputPath = './_testing/node';
const testPage = './src/tests/browser-tester.html';
const testSourceFiles = './src/tests/**/*.js';

function onError(e) {
    console.error(e); // eslint-disable-line no-console
    this.emit('end');
}

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

    let stream = rollupStream({
        input: options.entry,
        plugins: [
            rollupPluginRootImport({
                root: rootPath,
            }),
        ],
        rollup: rollup,
        output: {
            format: options.format,
        },
    });
    stream = stream.on('error', onError);
    stream = stream.pipe(vinylSourceStream(options.filename));
    stream = stream.pipe(vinylBuffer());

    stream = stream.pipe(gulpRename({
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
                    regex: /_\w+/, // Compress all properties that start with _
                },
            },
            compress: {
                inline: true,
            },
            output: {
                preamble: '/* @license BSL-1.0 https://git.io/fpQEc */',
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
        browserOutputFiles,
    ]);
});

gulp.task('test-browser-js-tests', () => {
    var b = browserify({
        entries: testEntry,
        debug: false,
    });
    b.transform('babelify', {
        plugins: [
            ['module-resolver', { root: [rootPath] }],
            'babel-plugin-transform-esm-to-cjs',
        ],
    });

    let stream = b.bundle();
    stream = stream.on('error', onError);
    stream = stream.pipe(vinylSourceStream('tests.js'));
    stream = stream.pipe(vinylBuffer());
    stream = stream.on('error', onError);
    stream = babelModern(stream);
    stream = stream.pipe(gulp.dest(browserOutputPath));

    return stream;
});

gulp.task('test-browser-html', () => {
    return gulp.src(testPage)
        .pipe(gulpRename({
            basename: 'index',
        }))
        .pipe(gulp.dest(browserOutputPath));
});

gulp.task('test-browser-builder', gulp.parallel('test-browser-js-tests', 'test-browser-html'));

gulp.task('test-serve', () => {
    browserSync.init({
        files: [browserOutputFiles],
        reloadDebounce: 1000,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: browserOutputPath,
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

    gulp.watch(browserWatchFiles, gulp.series('test-browser-builder')).on('change', browserSync.reload);
});

gulp.task('test-browser', gulp.series(
    'clear-browser',
    'test-browser-builder',
    'test-serve',
));



gulp.task('clear-node', () => {
    return del([
        testOutputPath,
    ]);
});

gulp.task('test-node-js-library', () => {
    return gulp.src([rootJavascriptFiles, `!${testSourceFiles}`])
        .pipe(gulpBabel({
            plugins: [
                ['module-resolver', { root: [rootPath] }],
                'babel-plugin-transform-esm-to-cjs'
            ],
        }))
        .pipe(gulp.dest(testOutputPath));
});

gulp.task('test-node-js-test', () => {
    return gulp.src([testSourceFiles])
        .pipe(gulpBabel({
            plugins: [
                ['module-resolver', { root: [rootPath] }],
            ],
        }))
        .pipe(gulp.dest(nodeOutputPath));
});

gulp.task('test-node', () => {
    return gulp.src([nodeOutputFiles])
        .pipe(gulpTape({
            bail: true,
            nyc: true,
        }))
        .on('error', onError);
});

gulp.task('test', gulp.series(
    'clear-node',
    gulp.parallel('test-node-js-library', 'test-node-js-test'),
    'test-node',
    'clear-node'
));



gulp.task('clear-compression', () => {
    return del([
        compressionPath,
    ]);
});

gulp.task('compress-gzip', () => {
    return gulp.src(distMinFiles)
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpGzip({
            extension: 'zip',
        }))
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-zopfli', () => {
    return gulp.src(distMinFiles)
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpZopfliGreen())
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-brotli', () => {
    return gulp.src(distMinFiles)
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

gulp.task('compression-report', gulp.series(
    'clear-compression',
    gulp.parallel('compress-gzip', 'compress-zopfli', 'compress-brotli'),
    'compress-calculate',
    'clear-compression'
));



gulp.task('clear-dist', () => {
    return del([
        distFiles,
    ]);
});

gulp.task('prod-esm', () => {
    return js({
        entry: libraryEntry,
        filename: 'json_complete.js',
        format: 'esm',
        unminify: true,
        minify: true,
        destination: distPath,
    });
});

gulp.task('prod-cjs', () => {
    return js({
        entry: libraryEntry,
        filename: 'json_complete.js',
        format: 'cjs',
        unminify: true,
        minify: true,
        destination: distPath,
    });
});

gulp.task('prod', gulp.series(
    'clear-dist',
    gulp.parallel('prod-esm', 'prod-cjs'),
    'compression-report'
));
