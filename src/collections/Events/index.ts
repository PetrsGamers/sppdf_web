import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateEvent, revalidateEventDelete } from './hooks/revalidateEvent'
import { slugField } from 'payload'
import { linkUrlField } from '../../fields/linkUrl'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  labels: {
    singular: 'Akce',
    plural: 'Akce',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Kalendář',
    defaultColumns: ['title', 'date', 'location', 'category', '_status'],
    useAsTitle: 'title',
    listSearchableFields: ['title', 'location'],
    description:
      'Akce zobrazené na hlavní stránce a v kalendáři (/calendar). Na webu se zobrazují jen publikované akce. ' +
      'Akce se každý den ráno automaticky načítají z Google Kalendáře spolku. U takto načtených akcí se ' +
      'název, datum, čas, délka, místo, popis i stav „publikováno“ při další synchronizaci přepíšou podle ' +
      'Google Kalendáře – měňte je proto přímo tam. Kategorii, barvu a odkaz na registraci můžete doplnit zde, ' +
      'ty synchronizace nepřepisuje. Akce, které mají v popisu v Google Kalendáři slovo „internal“, se na web nenačítají.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Název akce',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Datum a čas začátku',
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'd. M. yyyy HH:mm',
            },
            description: 'Podle tohoto data se akce řadí a zobrazí ve správném dni kalendáře.',
          },
        },
        {
          name: 'time',
          type: 'text',
          label: 'Čas (text na webu)',
          admin: {
            width: '25%',
            description: 'Jak se čas vypíše na webu, např. „14:00“ nebo „14:00–16:00“.',
          },
        },
        {
          name: 'duration',
          type: 'text',
          label: 'Délka',
          admin: {
            width: '25%',
            description: 'Např. „3 hodiny“. Na hlavní stránce se ukáže, jen když chybí místo i čas.',
          },
        },
      ],
    },
    {
      name: 'location',
      type: 'text',
      label: 'Místo',
      admin: { description: 'Např. „Aula PdF, Poříčí 7“.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Popis',
      admin: { description: 'Zobrazí se v detailu akce v kalendáři (/calendar).' },
    },
    linkUrlField({
      name: 'registrationUrl',
      label: 'Odkaz na registraci',
      description:
        'Kam vede tlačítko „Registrovat se“ v kalendáři (např. odkaz na Google formulář). ' +
        'Když necháte prázdné, použije se výchozí odkaz ze Stránky Kalendář; pokud není ani ten, tlačítko se nezobrazí.',
    }),
    {
      name: 'category',
      type: 'select',
      label: 'Kategorie',
      admin: {
        position: 'sidebar',
        description: 'Štítek nad názvem akce.',
      },
      options: [
        { label: 'Kulturní', value: 'kulturní' },
        { label: 'Volný čas', value: 'volný čas' },
        { label: 'Studijní', value: 'studijní' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Konference', value: 'konference' },
      ],
    },
    {
      name: 'categoryColor',
      type: 'select',
      label: 'Barva štítku',
      options: [
        { label: 'Oranžová', value: 'orange' },
        { label: 'Modrá', value: 'blue' },
        { label: 'Zelená', value: 'green' },
        { label: 'Fialová', value: 'purple' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Barva štítku s kategorií. Když nevyberete, použije se oranžová.',
      },
    },
    {
      // Not used by the website at the moment – hidden so editors are not confused.
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'googleCalendarEventId',
      type: 'text',
      label: 'ID v Google Kalendáři',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Vyplňuje se automaticky u akcí načtených z Google Kalendáře. Prázdné = akce byla přidána ručně zde.',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateEventDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
