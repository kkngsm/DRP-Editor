/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { watch, task, src, dest } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const pug = require("gulp-pug");
const typescript = require("gulp-typescript");
const tsProject = typescript.createProject("tsconfig.json");
//setting : paths
const paths = {
  root: "./dist/",
  pug: "./src/pug/*.pug",
  html: "./dist/",
  cssSrc: "./src/sass/*.sass",
  cssDist: "./dist/css/",
  tsSrc: "./src/ts/*.ts",
  jsDist: "./dist/js/",
  imgSrc: "./src/img/",
  imgDist: "./dist/img/",
};

//Sass
task("sass", (done) => {
  src(paths.cssSrc)
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(dest(paths.cssDist));
  done();
});

//Pug
task("pug", (done) => {
  src(paths.pug)
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(dest(paths.html));
  done();
});

//js
task("ts", () => {
  const tsResult = src(paths.tsSrc).pipe(tsProject());
  return tsResult.js.pipe(dest(paths.jsDist));
});

//img
task("img", (done) => {
  src(paths.imgSrc).pipe(dest(paths.imgDist));
  done();
});

task("watch", () => {
  task("img");
  watch(paths.pug, task("pug"));
  watch(paths.cssSrc, task("sass"));
  watch(paths.tsSrc, task("ts"));
});

task("default", task("watch"));
