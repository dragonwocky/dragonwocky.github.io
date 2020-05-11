from notion.block import Block
from notion.client import NotionClient
import requests
import re
import urllib.parse
import mimetypes
from datetime import datetime
from commonmark import commonmark
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
from dotenv import load_dotenv
import os
load_dotenv()

_slugs = []


def slugify(title):
    title = ''.join(re.findall(
        # should match all emojis + alphanumerical
        r'([\-|_|\d|\w|\U00002600-\U000027BF\U0001F300-\U0001F64F\U0001F680-\U0001F6FF])',
        re.sub(r'\s', '-', title.lower())))
    slug = title
    occurrences = 0
    while slug in _slugs:
        occurrences += 1
        slug = f'{title}-{occurrences}'
    _slugs.append(slug)
    return slug


class Renderer(object):

    def __init__(self, root, token_v2=os.getenv('NOTION_TOKEN')):
        self.root = root
        if not isinstance(self.root, Block):
            if not isinstance(token_v2, NotionClient):
                client = NotionClient(token_v2=token_v2)
            self.root = client.get_block(self.root)
        self._slugs = []

    def get_handler(self, block):
        type_renderer = getattr(self, 'handle_' + block.type, None)
        if not callable(type_renderer):
            if hasattr(self, 'handle_default'):
                type_renderer = self.handle_default
            else:
                raise Exception(
                    f'notion renderer: no handler for block type <{block.type}>')
        return type_renderer

    type_levels = {
        'numbered_list': 0,
        'bulleted_list': 0,
        'column': 0,
        'column_list': 0,
        'toggle': 1
    }

    def render(self):
        return self.render_page(self.root)

    def render_page(self, block, level=0, prev=None, post=None):
        assert isinstance(block, Block)
        if block.type == 'factory':
            return ''
        type_renderer = self.handle_title if block.type == 'page' else self.get_handler(
            block)
        text, closing = type_renderer(block, level, prev=prev, post=post), ''
        if isinstance(text, tuple):
            text, closing = text
        # replace is cos of some weird bug i've been having with notion
        # copy/pasting code blocks from it etc. is always weird
        # because the spaces aren't spaces???

        return f'''
          <article class="notion-page">
            {text}{self.render_children(block, self.type_levels.get(block.type, level + 1))}{closing}
          </article>
        '''.replace(' ', ' ')

    def render_block(self, block, level=0, prev=None, post=None):
        assert isinstance(block, Block)
        if block.type == 'factory':
            return ''
        type_renderer = self.get_handler(block)
        text, closing = type_renderer(block, level, prev=prev, post=post), ''
        if block.type == 'page':
            return text
        if isinstance(text, tuple):
            text, closing = text
        return text + self.render_children(block, self.type_levels.get(block.type, level + 1)) + closing

    def render_children(self, block, level):
        text = ''
        for i in range(len(block.children)):
            prev = block.children[i - 1] if i != 0 else None
            post = block.children[i +
                                  1] if len(block.children) > i + 1 else None
            text += self.render_block(block.children[i],
                                      level, prev=prev, post=post)
        return text

    def signed_url(self, url=''):
        if url and 'amazonaws.com/secure.notion-static' in url:
            return f'https://www.notion.so/signed/{urllib.parse.quote(url.split("?")[0], safe="")}'
        return url

    def handle_default(self, block, level=0, prev=None, post=None):
        return getattr(block, 'title', '')

    handle_title = handle_default


class HTMLRenderer(Renderer):

    def parse_attrs(self, attrs):
        return ''.join(f' {key}' if key == True else f' {key}="{val}"' for key, val in attrs.items())

    def opening_tag(self, tag, attrs={}):
        attrs = ''.join(f' {key}="{val}"' for key, val in attrs.items())
        return f'<{tag}{attrs}>'

    def set_tag(self, string, tag):
        match = re.search(r'<\/([^>]+)>$', string)
        if match:
            prev_len = 1 + len(match.group(1))
            return f'<{tag}{string[prev_len:-prev_len-1]}{tag}>'
        return f'<{tag}>{string}</{tag}>'

    def set_attrs(self, string, attrs):
        attrs = self.parse_attrs(attrs)
        return string.replace('>', attrs + '>', 1)

    def md(self, string, attrs={}):
        return self.set_attrs(commonmark(string), attrs)

    def inline_md(self, string, tag, attrs={}):
        lines = [commonmark('.' + line).replace('>.', '>', 1)
                 for line in string.split('\n')]
        if len(lines) > 1:
            return self.set_attrs(f'''
              <{tag}>
                {''.join(lines)}
              </{tag}>
            ''', attrs)
        return self.set_attrs(self.set_tag(''.join(lines), tag), attrs)

    def handle_title(self, block, level=0, prev=None, post=None):
        return self.md(f'# {block.title}', attrs={'style': f'--level: {level}', 'id': block.id.replace('-', '')})

    def handle_default(self, block, level=0, prev=None, post=None):
        if hasattr(block, 'title'):
            if not block.title:
                return '<br/>'
            return self.md(block.title, attrs={'style': f'--level: {level}'})
        return ''

    handle_text = handle_default
    handle_breadcrumb = handle_default  # unsupported
    handle_table_of_contents = handle_default  # unsupported

    def handle_code(self, block, level=0, prev=None, post=None):
        innerhtml = highlight(getattr(block, 'title'), get_lexer_by_name(
            block.language), HtmlFormatter(linenos='inline', cssclass="notion-code", linespans=block.id))
        # make line numbers links?
        # =========================
        # for match in re.finditer(re.compile(r'<span class="lineno">(\s*\d*\s*)<\/span>'), innerhtml):
        #     innerhtml = innerhtml.replace(f'<span class="lineno">{match.group(1)}</span>',
        #        f'<span class="lineno"><a href="#{block.id}-{match.group(1).strip()}">{match.group(1)}</a></span>')
        return self.set_attrs(innerhtml, {'style': f'--level: {level}; --code-lang: \'{block.language}\''}) \
            .replace('<pre>', '''<pre><span class="code-padding"><span class="lineno">0</span>
</span>''').replace('</pre>', '''<span class="code-padding"><span class="lineno">0</span>
</span></pre>''')

    def handle_header(self, block, level=0, prev=None, post=None):
        return self.md(f'## {block.title}', attrs={'style': f'--level: {level}', 'id': block.id.replace('-', '')})

    def handle_sub_header(self, block, level=0, prev=None, post=None):
        return self.md(f'### {block.title}', attrs={'style': f'--level: {level}', 'id': block.id.replace('-', '')})

    def handle_sub_sub_header(self, block, level=0, prev=None, post=None):
        return self.md(f'#### {block.title}', attrs={'style': f'--level: {level}', 'id': block.id.replace('-', '')})

    def handle_quote(self, block, level=0, prev=None, post=None):
        return self.inline_md(block.title, 'blockquote', attrs={'style': f'--level: {level}'})

    def handle_divider(self, block, level=0, prev=None, post=None):
        return '<hr/>'

    def handle_column_list(self, block, level=0, prev=None, post=None):
        return f'<div class="notion-columns-container" style="--level: {level}"">', '</div>'

    def handle_column(self, block, level=0, prev=None, post=None):
        width = block.get('format.column_ratio')
        return f'<div class="notion-column" style="width: calc(100% * {width});">', '</div>'

    def handle_to_do(self, block, level=0, prev=None, post=None):
        return f'''
          <p class="notion-checkbox" style="--level: {level}">
            <input type="checkbox" id="chk_{block.id}" name="chk_{block.id}" disabled{" checked" if block.checked else ""}>
            <label for="chk_{block.id}">{block.title}</label>
          </p>
        '''

    def handle_toggle(self, block, level=0, prev=None, post=None):
        return f'<details style="--level: {level}">{self.inline_md(block.title, "summary")}', '</details>'

    def handle_bulleted_list(self, block, level=0, prev=None, post=None):
        text = ''
        if prev is None or prev.type != 'bulleted_list':
            text += f'<ul style="--level: {level}">'
        text += self.inline_md(block.title, 'li')
        if post is None or post.type != 'bulleted_list':
            return text, '</ul>'
        return text

    def handle_numbered_list(self, block, level=0, prev=None, post=None):
        text = ''
        if prev is None or prev.type != 'numbered_list':
            text += f'<ol style="--level: {level}">'
        text += self.inline_md(block.title, 'li')
        if post is None or post.type != 'numbered_list':
            return text, '</ol>'
        return text

    def handle_equation(self, block, level=0, prev=None, post=None):
        return f'''
          <figure style="--level: {level}">
            <img loading="lazy" src="https://chart.googleapis.com/chart?cht=tx&&chs=350&chl={block.latex}"/>
          </figure>
        '''

    def handle_factory(self, block, level=0, prev=None, post=None):
        return ''

    def handle_page(self, block, level=0, prev=None, post=None):
        return f'''
          <a class="notion-page-link"
            href="https://notion.so/{block.id.replace('-', '')}"
            style="--level: {level}"
          >
            <span class="notion-page-link_icon">📄</span>
            <span class="notion-page-link_text">{block.title or f"https://notion.so/{block.id.replace('-', '')}"}
              <span class="notion-page-link_what">[page on notion]</span>
            </span>
          </a>
        '''

    def handle_link_to_collection(self, block, level=0, prev=None, post=None):
        url = 'https://www.notion.so/' + block.id.replace('-', '')
        return f'''
          <a class="notion-database" target="_blank" rel="noopener noreferrer"
            href="{url}"
            style="--level: {level}"
          >
            <span class="notion-database_icon">🗄️</span>
            <span class="notion-database_text">{block.title or url}
              <span class="notion-database_what">[database on notion]</span>
            </span>
          </a>
        '''

    handle_collection_view = handle_link_to_collection
    handle_collection_view_page = handle_link_to_collection

    def handle_embed(self, block, level=0, prev=None, post=None):
        domain = urllib.parse.urlparse(
            block.display_source or block.source).hostname
        return f'''
          <div class="notion-embed{f" notion-embed_{domain.replace('.', '-')}" if domain else ""}" style="--level: {level}">
            <iframe{self.parse_attrs({
              "src": block.display_source or block.source,
              "frameborder": 0,
              "sandbox": "allow-scripts allow-popups allow-forms allow-same-origin allow-presentation",
              "allowfullscreen": True
            })}></iframe>
          </div>
        '''

    handle_framer = handle_embed
    handle_figma = handle_embed
    handle_loom = handle_embed
    handle_typeform = handle_embed
    handle_codepen = handle_embed
    handle_maps = handle_embed
    handle_invision = handle_embed

    handle_drive = handle_default  # unsupported

    def handle_gist(self, block, level=0, prev=None, post=None):
        return f'''
          <div class="notion-generated-embed notion-embed_gist-github-com" style="--level: {level}">
            <script src="{block.source}.js"></script>
          </div>
        '''

    def handle_tweet(self, block, level=0, prev=None, post=None):
        return f'''
          <div class="notion-generated-embed notion-embed_twitter-com" style="--level: {level}">
            {requests.get(f'https://publish.twitter.com/oembed?url={block.source}').json()['html']}
          </div>
        '''

    def handle_file(self, block, level=0, prev=None, post=None):
        source = self.signed_url(block.source)
        filename = urllib.parse.urlparse(
            urllib.parse.unquote(source)).path.split('/')[-1]
        return f'''
          <a class="notion-file" target="_blank" rel="noopener noreferrer"
            href="{source}"
            style="--level: {level}"
          >
            <svg class="notion-file_icon" viewBox="0 0 30 30">
              <path d="
                M22,8v12c0,3.866-3.134,7-7,7s-7-3.134-7-7V8c0-2.762,
                2.238-5,5-5s5,2.238,5,5v12c0,1.657-1.343,3-3,3s-3-1.343-3-3V8h-2v12c0,
                2.762,2.238,5,5,5s5-2.238,5-5V8c0-3.866-3.134-7-7-7S6,
                4.134,6,8v12c0,4.971,4.029,9,9,9s9-4.029,9-9V8H22z
              "></path>
            </svg>
            <span class="notion-file_title">{block.title if hasattr(block, 'title') else filename}
              <span class="notion-file_size">{block.size if hasattr(block, 'size') else ''}</span>
            </span>
          </a>
        '''

    handle_pdf = handle_file

    def handle_image(self, block, level=0, prev=None, post=None):
        return f'''<img loading="lazy" alt="{block.caption}" src="{self.signed_url(block.source)
            }?cache=v2" style="--level: {level}"/>'''

    def handle_video(self, block, level=0, prev=None, post=None):
        source = self.signed_url(block.source)
        mime = mimetypes.guess_type(source)
        if mime[0]:
            return f'''
              <video src="{source}" type="{mime}" controls style="--level: {level}">
                <i>warning: failed to load, your browser does not support embedded videos!</i>
              </video>
            '''
        return self.handle_embed(block, level, prev, post)

    def handle_audio(self, block, level=0, prev=None, post=None):
        return f'''
          <audio src="{self.signed_url(block.source)}" controls style="--level: {level}">
            <i>warning: failed to load, your browser does not support embedded audio!</i>
          </audio>
        '''

    def handle_bookmark(self, block, level=0, prev=None, post=None):
        link = self.signed_url(block.link)
        return f'''
          <a class="notion-bookmark" target="_blank" rel="noopener noreferrer" href="{link}" style="--level: {level}">
            <div class="notion-bookmark_content">
              <h4>{block.title}</h4>
              {f'<p>{block.description}</p>' if block.description else ''}
              <div class="notion-bookmark_url">
                {f'<img loading="lazy" src="{self.signed_url(block.bookmark_icon)}"/>' if block.bookmark_icon
                    else ''} <span>{link}</span>
              </div>
            </div>
            {f"""<img loading="lazy" class="notion-bookmark_cover" src="{self.signed_url(block.bookmark_cover)
                }"/>""" if block.bookmark_cover else ''}
          </a>
        '''

    def handle_callout(self, block, level=0, prev=None, post=None):
        if len(block.icon) == 1:
            icon = f'<span class="notion-callout_icon">{block.icon}</span>'
        else:
            icon = f'<img loading="lazy" class="notion-callout_icon" src="{self.signed_url(block.icon)}?width=40&cache=v2"/>'
        return f'''
          <div class="notion-callout" style="--level: {level}">
            {icon}
            {self.inline_md(block.title, 'span', attrs={
                            "class": "notion-callout_text"})}
          </div>
        '''


class NotebookRenderer(object):

    def __init__(self, root, token_v2=os.getenv('NOTION_TOKEN')):
        self.root = root
        if not isinstance(self.root, Block):
            if not isinstance(token_v2, NotionClient):
                client = NotionClient(token_v2=token_v2)
            self.root = client.get_block(self.root)
        self._slugs = []

    def collect_pages(self):
        notebook = {}
        for page in self.root.collection.get_rows():
            # property exists + property is true
            if page.collection.get_schema_property('published') and page.get_property('published'):
                notebook[page.id.replace('-', '')] = page

        # pages = {}

        # def get_child_pages(block, subpages=False):
        #     for child in block.children:
        #         if child.type == 'page':
        #             if child not in pages:
        #                 pages[page.id.replace('-', '')] = child
        #                 subpages = True
        #         if get_child_pages(child, subpages):
        #             subpages = True
        #     return subpages
        # for page in notebook:
        #     pages[page.id.replace('-', '')] = page
        #     while get_child_pages(page):
        #         pass

        return notebook

    def replace_links(self, pages):
        for ID in pages:
            for potentialLink in pages:
                pages[ID]['content'] = re.sub(
                    r'href="https:\/\/w*\.*notion\.so\/[^"\']*' +
                    potentialLink,
                    f'href="./{pages[ID]["slug"]}', pages[ID]['content'])

        return pages


class HTMLNotebookRenderer(NotebookRenderer):

    def render(self):
        pages = self.collect_pages()
        for ID, page in pages.items():
            pages[ID] = {
                'title': page.title,
                'slug': slugify(page.title),
                'time': page.get_property('last edited') if
                page.collection.get_schema_property('last_edited') else datetime.utcnow(),
                'description': page.get_property('description') if
                page.collection.get_schema_property('description') else '',
                'tags': [self.root.title] + (sorted(page.get_property('tags'))
                                             if page.collection.get_schema_property('tags') else ''),
                'content': HTMLRenderer(page).render()
            }
        return self.replace_links(pages)
