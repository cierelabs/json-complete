const browserSync = require('browser-sync');
const gulp = require('gulp');

gulp.task('serve', () => {
    browserSync.init({
        files: ['./src/**/*.*'],
        reloadDebounce: 400,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: './src',
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
