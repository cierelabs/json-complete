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
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');
const rollupPluginRootImport = require('rollup-plugin-root-import');

function onError(e) {
    console.error(e); // eslint-disable-line no-console
    this.emit('end');
}

gulp.task('clear-browser', () => {
    return del([
        './_testing/browser/**/*',
    ]);
});

gulp.task('test-browser-js', () => {
    var b = browserify({
        entries: './src/tests/tests.js',
        debug: false,
    });
    b.transform('babelify', {
        plugins: [
            ['module-resolver', { root: ['./src'] }],
            'babel-plugin-transform-esm-to-cjs'
        ],
    });

    return b.bundle()
        .on('error', onError)
        .pipe(vinylSourceStream('tests.js'))
        .pipe(vinylBuffer())
        .on('error', onError)
        .pipe(gulp.dest('./_testing/browser'));
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
        ['test-browser-js', 'test-browser-html'],
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

gulp.task('test-node-library-js', () => {
    return gulp.src(['./src/**/*.js', '!./src/tests/**/*.js'])
        .pipe(gulpBabel({
            plugins: [
                ['module-resolver', { root: ['./src'] }],
                'babel-plugin-transform-esm-to-cjs'
            ],
        }))
        .pipe(gulp.dest('./_testing/node'));
});

gulp.task('test-node-test-js', () => {
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
        ['test-node-library-js', 'test-node-test-js'],
        ['test-node'],
        ['clear-node'],
        end
    );
});



const js = (options) => {
    const format = options.format || 'esm';

    let stream = gulp.src(options.entry);
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            rollupPluginRootImport({
                root: './src',
            }),
        ],
    }, {
        format: format,
        name: 'json-complete',
    }));
    stream = stream.on('error', onError);

    stream = stream.pipe(gulpRename({
        suffix: `.${format}`,
    }));

    if (format !== 'esm') {
        stream = stream.pipe(gulpBabel({
            presets: ['@babel/env'],
        }));
        stream = stream.on('error', onError);
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

gulp.task('prod-esm', () => {
    return js({
        entry: './src/main.js',
        format: 'esm',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('prod-cjs', () => {
    return js({
        entry: './src/main.js',
        format: 'cjs',
        unminify: true,
        minify: true,
        destination: './dist',
    });
});

gulp.task('prod', (end) => {
    runSequence(
        ['prod-esm', 'prod-cjs'],
        end
    );
});

const gulpGzip = require('gulp-gzip');
const gulpZopfli = require('gulp-zopfli');
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
        .pipe(gulpZopfli())
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-brotli', () => {
    return gulp.src('./dist/*.min.js')
        .pipe(gulp.dest(compressionPath))
        .pipe(gulpBrotli.compress())
        .pipe(gulp.dest(compressionPath));
});

gulp.task('compress-calculate', (end) => {
    const percentOf = (base, compressed) => {
        return Math.round(compressed / base * 100);
    };

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
| Compression | ES Modules | CommonJS |
|-------------|------------|----------|
| Minified    | ${esmBaseSize} bytes ![](http://progressed.io/bar/100) | ${cjsBaseSize} bytes ![](http://progressed.io/bar/100) |
| gzip        | ${types.esm.gzip} bytes ![](http://progressed.io/bar/${percentOf(esmBaseSize, types.esm.gzip)}) | ${types.cjs.gzip} bytes ![](http://progressed.io/bar/${percentOf(cjsBaseSize, types.cjs.gzip)}) |
| zopfli      | ${types.esm.zopfli} bytes ![](http://progressed.io/bar/${percentOf(esmBaseSize, types.esm.zopfli)}) | ${types.cjs.zopfli} bytes ![](http://progressed.io/bar/${percentOf(cjsBaseSize, types.cjs.zopfli)}) |
| brotli      | ${types.esm.brotli} bytes ![](http://progressed.io/bar/${percentOf(esmBaseSize, types.esm.brotli)}) | ${types.cjs.brotli} bytes ![](http://progressed.io/bar/${percentOf(cjsBaseSize, types.cjs.brotli)}) |
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
