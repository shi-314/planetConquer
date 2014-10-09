var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var browserify = require('gulp-browserify');
var stylus = require('gulp-stylus');
var stylish = require('jshint-stylish');

gulp.task('clean', function () {
  return gulp.src(
    [
      'build/*.html',
      'build/css',
      'build/js',
      'build/assets'],
    {read: false})
    .pipe(clean());
});

gulp.task('css', function () {
  return gulp.src('src/public/css/*.styl')
      .pipe(stylus())
      .pipe(gulp.dest('build/css'));
});

gulp.task('assets', function () {
  return gulp.src('src/public/assets/**/*')
      .pipe(gulp.dest('build/assets'));
});

gulp.task('libs', function () {
  return gulp.src([
      'src/public/libs/three/three.js',
      'src/public/libs/three/OrbitControls.js',
      'src/public/libs/three/shaders/CopyShader.js',
      'src/public/libs/three/shaders/HorizontalBlurShader.js',
      'src/public/libs/three/shaders/VerticalBlurShader.js',
      'src/public/libs/three/shaders/GodrayShaders.js',
      'src/public/libs/three/postprocessing/ShaderPass.js',
      'src/public/libs/three/postprocessing/EffectComposer.js',
      'src/public/libs/three/postprocessing/MaskPass.js',
      'src/public/libs/three/postprocessing/RenderPass.js',
      'src/public/libs/tween/tween.min.js'
    ])
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('jshint', function () {
  return gulp.src(['src/public/*.js', 'src/public/game/*.js'])
    .pipe(jshint({
      globals: {
        module: true,
        THREE: true,
        TWEEN: true,
        console: true,
        window: true,
        requestAnimationFrame: true,
        setInterval: true
      },
      indent: 2,
      newcap: true,
      noarg: true,
      noempty: true,
      quotmark: true,
      undef: true,
      unused: true,
      trailing: true,
      maxlen: 120,
      expr: true,
      loopfunc: true,
      predef: ['window', 'document', 'require']
    }))
    .pipe(jshint.reporter(stylish));
});

gulp.task('js', ['jshint'], function () {
  return gulp.src('src/public/app.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: true
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('watch', function() {
  gulp.watch('src/public/*.js', ['js']);
  gulp.watch('src/public/game/*.js', ['js']);
  gulp.watch('src/public/libs/three/**/*', ['libs']);
  gulp.watch('src/public/libs/tween/*.js', ['libs']);
  gulp.watch('src/public/assets/**/*', ['assets']);
  gulp.watch('src/public/css/*', ['css']);
});

gulp.task('default', ['watch', 'assets', 'libs', 'css', 'js']);

