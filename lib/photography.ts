// Documentary photographs already supplied for this project. Crops remove
// surrounding report text, never alter the people or activities pictured.
export const programPhotos: Record<
  string,
  { src: string; alt: string; crop?: string; width?: number; height?: number }
> = {
  "education-skill": {
    src: "/images/focus/youth-education.jpeg",
    alt: "Participants learning practical skills at a WBF training centre",
  },
  "women-empowerment": {
    src: "/images/women-skill-training.jpeg",
    alt: "Women practising sewing during a WBF skills session",
  },
  "health-hygiene": {
    src: "/images/focus/community-healthcare.jpeg",
    alt: "Healthcare professionals assisting a visitor at a community health camp",
  },
  "legal-aid-human-rights": {
    src: "/images/focus/Screenshot-2026-04-27-at-3.08.50-PM.png",
    alt: "Participants at a community legal-awareness meeting",
    crop: "80 197 640 470",
    width: 796,
    height: 1058,
  },
  environment: {
    src: "/images/focus/Screenshot-2026-04-27-at-3.16.07-PM.png",
    alt: "Community members planting a sapling",
    crop: "48 146 635 313",
    width: 812,
    height: 1048,
  },
  sports: {
    src: "/images/focus/IMG_5870-3-1024x768.jpeg",
    alt: "A coach speaking with participants at a sports session",
  },
  "art-culture-heritage": {
    src: "/images/focus/ways4.jpg",
    alt: "Children sharing drawings at a community art activity",
  },
  "sustainable-development-goals": {
    src: "/images/focus/from-local-to.jpeg",
    alt: "Community outreach with women and families",
  },
};

const retiredArtwork: Record<string, string> = {
  "community-banner.png": "/images/hero.jpg",
  "community-learning-banner.png": "/images/education.jpg",
  "community-learning-banner-v2.png": "/images/education.jpg",
  "community-classroom.png": "/images/education.jpg",
  "focus-reference.png": "/images/education.jpg",
  "approach-reference.png": "/images/volunteering.jpg",
  "stories-events-reference.png": "/images/community.jpg",
  "involvement-reference.png": "/images/volunteering.jpg",
  "our-story-reference.png": "/images/community.jpg",
  "about-purpose-reference.png": "/images/women-skill-training.jpeg",
  "about-journey-reference.png": "/images/community.jpg",
  "profile-community.png": "/images/women-skill-training.jpeg",
  "profile-reference.png": "/images/volunteering.jpg",
  "womens-graduation.png": "/images/women-skill-training.jpeg",
};

export function authenticPhoto(
  src?: string,
  fallback = "/images/community.jpg",
) {
  if (!src) return fallback;
  const filename = src.split("?")[0].split("/").pop() || "";
  return retiredArtwork[filename] || src;
}
