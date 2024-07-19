import { Turnstile } from '@marsidev/react-turnstile'
import { useRouter } from 'next/router'

export default function Challenge() {
  const router = useRouter()
  return (
    <div className='min-h-screen bg-[--off-white] flex items-center justify-center'>
      <Turnstile
        options={{ theme: "light", appearance: "interaction-only"}}
        siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY as string}
        onSuccess={() => router.push("/app")}
      />
    </div>
  )
}
