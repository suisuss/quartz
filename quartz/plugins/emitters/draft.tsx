import { read } from "to-vfile"
import matter from "gray-matter"
import yaml from "js-yaml"
import toml from "toml"
import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FilePath, FullSlug, joinSegments, pathToRoot, slugifyFilePath } from "../../util/path"
import { sharedPageComponents, defaultContentPageLayout } from "../../../quartz.layout"
import { UnderConstruction } from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"

const TITLE = "Under Construction"

export const DraftPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    pageBody: UnderConstruction(),
    beforeBody: [],
    left: defaultContentPageLayout.left,
    right: [],
  }

  const { head: Head, pageBody, footer: Footer } = opts
  const Body = BodyConstructor()

  async function findDraftSlugs(directory: string, allFiles: FilePath[]): Promise<FullSlug[]> {
    const slugs: FullSlug[] = []
    for (const fp of allFiles) {
      if (!fp.endsWith(".md")) continue
      const fullPath = joinSegments(directory, fp) as FilePath
      try {
        const file = await read(fullPath)
        const { data } = matter(Buffer.from(file.value as Uint8Array), {
          delimiters: "---",
          language: "yaml",
          engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
            toml: (s) => toml.parse(s) as object,
          },
        })
        if (data.draft === true || data.draft === "true") {
          slugs.push(slugifyFilePath(fp as FilePath))
        }
      } catch {
        // ignore unreadable / malformed files
      }
    }
    return slugs
  }

  return {
    name: "DraftPage",
    getQuartzComponents() {
      return [Head, Body, pageBody, Footer]
    },
    async *emit(ctx, _content, resources) {
      const cfg = ctx.cfg.configuration
      const draftSlugs = await findDraftSlugs(ctx.argv.directory, ctx.allFiles)

      for (const slug of draftSlugs) {
        const [tree, vfile] = defaultProcessedContent({
          slug,
          text: TITLE,
          description: TITLE,
          frontmatter: { title: TITLE, tags: [] },
        })
        const externalResources = pageResources(pathToRoot(slug), resources)
        const componentData: QuartzComponentProps = {
          ctx,
          fileData: vfile.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles: [],
        }

        yield write({
          ctx,
          content: renderPage(cfg, slug, componentData, opts, externalResources),
          slug,
          ext: ".html",
        })
      }
    },
  }
}
