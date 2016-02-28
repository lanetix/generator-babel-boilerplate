import gulp from 'gulp'
import loadPlugins from 'gulp-load-plugins'
import del from 'del'
import path from 'path'
import { Instrumenter } from 'isparta'
import webpackStream from 'webpack-stream'
import merge from 'merge-stream'
import uniqBy from 'lodash.uniqby'
import mochaGlobals from './test/setup/.globals'
import manifest from './package.json'

// Load all of our Gulp plugins
const $ = loadPlugins()

// Gather the library data from `package.json`
const file = uniqBy(manifest.lanetix, 'path').map(e => ({
  folder: path.dirname(e.path),
  name: path.basename(e.path, path.extname(e.path))
}))

function cleanDist (done) {
  del(uniqBy(file, 'folder').map(e => e.folder)).then(() => done())
}

function cleanTmp (done) {
  del(['tmp']).then(() => done())
}

function onError () {
  $.util.beep()
}

// Lint a set of files
function lint (files) {
  return gulp.src(files)
    .pipe($.plumber())
    .pipe($.standard())
    .pipe($.standard.reporter('default', { breakOnError: true }))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .on('error', onError)
}

function lintSrc () {
  return lint('src/**/*.js')
}

function lintTest () {
  return lint('test/**/*.js')
}

function lintGulpfile () {
  return lint('gulpfile.babel.js')
}

function build () {
  return merge(...file.map(handler =>
    gulp.src(path.join('src', `${handler.name}.js`))
      .pipe($.plumber())
      .pipe(webpackStream({
        target: 'node',
        output: {
          filename: `${handler.name}.js`,
          libraryTarget: 'commonjs2'
        },
        module: {
          loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.json$/, loader: 'json-loader' }
          ],
          noParse: /node_modules\/json-schema\/lib\/validate\.js/
        },
        node: {
          console: 'empty',
          fs: 'empty',
          net: 'empty',
          tls: 'empty'
        }
      }))
      .pipe(gulp.dest(handler.folder))
      .pipe($.filter([`${handler.name}.js`, '!**/*.js.map']))
      .pipe($.uglify())
      .pipe(gulp.dest(handler.folder))
  ))
}

function _mocha () {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({
      reporter: 'dot',
      globals: Object.keys(mochaGlobals.globals),
      ignoreLeaks: false
    }))
}

function _registerBabel () {
  require('babel-register')
}

function test () {
  _registerBabel()
  return _mocha()
}

function coverage (done) {
  _registerBabel()
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done)
    })
}

const watchFiles = ['src/**/*', 'test/**/*', 'package.json', '**/.eslintrc', '.jscsrc']

// Run the headless unit tests as you make changes.
function watch () {
  gulp.watch(watchFiles, ['test'])
}

// Remove the built files
gulp.task('clean', cleanDist)

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp)

// Lint our source code
gulp.task('lint-src', lintSrc)

// Lint our test code
gulp.task('lint-test', lintTest)

// Lint this file
gulp.task('lint-gulpfile', lintGulpfile)

// Lint everything
gulp.task('lint', ['lint-src', 'lint-test', 'lint-gulpfile'])

// Build two versions of the library
gulp.task('build', ['clean'], build)

// Lint and run our tests
gulp.task('test', ['lint'], test)

// Set up coverage and run tests
gulp.task('coverage', ['lint'], coverage)

// Run the headless unit tests as you make changes.
gulp.task('watch', watch)

// An alias of test
gulp.task('default', ['test'])
