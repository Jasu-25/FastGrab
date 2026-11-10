/** Store pages are opened from Explore, so Explore stays highlighted there. */
export const isExploreChild = (to, pathname) =>
  to === '/customer/explore' && pathname.startsWith('/customer/store/')
