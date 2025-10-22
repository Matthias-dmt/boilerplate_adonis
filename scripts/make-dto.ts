// Usage: pnpm dto:make User [--name UserDTO] [--out contracts/dtos] [--omit password,secret]
// Reads app/Models/User.ts, extracts @column fields, builds DTO + toDTO mapper.

import { promises as fs } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Field = {
  name: string
  tsType: string
  hidden: boolean
  isDate: boolean
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function toKebabCase(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function toPascalCase(s: string) {
  return s.replace(/(^\w|-\w)/g, (m) => m.replace('-', '').toUpperCase())
}

function parseArgs(argv: string[]) {
  const args = { model: '', name: '', out: 'contracts/dtos', omit: [] as string[] }
  const rest: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--name')) ((args.name = argv[i + 1]), i++)
    else if (a.startsWith('--out')) ((args.out = argv[i + 1]), i++)
    else if (a.startsWith('--omit'))
      ((args.omit = argv[i + 1].split(',').map((x) => x.trim())), i++)
    else rest.push(a)
  }
  args.model = rest[0] || ''
  return args
}

async function readModelSource(modelName: string) {
  const modelFile = join(process.cwd(), 'app', 'Models', `${toPascalCase(modelName)}.ts`)
  return { file: modelFile, source: await fs.readFile(modelFile, 'utf8') }
}

function inferTypeFromColumnLine(line: string): {
  tsType: string
  hidden: boolean
  isDate: boolean
} {
  // crude but effective: checks decorators / property declarations
  // Examples:
  // @column() declare email: string
  // @column({ serializeAs: null }) declare password: string
  // @column.dateTime() declare createdAt: DateTime
  const hidden = /serializeAs\s*:\s*null/.test(line)
  const isDate = /@column\.dateTime/.test(line)
  // fallback type from right side
  const m = line.match(/declare\s+(\w+)\s*:\s*([A-Za-z0-9_\.]+)/)
  let tsType = 'string'
  if (m) {
    const raw = m[2]
    if (/^number$|^bigint$/.test(raw)) tsType = 'number'
    else if (/^boolean$/.test(raw)) tsType = 'boolean'
    else if (/DateTime$/.test(raw)) tsType = 'string'
    else tsType = 'string'
  }
  return { tsType, hidden, isDate }
}

function extractColumns(src: string): Field[] {
  // match lines with @column or @column.dateTime
  const lines = src.split('\n')
  const fields: Field[] = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (/^\s*@column(\.dateTime)?/.test(l)) {
      // lookahead for "declare name: type"
      const prop = lines.slice(i, i + 3).join(' ')
      const nameMatch = prop.match(/declare\s+(\w+)\s*:/)
      if (!nameMatch) continue
      const name = nameMatch[1]
      const { tsType, hidden, isDate } = inferTypeFromColumnLine(prop)
      fields.push({ name, tsType, hidden, isDate })
    }
  }
  return fields
}

function buildDtoCode(dtoName: string, modelName: string, fields: Field[], omit: string[]) {
  const safe = fields.filter((f) => !f.hidden && !omit.includes(f.name))
  const dtoFields = safe.map((f) => `  ${f.name}: ${f.tsType}${f.isDate ? '' : ''}`).join('\n')

  const mapperFields = safe
    .map((f) => {
      if (f.isDate) {
        return `    ${f.name}: (u.${f.name} as any)?.toISO?.() ?? (u.${f.name} ? String(u.${f.name}) : null),`
      }
      return `    ${f.name}: u.${f.name},`
    })
    .join('\n')

  const hasNullableDates = safe.some((f) => f.isDate)

  return `// Auto-generated DTO for ${modelName}. Edit safely.
// Minimal comments: intended for future devs.

export type ${dtoName} = {
${dtoFields}
${hasNullableDates ? '' : ''}
}

export const to${dtoName.replace(/DTO$/, '')}DTO = (u: any): ${dtoName} => ({
${mapperFields}
})
`
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true })
}

async function run() {
  const argv = process.argv.slice(2)
  const { model, name, out, omit } = parseArgs(argv)
  if (!model) {
    console.error(
      'Usage: pnpm dto:make <ModelName> [--name UserDTO] [--out contracts/dtos] [--omit password,secret]'
    )
    process.exit(1)
  }
  const dtoName = name || `${toPascalCase(model)}DTO`
  const { file, source } = await readModelSource(model)
  const fields = extractColumns(source)
  if (!fields.length) {
    console.error(`No @column fields found in ${file}`)
    process.exit(1)
  }

  const outDir = resolve(process.cwd(), out)
  await ensureDir(outDir)
  const fileName = `${toKebabCase(model)}.ts`
  const target = join(outDir, fileName)
  const code = buildDtoCode(dtoName, toPascalCase(model), fields, omit)

  await fs.writeFile(target, code, 'utf8')
  console.log(`DTO written: ${target}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
