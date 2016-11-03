const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

gulp.task('default', function() {
   gulp.src('img/*')
      .pipe(imagemin())
      .pipe(gulp.dest('img'))
});