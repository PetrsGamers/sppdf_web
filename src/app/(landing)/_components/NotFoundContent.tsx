import Link from 'next/link'

import { siteDefaults } from '@/SiteSettings/defaults'

import { getGlobal } from '../_lib/getGlobal'

/** Body of the 404 page; texts come from "Nastavení webu" → "Stránka nenalezena (404)". */
export async function NotFoundContent() {
  const settings = await getGlobal('site-settings')
  const notFound = settings.notFound

  const heading = notFound?.heading || siteDefaults.notFound.heading
  const text = notFound?.text ?? siteDefaults.notFound.text
  const buttonLabel = notFound?.buttonLabel || siteDefaults.notFound.buttonLabel

  return (
    <main className="pt-40 pb-28 md:pt-48 md:pb-36">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.9] tracking-tighter text-on-surface mb-6">
          {heading}
        </h1>
        {text && <p className="text-xl text-on-surface-variant mb-10">{text}</p>}
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-container text-on-primary px-8 py-3 rounded-full font-headline font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          {buttonLabel}
        </Link>
      </div>
    </main>
  )
}
