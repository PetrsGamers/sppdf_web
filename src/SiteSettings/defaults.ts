/** Default values of the "Nastavení webu" global. Also imported by client components. */
export const siteDefaults = {
  siteName: 'SPPDF',
  logoUrl: '/logo-sppdf.svg',
  faviconUrl: '/logo-sppdf.svg',
  seo: {
    defaultTitle: 'SPPDF | Spolek přátel pedagogické fakulty',
    defaultDescription:
      'Jsme komunita, která propojuje studenty a pedagogy. Tvoříme prostředí pro sdílení zkušeností a radosti z učitelského povolání.',
  },
  notFound: {
    heading: '404',
    text: 'Tato stránka neexistuje nebo byla přesunuta.',
    buttonLabel: 'Zpět na hlavní stránku',
  },
} as const
