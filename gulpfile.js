const browserify = require('browserify');
const browserSync = require('browser-sync');
const gulp = require('gulp');
const gulpTape = require('gulp-tape');
const gulpWatch = require('gulp-watch');
const runSequence = require('run-sequence');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

function onError(e) {
    console.error(e);
    this.emit('end');
}

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
        debug: true,
    });

    return b.bundle()
        .on('error', onError)
        .pipe(vinylSourceStream('tests.js'))
        .on('error', onError)
        .pipe(vinylBuffer())
        .on('error', onError)
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
        ['browser-test-js', 'browser-test-html'],
        end
    );
});

gulp.task('devWatcher', function () {
    return gulpWatch('./src/**/*.*', { ignoreInitial: true }, () => {
        runSequence(
            ['dev'],
            () => {} // never ends
        );
    });
});

gulp.task('devWatch', function () {
    runSequence(
        ['dev'],
        ['serve'],
        ['devWatcher'],
        () => {} // never ends
    );
});
