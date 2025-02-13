import { Readable } from 'stream';
import { IRoute } from '@umijs/types';
import { parse, UrlWithStringQuery } from 'url';
import mergeStream from 'merge-stream';
import serialize from 'serialize-javascript';

function addLeadingSlash(path: string): string {
  return path.charAt(0) === "/" ? path : "/" + path;
}

// from react-router
export function stripBasename(basename: string, path: string): UrlWithStringQuery {
  const location = parse(path);
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location?.pathname?.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: addLeadingSlash(location.pathname.substr(base.length))
  };
}

class ReadableString extends Readable {
  str: string
  sent: boolean

  constructor (str: string) {
    super()
    this.str = str
    this.sent = false
  }

  _read () {
    if (!this.sent) {
      this.push(Buffer.from(this.str))
      this.sent = true
    } else {
      this.push(null)
    }
  }
}

export { default as cheerio } from '@umijs/utils/lib/cheerio/cheerio'

export interface IHandleHTMLOpts {
  pageInitialProps: object;
  rootContainer: string;
  mountElementId: string;
  mode: 'stream' | 'string';
  forceInitial: boolean;
  routesMatched: IRoute[];
  html: string;
  dynamicImport: boolean;
  manifest: object;
}

/**
 * handle html with rootContainer(rendered)
 * @param param
 */
export const handleHTML = async (opts: Partial<IHandleHTMLOpts> = {}) => {
  const { pageInitialProps, rootContainer, mountElementId, mode, forceInitial, routesMatched, dynamicImport, manifest } = opts;
  let html = opts.html;
  if (typeof html !== 'string') {
    return '';
  }
  const windowInitialVars = {
    ...(pageInitialProps && !forceInitial ? { 'window.g_initialProps': serialize(pageInitialProps) } : {}),
  }
  // get chunks in `dynamicImport: {}`
  if (dynamicImport && Array.isArray(routesMatched)) {
    const chunks: string[] = routesMatched
      .reduce((prev, curr) => {
        const _chunkName = curr.route?._chunkName;
        return [...(prev || []), _chunkName].filter(Boolean);
      }, []);
    if (chunks?.length > 0) {
      // only load css chunks to avoid page flashing
      const cssChunkSet = new Set<string>();
      chunks.forEach(chunk => {
        Object.keys(manifest || {}).forEach(manifestChunk => {
          if (manifestChunk !== 'umi.css'
            && manifestChunk.includes(chunk)
            && /\.css$/.test(manifest[manifestChunk])
          ) {
            cssChunkSet.add(`<link rel="stylesheet" href="${manifest[manifestChunk]}" />`)
          }
        })
      });
      // avoid repeat
      html = html.replace('</head>', `${Array.from(cssChunkSet).join('\n')}\n</head>`);
    }
  }
  html = html.replace(
    '</head>',
    `<script>
      window.g_useSSR = true;
      ${Object.keys(windowInitialVars || {}).map(name => `${name} = ${windowInitialVars[name]}`).concat('').join(';\n')}
    </script>
    </head>`
  );

  if (mode === 'stream') {
    const containerString = `<div id="${mountElementId}">`;
    const [beforeRootContainer, afterRootContainer] = html.split(containerString);

    const beforeRootContainerStream = new ReadableString(beforeRootContainer);
    const containerStream = new ReadableString(containerString);
    const afterRootContainerStream = new ReadableString(afterRootContainer);
    const rootContainerStream = typeof rootContainer === 'string' ? new ReadableString(rootContainer) : rootContainer;
    const htmlStream = mergeStream(beforeRootContainerStream, containerStream, rootContainerStream, afterRootContainerStream);
    return htmlStream;
  }
  return html
    .replace(
      `<div id="${mountElementId}"></div>`,
      `<div id="${mountElementId}">${rootContainer}</div>`
    )
}
