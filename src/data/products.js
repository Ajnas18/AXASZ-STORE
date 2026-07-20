export const PRODUCTS = [
  // NIKE
  { id: 1, productCode: "AXS0011", brand: "Nike", name: "Nike Air Force 1", price: 10000, originalPrice: 10800, rating: 4.8, reviews: 342, badge: "Best Seller", sizes: [6, 7, 8, 9, 10, 11], colors: ["White"], image: "/sneaker.png" },
  { id: 2, productCode: "AXS0012", brand: "Nike", name: "Nike Air Max 270", price: 13300, originalPrice: 13300, rating: 4.7, reviews: 215, badge: null, sizes: [7, 8, 9, 10, 11], colors: ["Black", "White/Red"], image: "/sneaker.png" },
  { id: 3, productCode: "AXS0013", brand: "Nike", name: "Nike Dunk Low", price: 9500, originalPrice: 9500, rating: 4.9, reviews: 1024, badge: "Hot", sizes: [7, 8, 9, 10], colors: ["Panda"], image: "/sneaker.png" },
  { id: 4, productCode: "AXS0014", brand: "Jordan", name: "Air Jordan 1 High", price: 15000, originalPrice: 15000, rating: 4.9, reviews: 3450, badge: "Premium", sizes: [7, 8, 9, 10, 11], colors: ["Chicago", "Bred", "Royal"], image: "/sneaker.png" },
  { id: 5, productCode: "AXS0015", brand: "Jordan", name: "Air Jordan 1 Low", price: 9500, originalPrice: 9500, rating: 4.8, reviews: 1245, badge: "Best Seller", sizes: [6, 7, 8, 9, 10, 11], colors: ["Shadow", "Bred Toe"], image: "/sneaker.png" },
  { id: 6, productCode: "AXS0016", brand: "Nike", name: "Nike Pegasus 41", price: 11600, originalPrice: 11600, rating: 4.8, reviews: 512, badge: "New Arrival", sizes: [7, 8, 9, 10, 11], colors: ["White/Volt", "Black"], image: "/sneaker.png" },

  // PUMA
  { id: 7, productCode: "AXS0017", brand: "Puma", name: "Puma RS-X", price: 9100, originalPrice: 10000, rating: 4.5, reviews: 89, badge: null, sizes: [6, 7, 8, 9, 10], colors: ["White/Blue"], image: "/sneaker.png" },
  { id: 8, productCode: "AXS0018", brand: "Puma", name: "Puma Suede Classic", price: 6200, originalPrice: 6200, rating: 4.7, reviews: 432, badge: "Classic", sizes: [6, 7, 8, 9, 10, 11], colors: ["Black", "Red"], image: "/sneaker.png" },
  { id: 9, productCode: "AXS0019", brand: "Puma", name: "Puma Future Rider", price: 7500, originalPrice: 8300, rating: 4.6, reviews: 145, badge: "Sale", sizes: [7, 8, 9, 10, 11], colors: ["Black/White", "Grey"], image: "/sneaker.png" },
  { id: 10, productCode: "AXS0020", brand: "Puma", name: "Puma Velocity Nitro", price: 10000, originalPrice: 10000, rating: 4.8, reviews: 112, badge: "Performance", sizes: [8, 9, 10, 11], colors: ["Lava", "Black"], image: "/sneaker.png" },

  // NEW BALANCE
  { id: 11, productCode: "AXS0021", brand: "New Balance", name: "New Balance 550", price: 9100, originalPrice: 10000, rating: 4.9, reviews: 876, badge: "Best Seller", sizes: [7, 8, 9, 10, 11], colors: ["White/Green", "White/Navy"], image: "/sneaker.png" },
  { id: 12, productCode: "AXS0022", brand: "New Balance", name: "New Balance 9060", price: 12500, originalPrice: 12500, rating: 4.8, reviews: 231, badge: "Hot", sizes: [7, 8, 9, 10], colors: ["Sea Salt", "Black"], image: "/sneaker.png" },
  { id: 13, productCode: "AXS0023", brand: "New Balance", name: "New Balance 574", price: 7100, originalPrice: 7100, rating: 4.7, reviews: 1098, badge: "Classic", sizes: [6, 7, 8, 9, 10, 11], colors: ["Core Grey", "Navy", "Black"], image: "/sneaker.png" },
  { id: 14, productCode: "AXS0024", brand: "New Balance", name: "New Balance 327", price: 8300, originalPrice: 8300, rating: 4.8, reviews: 543, badge: "Trending", sizes: [6, 7, 8, 9, 10], colors: ["Sea Salt", "Rust"], image: "/sneaker.png" },

  // ADIDAS
  { id: 15, productCode: "AXS0025", brand: "Adidas", name: "Adidas Samba", price: 8300, originalPrice: 8300, rating: 4.9, reviews: 1540, badge: "Trending", sizes: [6, 7, 8, 9, 10, 11], colors: ["White/Black", "Black/White"], image: "/sneaker.png" },
  { id: 16, productCode: "AXS0026", brand: "Adidas", name: "Adidas Gazelle", price: 8300, originalPrice: 8300, rating: 4.7, reviews: 654, badge: null, sizes: [6, 7, 8, 9, 10, 11], colors: ["Navy", "Red", "Black"], image: "/sneaker.png" },
  { id: 17, productCode: "AXS0027", brand: "Adidas", name: "Adidas Ultraboost", price: 15800, originalPrice: 15800, rating: 4.7, reviews: 890, badge: "New", sizes: [7, 8, 9, 10, 11], colors: ["Cloud White", "Core Black"], image: "/sneaker.png" },
  { id: 18, productCode: "AXS0028", brand: "Adidas", name: "Adidas Campus 00s", price: 9100, originalPrice: 9100, rating: 4.8, reviews: 432, badge: "Hot", sizes: [6, 7, 8, 9, 10], colors: ["Core Black", "Grey", "Green"], image: "/sneaker.png" },

  // CONVERSE
  { id: 19, productCode: "AXS0029", brand: "Converse", name: "Converse Chuck Taylor", price: 5400, originalPrice: 5400, rating: 4.8, reviews: 2045, badge: "Classic", sizes: [6, 7, 8, 9, 10, 11], colors: ["Black", "White", "Parchment"], image: "/sneaker.png" },
  { id: 20, productCode: "AXS0030", brand: "Converse", name: "Converse Run Star Hike", price: 9100, originalPrice: 9100, rating: 4.7, reviews: 342, badge: "Trending", sizes: [6, 7, 8, 9, 10], colors: ["Black", "White"], image: "/sneaker.png" },
  { id: 21, productCode: "AXS0031", brand: "Converse", name: "Converse Chuck 70", price: 7100, originalPrice: 7100, rating: 4.9, reviews: 890, badge: "Premium", sizes: [7, 8, 9, 10, 11], colors: ["Vintage Canvas"], image: "/sneaker.png" },

  // VANS
  { id: 22, productCode: "AXS0032", brand: "Vans", name: "Vans Old Skool", price: 5800, originalPrice: 5800, rating: 4.8, reviews: 1560, badge: "Classic", sizes: [6, 7, 8, 9, 10, 11], colors: ["Black/White", "Navy"], image: "/sneaker.png" },
  { id: 23, productCode: "AXS0033", brand: "Vans", name: "Vans Knu Skool", price: 6200, originalPrice: 6200, rating: 4.7, reviews: 210, badge: "Trending", sizes: [7, 8, 9, 10], colors: ["Black/White"], image: "/sneaker.png" },
  { id: 24, productCode: "AXS0034", brand: "Vans", name: "Vans Sk8-Hi", price: 6600, originalPrice: 6600, rating: 4.8, reviews: 780, badge: null, sizes: [7, 8, 9, 10, 11], colors: ["Black/White", "True White"], image: "/sneaker.png" },

  // ADDED NEW PRODUCTS
  { id: 25, productCode: "AXS0035", brand: "Nike", name: "Nike Blazer Mid 77", price: 8500, originalPrice: 9000, rating: 4.6, reviews: 412, badge: "Classic", sizes: [7, 8, 9, 10, 11], colors: ["White/Black"], image: "/sneaker.png" },
  { id: 26, productCode: "AXS0036", brand: "Adidas", name: "Adidas NMD_R1", price: 12000, originalPrice: 13000, rating: 4.8, reviews: 875, badge: "Popular", sizes: [6, 7, 8, 9, 10], colors: ["Core Black"], image: "/sneaker.png" },
  { id: 27, productCode: "AXS0037", brand: "Vans", name: "Vans Classic Slip-On", price: 4500, originalPrice: 4500, rating: 4.7, reviews: 1024, badge: "Essential", sizes: [6, 7, 8, 9, 10, 11], colors: ["Checkerboard"], image: "/sneaker.png" },
  { id: 28, productCode: "AXS0038", brand: "Puma", name: "Puma Slipstream", price: 8000, originalPrice: 9000, rating: 4.5, reviews: 234, badge: null, sizes: [7, 8, 9, 10], colors: ["White/Green"], image: "/sneaker.png" },
  { id: 29, productCode: "AXS0039", brand: "New Balance", name: "New Balance 2002R", price: 14000, originalPrice: 14000, rating: 4.9, reviews: 567, badge: "Trending", sizes: [7, 8, 9, 10, 11], colors: ["Grey"], image: "/sneaker.png" },
];
