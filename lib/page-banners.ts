export type PageBanner = { image: string; alt: string };
const community = {
  image: "/images/community.jpg",
  alt: "Children taking part in a community activity — illustrative photograph",
};
const education = {
  image: "/images/education.jpg",
  alt: "Children learning together — illustrative photograph",
};
const volunteers = {
  image: "/images/volunteering.jpg",
  alt: "People joining hands — illustrative photograph",
};
const store = {
  image: "/images/e-store-banner.png",
  alt: "Green shopping artwork with a person using a phone, product displays and shopping bags",
};

export function pageBanner(path: string): PageBanner {
  const page = path.split("/").filter(Boolean)[0] || "home";
  if (["store", "product"].includes(page)) return store;
  if (
    [
      "our-work",
      "focus-areas",
      "login",
      "register",
      "forgot-password",
      "reset-password",
      "verify-email",
    ].includes(page)
  )
    return education;
  if (
    [
      "get-involved",
      "become-a-volunteer",
      "volunteering-internships",
      "internships",
      "careers",
      "csr-partnerships",
      "contact",
      "user",
      "profile",
    ].includes(page)
  )
    return volunteers;
  if (["donate", "donate-now"].includes(page))
    return {
      image: "/images/hero.jpg",
      alt: "Schoolchildren smiling — illustrative photograph",
    };
  return community;
}
