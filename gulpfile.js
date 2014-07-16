var gulp = require('gulp')
  , gutil = require('gulp-util')
  , plumber = require('gulp-plumber')
  , notify = require('gulp-notify')
  , cache = require('gulp-cache')
  , imagemin = require('gulp-imagemin')
  , prefix = require('gulp-autoprefixer')
  , less = require('gulp-less')
  , jade = require('gulp-jade')
  , del = require('del')
  , source = require('vinyl-source-stream')
  , express = require('express')
  , watchify = require('watchify')
  , uglifyify = require('uglifyify')

function handleErrors(e) {
  gutil.log(e);
  var args = Array.prototype.slice.call(arguments);
  notify.onError("<%= error.message %>").apply(this, args);
}

gulp.task('clean', function(cb) {
  del(['build/**/*'], cb);
});

gulp.task('jade', function() {
  gulp.src(['src/**/*.jade'])
    .pipe(plumber({errorHandler: handleErrors}))
    .pipe(jade())
    .pipe(gulp.dest('build'))
    
});

gulp.task('less', function() {
  gulp.src(['src/less/style.less'])
    .pipe(plumber({errorHandler: handleErrors}))
    .pipe(less())
    .pipe(prefix('last 2 versions'))
    .pipe(gulp.dest('build/css'))
})

gulp.task('images', function(cb) {
  del(['build/img/**/*'], cb);
  gulp.src(['src/images/**/*'])
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('build/img'))
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.jade', ['jade'])
  gulp.watch('src/less/**/*.less', ['less'])
  gulp.watch('src/images/**/*', ['images'])

  var bundler = watchify('./src/js/app.js')
    .on('update', rebundle)

  if(gutil.env.dev !== true) {
    bundler.transform(uglifyify, {global: true});
  }

  function rebundle() {

    gutil.log('Rebundling scripts!');

    return bundler.bundle(gutil.env.dev ? {debug: true} : {} )
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('build/js'))

  }

  return rebundle();
});

gulp.task('server', function() {
  var server = express();
  server.use(express.static('build'));
  var address = server.listen(1337).address();
  gutil.log('Server running on port:', gutil.colors.cyan(address.port));
});

gulp.task('default', ['jade', 'images', 'less', 'watch', 'server']);