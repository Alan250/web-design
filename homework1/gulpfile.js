'use strict';

const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const cssnano = require('gulp-cssnano');
const cache = require('gulp-cache');
const changed = require('gulp-changed');
const cmq = require('gulp-group-css-media-queries');

const BrowserSync = () => {
  return browserSync({
    server: {
      baseDir: './'
    },
    notify: false,
    open: false
  });
};

exports.browser_sync = BrowserSync;

// Pug

const log = error => {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    '',
  ].join('\n'));
  // this.end();
}

const Pug = () => {
  return src([
    'html/**/*.pug',
    '!html/partials/**/*.pug',
    '!html/layouts/**/*.pug'
  ])
    .pipe(pug({
      pretty: true,
      basedir: '/',
    }).on('error', log))
    .pipe(dest('./'))
    .pipe(notify('Pug successfully compiled'))
    .pipe(browserSync.reload({ stream: true }));
};

exports.pug = Pug;

//Compiling scss

const styles = () => {
  return src('css/main.sass')
    .pipe(sass({
      includePaths: [
        require('node-bourbon').includePaths,
        require('node-normalize-scss').includePaths
      ],
    }).on('error', log))
    .pipe(changed('css', { extension: '.css' }))
    .pipe(rename({ basename: 'main' }))
    .pipe(autoprefixer({
      browsers: ['last 15 versions','>1%', 'safari 5', 'ie 7', 'ie 8'],
      cascade: false,
    }))
    .pipe(cmq())
    .pipe(cssnano())
    .pipe(dest('css'))
    .pipe(notify('SASS successfully compiled'))
    .pipe(browserSync.reload({ stream: true }));
};

exports.styles = styles;

// Gulp watcher

const watcher = () => {
  watch(
    'html/**/*.pug',
    parallel(Pug)
  );
  watch(
    [
      'css/**/*.sass',
      'css/**/*.scss',
    ],
    parallel(styles),
  );
};

exports.watcher = watcher;

exports.clear = () => {
  return cache.clearAll();
};

exports.default = parallel(
  watcher,
  BrowserSync,
  Pug,
  styles,
  // js,
  // img,
  // fonts,
);