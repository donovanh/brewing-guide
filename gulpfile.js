var gulp = require("gulp"),
    browserSync = require("browser-sync"),
    changed = require("gulp-changed"),
    size = require("gulp-size"),
    sorting = require("postcss-sorting"),
    clean = require("gulp-clean");

gulp.dest(function(file){
  return path.join(build_dir, path.dirname(file.path));
});

gulp.task("clean", function () {
  return gulp.src('./public', {read: false})
    .pipe(clean());
});

gulp.task("html", function() {
  return gulp.src(["./src/*.html", "./src/**/*.html"])
    .pipe(gulp.dest("public/"));
});

gulp.task("javascript", function() {
  return gulp.src(["./src/*.html", "./src/**/*.html"])
    .pipe(gulp.dest("public/"));
});

gulp.task("images", function() {
  return gulp.src(["./src/**/*.jpg", "./src/**/*.png", "./src/**/*.gif", "./src/**/*.svg"])
    .pipe(gulp.dest("public/"));
});

gulp.task("zips", function() {
  return gulp.src(["./src/**/*.zip"])
    .pipe(gulp.dest("public/"));
});

gulp.task("fonts", function() {
  return gulp.src(["./src/fonts/*"])
    .pipe(gulp.dest("public/fonts/"));
});

gulp.task("video", function() {
  return gulp.src(["./src/**/*.mp4", "./src/**/*.webm"])
    .pipe(gulp.dest("public/"));
});

gulp.task("css", function () {
    var postcss    = require("gulp-postcss");
    //var sourcemaps = require("gulp-sourcemaps");

    return gulp.src("src/**/*.css")
      //.pipe( sourcemaps.init() )
      .pipe( postcss([
        sorting({ "sort-order": "alphabetical" }),
        require("autoprefixer"),
        require("postcss-nested"),
        require("precss"),
        require('postcss-partial-import')(),
        require('postcss-css-variables')
      ]) )
      //.pipe( sourcemaps.write(".") )
      .pipe( gulp.dest("public/") );
});

gulp.task("js", function() {
  return gulp.src(["./src/*.js", "./src/**/*.js"])
    .pipe(gulp.dest("public/"));
});

gulp.task("browser-sync", ["html","css","js"], function() {
  browserSync({
    server: {
      baseDir: "./public/",
      injectChanges: true,
      files: ["./public/**/*"],
    }
  });
});

gulp.task("watch", function() {
  // Watch .html files
  gulp.watch("src/*.html", ["html", browserSync.reload]);
  gulp.watch("src/**/*.html", ["html", browserSync.reload]);
  gulp.watch("src/**/*.css", ["css", browserSync.reload]);
  gulp.watch("src/**/*.js", ["js", browserSync.reload]);
  gulp.watch("src/**/*.jpg", ["images", browserSync.reload]);
  gulp.watch("src/**/*.png", ["images", browserSync.reload]);
  gulp.watch("src/**/*.svg", ["images", browserSync.reload]);
  gulp.watch("src/**/*.gif", ["images", browserSync.reload]);
  gulp.watch("src/**/*.zip", ["zips"]);
  gulp.watch("src/**/*.mp4", ["video"]);
  gulp.watch("src/**/*.webm", ["video"]);
});

gulp.task("default", ["html","js","css","images","fonts","browser-sync","zips","video","watch"]);
