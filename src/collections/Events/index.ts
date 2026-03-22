import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateEvent, revalidateEventDelete } from './hooks/revalidateEvent'
import { slugField } from 'payload'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'date', 'category', 'featured', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'time',
      type: 'text',
      admin: {
        description: 'Display time, e.g. "14:00"',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'e.g. "3 hodiny"',
      },
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'select',
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
      options: [
        { label: 'Orange', value: 'orange' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
      ],
      admin: {
        description: 'Badge color for the category',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show as the large "today" card',
      },
    },
    {
      name: 'googleCalendarEventId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-populated by Google Calendar sync',
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
