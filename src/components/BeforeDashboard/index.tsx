import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const sections: { href: string; title: string; text: string }[] = [
  {
    href: '/admin/globals/landing-page',
    title: 'Hlavní stránka',
    text: 'Úvodní blok, běžící pás, texty u kalendáře, sekce spolku – a také horní menu a patička pro celý web.',
  },
  {
    href: '/admin/globals/about-page',
    title: 'Stránka O nás',
    text: 'Úvod, karty „co děláme“, historie spolku, nadpis týmu a závěrečná výzva.',
  },
  {
    href: '/admin/collections/team-members',
    title: 'Členové týmu',
    text: 'Lidé na stránce O nás – jméno, funkce, fotka a pořadí.',
  },
  {
    href: '/admin/collections/events',
    title: 'Akce',
    text: 'Akce v kalendáři. Většina se načítá automaticky z Google Kalendáře spolku.',
  },
  {
    href: '/admin/globals/calendar-page',
    title: 'Stránka Kalendář',
    text: 'Texty měsíčního kalendáře a výchozí odkaz na registraci.',
  },
  {
    href: '/admin/collections/media',
    title: 'Obrázky a soubory',
    text: 'Všechny nahrané fotky. Nezapomeňte vyplnit popis obrázku (alt).',
  },
  {
    href: '/admin/globals/site-settings',
    title: 'Nastavení webu',
    text: 'Logo, favicon, výchozí texty pro Google a sdílení, stránka 404.',
  },
]

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Vítejte v administraci webu SPPDF</h4>
      </Banner>
      <p>
        Tady upravíte veškerý obsah webu. Po kliknutí na <strong>Uložit</strong> (u akcí{' '}
        <strong>Publikovat změny</strong>) se změna na webu projeví hned – stačí stránku webu
        obnovit. Tlačítkem <strong>Náhled</strong> otevřete danou stránku webu v nové záložce.
      </p>
      <ul className={`${baseClass}__instructions`}>
        {sections.map((section) => (
          <li key={section.href}>
            <a href={section.href}>
              <strong>{section.title}</strong>
            </a>
            {' – '}
            {section.text}
          </li>
        ))}
      </ul>
      <p>
        Tipy: Slova v nadpisech ve {'{{'}složených závorkách{'}}'} se zvýrazní oranžově. Odkazy na
        stránky tohoto webu začínají lomítkem (<code>/calendar</code>), odkazy jinam celou adresou (
        <code>https://…</code>). Nápovědu najdete pod každým polem.{' '}
        <a href="/" rel="noopener noreferrer" target="_blank">
          Otevřít web
        </a>
      </p>
    </div>
  )
}

export default BeforeDashboard
