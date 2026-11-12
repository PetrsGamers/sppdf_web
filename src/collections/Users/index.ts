import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Uživatel',
    plural: 'Uživatelé',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Nastavení',
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    description:
      'Lidé, kteří se mohou přihlásit do administrace. Každý přihlášený uživatel může upravovat celý web ' +
      'i přidávat další uživatele – přístup dávejte jen důvěryhodným lidem.',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Jméno',
    },
  ],
  timestamps: true,
}
