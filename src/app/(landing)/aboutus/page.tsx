import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })

  const teamData = await payload.find({
    collection: 'team-members',
    sort: 'order',
    limit: 20,
  })

  const teamMembers = teamData.docs

  return (
    <>
      {/* Hero */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden bg-stone-50/50">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-5 blur-3xl bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide uppercase mb-8">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            Kdo jsme
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.9] tracking-tighter text-on-surface mb-6">
            O <span className="text-primary">nás</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Jsme Spolek přátel pedagogické fakulty — komunita studentů, absolventů a pedagogů,
            kteří věří v sílu vzdělávání a společného růstu.
          </p>
          <div className="mt-8">
            <a
              href="#historie"
              className="inline-flex items-center gap-2 text-primary font-bold font-headline hover:gap-4 transition-all"
            >
              Náš příběh
              <span className="material-symbols-outlined">arrow_downward</span>
            </a>
          </div>
        </div>
      </header>

      {/* Three-column features */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map((feature) => (
              <div
                key={feature.icon}
                className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-6">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tighter mb-4">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline "Naše historie" */}
      <section id="historie" className="py-24 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-16 text-center text-on-surface">
            Naše <span className="text-primary">historie</span>
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-stone-200 -translate-x-1/2" />

            {[
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
            ].map((milestone, i) => (
              <div
                key={milestone.year}
                className={`relative flex items-start mb-16 last:mb-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 mt-2 ring-4 ring-white z-10" />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-1/2 ${
                    i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'
                  }`}
                >
                  <span className="text-sm font-black text-primary font-headline tracking-widest uppercase">
                    {milestone.year}
                  </span>
                  <h3 className="text-2xl font-black font-headline tracking-tighter mt-1 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team "Náš tým" */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-4 text-on-surface">
              Náš <span className="text-primary">tým</span>
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Poznejte lidi, kteří stojí za chodem spolku a organizují aktivity pro celou fakultu.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {teamMembers.length > 0
              ? teamMembers.map((member) => {
                  const photo = member.photo as Media | undefined
                  return (
                    <div
                      key={member.id}
                      className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 text-center hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                    >
                      {photo?.url ? (
                        <img
                          alt={member.name}
                          className="w-28 h-28 rounded-full object-cover mx-auto mb-6 ring-4 ring-stone-100 group-hover:ring-primary/20 transition-all"
                          src={photo.url}
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-surface-container-high mx-auto mb-6 flex items-center justify-center ring-4 ring-stone-100 group-hover:ring-primary/20 transition-all">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                            person
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-black font-headline tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-1">{member.role}</p>
                    </div>
                  )
                })
              : /* Fallback placeholder cards */
                [
                  { name: 'Jan Novák', role: 'Předseda' },
                  { name: 'Marie Svobodová', role: 'Místopředsedkyně' },
                  { name: 'Petr Kučera', role: 'Správce financí' },
                  { name: 'Eva Černá', role: 'PR koordinátorka' },
                  { name: 'Tomáš Dvořák', role: 'Organizátor akcí' },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 text-center hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                  >
                    <div className="w-28 h-28 rounded-full bg-surface-container-high mx-auto mb-6 flex items-center justify-center ring-4 ring-stone-100 group-hover:ring-primary/20 transition-all">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                        person
                      </span>
                    </div>
                    <h3 className="text-lg font-black font-headline tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">{member.role}</p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-stone-900 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white mb-4">
                Chceš měnit fakultu s námi?
              </h2>
              <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
                Přidej se k SPPDF a staň se součástí komunity, která formuje budoucnost
                pedagogické fakulty.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="#"
                  className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-headline font-extrabold text-lg flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20"
                >
                  Přidej se k nám
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
                <Link
                  href="/calendar"
                  className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-white/20 transition-all active:scale-95"
                >
                  Prohlédnout akce
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
