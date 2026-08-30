export interface SuggestedProfile {
  login: string
  name: string
  tag: string
}

export const TRENDING_THIS_WEEK: SuggestedProfile[] = [
  { login: 'torvalds', name: 'Linus Torvalds', tag: 'Linux creator' },
  { login: 'gaearon', name: 'Dan Abramov', tag: 'React core' },
  { login: 'sindresorhus', name: 'Sindre Sorhus', tag: 'Open-source legend' },
  { login: 'tj', name: 'TJ Holowaychuk', tag: 'Express & Co.' },
  { login: 'addyosmani', name: 'Addy Osmani', tag: 'Web performance' },
  { login: 'evanw', name: 'Evan Wallace', tag: 'esbuild author' },
]

export const POPULAR_SUGGESTIONS = [
  'vercel',
  'facebook',
  'microsoft',
  'google',
  'nodejs',
  'rust-lang',
  'tailwindlabs',
]

export const COMPARE_SUGGESTIONS: [string, string][] = [
  ['torvalds', 'gaearon'],
  ['sindresorhus', 'tj'],
  ['vercel', 'netlify'],
]
