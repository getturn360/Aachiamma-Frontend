export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },

  {
    label: "HSN / SAC Code (optional)",
    name: "hsn",
    componentType: "input",
    type: "text",
    placeholder: "Enter HSN / SAC code (optional)",
  },

  {
    label: "Description — multiple paragraphs (each paragraph may have an optional title)",
    name: "descriptionSections",
    componentType: "sections",
    placeholder: "Add paragraph blocks. Each block can have an optional bold title and paragraph content. Use this for product description (multiple paragraphs).",
  },

  {
    label: "How to use (single paragraph, optional)",
    name: "howTo",
    componentType: "textarea",
    placeholder: "Add a short paragraph on how to use this product (will appear under 'How to use').",
    rows: 4,
  },

  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [],
  },
  {
    label: "Special",
    name: "special",
    componentType: "checkboxgroup",
    options: [
      { id: "best-selling", label: "Best Selling" },
      { id: "trending", label: "Trending" },
      { id: "new-arrival", label: "New Arrival" },
    ],
  },

  {
    label: "Variations (weights) — REQUIRED",
    name: "variations",
    componentType: "variations",
    placeholder: "Add weight rows (e.g. 100g). Each variation requires label & price. Mark one default.",
  },

  {
    label: "Product Specifications (bullet points)",
    name: "specList",
    componentType: "specList",
    placeholder: "Add spec points like: Available packs (label) and values (content).",
  },

  {
    label: "Ingredients (single block)",
    name: "ingredients",
    componentType: "textarea",
    placeholder: "Enter ingredients text (single block).",
  },


];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/",
  },
  {
    id: "products",
    label: "Products",
    path: "/listing",
  },
];

export const filterOptions = {

};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    name: "firstName",
    componentType: "input",
    type: "text",
    placeholder: "First name",
  },
  {
    name: "lastName",
    componentType: "input",
    type: "text",
    placeholder: "Last name",
  },
  {
    name: "whatsapp",
    componentType: "input",
    type: "text",
    placeholder: "WhatsApp number for order updates",
  },
  {
    name: "company",
    componentType: "input",
    type: "text",
    placeholder: "Company name (optional)",
  },
  {
    name: "country",
    componentType: "select",
    options: [{ id: "India", label: "India" }],
    placeholder: "Country / Region",
  },
  {
    name: "streetAddress",
    componentType: "input",
    type: "text",
    placeholder: "Street address",
  },
  {
    name: "apartment",
    componentType: "input",
    type: "text",
    placeholder: "Apartment, suite, unit, etc. (optional)",
  },
  {
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Town / City",
  },
  {
    name: "state",
    componentType: "select",
    options: [
   
      { id: "Kerala", label: "Kerala" },
      { id: "Tamil Nadu", label: "Tamil Nadu" },
      { id: "Karnataka", label: "Karnataka" },
      { id: "Andhra Pradesh", label: "Andhra Pradesh" },
      { id: "Telangana", label: "Telangana" },
      { id: "Puducherry", label: "Puducherry" },

      { id: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
      { id: "Arunachal Pradesh", label: "Arunachal Pradesh" },
      { id: "Assam", label: "Assam" },
      { id: "Bihar", label: "Bihar" },
      { id: "Chandigarh", label: "Chandigarh" },
      { id: "Chhattisgarh", label: "Chhattisgarh" },
      { id: "Dadra and Nagar Haveli", label: "Dadra and Nagar Haveli" },
      { id: "Daman and Diu", label: "Daman and Diu" },
      { id: "Delhi", label: "Delhi" },
      { id: "Goa", label: "Goa" },
      { id: "Gujarat", label: "Gujarat" },
      { id: "Haryana", label: "Haryana" },
      { id: "Himachal Pradesh", label: "Himachal Pradesh" },
      { id: "Jammu and Kashmir", label: "Jammu and Kashmir" },
      { id: "Jharkhand", label: "Jharkhand" },
      { id: "Ladakh", label: "Ladakh" },
      { id: "Lakshadweep", label: "Lakshadweep" },
      { id: "Madhya Pradesh", label: "Madhya Pradesh" },
      { id: "Maharashtra", label: "Maharashtra" },
      { id: "Manipur", label: "Manipur" },
      { id: "Meghalaya", label: "Meghalaya" },
      { id: "Mizoram", label: "Mizoram" },
      { id: "Nagaland", label: "Nagaland" },
      { id: "Odisha", label: "Odisha" },
      { id: "Punjab", label: "Punjab" },
      { id: "Rajasthan", label: "Rajasthan" },
      { id: "Sikkim", label: "Sikkim" },
      { id: "Tripura", label: "Tripura" },
      { id: "Uttar Pradesh", label: "Uttar Pradesh" },
      { id: "Uttarakhand", label: "Uttarakhand" },
      { id: "West Bengal", label: "West Bengal" }
    ],
    placeholder: "State / County",
  },
  {
    name: "postcode",
    componentType: "input",
    type: "text",
    placeholder: "Postcode / ZIP",
  },
  {
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Phone",
  },
  {
    name: "email",
    componentType: "input",
    type: "email",
    placeholder: "Email address (optional)",
  },
  {
    name: "addressType",
    componentType: "select",
    options: [
      { id: "Home", label: "Home" },
      { id: "Office", label: "Office" },
    ],
    placeholder: "Address type",
  },
  {
    name: "notes",
    componentType: "textarea",
    placeholder: "Notes about your order, e.g. special notes for delivery.",
  },
];