"use strict";

let gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    cssnano = require("gulp-cssnano"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    babel = require("gulp-babel"),
    watch = require("gulp-watch"),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    run = require("run-sequence"),
    newer = require('gulp-newer'),
    rimraf = require("rimraf"),
    csscomb = require('gulp-csscomb'),
    fontfacegen = require('fontfacegen'),
    map = require('map-stream'),
    browserSync = require('browser-sync').create();


/* Paths to source/build/watch files
=========================*/

let path = {
    build: {
        html: "build/",
        js: "build/assets/js/",
        css: "build/assets/css/",
        img: "build/assets/i/",
        fonts: "build/assets/fonts/",
        header: "build/assets/header/",
        libs: "build/assets/libs/",
        bootstrap: "build/assets/libs/bootstrap/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/assets/js/main.js",
        css: "src/assets/sass/style.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*",
        header: "src/assets/header/header.scss",
        libs: "src/assets/libs/**/*.*",
        bootstrap: "src/assets/libs/bootstrap/bootstrap.js"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*",
        header: "src/assets/header/**/*.scss",
        libs: "src/assets/libs/**/*.*"
    },
    clean: "./build"
};

/* Tasks
=========================*/

gulp.task('browser-sync', function(){

    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        notify: true
    });
});


gulp.task("html:build", function(){
    return gulp.src(path.src.html)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
});

gulp.task("libs:build", function(){
    return gulp.src(path.src.libs)
        .pipe(gulp.dest(path.build.libs))
        .pipe(browserSync.stream());
});

gulp.task("css:build", function(){
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(sourcemaps.write())
        .pipe(csscomb())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream())
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest(path.build.css));
});

gulp.task("header:build", function(){
    gulp.src(path.src.header)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(sourcemaps.write())
        .pipe(csscomb())
        .pipe(gulp.dest(path.build.header))
        .pipe(browserSync.stream())
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename("header.min.css"))
        .pipe(gulp.dest(path.build.header));
});

gulp.task("js:build", function(){
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("main.min.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

gulp.task("bootstrap:build", function(){
    gulp.src(path.src.bootstrap)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.bootstrap))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("bootstrap.min.js"))
        .pipe(gulp.dest(path.build.bootstrap))
        .pipe(browserSync.stream());
});

gulp.task("fonts:build", function(){
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('fontgen', function(){
    return gulp.src("src/assets/fonts/*.{ttf,otf}")
        .pipe(plumber())
        .pipe(map(function(file, cb){
            fontfacegen({
                source: file.path,
                dest: './src/assets/fonts/'
            });
            cb(null, file);
        }));
});

gulp.task("image:build", function(){
    gulp.src(path.src.img)
        .pipe(newer('build/img'))
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


gulp.task("clean", function(cb){
    rimraf(path.clean, cb);
});


gulp.task('build', function(cb){
    run(
        "clean",
        "html:build",
        "css:build",
        "header:build",
        "libs:build",
        "bootstrap:build",
        "js:build",
        "fonts:build",
        "image:build"
        , cb);
});


gulp.task("watch", function(){
    watch([path.watch.html], function(event, cb){
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb){
        gulp.start("css:build");
    });
    watch([path.watch.libs], function(event, cb){
        gulp.start("css:libs");
    });
    watch([path.watch.header], function(event, cb){
        gulp.start("header:build");
    });
    watch([path.watch.js], function(event, cb){
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb){
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb){
        gulp.start("fonts:build");
    });
});


gulp.task("default", function(cb){
    run(
        "clean",
        "build",
        "browser-sync",
        "watch"
        , cb);
});
