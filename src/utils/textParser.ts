export function decodeHtmlEntities(str: string): string {
  if (!str) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

export function cleanHnHtml(rawHtml?: string): string {
  if (!rawHtml) return ''

  let formatted = rawHtml

  // Format code blocks
  formatted = formatted.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/gi,
    '<pre class="my-2.5 p-2.5 bg-[#141414] border border-white/10 rounded overflow-x-auto text-xs font-mono text-[#cccccc] leading-relaxed"><code>$1</code></pre>'
  )

  // Style links cleanly
  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>(.*?)<\/a>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#6cb6ff] hover:underline underline-offset-2 break-all">$3</a>'
  )

  // Format quote lines that genuinely start with &gt; at the start of text or after <p>
  formatted = formatted.replace(
    /(?:^|<p>)(?:&gt;\s*)([^\n<]+)/gi,
    '<p class="text-[#999999] italic pl-2.5 border-l border-white/20 my-2">$1</p>'
  )

  return formatted
}
