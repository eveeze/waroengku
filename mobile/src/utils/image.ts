export const getCleanImageUrl = (url?: string) => {
  if (!url) return undefined;
  // If URL ends in .JPG, .PNG, .JPEG (case insensitive), force lowercase extension
  // However, Cloudflare R2 is case sensitive.
  // We verified that '... .jpg' works and '... .JPG' fails.
  // We assume the backend converts to lowercase .jpg
  let cleanUrl = url.replace(/\.(JPG|JPEG|PNG)$/i, (ext) => ext.toLowerCase());

  // Replace old R2 domain with custom domain
  const OLD_DOMAIN = 'pub-ec57052b7bd74ebf92bdab53d0e0fae4.r2.dev';
  const NEW_DOMAIN = 'assets.warungmanto.store';

  if (cleanUrl.includes(OLD_DOMAIN)) {
    cleanUrl = cleanUrl.replace(OLD_DOMAIN, NEW_DOMAIN);
  }

  return cleanUrl;
};
