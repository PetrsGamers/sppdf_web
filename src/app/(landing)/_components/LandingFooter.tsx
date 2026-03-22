import type { LandingPage } from '@/payload-types'

type Props = {
  footer: LandingPage['footer']
}

export function LandingFooter({ footer }: Props) {
  const description =
    footer?.description ??
    'Spolek přátel pedagogické fakulty je nezávislá organizace propojující generace učitelů a studentů v srdci naší univerzity.'
  const socialLinks = footer?.socialLinks ?? []
  const linkColumns = footer?.linkColumns ?? []
  const copyright =
    footer?.copyright ?? '© 2024 Spolek přátel pedagogické fakulty. Všechna práva vyhrazena.'

  return (
    <footer className="bg-stone-50 border-t border-stone-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 py-16">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <img
              alt="Footer Logo"
              className="h-8 w-8 object-contain"
              src="/logo-sppdf.svg"
            />
            <span className="text-xl font-bold text-stone-900">SPPDF</span>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed max-w-sm">{description}</p>
          <div className="flex gap-4">
            {socialLinks.length > 0
              ? socialLinks.map((social, i) => (
                  <a
                    key={social.id ?? i}
                    className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                    href={social.url}
                  >
                    <span className="material-symbols-outlined text-xl">{social.icon}</span>
                  </a>
                ))
              : (
                <>
                  <a
                    className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-xl">share</span>
                  </a>
                  <a
                    className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </a>
                </>
              )}
          </div>
        </div>
        {linkColumns.length > 0
          ? linkColumns.map((column, i) => (
              <div key={column.id ?? i} className="space-y-6">
                <h4 className="font-bold text-stone-900">{column.heading}</h4>
                <ul className="space-y-4">
                  {column.links?.map((link, j) => (
                    <li key={link.id ?? j}>
                      <a
                        className="text-stone-500 hover:text-primary transition-colors text-sm"
                        href={link.url}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          : (
            <>
              <div className="space-y-6">
                <h4 className="font-bold text-stone-900">Rychlé odkazy</h4>
                <ul className="space-y-4">
                  {['O nás', 'Události', 'Staň se členem', 'Partneři'].map((label) => (
                    <li key={label}>
                      <a className="text-stone-500 hover:text-primary transition-colors text-sm" href="#">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold text-stone-900">Informace</h4>
                <ul className="space-y-4">
                  {['Ochrana údajů', 'Stanovy', 'Kontakt'].map((label) => (
                    <li key={label}>
                      <a className="text-stone-500 hover:text-primary transition-colors text-sm" href="#">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-12 border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 text-sm">{copyright}</p>
        <div className="flex gap-6">
          <span className="text-stone-400 text-xs">Design by SPPDF Creative Team</span>
        </div>
      </div>
    </footer>
  )
}
