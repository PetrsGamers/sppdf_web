import type { GlobalConfig } from 'payload'

import { iconField } from '@/fields/icon'
import { linkUrlField } from '@/fields/linkUrl'
import { pageSeoTab } from '@/fields/pageSeo'
import { getServerSideURL } from '@/utilities/getURL'

import { landingDefaults as D } from './defaults'
import { revalidateLandingPage } from './hooks/revalidateLandingPage'

/**
 * "Hlavní stránka" – content of the homepage plus the menu and footer shared by all (landing) pages.
 *
 * The tabs are unnamed, so they are purely visual: the stored data keeps its original shape
 * (`nav`, `hero`, `ribbon`, `divisions`, `footer`, ...). Do not rename the field `name`s –
 * that would change the database schema and orphan existing content.
 */
export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  label: 'Hlavní stránka',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Obsah webu',
    description:
      'Texty a obrázky hlavní stránky. V záložkách „Menu“ a „Patička“ upravíte také horní menu a patičku, ' +
      'které se zobrazují na všech stránkách webu. Změny se na webu projeví hned po uložení.',
    preview: () => `${getServerSideURL()}/`,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Úvodní blok',
          description: 'Velký blok s nadpisem a obrázkem úplně nahoře na hlavní stránce.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  label: 'Štítek nad nadpisem',
                  defaultValue: D.hero.badge,
                  admin: {
                    description: 'Malý barevný štítek nad hlavním nadpisem. Prázdné = štítek se nezobrazí.',
                  },
                },
                {
                  name: 'headline',
                  type: 'text',
                  label: 'Hlavní nadpis',
                  required: true,
                  admin: {
                    description:
                      'Slova ve dvojitých složených závorkách se zvýrazní barvou spolku. ' +
                      'Např. „Inspirujeme {{budoucí}} učitele.“',
                  },
                },
                {
                  name: 'subtitle',
                  type: 'textarea',
                  label: 'Podnadpis',
                  admin: { description: 'Krátký text pod nadpisem. Nepovinné.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaPrimary',
                      type: 'group',
                      label: 'Hlavní tlačítko (oranžové)',
                      admin: { width: '50%' },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Text tlačítka',
                          defaultValue: D.hero.ctaPrimary.label,
                          admin: { description: 'Prázdné = tlačítko se nezobrazí.' },
                        },
                        linkUrlField({
                          name: 'link',
                          label: 'Odkaz tlačítka',
                          defaultValue: D.hero.ctaPrimary.link,
                          description: 'Hodnota # znamená, že tlačítko nikam nevede.',
                        }),
                      ],
                    },
                    {
                      name: 'ctaSecondary',
                      type: 'group',
                      label: 'Vedlejší tlačítko (šedé)',
                      admin: { width: '50%' },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Text tlačítka',
                          defaultValue: D.hero.ctaSecondary.label,
                          admin: { description: 'Prázdné = tlačítko se nezobrazí.' },
                        },
                        linkUrlField({
                          name: 'link',
                          label: 'Odkaz tlačítka',
                          defaultValue: D.hero.ctaSecondary.link,
                          description: 'Hodnota # znamená, že tlačítko nikam nevede.',
                        }),
                      ],
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Obrázek',
                  admin: {
                    description:
                      'Velká fotka vpravo od nadpisu (na šířku, ideálně alespoň 1200 px). ' +
                      'Popis obrázku (alt) vyplňte přímo u obrázku v sekci Obrázky a soubory.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Běžící pás',
          description: 'Oranžový pruh s posouvajícími se texty pod úvodním blokem.',
          fields: [
            {
              name: 'ribbon',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  label: 'Texty v pásu',
                  labels: { singular: 'Text', plural: 'Texty' },
                  defaultValue: D.ribbon.items.map((text) => ({ text })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Krátká hesla nebo názvy akcí, které běží dokola. Pořadí změníte přetažením. ' +
                      'Pokud seznam necháte úplně prázdný, zobrazí se výchozí ukázkové texty.',
                  },
                  fields: [{ name: 'text', type: 'text', label: 'Text', required: true }],
                },
              ],
            },
          ],
        },
        {
          label: 'Kalendář akcí',
          description:
            'Texty bloku s nejbližšími akcemi. Samotné akce se spravují v sekci Kalendář → Akce.',
          fields: [
            {
              name: 'calendarSection',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.calendarSection.heading,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Popis pod nadpisem',
                  defaultValue: D.calendarSection.description,
                },
                {
                  type: 'collapsible',
                  label: 'Poslední karta za seznamem akcí',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'endCardTitle',
                          type: 'text',
                          label: 'Nadpis karty',
                          defaultValue: D.calendarSection.endCardTitle,
                          admin: { width: '50%' },
                        },
                        {
                          name: 'endCardText',
                          type: 'text',
                          label: 'Text karty',
                          defaultValue: D.calendarSection.endCardText,
                          admin: { width: '50%' },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Tmavý pruh s odkazem na celý kalendář',
                  fields: [
                    {
                      name: 'ctaHeading',
                      type: 'text',
                      label: 'Nadpis',
                      defaultValue: D.calendarSection.ctaHeading,
                    },
                    {
                      name: 'ctaText',
                      type: 'text',
                      label: 'Text',
                      defaultValue: D.calendarSection.ctaText,
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'ctaButtonLabel',
                          type: 'text',
                          label: 'Text tlačítka',
                          defaultValue: D.calendarSection.ctaButtonLabel,
                          admin: { width: '50%' },
                        },
                        linkUrlField({
                          name: 'ctaButtonLink',
                          label: 'Odkaz tlačítka',
                          defaultValue: D.calendarSection.ctaButtonLink,
                          description: 'Obvykle /calendar.',
                          width: '50%',
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sekce spolku',
          description: 'Posuvník s kartami jednotlivých sekcí/oblastí spolku.',
          fields: [
            {
              name: 'divisions',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.divisions.heading,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Popis pod nadpisem',
                  defaultValue: D.divisions.description,
                },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Karty sekcí',
                  labels: { singular: 'Sekce', plural: 'Sekce' },
                  admin: {
                    initCollapsed: true,
                    description:
                      'Každá karta = jedna sekce spolku. Pořadí změníte přetažením. ' +
                      'Když nebude žádná karta, celý blok se skryje.',
                  },
                  fields: [
                    { name: 'title', type: 'text', label: 'Název sekce', required: true },
                    iconField(),
                    { name: 'description', type: 'textarea', label: 'Popis' },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Obrázek',
                      admin: { description: 'Fotka na šířku. Bez obrázku se zobrazí šedá plocha.' },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'linkLabel',
                          type: 'text',
                          label: 'Text odkazu',
                          defaultValue: D.divisions.linkLabel,
                          admin: { width: '50%', description: 'Prázdné = odkaz se nezobrazí.' },
                        },
                        linkUrlField({
                          name: 'linkUrl',
                          label: 'Kam odkaz vede',
                          defaultValue: D.divisions.linkUrl,
                          width: '50%',
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Menu',
          description: 'Horní lišta, která se zobrazuje na všech stránkách webu.',
          fields: [
            {
              name: 'nav',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'links',
                  type: 'array',
                  label: 'Položky menu',
                  labels: { singular: 'Položka menu', plural: 'Položky menu' },
                  defaultValue: D.nav.links.map((link) => ({ ...link })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Odkazy v horním menu. Pořadí změníte přetažením. ' +
                      'Pokud seznam necháte prázdný, zobrazí se Domů / O nás / Kalendář.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Text',
                          required: true,
                          admin: { width: '50%' },
                        },
                        linkUrlField({
                          name: 'url',
                          label: 'Odkaz',
                          required: true,
                          description: 'Např. /, /aboutus nebo /calendar.',
                          width: '50%',
                        }),
                      ],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      label: 'Text tlačítka vpravo',
                      defaultValue: D.nav.ctaLabel,
                      admin: { width: '50%', description: 'Prázdné = tlačítko se nezobrazí.' },
                    },
                    linkUrlField({
                      name: 'ctaLink',
                      label: 'Odkaz tlačítka vpravo',
                      defaultValue: D.nav.ctaLink,
                      description:
                        'Např. odkaz na přihlášku do spolku. Hodnota # znamená, že tlačítko nikam nevede.',
                      width: '50%',
                    }),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Patička',
          description: 'Spodní část, která se zobrazuje na všech stránkách webu.',
          fields: [
            {
              name: 'footer',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Text pod logem',
                  defaultValue: D.footer.description,
                },
                {
                  name: 'socialLinks',
                  type: 'array',
                  label: 'Sociální sítě',
                  labels: { singular: 'Sociální síť', plural: 'Sociální sítě' },
                  defaultValue: D.footer.socialLinks.map((link) => ({ ...link })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Kulaté ikonky s odkazy (Instagram, Facebook, e-mail…). ' +
                      'Pokud seznam necháte prázdný, zobrazí se dvě ukázkové ikonky bez odkazu.',
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      label: 'Název',
                      admin: {
                        description:
                          'Např. Instagram. Na webu není vidět, ale přečte ho hlasová čtečka pro nevidomé.',
                      },
                    },
                    iconField({ label: 'Ikona' }),
                    linkUrlField({ name: 'url', label: 'Odkaz', required: true }),
                  ],
                },
                {
                  name: 'linkColumns',
                  type: 'array',
                  label: 'Sloupce s odkazy',
                  labels: { singular: 'Sloupec', plural: 'Sloupce' },
                  defaultValue: D.footer.linkColumns.map((column) => ({
                    heading: column.heading,
                    links: column.links.map((link) => ({ ...link })),
                  })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Sloupce odkazů vpravo v patičce (např. „Rychlé odkazy“, „Informace“). ' +
                      'Pokud seznam necháte prázdný, zobrazí se výchozí sloupce.',
                  },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Nadpis sloupce', required: true },
                    {
                      name: 'links',
                      type: 'array',
                      label: 'Odkazy',
                      labels: { singular: 'Odkaz', plural: 'Odkazy' },
                      admin: { initCollapsed: true },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              label: 'Text',
                              required: true,
                              admin: { width: '50%' },
                            },
                            linkUrlField({
                              name: 'url',
                              label: 'Odkaz',
                              required: true,
                              width: '50%',
                            }),
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'copyright',
                  type: 'text',
                  label: 'Copyright',
                  defaultValue: D.footer.copyright,
                  admin: {
                    description:
                      'Text úplně dole. Napište {rok} a web místo něj doplní aktuální rok (např. „© {rok} SPPDF“).',
                  },
                },
                {
                  name: 'credit',
                  type: 'text',
                  label: 'Poznámka vpravo dole',
                  defaultValue: D.footer.credit,
                  admin: { description: 'Malý šedý text vpravo dole. Prázdné = nezobrazí se.' },
                },
              ],
            },
          ],
        },
        pageSeoTab(D.seo),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateLandingPage],
  },
}
