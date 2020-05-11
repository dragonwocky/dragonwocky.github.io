from renderer import HTMLNotebookRenderer, HTMLRenderer
import json
import os
import re
import time
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

# dragonwocky.me
# (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
# (https://dragonwocky.me/) under the MIT license

__folder__ = os.path.dirname(os.path.realpath(
    __file__)).replace('\\', '/') + '/../'

templates = {}
with open(f'{__folder__}templates/badge.html') as badge:
    templates['badge'] = badge.read()
with open(f'{__folder__}templates/card.html') as card:
    templates['card'] = card.read()
with open(f'{__folder__}templates/index.html') as index:
    templates['index'] = index.read()
with open(f'{__folder__}templates/post.html') as post:
    templates['post'] = post.read()
with open(f'{__folder__}templates/footer.html') as post:
    templates['footer'] = post.read()
with open(f'{__folder__}templates/sidebar.html') as sidebar:
    templates['sidebar'] = sidebar.read()

data = {}
with open(f'{__folder__}data/contact.json') as contact:
    data['contact'] = json.load(contact)
with open(f'{__folder__}data/portfolio.json') as portfolio:
    data['portfolio'] = json.load(portfolio)

# with open(__folder__ + 'data/hire-me.md') as hire_me:
#     pages['hire-me'] = markdown(hire_me.read(), output_format='html5')


def gen_badge(colour, url, img, name, value):
    return templates['badge'] \
        .replace('__colour__', colour or 'var(--primary)') \
        .replace('__url__', url or '') \
        .replace('__img__', img or '') \
        .replace('__name__', name or '') \
        .replace('__value__', value or '')


def gen_card(name, url='', colour='',  desc='', image='', time='', badges=[], tags=[]):
    tags = ' #'.join(tags)
    tags = '#' + tags if tags else ''
    search = f'{name or ""} {desc or ""} {tags}'
    return templates['card'] \
        .replace('__name__', name or '') \
        .replace('__url__', url or '') \
        .replace('__colour__', colour or 'var(--primary)') \
        .replace('__desc__', desc or '') \
        .replace('__image__', f'<img loading="lazy" class="card-image" src="{image}">' if image else '') \
        .replace('__timestamp__', time or '') \
        .replace('__badges__', ''.join(badges) or '') \
        .replace('__tags__', tags) \
        .replace('__search__', search)


def gen_portfolio_card(project):
    badges = []
    if 'github' in project.get('badges'):
        badges.append(gen_badge(
            colour='#858c93',
            url=f'https://github.com/{project["badges"]["github"]}',
            img='https://github.githubassets.com/images/modules/logos_page/Octocat.png',
            name='github',
            value=''))
        if 'npm' not in project.get('badges'):
            badges[len(badges)-1] = badges[len(badges)-1].replace(
                ';">', f';" data-githubV="{project["badges"]["github"]}">')
    if 'npm' in project.get('badges'):
        badges.append(gen_badge(
            colour='#c12127',
            url=f'https://www.npmjs.com/package/{project["badges"]["npm"]}',
            img='https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png',
            name='npm',
            value=''))
        badges[len(badges)-1] = badges[len(badges)-1].replace(
            ';">', f';" data-npmV="{project["badges"]["npm"]}">')
    if 'license' in project.get('badges'):
        badges.append(gen_badge(
            colour=project.get('colour'),
            url=project['badges']['license'][1],
            img='',
            name='license',
            value=project['badges']['license'][0]))
    return gen_card(
        name=project.get('name'),
        url=project.get('url'),
        colour=project.get('colour'),
        desc=project.get('desc'),
        badges=badges)


sidebar = templates['sidebar'].replace('__contact__', ''.join(map(lambda project: gen_badge(
    colour=project.get('colour'),
    url=project.get('url'),
    img=project.get('image'),
    name=project.get('name'),
    value=project.get('tag')
), data['contact'])))


def gen_post_card(post):
    return gen_card(
        name=post.get('title'),
        url=f'./posts/{post["slug"]}',
        colour='',
        desc=post['description'],
        image=post['image'].group(1) if post['image'] else '',
        time=post['time'],
        badges=[],
        tags=post['tags']
    )


posts = sorted({
    # notebook
    **HTMLNotebookRenderer('963e491ccb22434da1bc8e7a6bf4177e').render(),
    # dev
    **HTMLNotebookRenderer('80d09a8e462243da8a90a3e7282f0904').render()
}.values(), key=lambda post: post['time'], reverse=True)

# remove old posts
for file in os.listdir(f'{__folder__}posts'):
    if file.endswith('.html'):
        os.remove(f'{__folder__}posts/{file}')

for i, post in enumerate(posts):
    posts[i]['time'] = datetime.strftime(post['time'], r'%b %d, %Y %I:%M %p')
    posts[i]['formatted-time'] = f'''last updated on <span class="utc-timestamp">{post["time"]} UTC</span>'''
    tags = ' #'.join(post['tags'])
    tags = '#' + tags if tags else ''
    posts[i]['image'] = re.search(
        r'img loading="lazy" alt="[^"]*" src="([^"]*)"', post['content'])
    post_html = templates['post'] \
        .replace('__sidebar__', sidebar) \
        .replace('__footer__', templates['footer']) \
        .replace('__depth__', '../') \
        .replace('__title__', post['title']) \
        .replace('__image__', post['image'].group(1) if post['image'] else 'https://dragonwocky.me/assets/avatar.jpg') \
        .replace('__slug__', post['slug']) \
        .replace('__last-modified__', post['time']) \
        .replace('__tags__', ' '.join(post['tags'])) \
        .replace('__description__', post['description']) \
        .replace('__content__', post['content'].replace('>', f'''>
            <p class="post-meta">{post["formatted-time"]} <b class="tags">{tags}</b></p>
        ''', 1))
    with open(f'{__folder__}posts/{post["slug"]}.html', 'w') as post_output:
        post_output.write(post_html)

hire_me = HTMLRenderer('6becc6d78aac4f709ff82229f156c7fa').render()

index = templates['index'] \
    .replace('__sidebar__', sidebar) \
    .replace('__footer__', templates['footer']) \
    .replace('__depth__', '') \
    .replace('__portfolio__', ''.join(map(gen_portfolio_card, data['portfolio']))) \
    .replace('__posts__', ''.join(map(gen_post_card, posts))) \
    .replace('__hire-me__', hire_me)

with open(f'{__folder__}index.html', 'w') as index_output:
    index_output.write(index)
