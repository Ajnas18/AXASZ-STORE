import { normalizeProductVariants, findVariant, getVariantGallery, getColorHex } from './src/lib/productVariants.js';

console.log("==================================================");
console.log("🧪 RUNNING COLOR VARIANT & GALLERY ISOLATION TESTS");
console.log("==================================================\n");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Multi-variant product simulation (Amazon/Flipkart structure)
const sampleProduct = {
  _id: "prod-nike-001",
  name: "Nike Air Max 270",
  productCode: "NIKE-001",
  brand: "Nike",
  price: 12000,
  originalPrice: 14000,
  sizes: [7, 8, 9, 10, 11],
  variants: [
    {
      variantId: "NIKE-001-WHITE",
      asin: "B08N5WHITE",
      color: "White",
      colorHex: "#ffffff",
      price: 12000,
      image: "https://cdn.example.com/white-front.jpg",
      images: [
        "https://cdn.example.com/white-side.jpg",
        "https://cdn.example.com/white-back.jpg",
        "https://cdn.example.com/white-sole.jpg"
      ],
      modelImage: "https://cdn.example.com/white-model.jpg"
    },
    {
      variantId: "NIKE-001-RED",
      asin: "B08N5RED01",
      color: "Red",
      colorHex: "#ef4444",
      price: 12500, // Variant-specific price
      image: "https://cdn.example.com/red-front.jpg",
      images: [
        "https://cdn.example.com/red-side.jpg",
        "https://cdn.example.com/red-back.jpg",
        "https://cdn.example.com/red-sole.jpg"
      ],
      modelImage: "https://cdn.example.com/red-model.jpg"
    },
    {
      variantId: "NIKE-001-BLACK",
      asin: "B08N5BLACK",
      color: "Black",
      colorHex: "#111111",
      price: 12000,
      image: "https://cdn.example.com/black-front.jpg",
      images: [
        "https://cdn.example.com/black-side.jpg",
        "https://cdn.example.com/black-back.jpg",
        "https://cdn.example.com/black-sole.jpg"
      ],
      modelImage: "https://cdn.example.com/black-model.jpg"
    },
    {
      variantId: "NIKE-001-BLUE",
      asin: "B08N5BLUE0",
      color: "University Blue",
      colorHex: "#60a5fa",
      price: 13000,
      image: "https://cdn.example.com/blue-front.jpg",
      images: [
        "https://cdn.example.com/blue-side.jpg",
        "https://cdn.example.com/blue-back.jpg"
      ]
    }
  ]
};

const variants = normalizeProductVariants(sampleProduct);

// Test 1: Correct number of variants normalized
assert(variants.length === 4, "Normalizes exactly 4 variants");

// Test 2: White Variant Gallery Isolation
const whiteVar = findVariant(variants, "NIKE-001-WHITE");
assert(whiteVar !== null, "Found White variant by variantId");
assert(whiteVar.gallery.length === 5, "White gallery has 5 images (front, side, back, sole, model)");
assert(whiteVar.gallery.every(url => url.includes("white")), "All 5 images in White gallery contain ONLY white images");
assert(!whiteVar.gallery.some(url => url.includes("red") || url.includes("black") || url.includes("blue")), "White gallery contains NO red, black, or blue images");

// Test 3: Red Variant Gallery Isolation
const redVar = findVariant(variants, "red");
assert(redVar !== null, "Found Red variant by case-insensitive color 'red'");
assert(redVar.gallery.length === 5, "Red gallery has 5 images");
assert(redVar.gallery.every(url => url.includes("red")), "All 5 images in Red gallery contain ONLY red images");
assert(!redVar.gallery.some(url => url.includes("white") || url.includes("black")), "Red gallery contains NO white or black images");
assert(redVar.price === 12500, "Red variant preserves variant-specific price (12500)");
assert(redVar.asin === "B08N5RED01", "Red variant preserves ASIN (B08N5RED01)");

// Test 4: Black Variant Gallery Isolation
const blackVar = findVariant(variants, "B08N5BLACK");
assert(blackVar !== null, "Found Black variant by ASIN 'B08N5BLACK'");
assert(blackVar.gallery.every(url => url.includes("black")), "All images in Black gallery contain ONLY black images");

// Test 5: Switch sequence simulation (White -> Red -> Black -> Blue -> White)
const sequence = ["White", "Red", "Black", "University Blue", "White"];
let sequencePassed = true;
for (const color of sequence) {
  const v = findVariant(variants, color);
  const keyword = color === "University Blue" ? "blue" : color.toLowerCase();
  if (!v.gallery.every(img => img.includes(keyword))) {
    sequencePassed = false;
    break;
  }
}
assert(sequencePassed, "Full selection sequence (White -> Red -> Black -> Blue -> White) maintained complete gallery isolation");

// Test 6: Legacy product without variants array
const legacyProduct = {
  _id: "legacy-001",
  name: "Air Jordan 4 Retro",
  productCode: "SS0719",
  price: 2200,
  colors: ["Blue"],
  image: "https://cdn.example.com/jordan4-cover.png",
  images: [
    "https://cdn.example.com/jordan4-side.png",
    "https://cdn.example.com/jordan4-back.png"
  ]
};

const legacyVariants = normalizeProductVariants(legacyProduct);
assert(legacyVariants.length === 1, "Legacy product normalized to 1 default variant");
assert(legacyVariants[0].color === "Blue", "Legacy variant has color 'Blue'");
assert(legacyVariants[0].gallery.length === 3, "Legacy variant has all 3 images in gallery");

// Test 7: Variant with 0 images falls back cleanly to placeholder
const emptyVariant = {
  variantId: "EMPTY-001",
  color: "Neon",
  images: []
};
const emptyGallery = getVariantGallery(emptyVariant);
assert(emptyGallery.length === 1 && emptyGallery[0] === "/placeholder1.jpg", "Empty variant gallery safely falls back to placeholder");

// Test 8: Color swatch resolution
assert(getColorHex("White/Black").includes("linear-gradient"), "Dual tone White/Black resolves to gradient swatch");
assert(getColorHex("University Blue") === "#60a5fa", "University Blue resolves to #60a5fa");

console.log(`\n==================================================`);
console.log(`📊 RESULTS: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
console.log(`==================================================\n`);

if (passed === total) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("❌ SOME TESTS FAILED!");
  process.exit(1);
}
