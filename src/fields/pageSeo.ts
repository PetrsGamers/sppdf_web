import type { GroupField, Tab } from 'payload'

type PageSeoDefaults = {
  title?: string
  description?: string
}

/**
 * Per-page search engine / social sharing fields (`seo` group), wrapped in a "SEO a sdílení" tab.
 * Empty values fall back to the defaults in "Nastavení webu".
 */
export const pageSeoTab = (defaults: PageSeoDefaults = {}): Tab => {
  const group: GroupField = {
    name: 'seo',
    type: 'group',
    label: false,
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Titulek stránky',
        ...(defaults.title !== undefined ? { defaultValue: defaults.title } : {}),
        admin: {
          description:
            'Zobrazuje se v záložce prohlížeče, ve výsledcích Googlu a při sdílení odkazu. ' +
            'Ideálně do 60 znaků. Když necháte prázdné, použije se výchozí titulek z Nastavení webu.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Popis stránky',
        ...(defaults.description !== undefined ? { defaultValue: defaults.description } : {}),
        admin: {
          description:
            'Krátké shrnutí stránky (1–2 věty, ideálně do 160 znaků) pro Google a náhled při sdílení na sociálních sítích. ' +
            'Když necháte prázdné, použije se výchozí popis z Nastavení webu.',
        },
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'Obrázek pro sdílení',
        admin: {
          description:
            'Obrázek, který se ukáže při sdílení odkazu (Facebook, WhatsApp, Messenger…). ' +
            'Ideální rozměr 1200 × 630 px. Když necháte prázdné, použije se výchozí obrázek z Nastavení webu.',
        },
      },
    ],
  }

  return {
    label: 'SEO a sdílení',
    description: 'Jak se stránka zobrazí ve vyhledávačích a při sdílení odkazu.',
    fields: [group],
  }
}
