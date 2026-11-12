import type { GlobalConfig } from 'payload'

import { siteDefaults as D } from './defaults'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

/** "Nastavení webu" – site-wide branding, default SEO / sharing values and the 404 page. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Nastavení webu',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Nastavení',
    description:
      'Společná nastavení celého webu: název a logo, výchozí texty pro Google a sdílení a stránka „nenalezeno“. ' +
      'Horní menu a patičku upravíte v Obsah webu → Hlavní stránka (záložky Menu a Patička).',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Název a logo',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: 'Krátký název webu',
              defaultValue: D.siteName,
              admin: {
                description:
                  'Zobrazuje se vedle loga v menu a v patičce a jako název webu při sdílení odkazů.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo',
                  admin: {
                    width: '50%',
                    description:
                      'Malé logo v menu a patičce (ideálně čtvercové SVG nebo PNG s průhledným pozadím). ' +
                      'Když necháte prázdné, použije se současné logo SPPDF.',
                  },
                },
                {
                  name: 'favicon',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Ikona v záložce prohlížeče (favicon)',
                  admin: {
                    width: '50%',
                    description:
                      'Čtvercový obrázek (PNG nebo SVG, alespoň 64 × 64 px). Když necháte prázdné, použije se logo SPPDF.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Google a sdílení',
          description:
            'Výchozí hodnoty pro stránky, které nemají vlastní vyplněné údaje v záložce „SEO a sdílení“.',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'defaultTitle',
                  type: 'text',
                  label: 'Výchozí titulek',
                  defaultValue: D.seo.defaultTitle,
                  admin: {
                    description: 'Titulek v záložce prohlížeče a ve výsledcích Googlu.',
                  },
                },
                {
                  name: 'defaultDescription',
                  type: 'textarea',
                  label: 'Výchozí popis',
                  defaultValue: D.seo.defaultDescription,
                  admin: {
                    description: 'Krátké shrnutí webu pro Google a náhled při sdílení (do 160 znaků).',
                  },
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Výchozí obrázek pro sdílení',
                  admin: {
                    description:
                      'Obrázek v náhledu odkazu na Facebooku, WhatsAppu apod. Ideální rozměr 1200 × 630 px.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Stránka nenalezena (404)',
          description: 'Co uvidí návštěvník, když otevře neexistující adresu.',
          fields: [
            {
              name: 'notFound',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.notFound.heading,
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Text',
                  defaultValue: D.notFound.text,
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  label: 'Text tlačítka zpět na hlavní stránku',
                  defaultValue: D.notFound.buttonLabel,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
