const gulp = require('gulp')
const { rollup } = require('rollup')
const isDev = process.env.WT_ENV === 'dev'
const { version } = require('./package.json')
const compilePrettier = require('./script/compile-prettier')

// 打包 panel
function buildPanel(cb) {
  rollup(getRollupInputOption('src/panel/index.js')).then(
    ({ write }) => {
      write({
        file: 'dist/js/panel.js',
        name: 'nomui-devtools-panel',
      })
      cb()
    },
    (err) => {
      console.log(chalk.red(err.toString()))
      cb()
    },
  )
}

// 打包 get-inst
function buildInst(cb) {
  rollup(getRollupInputOption('src/instance/index.js')).then(
    ({ write }) => {
      write({
        file: 'dist/js/get-inst.js',
        name: 'nomui-devtools-instance',
      })
      cb()
    },
    (err) => {
      console.log(chalk.red(err.toString()))
      cb()
    },
  )
}

function getRollupInputOption(input) {
  return {
    input: input,
    plugins: isDev ? [] : [compilePrettier()],
  }
}

function watchChange(cb) {
  gulp.watch('src/instance/*.js', buildInst)
  gulp.watch('src/panel/*.js', buildPanel)
  cb()
}
exports.build = gulp.series(buildPanel, buildInst)
exports.watch = gulp.parallel(buildPanel, buildInst, watchChange)
