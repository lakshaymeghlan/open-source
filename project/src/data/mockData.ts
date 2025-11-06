import { Project } from '../components/ProjectCard';

export const mockProjects: Project[] = [
  {
    id: '1',
    owner: 'facebook',
    name: 'react',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    avatar: 'https://avatars.githubusercontent.com/u/69631?v=4',
    stars: 220000,
    forks: 45000,
    openIssues: 850,
    difficulty: 'medium',
    techs: ['React', 'TypeScript', 'JavaScript'],
    isBookmarked: false
  },
  {
    id: '2',
    owner: 'vercel',
    name: 'next.js',
    description: 'The React Framework for Production - providing hybrid static & server rendering, TypeScript support, smart bundling, and more.',
    avatar: 'https://avatars.githubusercontent.com/u/14985020?v=4',
    stars: 118000,
    forks: 25000,
    openIssues: 1200,
    difficulty: 'hard',
    techs: ['Next.js', 'React', 'TypeScript'],
    isBookmarked: true
  },
  {
    id: '3',
    owner: 'nodejs',
    name: 'node',
    description: 'Node.js JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
    avatar: 'https://avatars.githubusercontent.com/u/9950313?v=4',
    stars: 102000,
    forks: 27500,
    openIssues: 1500,
    difficulty: 'hard',
    techs: ['Node.js', 'JavaScript'],
    isBookmarked: false
  },
  {
    id: '4',
    owner: 'django',
    name: 'django',
    description: 'The Web framework for perfectionists with deadlines. A high-level Python web framework.',
    avatar: 'https://avatars.githubusercontent.com/u/27804?v=4',
    stars: 75000,
    forks: 30000,
    openIssues: 200,
    difficulty: 'medium',
    techs: ['Python', 'Django'],
    isBookmarked: false
  },
  {
    id: '5',
    owner: 'microsoft',
    name: 'TypeScript',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    avatar: 'https://avatars.githubusercontent.com/u/6154722?v=4',
    stars: 98000,
    forks: 12500,
    openIssues: 5800,
    difficulty: 'hard',
    techs: ['TypeScript', 'JavaScript'],
    isBookmarked: false
  },
  {
    id: '6',
    owner: 'golang',
    name: 'go',
    description: 'The Go programming language. Build simple, reliable, and efficient software.',
    avatar: 'https://avatars.githubusercontent.com/u/4314092?v=4',
    stars: 118000,
    forks: 17000,
    openIssues: 8500,
    difficulty: 'medium',
    techs: ['Go'],
    isBookmarked: false
  },
  {
    id: '7',
    owner: 'rust-lang',
    name: 'rust',
    description: 'A language empowering everyone to build reliable and efficient software.',
    avatar: 'https://avatars.githubusercontent.com/u/5430905?v=4',
    stars: 92000,
    forks: 12000,
    openIssues: 9500,
    difficulty: 'hard',
    techs: ['Rust'],
    isBookmarked: false
  },
  {
    id: '8',
    owner: 'reactjs',
    name: 'react-router',
    description: 'Declarative routing for React applications.',
    avatar: 'https://avatars.githubusercontent.com/u/6412038?v=4',
    stars: 51000,
    forks: 10000,
    openIssues: 45,
    difficulty: 'easy',
    techs: ['React', 'TypeScript'],
    isBookmarked: false
  }
];

export const mockIssues = [
  {
    id: '1',
    title: 'Add support for React Server Components in Suspense',
    labels: ['good first issue', 'help wanted', 'enhancement'],
    url: 'https://github.com/facebook/react/issues/12345'
  },
  {
    id: '2',
    title: 'Documentation: Update hooks API reference',
    labels: ['documentation', 'good first issue'],
    url: 'https://github.com/facebook/react/issues/12346'
  },
  {
    id: '3',
    title: 'Bug: useEffect cleanup not called on unmount',
    labels: ['bug', 'help wanted'],
    url: 'https://github.com/facebook/react/issues/12347'
  },
  {
    id: '4',
    title: 'Feature: Add TypeScript generics to Context API',
    labels: ['enhancement', 'typescript'],
    url: 'https://github.com/facebook/react/issues/12348'
  }
];

export const mockContributors = [
  {
    id: '1',
    avatar: 'https://avatars.githubusercontent.com/u/810438?v=4',
    username: 'gaearon',
    contributions: 2456
  },
  {
    id: '2',
    avatar: 'https://avatars.githubusercontent.com/u/3624098?v=4',
    username: 'sophiebits',
    contributions: 1823
  },
  {
    id: '3',
    avatar: 'https://avatars.githubusercontent.com/u/1863771?v=4',
    username: 'acdlite',
    contributions: 1654
  },
  {
    id: '4',
    avatar: 'https://avatars.githubusercontent.com/u/6820?v=4',
    username: 'zpao',
    contributions: 1245
  },
  {
    id: '5',
    avatar: 'https://avatars.githubusercontent.com/u/1055481?v=4',
    username: 'sebmarkbage',
    contributions: 1098
  },
  {
    id: '6',
    avatar: 'https://avatars.githubusercontent.com/u/11481355?v=4',
    username: 'rickhanlonii',
    contributions: 876
  },
  {
    id: '7',
    avatar: 'https://avatars.githubusercontent.com/u/1000?v=4',
    username: 'contributor7',
    contributions: 654
  },
  {
    id: '8',
    avatar: 'https://avatars.githubusercontent.com/u/2000?v=4',
    username: 'contributor8',
    contributions: 543
  },
  {
    id: '9',
    avatar: 'https://avatars.githubusercontent.com/u/3000?v=4',
    username: 'contributor9',
    contributions: 432
  },
  {
    id: '10',
    avatar: 'https://avatars.githubusercontent.com/u/4000?v=4',
    username: 'contributor10',
    contributions: 321
  }
];

export const mockUserProfile = {
  id: 'user-1',
  avatar: 'https://avatars.githubusercontent.com/u/5000?v=4',
  name: 'Alex Developer',
  username: 'alexdev',
  bio: 'Full-stack developer passionate about open-source. Love working with React, TypeScript, and Node.js.',
  preferredTechs: ['React', 'TypeScript', 'Node.js', 'Python'],
  achievements: [
    { id: 'first-bookmark', label: 'First Bookmark', unlocked: true },
    { id: '1-contribution', label: '1 Contribution', unlocked: true },
    { id: '10-contributions', label: '10 Contributions', unlocked: false }
  ]
};
