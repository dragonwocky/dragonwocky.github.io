## unsupported block types (due to notion-py limitations):

- breadcrumb
- table of contents
- template buttons / factories
- mentions (people, pages) -> just show as `‣`?
- dates -> just show as `‣`?
- google drive embeds
- text colour: possible to colour an entire line, not possible to detect colour by character?

## potentially unexpected behaviours:

- sub-pages rendered inline
  potential solution: return list of pages mapped to IDs, with a slugger?
- latex is embedded as an image, rather than rendered properly.
  potential solution: https://github.com/KaTeX/KaTeX
- databases are linked to instead of embedded
- pdf embeds are treated as file embeds
- code blocks have line numbers
