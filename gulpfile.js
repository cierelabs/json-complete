const gulp = require('gulp');
const gulpTape = require('gulp-tape');

gulp.task('test', () => {
    return gulp.src(['./src/**/__tests__/*.js'])
    .pipe(gulpTape({
        bail: true,
        nyc: true,
    }))
    .on('error', function (error) {
        console.log(error.message);
        throw 'Testing Failed';
    });
});
