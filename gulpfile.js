var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mergeStream = require('merge-stream');
var cleanCSS = require('gulp-clean-css');

var cssPath = './src/main/resources/css/wemga';
var javascriptPath = './src/main/resources/javascript/wemga';
var jsFileDestination = './src/main/resources/javascript/wemga/dist';
var cssFileDestination = './src/main/resources/css/wemga/dist';

gulp.task('default', ['concat']);

gulp.task('clean', function() {
    return del([
        './src/main/resources/javascript/wemga/dist',
        './src/main/resources/css/wemga/dist'
    ]);
});

gulp.task('concat', ['concatVendor'],function() {
    return gulp.src([
        javascriptPath+'/settings/**/*.js'
    ]).pipe(concat('wemgaApp.js')).pipe(gulp.dest(jsFileDestination))
});

gulp.task('concatVendor', ['clean'], function() {
    var stream = mergeStream();
    stream.add(gulp.src([
        // Generic libs
        './node_modules/underscore/underscore.js',

        // angular libs
        './node_modules/angular/angular.js',
        './node_modules/angular-aria/angular-aria.js',
        './node_modules/angular-animate/angular-animate.js',
        './node_modules/angular-messages/angular-messages.js',
        './node_modules/angular-material/angular-material.js'
    ])
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('wemgaVendor.js'))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(jsFileDestination)));

    stream.add(
        gulp.src([
            './node_modules/angular-material/angular-material.min.css'
        ]).pipe(gulp.dest(cssFileDestination))
    );

    stream.add(
        gulp.src([
            cssPath + '/vendor/**/*.css'])
            .pipe(concat('wemga.css'))
            .pipe(gulp.dest(cssFileDestination))
    );

    stream.add(
        gulp.src([
            cssPath + '/vendor/fonts/*'])
            .pipe(gulp.dest(cssFileDestination + '/fonts'))
    );

    return stream;
})
