import 'https://unpkg.com/terser@5.3.8/dist/bundle.min.js';
import { meta, profile, donate, badges, portfolio, posts } from './data.js';
import { lib } from './lib.ts';

const encoder = new TextEncoder(),
  decoder = new TextDecoder();

async function readDirDeep(dir, { filter = (file) => true } = { filter: (file) => true }) {
  let files = [];
  dir = dir
    .split('/')
    .filter((el) => el !== '.' && el)
    .join('/');
  if (dir) dir += '/';
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      files = [...files, ...(await readDirDeep(`${dir}${entry.name}`, { filter }))];
    } else if (entry.isFile && filter(`${dir}${entry.name}`)) {
      files.push(`${dir}${entry.name}`);
    }
  }
  return files;
}

async function copyDir(from, to) {
  await Deno.mkdir(to);
  const files = await readDirDeep(from);
  return Promise.all(
    files.map(async (file) => {
      file = file.slice(from.length);
      try {
        await Deno.mkdir(`${to}/${file.split('/').slice(0, -1).join('/')}`, {
          recursive: true,
        });
      } catch {
        1;
      }
      return Deno.copyFile(`${from}/${file}`, `${to}/${file}`);
    })
  );
}

async function readHTMLDeep(dir) {
  const files = await readDirDeep(dir, {
    filter: (file) => file.endsWith('.html'),
  });
  return new Map(
    await Promise.all(
      files.map(async (name) => [
        name.slice(dir.length + 1, -5),
        decoder.decode(await Deno.readFile(name)),
      ])
    )
  );
}

// async function generate(data) {
//   for (let key in data) data[key] = await data[key];
//   data = new Map(Object.entries(data));
//   const templates = await readHTMLDeep('templates'),
//     components = await readHTMLDeep('components');
//   let page = template(templates.get('profile'), { components, data });
//   return page;
// }
// generate({ meta, profile, donate, badges, portfolio, posts })
//   .then(async (content) => {
//     try {
//       await Deno.remove('docs', { recursive: true });
//     } catch {}
//     await copyDir('static', 'docs');
//     const { code } = await Terser.minify(
//       decoder.decode(await Deno.readFile('components/script/loader.js')),
//       { toplevel: true }
//     );
//     await Deno.writeFile('docs/loader.js', encoder.encode(code));
//     return Deno.writeFile('docs/index.html', encoder.encode(content));
//   })
//   .catch(console.error);

async function generate() {
  const templates = await readHTMLDeep('templates'),
    components = await readHTMLDeep('components');
  const data = new Map();
  data.set('component', components);
  const page = lib(
    { template: templates.get('profile'), data },
    { stripComments: false, silentFailReference: true }
  );
  return page;
}
generate().then(console.log);

// async function mix(
//   values: Record<string, unknown>,
//   components: Record<string, string>
// ): Promise<Map<string, unknown>> {
//   for (const key in values) values[key] = await values[key];
//   for (const key in components) components[key] = await components[key];
//   const data: Map<string, unknown> = new Map(Object.entries(values));
//   data.set('component', components);
//   return data;
// }
