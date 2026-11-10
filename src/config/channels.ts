import type { Channel } from '../types'

export const BUILTIN_CHANNELS: Channel[] = [
  {
    id: 'top',
    label: '#top',
    description: 'Current Hacker News front page top stories',
    feedType: 'top',
  },
  {
    id: 'new',
    label: '#new',
    description: 'Newest stories submitted to Hacker News in real time',
    feedType: 'new',
  },
  {
    id: 'past',
    label: '#past',
    description: 'Historic front page top stories from previous days',
    feedType: 'past',
  },
  {
    id: 'best',
    label: '#best',
    description: 'Highest scored stories of all time',
    feedType: 'best',
  },
  {
    id: 'ask',
    label: '#ask',
    description: 'Ask HN community questions and discussions',
    feedType: 'ask',
  },
  {
    id: 'show',
    label: '#show',
    description: 'Show HN launches, tools, and indie projects',
    feedType: 'show',
  },
  {
    id: 'jobs',
    label: '#jobs',
    description: 'Who is hiring and startup job opportunities',
    feedType: 'jobs',
  },
  {
    id: 'links',
    label: '#links',
    description: 'Stories with direct external links only (articles, papers, blogs)',
    feedType: 'top',
  },
  {
    id: 'systems',
    label: '#systems',
    description: 'Operating systems, compilers, databases, Rust, C++, networking, architecture',
    keywords: [
      'rust', 'linux', 'kernel', 'compiler', 'database', 'postgres', 'sqlite', 'redis',
      'c++', 'golang', 'distributed', 'cpu', 'memory', 'concurrency', 'networking',
      'tcp', 'ebpf', 'wasm', 'assembly', 'storage', 'file system', 'cache', 'low-level',
      'algorithm', 'performance', 'simd', 'gpu', 'cuda', 'hardware'
    ],
    domains: [
      'github.com', 'danluu.com', 'lwn.net', 'brendangregg.com', 'norvig.com',
      'fasterthanli.me', 'kristoff.it', 'matklad.github.io', 'arxiv.org'
    ],
  },
  {
    id: 'essays',
    label: '#essays',
    description: 'Deep thought pieces, engineering retrospectives, philosophy & long-form writing',
    keywords: [
      'essay', 'retrospective', 'lessons', 'reflection', 'postmortem', 'history of',
      'manifesto', 'guide', 'principles', 'mental model', 'career', 'book review'
    ],
    domains: [
      'paulgraham.com', 'gwern.net', 'apenwarr.ca', 'overreacted.io', 'vitalik.eth.limo',
      'ribbonfarm.com', 'astralcodexten.com', 'substacks.com', 'marginalrevolution.com'
    ],
  },
  {
    id: 'saved',
    label: '#saved',
    description: 'Bookmarked stories stored offline on your device',
    feedType: 'saved',
  },
]
