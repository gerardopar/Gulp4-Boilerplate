// importing required modules
const { dest, parallel, src, series, task, watch } = require('gulp'); // gulp
var autoprefixer = require( 'gulp-autoprefixer' ); // gulp-autoprefixer
var imagemin = require('gulp-imagemin'); // gulp-imagemin
var rename = require( 'gulp-rename' ); // gulp-rename
var sass = require( 'gulp-sass' ); // gulp-sass
var sourcemaps = require( 'gulp-sourcemaps' ); // gulp source-maps
var uglify = require( 'gulp-uglify' ); // uglify
var babelify = require( 'babelify' ); // babel
var browserify = require( 'browserify' ); // browserify
var buffer = require( 'vinyl-buffer' ); // vinyl-buffer
var source = require( 'vinyl-source-stream' ); // vinyl-source-stream
var browserSync = require( 'browser-sync' ).create(); // browserSynce (server)

function browser_sync() {
  browserSync.init({ // enables localhost server
      server: {
          baseDir: './dest/'
      }
  });
}

function reload(done){ // enables auto-reload
  browserSync.reload();
  done();
}

function css(done) {
  // compile sass
  src( 'src/styles/main.sass' ) // main.sass (src path)
      .pipe( sourcemaps.init() ) // initialize sourcemaps
      .pipe( sass({ outputStyle: 'compressed' }) ) // sass options
      .on('error', sass.logError) // sass error logs
      .pipe( autoprefixer({ cascade: false }) ) // auto prefix styles
      .pipe( rename({ suffix: '.min' }) ) // rename output file with min suffix
      .pipe( sourcemaps.write( './' ) ) // output sourcemaps
      .pipe( dest( './dest/styles/' ) ) // main.min.css (dest path)
      .pipe( browserSync.stream() ); // browserSync
      done(); // cb, task is done
}

function js(done) {
    // compile javascript
      browserify({ // browserify (modules)
        entries: 'src/scripts/main.js', // main.js (src path)
        debug: true
      })
      .transform(babelify, { presets: ['@babel/preset-env']}) // transform js
      .bundle() // bundle js code
      .pipe( source('main.js') ) // main.js (src path)
      .pipe( rename({ suffix: '.min' }) ) // rename output file with min suffix
      .pipe( buffer() ) 
      .pipe( sourcemaps.init({ loadMaps: true }) ) // initialize sourcemaps
      .pipe( uglify() ) // compress js code
      .pipe( sourcemaps.write( './' ) ) // output sourcemaps
      .pipe( dest( './dest/scripts/' ) ) // main.min.js (dest path)
      .pipe( browserSync.stream() ); // browserSync
      done(); // cb, task is done
}

function images(done){
    // minify images
    src('src/images/*') // images (src path)
    .pipe(imagemin()) // optimize images
    .pipe( rename({ suffix: '.min' }) ) // rename output file with min suffix
    .pipe(dest('dest/images/')) // imageName.min.js (dest path)
    .pipe( browserSync.stream() ); // browserSync
    done(); // cb, task is done
}

function watch_files(){ 
  // watch for changes 
  watch('./dest/**/*.html', reload);
  watch('src/styles/**/*.sass', series(css, reload));
  watch('src/scripts/**/*.js', series(js, reload));
  watch('src/images/*', series(images, reload));
}

task('css', css); // css task
task('js', js); // js task
task('images', images); // images task
task('default', parallel(css, js, images)); // default task
task('watch', parallel(browser_sync, watch_files)); // browserSync and watch task

