## unsupported block types (due to notion-py limitations):

- breadcrumb
- table of contents
- template buttons / factories
- google drive embeds
- text/background colours

## potentially unexpected behaviours:

- latex is embedded as an image, rather than rendered as html.
  potential solution: https://github.com/KaTeX/KaTeX
- databases are linked to instead of embedded
- pdf embeds are treated as file embeds
- if exporting a non-public page, media (files + images etc.) will be inaccessible to viewers not signed in to your notion account
