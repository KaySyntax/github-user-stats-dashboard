export interface SuggestedProfile {
  login: string
  name: string
  tag: string
}

export const TRENDING_THIS_WEEK: SuggestedProfile[] = [
  { login: 'torvalds', name: 'Linus Torvalds', tag: 'Linux creator' },
  { login: 'gaearon', name: 'Dan Abramov', tag: 'React core' },
  { login: 'sindresorhus', name: 'Sindre Sorhus', tag: 'Open-source legend' },
  { login: 'ThePrimeagen', name: 'ThePrimeagen', tag: 'Vim enthusiast' },
  { login: 'tj', name: 'TJ Holowaychuk', tag: 'Express & Co.' },
  { login: 'evanw', name: 'Evan Wallace', tag: 'esbuild author' },
]

export const POPULAR_SUGGESTIONS = [
  'torvalds',
  'gaearon',
  'sindresorhus',
  'ThePrimeagen',
  'geohot',
  'antfu',
  'rich-harris',
]

export const COMPARE_SUGGESTIONS: [string, string][] = [
  ['torvalds', 'gaearon'],
  ['sindresorhus', 'ThePrimeagen'],
  ['antfu', 'rich-harris'],
]

