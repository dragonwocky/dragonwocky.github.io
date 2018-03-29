/**
 * thedragonring.me - my personal website
 * ==================================================================
 * Copyright (c) 2018 TheDragonRing <thedragonring.bod@gmail.com>, under the MIT License
 */

window.onload = () => {
  // base64 loading animation
  const loadAnimation =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNNzEgMzkuMlYuNGE2My42IDYzLjYgMCAwIDEgMzMuOTYgMTQuNTdMNzcuNjggNDIuMjRhMjUuNTMgMjUuNTMgMCAwIDAtNi43LTMuMDN6IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTcxIDM5LjJWLjRhNjMuNiA2My42IDAgMCAxIDMzLjk2IDE0LjU3TDc3LjY4IDQyLjI0YTI1LjUzIDI1LjUzIDAgMCAwLTYuNy0zLjAzeiIgZmlsbD0iI2UxZTFlMSIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgNjQgNjQpIi8+PHBhdGggZD0iTTcxIDM5LjJWLjRhNjMuNiA2My42IDAgMCAxIDMzLjk2IDE0LjU3TDc3LjY4IDQyLjI0YTI1LjUzIDI1LjUzIDAgMCAwLTYuNy0zLjAzeiIgZmlsbD0iI2UxZTFlMSIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgNjQgNjQpIi8+PHBhdGggZD0iTTcxIDM5LjJWLjRhNjMuNiA2My42IDAgMCAxIDMzLjk2IDE0LjU3TDc3LjY4IDQyLjI0YTI1LjUzIDI1LjUzIDAgMCAwLTYuNy0zLjAzeiIgZmlsbD0iI2UxZTFlMSIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDY0IDY0KSIvPjxwYXRoIGQ9Ik03MSAzOS4yVi40YTYzLjYgNjMuNiAwIDAgMSAzMy45NiAxNC41N0w3Ny42OCA0Mi4yNGEyNS41MyAyNS41MyAwIDAgMC02LjctMy4wM3oiIGZpbGw9IiNiZWJlYmUiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA2NCA2NCkiLz48cGF0aCBkPSJNNzEgMzkuMlYuNGE2My42IDYzLjYgMCAwIDEgMzMuOTYgMTQuNTdMNzcuNjggNDIuMjRhMjUuNTMgMjUuNTMgMCAwIDAtNi43LTMuMDN6IiBmaWxsPSIjOTc5Nzk3IiB0cmFuc2Zvcm09InJvdGF0ZSgyMjUgNjQgNjQpIi8+PHBhdGggZD0iTTcxIDM5LjJWLjRhNjMuNiA2My42IDAgMCAxIDMzLjk2IDE0LjU3TDc3LjY4IDQyLjI0YTI1LjUzIDI1LjUzIDAgMCAwLTYuNy0zLjAzeiIgZmlsbD0iIzZlNmU2ZSIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDY0IDY0KSIvPjxwYXRoIGQ9Ik03MSAzOS4yVi40YTYzLjYgNjMuNiAwIDAgMSAzMy45NiAxNC41N0w3Ny42OCA0Mi4yNGEyNS41MyAyNS41MyAwIDAgMC02LjctMy4wM3oiIGZpbGw9IiMzYzNjM2MiIHRyYW5zZm9ybT0icm90YXRlKDMxNSA2NCA2NCkiLz48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgdmFsdWVzPSIwIDY0IDY0OzQ1IDY0IDY0OzkwIDY0IDY0OzEzNSA2NCA2NDsxODAgNjQgNjQ7MjI1IDY0IDY0OzI3MCA2NCA2NDszMTUgNjQgNjQiIGNhbGNNb2RlPSJkaXNjcmV0ZSIgZHVyPSI3MjBtcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZVRyYW5zZm9ybT48L2c+PGc+PGNpcmNsZSBmaWxsPSIjMDAwIiBjeD0iNjMuNjYiIGN5PSI2My4xNiIgcj0iMTIiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiBkdXI9IjcyMG1zIiBiZWdpbj0iMHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBrZXlUaW1lcz0iMDswLjU7MSIgdmFsdWVzPSIxOzA7MSIvPjwvZz48L3N2Zz4=';

  // work / projects
  const work = {
    col1: [
      {
        id: 'termy',
        delay: '1',
        image: 'https://github.com/TheDragonRing/termy/raw/master/termy.gif',
        menu: [
          {
            href: './termy',
            icon: 'fas fa-eye',
            text: 'View'
          },
          {
            href: 'https://github.com/TheDragonRing/termy/archive/master.zip',
            icon: 'fas fa-download',
            text: 'Download'
          },
          {
            href: 'https://github.com/TheDragonRing/termy',
            icon: 'fas fa-code',
            text: 'Code'
          }
        ],
        title: 'Termy',
        desc:
          'An easily customisable web terminal interface built with JavaScript for menus, games and whatever else you can come up with!',
        used: 'JS, jQuery, typed.js',
        init: 'December 2017',
        license: 'MIT License',
        status: 'Active'
      },
      {
        id: 'unumico',
        delay: '5',
        image: 'assets/images/work/unumico.jpg',
        menu: [
          {
            href: './unumico',
            icon: 'fas fa-eye',
            text: 'View'
          },
          {
            href: 'https://github.com/TheDragonRing/unumico/archive/master.zip',
            icon: 'fas fa-download',
            text: 'Download'
          },
          {
            href: 'https://github.com/TheDragonRing/unumico',
            icon: 'fas fa-code',
            text: 'Code'
          }
        ],
        title: 'Unumico',
        desc:
          'This is a small one-page website template that can be used to build simple, but nice, websites for almost anything.',
        used: 'HTML, CSS, FontAwesome, JS, jQuery',
        init: 'April - May 2017',
        license: 'MIT License',
        status: 'Complete'
      },
      {
        id: 'old1',
        delay: '9',
        image: 'assets/images/work/old1.jpg',
        menu: [
          {
            href: './old/1',
            icon: 'fas fa-eye',
            text: 'View'
          }
        ],
        title: 'thedragonring.me v1',
        desc: 'Version 1 of my website. ',
        used: 'HTML, XML, CSS, FontAwesome, JS, jQuery',
        init: 'January 2017',
        license: 'MIT License',
        status: 'Complete'
      }
    ],
    col2: [
      {
        id: 'red-dragon',
        delay: '2',
        image: 'assets/images/work/builds/red-dragon.jpg',
        title: 'Red Dragon',
        desc: 'I like dragons, so I built one. Sadly, he has no tail.',
        used: 'Minecraft: Windows 10 Edition',
        init: 'December 2017',
        license: 'MIT License',
        status: 'Complete'
      },
      {
        id: 'alphahex',
        delay: '6',
        image: 'assets/images/work/alphahex.jpg',
        menu: [
          {
            href: './alphahex',
            icon: 'fas fa-eye',
            text: 'View'
          },
          {
            href:
              'https://github.com/TheDragonRing/alphahex/archive/master.zip',
            icon: 'fas fa-download',
            text: 'Download'
          },
          {
            href: 'https://github.com/TheDragonRing/alphahex',
            icon: 'fas fa-code',
            text: 'Code'
          }
        ],
        title: 'Alphahex',
        desc:
          'This is the first website template I have ever made from scratch. It was mostly a learning experience to see what I could do and add to my skills.',
        used: 'HTML, XML, CSS, FontAwesome, JS, jQuery',
        init: 'January - February 2017',
        license: 'MIT License',
        status: 'Complete'
      },
      {
        id: 'old2',
        delay: '10',
        image: 'assets/images/work/old2.jpg',
        menu: [
          {
            href: './old/2',
            icon: 'fas fa-eye',
            text: 'View'
          }
        ],
        title: 'thedragonring.me v2',
        desc: 'Version 2 of my website. ',
        used: 'HTML, CSS, FontAwesome, JS, jQuery',
        init: 'April - May 2017',
        license: 'MIT License',
        status: 'Complete'
      }
    ],
    col3: [
      {
        id: 'slime',
        delay: '3',
        image: 'assets/images/work/builds/slime.jpg',
        title: 'Slime',
        desc: 'Just a slime wearing a hat in midair.',
        used: 'Minecraft: Windows 10 Edition',
        init: 'February 2018',
        license: 'MIT License',
        status: 'Complete'
      },
      {
        id: 'skin-statue',
        delay: '7',
        image: 'assets/images/work/builds/skin-statue.jpg',
        title: 'Skin Statue',
        desc: 'I was bored, so I built a statue of my Minecraft skin.',
        used: 'Minecraft: Windows 10 Edition',
        init: 'Sometime in 2016 & February 2018',
        license: 'MIT License',
        status: 'Complete'
      }
    ],
    col4: [
      /* {
        id: 'hidecoords',
        delay: '4',
        image: 'assets/images/work/hidecoords.jpg',
        menu: [
          {
            href:
              'https://github.com/TheDragonRing/hidecoords/archive/master.zip',
            icon: 'fas fa-file-archive',
            text: '.ZIP'
          },
          {
            href:
              'https://github.com/TheDragonRing/hidecoords/raw/master/HideCoords.mcaddon',
            icon: 'fas fa-download',
            text: '.MCPACK'
          },
          {
            href: 'https://github.com/TheDragonRing/hidecoords',
            icon: 'fas fa-code',
            text: 'Code'
          }
        ],
        title: 'HideCoords',
        desc:
          "A simple add-on to hide your coordinates - useful if you're on a realm or world with them turned on and you want them off for yourself, but still on for others.",
        used: 'JSON',
        init: 'February 2018',
        license: 'MIT License',
        status: 'Complete'
      }, */
      {
        id: 'fancy-storage',
        delay: '4',
        image: 'assets/images/work/builds/fancy-storage/montage.jpg',
        title: 'Fancy Storage',
        desc:
          'A fancy storage system I made on season 1 of the Quantum Craft realm.',
        used: 'Minecraft: Windows 10 Edition',
        init: 'October - November 2017',
        license: 'MIT License',
        status: 'Complete',
        bottom: `
          <a class="button is-primary is-rounded modal-button" data-target="#fancy-storage .modal">
            More...</a>
          <div class="modal">
            <div class="modal-background" data-close-modal="#fancy-storage .modal"></div>
            <div class="modal-card">
              <section class="modal-card-body">
                <button class="delete" aria-label="close" data-close-modal="#fancy-storage .modal">
                </button>
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/wood.jpg"
                    alt="wood" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/stone.jpg"
                    alt="stone" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/redstone.jpg"
                    alt="redstone" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/valuables.jpg"
                    alt="valuables" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/map.jpg"
                    alt="map room" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/blacksmith.jpg"
                    alt="blacksmith" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/mob.jpg"
                    alt="mob drops" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/farm.jpg"
                    alt="farm" />
                <img src="${loadAnimation}" style="width: 100%"
                    data-src="assets/images/work/builds/fancy-storage/miscellaneous.jpg"
                    alt="miscellaneous" />
              </section>
            </div>
          </div>`
      },
      {
        id: 'fireworks',
        delay: '8',
        image: 'assets/images/work/fireworks.jpg',
        menu: [
          {
            href:
              'https://github.com/TheDragonRing/fireworks/archive/master.zip',
            icon: 'fas fa-file-archive',
            text: '.ZIP'
          },
          {
            href:
              'https://github.com/TheDragonRing/fireworks/raw/master/fireworks.mcaddon',
            icon: 'fas fa-download',
            text: '.MCPACK'
          },
          {
            href: 'https://github.com/TheDragonRing/fireworks',
            icon: 'fas fa-code',
            text: 'Code'
          }
        ],
        title: 'Fireworks',
        desc:
          "We all love fireworks, don't we? And since Minecraft: PE & Win10 Edition didn't have fireworks... I added them! Fire Charges have been replaced with magnificent exploding balls of colour to light up your night sky!",
        used: 'JSON & Adobe Photoshop CC',
        init: 'January - February 2017',
        license: 'MIT License',
        status: 'Archived (outdated)'
      }
    ]
  };
  // generate HTML for each project
  for (const col in work) {
    work[col].forEach(project => {
      let menu = '';
      if (project.menu) {
        project.menu.forEach(
          el =>
            (menu += `<a ${
              el.href ? `href="${el.href}"` : ''
            } class="card-footer-item">
          ${
            el.icon
              ? `<span class="icon is-small">
            <i class="${el.icon}"></i>
          </span>`
              : ''
          }
          ${
            el.text
              ? `<span${el.icon ? ' class="has-icon-left"' : ''}>${
                  el.text
                }</span>`
              : ''
          }
        </a>`)
        );
      }
      document.querySelector(`#${col}`).innerHTML += `<div ${
        project.id ? `id="${project.id}"` : ''
      } class="card with-shadow pop" ${
        project.delay ? `data-pop-delay="${project.delay}"` : ''
      }>
      ${
        project.image
          ? `<div class="card-image">
        <figure class="image">
          <img src="${project.image}">
        </figure>
      </div>`
          : ''
      }
      ${
        project.menu
          ? `<footer class="card-header card-footer">
          ${menu}
      </footer>`
          : ''
      }
      <div class="card-content">
      ${project.title ? `<p class="is-size-4">${project.title}</p>` : ''}
        <div class="content">
          ${project.desc ? `${project.desc} <br>` : ''}
          ${project.used ? `<strong>Used:</strong> ${project.used} <br>` : ''}
          ${
            project.init
              ? `<strong>Initiated:</strong> ${project.init} <br>`
              : ''
          }
          ${
            project.license
              ? `<strong>License:</strong> ${project.license} <br>`
              : ''
          }
          ${
            project.init
              ? `<strong>Status:</strong> ${project.status} <br>`
              : ''
          }
          ${project.bottom ? `${project.bottom} <br>` : ''}
        </div>
      </div>
    </div>
    <br>`;
    });
  }

  // fade out load-message elements
  document.querySelectorAll('.loading').forEach(el => {
    el.classList.add('fadeOut');
    setTimeout(() => {
      el.style.visibility = 'hidden';
    }, 750);
  });

  // animate popping elements
  document.querySelectorAll('.pop').forEach((el, i) => {
    el.style.visibility = 'hidden';
    setTimeout(() => {
      el.style.visibility = 'visible';
      if (el.querySelectorAll('.is-shadow')) {
        el.querySelectorAll('.is-shadow').forEach(elem => {
          elem.style.visibility = 'hidden';
          setTimeout(() => {
            elem.style.visibility = 'visible';
          }, 900);
        });
      }
      el.classList.remove('pop');
      el.classList.add('popped');
    }, (window.matchMedia('(max-width: 1023px)').matches ? i : el.dataset.popDelay || i) * 500);
  });

  // add shadow(s)
  document.querySelectorAll('.with-shadow').forEach(el => {
    const main = document.createElement('div'),
      lesser = document.createElement('div');
    main.setAttribute('class', 'is-shadow is-near is-hidden-mobile');
    lesser.setAttribute('class', 'is-shadow is-far is-hidden-mobile');
    el.prepend(main);
    el.prepend(lesser);
  });

  // modals
  const openModal = el => {
      el = document.querySelector(el);
      el
        .querySelectorAll('img')
        .forEach(img => img.setAttribute('src', img.dataset.src));
      document.documentElement.classList.add('is-clipped');
      el.classList.add('is-active'),
        el.querySelector('.modal-card').classList.add('popped');
      setTimeout(() => {
        el.querySelector('.modal-card').classList.remove('popped');
      }, 751);
    },
    closeModal = el => {
      el = document.querySelector(el);
      document.documentElement.classList.remove('is-clipped');
      el.classList.add('is-active'),
        el.querySelector('.modal-card').classList.add('shrink');
      setTimeout(() => {
        el.classList.remove('is-active'),
          el.querySelector('.modal-card').classList.remove('shrink');
      }, 751);
    };
  document.querySelectorAll('.modal-button').forEach(el => {
    el.addEventListener('click', function() {
      openModal(el.dataset.target);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el =>
    el.addEventListener('click', () => {
      closeModal(el.dataset.closeModal);
    })
  );
  /* if the URL contains #about or #/about, load about page on page load
  if (
    /[^\#]*$/.exec(window.location.href)[0] === 'about' ||
    /[^\#]*$/.exec(window.location.href)[0] === '/about'
  )
    openModal('#about'); */
};
