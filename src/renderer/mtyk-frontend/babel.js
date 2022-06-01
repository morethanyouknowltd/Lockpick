/**
 * @todo figure out how to best de-dupe this file, some apps use src, others use base dir
 */

const { capitalize } = require('lodash')
const nodePath = require('path')
const colors = {
  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',
}

const chalk = {
  green: (str) => colors.FgGreen + str + colors.Reset,
  yellow: (str) => colors.FgYellow + str + colors.Reset,
}

const debug = (msg) => {
  // console.log(`MTYKTransform debug: ${msg}`)
}
module.exports = function MTYKTransform(
  { environment, logger } = { environment: 'native', logger: { exclude: [] } }
) {
  return function init({ types: t }) {
    const regex = /conditionalImports$/
    const replace = (src) =>
      src.replace(regex, `conditionalImports${capitalize(environment)}`)
    return {
      visitor: {
        // Require statements
        CallExpression(path, state, ...rest) {
          const node = path.node
          const args = node.arguments || []
          if (
            node.callee.name === 'require' &&
            args.length === 1 &&
            t.isStringLiteral(args[0])
          ) {
            const source = args[0].value
            if (regex.test(source)) {
              debug('Replacing require ' + source)
              args[0].value = replace(source)
            }
          }

          const callee = path.get('callee')
          if (!callee.isMemberExpression()) {
            return
          }

          if (
            logger?.exclude?.some((regex) =>
              regex.test(state.file.opts.filename)
            )
          ) {
            return
          }

          const object = callee.get('object')
          const property = callee.get('property')

          if (
            isGlobalConsoleId(object) ||
            (isGlobalConsoleId(object.get('object')) &&
              (property.isIdentifier({ name: 'call' }) ||
                property.isIdentifier({ name: 'apply' })))
          ) {
            const location = path.node.loc
            const line = (location && location.start.line) || '?'
            const cwdDir = nodePath.basename(process.cwd())

            const filename = nodePath.resolve(state.file.opts.filename)
            const projectRelative = cwdDir + filename.replace(process.cwd(), '')
            const innerLog = `\n${projectRelative}:${line}`

            // // if (environment === 'browser') {
            // //   object.replaceWith(
            // //     t.memberExpression(t.identifier('console'), t.identifier('re'))
            // //   )
            // // } else {
            path.node.arguments.push(t.stringLiteral(chalk.yellow(innerLog)))
            // }
          }
        },
        // Import statements
        ImportDeclaration: (path) => {
          const source = path.node.source.value
          if (regex.test(source)) {
            debug('Replacing import ' + source)
            path.replaceWith(
              t.importDeclaration(
                path.node.specifiers,
                t.stringLiteral(replace(source))
              )
            )
            path.skip()
          }
        },
      },
    }
  }
}

function isGlobalConsoleId(id) {
  const name = 'console'
  return (
    id.isIdentifier({ name }) &&
    !id.scope.getBinding(name) &&
    id.scope.hasGlobal(name)
  )
}
