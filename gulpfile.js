'use strict';

// Requiring the dependencies.
var
    gulp = require('gulp'),
    sass = require('gulp-sass');

    // Setting up sass compiler.
sass.compiler = require('node-sass');

// The task responsible on compiling sass.
gulp.task('sass', function () {
    return gulp.src('./sass/main.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});
