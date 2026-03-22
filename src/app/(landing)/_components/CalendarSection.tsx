import type { Event } from '@/payload-types'

type Props = {
  events: Event[]
}

const categoryColorMap: Record<string, string> = {
  orange: 'bg-orange-50 text-primary',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('cs-CZ', { month: 'long' })
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
  return { day, month: capitalizedMonth }
}

export function CalendarSection({ events }: Props) {
  const featuredEvent = events.find((e) => e.featured) ?? events[0]
  const otherEvents = events.filter((e) => e.id !== featuredEvent?.id).slice(0, 2)

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-4 text-on-surface">
            Kalendář událostí
          </h2>
          <p className="text-lg text-on-surface-variant">
            Sledujte, co připravujeme na Pedagogické fakultě. Od neformálních setkání po odborné
            přednášky.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white border border-stone-200 rounded-full hover:bg-surface-container-high hover:border-transparent transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-3 bg-white border border-stone-200 rounded-full hover:bg-surface-container-high hover:border-transparent transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Featured / Today Card */}
        {featuredEvent && (() => {
          const { day, month } = formatDate(featuredEvent.date)
          const colorClass = categoryColorMap[featuredEvent.categoryColor ?? 'orange'] ?? 'bg-stone-100 text-stone-600'
          return (
            <div className="md:col-span-6 bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col justify-between group hover:shadow-xl hover:border-primary/20 transition-all duration-300 min-h-[400px]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-7xl font-black text-primary font-headline leading-none">
                    {day}
                  </span>
                  <span className="text-xl font-bold text-stone-400 font-headline uppercase tracking-wider">
                    {month}
                  </span>
                </div>
                {featuredEvent.featured && (
                  <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-full text-xs font-black tracking-widest">
                    DNES
                  </span>
                )}
              </div>
              <div className="mt-8">
                {featuredEvent.category && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colorClass} text-[10px] font-bold tracking-widest uppercase mb-4`}>
                    {featuredEvent.category.toUpperCase()}
                  </div>
                )}
                <h3 className="text-4xl font-black font-headline mb-4 tracking-tighter leading-tight group-hover:text-primary transition-colors">
                  {featuredEvent.title}
                </h3>
                {featuredEvent.description && (
                  <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                    {featuredEvent.description}
                  </p>
                )}
                <div className="flex items-center gap-6">
                  {featuredEvent.location && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                      <span className="font-bold">{featuredEvent.location}</span>
                    </div>
                  )}
                  {featuredEvent.time && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                      <span className="font-bold">{featuredEvent.time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Secondary Events */}
        {otherEvents.map((event) => {
          const { day, month } = formatDate(event.date)
          const colorClass = categoryColorMap[event.categoryColor ?? 'blue'] ?? 'bg-stone-100 text-stone-600'
          return (
            <div
              key={event.id}
              className="md:col-span-3 bg-white rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-lg transition-all border border-stone-100 group"
            >
              <div className="flex flex-col">
                <span className="text-5xl font-black text-stone-300 font-headline group-hover:text-primary/40 transition-colors">
                  {day}
                </span>
                <span className="text-sm font-bold text-stone-400 font-headline uppercase">
                  {month}
                </span>
              </div>
              <div className="mt-12">
                {event.category && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colorClass} text-[10px] font-bold tracking-widest uppercase mb-4`}>
                    {event.category.toUpperCase()}
                  </div>
                )}
                <h3 className="text-2xl font-black font-headline mb-4 tracking-tighter">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-stone-500 font-bold text-sm">
                  {event.time ? (
                    <>
                      <span className="material-symbols-outlined text-base">schedule</span> {event.time}
                    </>
                  ) : event.duration ? (
                    <>
                      <span className="material-symbols-outlined text-base">event</span> {event.duration}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}

        {/* Integrated CTA */}
        <div className="md:col-span-12">
          <div className="group relative bg-stone-900 rounded-[2rem] p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between border border-stone-800 transition-all hover:bg-stone-950">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img
                alt="Pattern"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQmtily0pgDMjCsFm3UNBOE9LG8OwHzuXSFQaspshtF5RP0pqRDP3TOqc0xvEPmHxeRTnLIH2dyUYdFiqSVVK0jRRDkdWBmZvgIgy1Cdv8Gz5xQi4kVkxcXzYe2eHycBnJtDXpVC3JBnmxwwXOlOkckqwsclRzwAzDL64BTl7KDhXinuaGwHsoyI1w9DoMINVItH4ZmgvysRAJ7dGSYHsf9yKWJ8P9N5iSo1IiIlYDac6rcz79PHqy2dKTbEjCUnRuZ7EzSAXT4lur"
              />
            </div>
            <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-black text-white font-headline tracking-tighter">
                Zajímá vás kompletní program?
              </h3>
              <p className="text-stone-400">
                Podívejte se na všechny plánované akce v našem interaktivním kalendáři.
              </p>
            </div>
            <div className="relative z-10">
              <a
                className="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-primary hover:text-white transition-all transform active:scale-95"
                href="#"
              >
                Prohlédnout celý měsíc
                <span className="material-symbols-outlined">calendar_month</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
