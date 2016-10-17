import gulp from 'gulp';
import uncache from 'gulp-uncache';

gulp.task('default', () => {
});

/**
 * Prepares HtmlFile with Anticache
 */
gulp.task('uncache', () => {
    gulp.src('./build/index.html')
        .pipe(uncache())
        .pipe(gulp.dest('./build'))
});