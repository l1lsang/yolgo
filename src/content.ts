export type Product = {
  id: 'color' | 'repair'
  label: string
  name: string
  shortName: string
  description: string
  volume: string
  price: number
  originalPrice?: number
  discount?: string
  reviewCount: number
  benefit: string
  image: string
  hero: string
  mobileHero: string
  link: string
  gallery: string[]
  detail: string[]
  options: string[]
  facts: { value: string; label: string }[]
}

const asset = (folder: string, file: string) =>
  `/images/source/${folder}/${file}`

const colorGallery = [
  '65397b0bca553f3fd7f4d927da34a781.jpg',
  '261824de886a005ba5040631a782e181.jpg',
  'b39a1ca8407dabdc7ee91e19d7f9242d.jpg',
  'c825f772137e024cde08beff48ca91a3.png',
  'c737b3401b69c4900e88b40d15c6462d.png',
  '1a7c6afb2d2f33a60955c128e5924838.jpg',
  'eb316634d8ee653ecf81a84a1257ea99.jpg',
  'f781dd4171525213d800044656870d22.jpg',
].map((file) => asset('gallery', file)).concat(
  asset('products', '1c80c1ca398b9528fff2d2fe684f8164.jpg'),
)

const repairGallery = [
  '8d19546cfc71c3c6875df954c05ee2e7.jpg',
  '83393e269a3d368fa2a6fff49d09bba8.jpg',
].map((file) => asset('gallery', file))

const colorDetail = [
  '2a1a0fba587fa020b1cbc42b1f1f22c4.jpg',
  '08dd8ef187f0e0f7625aa66914a483b8.jpg',
  'de68492c299d81ae9c05586c34d48f58.jpg',
  '5b38576eb77647d691b86ee4acd1b333.jpg',
  '2b1af55a0c2ec0fd440f3f91f7c5da5a.jpg',
  '183ef2f25d0d46066033dc89a6290e0f.jpg',
  '35be68dc714984b33735dd28a59159b3.jpg',
  'adfdec1d922297e6ec6b2b7624af2805.jpg',
  'c52028d6c91cb51893027db29c02624e.jpg',
  '2e6c4c1b3904003a2656771ca309f7a3.jpg',
  '93571db86c6015a536a99f68e59776cc.jpg',
  'fde1b43c8d7bd7e56cf788630b80b1e1.jpg',
  '5a12af415c24b12b4df247af787b4658.jpg',
  '1993d3e1e7eb1a224b3c92439d5cd4e4.jpg',
  'd8fe911d8e8879bba5b102417d9c5018.jpg',
  '0821cf6a1a62f1602e3ccf4594bb9d33.jpg',
  'a4303eec9d86b533586e5f90fc301167.jpg',
  'cb04be5343ed04524388e5e0d05bf036.jpg',
  'b3f6406d8328bda0de0f51948880af41.jpg',
  'd435e500201f7fb70922e4d09dbfc104.jpg',
  '5499dc02505672c7abcde36e277944f5.jpg',
  'e0cf7311ef26a6aa0c45240065252b82.jpg',
  'e28c07bf6ddc1bc39dd5d255d108553c.jpg',
  '122cfbc97bbb7cdfa8c4a7d1514710a2.jpg',
  '440a4b68c440ec03542852295ad378fc.jpg',
  'c70e327dfc04c4d8319bb6d0347af7ab.jpg',
  '42770443e9e27492bff659a18b10133f.jpg',
  '35707c1b46f35ee189c5f5419b11d447.jpg',
  'c8265c1551286ee44fe90b5b01f93633.jpg',
  'e0dfdd1d399dc443fe8f365eed25d05f.jpg',
  'b2ae64056d6a8ed7487380c3428bf536.jpg',
  'bbd40b06b0237fe0eedc76b10bce98d3.jpg',
  'd0c8aaeef7ed56cac3feaa9da91ce399.jpg',
].map((file) => asset('detail', file))

const repairDetail = [
  '1758256953508.png',
  '1758256954025.png',
  '1758256948034.png',
  '1758256955358.png',
  '1758256951576.png',
  '1758256944138.png',
  '1758256946240.png',
  '1758256954500.png',
  '1758256955801.png',
  '1758256943672.png',
  '1758256954937.png',
  '1758256943290.png',
  '1758256945369.png',
  '1758256944015.png',
  '1758256952165.png',
].map((file) => asset('detail', file))

export const products: Product[] = [
  {
    id: 'color',
    label: 'BEST · GRAY COVER',
    name: '율고 자연을 담은 시간 순한 새치 염색샴푸 200ml',
    shortName: '순한 새치 염색샴푸',
    description: '대한민국 자연의 본초를 담아 만든 두피 저자극 새치 염색샴푸',
    volume: '200ml',
    price: 26600,
    originalPrice: 28000,
    discount: '5%',
    reviewCount: 1895,
    benefit: '무료배송 · 1,330원 적립',
    image: asset('products', '61dc7bc2a3dddd1c52ad8cd79a09f108.jpg'),
    hero: asset('brand', '6ad91cd2a0402b9e0521aafacb7f5aa7.png'),
    mobileHero: asset('brand', '980767550187bdcd6b7a6945cd976b6f.png'),
    link: 'https://yulgo.co.kr/product/detail.html?product_no=26',
    gallery: colorGallery,
    detail: colorDetail,
    options: [
      '색상 · 흑갈색 / 자연갈색 / 색상혼합',
      '구성 · 1개 단품 / 2개 / 3개 / 4개 / 5개 세트',
    ],
    facts: [
      { value: 'EXCELLENT', label: '독일 더마테스트' },
      { value: '3–10분', label: '간편한 사용 시간' },
      { value: '1,895', label: '누적 리뷰' },
    ],
  },
  {
    id: 'repair',
    label: 'NEW · DAMAGE REPAIR',
    name: '율고 블루밍 데미지 리페어 샴푸 500ml',
    shortName: '블루밍 리페어 샴푸',
    description: '국산 생강추출물과 쌀겨수로 가는 모발의 볼륨과 손상모 케어를 한 번에',
    volume: '500ml',
    price: 26500,
    originalPrice: 28000,
    reviewCount: 109,
    benefit: '회원 혜택 · 세트 구매 할인',
    image: asset('products', '743ea8fce43b5632ae2673e43fa6e5c8.jpg'),
    hero: asset('brand', '555594e4735f6640218ae9934b230a76.png'),
    mobileHero: asset('brand', 'bd0ebcd43952d4548df0c8202e3018ee.png'),
    link: 'https://yulgo.co.kr/product/detail.html?product_no=25',
    gallery: repairGallery,
    detail: repairDetail,
    options: [
      '1개 단품 · 26,500원',
      '2개 세트 · 45,500원 (개당 22,750원)',
    ],
    facts: [
      { value: '68%', label: '7일 후 손상모 개선' },
      { value: '35%', label: '쌀겨수 함유' },
      { value: '500ml', label: '넉넉한 용량' },
    ],
  },
]

export const testimonials = [
  {
    title: '단 3~4분, 1회 사용만으로 놀랐어요',
    body: '눈이 따갑지도 않고 염색약 냄새도 없어요. 전체적으로 머리색이 진해진 게 보여서 앞으로 계속 사용하게 될 것 같아요.',
    author: '김****',
    source: '쿠팡 구매평',
  },
  {
    title: '염색이 쉽고 간편해요',
    body: '마른 머리에 고루 바르고 5분쯤 뒤 감아도 염색이 잘 되네요. 이후에는 일주일에 한두 번 사용하고 있어요.',
    author: '박****',
    source: '쿠팡 구매평',
  },
  {
    title: '진작에 이걸 살걸',
    body: '한 번 사용만에 어두워지더니 이제는 원래 머리처럼 보여요. 아버지도 앞으로 이것만 주문해 달라고 하십니다.',
    author: '송****',
    source: '쿠팡 구매평',
  },
  {
    title: '세 번 만에 흰머리가 사라졌어요',
    body: '헤어라인과 구레나룻 위주로 세 번 사용했는데 흰머리가 거의 안 보여요. 미용실 가는 횟수를 줄일 수 있어 만족합니다.',
    author: '김****',
    source: '쿠팡 구매평',
  },
  {
    title: '정말 효녀템!',
    body: '경계선이 하얗게 보이지 않고 눈 시림과 냄새도 없어 편하다고 하세요. 자연스럽게 커버되어 대만족입니다.',
    author: '이****',
    source: '쿠팡 구매평',
  },
  {
    title: '벌써 세 번째 구입',
    body: '향도 좋고 머리가 엉키지 않아요. 오히려 부드러워지는 느낌이라 여기저기 입소문 내는 중입니다.',
    author: '김****',
    source: '쿠팡 구매평',
  },
]

export const reviewPhotos = [
  '6eae7559d9a46a24b2a16f5a75d36024.jpg',
  '48f16a2b7582662a2222ecf74d7890e8.jpg',
  '25505a1b984a41c864aa5ceb6c47fb31.jpg',
  'e79ac98c1732c3adc7996c58f3db70ca.jpg',
  '6949518e70b9d3dbbff47f61174786cc.jpg',
  'f348670d7c846d2e07053340ed5a2f76.jpg',
  'f7929d1facbd092c1e40485a797400db.jpg',
  '39d87a3ad09bfdc67ffdb31cae71bf6f.jpg',
  '27300dedad11ea83e9a0f319db83c09b.jpg',
  'a3cc5ddf03c1197ea73c1cbc87de48c3.jpeg',
  'd00e14c01d901e5f2cc1e280cc0b2098.jpg',
  'aeea48c45ecca56e759804caf152f907.jpg',
  'c968e1b6b7b9df44734cbd512697a834.jpg',
  '063ed236d34533eafd9cbe6838a921f8.jpg',
  '01ec8156dc6c95cda11fd5cbc0996938.jpeg',
  'd05260027e27aa0d77f842b54d6fdc1c.jpg',
  'd38abdb225a61c8d18aa95bbac955112.jpg',
  '6cebd1332eace5624db1384f75190889.jpg',
  '8156eb3fb8965caa6fda5d12634dca4f.jpg',
  '42193862b6d56c88392fc8cfb46587e8.jpg',
  '44e4a6a59c6dd119796617b048fd62e5.jpg',
  '411c34008fb8035f21c173b548ad8059.jpg',
  '92cd0c886819f5f1fa0602e0960fe254.jpg',
  '876bd96b77238febc0ebc56dff32e60b.jpg',
  'e27190e994b83e0c13f82f1511639e8e.png',
  '993d30e621b50535d1ca7d69760ff519.jpg',
  '5feb7a9aadcb6c439ab8a5d73ab9e873.jpg',
  'cbe80b20ceae886b7cf53264dbb187ac.jpg',
].map((file) => asset('reviews', file))

export const brandImages = {
  logo: asset('brand', 'c796b9c308d3fe20e54a07650bcc4063.png'),
  mobileLogo: asset('brand', 'f7dcb867bf1b0f47e6073518acc8aaf5.png'),
  kakaoIcon: asset('brand', '3ab12293eb19df4f68ad58597c5ff048.png'),
  kakaoSocial: asset('brand', '29edd513472d45a97016b3fe9c8e4a55.svg'),
  naverSocial: asset('brand', '3924d3dc24c02ce54d83d0aa18c9d0ac.png'),
  storyHero: asset('brand', 'aeddc0a83bc2045ffb5bb968de7ebd64.png'),
  storySquare: asset('brand', '0df98d9f95f27a17cc088e551a0a4ddd.png'),
  ritual: asset('brand', 'ccd04e66a47bcd95135420b9a6227f18.png'),
  repairBanner: asset('brand', '82c8e98134b254ee8e07a22358f3332d.png'),
  repairBannerMobile: asset('brand', 'e730d9fe37624347021073f4080ffa6b.png'),
  colorBanner: asset('brand', 'd89c5dae8af34316bfa8f8bd4f6b4d8d.png'),
  colorBannerMobile: asset('brand', '3ce0ca982f7549f38e85febabba320aa.png'),
  kakaoBenefit: asset('brand', '401922357ff148fa7c625177bd863442.png'),
  signupBenefit: asset('brand', 'e0755f087e7daeb462adb4911f141352.png'),
}
