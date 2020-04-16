# must run from root: py data/build.py

import json
import os
from markdown import markdown

__folder__ = os.path.dirname(os.path.realpath(
    __file__)).replace('\\', '/') + '/../'

data = {}
pages = {}
with open(__folder__ + 'data/contact.json') as contact:
    data.update(json.load(contact))
with open(__folder__ + 'data/portfolio.json') as portfolio:
    data.update(json.load(portfolio))
with open(__folder__ + 'data/hire-me.md') as hire_me:
    pages['hire-me'] = markdown(hire_me.read(), output_format='html5')

with open(__folder__ + 'templates/sidebar.html') as sidebar:
    sidebar = sidebar.read() \
        .replace('__contact__', ''.join(map(lambda entry: f'''
          <li class="badge" {
            f"style='--badge: {entry['colour']}'" if 'colour' in entry else ''
          }>
            <a href="{entry['url']}">
              <b><img width="20"
                  src="{entry['image']}"
                />{entry['title']}
              </b>
              <span>
                {entry['tag']}
              </span>
            </a>
          </li>
        ''', data['contact'])))

with open(__folder__ + 'templates/index.html') as template:
    template = template.read() \
        .replace('__sidebar__', sidebar) \
        .replace('__hire-me__', pages['hire-me']) \
        .replace('__portfolio__', ''.join(map(lambda entry: f'''
          <section class="card" {
              f"style='--card: {entry['colour']}'" if 'colour' in entry else ''
          }>
            <a href="{entry['url']}" class="card-link"></a>
            <div class="card-content">
              <h3>{entry['name']}</h3>
              <p>{entry['desc']}</p>
              {'<ul>' +
                (f"""
                <li class="badge" style="--badge: #858c93"' {
                  '' if 'npm' in entry['badges'] else f"data-githubV='{entry['badges']['github']}'"
                }>
                  <a href="https://github.com/{entry['badges']['github']}">
                    <b><img width="20"
                      src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
                    />github</b>
                  </a>
                </li>
              """ if 'github' in entry['badges'] else '')
                + (f""" <li class="badge" style="--badge: #c12127"' data-npmV="{entry['badges']['npm']}">
                  <a href="https://www.npmjs.com/package/{entry['badges']['npm']}">
                    <b><img width="20"
                        src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png"
                      />npm</b>
                  </a>
                </li>
              """ if 'npm' in entry['badges'] else '')
                +  (f"""  <li class="badge" {
                    f"style='--badge: {entry['colour']}'" if 'colour' in entry else ''
                }>
                  <a href="{entry['badges']['license'][1]}">
                    <b><svg width="20" height="20"></svg>license</b><span>{
                      entry['badges']['license'][0]
                    }</span>
                  </a>
                </li>
              """ if 'license' in entry['badges'] else '')
              + '</ul>' if 'badges' in entry else ''}
            </div>
          </section>
        ''', data['portfolio']))) \
        .replace('__depth__', '')

with open(__folder__ + 'index.html', 'w') as index:
    index.write(template)
