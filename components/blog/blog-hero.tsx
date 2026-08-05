import type { ReactNode } from 'react'
import Image from 'next/image'

type Props = {
  banner: string
  authorImage: string
  title: string
  children?: ReactNode
}

export function BlogHero({ banner, authorImage, title, children }: Props) {
  return (
    <header className="pt-24 sm:pt-28 pb-2">
      <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
        <div className="relative w-full overflow-hidden rounded-[22px] sm:rounded-[28px] bg-muted/40 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-[16/9] sm:aspect-[2.35/1] min-h-[200px] max-h-[420px]">
            <Image
              src={banner}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 980px) 100vw, 980px"
              unoptimized={banner.startsWith('http')}
            />
          </div>
        </div>

        <div className="relative z-10 flex justify-center -mt-12 sm:-mt-14">
          <div className="size-[104px] sm:size-[120px] rounded-full overflow-hidden bg-[#f5f5f7] dark:bg-neutral-800 ring-[5px] ring-background shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
            <Image
              src={authorImage}
              alt=""
              width={120}
              height={120}
              className="size-full object-cover"
              unoptimized={authorImage.startsWith('http')}
            />
          </div>
        </div>

        <h1
          className="mt-5 sm:mt-6 text-center text-[1.85rem] sm:text-[2.75rem] md:text-[3.25rem] font-semibold tracking-[-0.035em] leading-[1.12] text-balance px-1"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
        >
          {title}
        </h1>

        {children ? (
          <div
            className="mt-5 sm:mt-6 mx-auto w-full max-w-[640px] text-center"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
          >
            {children}
          </div>
        ) : null}
      </div>
    </header>
  )
}
