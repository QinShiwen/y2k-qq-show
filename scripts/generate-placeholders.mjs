import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { deflateSync } from "node:zlib"

// Deprecated helper. Live wardrobe art is in public/asset (high-res layered PNGs).
// This script still writes 32×48 placeholders under public/items if run.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const PUBLIC = join(ROOT, "public")
const W = 32
const H = 48

const SKINS = {
  fair: {
    hi: [253, 232, 208],
    fill: [244, 201, 168],
    shadow: [216, 154, 118],
    outline: [92, 58, 46],
    blush: [240, 158, 148],
    eye: [52, 36, 32],
    shine: [255, 255, 255],
    mouth: [176, 96, 90],
  },
  tan: {
    hi: [236, 188, 142],
    fill: [212, 154, 104],
    shadow: [176, 112, 70],
    outline: [86, 50, 34],
    blush: [212, 124, 108],
    eye: [48, 32, 28],
    shine: [255, 255, 255],
    mouth: [150, 78, 70],
  },
  deep: {
    hi: [176, 118, 84],
    fill: [140, 86, 56],
    shadow: [102, 58, 36],
    outline: [58, 32, 22],
    blush: [168, 96, 84],
    eye: [36, 24, 20],
    shine: [255, 248, 240],
    mouth: [120, 64, 56],
  },
}

const HAIR = {
  "short-black": {
    hi: [86, 78, 82],
    fill: [38, 32, 36],
    shadow: [20, 16, 18],
    outline: [12, 10, 12],
  },
  "long-brown": {
    hi: [198, 150, 104],
    fill: [139, 90, 58],
    shadow: [96, 58, 36],
    outline: [58, 34, 22],
  },
}

const OUTFITS = {
  business: {
    hi: [196, 150, 108],
    fill: [160, 104, 68],
    shadow: [112, 68, 44],
    outline: [64, 38, 26],
    shirt: [250, 244, 234],
    shirtShadow: [220, 210, 196],
    pants: [52, 52, 64],
    pantsHi: [72, 72, 88],
    shoes: [90, 58, 42],
    shoesHi: [120, 84, 60],
  },
  hoodie: {
    hi: [122, 168, 214],
    fill: [74, 126, 186],
    shadow: [48, 90, 148],
    outline: [32, 54, 92],
    lining: [232, 236, 242],
    pants: [58, 72, 104],
    pantsHi: [78, 94, 128],
    shoes: [236, 236, 240],
    shoesHi: [255, 255, 255],
    accent: [42, 78, 132],
  },
}

function crc32(buf) {
  let crc = ~0
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i]
    for (let k = 0; k < 8; k += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(pix) {
  const raw = Buffer.alloc((pix.w * 4 + 1) * pix.h)
  for (let y = 0; y < pix.h; y += 1) {
    raw[y * (pix.w * 4 + 1)] = 0
    pix.data.copy(
      raw,
      y * (pix.w * 4 + 1) + 1,
      y * pix.w * 4,
      (y + 1) * pix.w * 4,
    )
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(pix.w, 0)
  ihdr.writeUInt32BE(pix.h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

class Pix {
  constructor(w = W, h = H) {
    this.w = w
    this.h = h
    this.data = Buffer.alloc(w * h * 4)
  }

  set(x, y, color) {
    x |= 0
    y |= 0
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !color) return
    const i = (y * this.w + x) * 4
    this.data[i] = color[0]
    this.data[i + 1] = color[1]
    this.data[i + 2] = color[2]
    this.data[i + 3] = color[3] ?? 255
  }

  clear(x, y) {
    x |= 0
    y |= 0
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = (y * this.w + x) * 4
    this.data[i] = 0
    this.data[i + 1] = 0
    this.data[i + 2] = 0
    this.data[i + 3] = 0
  }

  getA(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0
    return this.data[(y * this.w + x) * 4 + 3]
  }

  fillCircle(cx, cy, r, color) {
    const rr = r * r + r
    for (let y = -r; y <= r; y += 1) {
      for (let x = -r; x <= r; x += 1) {
        if (x * x + y * y <= rr) this.set(cx + x, cy + y, color)
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, color) {
    for (let y = -ry; y <= ry; y += 1) {
      for (let x = -rx; x <= rx; x += 1) {
        if (rx * rx * y * y + ry * ry * x * x <= rx * rx * ry * ry + rx * ry) {
          this.set(cx + x, cy + y, color)
        }
      }
    }
  }

  fillRect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy += 1) {
      for (let dx = 0; dx < w; dx += 1) {
        this.set(x + dx, y + dy, color)
      }
    }
  }

  eraseEllipse(cx, cy, rx, ry) {
    for (let y = -ry; y <= ry; y += 1) {
      for (let x = -rx; x <= rx; x += 1) {
        if (rx * rx * y * y + ry * ry * x * x <= rx * rx * ry * ry) {
          this.clear(cx + x, cy + y)
        }
      }
    }
  }

  shade(cx, cy, pal) {
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) {
        if (this.getA(x, y) === 0) continue
        const light = cx - x + (cy - y)
        if (light > 5) this.set(x, y, pal.hi)
        else if (light < -3) this.set(x, y, pal.shadow)
        else this.set(x, y, pal.fill)
      }
    }
  }

  outline(color) {
    const orig = Buffer.from(this.data)
    const alpha = (x, y) => {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0
      return orig[(y * this.w + x) * 4 + 3]
    }
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) {
        if (alpha(x, y) === 0) continue
        if (
          alpha(x - 1, y) === 0 ||
          alpha(x + 1, y) === 0 ||
          alpha(x, y - 1) === 0 ||
          alpha(x, y + 1) === 0
        ) {
          this.set(x, y, color)
        }
      }
    }
  }
}

function drawFace(p, pal, dir) {
  if (dir === "down") {
    p.fillRect(10, 10, 2, 2, pal.eye)
    p.fillRect(18, 10, 2, 2, pal.eye)
    p.set(10, 10, pal.shine)
    p.set(18, 10, pal.shine)
    p.fillRect(9, 13, 2, 1, pal.blush)
    p.fillRect(19, 13, 2, 1, pal.blush)
    p.set(14, 14, pal.mouth)
    p.set(15, 15, pal.mouth)
    p.set(16, 14, pal.mouth)
    return
  }
  if (dir === "right") {
    p.fillRect(19, 10, 2, 2, pal.eye)
    p.set(19, 10, pal.shine)
    p.set(22, 11, pal.outline)
    p.set(22, 12, pal.shadow)
    p.fillRect(19, 13, 2, 1, pal.blush)
    p.fillRect(20, 14, 2, 1, pal.mouth)
  }
}

function drawSkin(p, pal, dir) {
  p.fillCircle(15, 10, 8, pal.fill)
  p.fillCircle(15, 11, 7, pal.fill)

  if (dir === "right") {
    p.fillCircle(8, 12, 2, pal.fill)
    p.fillRect(13, 17, 5, 4, pal.fill)
    p.fillEllipse(16, 26, 6, 7, pal.fill)
    p.fillRect(9, 22, 3, 11, pal.fill)
    p.fillRect(20, 22, 3, 12, pal.fill)
    p.fillCircle(10, 34, 2, pal.fill)
    p.fillCircle(22, 35, 2, pal.fill)
    p.fillRect(13, 32, 4, 9, pal.fill)
    p.fillRect(17, 32, 4, 9, pal.fill)
    p.fillEllipse(14, 43, 3, 2, pal.fill)
    p.fillEllipse(19, 43, 3, 2, pal.fill)
  } else {
    p.fillCircle(7, 12, 2, pal.fill)
    p.fillCircle(23, 12, 2, pal.fill)
    p.fillRect(13, 17, 6, 4, pal.fill)
    p.fillEllipse(15, 26, 6, 7, pal.fill)
    p.fillRect(8, 22, 3, 11, pal.fill)
    p.fillRect(21, 22, 3, 11, pal.fill)
    p.fillCircle(9, 34, 2, pal.fill)
    p.fillCircle(22, 34, 2, pal.fill)
    p.fillRect(12, 32, 4, 9, pal.fill)
    p.fillRect(16, 32, 4, 9, pal.fill)
    p.fillEllipse(13, 43, 3, 2, pal.fill)
    p.fillEllipse(18, 43, 3, 2, pal.fill)
  }

  p.shade(14, 9, pal)
  p.outline(pal.outline)
  drawFace(p, pal, dir)
}

function paintHairCap(p, pal, dir) {
  const c = pal.fill
  if (dir === "down") {
    p.fillCircle(15, 4, 4, c)
    p.fillCircle(10, 5, 3, c)
    p.fillCircle(20, 5, 3, c)
    p.fillCircle(8, 7, 3, c)
    p.fillCircle(22, 7, 3, c)
    p.fillCircle(15, 7, 7, c)
    p.fillCircle(11, 8, 3, c)
    p.fillCircle(19, 8, 3, c)
    p.fillCircle(8, 12, 3, c)
    p.fillCircle(22, 12, 3, c)
    p.fillCircle(7, 14, 2, c)
    p.fillCircle(23, 14, 2, c)
  } else if (dir === "up") {
    p.fillCircle(15, 5, 5, c)
    p.fillCircle(10, 6, 4, c)
    p.fillCircle(20, 6, 4, c)
    p.fillCircle(15, 9, 8, c)
    p.fillCircle(8, 11, 4, c)
    p.fillCircle(22, 11, 4, c)
    p.fillCircle(15, 12, 7, c)
  } else {
    p.fillCircle(13, 4, 4, c)
    p.fillCircle(9, 6, 4, c)
    p.fillCircle(15, 6, 5, c)
    p.fillCircle(10, 9, 6, c)
    p.fillCircle(8, 12, 4, c)
    p.fillCircle(16, 8, 4, c)
    p.fillCircle(19, 7, 3, c)
  }
}

function drawHairShort(p, pal, dir) {
  paintHairCap(p, pal, dir)
  if (dir === "down") {
    p.eraseEllipse(15, 13, 5, 5)
    p.fillCircle(12, 9, 2, pal.fill)
    p.fillCircle(18, 9, 2, pal.fill)
  } else if (dir === "right") p.eraseEllipse(19, 12, 4, 5)
  p.shade(13, 6, pal)
  p.outline(pal.outline)
}

function drawHairLongFront(p, pal, dir) {
  paintHairCap(p, pal, dir)
  const c = pal.fill
  if (dir === "down") {
    p.fillCircle(8, 16, 3, c)
    p.fillCircle(8, 19, 2, c)
    p.fillCircle(22, 16, 3, c)
    p.fillCircle(22, 19, 2, c)
    p.eraseEllipse(15, 13, 5, 5)
    p.fillCircle(12, 9, 2, c)
    p.fillCircle(18, 9, 2, c)
  } else if (dir === "up") {
    p.fillCircle(9, 16, 3, c)
    p.fillCircle(21, 16, 3, c)
  } else {
    p.fillCircle(18, 9, 3, c)
    p.fillCircle(21, 10, 2, c)
    p.eraseEllipse(19, 12, 4, 5)
  }
  p.shade(13, 6, pal)
  p.outline(pal.outline)
}

function drawHairLongBack(p, pal, dir) {
  const c = pal.fill
  if (dir === "down") {
    p.fillCircle(8, 17, 3, c)
    p.fillCircle(7, 21, 3, c)
    p.fillCircle(8, 25, 2, c)
    p.fillCircle(9, 28, 2, c)
    p.fillCircle(22, 17, 3, c)
    p.fillCircle(23, 21, 3, c)
    p.fillCircle(22, 25, 2, c)
    p.fillCircle(21, 28, 2, c)
  } else if (dir === "up") {
    p.fillCircle(10, 20, 4, c)
    p.fillCircle(20, 20, 4, c)
    p.fillCircle(12, 25, 4, c)
    p.fillCircle(18, 25, 4, c)
    p.fillCircle(15, 28, 4, c)
    p.fillCircle(15, 32, 3, c)
  } else {
    p.fillCircle(7, 16, 4, c)
    p.fillCircle(6, 21, 4, c)
    p.fillCircle(7, 26, 3, c)
    p.fillCircle(8, 30, 3, c)
    p.fillCircle(9, 33, 2, c)
  }
  p.shade(8, 18, pal)
  p.outline(pal.outline)
}

function clipFace(p) {
  for (let y = 0; y <= 17; y += 1) {
    for (let x = 0; x < p.w; x += 1) {
      p.clear(x, y)
    }
  }
}

function paintShirtV(p, pal, dir) {
  if (dir === "up") return
  const x0 = dir === "right" ? 16 : 15
  for (let y = 21; y <= 28; y += 1) {
    const w = Math.max(2, 4 - Math.floor((y - 21) / 3))
    p.fillRect(x0 - Math.floor(w / 2), y, w, 1, pal.shirt)
  }
  if (dir === "down") {
    p.fillRect(13, 19, 2, 2, pal.shirt)
    p.fillRect(17, 19, 2, 2, pal.shirt)
    p.set(15, 23, pal.shirtShadow)
    p.set(15, 26, pal.shirtShadow)
  } else {
    p.fillRect(15, 19, 3, 2, pal.shirt)
  }
}

function drawBusiness(p, pal, dir) {
  if (dir === "right") {
    p.fillEllipse(16, 26, 7, 7, pal.fill)
    p.fillRect(9, 22, 4, 10, pal.fill)
    p.fillRect(20, 22, 4, 11, pal.fill)
  } else {
    p.fillEllipse(15, 26, 7, 7, pal.fill)
    p.fillRect(7, 22, 4, 10, pal.fill)
    p.fillRect(21, 22, 4, 10, pal.fill)
    p.fillCircle(15, 21, 4, pal.fill)
  }
  p.shade(13, 22, pal)
  paintShirtV(p, pal, dir)

  const pants = pal.pants
  const shoes = pal.shoes
  if (dir === "right") {
    p.fillRect(13, 32, 5, 9, pants)
    p.fillRect(17, 32, 5, 9, pants)
    p.fillRect(13, 32, 5, 2, pal.pantsHi)
    p.fillEllipse(14, 43, 3, 2, shoes)
    p.fillEllipse(19, 43, 3, 2, shoes)
    p.set(13, 42, pal.shoesHi)
    p.set(18, 42, pal.shoesHi)
  } else if (dir === "up") {
    p.fillRect(11, 32, 10, 9, pants)
    p.fillRect(11, 32, 10, 2, pal.pantsHi)
    p.fillEllipse(15, 43, 6, 2, shoes)
  } else {
    p.fillRect(11, 32, 5, 9, pants)
    p.fillRect(16, 32, 5, 9, pants)
    p.fillRect(11, 32, 5, 2, pal.pantsHi)
    p.fillRect(16, 32, 5, 2, pal.pantsHi)
    p.fillEllipse(13, 43, 3, 2, shoes)
    p.fillEllipse(18, 43, 3, 2, shoes)
    p.set(12, 42, pal.shoesHi)
    p.set(17, 42, pal.shoesHi)
  }
  if (dir !== "up") clipFace(p)
  p.outline(pal.outline)
}

function drawHoodie(p, pal, dir) {
  if (dir === "right") {
    p.fillEllipse(16, 26, 7, 7, pal.fill)
    p.fillCircle(16, 20, 5, pal.fill)
    p.fillRect(9, 22, 4, 10, pal.fill)
    p.fillRect(20, 22, 4, 11, pal.fill)
    p.fillRect(14, 18, 5, 3, pal.lining)
  } else if (dir === "up") {
    p.fillEllipse(15, 21, 8, 5, pal.fill)
    p.fillEllipse(15, 26, 7, 7, pal.fill)
    p.fillRect(7, 22, 4, 10, pal.fill)
    p.fillRect(21, 22, 4, 10, pal.fill)
  } else {
    p.fillEllipse(15, 26, 7, 7, pal.fill)
    p.fillCircle(15, 20, 5, pal.fill)
    p.fillRect(7, 22, 4, 10, pal.fill)
    p.fillRect(21, 22, 4, 10, pal.fill)
    p.fillRect(13, 18, 6, 2, pal.lining)
  }
  p.shade(13, 22, pal)

  if (dir === "down") {
    p.fillRect(12, 27, 8, 5, pal.accent)
    p.fillRect(13, 28, 6, 3, pal.shadow)
  } else if (dir === "right") {
    p.fillRect(14, 27, 6, 5, pal.accent)
  }

  const pants = pal.pants
  const shoes = pal.shoes
  if (dir === "right") {
    p.fillRect(13, 32, 5, 9, pants)
    p.fillRect(17, 32, 5, 9, pants)
    p.fillEllipse(14, 43, 3, 2, shoes)
    p.fillEllipse(19, 43, 3, 2, shoes)
    p.set(13, 42, pal.shoesHi)
    p.set(18, 42, pal.shoesHi)
  } else if (dir === "up") {
    p.fillRect(11, 32, 10, 9, pants)
    p.fillEllipse(15, 43, 6, 2, shoes)
  } else {
    p.fillRect(11, 32, 5, 9, pants)
    p.fillRect(16, 32, 5, 9, pants)
    p.fillEllipse(13, 43, 3, 2, shoes)
    p.fillEllipse(18, 43, 3, 2, shoes)
    p.set(12, 42, pal.shoesHi)
    p.set(17, 42, pal.shoesHi)
  }
  if (dir !== "up") clipFace(p)
  p.outline(pal.outline)
}

function drawSkinThumb(p, pal) {
  const cx = 15
  const cy = 23
  const r = 10
  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y > r * r) continue
      const light = -x * 0.4 - y * 0.55
      let color = pal.fill
      if (light > 3.2) color = pal.hi
      else if (light < -2.8) color = pal.shadow
      p.set(cx + x, cy + y, color)
    }
  }
  p.outline(pal.outline)
}

function save(rel, pix) {
  const path = join(PUBLIC, rel.replace(/^\//, ""))
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, encodePng(pix))
}

function make(draw) {
  const pix = new Pix()
  draw(pix)
  return pix
}

const DIRS = ["down", "up", "right"]

for (const [id, pal] of Object.entries(SKINS)) {
  for (const dir of DIRS) {
    save(`/items/skin/${id}/idle_${dir}.png`, make((p) => drawSkin(p, pal, dir)))
  }
  save(`/items/skin/${id}/thumb.png`, make((p) => drawSkinThumb(p, pal)))
}

for (const dir of DIRS) {
  save(
    `/items/hair/short-black/idle_${dir}.png`,
    make((p) => drawHairShort(p, HAIR["short-black"], dir)),
  )
  save(
    `/items/hair/long-brown/idle_${dir}.png`,
    make((p) => drawHairLongFront(p, HAIR["long-brown"], dir)),
  )
  save(
    `/items/hair/long-brown/idle_${dir}_back.png`,
    make((p) => drawHairLongBack(p, HAIR["long-brown"], dir)),
  )
}

save(
  "/items/hair/short-black/thumb.png",
  make((p) => {
    drawSkin(p, SKINS.fair, "down")
    drawHairShort(p, HAIR["short-black"], "down")
  }),
)
save(
  "/items/hair/long-brown/thumb.png",
  make((p) => {
    drawHairLongBack(p, HAIR["long-brown"], "down")
    drawSkin(p, SKINS.fair, "down")
    drawHairLongFront(p, HAIR["long-brown"], "down")
  }),
)

for (const dir of DIRS) {
  save(
    `/items/outfit/business/idle_${dir}.png`,
    make((p) => drawBusiness(p, OUTFITS.business, dir)),
  )
  save(
    `/items/outfit/hoodie/idle_${dir}.png`,
    make((p) => drawHoodie(p, OUTFITS.hoodie, dir)),
  )
}

save(
  "/items/outfit/business/thumb.png",
  make((p) => {
    drawSkin(p, SKINS.fair, "down")
    drawBusiness(p, OUTFITS.business, "down")
  }),
)
save(
  "/items/outfit/hoodie/thumb.png",
  make((p) => {
    drawSkin(p, SKINS.fair, "down")
    drawHoodie(p, OUTFITS.hoodie, "down")
  }),
)

console.log("Wrote Gather-style 32x48 items to public/items")
