// Real photos from Unsplash (free to use under the Unsplash License:
// https://unsplash.com/license). Served from Unsplash's image CDN, resized on the fly.
// Swap these for each shop's own product photos once merchants upload them.

/** Build a resized Unsplash URL. */
export const unsplash = (id, width = 480, height) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ''}&q=70`

export const STORE_PHOTOS = {
  'greengrocer-central': 'photo-1583258292688-d0213dc5a3a8',
  'bakers-corner': 'photo-1568254183919-78a4f43a2877',
  'urban-mart': 'photo-1604719312566-8912e9227c6a',
  'metro-pharmacy': 'photo-1765031092161-a9ebe556117e',
  'natures-best': 'photo-1687199127283-2bb87b8a92fc',
  'chai-and-co': 'photo-1792318970237-3011e0381213',
  'daily-mart': 'photo-1641440616173-7241e6fe6be9',
}

export const PRODUCT_PHOTOS = {
  bananas: 'photo-1587132137056-bfbf0166836e',
  coldbrew: 'photo-1771210849472-84a07b2e793a',
  sourdough: 'photo-1613396874083-2d5fbe59ae79',
  avocados: 'photo-1519162808019-7de1683fa2ad',
  honey: 'photo-1587049352851-8d4e89133924',
  tomatoes: 'photo-1582284540020-8acbe03f4924',
  apples: 'photo-1560806887-1e4cd0b6cbd6',
  milk: 'photo-1550583724-b2692b85b150',
  eggs: 'photo-1639194335563-d56b83f0060c',
  paneer: 'photo-1631452180519-c014fe946bc7',
  rice: 'photo-1536304993881-ff6e9eefa2a6',
  croissant: 'photo-1623334044303-241021148842',
  baguette: 'photo-1691862469586-9c7c183b27b7',
  muffin: 'photo-1607958996333-41aef7caefaa',
  cookies: 'photo-1598839950984-034f6dc7b495',
  cake: 'photo-1606983340126-99ab4feaa64a',
  cappuccino: 'photo-1509042239860-f550ce710b93',
  detergent: 'photo-1642429948123-bb852afcb0f1',
  towels: 'photo-1631524254770-03abe3f42a0d',
  toothpaste: 'photo-1712168044214-f5a272c23a5b',
  soap: 'photo-1775210603565-37cc9269326f',
  noodles: 'photo-1569718212165-3a8278d5f624',
  biscuits: 'photo-1558961363-fa8fdf82db35',
  'vitamin-c': 'photo-1607619056574-7b8d3ee536b2',
  paracetamol: 'photo-1631549916768-4119b2e5f926',
  bandages: 'photo-1776047129625-50b8c7299705',
  sanitizer: 'photo-1583947582886-f40ec95dd752',
  thermometer: 'photo-1594790628624-9e563bea851d',
  ors: 'photo-1741520504868-2cd8f940f977',
  spinach: 'photo-1576045057995-568f588f82fb',
  carrots: 'photo-1598170845058-32b9d6a5da37',
  quinoa: 'photo-1708949125682-c0cb09727101',
  oats: 'photo-1584970922591-5b91e5f927a9',
  almonds: 'photo-1608797178974-15b35a64ede9',
  kombucha: 'photo-1765978856533-5e97d9e4cd38',
  'masala-chai': 'photo-1761483281417-778013dc0177',
  'filter-coffee': 'photo-1758221054731-744af4bf4d68',
  samosa: 'photo-1601050690597-df0568f70950',
  sandwich: 'photo-1528735602780-2552fd46c7af',
  'vada-pav': 'photo-1769030905851-c0e0a4fe5c51',
  bread: 'photo-1534620808146-d33bb39128b2',
  butter: 'photo-1603596310923-dbb12732f9c7',
  onions: 'photo-1618512496248-a07fe83aa8cb',
  potatoes: 'photo-1518977676601-b53f82aba655',
  cola: 'photo-1648569883125-d01072540b4c',
}

export const storePhoto = (storeId, width = 640, height = 400) =>
  STORE_PHOTOS[storeId] ? unsplash(STORE_PHOTOS[storeId], width, height) : null

export const productPhoto = (productId, width = 400) =>
  PRODUCT_PHOTOS[productId] ? unsplash(PRODUCT_PHOTOS[productId], width, width) : null
