from notion.block import Block, CollectionViewBlock
from notion.space import Space
from notion.collection import Collection
from notion.client import NotionClient

import re
import urllib.parse
import requests
import mimetypes
import html
from datetime import datetime
from pytz import timezone

from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter


# this outputs metadata + incomplete chunks of plaintext.
# do not use alone: this is a base to build other renderers on.
# this contains helper functions alongside a complete
# implementation of the various loops and function calls required
# to parse a notion-py block.
# (see in-class comments for which functions should be redefined per-renderer.
class Renderer(object):
    _slugs = []
    _containerIDs = []
    root = ''
    headings = {}
    output = []

    type_levels = {
        'numbered_list': 0,
        'bulleted_list': 0,
        'column': 0,
        'column_list': 0,
        'toggle': 1
    }

    def __init__(self, client, options={}):
        # init options: {
        #   'filter_prop': '',
        #       -> set this to the name of a checkbox property - only pages
        #       with this property checked will be renderered
        #   'render_linked_pages': False
        #       -> set this to True if you wish to also render any linked pages
        #       (e.g. subpages or parent pages)
        # }
        self.client = client
        if not isinstance(self.client, NotionClient):
            self.client = NotionClient(token_v2=client)
        self.options = options
        assert isinstance(self.options, dict)

    def cleanup(self):
        self._slugs = []
        self._containerIDs = []
        self.root = ''
        self.headings = {}
        self.output = []
        return self

    # HELPER FUNCTIONS

    def slugify(self, title):
        title = ''.join(re.findall(
            # should match all emojis + alphanumerical
            r'([\-|_|\d|\w|\U00002600-\U000027BF\U0001F300-\U0001F64F\U0001F680-\U0001F6FF])',
            re.sub(r'\s', '-', title.lower())))
        slug = title
        occurrences = 0
        while slug in self._slugs:
            occurrences += 1
            slug = f'{title}-{occurrences}'
        self._slugs.append(slug)
        return slug

    # ** duplicate with modifications (e.g. only replacing href="{link}")
    # in order to prevent unwanted link replacement
    def replace_links(self, pages):
        for ID in self._containerIDs:
            ID = ID.replace('-', '')
            pages = map(lambda page: {**page,
                                      'content': re.sub(r'https:\/\/w*\.*notion\.so\/[^"\']*' + ID,
                                                        f'"./{next((page for page in pages if page["id"] == ID), ID)}',
                                                        page['content'])
                                      }, pages)
        return list(pages)

    def generate_metadata(self, block):
        if block.type != 'page':
            return {}
        title = self.inline(block)
        collectiondata = {
            'description':  block.get_property('description') if block.collection.get_schema_property('description') else '',
            'tags': [title] + (sorted(block.get_property('tags'))
                               if block.collection.get_schema_property('tags') else '')
        } if getattr(block, 'collection', '') else {'description': '', 'tags': [title]}
        return {
            'title': title,
            'id': block.id.replace('-', ''),
            'slug': self.slugify(title),
            'time':  datetime.fromtimestamp(
                block.get().get('last_edited_time', datetime.utcnow().timestamp()) / 1000,
                tz=timezone('UTC')).strftime(r'%b %d, %Y %I:%M %p'),
            **collectiondata
        }

    def sign_url(self, url):
        assert isinstance(url, str)
        return f'https://www.notion.so/signed/{urllib.parse.quote(url.split("?")[0], safe="")}' \
            if 'amazonaws.com/secure.notion-static' in url else url

    def get_handler(self, blocktype='default'):
        handler = getattr(self, 'handle_' + blocktype, None)
        if not callable(handler):
            handler = getattr(self, 'handle_default', None)
            if not handler:
                raise Exception(
                    f'notion renderer: no handler for block type <{blocktype}>')
        return handler

    def get_parser(self, modifier='default'):
        parser = getattr(self, 'parse_' + modifier, None)
        if not callable(parser):
            parser = getattr(self, 'parse_default', None)
            if not parser:
                raise Exception(
                    f'notion renderer: no parser for inline type <{modifier}>')
        return parser

    # LOOP THROUGH BLOCKS + CALL RELEVANT HANDLERS

    def render_page(self, page):
        filter_prop = self.options.get('filter_prop', '')
        filter_prop = not filter_prop or (page.type == 'page' and isinstance(page.parent, Collection)
                                          and page.collection.get_schema_property(filter_prop)
                                          and page.get_property(filter_prop))
        if page.type == 'page' and \
                self.options.get('render_linked_pages', False) or filter_prop:
            return self.render_container(page)
        return False

    def render_block(self, block, level=0, prev=None, post=None):
        # ignored for the same reason checkboxes are disabled:
        # this is a viewable render, not an editable page
        if block.type == 'factory':
            return ''
        text, closing = self.get_handler(
            'page_title' if block.type == 'page' and block == self.root else block.type)(
            block, level, prev=prev, post=post), ''
        if isinstance(text, tuple):
            text, closing = text
        if block.type == 'page' and block != self.root:
            return text + closing
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

    def posthandle(self, text):
        return self.posthandle_table_of_contents(text)

    # ** duplicate with modifications (e.g. returning a tuple with a html class name)
    # in order to wrap/format text after it has been modified
    def inline(self, block):
        text = ''
        for part in block.collection.get().get('name', []) if isinstance(block, CollectionViewBlock) else \
                block.get().get('properties', {}).get('title', []):
            content = part[0]
            if len(part) > 1:
                for modifier in part[1]:
                    if modifier[0] == 'u':
                        content = self.get_parser('user')(content, modifier[1])
                    if modifier[0] == 'p':
                        content = self.get_parser('page')(content, modifier[1])
                    if modifier[0] == 'a':
                        content = self.get_parser('link')(content, modifier[1])
                    if modifier[0] == 'd':
                        content = self.get_parser('date')(content, modifier[1])
                    if modifier[0] == 'i':
                        content = self.get_parser('italic')(content)
                    if modifier[0] == 'b':
                        content = self.get_parser('bold')(content)
                    if modifier[0] == 's':
                        content = self.get_parser('strikethrough')(content)
                    if modifier[0] == 'c':
                        content = self.get_parser('code')(content)
                    if modifier[0] == 'h':
                        content = self.get_parser(
                            'colour')(content, modifier[1])
            text += content
        return text or getattr(block, 'title', '')

    # OUTPUT

    def render(self, *args):
        for block in args:
            if not isinstance(block, Block):
                block = self.client.get_block(block)
            assert isinstance(block, Block)
            self.render_container(block)
        return self.replace_links(self.output)

    # ** duplicate with modifications
    # (e.g. wrapping content in a html article element)
    def render_container(self, block):
        assert isinstance(block, Block)
        output = next((x for x in self.output if x.get('id', '')
                       == block.id.replace('-', '')), None)
        if not self.root or (not output and block.id not in self._containerIDs):
            prev = self.root
            self.root = block
            self._containerIDs.append(block.id)
            self.headings[block.id] = []
            output = {
                **self.generate_metadata(block),
                'content': self.posthandle(self.render_block(block))
            }
            self.output.append(output)
            self.root = prev
        return True

    # BLOCK HANDLERS
    # ** duplicate with modifications
    # half of these don't really output anything yet.
    # define the functions, parse the block types.

    def handle_default(self, block, level=0, prev=None, post=None):
        return self.inline(block)

    handle_text = handle_default
    handle_page_title = handle_default

    def handle_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([1, block])
        return self.handle_default(block)

    def handle_sub_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([2, block])
        return self.handle_default(block)

    def handle_sub_sub_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([3, block])
        return self.handle_default(block)

    def handle_table_of_contents(self, block, level=0, prev=None, post=None):
        return '☃☃☃ notion-table-of-contents-placeholder ☃☃☃'

    def posthandle_table_of_contents(self, text):
        return text.replace('☃☃☃ notion-table-of-contents-placeholder ☃☃☃',
                            '\n'.join(list(map(lambda heading: f'{(heading[0] - 1) * "  "}{self.inline(heading[1])} {heading[1].id}',
                                               self.headings[self.root.id]))))

    handle_equation = handle_default
    handle_code = handle_default
    handle_quote = handle_default
    handle_divider = handle_default
    handle_column_list = handle_default
    handle_column = handle_default
    handle_toggle = handle_default
    handle_to_do = handle_default
    handle_bulleted_lost = handle_default
    handle_numbered_list = handle_default
    handle_bookmark = handle_default
    handle_callout = handle_default
    handle_file = handle_default
    handle_pdf = handle_file
    handle_image = handle_file
    handle_video = handle_file
    handle_audio = handle_file

    def handle_breadcrumb(self, block, level=0, prev=None, post=None):
        while not isinstance(block, Space):
            if block.type == 'page':
                self.render_page(block)
            block = block.parent
        return self.handle_default(block)

    def handle_page(self, block, level=0, prev=None, post=None):
        self.render_page(block)
        return self.handle_default(block)

    handle_collection_view = handle_default
    handle_collection_view_page = handle_collection_view
    handle_embed = handle_default
    handle_framer = handle_embed
    handle_figma = handle_embed
    handle_loom = handle_embed
    handle_typeform = handle_embed
    handle_codepen = handle_embed
    handle_maps = handle_embed
    handle_invision = handle_embed
    handle_drive = handle_embed
    handle_gist = handle_embed
    handle_tweet = handle_embed

    # INLINE PARSERS
    # ** duplicate with modifications
    # the date/user/page parsers are defined to demonstrate
    # extraction of relevant content.

    def parse_default(self, text, modifier=''):
        return text

    def parse_user(self, text, modifier):
        return f'@{self.client.get_user(modifier).full_name}'

    def parse_date(self, text, modifier):
        UTC = timezone('UTC')
        LOCAL = timezone(modifier.get(
            'time_zone', 'UTC'))
        start_time = modifier.get('start_time', '')
        start_datetime = datetime.strftime(LOCAL.localize(
            datetime.strptime(
                f'{modifier.get("start_date", "")} {start_time}',
                r'%Y-%m-%d %H:%M' if start_time else r'%Y-%m-%d ')
        ).astimezone(UTC), r'%b %d, %Y %I:%M %p' if start_time else r'%b %d, %Y')
        text = f'{start_datetime} UTC'
        end_date = modifier.get(
            'end_date', '')
        if end_date:
            end_time = modifier.get(
                'end_time', '')
            end_datetime = datetime.strftime(LOCAL.localize(
                datetime.strptime(
                    f'{end_date} {end_time}',
                    r'%Y-%m-%d %H:%M' if end_time else r'%Y-%m-%d ')
            ).astimezone(UTC), r'%b %d, %Y %I:%M %p' if end_time else r'%b %d, %Y')
            text += f' - {end_datetime} UTC'
        return text

    def parse_page(self, text, modifier):
        page = self.client.get_block(modifier.replace('-', ''))
        self.render_page(page)
        return self.inline(page)

    # modifier will be a url
    parse_link = parse_default

    # no modifier will be passed, define as e.g.
    # def parse_italic(self, text):
    parse_italic = parse_default
    parse_bold = parse_default
    parse_strikethrough = parse_default
    parse_code = parse_default

    # modifier will either be colour or colour_background
    # colours include: gray, brown, orange, yellow, teal, blue, purple, pink, red
    parse_colour = parse_default


# an implementation for filtering and renderering all
# pages within a database/collection/notebook
# the 'filter_prop' option is particularly useful here
class NotebookRenderer(Renderer):

    # to use this functionality with a specific renderer...
    #   class TypeNotebookRenderer(TypeRenderer):
    #       render = NotebookRenderer.render
    #       collect_pages = NotebookRenderer.collect_pages

    def render(self, *args):
        for block in args:
            if not isinstance(block, Block):
                block = self.client.get_block(block)
            assert isinstance(block, CollectionViewBlock)
            pages = self.collect_pages(block)
            for page in pages:
                self.render_container(page)
        return self.replace_links(self.output)

    def collect_pages(self, collectionblock):
        notebook = []
        for page in collectionblock.collection.get_rows():
            filter_prop = self.options.get('filter_prop', '')
            if page.type == 'page' and (not filter_prop or (page.collection.get_schema_property(filter_prop)
                                                            and page.get_property(filter_prop))):
                notebook.append(page)
        return notebook


# built to output HTML, handles/mimics nearly all types
# (other than unsupported types defined in base renderer)
class HTMLRenderer(Renderer):

    # HELPER FUNCTIONS

    def replace_links(self, pages):
        for ID in self._containerIDs:
            ID = ID.replace('-', '')
            pages = list(map(lambda page: {**page,
                                           'content': re.sub(r'href="https:\/\/w*\.*notion\.so\/[^"\']*' + ID,
                                                             f'href="./{next((page["slug"] for page in pages if page["id"] == ID), ID)}',
                                                             page['content'])
                                           }, pages))
        return pages

    def generate_widget(self, icon, text, widgettype, link='', level=0, inline=False, external=False):
        if 'http' in icon:
            icon = f'<img loading="lazy" src="{self.sign_url(icon)}"/>'
        return f'''
            <{'a' if link else 'span'} class="notion-widget{" notion-widget_inline" if inline else ""}"
                {f'style="--level: {level};"' if level else ''}
                {f'href="{link}"' if link else ''}
                {'target="_blank" rel="noopener noreferrer"' if external and link else ""}
            >
                <span class="notion-widget_icon">{icon}</span>
                <span class="notion-widget_text">{text or link}
                    <span class="notion-widget_type">{f"[{widgettype}]" if widgettype else ""}</span>
                </span>
            </{'a' if link else 'span'}>
        '''

    # LOOP THROUGH BLOCKS + CALL RELEVANT HANDLERS

    def inline(self, block):
        # this version of the inline parser handles html attributes
        # e.g. if parse_user returns
        # '@dragonwocky thedragonring.bod@gmail.com', { 'class': 'notion-user' }
        # the relevant text with be wrapped in a <span class="notion-user"></span>
        text = ''
        for part in block.collection.get().get('name', []) if isinstance(block, CollectionViewBlock) else \
                block.get().get('properties', {}).get('title', []):
            content = html.escape(part[0])
            attrs = {}
            if len(part) > 1:
                for modifier in part[1]:
                    if modifier[0] == 'u':
                        content = self.get_parser('user')(content, modifier[1])
                    if modifier[0] == 'p':
                        content = self.get_parser('page')(content, modifier[1])
                    if modifier[0] == 'a':
                        content = self.get_parser('link')(content, modifier[1])
                    if modifier[0] == 'd':
                        content = self.get_parser('date')(content, modifier[1])
                    if modifier[0] == 'i':
                        content = self.get_parser('italic')(content)
                    if modifier[0] == 'b':
                        content = self.get_parser('bold')(content)
                    if modifier[0] == 's':
                        content = self.get_parser('strikethrough')(content)
                    if modifier[0] == 'c':
                        content = self.get_parser('code')(content)
                    if modifier[0] == 'h':
                        content = self.get_parser(
                            'colour')(content, modifier[1])
                    if isinstance(content, tuple):
                        for key, val in content[1].items():
                            attrs[key] = f'{attrs.get(key, "")} {val}'
                        content = content[0]
            parsed_attrs = ''.join(
                (f' {key}' if key == True else f' {key}="{val}"') if val else '' for key, val in attrs.items())
            text += f'<span{parsed_attrs}>{content}</span>' if parsed_attrs else content
        return text or getattr(block, 'title', '')

    # OUTPUT

    def render_container(self, block):
        assert isinstance(block, Block)
        output = next((x for x in self.output if x.get('id', '')
                       == block.id.replace('-', '')), None)
        if not self.root or (not output and block.id not in self._containerIDs):
            prev = self.root
            self.root = block
            self._containerIDs.append(block.id)
            self.headings[block.id] = []
            # replace is due to some weird behaviour i've encountered where after
            # copying from or pasting into notion my spaces... aren't normal spaces?
            output = {
                **self.generate_metadata(block),
                'content': f'''
                    <article class="notion-block">
                        {self.posthandle(self.render_block(
                            block).replace(' ', ' '))}
                    </article>
                '''
            }
            self.output.append(output)
            self.root = prev
        return True

    # BLOCK HANDLERS

    def handle_default(self, block, level=0, prev=None, post=None):
        return f'<p style="--level: {level};">{self.inline(block)}</p>'

    handle_text = handle_default

    def handle_page_title(self, block, level=0, prev=None, post=None):
        return f'<h1 style="--level: {level};" id="{block.id.replace("-", "")}">{self.inline(block)}</h1>'

    def handle_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([1, block])
        return f'<h2 style="--level: {level};" id="{block.id.replace("-", "")}">{self.inline(block)}</h2>'

    def handle_sub_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([2, block])
        return f'<h3 style="--level: {level};" id="{block.id.replace("-", "")}">{self.inline(block)}</h3>'

    def handle_sub_sub_header(self, block, level=0, prev=None, post=None):
        self.headings[self.root.id].append([3, block])
        return f'<h4 style="--level: {level};" id="{block.id.replace("-", "")}">{self.inline(block)}</h4>'

    def handle_table_of_contents(self, block, level=0, prev=None, post=None):
        return f'<div class="notion-toc">{level}☃☃☃☃☃☃☃☃☃</div>'

    def posthandle_table_of_contents(self, text):
        headings = ''.join(list(map(
            lambda heading: f'''
                <a href="#{heading[1].id.replace('-','')}" class="notion-toc_heading" style="--level: {heading[0] - 1}">
                    <span>{self.inline(heading[1])}</span>
                </a>
            ''',
            self.headings[self.root.id])))
        for match in re.findall(
                r'<div class="notion-toc">(\d+)☃☃☃☃☃☃☃☃☃</div>', text):
            text = text.replace(f'<div class="notion-toc">{match}☃☃☃☃☃☃☃☃☃</div>',
                                f'<div class="notion-toc" style="--level: {match}">{headings}</div>')
        return text

    def handle_equation(self, block, level=0, prev=None, post=None):
        return f'<p style="--level: {level};" class="notion-equation">{block.latex}</p>'
        # return f'''
        #     <figure style="--level: {level};">
        #         <img loading="lazy"
        #             src="https://chart.googleapis.com/chart?cht=tx&&chs=350&chf=bg,s,00000000&chco=505050&chl={
        #                 urllib.parse.quote(block.latex, safe="")}"/>
        #     </figure>
        # '''

    def handle_code(self, block, level=0, prev=None, post=None):
        language_mapper = {
            'Plain Text': 'text'
        }
        innerhtml = highlight(getattr(block, 'title'), get_lexer_by_name(
            language_mapper.get(block.language, block.language)),
            HtmlFormatter(linenos='inline', cssclass="notion-code", linespans=block.id))
        return innerhtml \
            .replace('>', f'style="--level: {level}; --code-lang: \'{block.language}\';">', 1) \
            .replace('<pre>', '<pre><span class="code-padding"><span class="lineno">0</span>\n</span>') \
            .replace('</pre>', '<span class="code-padding"><span class="lineno">0</span>\n</span></pre>')

    def handle_quote(self, block, level=0, prev=None, post=None):
        return f'<blockquote style="--level: {level};">{self.inline(block)}</blockquote>'

    def handle_divider(self, block, level=0, prev=None, post=None):
        return '<hr/>'

    def handle_column_list(self, block, level=0, prev=None, post=None):
        return f'<div class="notion-columns-container" style="--level: {level};"">', '</div>'

    def handle_column(self, block, level=0, prev=None, post=None):
        return f'<div class="notion-column" style="width: calc(100% * {block.get("format.column_ratio")});">', '</div>'

    def handle_toggle(self, block, level=0, prev=None, post=None):
        return f'<details style="--level: {level};"><summary>{self.inline(block)}</summary>', '</details>'

    def handle_to_do(self, block, level=0, prev=None, post=None):
        return f'''
            <p class="notion-checkbox" style="--level: {level};">
                <input type="checkbox" id="chk_{block.id}" name="chk_{block.id}" disabled{" checked" if block.checked else ""}>
                <label for="chk_{block.id}">{self.inline(block)}</label>
            </p>
        '''

    def handle_bulleted_list(self, block, level=0, prev=None, post=None):
        text = ''
        if prev is None or prev.type != 'bulleted_list':
            text += f'<ul style="--level: {level};">'
        text += f'<li>{self.inline(block)}</li>'
        if post is None or post.type != 'bulleted_list':
            return text, '</ul>'
        return text

    def handle_numbered_list(self, block, level=0, prev=None, post=None):
        text = ''
        if prev is None or prev.type != 'numbered_list':
            text += f'<ol style="--level: {level};">'
        text += f'<li>{self.inline(block)}</li>'
        if post is None or post.type != 'numbered_list':
            return text, '</ol>'
        return text

    def handle_bookmark(self, block, level=0, prev=None, post=None):
        link = self.sign_url(block.link)
        return f'''
            <a class="notion-bookmark" href="{link}" style="--level: {level};"
                target="_blank" rel="noopener noreferrer"
            >
                <div class="notion-bookmark_content">
                    <h4>{block.title}</h4>
                    {f'<p>{block.description}</p>' if block.description else ''}
                    <div class="notion-bookmark_url">
                        {f'<img loading="lazy" src="{self.sign_url(block.bookmark_icon)}"/>' if block.bookmark_icon
                        else ''} <span>{link}</span>
                    </div>
                </div>
                {f"""
                <div class="notion-bookmark_cover">
                    <img loading="lazy" src="{self.sign_url(block.bookmark_cover)}"/>
                </div>
                """ if block.bookmark_cover else ''}
            </a>
        '''

    def handle_callout(self, block, level=0, prev=None, post=None):
        icon = block.icon or '💡'
        if 'http' in icon:
            icon = f'<img loading="lazy" src="{self.sign_url(icon)}?width=40&cache=v2"/>'
        return f'''
            <div class="notion-widget notion-callout" style="--level: {level};">
                <span class="notion-widget_icon">{icon}</span>
                <span class="notion-widget_text">{self.inline(block)}</span>
            </div>
        '''

    def handle_file(self, block, level=0, prev=None, post=None):
        source = self.sign_url(block.source)
        filename = urllib.parse.urlparse(
            urllib.parse.unquote(source)).path.split('/')[-1]
        return self.generate_widget('📎', block.title if hasattr(block, "title") else filename,
                                    f'{block.size} file' if hasattr(block, 'size') else 'file', link=source, level=level, external=True)

    handle_pdf = handle_file

    def handle_image(self, block, level=0, prev=None, post=None):
        return f'''<img loading="lazy" alt="{block.caption}" src="{self.sign_url(block.source)
            }?cache=v2" style="--level: {level};"/>'''

    def handle_video(self, block, level=0, prev=None, post=None):
        source = self.sign_url(block.source)
        mime = mimetypes.guess_type(source)
        if mime[0]:
            return f'''
                <video src="{source}" type="{mime}" controls style="--level: {level};">
                    {self.generate_widget('📎', '', 'video', link=source, external=True)}
                </video>
            '''
        return self.handle_embed(block, level, prev, post)

    def handle_audio(self, block, level=0, prev=None, post=None):
        source = self.sign_url(block.source)
        return f'''
            <audio src="{source}" controls style="--level: {level};">
                {self.generate_widget('📎', '', 'audio', link=source, external=True)}
            </audio>
        '''

    def handle_breadcrumb(self, block, level=0, prev=None, post=None):
        text = []
        while not isinstance(block, Space):
            blocktype = getattr(block, 'type', '')
            icon = ''
            if blocktype == 'page':
                self.render_page(block)
                icon = getattr(block, icon, '')
            if blocktype == 'collection_view_page':
                icon = block.collection.get('icon', '')
            if blocktype in ['page', 'collection_view_page']:
                text.append(self.generate_widget(icon, self.inline(block), '' if len(
                                                 text) else 'breadcrumb',
                                                 link=f'https://notion.so/{block.id.replace("-", "")}' if len(
                                                 text) else '',
                                                 inline=True))
            block = block.parent
        text.reverse()
        return f'<p style="--level: {level};">{" / ".join(text)}</p>'

    def handle_page(self, block, level=0, prev=None, post=None):
        self.render_page(block)
        return self.generate_widget(block.icon or '📄', self.inline(block),
                                    'page', link=f'https://notion.so/{block.id.replace("-", "")}', level=level)

    def handle_collection_view(self, block, level=0, prev=None, post=None):
        return self.generate_widget(block.collection.get('icon', '🗄️'),
                                    self.inline(block), 'database on notion',
                                    link=f'https://notion.so/{block.id.replace("-", "")}', level=level, external=True)

    handle_collection_view_page = handle_collection_view

    def handle_embed(self, block, level=0, prev=None, post=None):
        domain = urllib.parse.urlparse(
            block.display_source or block.source).hostname
        return f'''
            <div class="notion-embed{f" notion-embed_{domain.replace('.', '-')}" if domain else ""}" style="--level: {level};">
                <iframe src="{block.display_source or block.source}" frameborder="0"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-presentation"
                    allowfullscreen>
                    {self.generate_widget("🔖", "", "embed", link=block.display_source or block.source)}
                </iframe>
            </div>
        '''

    handle_framer = handle_embed
    handle_figma = handle_embed
    handle_loom = handle_embed
    handle_typeform = handle_embed
    handle_codepen = handle_embed
    handle_maps = handle_embed
    handle_invision = handle_embed

    def handle_drive(self, block, level=0, prev=None, post=None):
        props = block.get().get('format', {}).get('drive_properties', {})
        link = props.get('url', '')
        last_edited = datetime.fromtimestamp(
            props.get('modified_time', datetime.utcnow().timestamp())/1000, tz=timezone('UTC')).strftime(r'%b %d, %Y')
        return f'''
            <a class="notion-bookmark notion-embed_drive-google-com" href="{link}" style="--level: {level};"
                target="_blank" rel="noopener noreferrer"
            >
                <div class="notion-bookmark_content">
                    <h4>{props.get('title','')}</h4>
                    <p>last edited by {props.get('user_name','')} on <span class="notion-datetime">{last_edited} UTC</span></p>
                    <div class="notion-bookmark_url">
                        <img loading="lazy" src="{props.get('icon','')}"/> <span>{link}</span>
                    </div>
                </div>
                <div class="notion-bookmark_cover">
                    <img loading="lazy" src="{self.sign_url(props.get('thumbnail',''))}"/>
                </div>
            </a>
        '''

    def handle_gist(self, block, level=0, prev=None, post=None):
        return f'''
          <div class="notion-generated-embed notion-embed_gist-github-com" style="--level: {level};">
            <script src="{block.source}.js"></script>
            <noscript>{self.generate_widget("👩🏽‍💻", "", "gist", link=block.source)}</noscript>
          </div>
        '''

    def handle_tweet(self, block, level=0, prev=None, post=None):
        return f'''
          <div class="notion-generated-embed notion-embed_twitter-com" style="--level: {level};">
            {requests.get(f"https://publish.twitter.com/oembed?url={block.source}").json()["html"]}
          </div>
        '''

    # INLINE PARSERS

    def parse_user(self, text, modifier):
        return self.generate_widget('👤', self.client.get_user(modifier).full_name, 'user',
                                    inline=True), {'class': 'notion-mention'}

    def parse_date(self, text, modifier):
        UTC = timezone('UTC')
        LOCAL = timezone(modifier.get(
            'time_zone', 'UTC'))
        start_time = modifier.get('start_time', '')
        start_datetime = datetime.strftime(LOCAL.localize(
            datetime.strptime(
                f'{modifier.get("start_date", "")} {start_time}',
                r'%Y-%m-%d %H:%M' if start_time else r'%Y-%m-%d ')
        ).astimezone(UTC), r'%b %d, %Y %I:%M %p' if start_time else r'%b %d, %Y')
        text = f'<span class="notion-datetime">{start_datetime} UTC</span>'
        end_date = modifier.get(
            'end_date', '')
        if end_date:
            end_time = modifier.get(
                'end_time', '')
            end_datetime = datetime.strftime(LOCAL.localize(
                datetime.strptime(
                    f'{end_date} {end_time}',
                    r'%Y-%m-%d %H:%M' if end_time else r'%Y-%m-%d ')
            ).astimezone(UTC), r'%b %d, %Y %I:%M %p' if end_time else r'%b %d, %Y')
            text += f' → <span class="notion-datetime">{end_datetime} UTC</span>'
        return self.generate_widget('📅', text, 'date', inline=True), {'class': 'notion-mention'}

    def parse_page(self, text, modifier):
        page = self.client.get_block(modifier.replace('-', ''))
        self.render_page(page)
        return self.generate_widget(page.icon or '📄', self.inline(page), 'date',
                                    link=f'https://notion.so/{page.id.replace("-", "")}', inline=True)

    # modifier will be a url
    def parse_link(self, text, modifier):
        return f'<a href="{self.sign_url(modifier)}">{text}</a>'

    # no modifier will be passed

    def parse_italic(self, text):
        return f'<i>{text}</i>'

    def parse_bold(self, text):
        return f'<b>{text}</b>'

    def parse_strikethrough(self, text):
        return f'<del>{text}</del>'

    def parse_code(self, text):
        return f'<code>{text}</code>'

    # modifier will either be colour or colour_background
    # colours include: gray, brown, orange, yellow, teal, blue, purple, pink, red
    def parse_colour(self, text, modifier):
        return text, {
            'style': f'background: var(--notion-bg_{modifier.split("_")[0]});' if 'background' in modifier
            else f'color: var(--notion-text_{modifier});'
        }


class HTMLNotebookRenderer(HTMLRenderer):
    render = NotebookRenderer.render
    collect_pages = NotebookRenderer.collect_pages
