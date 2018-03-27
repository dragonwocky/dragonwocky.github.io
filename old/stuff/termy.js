/**
 * Termy - An easily customisable web terminal interface built with JavaScript.
 * ============================================================================
 * Copyright (c) 2017 - 2018 TheDragonRing <thedragonring.bod@gmail.com>, under the MIT License.
 */

// Custom settings and commands
const custom = {
  settings: {
    // user and host names
    // below settings will set it to visitor@site.com
    // if the window hostname is undefined, it'll show as visitor@example.domain
    user: 'visitor',
    host: window.location.hostname || 'example.domain',
    // colour of the ~$
    promptColour: '#00f',
  },
  commands: {
    // command name - STRING - e.g. hello
    time: {
      // command description - STRING - e.g. 'says hello.'
      description: 'displays the current time.',
      // run - FUNCTION - e.g. (args) => { $(`${container} .${commandCount - 1}`).append('Hello!') }
      run: (args) => {
        // Get what hour of the day it is.
        const date = new Date(),
          // Get what minute of the hour it is.
          m = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes(),
          // Get what second of the minute it is.
          s = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds(),
          // Get what meridiem of the day it is.
          meridiem = (date.getHours() > 11) ? 'PM' : 'AM',
          // Get the the date in dd/mm/yyyy format.
          dd = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate(),
          mm = (date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
          yyyy = date.getFullYear(),
          // Get the user's timezone.
          timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
          // Get the user's timezone's offset from GMT.
          hourOffset = (parseInt(Math.abs(date.getTimezoneOffset() / 60)) < 10)
            ? '0' + parseInt(Math.abs(date.getTimezoneOffset() / 60))
            : parseInt(Math.abs(date.getTimezoneOffset() / 60)),
          minOffset = (Math.abs(date.getTimezoneOffset() % 60) < 10)
            ? '0' + Math.abs(date.getTimezoneOffset() % 60)
            : Math.abs(date.getTimezoneOffset() % 60),
          gmt = (date.getTimezoneOffset() < 0)
            ? '+' + hourOffset + ':' + minOffset
            : ((date.getTimezoneOffset() > 0) ? '-' + hourOffset + ':' + minOffset : '00:00');
        // Get what hour of the day it is.
        h = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
        if (h === 0) h = 12;
        // Display time details to user.
        $(`${container} .${commandCount - 1}`).append(`${h}:${m}:${s} ${meridiem},
        ${dd}/${mm}/${yyyy}, ${timezone} (GMT${gmt})`);
      }
    },
    // command name - STRING - e.g. hello
    '8ball': {
      // command description - STRING - e.g. 'says hello.'
      description: 'gives a random response to the input',
      // arguments to show as usage - STRING - e.g. '<required> [optional]'
      usage: '&lt;input&gt;',
      // run - FUNCTION - e.g. (args) => { $(`${ container }.${ commandCount - 1 }`).append('Hello!') }
      run: (args) => {
        if (args[0]) {
          let answers = [
            'Who cares?',
            'I\'m not sure... try asking again later!',
            'I\'m not telling! Ask me again and I might consider it...',
            'Uhhh... do you really want to know?',
            'No. Definitely not.',
            'Dot. Definitely dot.',
            'There\'s an easy answer to that - nope!',
            'I doubt it.',
            'Of course!',
            'Yeah...',
            'It is most likely that that is so.',
            'Is fire hot?'
          ],
            // reply with random answer
            x = Math.floor(Math.random() * answers.length);
          $(`${container} .${commandCount - 1}`)
            .append(`<strong>Q:</strong> ${$.makeArray(args).join(' ')}<br><strong>A:</strong> ${answers[x]}`);
        } else {
          $(`${container} .${commandCount - 1}`)
            .append('<span style="color: #f00">ERROR</span>: this command\
          should be executed as <i>8ball &lt;input&gt;</i>');
          command = '';
        }
      }
    },
    // command name - STRING - e.g. hello
    google: {
      // command description - STRING - e.g. 'says hello.'
      description: 'googles the command arguments.',
      // arguments to show as usage - STRING - e.g. '<required> [optional]'
      usage: '&lt;query&gt;',
      // whether or not the command uses Typed.js and prepares the prompt for
      // the next command itself - BOOLEEN - e.g. true
      typed: true,
      // run - FUNCTION - e.g. (args) => { $(`${ container }.${ commandCount - 1 }`).append('Hello!') }
      run: (args) => {
        if (args[0]) {
          exit(`https://google.com/search?q=${args.join('+')}`);
        } else {
          $(`${container} .${commandCount - 1}`)
            .append('<span style="color: #f00">ERROR</span>: this command\
          should be executed as <i>google &lt;query&gt;</i>');
          command = '';
        }
      }
    },
    // command name - STRING - e.g. hello
    sudo: {
      // whether or not to hide the command in the help menu - BOOLEEN - e.g. true
      hidden: true,
      // run - FUNCTION - e.g. (args) => { $(`${ container }.${ commandCount - 1 }`).append('Hello!') }
      run: (args) => {
        if (args.join(' ') === 'make me a sandwich') {
          // make a sandwhich
          $(`${container} .${commandCount - 1}`)
            .append(`Here you go: <i class="em em-sandwich"></i>`);
        } else {
          // pretend the command doesn't exist
          $(`${container} .${commandCount - 1}`)
            .append(`<span style="color: #f00">ERROR</span>: ${command}: command not found`);
        }
      }
    },
    // command name - STRING - e.g. hello
    make: {
      // whether or not to hide the command in the help menu - BOOLEEN - e.g. true
      hidden: true,
      // run - FUNCTION - e.g. (args) => { $(`${ container }.${ commandCount - 1 }`).append('Hello!') }
      run: (args) => {
        if (args.join(' ') === 'me a sandwich') {
          // refuse to make a sandwich
          $(`${container} .${commandCount - 1}`)
            .append(`No way. Do it yourself!`);
        } else {
          // pretend the command doesn't exist
          $(`${container} .${commandCount - 1}`)
            .append(`<span style="color: #f00">ERROR</span>: ${command}: command not found`);
        }
      }
    },
  }
}

// Minified Termy
let command, commandCount = 0, loggedIn = !0; const data = {}, container = document.getElementsByClassName('termy').length ? '.termy' : 'body', defaults = { settings: { user: 'visitor', host: window.location.hostname || 'example.domain', promptColour: '#00f' }, commands: { help: { description: 'displays all available commands.', aliases: ['?'], run: () => { let a = underline('Available Commands:', '-'); Object.getOwnPropertyNames(data.commands).forEach(e => { data.commands[e].hidden || (a += `<br>${e}: ${data.commands[e].description}`) }), $(`${container} .${commandCount - 1}`).append(a) } }, man: { description: 'shows detailed information about commands.', usage: '&lt;command - run <i>help</i> to see all available&gt;', run: a => { let e = !1; Object.getOwnPropertyNames(data.commands).forEach(i => { data.commands[i].hidden || i !== a[0] || (e = underline('Manual: ' + i, '-'), data.commands[i].description && (e += `<br>DESCRIPTION: ${data.commands[i].description}`), data.commands[i].usage && (e += `<br>USAGE: ${data.commands[i].usage}`), data.commands[i].info && (e += `<br>INFO: ${data.commands[i].info}`)) }), e ? $(`${container} .${commandCount - 1}`).append(e) : $(`${container} .${commandCount - 1}`).append('<span style="color: #f00">ERROR</span>: this command should be executed as <i>man &lt;command&gt;</i>: to see available commands run <i>help</i>') } }, clear: { description: 'removes all previously run commands from the terminal.', run: () => { $(`${container} .terminal`).empty() } }, exit: { description: 'logs out, to execute commands once again the page must be reloaded.', usage: 'exit', typed: !0, run: () => { exit() } } } }; window.onload = () => { load() }; const load = () => { const a = document.createElement('style'); if (a.setAttribute('id', 'termyStyles'), a.setAttribute('type', 'text/css'), document.head.appendChild(a), document.getElementById('termyStyles').innerHTML = `@import url(https://afeld.github.io/emoji-css/emoji.css);@import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono);${container}{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background:#000;font-family:"Ubuntu Mono",monospace;padding:1rem}${container},${container} a{color:#fff;font-size:1.1rem;max-width:100%;overflow-wrap:break-word;overflow-x:hidden}${container} a{text-decoration:none;font-weight:700}${container} p{margin:0}${container} .cmd-input{margin-top:-1.225rem;font-size:1.1rem;font-family:"Ubuntu Mono",monospace;color:#fff;background:none;border:none;outline:none;padding:none;margin:none;width:100%;resize:none}${container} .caret{height:3px;width:10px;margin-left:5px;margin-bottom:-1px;background:#fff;display:inline-block}`, 'body' == container && (document.body.innerHTML = '<div class="init"></div><div class="terminal"></div>'), '.' === container.charAt(0)) { const e = document.getElementsByClassName(container.slice(1)); for (let i = 0; i < e.length; i++)e[i].innerHTML = '<div class="init"></div><div class="terminal"></div>' } '#' === container.charAt(0) && (document.getElementsById(container.slice(1)).innerHTML = '<div class="init"></div><div class="terminal"></div>'); try { $ } catch (e) { if ('body' == container && (document.body.innerHTML = '<span style="color: #f00">ERROR</span>: missing dependency: <a href="http://jquery.com/">jQuery</a><br>'), '.' === container.charAt(0)) { const i = document.getElementsByClassName(container.slice(1)); for (let l = 0; l < i.length; l++)i[l].innerHTML = '<span style="color: #f00">ERROR</span>: missing dependency: <a href="http://jquery.com/">jQuery</a><br>' } '#' === container.charAt(0) && (document.getElementsById(container.slice(1)).innerHTML = '<span style="color: #f00">ERROR</span>: missing dependency: <a href="http://jquery.com/">jQuery</a><br>') } try { Typed } catch (e) { if ('body' == container && (document.body.innerHTML = `${document.body.innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="https://mattboldt.com/typed.js/">Typed.js</a><br>`), '.' === container.charAt(0)) { const i = document.getElementsByClassName(container.slice(1)); for (let l = 0; l < i.length; l++)i[l].innerHTML = `${i[l].innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="https://mattboldt.com/typed.js/">Typed.js</a><br>` } '#' === container.charAt(0) && (document.getElementsById(container.slice(1)).innerHTML = `${document.getElementsById(container.slice(1)).innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="https://mattboldt.com/typed.js/">Typed.js</a><br>`) } try { autosize } catch (e) { if ('body' == container && (document.body.innerHTML = `${document.body.innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="http://www.jacklmoore.com/autosize/">Autosize</a><br>`), '.' === container.charAt(0)) { const i = document.getElementsByClassName(container.slice(1)); for (let l = 0; l < i.length; l++)i[l].innerHTML = `${i[l].innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="http://www.jacklmoore.com/autosize/">Autosize</a><br>` } '#' === container.charAt(0) && (document.getElementsById(container.slice(1)).innerHTML = `${document.getElementsById(container.slice(1)).innerHTML} <span style="color: #f00">ERROR</span>: missing dependency: <a href="http://www.jacklmoore.com/autosize/">Autosize</a><br>`) } try { $.extend(!0, data, defaults, custom), $ && Typed && autosize && initialize() } catch (e) { } }, initialize = () => { const a = `<span style="color: #0f0">Welcome to ${data.settings.host}!</span><br><br>>> Scanning for data...<br>>> Loading and configuring Termy...<br><span style="margin-left:28px">==================================</span><br>>> Done!<br><br>This webpage is running <a href="https://github.com/TheDragonRing/termy">Termy v1.0</span>,<br>by <a href="https://thedragonring.me">TheDragonRing</a>, under the <a href="https://opensource.org/licenses/MIT">MIT License</a>.<br><br>Run <i>help</i> to see available commands.<br>`; new Typed(`${container} .init`, { strings: [a], typeSpeed: -100, showCursor: !1, onComplete: () => { e() } }); const e = () => { displayPrefix(), $(container).keyup(i => { if (loggedIn) { const l = i.which; if (13 === l) { if (i.preventDefault(), command = $(`${container} .cmd-input`).val().trim(), command) { $(`${container} .cmd-input`).replaceWith(`<span>${command}</span><br>`); let m = command.split(' '); m = m.filter(p => '' !== p), command = m[0].toLowerCase(); let n = []; if (Object.getOwnPropertyNames(data.commands).forEach(p => { n.push(p) }), -1 === n.indexOf(command)) $(`${container} .${commandCount - 1}`).append(`<span style="color: #f00">ERROR</span>: ${command}: command not found`); else { m.shift(); try { data.commands[command].run(m) } catch (p) { $(`${container} .${commandCount - 1}`).append(`<span style="color: #f00">ERROR</span>: ${command}: an error occured while running this command: check the console for more info`), console.log(p) } $(container).scrollTop($(container).height()) } const o = []; Object.getOwnPropertyNames(data.commands).forEach(p => { data.commands[p].typed && o.push(p) }), -1 === o.indexOf(command) && (command = '', displayPrefix()) } return !1 } } }) }; $(document.getElementsByClassName('termy').length ? '.termy' : document).click(() => { $(`${container} .cmd-input`).focus() }) }, displayPrefix = () => { $(`${container} .terminal`).append(`<p class="${commandCount}"><span class="host"><span style="color: #0f0">${data.settings.user}@${data.settings.host}</span>:<span style="color: ${data.settings.promptColour}">~$</span></span> <textarea class="cmd-input" data-gramm="false"></textarea></p>`), commandCount++ , $(`${container} .cmd-input`).css('textIndent', `${$('.host').width() + 6.5}px`), autosize($(`${container} .cmd-input`)), $(`${container} .cmd-input`).focus(), $(container).scrollTop($(container).height()) }, underline = (a, e) => { let i = ''; for (let l = 0; l < a.length; l++)i += e; return `${a}<br>${i}` }, exit = a => { loggedIn = !1, $(container).unbind('keyup'), $(container).append('<div class="exit"></div>'); let e = `<br>>> Logged out<br>>> Closed connection to ${data.settings.host}<br>${a ? 'Goodbye. Thank you for using Termy.' : 'To use Termy once again, <a href="">reload the page</a>.'}`; $(container).scrollTop($(container).height()), new Typed(`${container} .exit`, { strings: [e], typeSpeed: -100, showCursor: !1, onComplete: function () { a && (window.location.href = a) } }) };
