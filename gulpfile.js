const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpBetterRollup = require('gulp-better-rollup');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpUglify = require('gulp-uglify');
const gulpWatch = require('gulp-watch');
const path = require('path');
const rollup = require('rollup');
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');
const gulpBabelMinify = require('gulp-babel-minify');
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonjs = require('rollup-plugin-commonjs');
const readableStream = require('stream').Readable;
const gulpTerser = require('gulp-terser');

function onError(e) {
    console.error(e);
    this.emit('end');
}

gulp.task('clear', () => {
    return del([
        './dist/**/*.js',
        './dist/**/*.mjs',
        './_BrowserTesting/**/*.*',
    ]);
});

const js = (options) => {
    const format = options.format || 'esm';

    let stream = gulp.src(options.entry);
    stream = stream.pipe(gulpBetterRollup({
        plugins: [
            {
                resolveId(importee) {
                    // if (options.ignoreMain && /main.esm(?:.min)?.mjs$/.test(importee)) {
                    //     return false;
                    // }

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
                toplevel: format === 'esm',
                properties: {
                    regex: /simple|build|attachable|ignoreIndices|encodeValue|generateReference|key|index|pointer|value|parts|references|blobs|encoded|decoded|explore|indices|attachments/,
                    // debug: true,
                },
            },
            // output: {
            //     beautify: true,
            // },
        }));
        stream = stream.on('error', onError);

        stream = stream.pipe(gulpRename({
            suffix: '.min',
        }));

        stream = stream.pipe(gulp.dest(options.destination));
    }

    return stream;
};

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

gulp.task('js-test-browser-vendor', () => {
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
    .pipe(gulp.dest('./_BrowserTesting'));
});

gulp.task('js-test-browser-main', () => {
    return js({
        entry: './src/main.mjs',
        format: 'umd',
        unminify: true,
        minify: false,
        destination: './_BrowserTesting',
    });
});

gulp.task('js-test-browser-tests', () => {
    return js({
        entry: './src/BrowserTesting/tests.mjs',
        // ignoreMain: true,
        format: 'umd',
        unminify: true,
        minify: false,
        destination: './_BrowserTesting',
    });
});

gulp.task('html-test-browser', () => {
    return gulp.src(['./src/BrowserTesting/index.html'])
    .pipe(gulp.dest('./_BrowserTesting/'))
});

gulp.task('test', () => {
    return gulp.src(['./src/**/__tests__/*.js'])
    .pipe(gulpTape({
        bail: true,
        nyc: true,
    }))
    .on('error', function(error) {
        console.log(error.message);
        throw 'Testing Failed';
    });
});

gulp.task('serve', () => {
    browserSync.init({
        files: ['./_BrowserTesting/**/*.*'],
        reloadDebounce: 400,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: './_BrowserTesting/',
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

gulp.task('dev', (end) => {
    runSequence(
        ['clear'],
        ['js-test-browser-vendor', /*'js-test-browser-main',*/ 'js-test-browser-tests', 'html-test-browser'],
        end
    );
});

gulp.task('devWatcher', () => {
    return gulpWatch('./src/**/*.*', { ignoreInitial: true }, () => {
        runSequence(
            ['js-test-browser-vendor', /*'js-test-browser-main',*/ 'js-test-browser-tests', 'html-test-browser'],
            () => {} // never ends
        );
    });
});

gulp.task('devWatch', () => {
    runSequence(
        ['clear'],
        ['dev'],
        ['serve'],
        ['devWatcher'],
        () => {} // never ends
    );
});

gulp.task('prod', (end) => {
    runSequence(
        ['clear'],
        ['js-esm-prod', 'js-umd-prod'],
        end
    );
});
