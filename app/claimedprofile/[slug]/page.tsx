"use client"

export default function Page({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    return <h1>Helo""{params.slug}</h1>
}
