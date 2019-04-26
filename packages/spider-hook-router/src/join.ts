export function isAbsolute(path: string) {
  return path.length > 0 && path.charAt(0) === '/'
}

export function join(...pathSegments: string[]) {
  return pathSegments.join('/').replace(/(\/\/+)|(\/$)/, '/')
}

export function formalize(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(segment => `/${segment}`)
    .join('')
}
