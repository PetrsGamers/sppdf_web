import type { GlobalConfig } from 'payload'

import { linkUrlField } from '@/fields/linkUrl'
import { pageSeoTab } from '@/fields/pageSeo'
import { getServerSideURL } from '@/utilities/getURL'

import { calendarDefaults as D } from './defaults'
import { revalidateCalendarPage } from './hooks/revalidateCalendarPage'

/** "Stránka Kalendář" – texts and SEO of /calendar. The events themselves live in the Events collection. */
export const CalendarPage: GlobalConfig = {
  slug: 'calendar-page',
  label: 'Stránka Kalendář',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Obsah webu',
    description:
      'Texty stránky s měsíčním kalendářem (/calendar). Samotné akce spravujete v sekci Kalendář → Akce.',
    preview: () => `${getServerSideURL()}/calendar`,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Texty a tlačítka',
          fields: [
            {
              name: 'texts',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'academicYearLabel',
                  type: 'text',
                  label: 'Popisek nad názvem měsíce',
                  defaultValue: D.texts.academicYearLabel,
                  admin: {
                    description:
                      'Za text se automaticky doplní akademický rok, např. „Akademický rok 2026/27“.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'registerButtonLabel',
                      type: 'text',
                      label: 'Text tlačítka u akce',
                      defaultValue: D.texts.registerButtonLabel,
                      admin: { width: '50%' },
                    },
                    linkUrlField({
                      name: 'defaultRegistrationUrl',
                      label: 'Výchozí odkaz na registraci',
                      defaultValue: D.texts.defaultRegistrationUrl,
                      description:
                        'Použije se u akcí, které nemají vlastní „Odkaz na registraci“. ' +
                        'Když necháte prázdné, tlačítko se u takových akcí nezobrazí.',
                      width: '50%',
                    }),
                  ],
                },
                {
                  name: 'selectDayText',
                  type: 'text',
                  label: 'Text, když není vybraný den',
                  defaultValue: D.texts.selectDayText,
                },
                {
                  name: 'noEventsText',
                  type: 'text',
                  label: 'Text pro den bez akcí',
                  defaultValue: D.texts.noEventsText,
                  admin: {
                    description: 'Místo {datum} se doplní vybraný den, např. „12. Listopad“.',
                  },
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
    afterChange: [revalidateCalendarPage],
  },
}
