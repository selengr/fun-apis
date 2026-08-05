import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BlogMarkdown({ markdown }: { markdown: string }) {
  if (!markdown?.trim()) return null

  return (
    <div className="blog-prose prose prose-neutral dark:prose-invert max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:underline-offset-2 prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ''} className="w-full rounded-xl my-6" />
            ) : null,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
