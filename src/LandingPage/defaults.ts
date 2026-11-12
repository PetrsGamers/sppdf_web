/**
 * Default content of the "Hlavní stránka" global.
 *
 * Used both as `defaultValue` in the global config and as the fallback in the (landing)
 * components, so the text only lives in one place. Keep this file free of server-only imports –
 * it is also imported by client components.
 */
export const landingDefaults = {
  nav: {
    links: [
      { label: 'Domů', url: '/' },
      { label: 'O nás', url: '/aboutus' },
      { label: 'Kalendář', url: '/calendar' },
    ],
    ctaLabel: 'Přidat se',
    ctaLink: '#',
  },
  hero: {
    badge: 'Spolek přátel pedagogické fakulty',
    headline: 'Inspirujeme {{budoucí}} učitele.',
    ctaPrimary: { label: 'Zapojte se do spolku', link: '#' },
    ctaSecondary: { label: 'Naše vize', link: '#' },
    /**
     * Shown only while no hero image is uploaded in the admin. Hotlinked mock-up asset –
     * upload a real photo in "Hlavní stránka → Úvodní blok" to stop using it.
     */
    fallbackImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNnfMFHT1LBJeSErjbGdWY56q0TOGL-n_PEyDpmnnoqcAG07pU8Pk8-bXC4NKF7iC4BKiyitAOhuZRESKWfdXUjOGdkH6w6ydTb_OcROggbHzr8C2KoLMwvbM87Tmy5vM0ZnQ8PfDqv9N_47mTJN1VklDliNVYx7DW2zpJiFAz7yDYT7fDido59YVkITGNU1cMG0bxLc5bDsU-WwJmawtzuZDsaky3FLQdKXvx_1jS84FVGcTlsTqmh0YECGMUq6m1vaMIdZ3FfvIy',
    imageAlt: 'Ilustrační fotografie SPPDF',
  },
  ribbon: {
    items: [
      'Připojte se k SPPDF rodině!',
      'Učitelský večírek 2024',
      'Konference Pedagogika 2.0',
      'Workshop: Moderní metody',
      'Připojte se k SPPDF rodině!',
    ],
  },
  calendarSection: {
    heading: 'Kalendář událostí',
    description:
      'Sledujte, co připravujeme na Pedagogické fakultě. Od neformálních setkání po odborné přednášky.',
    endCardTitle: 'Připravujeme pro vás další akce',
    endCardText: 'Těšíme se na vás příští semestr',
    ctaHeading: 'Zajímá vás kompletní program?',
    ctaText: 'Podívejte se na všechny plánované akce v našem interaktivním kalendáři.',
    ctaButtonLabel: 'Prohlédnout celý měsíc',
    ctaButtonLink: '/calendar',
  },
  divisions: {
    heading: 'Sekce našeho spolku',
    description: 'Vyberte si oblast, která vás zajímá, a staňte se součástí týmu SPPDF.',
    linkLabel: 'Zjistit více',
    linkUrl: '#',
  },
  footer: {
    description:
      'Spolek přátel pedagogické fakulty je nezávislá organizace propojující generace učitelů a studentů v srdci naší univerzity.',
    socialLinks: [
      { icon: 'share', label: 'Sdílet', url: '#' },
      { icon: 'photo_camera', label: 'Instagram', url: '#' },
    ],
    linkColumns: [
      {
        heading: 'Rychlé odkazy',
        links: [
          { label: 'O nás', url: '/aboutus' },
          { label: 'Události', url: '/calendar' },
          { label: 'Staň se členem', url: '#' },
          { label: 'Partneři', url: '#' },
        ],
      },
      {
        heading: 'Informace',
        links: [
          { label: 'Ochrana údajů', url: '#' },
          { label: 'Stanovy', url: '#' },
          { label: 'Kontakt', url: '#' },
        ],
      },
    ],
    copyright: '© {rok} Spolek přátel pedagogické fakulty. Všechna práva vyhrazena.',
    credit: 'Design by SPPDF Creative Team',
  },
  seo: {
    title: 'SPPDF | Spolek přátel pedagogické fakulty',
    description:
      'Jsme komunita, která propojuje studenty a pedagogy. Tvoříme prostředí pro sdílení zkušeností a radosti z učitelského povolání.',
  },
} as const
