/**
 * Maps GitHub language names to their devicon CDN URLs.
 * Uses the devicon library hosted on jsDelivr CDN.
 */

const DEVICON_MAP: Record<string, string> = {
  'JavaScript': 'javascript/javascript-original',
  'TypeScript': 'typescript/typescript-original',
  'Python': 'python/python-original',
  'Java': 'java/java-original',
  'C#': 'csharp/csharp-original',
  'C++': 'cplusplus/cplusplus-original',
  'C': 'c/c-original',
  'Go': 'go/go-original',
  'Rust': 'rust/rust-original',
  'Ruby': 'ruby/ruby-original',
  'PHP': 'php/php-original',
  'Swift': 'swift/swift-original',
  'Kotlin': 'kotlin/kotlin-original',
  'Dart': 'dart/dart-original',
  'Shell': 'bash/bash-original',
  'Bash': 'bash/bash-original',
  'HTML': 'html5/html5-original',
  'CSS': 'css3/css3-original',
  'Sass': 'sass/sass-original',
  'SCSS': 'sass/sass-original',
  'Vue': 'vuejs/vuejs-original',
  'Svelte': 'svelte/svelte-original',
  'Lua': 'lua/lua-original',
  'Perl': 'perl/perl-original',
  'R': 'r/r-original',
  'Scala': 'scala/scala-original',
  'Elixir': 'elixir/elixir-original',
  'Haskell': 'haskell/haskell-original',
  'Clojure': 'clojure/clojure-original',
  'Objective-C': 'objectivec/objectivec-plain',
  'Jupyter Notebook': 'jupyter/jupyter-original',
  'Dockerfile': 'docker/docker-original',
  'Vim Script': 'vim/vim-original',
  'PowerShell': 'powershell/powershell-original',
  'Zig': 'zig/zig-original',
}

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons'

export function getDevIconUrl(language: string): string | null {
  const path = DEVICON_MAP[language]
  if (!path) return null
  return `${CDN_BASE}/${path}.svg`
}
