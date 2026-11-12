import type { GlobalConfig } from 'payload'

import { iconField } from '@/fields/icon'
import { linkUrlField } from '@/fields/linkUrl'
import { pageSeoTab } from '@/fields/pageSeo'
import { getServerSideURL } from '@/utilities/getURL'

import { aboutDefaults as D } from './defaults'
import { revalidateAboutPage } from './hooks/revalidateAboutPage'

const HIGHLIGHT_HELP =
  'Slova ve dvojitých složených závorkách se zvýrazní barvou spolku, např. „Náš {{tým}}“.'

/** "Stránka O nás" – everything on /aboutus except the team members themselves. */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'Stránka O nás',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Obsah webu',
    description:
      'Texty stránky O nás (/aboutus). Jednotlivé členy týmu přidáváte v sekci Obsah webu → Členové týmu. ' +
      'Změny se na webu projeví hned po uložení.',
    preview: () => `${getServerSideURL()}/aboutus`,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Úvod',
          description: 'Horní část stránky s nadpisem.',
          fields: [
            {
              name: 'intro',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  label: 'Štítek nad nadpisem',
                  defaultValue: D.intro.badge,
                  admin: { description: 'Prázdné = štítek se nezobrazí.' },
                },
                {
                  name: 'headline',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.intro.headline,
                  admin: { description: HIGHLIGHT_HELP },
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Úvodní text',
                  defaultValue: D.intro.text,
                },
                {
                  name: 'storyLinkLabel',
                  type: 'text',
                  label: 'Text odkazu na historii',
                  defaultValue: D.intro.storyLinkLabel,
                  admin: {
                    description:
                      'Odkaz, který posune stránku dolů na část Historie. Prázdné = odkaz se nezobrazí.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Co děláme',
          description: 'Tři (nebo více) karty s ikonou pod úvodem.',
          fields: [
            {
              name: 'features',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  label: 'Karty',
                  labels: { singular: 'Karta', plural: 'Karty' },
                  defaultValue: D.features.items.map((item) => ({ ...item })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Pořadí změníte přetažením. Nejlépe vypadají 3 karty (nebo násobky 3). Bez karet se blok skryje.',
                  },
                  fields: [
                    { name: 'title', type: 'text', label: 'Nadpis', required: true },
                    iconField(),
                    { name: 'description', type: 'textarea', label: 'Text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Historie',
          description: 'Časová osa s milníky spolku.',
          fields: [
            {
              name: 'history',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.history.heading,
                  admin: { description: HIGHLIGHT_HELP },
                },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Milníky',
                  labels: { singular: 'Milník', plural: 'Milníky' },
                  defaultValue: D.history.items.map((item) => ({ ...item })),
                  admin: {
                    initCollapsed: true,
                    description:
                      'Zobrazují se v tomto pořadí shora dolů (pořadí změníte přetažením). Bez milníků se blok skryje.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'year',
                          type: 'text',
                          label: 'Rok / období',
                          required: true,
                          admin: { width: '30%', description: 'Např. 2010 nebo „Dnes“.' },
                        },
                        {
                          name: 'title',
                          type: 'text',
                          label: 'Nadpis',
                          required: true,
                          admin: { width: '70%' },
                        },
                      ],
                    },
                    { name: 'description', type: 'textarea', label: 'Text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Tým',
          description:
            'Nadpis bloku s týmem. Samotné členy (jméno, funkce, fotka, pořadí) upravíte v sekci Obsah webu → Členové týmu.',
          fields: [
            {
              name: 'team',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.team.heading,
                  admin: { description: HIGHLIGHT_HELP },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Text pod nadpisem',
                  defaultValue: D.team.description,
                },
              ],
            },
          ],
        },
        {
          label: 'Výzva na konci',
          description: 'Tmavý blok s tlačítky na konci stránky.',
          fields: [
            {
              name: 'cta',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Nadpis',
                  defaultValue: D.cta.heading,
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Text',
                  defaultValue: D.cta.text,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'primaryLabel',
                      type: 'text',
                      label: 'Hlavní tlačítko – text',
                      defaultValue: D.cta.primaryLabel,
                      admin: { width: '50%', description: 'Prázdné = tlačítko se nezobrazí.' },
                    },
                    linkUrlField({
                      name: 'primaryLink',
                      label: 'Hlavní tlačítko – odkaz',
                      defaultValue: D.cta.primaryLink,
                      description:
                        'Např. odkaz na přihlášku. Hodnota # znamená, že tlačítko nikam nevede.',
                      width: '50%',
                    }),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'secondaryLabel',
                      type: 'text',
                      label: 'Vedlejší tlačítko – text',
                      defaultValue: D.cta.secondaryLabel,
                      admin: { width: '50%', description: 'Prázdné = tlačítko se nezobrazí.' },
                    },
                    linkUrlField({
                      name: 'secondaryLink',
                      label: 'Vedlejší tlačítko – odkaz',
                      defaultValue: D.cta.secondaryLink,
                      width: '50%',
                    }),
                  ],
                },
              ],
            },
          ],
        },
        pageSeoTab({ title: D.seo.title }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateAboutPage],
  },
}
