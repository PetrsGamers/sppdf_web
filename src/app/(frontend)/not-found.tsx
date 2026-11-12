import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Button } from '@/components/ui/button'
import { siteDefaults } from '@/SiteSettings/defaults'

export default async function NotFound() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const notFound = settings.notFound

  const heading = notFound?.heading || siteDefaults.notFound.heading
  const text = notFound?.text ?? siteDefaults.notFound.text
  const buttonLabel = notFound?.buttonLabel || siteDefaults.notFound.buttonLabel

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>{heading}</h1>
        {text && <p className="mb-4">{text}</p>}
      </div>
      <Button asChild variant="default">
        <Link href="/">{buttonLabel}</Link>
      </Button>
    </div>
  )
}
