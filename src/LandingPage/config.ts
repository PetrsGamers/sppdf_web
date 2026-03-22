import type { GlobalConfig } from 'payload'

import { revalidateLandingPage } from './hooks/revalidateLandingPage'

export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nav',
      type: 'group',
      label: 'Navigation',
      fields: [
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
          admin: { initCollapsed: true },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'CTA Button Label',
          defaultValue: 'Přidat se',
        },
        {
          name: 'ctaLink',
          type: 'text',
          label: 'CTA Button Link',
          defaultValue: '#',
        },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'badge',
          type: 'text',
          defaultValue: 'Spolek přátel pedagogické fakulty',
        },
        {
          name: 'headline',
          type: 'text',
          required: true,
          admin: {
            description: 'Use {{text}} to wrap words in the primary color. E.g. "Inspirujeme {{budoucí}} učitele."',
          },
        },
        { name: 'subtitle', type: 'textarea' },
        {
          name: 'ctaPrimary',
          type: 'group',
          label: 'Primary CTA',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Zapojte se do spolku' },
            { name: 'link', type: 'text', defaultValue: '#' },
          ],
        },
        {
          name: 'ctaSecondary',
          type: 'group',
          label: 'Secondary CTA',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Naše vize' },
            { name: 'link', type: 'text', defaultValue: '#' },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'ribbon',
      type: 'group',
      label: 'Event Ribbon',
      fields: [
        {
          name: 'items',
          type: 'array',
          fields: [{ name: 'text', type: 'text', required: true }],
          admin: { initCollapsed: true },
        },
      ],
    },
    {
      name: 'divisions',
      type: 'group',
      label: 'Divisions Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Sekce našeho spolku',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue: 'Vyberte si oblast, která vás zajímá, a staňte se součástí týmu SPPDF.',
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'icon',
              type: 'text',
              required: true,
              admin: { description: 'Material Symbol name, e.g. "devices"' },
            },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'linkLabel', type: 'text', defaultValue: 'Zjistit více' },
            { name: 'linkUrl', type: 'text', defaultValue: '#' },
          ],
          admin: { initCollapsed: true },
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Footer',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'Spolek přátel pedagogické fakulty je nezávislá organizace propojující generace učitelů a studentů v srdci naší univerzity.',
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'icon',
              type: 'text',
              required: true,
              admin: { description: 'Material Symbol name' },
            },
            { name: 'url', type: 'text', required: true },
          ],
          admin: { initCollapsed: true },
        },
        {
          name: 'linkColumns',
          type: 'array',
          fields: [
            { name: 'heading', type: 'text', required: true },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
              admin: { initCollapsed: true },
            },
          ],
          admin: { initCollapsed: true },
        },
        {
          name: 'copyright',
          type: 'text',
          defaultValue: '© 2024 Spolek přátel pedagogické fakulty. Všechna práva vyhrazena.',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateLandingPage],
  },
}
