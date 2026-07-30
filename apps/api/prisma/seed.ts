import { PrismaClient } from "@prisma/client";
import type { Availability, Category } from "@prisma/client";

const prisma = new PrismaClient();

// Real, unbranded editorial/product photography, individually curated per
// product from Unsplash's free-to-use library (each photo ID verified to
// resolve before being added here) — replaces the earlier Lorem Picsum
// placeholders, which returned random unrelated stock photos (landscapes,
// architecture) with no connection to the product. See docs/04-api-contract.md
// "Product Image Strategy". `fit=crop` keeps every image the same 4:5
// portrait aspect ratio the catalog grid expects.
function unsplashImages(...photoIds: string[]): string[] {
  return photoIds.map((id) => `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&q=80`);
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  category: Category;
  price: number;
  currency: string;
  colors: string[];
  sizes: string[];
  styleTags: string[];
  material: string;
  availability: Availability;
  images: string[];
  isActive?: boolean;
}

const SIZES_XS_XL = ["XS", "S", "M", "L", "XL"];
const SIZES_S_XL = ["S", "M", "L", "XL"];
const SIZES_WAIST = ["28", "30", "32", "34", "36"];
const SIZES_SHOES_38_45 = ["38", "39", "40", "41", "42", "43", "44", "45"];
const SIZES_SHOES_39_45 = ["39", "40", "41", "42", "43", "44", "45"];
const ONE_SIZE = ["One Size"];

const products: SeedProduct[] = [
  // top
  {
    name: "Classic White Oxford Shirt",
    slug: "classic-white-oxford-shirt",
    description: "A crisp, tailored Oxford shirt that works from the office to the weekend.",
    category: "top",
    price: 59,
    currency: "EUR",
    colors: ["white", "light blue"],
    sizes: SIZES_XS_XL,
    styleTags: ["classic", "workwear"],
    material: "Cotton",
    availability: "in_stock",
    images: unsplashImages("1603252109612-24fa03d145c8", "1612541122840-bf7071c968a2"),
  },
  {
    name: "Ribbed Merino Sweater",
    slug: "ribbed-merino-sweater",
    description: "Fine-gauge merino wool sweater with a ribbed knit for a close, warm fit.",
    category: "top",
    price: 79,
    currency: "EUR",
    colors: ["charcoal", "cream", "forest green"],
    sizes: SIZES_XS_XL,
    styleTags: ["minimalist", "classic"],
    material: "Merino Wool",
    availability: "in_stock",
    images: unsplashImages("1574201635302-388dd92a4c3f", "1581497396202-5645e76a3a8e"),
  },
  {
    name: "Oversized Streetwear Hoodie",
    slug: "oversized-streetwear-hoodie",
    description: "Heavyweight organic cotton hoodie with a dropped shoulder and boxy fit.",
    category: "top",
    price: 69,
    currency: "EUR",
    colors: ["black", "stone"],
    sizes: SIZES_S_XL,
    styleTags: ["streetwear", "casual"],
    material: "Organic Cotton",
    availability: "in_stock",
    images: unsplashImages("1611817757591-c3f345024273", "1564557287817-3785e38ec1f5"),
  },
  {
    name: "Silk Blouse",
    slug: "silk-blouse",
    description: "Fluid silk blouse with a soft drape, ideal for layering under tailoring.",
    category: "top",
    price: 95,
    currency: "EUR",
    colors: ["ivory", "blush"],
    sizes: ["XS", "S", "M", "L"],
    styleTags: ["formal", "classic"],
    material: "Silk",
    availability: "low_stock",
    images: unsplashImages("1777462985111-9da64fb2e6e6", "1761117228880-df2425bd70da"),
  },
  {
    name: "Linen Short-Sleeve Shirt",
    slug: "linen-short-sleeve-shirt",
    description: "Breathable linen shirt with a relaxed cut for warm-weather days.",
    category: "top",
    price: 65,
    currency: "EUR",
    colors: ["white", "olive"],
    sizes: SIZES_S_XL,
    styleTags: ["casual", "boho"],
    material: "Linen",
    availability: "in_stock",
    images: unsplashImages("1740711152088-88a009e877bb", "1713881587420-113c1c43e28a"),
  },

  // bottom
  {
    name: "Tailored Wool Trousers",
    slug: "tailored-wool-trousers",
    description: "Sharp, straight-leg trousers in a soft wool blend with a clean finish.",
    category: "bottom",
    price: 110,
    currency: "EUR",
    colors: ["charcoal", "navy"],
    sizes: SIZES_WAIST,
    styleTags: ["formal", "classic"],
    material: "Wool blend",
    availability: "in_stock",
    images: unsplashImages("1517445312882-bc9910d016b7", "1540704751673-44f9dfd188c0"),
  },
  {
    name: "Straight-Leg Denim Jeans",
    slug: "straight-leg-denim-jeans",
    description: "Mid-rise straight-leg jeans in rigid denim that softens with wear.",
    category: "bottom",
    price: 79,
    currency: "EUR",
    colors: ["indigo", "black"],
    sizes: SIZES_WAIST,
    styleTags: ["casual", "classic"],
    material: "Denim",
    availability: "in_stock",
    images: unsplashImages("1593030761757-71fae45fa0e7", "1731936757642-09bccaf8b495"),
  },
  {
    name: "Cargo Utility Pants",
    slug: "cargo-utility-pants",
    description: "Relaxed-fit cargo pants with reinforced pockets and an adjustable waist.",
    category: "bottom",
    price: 85,
    currency: "EUR",
    colors: ["olive", "stone"],
    sizes: SIZES_S_XL,
    styleTags: ["streetwear", "workwear"],
    material: "Cotton",
    availability: "in_stock",
    images: unsplashImages("1511794322962-129ddbd0af38", "1548883354-7622d03aca27"),
  },
  {
    name: "Pleated Midi Skirt",
    slug: "pleated-midi-skirt",
    description: "Fluid pleated skirt that moves with you, cut just below the knee.",
    category: "bottom",
    price: 72,
    currency: "EUR",
    colors: ["black", "burgundy"],
    sizes: ["XS", "S", "M", "L"],
    styleTags: ["formal", "minimalist"],
    material: "Recycled Polyester",
    availability: "low_stock",
    images: unsplashImages("1762343041454-8f1fdd459811", "1762342685668-a76f1a57d7d1"),
  },
  {
    name: "Relaxed Linen Trousers",
    slug: "relaxed-linen-trousers",
    description: "Wide-leg linen trousers with a drawstring waist for all-day comfort.",
    category: "bottom",
    price: 68,
    currency: "EUR",
    colors: ["tan", "white"],
    sizes: SIZES_S_XL,
    styleTags: ["casual", "boho"],
    material: "Linen",
    availability: "in_stock",
    images: unsplashImages("1667586745375-530224e14c64", "1667586733054-18a77c4f920a"),
  },

  // shoes
  {
    name: "Minimalist Leather Sneakers",
    slug: "minimalist-leather-sneakers",
    description: "Clean-lined low-top sneakers in full-grain leather with a white sole.",
    category: "shoes",
    price: 129,
    currency: "EUR",
    colors: ["white", "black"],
    sizes: SIZES_SHOES_38_45,
    styleTags: ["minimalist", "casual"],
    material: "Leather",
    availability: "in_stock",
    images: unsplashImages("1603808033192-082d6919d3e1", "1603808033176-9d134e6f2c74"),
  },
  {
    name: "Chelsea Boots",
    slug: "chelsea-boots",
    description: "Classic Chelsea boots in polished leather with an elastic side panel.",
    category: "shoes",
    price: 149,
    currency: "EUR",
    colors: ["black", "tan"],
    sizes: SIZES_SHOES_39_45,
    styleTags: ["classic", "formal"],
    material: "Genuine Leather",
    availability: "in_stock",
    images: unsplashImages("1777987601423-f350ac29b3e9", "1773425975272-35f0900a9d8f"),
  },
  {
    name: "Chunky Trail Sneakers",
    slug: "chunky-trail-sneakers",
    description: "Trail-inspired sneakers with an exaggerated sole and reflective trim.",
    category: "shoes",
    price: 135,
    currency: "EUR",
    colors: ["black", "olive"],
    sizes: SIZES_SHOES_38_45,
    styleTags: ["streetwear", "athleisure"],
    material: "Recycled Polyester",
    availability: "out_of_stock",
    images: unsplashImages("1779122799094-6e7cce245753", "1698763954905-c9b24f40134f"),
  },
  {
    name: "Suede Loafers",
    slug: "suede-loafers",
    description: "Slip-on loafers in soft suede with a stacked leather heel.",
    category: "shoes",
    price: 119,
    currency: "EUR",
    colors: ["tan", "burgundy"],
    sizes: SIZES_SHOES_39_45,
    styleTags: ["classic", "formal"],
    material: "Suede",
    availability: "in_stock",
    images: unsplashImages("1576792741377-eb0f4f6d1a47", "1676121270762-47c8d3a7b9d5"),
  },

  // jacket
  {
    name: "Indigo Denim Jacket",
    slug: "indigo-denim-jacket",
    description: "Timeless denim trucker jacket with a slightly boxy fit.",
    category: "jacket",
    price: 89,
    currency: "EUR",
    colors: ["indigo"],
    sizes: SIZES_S_XL,
    styleTags: ["casual", "classic"],
    material: "Denim",
    availability: "in_stock",
    images: unsplashImages("1611312449408-fcece27cdbb7", "1527016021513-b09758b777bd"),
  },
  {
    name: "Wool Tailored Blazer",
    slug: "wool-tailored-blazer",
    description: "Structured single-breasted blazer in a soft wool blend.",
    category: "jacket",
    price: 159,
    currency: "EUR",
    colors: ["charcoal", "navy"],
    sizes: SIZES_XS_XL,
    styleTags: ["formal", "classic"],
    material: "Wool blend",
    availability: "in_stock",
    images: unsplashImages("1592878940526-0214b0f374f6", "1715408153725-186c6c77fb45"),
  },
  {
    name: "Technical Windbreaker",
    slug: "technical-windbreaker",
    description: "Packable windbreaker with taped seams and a water-repellent finish.",
    category: "jacket",
    price: 99,
    currency: "EUR",
    colors: ["black", "forest green"],
    sizes: SIZES_S_XL,
    styleTags: ["athleisure", "streetwear"],
    material: "Recycled Polyester",
    availability: "in_stock",
    images: unsplashImages("1564099973389-c8ea3ecca772", "1571867424485-369464ed33cc"),
  },
  {
    name: "Oversized Bomber Jacket",
    slug: "oversized-bomber-jacket",
    description: "Relaxed bomber jacket with ribbed cuffs and a satin lining.",
    category: "jacket",
    price: 115,
    currency: "EUR",
    colors: ["black", "rust"],
    sizes: SIZES_S_XL,
    styleTags: ["streetwear", "edgy"],
    material: "Nylon",
    availability: "low_stock",
    images: unsplashImages("1591047139829-d91aecb6caea", "1530862994178-a0cec9eb5388"),
  },

  // bag
  {
    name: "Structured Leather Tote",
    slug: "structured-leather-tote",
    description: "Roomy structured tote in full-grain leather with an interior zip pocket.",
    category: "bag",
    price: 145,
    currency: "EUR",
    colors: ["black", "tan"],
    sizes: ONE_SIZE,
    styleTags: ["minimalist", "classic"],
    material: "Genuine Leather",
    availability: "in_stock",
    images: unsplashImages("1624687943971-e86af76d57de", "1637759292654-a12cb2be085e"),
  },
  {
    name: "Canvas Crossbody Bag",
    slug: "canvas-crossbody-bag",
    description: "Durable canvas crossbody with an adjustable strap and leather trim.",
    category: "bag",
    price: 55,
    currency: "EUR",
    colors: ["olive", "stone"],
    sizes: ONE_SIZE,
    styleTags: ["casual", "streetwear"],
    material: "Canvas",
    availability: "in_stock",
    images: unsplashImages("1528976915572-6a0cf746802e", "1519144674309-fcb7fbc1a054"),
  },
  {
    name: "Woven Straw Basket Bag",
    slug: "woven-straw-basket-bag",
    description: "Hand-woven straw basket bag with leather handles, perfect for summer.",
    category: "bag",
    price: 62,
    currency: "EUR",
    colors: ["cream"],
    sizes: ONE_SIZE,
    styleTags: ["boho"],
    material: "Straw",
    availability: "in_stock",
    images: unsplashImages("1524679813234-66a389fe1a42", "1622153093514-4dd0078ac132"),
  },

  // accessory
  {
    name: "Fine Chain Necklace",
    slug: "fine-chain-necklace",
    description: "Delicate stainless steel chain necklace that layers well.",
    category: "accessory",
    price: 35,
    currency: "EUR",
    colors: ["gold", "silver"],
    sizes: ONE_SIZE,
    styleTags: ["minimalist", "classic"],
    material: "Stainless Steel",
    availability: "in_stock",
    images: unsplashImages("1625908733875-efa9c75c084d", "1635767798638-3e25273a8236"),
  },
  {
    name: "Wool Beanie",
    slug: "wool-beanie",
    description: "Ribbed wool beanie with a folded brim for everyday warmth.",
    category: "accessory",
    price: 25,
    currency: "EUR",
    colors: ["charcoal", "burgundy", "cream"],
    sizes: ONE_SIZE,
    styleTags: ["casual", "streetwear"],
    material: "Wool",
    availability: "in_stock",
    images: unsplashImages("1612887726773-e64e20cf08fe", "1630691650107-53dd500d2907"),
  },
  {
    name: "Leather Belt",
    slug: "leather-belt",
    description: "Full-grain leather belt with a solid brass buckle.",
    category: "accessory",
    price: 39,
    currency: "EUR",
    colors: ["black", "tan"],
    sizes: SIZES_S_XL,
    styleTags: ["classic", "formal"],
    material: "Leather",
    availability: "in_stock",
    images: unsplashImages("1624222247344-550fb60583dc", "1705493655920-20c572928501"),
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        isActive: product.isActive ?? true,
      },
      create: {
        ...product,
        isActive: product.isActive ?? true,
      },
    });
  }

  console.info(`Seeded ${products.length} products.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
