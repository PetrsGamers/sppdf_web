/**
 * Default content of the "Stránka O nás" global (the text that used to be hardcoded in
 * src/app/(landing)/aboutus/page.tsx). Used as `defaultValue` and as component fallback.
 */
export const aboutDefaults = {
  intro: {
    badge: 'Kdo jsme',
    headline: 'O {{nás}}',
    text: 'Jsme Spolek přátel pedagogické fakulty — komunita studentů, absolventů a pedagogů, kteří věří v sílu vzdělávání a společného růstu.',
    storyLinkLabel: 'Náš příběh',
  },
  features: {
    items: [
      {
        icon: 'diversity_3',
        title: 'Podpora studentů',
        description:
          'Pomáháme studentům pedagogické fakulty s orientací na fakultě, nabízíme mentoring a propojujeme je s absolventy.',
      },
      {
        icon: 'celebration',
        title: 'Kulturní akce',
        description:
          'Organizujeme společenské a kulturní události, které posilují komunitu a vytvářejí prostor pro neformální setkávání.',
      },
      {
        icon: 'account_balance',
        title: 'Reprezentace',
        description:
          'Zastupujeme zájmy studentů v akademických orgánech a aktivně se podílíme na zlepšování studijního prostředí.',
      },
    ],
  },
  history: {
    heading: 'Naše {{historie}}',
    items: [
      {
        year: '2010',
        title: 'Založení spolku',
        description:
          'Skupina nadšených studentů pedagogické fakulty založila neformální skupinu, ze které se později stal SPPDF.',
      },
      {
        year: '2015',
        title: 'Oficiální status',
        description:
          'Spolek získal oficiální registraci a stal se uznávanou studentskou organizací na fakultě.',
      },
      {
        year: 'Dnes',
        title: '100+ členů',
        description:
          'SPPDF je dnes jednou z největších studentských organizací na pedagogické fakultě s více než stovkou aktivních členů.',
      },
    ],
  },
  team: {
    heading: 'Náš {{tým}}',
    description:
      'Poznejte lidi, kteří stojí za chodem spolku a organizují aktivity pro celou fakultu.',
  },
  cta: {
    heading: 'Chceš měnit fakultu s námi?',
    text: 'Přidej se k SPPDF a staň se součástí komunity, která formuje budoucnost pedagogické fakulty.',
    primaryLabel: 'Přidej se k nám',
    primaryLink: '#',
    secondaryLabel: 'Prohlédnout akce',
    secondaryLink: '/calendar',
  },
  seo: {
    title: 'O nás | SPPDF',
    description: '',
  },
} as const
