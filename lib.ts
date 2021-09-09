function accessNestedPropByString(
  obj: Record<string, unknown>,
  parts: string[],
) {
  for (const part of parts) {
    let target: unknown = (obj instanceof Map) ? obj.get(part) : obj[part];
    if (typeof target === "object") {
      if (target instanceof Set) target = [...target];
      obj = target as Record<string, unknown>;
    } else return target;
  }
  return obj;
}
function splitByRegexes(str: string, regexes: RegExp[]) {
  let parts: string[] = [str];
  for (const regex of regexes) {
    parts = parts.map((part) => part.split(regex)).flat(Infinity) as string[];
  }
  return parts;
}

type tree = Array<element | string>;
interface element {
  type: string;
  children: tree;
}
function tokenize(str: string): tree {
  interface pointer {
    stack: Array<element>;
    i: number;
  }
  const tree: tree = [{ type: "root", children: [] }],
    pointer: pointer = { stack: [tree[0] as element], i: -1 };
  function open(type: string): void {
    pointer.i++;
    pointer.stack[0].children[pointer.i] = { type, children: [] };
    pointer.stack.unshift(
      pointer.stack[0].children[pointer.i] as element,
    );
    pointer.i = -1;
  }
  function close(type: string): void {
    if (pointer.stack[0].type !== type) {
      throw new Error(
        `<tokenize>: invalid syntax, "${type}" element closed in context of "${
          pointer.stack[0].type
        }" @ ${JSON.stringify(pointer.stack[0])}.`,
      );
    }
    pointer.stack.shift();
    pointer.i = pointer.stack[0].children.length - 1;
  }
  for (
    const part of splitByRegexes(str, [/({{)/g, /(}})/g, /(<!--)/g, /(-->)/g])
  ) {
    switch (part) {
      case "{{":
        open("tag");
        break;
      case "}}":
        close("tag");
        break;
      case "<!--":
        open("comment");
        break;
      case "-->":
        close("comment");
        break;
      default:
        if (typeof pointer.stack[0].children[pointer.i] !== "string") {
          pointer.i++;
          pointer.stack[0].children[pointer.i] = "";
        }
        pointer.stack[0].children[pointer.i] += part;
    }
  }
  return tree;
}

interface data {
  template: string;
  data: Map<string, unknown>;
}
interface options {
  stripComments: boolean;
  silentFailReference: boolean;
}
export async function lib(
  { template, data }: data,
  { stripComments = true, silentFailReference = false }: options,
): Promise<string> {
  function get(selector: string): unknown {
    const [key, ...rest]: string[] = selector.split(".");
    let value = data.get(key);
    if (typeof value === "object" && rest.length) {
      value = accessNestedPropByString(value as Record<string, unknown>, rest);
    }
    return value;
  }
  async function replace(tag: string): Promise<string | undefined> {
    tag = tag.trim();
    const parts = tag.split(" "),
      key: string | undefined = parts.find((part) => !/(?<!\\):/.test(part)),
      modifiers: Record<string, string> = Object.fromEntries(
        parts
          .map((part) => part.split(/(?<!\\):/))
          .filter((part) => part.length > 1)
          .map((part) => [part[0], part.slice(1).join(":")]),
      );
    if (!key) return undefined;
    if (modifiers.if && !get(modifiers.if)) return "";
    let value = get(key);
    if (value === undefined) return value;
    if (Array.isArray(value)) value = value.join(modifiers.join ?? ", ");
    value = typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : String(value);
    if (modifiers.for) {
      const looper = get(modifiers.for);
      if (!Array.isArray(looper)) return undefined;
      let result = "";
      for (const elem of looper) {
        const scoped = new Map(data);
        if (modifiers.as) {
          scoped.set(modifiers.as, elem);
        }
        result += await lib(
          { template: value as string, data: scoped },
          { stripComments, silentFailReference },
        );
      }
      return result;
    }
    return await lib(
      { template: value as string, data: data },
      { stripComments, silentFailReference },
    );
  }
  async function render(tokens: tree, raw: boolean = false): Promise<string> {
    let parsed: string = "";
    for (const element of tokens) {
      if (typeof element === "string") parsed += element;
      else {
        switch (element.type) {
          case "root":
            parsed += await render(element.children, raw);
            break;
          case "tag":
            if (raw) {
              parsed += `{{${render(element.children, raw)}}}`;
            } else {
              const value = await replace(await render(element.children, raw));
              if (value === undefined) {
                if (silentFailReference) {
                  parsed += `{{${await render(element.children, raw)}}}`;
                } else {
                  throw new Error(
                    `<render>: undefined data referenced "${await render(
                      element.children,
                      raw,
                    )}"`,
                  );
                }
              } else parsed += value;
            }
            break;
          case "comment":
            if (!stripComments) {
              parsed += `<!--${await render(element.children, true)}-->`;
            }
            break;
        }
      }
    }
    return parsed;
  }
  return render(tokenize(template));
}
