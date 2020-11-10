export const meta = {
  title: 'dragonwocky',
  icon: 'https://dragonwocky.me/avatar.jpg',
  description: `hey, i'm a teenage aussie programmer experienced in back- & front-end web development and design.
    i like to read, cook, and play minecraft.`,
  banner:
    'https://user-images.githubusercontent.com/16874139/97990545-36b69480-1e34-11eb-82b8-0e66f8a3e19d.jpg',
  color: '#f31145',
  url: 'https://dragonwocky.me/',
  twitter: '@dragonwocky',
  tags: [
    'teenager',
    'portfolio',
    'javascript',
    'developer',
    'programmer',
    'minecraft',
    'reading',
  ],
};

export const profile = {
  name: meta.title,
  icon: meta.icon,
  bio: meta.description,
};

export const donate = {
  message: `used some of my work? want to contribute? development takes a lot of time and effort,
    and i'd appreciate your support!`,
  amounts: [
    {
      name: 'buy me a coffee ($5)',
      checkoutMode: 'payment',
      priceID: 'price_1HlLx8EmZ8V4VWEQ4W6qNJwF',
    },
    {
      name: 'buy me a book ($15)',
      checkoutMode: 'payment',
      priceID: 'price_1HlLxNEmZ8V4VWEQJCdHQPuX',
    },
    {
      name: 'sponsor ($50/yr)',
      checkoutMode: 'subscription',
      priceID: 'price_1HlLy7EmZ8V4VWEQVbKWgy80',
    },
  ],
};

export const badges = [
  {
    label: 'reddit',
    message: 'u/thedragonring',
    color: '#de3d02',
    link: 'https://www.reddit.com/user/thedragonring',
    icon:
      'https://styles.redditmedia.com/t5_6/styles/communityIcon_a8uzjit9bwr21.png',
  },
  {
    label: 'github',
    message: '@dragonwocky',
    color: '#83b7cb',
    link: 'https://github.com/dragonwocky',
    icon:
      'https://github.githubassets.com/images/modules/logos_page/Octocat.png',
  },
  {
    label: 'twitter',
    message: '@dragonwocky',
    color: '#3390c9',
    link: 'https://twitter.com/dragonwocky',
    icon: 'https://img.icons8.com/fluent/344/twitter.png',
  },
  {
    label: 'discord',
    message: 'dragonwocky#8449',
    color: '#6073b5',
    link: 'https://dsc.bio/dragnwocky',
    icon: 'https://discordapp.com/assets/f8389ca1a741a115313bede9ac02e2c0.svg',
  },
  {
    label: 'email',
    message: 'thedragonring.bod@gmail.com',
    color: '#97abb4',
    link: 'mailto:thedragonring.bod@gmail.com',
    icon:
      'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/mozilla/36/envelope_2709.png',
  },
  {
    label: 'boxofdevs team',
    color: '#955b35',
    link: 'https://discordapp.com/invite/g39aNQe',
    icon: 'https://dragonwocky.me/assets/boxofdevs.svg',
    message: '',
  },
];

export const portfolio = new Promise(async (res, rej) => {
  const enhancer = {
    gh: await (
      await fetch('https://api.github.com/repos/dragonwocky/notion-enhancer')
    ).json(),
    npm: await (
      await fetch(
        'https://api.npmjs.org/downloads/point/last-week/notion-enhancer'
      )
    ).json(),
    registry: await (
      await fetch('https://registry.npmjs.org/notion-enhancer/latest')
    ).json(),
  };

  res([
    {
      color: '#4b85d1',
      link: 'https://dragonwocky.me/notion-enhancer/',
      title: 'notion-enhancer',
      subtitle: [
        `v${enhancer.registry.version}`,
        `${enhancer.gh.stargazers_count} stars`,
        `${enhancer.npm.downloads} weekly downloads`,
      ],
      description:
        'an enhancer/customiser for the all-in-one productivity workspace <a class="underline pointer-events-auto" href="https://www.notion.so/">notion.so</a>',
      tags: [
        'notion',
        'productivity',
        'mod',
        'loader',
        'enhancer',
        'hack',
        'macOS',
        'windows',
        'linux',
        'theme',
      ],
      image:
        'https://repository-images.githubusercontent.com/242956320/3eb40b80-1e17-11eb-829c-83157a13df18',
    },
    {
      color: '#00ff00',
      link: 'https://chase-game.glitch.me/',
      title: 'chase',
      subtitle: 'v1.0.0',
      description: "you run, we chase. don't get caught.",
      tags: [
        'game',
        'dungeon',
        '2d',
        'school-project',
        'survival',
        'multiplayer',
        'campaign',
        'powerups',
      ],
      image:
        'https://user-images.githubusercontent.com/16874139/97983346-45e41500-1e29-11eb-80a7-841c5af89b1f.png',
    },
  ]);
});

export const posts = [
  {
    link: '/posts/wsl-setup',
    title: 'wsl: setup',
    subtitle: '<span data-datetime>Sun, 01 Nov 2020 03:37 GMT</span>',
    description:
      'a documentation on setting up the windows subsystem for linux (v1) for use as a development environment.',
    tags: ['dev', 'server/os'],
    image:
      'https://user-images.githubusercontent.com/16874139/97987051-c35e5400-1e2e-11eb-9412-d7020d6182a0.png',
  },
];
