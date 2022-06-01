import { Project, Symbol, TypeFormatFlags } from 'ts-morph'
import fs = require('fs')
import path = require('path')

const formatopts = TypeFormatFlags.NoTruncation | TypeFormatFlags.NoTypeReduction
const project = new Project({
  skipAddingFilesFromTsConfig: true,
})

const [modsServiceFile] = project.addSourceFilesAtPaths('mods/ModsService.ts')
const modsServiceClass = modsServiceFile.getClassOrThrow('ModsService')
const makeApiFunc = modsServiceClass.getInstanceMethodOrThrow('makeApi')
const returnType = makeApiFunc.getReturnType()
const promiseType = returnType.getTypeArguments()[0]

let str = `/// <reference types="node" />\n`

function outputObjType(type: Symbol) {
  // type.getAliasedSymbol

  const valueDeclaration = type.getValueDeclaration()
  if (!valueDeclaration) {
    const fullText = type.getDeclarations()[0].getFullText().trim()

    if (fullText.indexOf('export interface') === 0) {
      const ret = fullText.replace('export interface', 'interface')
      return ret
    }

    console.warn(`${type.getName()} missing value declaration, replacing with any`)
    return 'any'
  }

  const val = valueDeclaration.getType().getText(undefined, formatopts)
  return val
}

for (const member of promiseType.getApparentProperties()) {
  str += `declare const ${member.getName()}: ${outputObjType(member)}\n`
}

// Add any mind missing referenced types from ModsService.ts
const importSet = new Set(['ActionSpec', 'BaseActionSpec', 'PopupSpec'])
modsServiceFile.getReferencedSourceFiles().forEach(file => {
  for (const exSym of file.getExportSymbols()) {
    if (importSet.has(exSym.getName())) {
      str += `${outputObjType(exSym)}\n`
    }
  }
})

fs.writeFileSync(path.join(__dirname, '..', '..', 'extra-resources/lockpick-mod-api.d.ts'), str)
