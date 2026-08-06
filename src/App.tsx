import { useEffect, useState } from 'react'
import './App.css'
import {
  brandImages,
  products,
  reviewPhotos,
  testimonials,
  type Product,
} from './content'

const formatPrice = (price: number) => `${price.toLocaleString('ko-KR')}원`

type EditorialSlide = {
  image: string
  mobileImage?: string
  label: string
  title: string
  description: string
}

const editorialSlides: EditorialSlide[] = [
  {
    image: brandImages.colorBanner,
    mobileImage: brandImages.colorBannerMobile,
    label: 'COLOR RITUAL',
    title: '순하게 물드는 시간',
    description: '매일의 샴푸 루틴에 자연스럽게 스며드는 새치 케어',
  },
  ...products.flatMap((product) => product.gallery.map((image, index) => ({
    image,
    label: product.id === 'color' ? 'COLOR TEXTURE' : 'REPAIR TEXTURE',
    title: product.id === 'color' ? '본초가 만든 깊은 컬러' : '쌀과 생강의 영양감',
    description: `${product.shortName} 제품 연출 이미지 ${index + 1}`,
  }))),
  {
    image: brandImages.repairBanner,
    mobileImage: brandImages.repairBannerMobile,
    label: 'REPAIR RITUAL',
    title: '손상모에 채우는 밀도',
    description: '쌀겨수와 생강추출물로 완성한 데일리 리페어 루틴',
  },
]

const heroArtwork: Record<string, string> = {
  color: '/images/generated/yulgo-color-hero-v2.png',
  repair: '/images/generated/yulgo-repair-hero-v2.png',
}

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
            <span className="eyebrow">{product.label}</span>
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

function App() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const activeProduct = products[heroIndex]
  const activeSlide = editorialSlides[galleryIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % products.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let animationFrame = 0

    const updateScrollEffects = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      document.documentElement.style.setProperty('--scroll-progress', `${progress * 100}%`)
      document.documentElement.style.setProperty('--page-shift', `${Math.min(window.scrollY * 0.04, 80)}px`)
    }

    const onPointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
      })
    }

    updateScrollEffects()
    window.addEventListener('scroll', updateScrollEffects, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', updateScrollEffects)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
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

  const updateTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`)
    event.currentTarget.style.setProperty('--shine-x', `${x * 100}%`)
    event.currentTarget.style.setProperty('--shine-y', `${y * 100}%`)
  }

  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div className="site-shell">
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <div className="pointer-aura" aria-hidden="true" />
      <a className="skip-link" href="#main">본문으로 바로가기</a>

      <div className="announcement">
        <span className="announcement-kakao">TALK</span>
        카톡 친구 추가 시 <strong>2,000원 할인 쿠폰</strong>
        <a href="http://pf.kakao.com/_xoqxalxj" target="_blank" rel="noreferrer">혜택 받기 <Icon name="arrow" /></a>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
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
          <span>WELCOME BENEFIT</span>
          <strong>회원가입 즉시 3,000원 적립</strong>
        </div>
      </div>

      <main id="main">
        <section id="top" className={`hero hero-${activeProduct.id}`} aria-label="율고 대표 상품">
          <div className="hero-aurora hero-aurora-one" aria-hidden="true" />
          <div className="hero-aurora hero-aurora-two" aria-hidden="true" />
          <div className="hero-prism hero-prism-one" aria-hidden="true" />
          <div className="hero-prism hero-prism-two" aria-hidden="true" />
          <div className="hero-sparks" aria-hidden="true"><i /><i /><i /><i /></div>
          <span className="hero-wordmark" aria-hidden="true">YULGO</span>
          <div className="hero-media" aria-live="polite">
            {products.map((product, index) => (
              <picture className={index === heroIndex ? 'active' : ''} key={product.id}>
                <source media="(max-width: 700px)" srcSet={product.mobileHero} />
                <img src={heroArtwork[product.id] ?? product.hero} alt="" />
              </picture>
            ))}
          </div>
          <div className="hero-inner">
            <div className="hero-copy" key={activeProduct.id}>
              <span className="eyebrow">NATURE, TIME &amp; HAIR</span>
              {activeProduct.id === 'color' ? (
                <h1>새치는 가볍게,<br /><em>자연은 깊게.</em></h1>
              ) : (
                <h1>손상은 가볍게,<br /><em>윤기는 깊게.</em></h1>
              )}
              <p>{activeProduct.id === 'color' ? '3–10분, 샴푸하듯 간편하게 시작하는 두피 저자극 새치 케어' : '쌀겨수와 생강추출물로 채우는 데일리 고농축 데미지 리페어'}</p>
              <div className="hero-actions">
                <button className="button button-dark" type="button" onClick={() => setSelectedProduct(activeProduct)}>
                  제품 경험하기 <Icon name="arrow" />
                </button>
                <a className="text-link" href={activeProduct.link} target="_blank" rel="noreferrer">공식몰 구매 <Icon name="arrow" /></a>
              </div>
            </div>
          </div>

          <div className="hero-proof" aria-label={`${activeProduct.shortName} 핵심 정보`}>
            {activeProduct.facts.map((fact) => (
              <div key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
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
          <div className="hero-edition" aria-hidden="true">
            <span>YULGO<br />HAIR LAB</span>
            <strong>01—26</strong>
          </div>
        </section>

        <section className="trust-strip" aria-label="율고 핵심 혜택">
          <div><strong>2,004<small>+</small></strong><span>두 제품 누적 리뷰</span></div>
          <div><strong>68<small>%</small></strong><span>7일 후 손상모 개선</span></div>
          <div><strong>3–10<small>MIN</small></strong><span>샴푸하듯 간편한 루틴</span></div>
          <div><strong>35<small>%</small></strong><span>국내산 쌀겨수 함유</span></div>
        </section>

        <section id="products" className="section products-section">
          <div className="section-heading" data-reveal>
            <span className="eyebrow">THE YULGO COLLECTION</span>
            <h2>오늘의 모발에 필요한<br /><em>두 가지 자연의 시간</em></h2>
            <p>새치 커버부터 손상모 리페어까지. 율고의 두 제품을 한눈에 비교해 보세요.</p>
          </div>

          <div className="product-grid">
            {products.map((product, index) => (
              <article className={`product-card product-card-${product.id}`} data-reveal key={product.id} style={{ '--delay': `${index * 120}ms` } as React.CSSProperties}>
                <span className="product-card-number" aria-hidden="true">0{index + 1}</span>
                <button className="product-image-button tilt-surface" type="button" onPointerMove={updateTilt} onPointerLeave={resetTilt} onClick={() => setSelectedProduct(product)} aria-label={`${product.shortName} 상세 보기`}>
                  <img src={product.image} alt={product.shortName} />
                  <span>VIEW DETAILS <Icon name="plus" /></span>
                </button>
                <div className="product-info">
                  <span className="eyebrow">{product.label}</span>
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
        </section>

        <section className="kinetic-band" aria-label="율고 브랜드 키워드">
          <div className="kinetic-track" aria-hidden="true">
            {[0, 1].map((loop) => (
              <div key={loop}>
                <span>NATURE</span><i>×</i><span>SCIENCE</span><i>×</i><span>TIME</span><i>×</i><strong>YULGO</strong><i>×</i>
              </div>
            ))}
          </div>
        </section>

        <section className="formula-universe" aria-labelledby="formula-title">
          <div className="formula-noise" aria-hidden="true" />
          <div className="formula-comet" aria-hidden="true" />
          <span className="formula-index" aria-hidden="true">FORMULA 01 / 02</span>
          <div className="formula-copy" data-reveal>
            <span className="eyebrow">YULGO HAIR LAB</span>
            <h2 id="formula-title">자연은 깊게,<br /><em>효능은 선명하게.</em></h2>
            <p>익숙한 자연 원료를 오늘의 헤어 고민에 맞는 비율과 방식으로 다시 설계합니다.</p>
          </div>
          <div className="formula-orbit" aria-label="율고 제품 핵심 수치">
            <div className="orbit-ring orbit-ring-one" aria-hidden="true" />
            <div className="orbit-ring orbit-ring-two" aria-hidden="true" />
            <div className="formula-core"><small>YULGO</small><strong>本草</strong><span>HAIR FORMULA</span></div>
            <div className="formula-node node-one"><strong>35%</strong><span>국내산 쌀겨수</span></div>
            <div className="formula-node node-two"><strong>68%</strong><span>손상모 개선</span></div>
            <div className="formula-node node-three"><strong>3–10</strong><span>간편한 사용 시간</span></div>
            <div className="formula-node node-four"><strong>EXCELLENT</strong><span>더마테스트</span></div>
          </div>
        </section>

        <section id="ritual" className="ritual-section">
          <img src={brandImages.ritual} alt="풍성한 거품과 함께 사용하는 율고 블루밍 리페어 샴푸" />
          <div className="ritual-overlay" />
          <div className="ritual-scan" aria-hidden="true" />
          <span className="ritual-wordmark" aria-hidden="true">RITUAL</span>
          <div className="ritual-copy" data-reveal>
            <span className="eyebrow">OUR STANDARD</span>
            <h2>씻어내는 짧은 시간도<br /><em>모발을 위한 케어가 되도록.</em></h2>
            <p>국내산 본초와 기능성 원료를 세심하게 배합해 편안한 사용감과 눈에 보이는 변화를 함께 고민합니다.</p>
            <a className="button button-light" href="#guide">사용 루틴 보기 <Icon name="arrow" /></a>
          </div>
          <div className="ritual-stats">
            <div><strong>35<small>%</small></strong><span>쌀겨수 함유</span></div>
            <div><strong>68<small>%</small></strong><span>7일 후 손상모 개선</span></div>
            <div><strong>EXCELLENT</strong><span>더마테스트 등급</span></div>
          </div>
        </section>

        <section className="showcase-section" aria-labelledby="showcase-title">
          <div className="showcase-ambient" aria-hidden="true">
            <img key={activeSlide.image} src={activeSlide.image} alt="" />
          </div>
          <div className="showcase-prism" aria-hidden="true" />
          <div className="showcase-heading" data-reveal>
            <span className="eyebrow">TEXTURE &amp; RITUAL</span>
            <h2 id="showcase-title">한 장면씩 천천히,<br /><em>율고의 결을 보다.</em></h2>
          </div>
          <div className="showcase-stage" data-reveal>
            <button className={`showcase-image tilt-surface ${activeSlide.mobileImage ? 'showcase-image-banner' : ''}`} type="button" onPointerMove={updateTilt} onPointerLeave={resetTilt} onClick={() => setSelectedPhoto(activeSlide.image)} aria-label={`${activeSlide.description} 크게 보기`}>
              <picture key={activeSlide.image}>
                {activeSlide.mobileImage && <source media="(max-width: 700px)" srcSet={activeSlide.mobileImage} />}
                <img src={activeSlide.image} alt={activeSlide.description} />
              </picture>
              <span className="showcase-expand"><Icon name="plus" /> EXPAND</span>
            </button>
            <div className="showcase-caption">
              <span>{String(galleryIndex + 1).padStart(2, '0')} / {String(editorialSlides.length).padStart(2, '0')}</span>
              <div><small>{activeSlide.label}</small><strong>{activeSlide.title}</strong></div>
              <div className="showcase-arrows">
                <button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + editorialSlides.length) % editorialSlides.length)} aria-label="이전 이미지"><Icon name="chevronLeft" /></button>
                <button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % editorialSlides.length)} aria-label="다음 이미지"><Icon name="chevronRight" /></button>
              </div>
            </div>
            <div className="showcase-index" aria-label="율고 이미지 선택">
              {editorialSlides.map((slide, index) => (
                <button type="button" key={`${slide.image}-${index}`} className={index === galleryIndex ? 'active' : ''} onClick={() => setGalleryIndex(index)} aria-label={`${index + 1}번 이미지 ${slide.title}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="guide-section">
          <div className="guide-video" data-reveal>
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
                <em>PLAY GUIDE FILM</em>
              </button>
            )}
          </div>
          <div className="guide-copy" data-reveal>
            <span className="eyebrow">HOW TO USE YULGO</span>
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
          <div className="reviews-heading section-heading" data-reveal>
            <span className="eyebrow">REAL REVIEWS</span>
            <h2>먼저 써본 고객들의<br /><em>솔직한 변화 이야기</em></h2>
            <p>기존 율고 공식몰과 외부 구매처에 등록된 실제 구매 후기를 옮겼습니다.</p>
          </div>

          <div className="testimonial-track">
            {testimonials.map((review, index) => (
              <article className="testimonial" key={review.title} data-reveal style={{ '--delay': `${(index % 3) * 80}ms` } as React.CSSProperties}>
                <div className="stars">{Array.from({ length: 5 }).map((_, star) => <Icon name="star" key={star} />)}</div>
                <h3>{review.title}</h3>
                <p>{review.body}</p>
                <footer><strong>{review.author}</strong><span>{review.source}</span></footer>
              </article>
            ))}
          </div>

          <div className="photo-review-heading">
            <span>PHOTO REVIEWS</span>
            <strong>고객이 직접 남긴 사진 {reviewPhotos.length}</strong>
          </div>
          <div className="photo-review-track" aria-label="고객 포토 리뷰">
            {reviewPhotos.map((image, index) => (
              <button type="button" key={image} onClick={() => setSelectedPhoto(image)} aria-label={`${index + 1}번째 고객 후기 사진 크게 보기`}>
                <img src={image} loading="lazy" alt={`고객 포토 리뷰 ${index + 1}`} />
              </button>
            ))}
          </div>
          <a className="button button-outline" href="https://yulgo.co.kr/board/review/list_photo.html?board_no=4" target="_blank" rel="noreferrer">리뷰 전체 보기 <Icon name="arrow" /></a>
        </section>

        <section id="brand" className="brand-story">
          <img className="brand-story-bg" src={brandImages.storyHero} alt="자연 속 율고 브랜드 이야기" />
          <div className="brand-story-shade" />
          <div className="brand-story-copy" data-reveal>
            <span className="eyebrow">ABOUT YULGO</span>
            <h2>국내산 본초를 이용한<br />바이오 고기능성 헤어케어</h2>
            <p>국내산 본초를 이용하여 안전하고 확실하게 헤어케어를 책임지는 ‘율고’</p>
          </div>
        </section>

        <section className="brand-manifesto">
          <div className="manifesto-image" data-reveal>
            <img src={brandImages.storySquare} alt="율고 제품에 담긴 자연 유래 원료" />
          </div>
          <div className="manifesto-copy" data-reveal>
            <span className="eyebrow">OUR PROMISE</span>
            <h2>믿을 수 있는 국내산 본초를<br />사용하여 생산합니다.</h2>
            <p>국내산 본초들을 활용해 믿고 사용할 수 있는 저자극 고기능 헤어케어 제품을 생산합니다. 엄격한 품질과 생산과정을 거쳐 고객의 만족을 이끌어 낼 수 있는 프리미엄 헤어케어 제품을 제안합니다.</p>
            <div className="manifesto-sign">Nature · Science · Time</div>
          </div>
        </section>

        <section className="benefits-section">
          <a href="http://pf.kakao.com/_xoqxalxj" target="_blank" rel="noreferrer" className="benefit-card kakao" data-reveal>
            <img src={brandImages.kakaoBenefit} alt="" />
            <div><span>KAKAO CHANNEL</span><strong>채널 추가하고<br />2,000원 할인 쿠폰</strong><em>혜택 받기 <Icon name="arrow" /></em></div>
          </a>
          <a href="https://yulgo.co.kr/member/join.html" target="_blank" rel="noreferrer" className="benefit-card signup" data-reveal>
            <img src={brandImages.signupBenefit} alt="" />
            <div><span>WELCOME BENEFIT</span><strong>회원가입 즉시<br />3,000원 적립</strong><em>가입하기 <Icon name="arrow" /></em></div>
          </a>
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
