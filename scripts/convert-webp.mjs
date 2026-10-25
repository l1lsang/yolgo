// Converts every PNG/JPG under public/images to WebP next to the original.
// Originals tracked in git are deleted afterwards (git keeps them); untracked originals are left in place.
// usage: node scripts/convert-webp.mjs [--keep]
import { execFileSync } from 'node:child_process'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, relative } from 'node:path'
import sharp from 'sharp'

const root = join(import.meta.dirname, '..')
const imagesDir = join(root, 'public', 'images')
const keepOriginals = process.argv.includes('--keep')
const maxWidth = 2000
const maxSide = 16383 // WebP's hard limit per side

const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => {
  const path = join(dir, entry.name)
  return entry.isDirectory() ? walk(path) : [path]
}))).flat()

const tracked = new Set(
  execFileSync('git', ['ls-files', '-z', 'public/images'], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).map((file) => join(root, file)),
)

const files = (await walk(imagesDir)).filter((file) => /\.(png|jpe?g)$/i.test(file))
let before = 0
let after = 0
const untracked = []
for (const file of files) {
  const target = file.replace(/\.(png|jpe?g)$/i, '.webp')
  const image = sharp(file, { limitInputPixels: false })
  const { width = 0, height = 0 } = await image.metadata()
  const scale = Math.min(1, maxWidth / width, maxSide / height)
  const isPng = /\.png$/i.test(file)
  await image
    .resize(scale < 1 ? { width: Math.round(width * scale), height: Math.round(height * scale) } : undefined)
    .webp({ quality: isPng ? 86 : 82, alphaQuality: 100, effort: 5, smartSubsample: true })
    .toFile(target)
  const [from, to] = await Promise.all([stat(file), stat(target)])
  before += from.size
  after += to.size
  if (keepOriginals) continue
  if (tracked.has(file)) await unlink(file)
  else untracked.push(relative(root, file))
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`
console.log(`${files.length} images: ${mb(before)} -> ${mb(after)}`)
if (untracked.length) console.log(`kept (not in git): ${untracked.join(', ')}`)
