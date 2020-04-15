import markdown2
import requests

from notion.block import *


class BaseRenderer(object):

	def __init__(self, start_block):
		self.start_block = start_block

	def render(self):
		return self.render_block(self.start_block)

	def calculate_child_indent(self, block):
		if block.type == "page":
			return 0
		else:
			return 1

	def render_block(self, block, level=0, preblock=None, postblock=None):
		assert isinstance(block, Block)
		type_renderer = getattr(self, "handle_" + block.type, None)
		if not callable(type_renderer):
			if hasattr(self, "handle_default"):
				type_renderer = self.handle_default
			else:
				raise Exception("No handler for block type '{}'.".format(block._type))
		pretext = type_renderer(block, level=level, preblock=preblock, postblock=postblock)
		if isinstance(pretext, tuple):
			pretext, posttext = pretext
		else:
			posttext = ""
		return pretext + self.render_children(block, level=level+self.calculate_child_indent(block)) + posttext

	def render_children(self, block, level):
		kids = block.children
		if not kids:
			return ""
		text = ""
		for i in range(len(kids)):
			text += self.render_block(kids[i], level=level)
		return text


bookmark_template = """
<div>
	 <div style="display: flex;">
			<a target="_blank" rel="noopener noreferrer" href="{link}" style="display: block; color: inherit; text-decoration: none; flex-grow: 1; min-width: 0px;">
				 <div role="button" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; width: 100%; display: flex; flex-wrap: wrap-reverse; align-items: stretch; text-align: left; overflow: hidden; border: 1px solid rgba(55, 53, 47, 0.16); border-radius: 3px; position: relative; color: inherit; fill: inherit;">
						<div style="flex: 4 1 180px; min-height: 60px; padding: 12px 14px 14px; overflow: hidden; text-align: left;">
							 <div style="font-size: 14px; line-height: 20px; color: rgb(55, 53, 47); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">{title}</div>
							 <div style="font-size: 12px; line-height: 16px; color: rgba(55, 53, 47, 0.6); height: 32px; overflow: hidden;">{description}</div>
							 <div style="display: flex; margin-top: 6px;">
									<img src="{icon}" style="width: 16px; height: 16px; min-width: 16px; margin-right: 6px;">
									<div style="font-size: 12px; line-height: 16px; color: rgb(55, 53, 47); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{link}/div>
							 </div>
						</div>
						<div style="flex: 1 1 180px; min-height: 80px; display: block; position: relative;">
							 <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px;">
									<div style="width: 100%; height: 100%;"><img src="{cover}" style="display: block; object-fit: cover; border-radius: 1px; width: 100%; height: 100%;"></div>
							 </div>
						</div>
				 </div>
			</a>
	 </div>
</div>
"""

callout_template = """
<div style="padding: 16px 16px 16px 12px; display: flex; width: 100%; border-radius: 3px; border-width: 1px; border-style: solid; border-color: transparent; background: rgba(235, 236, 237, 0.3);">
	 <div>
			<div role="button" style="user-select: none; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 24px; width: 24px; border-radius: 3px; flex-shrink: 0;">
				 <div style="display: flex; align-items: center; justify-content: center; height: 24px; width: 24px;">
						<div style="height: 16.8px; width: 16.8px; font-size: 16.8px; line-height: 1.1; margin-left: 0px; color: black;">{icon}</div>
				 </div>
			</div>
	 </div>
	 <div style="max-width: 100%; width: 100%; white-space: pre-wrap; word-break: break-word; caret-color: rgb(55, 53, 47); margin-left: 8px;">{title}</div>
</div>
"""

class BaseHTMLRenderer(BaseRenderer):

	def create_opening_tag(self, tagname, attributes={}):
		attrs = "".join(' {}="{}"'.format(key, val) for key, val in attributes.items())
		return "<{tagname}{attrs}>".format(tagname=tagname, attrs=attrs)

	def wrap_in_tag(self, block, tagname, fieldname="title", attributes={}):
		opentag = self.create_opening_tag(tagname, attributes)
		innerhtml = markdown2.markdown(getattr(block, fieldname) if hasattr(block, fieldname) else '')
		return "{opentag}{innerhtml}</{tagname}>".format(opentag=opentag, tagname=tagname, innerhtml=innerhtml)

	def left_margin_for_level(self, level):
		return {"display": "margin-left: {}px;".format(level * 20)}

	def handle_default(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "p", attributes=self.left_margin_for_level(level))

	def handle_divider(self, block, level=0, preblock=None, postblock=None):
		return "<hr/>"

	def handle_column_list(self, block, level=0, preblock=None, postblock=None):
		return '<div style="display: flex; padding-top: 12px; padding-bottom: 12px;">', '</div>'

	def handle_column(self, block, level=0, preblock=None, postblock=None):
		buffer = (len(block.parent.children) - 1) * 46
		width = block.get("format.column_ratio")
		return '<div style="flex-grow: 0; flex-shrink: 0; width: calc((100% - {}px) * {});">'.format(buffer, width), '</div>'

	def handle_to_do(self, block, level=0, preblock=None, postblock=None):
		return '<input type="checkbox" id="{id}" name="{id}"{checked}><label for="{id}">{title}</label><br/>'.format(
			id="chk_" + block.id,
			checked=" checked" if block.checked else "",
			title=block.title,
		)

	def handle_code(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "code", attributes=self.left_margin_for_level(level))

	def handle_factory(self, block, level=0, preblock=None, postblock=None):
		return ""

	def handle_header(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "h2", attributes=self.left_margin_for_level(level))

	def handle_sub_header(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "h3", attributes=self.left_margin_for_level(level))

	def handle_sub_sub_header(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "h4", attributes=self.left_margin_for_level(level))

	def handle_page(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "h1", attributes=self.left_margin_for_level(level))

	def handle_bulleted_list(self, block, level=0, preblock=None, postblock=None):
		text = ""
		if preblock is None or preblock.type != "bulleted_list":
			text = self.create_opening_tag("ul", attributes=self.left_margin_for_level(level))
		text += self.wrap_in_tag(block, "li")
		if postblock is None or postblock.type != "bulleted_list":
			text += "</ul>"
		return text

	def handle_numbered_list(self, block, level=0, preblock=None, postblock=None):
		text = ""
		if preblock is None or preblock.type != "numbered_list":
			text = self.create_opening_tag("ol", attributes=self.left_margin_for_level(level))
		text += self.wrap_in_tag(block, "li")
		if postblock is None or postblock.type != "numbered_list":
			text += "</ol>"
		return text

	def handle_toggle(self, block, level=0, preblock=None, postblock=None):
		innerhtml = markdown2.markdown(block.title)
		opentag = self.create_opening_tag("details", attributes=self.left_margin_for_level(level))
		return '{opentag}<summary>{innerhtml}</summary>'.format(opentag=opentag, innerhtml=innerhtml), '</details>'

	def handle_quote(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "blockquote", attributes=self.left_margin_for_level(level))

	def handle_text(self, block, level=0, preblock=None, postblock=None):
		return self.handle_default(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_equation(self, block, level=0, preblock=None, postblock=None):
		text = self.create_opening_tag("p", attributes=self.left_margin_for_level(level))
		return text + '<img src="https://chart.googleapis.com/chart?cht=tx&chl={}"/></p>'.format(block.latex)

	def handle_embed(self, block, level=0, preblock=None, postblock=None):
		iframetag = self.create_opening_tag("iframe", attributes={
			"src": block.display_source or block.source,
			"frameborder": 0,
			"sandbox": "allow-scripts allow-popups allow-forms allow-same-origin",
			"allowfullscreen": "",
			"style": "width: {width}px; height: {height}px; border-radius: 1px;".format(width=block.width, height=block.height),
		})
		return '<div style="text-align: center;">' + iframetag + "</iframe></div>"

	def handle_video(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_file(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_audio(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_pdf(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_image(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_bookmark(self, block, level=0, preblock=None, postblock=None):
		return bookmark_template.format(link=block.link, title=block.title, description=block.description, icon=block.bookmark_icon, cover=block.bookmark_cover)

	def handle_link_to_collection(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "p", attributes={"href": "https://www.notion.so/" + block.id.replace("-", "")})

	def handle_breadcrumb(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "p", attributes=self.left_margin_for_level(level))

	def handle_collection_view(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "p", attributes={"href": "https://www.notion.so/" + block.id.replace("-", "")})

	def handle_collection_view_page(self, block, level=0, preblock=None, postblock=None):
		return self.wrap_in_tag(block, "p", attributes={"href": "https://www.notion.so/" + block.id.replace("-", "")})

	def handle_framer(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_tweet(self, block, level=0, preblock=None, postblock=None):
		return requests.get("https://publish.twitter.com/oembed?url=" + block.source).json()["html"]

	def handle_gist(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_drive(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_figma(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_loom(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_typeform(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_codepen(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_maps(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_invision(self, block, level=0, preblock=None, postblock=None):
		return self.handle_embed(block=block, level=level, preblock=preblock, postblock=postblock)

	def handle_callout(self, block, level=0, preblock=None, postblock=None):
		return callout_template.format(icon=block.icon, title=markdown2.markdown(block.title))


class BaseHTMLRenderer(BaseRenderer):
	"""
	BaseRenderer for HTML output, uses [Dominate](https://github.com/Knio/dominate)
	internally for generating HTML output
	Each token rendering method should create a dominate tag and it automatically
	gets added to the parent context (because of the with statement). If you return
	a given tag, it will be used as the parent container for all rendered children
	"""

	def __init__(self, start_block, render_linked_pages=False, render_sub_pages=True,
              render_table_pages_after_table=False, with_styles=False):
		"""
		start_block The root block to render from
		follow_links Whether to follow "Links to pages"
		"""
		self.exclude_ids = []  # TODO: Add option for this
		self.start_block = start_block
		self.render_linked_pages = render_linked_pages
		self.render_sub_pages = render_sub_pages
		self.render_table_pages_after_table = render_table_pages_after_table
		self.with_styles = with_styles

		self._render_stack = []

	def render(self, **kwargs):
		"""
		Renders the HTML, kwargs takes kwargs for Dominate's render() function
		https://github.com/Knio/dominate#rendering

		These can be:
		`pretty` - Whether or not to be pretty
		`indent` - Indent character to use
		`xhtml` - Whether or not to use XHTML instead of HTML (<br /> instead of <br>)
		"""
		els = self.render_block(self.start_block)
		#Strings render as themselves, DOMinate tags user the passed kwargs
		return (HTMLRendererStyles if self.with_styles else "") + \
			"".join(el.render(**kwargs) if isinstance(el, dom_tag) else el for el in els)

	def get_parent_el(self):
		"""
		Gets the current parent off the render stack
		"""
		if not self._render_stack:
			return None
		return self._render_stack[-1]

	def get_previous_sibling_el(self):
		"""
		Gets the previous sibling element in the rendered HTML tree
		"""
		parentEl = self.get_parent_el()
		if not parentEl or not parentEl.children:
			return None  # No parent or no siblings
		return parentEl.children[-1]

	def render_block(self, block):
		if block.id in self.exclude_ids:
			return []  # don't render this block

		assert isinstance(block, Block)
		type_renderer = getattr(self, "render_" + block._type, None)
		if not callable(type_renderer):
			if hasattr(self, "render_default"):
				type_renderer = self.render_default
			else:
				raise Exception("No handler for block type '{}'.".format(block._type))
		class_function = getattr(self.__class__, type_renderer.__name__)

		#Render ourselves to a Dominate HTML element
		els = type_renderer(block)  # Returns a list of elements

		#If the block has no children, or the called function handles the child
		#rendering itself, don't render the children
		if not block.children or hasattr(class_function, 'handles_children_rendering'):
			return els

		#Otherwise, render and use the default append as a children-list
		return els + self.render_blocks_into(block.children, None)

	def render_blocks_into(self, blocks, containerEl=None):
		if containerEl is None:  # Default behavior is to add a container for the children
			containerEl = div(_class='children-list')
		self._render_stack.append(containerEl)
		for block in blocks:
			els = self.render_block(block)
			containerEl.add(els)
		self._render_stack.pop()
		return [containerEl]

	# == Conversions for rendering notion-py block types to elemenets ==
	# Each function should return a list containing dominate tags or a string of HTML
	# Marking a function with handles_children_rendering means it handles rendering
	# it's own `.children` and doesn't need to perform the default rendering

	def render_default(self, block):
		return [p(renderMD(block.title))]

	def render_divider(self, block):
		return [hr()]

	@handles_children_rendering
	def render_column_list(self, block):
		return self.render_blocks_into(block.children, div(style='display: flex;', _class='column-list'))

	@handles_children_rendering
	def render_column(self, block):
		return self.render_blocks_into(block.children, div(_class='column'))

	def render_to_do(self, block):
		id = f'chk_{block.id}'
		return [input(
                    label(_for=id), \
			type='checkbox', id=id, checked=block.checked, title=block.title)]

	def render_code(self, block):
		#TODO: Do we want this to support Markdown? I think there's a notion-py
		#change that might affect this... (the unstyled-title or whatever)
		return [pre(code(block.title))]

	def render_factory(self, block):
		return []

	def render_header(self, block):
		return [h2(renderMD(block.title))]

	def render_sub_header(self, block):
		return [h3(renderMD(block.title))]

	def render_sub_sub_header(self, block):
		return [h4(renderMD(block.title))]

	@handles_children_rendering
	def render_page(self, block):
		#TODO: I would use isinstance(xxx, CollectionRowBlock) here but it's buggy
		#https://github.com/jamalex/notion-py/issues/103
		if isinstance(block.parent, Collection):  # If it's a child of a collection (CollectionRowBlock)
			if not self.render_table_pages_after_table:
				return []
			return [h3(renderMD(block.title))] + self.render_blocks_into(block.children)
		elif block.parent.id != block.get()['parent_id']:
			#A link is a PageBlock where the parent id doesn't equal the _actual_ parent id
			#of the block
			if not self.render_linked_pages:
				#Render only the link, none of the content in the link
				return [a(h4(renderMD(block.title)), href=href_for_block(block))]
		else:  # A normal PageBlock
			if not self.render_sub_pages and self._render_stack:
					return [h4(renderMD(block.title))]  # Subpages when not rendering them render like in Notion, as a simple heading

		#Otherwise, render a page normally in it's entirety
		#TODO: This should probably not use a "children-list" but we need to refactor
		#the _render_stack to make that work...
		return [h1(renderMD(block.title))] + self.render_blocks_into(block.children)

	@handles_children_rendering
	def render_bulleted_list(self, block):
		previousSibling = self.get_previous_sibling_el()
		previousSiblingIsUl = previousSibling and isinstance(previousSibling, ul)
		containerEl = previousSibling if previousSiblingIsUl else ul()  # Make a new ul if there's no previous ul

		blockEl = li(renderMD(block.title))
		containerEl.add(blockEl)  # Render out ourself into the stack
		self.render_blocks_into(block.children, containerEl)
		return [] if containerEl.parent else [containerEl]  # Only return if it's not in the rendered output yet

	@handles_children_rendering
	def render_numbered_list(self, block):
		previousSibling = self.get_previous_sibling_el()
		previousSiblingIsOl = previousSibling and isinstance(previousSibling, ol)
		containerEl = previousSibling if previousSiblingIsOl else ol()  # Make a new ol if there's no previous ol

		blockEl = li(renderMD(block.title))
		containerEl.add(blockEl)  # Render out ourself into the stack
		self.render_blocks_into(block.children, containerEl)
		return [] if containerEl.parent else [containerEl]  # Only return if it's not in the rendered output yet

	def render_toggle(self, block):
		return [details(summary(renderMD(block.title)))]

	def render_quote(self, block):
		return [blockquote(renderMD(block.title))]

	render_text = render_default

	def render_equation(self, block):
		return [p(img(src=f'https://chart.googleapis.com/chart?cht=tx&chl={block.latex}'))]

	def render_embed(self, block):
		return [iframe(src=block.display_source or block.source, frameborder=0,
                 sandbox='allow-scripts allow-popups allow-forms allow-same-origin',
                 allowfullscreen='')]

	def render_video(self, block):
		#TODO, this won't work if there's no file extension, we might have
		#to query and get the MIME type...
		src = block.display_source or block.source
		srcType = src.split('.')[-1]
		return [video(source(src=src, type=f"video/{srcType}"), controls=True)]

	render_file = render_embed
	render_pdf = render_embed

	def render_audio(self, block):
		return [audio(src=block.display_source or block.source, controls=True)]

	def render_image(self, block):
		attrs = {}
		if block.caption:  # Add the alt attribute if there's a caption
			attrs['alt'] = block.caption
		return [img(src=block.display_source or block.source, **attrs)]

	def render_bookmark(self, block):
		#return bookmark_template.format(link=, title=block.title, description=block.description, icon=block.bookmark_icon, cover=block.bookmark_cover)
		#TODO: It's just a social share card for the website we're bookmarking
		return [a(href="block.link")]

	def render_link_to_collection(self, block):
		return [a(renderMD(block.title), href=href_for_block(block))]

	def render_breadcrumb(self, block):
		return [p(renderMD(block.title))]

	def render_collection_view_page(self, block):
		print("TEST")
		return [a(renderMD(block.title), href=href_for_block(block))]

	render_framer = render_embed

	def render_tweet(self, block):
		#TODO: Convert to a list or something
		return requests.get("https://publish.twitter.com/oembed?url=" + block.source).json()["html"]

	render_gist = render_embed
	render_drive = render_embed
	render_figma = render_embed
	render_loom = render_embed
	render_typeform = render_embed
	render_codepen = render_embed
	render_maps = render_embed
	render_invision = render_embed

	def render_callout(self, block):
		return [div(
			div(block.icon, _class="icon") + div(renderMD(block.title), _class="text"),
                    _class="callout")]

	def render_collection_view(self, block):
	#Render out the table itself
	#TODO

	#Render out all the embedded PageBlocks
		if not self.render_table_pages_after_table:
			return []  # Don't render out any of the internal pages

		return [h2(block.title)] + self.render_blocks_into(block.collection.get_rows())
