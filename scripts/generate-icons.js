// Generate minimal PWA icon PNGs (solid orange with rounded look)
// No external dependencies needed - uses Node.js built-in zlib
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

function createPng(size) {
  // Create raw RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4)
  const center = size / 2
  const radius = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const dx = x - center
      const dy = y - center

      // Rounded square shape (superellipse)
      const n = 4
      const dist = Math.pow(Math.abs(dx / radius), n) + Math.pow(Math.abs(dy / radius), n)

      if (dist <= 1) {
        // Orange gradient: top-left lighter, bottom-right darker
        const t = (x + y) / (size * 2)
        const r = Math.round(249 - t * 20)
        const g = Math.round(115 - t * 30)
        const b = Math.round(22 - t * 5)
        pixels[i] = r
        pixels[i + 1] = g
        pixels[i + 2] = b
        pixels[i + 3] = 255
      } else {
        // Transparent
        pixels[i + 3] = 0
      }
    }
  }

  // Add film strip detail in center area
  const stripSize = Math.floor(size * 0.35)
  const stripStart = Math.floor((size - stripSize) / 2)
  for (let y = stripStart; y < stripStart + stripSize; y++) {
    for (let x = stripStart; x < stripStart + stripSize; x++) {
      const i = (y * size + x) * 4
      const localX = x - stripStart
      const localY = y - stripStart
      const cellSize = Math.floor(stripSize / 5)

      // Film strip border
      const isBorder = localX < cellSize * 0.4 || localX > stripSize - cellSize * 0.4
      const isHole = isBorder && (Math.floor(localY / (cellSize * 0.8)) % 2 === 0)

      if (isBorder && !isHole) {
        pixels[i] = 40
        pixels[i + 1] = 40
        pixels[i + 2] = 40
        pixels[i + 3] = 255
      } else if (isHole) {
        pixels[i] = 80
        pixels[i + 1] = 80
        pixels[i + 2] = 80
        pixels[i + 3] = 255
      }
    }
  }

  // Build PNG file
  // Filter rows (prepend 0 = None filter to each row)
  const filtered = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    filtered[y * (size * 4 + 1)] = 0 // filter byte
    pixels.copy(filtered, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const compressed = zlib.deflateSync(filtered)

  // PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function makeChunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeAndData = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeInt32BE(crc32(typeAndData))
    return Buffer.concat([len, typeAndData, crc])
  }

  // CRC32
  function crc32(buf) {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i]
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0)
      }
    }
    return c ^ 0xffffffff
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)  // width
  ihdr.writeUInt32BE(size, 4)  // height
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ])
}

const iconsDir = path.join(__dirname, "..", "public", "icons")
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), createPng(192))
console.log("Created icon-192.png (192x192)")

fs.writeFileSync(path.join(iconsDir, "icon-512.png"), createPng(512))
console.log("Created icon-512.png (512x512)")

console.log("Done!")
