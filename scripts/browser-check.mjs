import { writeFile } from 'node:fs/promises'

const port = process.argv[2] || '9237'
const desktopMode = process.argv.includes('--desktop')
const appUrl = process.argv.find((argument) => argument.startsWith('--app='))?.slice(6) || '127.0.0.1:5173'
const sectionSelector = process.argv.find((argument) => argument.startsWith('--section='))?.slice(10)
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = targets.find(
  (target) => target.type === 'page' && target.url.includes(appUrl),
)

if (!page) throw new Error('검증할 율고 페이지를 찾지 못했습니다.')

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (!message.id || !pending.has(message.id)) return
  const handlers = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) handlers.reject(new Error(message.error.message))
  else handlers.resolve(message.result)
})

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  return response.result.value
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: desktopMode ? 1440 : 390,
  height: desktopMode ? 1000 : 844,
  deviceScaleFactor: 1,
  mobile: !desktopMode,
})
await send('Page.reload', { ignoreCache: true })
await wait(1200)
await evaluate(`scrollTo(0, 0)`)
await wait(180)

const initial = await evaluate(`(() => {
  const menu = document.querySelector('.menu-button')
  const rect = menu.getBoundingClientRect()
  const style = getComputedStyle(menu)
  return {
    title: document.title,
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    menu: {
      display: style.display,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: rect.width,
      background: style.backgroundColor,
      color: style.color,
    },
    heroTitle: document.querySelector('.hero h1')?.innerText,
    eagerBrokenImages: [...document.images].filter(
      (image) => image.loading !== 'lazy' && image.complete && !image.naturalWidth,
    ).length,
  }
})()`)

if (desktopMode) {
  await evaluate(`document.querySelector('#products').scrollIntoView()`)
  await wait(900)
} else {
  await evaluate(`(async () => {
    for (const card of document.querySelectorAll('.product-card')) {
      card.scrollIntoView({ block: 'center' })
      await new Promise((resolve) => setTimeout(resolve, 450))
    }
  })()`)
}

const productCards = await evaluate(`(() => [...document.querySelectorAll('.product-card')].map((card) => ({
  className: card.className,
  opacity: getComputedStyle(card).opacity,
  display: getComputedStyle(card).display,
  imageWidth: card.querySelector('img')?.naturalWidth,
})))()`)

const effects = await evaluate(`(() => {
  const productButton = document.querySelector('.product-image-button')
  const bounds = productButton.getBoundingClientRect()
  productButton.dispatchEvent(new PointerEvent('pointermove', {
    bubbles: true,
    pointerType: 'mouse',
    clientX: bounds.left + bounds.width * 0.78,
    clientY: bounds.top + bounds.height * 0.28,
  }))
  return new Promise((resolve) => requestAnimationFrame(() => resolve({
    scrollProgress: getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress').trim(),
    tiltX: productButton.style.getPropertyValue('--tilt-x'),
    tiltY: productButton.style.getPropertyValue('--tilt-y'),
    pointerAuraDisplay: getComputedStyle(document.querySelector('.pointer-aura')).display,
    heroSparkAnimation: getComputedStyle(document.querySelector('.hero-sparks i')).animationName,
    cometAnimation: getComputedStyle(document.querySelector('.formula-comet')).animationName,
    ritualScanAnimation: getComputedStyle(document.querySelector('.ritual-scan')).animationName,
  })))
})()`)

await evaluate(`document.querySelector('.menu-button').click()`)
await wait(450)
const menu = await evaluate(`(() => ({
  open: document.querySelector('.mobile-navigation').classList.contains('open'),
  ariaExpanded: document.querySelector('.menu-button').getAttribute('aria-expanded'),
  bodyOverflow: getComputedStyle(document.body).overflow,
  navLinks: document.querySelectorAll('.mobile-navigation nav a').length,
}))()`)

await evaluate(`document.querySelector('.mobile-menu-top button').click()`)
await wait(350)
await evaluate(`document.querySelector('.product-image-button').click()`)
await wait(250)
const product = await evaluate(`(() => ({
  modalOpen: Boolean(document.querySelector('.product-modal')),
  thumbnails: document.querySelectorAll('.modal-thumbnails button').length,
  detailImages: document.querySelectorAll('.detail-stack img').length,
  buyHref: document.querySelector('.modal-buy')?.href,
  bodyOverflow: getComputedStyle(document.body).overflow,
}))()`)

await evaluate(`document.querySelector('.source-details').open = true`)
const details = await evaluate(`(() => ({
  open: document.querySelector('.source-details').open,
  localSources: [...document.querySelectorAll('.detail-stack img')].every(
    (image) => image.src.includes('/images/source/detail/'),
  ),
}))()`)

await evaluate(`document.querySelector('.modal-close').click()`)
await wait(200)
const showcaseBefore = await evaluate(`document.querySelector('.showcase-image img')?.currentSrc`)
await evaluate(`document.querySelector('.showcase-arrows button:last-child').click()`)
await wait(250)
const showcase = await evaluate(`(() => ({
  slides: document.querySelectorAll('.showcase-index button').length,
  activeIndex: [...document.querySelectorAll('.showcase-index button')].findIndex((button) => button.classList.contains('active')),
  imageChanged: document.querySelector('.showcase-image img')?.currentSrc !== ${JSON.stringify('SHOWCASE_BEFORE')},
  title: document.querySelector('.showcase-caption strong')?.textContent,
}))()`.replace(JSON.stringify('SHOWCASE_BEFORE'), JSON.stringify(showcaseBefore)))
await evaluate(`document.querySelector('.photo-review-track button').click()`)
await wait(180)
const lightbox = await evaluate(`(() => ({
  open: Boolean(document.querySelector('.lightbox')),
  imageSrc: document.querySelector('.lightbox img')?.src,
}))()`)
await evaluate(`document.querySelector('.lightbox button').click()`)

await evaluate(`document.querySelector('.guide-poster').click()`)
await wait(180)
const video = await evaluate(`(() => ({
  iframeMounted: Boolean(document.querySelector('.guide-video iframe')),
  title: document.querySelector('.guide-video iframe')?.title,
}))()`)

if (process.argv[3]) {
  if (sectionSelector) {
    await evaluate(`(() => {
      const section = document.querySelector(${JSON.stringify(sectionSelector)})
      if (section) scrollTo(0, section.getBoundingClientRect().top + scrollY)
    })()`)
    await wait(600)
  }
  await send('Page.enable')
  const capture = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  await writeFile(process.argv[3], Buffer.from(capture.data, 'base64'))
}

console.log(JSON.stringify({ initial, productCards, effects, menu, product, details, showcase, lightbox, video }, null, 2))
socket.close()
