const data = require('./content.json'),
  fsp = require('fs').promises,
  fetch = require('node-fetch');
data.contact = data.contact || [];
data.portfolio = data.portfolio || [];
data.posts = data.posts || [];

(async () => {
  const template = await fsp.readFile('./template.html', 'utf8');
  data.contact = data.contact.map(
    entry => `
      <li class="badge" ${
        entry.colour ? `style="--badge: ${entry.colour}"` : ''
      }>
        <a href="${entry.url}">
          <b><img
              src="${entry.image}"
            />${entry.title}
          </b>
          <span>
            ${entry.tag}
          </span>
        </a>
      </li>`
  );
  data.portfolio = data.portfolio.map(
    entry => `
        <section ${entry.colour ? `style="--card: ${entry.colour}"` : ''}>
          <a href="${entry.url}" class="card-link"></a>
          <div class="card-content">
            <h3>${entry.name}</h3>
            <p>${entry.desc}</p>
            ${
              entry.badges
                ? '<ul>' +
                  (entry.badges.github
                    ? `<li class="badge" style="--badge: #858c93" ${
                        entry.badges.npm
                          ? ''
                          : `data-githubV="${entry.badges.github}"`
                      }>
                        <a href="https://github.com/${entry.badges.github}">
                          <b><img
                            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
                          />github</b>
                        </a>
                      </li>`
                    : '') +
                  (entry.badges.npm
                    ? `<li class="badge" style="--badge: #c12127" data-npmV="${entry.badges.npm}">
                        <a href="https://www.npmjs.com/package/${entry.badges.npm}">
                          <b><img
                              src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png"
                            />npm</b>
                        </a>
                      </li>`
                    : '') +
                  (entry.badges.license.length
                    ? `<li class="badge" ${
                        entry.colour ? `style="--badge: ${entry.colour}"` : ''
                      }>
                        <a href="${entry.badges.license[1]}">
                          <b><svg></svg>license</b><span>${
                            entry.badges.license[0]
                          }</span>
                        </a>
                      </li>`
                    : '') +
                  '</ul>'
                : ''
            }
          </div>
        </section>`
  );
  fsp.writeFile(
    './index.html',
    template
      .replace('__contact__', data.contact.join(''))
      .replace('__portfolio__', data.portfolio.join(''))
  );
})();
