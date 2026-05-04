import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const UnderConstruction: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <article class="popover-hint">
      <h1>Under Construction</h1>
      <p>The material you're looking for is yet to be published.</p>
      <a href={baseDir}>Back to home</a>
    </article>
  )
}

export default (() => UnderConstruction) satisfies QuartzComponentConstructor
