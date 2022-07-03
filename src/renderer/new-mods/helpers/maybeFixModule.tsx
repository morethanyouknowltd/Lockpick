export function maybeFixModule(module: string) {
  if (module.indexOf('export') === -1) {
    module += `\n\nexport {}\n`
  }

  return module.replace(/\/\/\/ <reference [^\n]+/g, '').trim() + '\n'
}
