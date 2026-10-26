import { useEffect, useRef, useState } from 'react'
import './App.css'
import type { BottleScene } from './bottleScene'
import {
  brandImages,
  products,
  reviewPhotos,
  testimonials,
  type Product,
} from './content'

const formatPrice = (price: number) => `${price.toLocaleString('ko-KR')}원`

type BottleChapter = {
  title: React.ReactNode
  body: string
  // Scroll progress at which the bottle rests for this chapter (used when motion is reduced).
  rest: number
  // Scroll range in which the copy is shown: the bottle's hold in bottleScene.ts, so text never sits on the moving bottle.
  shown: [number, number]
}

const heroStats = [
  { value: '2,004', unit: '+', label: '두 제품 누적 리뷰' },
  { value: '68', unit: '%', label: '7일 후 손상모 개선' },
  { value: '3–10', unit: '분', label: '샴푸하듯 간편한 루틴' },
  { value: '35', unit: '%', label: '국내산 쌀겨수 함유' },
]

const bottleImage = '/images/율고.webp'

const bottleChapters: BottleChapter[] = [
  {
    title: <>자연을 담은 시간,<br /><em>한 병에 담다.</em></>,
    body: '대한민국 자연의 본초를 담아 만든 두피 저자극 새치 염색샴푸.',
    rest: 0.23,
    shown: [0, 0.37],
  },
  {
    title: <>샴푸하듯 3–10분,<br /><em>자연스러운 갈색으로.</em></>,
    body: '마른 모발에 바르고 충분히 핸들링한 뒤 헹구면 끝. 매일의 샴푸 루틴 그대로 새치를 케어하세요.',
    rest: 0.61,
    shown: [0.5, 0.72],
  },
  {
    title: <>독일 더마테스트<br /><em>EXCELLENT 등급.</em></>,
    body: '두피에 닿는 시간까지 순하게. 1,895건의 누적 리뷰가 함께한 율고의 기준입니다.',
    rest: 0.93,
    shown: [0.84, 1],
  },
]

type IconName =
  | 'arrow'
  | 'bag'
  | 'chevronLeft'
  | 'chevronRight'
  | 'close'
  | 'menu'
  | 'play'
  | 'plus'
  | 'star'

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    bag: (
      <>
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03 6.5 19.92l1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />,
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [mainImage, setMainImage] = useState(product.image)

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-label={`${product.shortName} 상세 정보`}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="상품 상세 닫기">
          <Icon name="close" />
        </button>

        <div className="modal-product-grid">
          <div className="modal-gallery">
            <div className="modal-main-image">
              <img src={mainImage} alt={`${product.shortName} 제품 이미지`} />
            </div>
            <div className="modal-thumbnails" aria-label="상품 이미지 선택">
              {[product.image, ...product.gallery].map((image, index) => (
                <button
                  type="button"
                  className={mainImage === image ? 'active' : ''}
                  onClick={() => setMainImage(image)}
                  key={image}
                  aria-label={`${index + 1}번째 상품 이미지 보기`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="modal-copy">
            <h2>{product.name}</h2>
            <p className="modal-description">{product.description}</p>

            <div className="modal-rating">
              <span className="stars" aria-label="평점 5점">
                {Array.from({ length: 5 }).map((_, index) => <Icon name="star" key={index} />)}
              </span>
              리뷰 {product.reviewCount.toLocaleString('ko-KR')}건
            </div>

            <div className="modal-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}
              {product.discount && <em>{product.discount}</em>}
            </div>
            <p className="benefit-copy">{product.benefit}</p>

            <div className="option-list">
              <span>구매 옵션</span>
              {product.options.map((option) => <p key={option}>{option}</p>)}
            </div>

            <div className="modal-facts">
              {product.facts.map((fact) => (
                <div key={fact.label}>
                  <strong>{fact.value}</strong>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>

            <a className="button button-dark modal-buy" href={product.link} target="_blank" rel="noreferrer">
              기존 공식몰에서 구매하기 <Icon name="arrow" />
            </a>
            <p className="commerce-note">결제·회원정보·배송조회는 기존 율고 공식몰에서 안전하게 이어집니다.</p>
          </div>
        </div>

        <details className="source-details">
          <summary>
            <span>기존 상품 상세 이미지 전체 보기</span>
            <small>{product.detail.length}장의 원본 콘텐츠</small>
            <Icon name="plus" />
          </summary>
          <div className="detail-stack">
            {product.detail.map((image, index) => (
              <img key={image} src={image} loading="lazy" alt={`${product.shortName} 상세 설명 ${index + 1}`} />
            ))}
          </div>
        </details>
      </section>
    </div>
  )
}

function BottleScroll({ onExplore }: { onExplore: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BottleScene | null>(null)
  const progressRef = useRef(0)
  const [chapter, setChapter] = useState(0)
  const [copyShown, setCopyShown] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const update = () => {
      const bounds = section.getBoundingClientRect()
      const travel = bounds.height - window.innerHeight
      const progress = travel > 0 ? Math.min(1, Math.max(0, -bounds.top / travel)) : 0
      const current = progress < 0.43 ? 0 : progress < 0.78 ? 1 : 2
      const [from, to] = bottleChapters[current].shown
      progressRef.current = reducedMotion ? bottleChapters[current].rest : progress
      stage.style.setProperty('--bottle-progress', progress.toFixed(4))
      sceneRef.current?.setProgress(progressRef.current)
      setChapter(current)
      setCopyShown(reducedMotion || (progress >= from && progress <= to))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let disposed = false
    let visible = false
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sceneRef.current?.setActive(visible)
    })
    // three.js is fetched only when the section is about to come into view.
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      preload.disconnect()
      import('./bottleScene')
        .then(({ createBottleScene }) => createBottleScene(canvas, bottleImage, { still }))
        .then((scene) => {
          if (disposed) {
            scene.dispose()
            return
          }
          sceneRef.current = scene
          scene.setProgress(progressRef.current)
          scene.setActive(visible)
          setReady(true)
        })
        .catch(() => setReady(false))
    }, { rootMargin: '800px 0px' })

    preload.observe(section)
    visibility.observe(section)
    return () => {
      disposed = true
      preload.disconnect()
      visibility.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    sceneRef.current?.setPointer(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
    )
  }

  return (
    <section ref={sectionRef} className="bottle-scroll" aria-labelledby="bottle-title">
      <div
        ref={stageRef}
        className={`bottle-stage is-chapter-${chapter + 1} ${ready ? 'is-3d' : ''}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => sceneRef.current?.setPointer(0, 0)}
      >
        <img className="bottle-fallback" src={bottleImage} alt="율고 자연을 담은 시간 미라클7 퀵커버 블랙 샴푸 자연갈색" />
        <canvas ref={canvasRef} className="bottle-canvas" aria-hidden="true" />

        <div className="bottle-copy">
          {bottleChapters.map((item, index) => {
            const Heading = index === 0 ? 'h2' : 'h3'
            return (
              <div className={`bottle-chapter ${index === chapter && copyShown ? 'active' : ''}`} key={item.body} inert={index !== chapter || !copyShown}>
                <Heading id={index === 0 ? 'bottle-title' : undefined}>{item.title}</Heading>
                <p>{item.body}</p>
                {index === bottleChapters.length - 1 && (
                  <button className="button button-light" type="button" onClick={onExplore}>
                    제품 자세히 보기 <Icon name="arrow" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="bottle-progress" aria-hidden="true">
          <span>{String(chapter + 1).padStart(2, '0')}</span>
          <i />
          <span>{String(bottleChapters.length).padStart(2, '0')}</span>
        </div>
        <span className="bottle-hint" aria-hidden="true">SCROLL</span>
      </div>
    </section>
  )
}

function App() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const activeProduct = products[heroIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % products.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const hasOverlay = Boolean(selectedProduct || selectedPhoto || menuOpen)
    document.body.style.overflow = hasOverlay ? 'hidden' : ''

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSelectedProduct(null)
      setSelectedPhoto(null)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedProduct, selectedPhoto, menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">본문으로 바로가기</a>

      <div className="announcement">
        카톡 친구 추가 시 <strong>2,000원 할인 쿠폰</strong>
        <a href="http://pf.kakao.com/_xoqxalxj" target="_blank" rel="noreferrer">혜택 받기 <Icon name="arrow" /></a>
      </div>

      <header className="site-header">
        <a href="#top" className="brand" aria-label="율고 홈">
          <img src={brandImages.logo} alt="yulgo" />
        </a>

        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="#products">모든 제품</a>
          <a href="#ritual">율고의 기준</a>
          <a href="#reviews">리뷰</a>
          <a href="#guide">사용방법</a>
          <a href="#brand">브랜드</a>
        </nav>

        <div className="header-actions">
          <a className="account-link" href="https://yulgo.co.kr/member/login.html" target="_blank" rel="noreferrer">로그인</a>
          <a className="account-link" href="https://yulgo.co.kr/member/join.html" target="_blank" rel="noreferrer">회원가입</a>
          <a className="bag-link" href="https://yulgo.co.kr/order/basket.html" target="_blank" rel="noreferrer" aria-label="기존 공식몰 장바구니">
            <Icon name="bag" />
          </a>
          <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <div id="mobile-navigation" className={`mobile-navigation ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-top">
          <img src={brandImages.mobileLogo} alt="yulgo" />
          <button type="button" onClick={closeMenu} aria-label="메뉴 닫기"><Icon name="close" /></button>
        </div>
        <nav aria-label="모바일 주요 메뉴">
          <a href="#products" onClick={closeMenu}>모든 제품 <Icon name="arrow" /></a>
          <a href="#ritual" onClick={closeMenu}>율고의 기준 <Icon name="arrow" /></a>
          <a href="#reviews" onClick={closeMenu}>고객 리뷰 <Icon name="arrow" /></a>
          <a href="#guide" onClick={closeMenu}>사용방법 <Icon name="arrow" /></a>
          <a href="#brand" onClick={closeMenu}>브랜드 스토리 <Icon name="arrow" /></a>
        </nav>
        <div className="mobile-menu-benefit">
          <strong>회원가입 즉시 3,000원 적립</strong>
        </div>
      </div>

      <main id="main">
        <section id="top" className="hero" aria-label="율고 대표 상품">
          <div className="hero-stage">
            <div className="hero-media" aria-live="polite">
              {products.map((product, index) => (
                <picture className={index === heroIndex ? 'active' : ''} key={product.id}>
                  <source media="(max-width: 820px)" srcSet={product.mobileHero} />
                  <img src={product.hero} alt="" />
                </picture>
              ))}
            </div>
            <div className="hero-inner">
              <div className="hero-copy" key={activeProduct.id}>
                {activeProduct.id === 'color' ? (
                  <h1>새치는 가볍게,<br /><em>자연은 깊게.</em></h1>
                ) : (
                  <h1>손상은 가볍게,<br /><em>윤기는 깊게.</em></h1>
                )}
                <p>{activeProduct.id === 'color' ? '3–10분, 샴푸하듯 간편하게 시작하는 두피 저자극 새치 케어' : '쌀겨수와 생강추출물로 채우는 데일리 고농축 데미지 리페어'}</p>
                <div className="hero-actions">
                  <button className="button button-dark" type="button" onClick={() => setSelectedProduct(activeProduct)}>
                    제품 자세히 보기 <Icon name="arrow" />
                  </button>
                  <a className="text-link" href={activeProduct.link} target="_blank" rel="noreferrer">공식몰 구매 <Icon name="arrow" /></a>
                </div>
              </div>
            </div>

            <div className="hero-controls">
              <button type="button" onClick={() => setHeroIndex((heroIndex - 1 + products.length) % products.length)} aria-label="이전 상품"><Icon name="chevronLeft" /></button>
              <div className="hero-progress">
                {products.map((product, index) => (
                  <button key={product.id} type="button" className={index === heroIndex ? 'active' : ''} onClick={() => setHeroIndex(index)} aria-label={`${product.shortName} 보기`} />
                ))}
              </div>
              <button type="button" onClick={() => setHeroIndex((heroIndex + 1) % products.length)} aria-label="다음 상품"><Icon name="chevronRight" /></button>
            </div>
          </div>

          <div className="hero-proof" aria-label="율고 핵심 수치">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}<small>{stat.unit}</small></strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="section products-section">
          <div className="section-heading">
            <h2>오늘의 모발에 필요한<br /><em>두 가지 자연의 시간</em></h2>
            <p>새치 커버부터 손상모 리페어까지. 율고의 두 제품을 한눈에 비교해 보세요.</p>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <button className="product-image-button" type="button" onClick={() => setSelectedProduct(product)} aria-label={`${product.shortName} 상세 보기`}>
                  <img src={product.image} alt={product.shortName} />
                </button>
                <div className="product-info">
                  <h3>{product.shortName}</h3>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <div className="product-price">
                      <strong>{formatPrice(product.price)}</strong>
                      {product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}
                    </div>
                    <span>★ 5.0 · 리뷰 {product.reviewCount.toLocaleString('ko-KR')}</span>
                  </div>
                  <button className="line-button" type="button" onClick={() => setSelectedProduct(product)}>
                    상품 자세히 보기 <Icon name="arrow" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="benefit-strip">
            <a className="benefit-item" href="http://pf.kakao.com/_xoqxalxj" target="_blank" rel="noreferrer">
              <img src={brandImages.kakaoBenefit} alt="" />
              <span className="benefit-text"><small>카카오톡 채널</small><strong>채널 추가하고 2,000원 할인 쿠폰</strong></span>
              <em><span>혜택 받기</span><Icon name="arrow" /></em>
            </a>
            <a className="benefit-item" href="https://yulgo.co.kr/member/join.html" target="_blank" rel="noreferrer">
              <img src={brandImages.signupBenefit} alt="" />
              <span className="benefit-text"><small>율고 공식몰 회원가입</small><strong>가입 즉시 3,000원 적립</strong></span>
              <em><span>가입하기</span><Icon name="arrow" /></em>
            </a>
          </div>
        </section>

        <section id="ritual" className="ritual-section">
          <img src={brandImages.ritual} alt="풍성한 거품과 함께 사용하는 율고 블루밍 리페어 샴푸" />
          <div className="ritual-overlay" />
          <div className="ritual-copy">
            <h2>씻어내는 <span className="keep">짧은 시간도</span><br /><em>모발을 위한 <span className="keep">케어가 되도록.</span></em></h2>
            <p>국내산 본초와 기능성 원료를 세심하게 배합해 편안한 사용감과 눈에 보이는 변화를 함께 고민합니다.</p>
            <a className="button button-light" href="#guide">사용 루틴 보기 <Icon name="arrow" /></a>
          </div>
        </section>

        <BottleScroll onExplore={() => setSelectedProduct(products[0])} />

        <section id="guide" className="guide-section">
          <div className="guide-video">
            {videoPlaying ? (
              <iframe
                src="https://www.youtube.com/embed/Aq_ySgeEA08?autoplay=1&rel=0"
                title="율고 사용방법 안내 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button className="guide-poster" type="button" onClick={() => setVideoPlaying(true)} aria-label="율고 사용방법 영상 재생">
                <img src={products[0].image} alt="율고 새치 염색샴푸 사용방법 영상 미리보기" />
                <span><Icon name="play" /></span>
              </button>
            )}
          </div>
          <div className="guide-copy">
            <h2>바쁜 하루에도<br /><em>샴푸하듯 간편하게</em></h2>
            <div className="steps">
              <div><span>01</span><p><strong>마른 모발에 도포</strong>새치가 신경 쓰이는 뿌리와 헤어라인부터 고르게 발라주세요.</p></div>
              <div><span>02</span><p><strong>충분히 핸들링</strong>샴푸하듯 꼼꼼히 문지른 뒤 모발 상태에 맞게 잠시 기다려주세요.</p></div>
              <div><span>03</span><p><strong>깨끗하게 헹굼</strong>미지근한 물로 잔여물이 남지 않도록 충분히 헹궈 마무리합니다.</p></div>
            </div>
            <a className="text-link dark" href="https://yulgo.co.kr/board/faq/list.html?board_no=3" target="_blank" rel="noreferrer">기존 사용방법 게시판 보기 <Icon name="arrow" /></a>
          </div>
        </section>

        <section id="reviews" className="reviews-section">
          <div className="reviews-heading section-heading">
            <h2>먼저 써본 고객들의<br /><em>솔직한 변화 이야기</em></h2>
            <p>기존 율고 공식몰과 외부 구매처에 등록된 실제 구매 후기를 옮겼습니다.</p>
          </div>

          <div className="testimonial-list">
            {testimonials.map((review) => (
              <article className="testimonial" key={review.title}>
                <div className="stars">{Array.from({ length: 5 }).map((_, star) => <Icon name="star" key={star} />)}</div>
                <h3>{review.title}</h3>
                <p>{review.body}</p>
                <footer><strong>{review.author}</strong><span>{review.source}</span></footer>
              </article>
            ))}
          </div>

          <div className="photo-review-heading">
            <strong>고객이 직접 남긴 사진 {reviewPhotos.length}</strong>
            <a className="button button-outline" href="https://yulgo.co.kr/board/review/list_photo.html?board_no=4" target="_blank" rel="noreferrer">리뷰 전체 보기 <Icon name="arrow" /></a>
          </div>
          <div className="photo-review-grid" aria-label="고객 포토 리뷰">
            {reviewPhotos.map((image, index) => (
              <button type="button" key={image} onClick={() => setSelectedPhoto(image)} aria-label={`${index + 1}번째 고객 후기 사진 크게 보기`}>
                <img src={image} loading="lazy" alt={`고객 포토 리뷰 ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section id="brand" className="brand-story">
          <img className="brand-story-bg" src={brandImages.storyHero} alt="자연 속 율고 브랜드 이야기" />
          <div className="brand-story-shade" />
          <div className="brand-story-copy">
            <h2>국내산 본초를 이용한<br className="br-wide" /> 바이오 <span className="keep">고기능성 헤어케어</span></h2>
            <p>국내산 본초를 이용하여 안전하고 확실하게 헤어케어를 책임지는 ‘율고’</p>
          </div>
        </section>

        <section className="brand-manifesto">
          <div className="manifesto-image">
            <img src={brandImages.storySquare} alt="율고 제품에 담긴 자연 유래 원료" />
          </div>
          <div className="manifesto-copy">
            <h2>믿을 수 있는 국내산 본초를<br />사용하여 생산합니다.</h2>
            <p>국내산 본초들을 활용해 믿고 사용할 수 있는 저자극 고기능 헤어케어 제품을 생산합니다. 엄격한 품질과 생산과정을 거쳐 고객의 만족을 이끌어 낼 수 있는 프리미엄 헤어케어 제품을 제안합니다.</p>

          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={brandImages.logo} alt="yulgo" />
            <p>자연을 담은 시간.<br />바이오 고기능성 헤어케어 브랜드 율고</p>
            <div className="footer-socials">
              <a href="http://pf.kakao.com/_xoqxalxj" target="_blank" rel="noreferrer"><img src={brandImages.kakaoSocial} alt="" /> Kakao</a>
              <a href="https://smartstore.naver.com/yulgo" target="_blank" rel="noreferrer"><img src={brandImages.naverSocial} alt="" /> Naver</a>
            </div>
          </div>
          <div className="footer-column">
            <span>SHOP</span>
            <a href="#products">모든 제품</a>
            <a href="#reviews">고객 리뷰</a>
            <a href="#guide">사용방법 안내</a>
            <a href="https://yulgo.co.kr/myshop/order/list.html" target="_blank" rel="noreferrer">주문/배송조회</a>
          </div>
          <div className="footer-column contact">
            <span>CUSTOMER CENTER</span>
            <a className="phone" href="tel:07080952251">070-8095-2251</a>
            <p>평일 10:00 – 17:00</p>
            <p>하나은행 105-910023-82904<br />예금주 비원바이오랩 주식회사</p>
          </div>
        </div>

        <div className="footer-company">
          <p>상호명 비원바이오랩 주식회사 <i /> 대표 양정, 이승준 <i /> 사업자등록번호 785-81-02374 <i /> 통신판매업신고 제2022-충남천안-1549호</p>
          <p>주소 충청남도 천안시 동남구 다가2길 46, 3층 354호 <i /> 개인정보보호책임자 양정 <i /> <a href="mailto:trust@biwonbiolab.com">trust@biwonbiolab.com</a></p>
          <div className="policy-links">
            <a href="https://yulgo.co.kr/member/privacy.html" target="_blank" rel="noreferrer">개인정보처리방침</a>
            <a href="https://yulgo.co.kr/member/agreement.html" target="_blank" rel="noreferrer">이용약관</a>
            <a href="https://yulgo.co.kr/shopinfo/guide.html" target="_blank" rel="noreferrer">이용안내</a>
          </div>
          <span className="copyright">© YULGO. All rights reserved.</span>
        </div>
      </footer>

      <div className="mobile-buy-bar">
        <button type="button" onClick={() => setSelectedProduct(products[0])}>상품 보기</button>
        <a href="https://yulgo.co.kr/product/detail.html?product_no=26" target="_blank" rel="noreferrer">공식몰 구매</a>
      </div>

      <a className="kakao-float" href="http://pf.kakao.com/_xoqxalxj/chat" target="_blank" rel="noreferrer" aria-label="카카오톡으로 율고에 상담하기">
        <img src={brandImages.kakaoIcon} alt="" />
        <span>상담톡</span>
      </a>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {selectedPhoto && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="이미지 크게 보기" onMouseDown={(event) => event.target === event.currentTarget && setSelectedPhoto(null)}>
          <button type="button" onClick={() => setSelectedPhoto(null)} aria-label="이미지 닫기"><Icon name="close" /></button>
          <img src={selectedPhoto} alt="선택한 율고 콘텐츠 확대 이미지" />
        </div>
      )}
    </div>
  )
}

export default App
