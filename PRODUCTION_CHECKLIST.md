# Checklist před spuštěním do produkce

Stav k 19. 11. 2026, commit `f853883` na `main`. Vychází z kódu v repu a z toho, co v ten den vracel živý web na `https://sppdfmuni.petrhybl.com`.

Ověřeno lokálně s čistou databází: migrace, `tsc --noEmit`, `npm run build`, integrační test (1) a e2e testy (5) prošly. `npm run lint` hlásí jen varování.

Hotové body odškrtávejte (`- [x]`). Položky jsou seřazené podle priority.

## 1. Blokující – před spuštěním

### Bezpečnost

- [ ] Aktualizovat Next.js z 15.4.11 na 15.5.29. `npm audit` hlásí 1 kritickou zranitelnost (mj. vzdálené spuštění kódu přes optimalizaci obrázků); oprava je v rámci stejné hlavní verze.
- [ ] Projít účty v administraci: smazat testovací, nastavit silná hesla. Každý přihlášený uživatel má plná práva včetně zakládání dalších uživatelů.
- [ ] Ověřit, že `PAYLOAD_SECRET` je dlouhý a náhodný a že `GOOGLE_API_KEY` je omezený jen na Calendar API.
- [ ] Nastavit zálohy Postgresu a složky `public/media` a jednou vyzkoušet obnovu.
- [ ] Ověřit, že `public/media` je na trvalém svazku: nahrát obrázek, udělat redeploy, zkontrolovat, že zůstal.

### Obsah

Zjištěno na živém webu.

- [ ] Doplnit odkazy, které vedou na `#`: 28 na úvodní stránce, 9 na `/aboutus`, 8 na `/calendar`. Patří sem tlačítka pro přidání se ke spolku, sociální sítě a v patičce Ochrana údajů, Stanovy, Kontakt a Partneři.
- [ ] Nahrát skutečnou fotku do úvodního bloku (Hlavní stránka → Úvodní blok). Bez ní se načítá zástupný obrázek z cizího serveru Googlu (`fallbackImageUrl` v `src/LandingPage/defaults.ts`).
- [ ] Přepsat zástupné texty na `/aboutus` (historie „2010 Založení spolku“, „100+ členů“).
- [ ] Nahradit testovacího člena týmu („Peta Hybl – Borec“) skutečným týmem.
- [ ] Nastavit obrázek pro sdílení a vlastní popisy stránek. Hlavní stránky nemají žádný `og:image` a všechny tři sdílejí stejný popis.
- [ ] Upravit nebo smazat kredit „Design by SPPDF Creative Team“ v patičce.

### Pozůstatky šablony

- [ ] Odstranit nebo přesměrovat veřejné stránky `/posts`, `/search` a `/[slug]` (`src/app/(frontend)`).
- [ ] Opravit stránku 404: zobrazuje hlavičku šablony s logem Payload a sdílecí obrázek šablony (`public/website-template-OG.webp`).
- [ ] Opravit sitemapu: obsahuje jen `/search` a `/posts`, zatímco `/`, `/aboutus` a `/calendar` v ní chybí (`next-sitemap.config.cjs` vylučuje `/*`).
- [ ] Zavřít veřejné čtení nepoužívaných kolekcí v API: `pages`, `posts`, `categories`, `forms`, `search` a `redirects` vrací 200.

### Doména

- [ ] Rozhodnout finální doménu.
- [ ] Nastavit DNS a HTTPS pro finální doménu, případně i variantu s `www`.
- [ ] Změnit `NEXT_PUBLIC_SERVER_URL` jako build proměnnou v Coolify a udělat nový build. Z hodnoty se generují `robots.txt`, sitemapa a kanonické adresy.
- [ ] Přesměrovat starou adresu trvale (301) na novou.

## 2. Důležité – ideálně před spuštěním

- [ ] Přidat bezpečnostní hlavičky (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, zákaz vkládání do rámců) a vypnout `x-powered-by`.
- [ ] Změnit přesměrování z HTTP na HTTPS z dočasného (302) na trvalé.
- [ ] Nastavit `serverURL` a `csrf` v `src/payload.config.ts`. Seznam povolených původů je prázdný.
- [ ] Připojit odesílání e-mailů. Bez něj nefunguje obnova zapomenutého hesla, e-mail se jen zapíše do logu serveru.
- [ ] Hostovat ikonové písmo Material Symbols lokálně místo z `fonts.googleapis.com` (GDPR i rychlost načítání).
- [ ] Opravit celodenní akce ze synchronizace: zobrazují délku „24 hodin“ (`src/jobs/syncGoogleCalendar.ts`).
- [ ] Servírovat zmenšené varianty obrázků. Stránky načítají originály v plné velikosti přes `<img>`.
- [ ] Přidat CI (typecheck, lint, build, testy). V repu není žádný workflow.
- [ ] Nastavit hlídání dostupnosti a upozornění, když selže synchronizace kalendáře.
- [ ] Projít web na mobilu a udělat kontrolu přístupnosti a rychlosti (Lighthouse). Zatím neměřeno.
- [ ] Opravit nápovědu u Akcí v administraci: píše „každý den ráno“, synchronizace běží každou hodinu.

## 3. Úklid – může počkat

- [ ] Smazat nefunkční `Dockerfile` a `docker-compose.yml` (MongoDB, Node 18).
- [ ] Odstranit nebo opravit skripty v `package.json`, které volají `pnpm` (`test`, `dev:prod`, `ii`, `reinstall`).
- [ ] Opravit README: uvádí Payload 3.79.1 a tlačítko „Seed“, které už v kódu není.
- [ ] Sledovat opravu zbývajících zranitelností v balíčcích Payloadu (3 vysoké, 5 středních). K 19. 11. 2026 pro ně není aktualizace.

## 4. Den spuštění a po něm

- [ ] Po deployi zkontrolovat v logu `Google Calendar sync complete` a že se akce objeví na webu.
- [ ] Projít `/`, `/aboutus`, `/calendar`, `/admin`, `robots.txt` a `sitemap.xml` na nové doméně.
- [ ] Otestovat náhled sdílení odkazu (Facebook, WhatsApp).
- [ ] Přidat web do Google Search Console a odeslat sitemapu.
- [ ] Zaškolit editory a předat jim přístupy.

## Otevřená rozhodnutí

- **Finální doména.** Na jaké adrese má web běžet? Od toho se odvíjí celá část Doména.
- **Stránky Ochrana údajů, Stanovy, Kontakt.** Web nemá typ stránky pro obecný text. Nejrychlejší je odkázat na PDF nebo e-mail; vlastní textové stránky znamenají vývoj navíc. Zásady ochrany údajů je vhodné mít, protože web zveřejňuje jména a fotky členů.
- **Šablonové stránky a kolekce.** Buď je odstranit úplně včetně kolekcí (vyžaduje migraci databáze), nebo je jen přesměrovat a skrýt z vyhledávačů.
