import 'https://unpkg.com/terser@5.3.8/dist/bundle.min.js';
import { copyDir, readHTMLDeep, accessNestedPropByString } from './helpers.js';
import { meta, profile, donate, badges, portfolio, posts } from './data.js';

function template(
  string,
  { components, data },
  preserve = {
    spaces: false,
    lines: false,
    comments: false,
  }
) {
  if (!string) return '';
  function get(selector) {
    const rest = selector.split('.'),
      key = rest.shift();
    let value;
    if (key === 'component') {
      value = components.get(rest.join('.'));
    } else if (data.get(key))
      value = accessNestedPropByString(data.get(key), rest);
    return { key, rest, value };
  }
  function split(string, regexes) {
    string = [string];
    for (let regex of regexes)
      string = string.map((part) => part.split(regex)).flat(Infinity);
    return string;
  }
  function minify(string) {
    if (!preserve.spaces) string = string.replace(/\s+/g, ' ');
    if (!preserve.lines) string = string.replace(/\n/g, ' ');
    return string;
  }
  function replace(string) {
    let result,
      modifiers = {};
    // add opt for strict and throw if nothing matches
    const parts = (string.startsWith('{{') && string.endsWith('}}')
      ? string.slice(2, -2)
      : string
    )
      .split(' ')
      .map((part) => part.replace(/([^\\])\\s/g, '$1 '));
    if (parts.length === 1) {
      result = get(parts[0]).value;
      if (Array.isArray(result)) result = result.join(', ');
    } else {
      modifiers = parts
        .map((part) => part.split(/(?<!\\):/))
        .filter((part) => part.length > 1)
        .map((part) => [part[0], part.slice(1).join(':')]);
      let target = parts.find((part) => !/(?<!\\):/.test(part));
      modifiers = Object.fromEntries(modifiers);
      if (modifiers.if && !get(modifiers.if).value) return '';
      if (modifiers.for) modifiers.for = get(modifiers.for);
      if (modifiers.for && Array.isArray(modifiers.for.value)) {
        result = '';
        for (let elem of modifiers.for.value) {
          const scoped = new Map(data);
          scoped.set(modifiers.as, elem);
          result +=
            template(get(target).value, { components, data: scoped }) || '';
        }
      } else {
        result = get(target).value;
        if (Array.isArray(result)) result = result.join(modifiers.join || ', ');
      }
    }
    return [null, undefined].includes(result)
      ? string
      : template(
          result || '',
          {
            components,
            data,
          },
          {
            spaces: modifiers.preserve
              ? modifiers.preserve.split(',').includes('spaces')
              : preserve.spaces,
            lines: modifiers.preserve
              ? modifiers.preserve.split(',').includes('lines')
              : preserve.lines,
            comments: modifiers.preserve
              ? modifiers.preserve.split(',').includes('comments')
              : preserve.comments,
          }
        );
  }
  const tokens = {
      comment: 0,
      placeholder: 0,
    },
    groups = [''];
  for (let part of split(string, [/({{)/g, /(}})/g, /(<!--)/g, /(-->)/g])) {
    switch (part) {
      case '{{':
        if (!tokens.placeholder) {
          if (tokens.comment !== 1) {
            if (groups[0]) groups.unshift('');
            tokens.placeholder = 1;
          } else tokens.placeholder = 2;
        }
        groups[0] += part;
        break;
      case '}}':
        groups[0] += part;
        if (!tokens.comment) {
          tokens.placeholder = 0;
          if (tokens.comment !== 1) {
            groups[0] = replace(groups[0]);
            groups.unshift('');
          }
        }
        break;
      case '<!--':
        if (!tokens.comment) {
          if (tokens.placeholder !== 1) {
            if (groups[0]) groups.unshift('');
            tokens.comment = 1;
          } else tokens.comment = 2;
        }
        groups[0] += part;
        break;
      case '-->':
        groups[0] += part;
        tokens.comment = 0;
        if (tokens.placeholder !== 1) {
          tokens.placeholder = 0;
          if (!preserve.comments) groups.shift();
          groups.unshift('');
        }
        break;
      default:
        groups[0] += part;
    }
  }
  const parsed = [''];
  tokens.comment = 0;
  for (let part of split(groups.reverse().join(''), [/(<!--)/g, /(-->)/g])) {
    switch (part) {
      case '<!--':
        if (!tokens.comment) {
          if (parsed[0]) parsed.unshift('');
          tokens.comment = 1;
        }
        parsed[0] += part;
        break;
      case '-->':
        parsed[0] += part;
        tokens.comment = 0;
        parsed.unshift('');
        break;
      default:
        parsed[0] += part;
    }
  }
  return parsed
    .map((part) =>
      part.startsWith('<!--') && part.endsWith('-->') ? part : minify(part)
    )
    .reverse()
    .join('');
}

const encoder = new TextEncoder(),
  decoder = new TextDecoder();
async function generate(data) {
  for (let key in data) data[key] = await data[key];
  data = new Map(Object.entries(data));
  const templates = await readHTMLDeep('templates'),
    components = await readHTMLDeep('components');
  let page = template(templates.get('profile'), { components, data });
  return page;
}
generate({ meta, profile, donate, badges, portfolio, posts })
  .then(async (content) => {
    try {
      await Deno.remove('docs', { recursive: true });
    } catch {}
    await copyDir('static', 'docs');
    const { code } = await Terser.minify(
      decoder.decode(await Deno.readFile('components/script/loader.js')),
      { toplevel: true }
    );
    await Deno.writeFile('docs/loader.js', encoder.encode(code));
    return Deno.writeFile('docs/index.html', encoder.encode(content));
  })
  .catch(console.error);
