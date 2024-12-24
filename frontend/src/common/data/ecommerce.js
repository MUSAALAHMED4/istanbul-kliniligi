const productsData = [
  {
    id: 1,
    image: "product1",
    name: "Half sleeve T-shirt",
    link: "#",
    category: "T-shirts",
    rating: 5,
    oldPrice: 500,
    newPrice: 405,
    isOffer: true,
    offer: 10,
    reviews: 0,
    specification: [
      { type: "Size", value: "M" },
      { type: "Color", value: "Red" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product1", color: "Red" },
      { image: "product1", color: "Black" },
    ],
  },
  {
    id: 2,
    image: "product2",
    name: "Light blue T-shirt",
    link: "#",
    category: "T-shirts",
    rating: 5,
    oldPrice: 225,
    newPrice: 175,
    isOffer: true,
    offer: 20,
    reviews: 0,
    specification: [
      { type: "Size", value: "L" },
      { type: "Color", value: "Light blue" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product2", color: "Light blue" },
      { image: "product2", color: "Black" },
    ],
  },
  {
    id: 3,
    image: "product3",
    name: "Black Color T-shirt",
    link: "#",
    category: "T-shirts",
    rating: 4,
    oldPrice: 177,
    newPrice: 152,
    isOffer: true,
    offer: 14,
    reviews: 0,
    specification: [
      { type: "Size", value: "XL" },
      { type: "Color", value: "Black" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product3", color: "Black" },
      { image: "product3", color: "White" },
    ],
  },
  {
    id: 4,
    image: "product4",
    name: "Hoodie (Blue)",
    link: "#",
    category: "Hoodies",
    rating: 3,
    oldPrice: 150,
    newPrice: 145,
    isOffer: true,
    offer: 5,
    reviews: 0,
    specification: [
      { type: "Size", value: "M" },
      { type: "Color", value: "Blue" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product4", color: "Blue" },
      { image: "product4", color: "Black" },
    ],
  },
  {
    id: 5,
    image: "product5",
    name: "Half sleeve T-Shirt",
    link: "#",
    category: "T-shirts",
    rating: 1,
    oldPrice: 177,
    newPrice: 152,
    isOffer: false,
    offer: 0,
    reviews: 5,
    specification: [
      { type: "Size", value: "S" },
      { type: "Color", value: "Coral" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product5", color: "Coral" },
      { image: "product5", color: "Black" },
    ],
  },
  {
    id: 6,
    image: "product6",
    name: "Green color T-shirt",
    link: "#",
    category: "T-shirts",
    rating: 5,
    oldPrice: 200,
    newPrice: 100,
    isOffer: true,
    offer: 50,
    reviews: 10,
    specification: [
      { type: "Size", value: "L" },
      { type: "Color", value: "Green" },
    ],
    features: [
      { icon: "fa fa-caret-right", type: "Fit", value: "Regular fit" },
      { icon: "fa fa-caret-right", type: "", value: "Highest quality fabric" },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Suitable for all weather condition",
      },
      {
        icon: "fa fa-caret-right",
        type: "",
        value: "Excellent Washing and Light Fastness",
      },
    ],
    colorOptions: [
      { image: "product6", color: "Green" },
      { image: "product6", color: "Black" },
    ],
  },
]

const recentProducts = [
  {
    id: 1,
    img: "img7",
    name: "Wirless Headphone",
    link: "",
    rating: 4,
    oldPrice: 240,
    newPrice: 225,
  },
  {
    id: 2,
    img: "img4",
    name: "Phone patterned cases",
    link: "",
    rating: 3,
    oldPrice: 150,
    newPrice: 145,
  },
  {
    id: 3,
    img: "img6",
    name: "Phone Dark Patterned cases",
    link: "",
    rating: 4,
    oldPrice: 138,
    newPrice: 135,
  },
]

const comments = [
  {
    id: 1,
    img: "avatar2",
    name: "Brian",
    description:
      "If several languages coalesce, the grammar of the resulting language.",
    date: "5 hrs ago",
  },
  {
    id: 2,
    img: "avatar4",
    name: "Denver",
    description:
      "To an English person, it will seem like simplified English, as a skeptical Cambridge",
    date: "07 Oct, 2019",
    childComment: [
      {
        id: 1,
        img: "avatar5",
        name: "Henry",
        description:
          "Their separate existence is a myth. For science, music, sport, etc.",
        date: "08 Oct, 2019",
      },
    ],
  },
  {
    id: 3,
    img: "Null",
    name: "Neal",
    description:
      "Everyone realizes why a new common language would be desirable.",
    date: "05 Oct, 2019",
  },
]

const discountData = [
  { label: "Less than 10%", value: 0 },
  { label: "10% or more", value: 10 },
  { label: "20% or more", value: 20 },
  { label: "30% or more", value: 30 },
  { label: "40% or more", value: 40 },
  { label: "50% or more", value: 50 },
]

const orders = [
  {
    id: "customCheck2",
    orderId: "#SK2540",
    billingName: "Neal Matthews",
    Date: "07 Oct, 2019",
    total: "$400",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fa-cc-mastercard",
    paymentMethod: "Mastercard",
  },
  {
    id: "customCheck3",
    orderId: "#SK2541",
    billingName: "Jamal Burnett",
    Date: "07 Oct, 2019",
    total: "$380",
    badgeclass: "danger",
    paymentStatus: "Chargeback",
    methodIcon: "fa-cc-visa",
    paymentMethod: "Visa",
  },
  {
    id: "customCheck4",
    orderId: "#SK2542",
    billingName: "Juan Mitchell",
    Date: "06 Oct, 2019",
    total: "$384",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fa-cc-paypal",
    paymentMethod: "Paypal",
  },
  {
    id: "customCheck5",
    orderId: "#SK2543",
    billingName: "Barry Dick",
    Date: "05 Oct, 2019",
    total: "$412",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fa-cc-mastercard",
    paymentMethod: "Mastercard",
  },
  {
    id: "customCheck6",
    orderId: "#SK2544",
    billingName: "Ronald Taylor",
    Date: "04 Oct, 2019",
    total: "$404",
    badgeclass: "warning",
    paymentStatus: "Refund",
    methodIcon: "fa-cc-visa",
    paymentMethod: "Visa",
  },
  {
    id: "customCheck7",
    orderId: "#SK2545",
    billingName: "Jacob Hunter",
    Date: "04 Oct, 2019",
    total: "$392",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fa-cc-paypal",
    paymentMethod: "Paypal",
  },
  {
    id: "customCheck8",
    orderId: "#SK2546",
    billingName: "William Cruz",
    Date: "03 Oct, 2019",
    total: "$374",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fas fa-money-bill-alt",
    paymentMethod: "COD",
  },
  {
    id: "customCheck9",
    orderId: "#SK2547",
    billingName: "Dustin Moser",
    Date: "02 Oct, 2019",
    total: "$350",
    badgeclass: "success",
    paymentStatus: "Paid",
    methodIcon: "fa-cc-paypal",
    paymentMethod: "Mastercard",
  },
  {
    id: "customCheck10",
    orderId: "#SK2548",
    billingName: "Clark Benson",
    Date: "01 Oct, 2019",
    total: "$345",
    badgeclass: "warning",
    paymentStatus: "Refund",
    methodIcon: "fa-cc-paypal",
    paymentMethod: "Visa",
  },
]

const cartData = {
  products: [
    {
      id: 1,
      img: "img1",
      name: "Half sleeve T-shirt",
      color: "Maroon",
      price: "450",
      data_attr: 2,
      total: 900,
    },
    {
      id: 2,
      img: "img2",
      name: "Light blue T-shirt",
      color: "Light blue",
      price: "225",
      data_attr: 6,
      total: 225,
    },
    {
      id: 3,
      img: "img3",
      name: "Black Color T-shirt",
      color: "Black",
      price: "152",
      data_attr: 2,
      total: 304,
    },
    {
      id: 4,
      img: "img4",
      name: "Hoodie (Blue)",
      color: "Blue",
      price: "145",
      data_attr: 2,
      total: 290,
    },
    {
      id: 5,
      img: "img5",
      name: "Half sleeve T-Shirt",
      color: "Light orange",
      price: "138",
      data_attr: 8,
      total: 138,
    },
    {
      id: 6,
      img: "img6",
      name: "Green color T-shirt",
      color: "Green",
      price: "152",
      data_attr: 2,
      total: 304,
    },
  ],
  orderSummary: {
    grandTotal: "$ 1,857",
    discount: "$ 157",
    shippingCharge: "$ 25",
    estimatedTax: "$ 19.22",
    total: "$ 1744.22",
  },
}

const customerData = [
  {
    id: "1",
    username: "Stephen Rash",
    phone: "325-250-1106",
    email: "StephenRash@teleworm.us",
    address: "2470 Grove Street Bethpage, NY 11714",
    rating: "4.2",
    walletBalance: "$5,412",
    joiningDate: "07 Oct, 2019",
  },
  {
    id: "2",
    username: "Juan Mays",
    phone: "443-523-4726",
    email: "JuanMays@armyspy.com",
    address: "3755 Harron Drive Salisbury, MD 21875",
    rating: "4.0",
    walletBalance: "$5,632",
    joiningDate: "06 Oct, 2019",
  },
  {
    id: "3",
    username: "Scott Henry",
    phone: "704-629-9535",
    email: "ScottHenry@jourrapide.com",
    address: "3632 Snyder Avenue Bessemer City, NC 2801",
    rating: "4.4",
    walletBalance: "$7,523",
    joiningDate: "06 Oct, 2019",
  },
  {
    id: "4",
    username: "Cody Menendez",
    phone: "701-832-5838",
    email: "CodyMenendez@armyspy.com",
    address: "4401 Findley Avenue Minot, ND 58701",
    rating: "4.1",
    walletBalance: "$6,325",
    joiningDate: "05 Oct, 2019",
  },
  {
    id: "5",
    username: "Jason Merino",
    phone: "706-219-4095",
    email: "JasonMerino@dayrep.com",
    address: "3159 Holly Street Cleveland, GA 30528",
    rating: "3.8",
    walletBalance: "$4,523",
    joiningDate: "04 Oct, 2019",
  },
  {
    id: "6",
    username: "Kyle Aquino",
    phone: "415-232-5443",
    email: "KyleAquino@teleworm.us",
    address: "4861 Delaware Avenue San Francisco, CA 94143",
    rating: "4.0",
    walletBalance: "$5,412",
    joiningDate: "03 Oct, 2019",
  },
  {
    id: "7",
    username: "David Gaul",
    phone: "314-483-4679",
    email: "DavidGaul@teleworm.us",
    address: "1207 Cottrill Lane Stlouis, MO 63101",
    rating: "4.2",
    walletBalance: "$6,180",
    joiningDate: "02 Oct, 2019",
  },
  {
    id: "8",
    username: "John McCray",
    phone: "253-661-7551",
    email: "JohnMcCray@armyspy.com",
    address: "3309 Horizon Circle Tacoma, WA 98423",
    rating: "4.1",
    walletBalance: "$5,2870",
    joiningDate: "02 Oct, 2019",
  },
]

const shops = [
  {
    id: 1,
    color: "primary",
    name: "Brendle's",
    product: 112,
    balance: "13,575",
    profileLink: "#",
  },
  {
    id: 2,
    color: "warning",
    name: "Tech Hifi",
    product: 104,
    balance: "11,145",
    profileLink: "#",
  },
  {
    id: 3,
    color: "danger",
    name: "Lafayette",
    product: 126,
    balance: "12,356",
    profileLink: "#",
  },
  {
    id: 4,
    color: "success",
    name: "Packer",
    product: 102,
    balance: "11,228",
    profileLink: "#",
  },
  {
    id: 5,
    color: "info",
    name: "Nedick's",
    product: 96,
    balance: "9,235",
    profileLink: "#",
  },
  {
    id: 6,
    color: "dark",
    name: "Hudson's",
    product: 120,
    balance: "14,794",
    profileLink: "#",
  },
  {
    id: 7,
    color: "dark",
    name: "Tech Hifi",
    product: 104,
    balance: "11,145",
    profileLink: "#",
  },
  {
    id: 8,
    color: "primary",
    name: "Brendle's",
    product: 112,
    balance: "13,575",
    profileLink: "#",
  },
  {
    id: 9,
    color: "success",
    name: "Lafayette",
    product: 120,
    balance: "12,356",
    profileLink: "#",
  },
]

export {
  productsData,
  recentProducts,
  comments,
  discountData,
  orders,
  shops,
  customerData,
  cartData,
}
