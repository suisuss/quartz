import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <article class="popover-hint">
      <h1>404</h1>
      <p>This page either doesn't exist, or if you've clicked a link to here, the page is under review and is yet to be published.</p>
      <a href={baseDir}>Back to home</a>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
