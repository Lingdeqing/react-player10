export const uaText = window.navigator.userAgent;
export const android = /Android/.test(uaText);
export const iOS = /(iPad|iPhone|iPod)\s+OS\s([\d_.]+)/.test(uaText);
export const isMobile = android || iOS;
export const isPc = !isMobile;