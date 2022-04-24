const gulp = require("gulp");
const browserSync = require('browser-sync').create();
const browserify = require("browserify");
const watchify = require("watchify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const fancy_log = require("fancy-log");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");
const stripDebug = require('gulp-strip-debug');

const folder = {
    dist: "dist",
    src: "src",
    lib: "/bibliotheques",
    css: "/styles",
    rsc: "/ressources",
    js: "/scripts"
}

const copy_html= function () {
    return gulp.src(folder.src+"/*.html").pipe(gulp.dest(folder.dist));
}

const copy_library=function () {
    return gulp.src(folder.src+ folder.lib+"/**")
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(folder.dist+ folder.lib));
}

const copy_styles= function () {
    return gulp.src(folder.src+folder.css+"/**").pipe(gulp.dest(folder.dist+ folder.css));
}

const copy_rsc = function () {
    return gulp.src(folder.src+folder.rsc+"/**").pipe(gulp.dest(folder.dist+ folder.rsc));
}

const watchedBrowserify = watchify(
    browserify({
        basedir: ".",
        debug: true,
        entries: ["src/scripts/main.ts"],
        cache: {},
        packageCache: {},
    }).plugin(tsify)
);

const copy_ts = function () {
    return watchedBrowserify
        .bundle()
        .on("error", fancy_log)
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(folder.dist+folder.js));
}


const copy_ts_prod = function () {
    return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(buffer)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(stripDebug)
    .pipe(uglify)
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(folder.dist+folder.js));
}

const watch = function() {

    // image changes
    gulp.watch(folder.src + folder.rsc+'/**/*', copy_rsc);

    // html changes
    gulp.watch(folder.src + '/**/*.html', copy_html);

    // library changes
    gulp.watch(folder.src + folder.lib+'/**/*', gulp.parallel(copy_library));

    // css changes
    gulp.watch(folder.src + +folder.css+'/**/*', gulp.parallel(copy_styles));

};

const server = function () {
    //Lancement du serveur
    browserSync.init({
        port: 3000,
        server: "./dist/",
        ghostMode: false,
        notify: false,
        //chrome pour PC et google chrome pour MAC
        browser: ["chrome"]
        //browser: ["opera"]
        //browser: ["firefox", "google chrome"]
    });

    //Vérification si quelque chose change et recharge la page
    gulp.watch('**/*.css').on('change', browserSync.reload);
    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('**/*.js').on('change', browserSync.reload);

};
gulp.task("typescript", copy_ts);
gulp.task("typescript_prod", copy_ts_prod);
gulp.task("execute", gulp.parallel(copy_html, copy_rsc, "typescript", copy_styles, copy_library));
gulp.task("default", gulp.series("execute", gulp.parallel(watch, server)));
watchedBrowserify.on("update", gulp.series(copy_ts));
watchedBrowserify.on("log", fancy_log);

