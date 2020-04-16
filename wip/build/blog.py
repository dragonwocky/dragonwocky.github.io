
from notion.client import NotionClient
from renderer import Renderer
from dotenv import load_dotenv
import os
load_dotenv()

# __title__ ✓
# __description__
# __tags__ ✓
# __slug__
# __last-modified__ ✓
# __content__

client = NotionClient(token_v2=os.getenv('NOTION_TOKEN'))
# notebook = client.get_block('80d09a8e462243da8a90a3e7282f0904')

# for page in notebook.collection.get_rows():
#   if page.collection.get_schema_property('published') and page.get_property('published'):
#     time = page.get_property('last edited')
#     tags = page.get_property('tags')
#     tags.sort()
#     tags.insert(0, notebook.title)
#     print(page.title, tags, time)
#     html = Renderer(page).render().replace(' ', ' ')
#     print(html)

html = Renderer(
    'f7aca1858470411a9748a9fa23b2fbbd').render_pages()

print(f'''
<!DOCTYPE html>

<!-- dragonwocky.me -->
<!-- (c) 2020 dragonwocky <thedragonring.bod@gmail.com>-->
<!-- (https://dragonwocky.me/) under the MIT license-->

<html lang="en" prefix="og: http://ogp.me/ns#">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="assets/notion.css" />
  </head>
  <body>
    <main>
      {html['f7aca1858470411a9748a9fa23b2fbbd']['content']}
    </main>
  </body>
</html>
        ''')
