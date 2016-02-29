'use strict'
var _ = require('lodash')
var file = require('file')
var path = require('path')
var generators = require('yeoman-generator')
var chalk = require('chalk')
var yosay = require('yosay')
var kebabcase = _.kebabCase
var trim = _.trim
var Promise = require('bluebird')
var exec = Promise.promisify(require('child_process').exec)
var gitConfig = require('git-config')
var jsesc = require('jsesc')

function jsonEscape (str) {
  return jsesc(str, { quotes: 'double' })
}

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json')
    this.composeWith('git-init', {}, {
      local: require.resolve('generator-git-init')
    })
  },

  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.green('Lanetix Script') + ' generator!'
    ))

    return Promise.all([exec('npm whoami').catch(function (e) {
      console.error('Error getting npm user name: run `npm login`')
      console.error(e)
    })])
      .then(function (result) {
        result = result ? result : {}
        this.username = trim(result[0])
        return this._showPrompts()
      }.bind(this))
  },

  _showPrompts: function () {
    var config = gitConfig.sync()
    this.user = config.user ? config.user : {}
    var prompts = [{
      type: 'list',
      name: 'event',
      message: 'What event do you want to handle?',
      choices: [
        'workflowPostStageAdvance',
        'recordChangePostCommit'
      ],
      default: 'workflowPostStageAdvance',
      store: true
    }, {
      type: 'input',
      name: 'recordType',
      message: 'What record type do you want to handle?',
      filter: _.snakeCase,
      default: 'parts_warehouse',
      store: true
    }, {
      type: 'input',
      name: 'timeout',
      message: 'How long should your handler be allowed to run? (ms)',
      filter: Number,
      validate: function (num) {
        var input = Number(num)
        return !_.isSafeInteger(input)
          ? 'must be an integer'
          : input <= 0
            ? 'must be greater than zero'
            : true
      },
      default: 100,
      store: true
    }, {
      type: 'input',
      name: 'user',
      message: 'What is the Github username/organization for this project?',
      default: this.username,
      store: true
    }, {
      type: 'input',
      name: 'repo',
      message: 'What is the repository/project name?',
      default: 'lanetix-scripts'
    }, {
      type: 'input',
      name: 'author',
      message: 'Who is the author of this project?',
      default: this.user.name + ' <' + this.user.email + '>',
      store: true
    }]

    var self = this
    return new Promise(function (resolve, reject) {
      self.prompt(prompts, function (props) {
        self.event = props.event
        self.timeout = props.timeout
        self.recordType = props.recordType
        self.user = jsonEscape(props.user)
        self.repo = jsonEscape(kebabcase(props.repo))
        self.author = jsonEscape(props.author)
        resolve()
      })
    })
  },

  writing: {
    app: function () {
      var src = this.sourceRoot()
      var self = this
      var fileName = self.recordType + '.' + self.event + '.js'
      file.walkSync(src, function (dirPath, dirs, files) {
        var relativeDir = path.relative(src, dirPath)
        files.forEach(function (filename) {
          var target
          // Only copy the files that we don't want to rename. We do that after this loop.
          // The files we don't want to rename are both "index.js", and one of them is in
          // "test/unit," and the other is in "src"
          var ignoreDir = relativeDir === 'test/unit' || relativeDir === 'src'
          var shouldCopy = !ignoreDir && !/(index.js|\.DS_Store)$/.test(filename)
          if (shouldCopy) {
            target = path.join(relativeDir, filename)
            self.template(target, target)
          }
        })
      })
      this.template('src/index.js', 'src/' + fileName)
      this.template('test/unit/index.js', 'test/unit/' + fileName)
    }
  },

  install: function () {
    this.installDependencies({
      bower: false,
      npm: true,
      skipInstall: this.options['skip-install']
    })
  }
})
