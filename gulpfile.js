const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpUglify = require('gulp-uglify');
const gulpWatch = require('gulp-watch');
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

function onError(e) {
    console.error(e);
    this.emit('end');
}

gulp.task('clear', () => {
    return del([
        './dist/**/*.js',
        './_BrowserTesting/**/*.*',
    ]);
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

gulp.task('browser-test-js', () => {
    const b = browserify({
        entries: './src/BrowserTesting/tests.js',
        paths: ['./node_modules','./'],
        plugin: [
            ['bundle-collapser/plugin'],
        ],
        debug: true,
    });

    return b.bundle()
        .on('error', onError)
        .pipe(vinylSourceStream('tests.js'))
        .on('error', onError)
        .pipe(vinylBuffer())
        .on('error', onError)
        // .pipe(gulpBabel({
        //     presets: ['@babel/env'],
        // }))
        // .on('error', onError)
        // .pipe(gulpUglify())
        .pipe(gulp.dest('./_BrowserTesting/'));
});

gulp.task('browser-test-html', () => {
    return gulp.src(['./src/BrowserTesting/index.html'])
        .pipe(gulp.dest('./_BrowserTesting/'))
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
        ['browser-test-js', 'browser-test-html'],
        end
    );
});

gulp.task('devWatcher', () => {
    return gulpWatch('./src/**/*.*', { ignoreInitial: true }, () => {
        runSequence(
            ['browser-test-js', 'browser-test-html'],
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

gulp.task('prod', ['clear'], () => {
    const b = browserify({
        entries: './src/main.js',
        paths: ['./node_modules','./'],
        plugin: [
            ['bundle-collapser/plugin'],
        ],
        debug: false,
    });

    let stream = b.bundle()
        .on('error', onError)
        .pipe(vinylSourceStream('main.js'))
        .on('error', onError)
        .pipe(vinylBuffer())
        .on('error', onError)
        .pipe(gulpBabel({
            presets: ['@babel/env'],
        }));

    stream = stream.pipe(gulp.dest('./dist/'));

    stream = stream.pipe(gulpUglify());
    stream = stream.pipe(gulpRename({
        suffix: ".min",
    }));

    stream = stream.pipe(gulp.dest('./dist/'));
});
