/**
 * Smooth scroll utility for navigating to sections on the same page
 * with offset for fixed header
 */

const HEADER_HEIGHT = 64; // 16 * 4 = 64px (h-16 in Tailwind)

/**
 * Smoothly scrolls to a section with the given ID
 * @param {string} sectionId - The ID of the section to scroll to (without the #)
 * @param {number} offset - Additional offset in pixels (default: HEADER_HEIGHT)
 */
export const scrollToSection = (sectionId, offset = HEADER_HEIGHT) => {
  const element = document.getElementById(sectionId);

  if (!element) {
    console.warn(`Section with ID "${sectionId}" not found`);
    return;
  }

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Handle anchor click with smooth scroll
 * @param {Event} e - The click event
 * @param {string} href - The href attribute (e.g., "#nosotros")
 */
export const handleAnchorClick = (e, href) => {
  // Only handle internal anchor links
  if (!href || !href.startsWith('#')) return;

  e.preventDefault();
  const sectionId = href.substring(1); // Remove the #
  scrollToSection(sectionId);

  // Update URL without triggering page reload
  window.history.pushState(null, '', href);
};

/**
 * Check if we're on the home page (unified landing page)
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean}
 */
export const isOnHomePage = (pathname) => {
  return pathname === '/';
};

export default {
  scrollToSection,
  handleAnchorClick,
  isOnHomePage,
  HEADER_HEIGHT
};
