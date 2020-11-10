const decoder = new TextDecoder('utf-8');

export async function readDirDeep(
  dir,
  { filter = (file) => true } = { filter: (file) => true }
) {
  let files = [];
  dir = dir
    .split('/')
    .filter((el) => el !== '.' && el)
    .join('/');
  if (dir) dir += '/';
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      files = [
        ...files,
        ...(await readDirDeep(`${dir}${entry.name}`, { filter })),
      ];
    } else if (entry.isFile && filter(`${dir}${entry.name}`))
      files.push(`${dir}${entry.name}`);
  }
  return files;
}

export async function copyDir(from, to) {
  await Deno.mkdir(to);
  let files = await readDirDeep(from);
  return Promise.all(
    files.map(async (file) => {
      file = file.slice(from.length);
      try {
        await Deno.mkdir(`${to}/${file.split('/').slice(0, -1).join('/')}`, {
          recursive: true,
        });
      } catch {}
      return Deno.copyFile(`${from}/${file}`, `${to}/${file}`);
    })
  );
}

export async function readHTMLDeep(dir) {
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

export function accessNestedPropByString(obj, parts) {
  if (typeof parts === 'string') parts = parts.split('.');
  for (let part of parts) {
    if (!obj) return obj;
    obj = obj[part];
  }
  return obj;
}
