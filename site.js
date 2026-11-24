// Shared by index.html (English) and afrikaans.html (Afrikaans).
// Text that the scripts put on the page, in both languages.
var STRINGS = {
    en: {
        waGeneral: "Hi Mieke, I'd like to ask about classes for my child.",
        waReading: "Hi Mieke, I'd like to ask about reading classes for my child.",
        waExtra: "Hi Mieke, I'd like to ask about extra classes for my child.",
        waExtraGrade: "Hi Mieke, I'd like to ask about extra classes for my child in Grade ",
        classesFor: ' classes available for Grade ',
        sending: 'Sending…',
        sent: 'Thank you! Your message has been sent. Mieke will be in touch soon.',
        failed: 'Sorry, the message could not be sent. Please WhatsApp or email instead.'
    },
    af: {
        waGeneral: 'Hallo Mieke, ek wil graag navraag doen oor klasse vir my kind.',
        waReading: 'Hallo Mieke, ek wil graag navraag doen oor leesklasse vir my kind.',
        waExtra: 'Hallo Mieke, ek wil graag navraag doen oor ekstra klasse vir my kind.',
        waExtraGrade: 'Hallo Mieke, ek wil graag navraag doen oor ekstra klasse vir my kind in Graad ',
        classesFor: ' klasse beskikbaar vir Graad ',
        sending: 'Besig om te stuur…',
        sent: 'Dankie! Jou boodskap is gestuur. Mieke sal binnekort met jou in verbinding tree.',
        failed: "Jammer, die boodskap kon nie gestuur word nie. Stuur asseblief eerder 'n WhatsApp of e-pos."
    }
};
var T = STRINGS[document.documentElement.lang] || STRINGS.en;

// Notice bar and reply hours come from settings.js. Empty text hides them.
(function () {
    if (typeof SETTINGS === 'undefined') return;
    var lang = STRINGS[document.documentElement.lang] ? document.documentElement.lang : 'en';
    [['notice', 'notice'], ['reply-hours', 'replyHours']].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        var text = (SETTINGS[pair[1]] || {})[lang];
        if (el && text) { el.textContent = text; el.hidden = false; }
    });
})();

// What the visitor has told us so far: which service, and which grade.
var state = { path: '', grade: '' };

// Keep every WhatsApp button's pre-filled message in step with those choices.
function updateWhatsApp() {
    var text = T.waGeneral;
    if (state.path === 'reading') text = T.waReading;
    if (state.path === 'extra') text = T.waExtra;
    if (state.grade && state.path !== 'reading') text = T.waExtraGrade + state.grade.replace('-', '–');
    document.querySelectorAll('a[data-wa]').forEach(function (a) {
        a.href = 'https://wa.me/27649006282?text=' + encodeURIComponent(text);
    });
}

// Mobile menu
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('nav-menu');
    function setOpen(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.addEventListener('click', function () {
        setOpen(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') setOpen(false);
    });
})();

// Reveal sections as they scroll into view, shade the header once the
// page has scrolled, and highlight the current section in the menu.
(function () {
    var header = document.querySelector('.site-header');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('in'); });
        return;
    }
    var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { revealer.observe(el); });

    var links = {};
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(function (a) {
        links[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var link = links[entry.target.id];
            if (link) link.classList.toggle('current', entry.isIntersecting);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (sec) { spy.observe(sec); });
})();

// Path chooser: reading classes or extra classes. Choosing one shows that
// service, hides the other, and pre-selects it in the contact form.
(function () {
    var buttons = document.querySelectorAll('.path');
    var services = document.querySelectorAll('[data-service]');
    var reset = document.getElementById('path-reset');
    var select = document.getElementById('service');

    function setPath(path, scroll) {
        state.path = path;
        services.forEach(function (sec) {
            sec.hidden = !!path && sec.getAttribute('data-service') !== path;
        });
        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', b.getAttribute('data-path') === path ? 'true' : 'false');
        });
        reset.hidden = !path;
        Array.prototype.forEach.call(select.options, function (opt, i) {
            if ((opt.getAttribute('data-path') || '') === path) select.selectedIndex = i;
        });
        updateWhatsApp();
        if (path && scroll) document.getElementById(path).scrollIntoView();
    }

    buttons.forEach(function (b) {
        b.addEventListener('click', function () { setPath(b.getAttribute('data-path'), true); });
    });
    reset.addEventListener('click', function () { setPath('', false); });

    // "Enquire about ..." buttons carry their service into the form.
    document.querySelectorAll('[data-enquire]').forEach(function (a) {
        a.addEventListener('click', function () { setPath(a.getAttribute('data-enquire'), false); });
    });

    // A menu link to a service that is currently hidden brings both back.
    document.querySelectorAll('a[href="#reading"], a[href="#extra"]').forEach(function (a) {
        a.addEventListener('click', function () {
            var target = document.getElementById(a.getAttribute('href').slice(1));
            if (target.hidden) setPath('', false);
        });
    });

    // Changing the form's own dropdown updates the WhatsApp message too.
    select.addEventListener('change', function () {
        state.path = select.options[select.selectedIndex].getAttribute('data-path') || '';
        updateWhatsApp();
    });
})();

// Grade picker (extra classes): highlight the classes that suit the chosen
// grade and carry the grade into the WhatsApp message.
(function () {
    var chips = document.querySelectorAll('.chip');
    var cards = document.querySelectorAll('.card[data-grades]');
    var result = document.getElementById('grade-result');
    function choose(grade) {
        var count = 0;
        cards.forEach(function (card) {
            var g = card.getAttribute('data-grades');
            var match = !grade || g === 'all' || g.split(' ').indexOf(grade) !== -1;
            card.classList.toggle('dim', !match);
            card.classList.toggle('match', !!grade && match);
            if (match) count++;
        });
        chips.forEach(function (chip) {
            chip.setAttribute('aria-pressed', chip.getAttribute('data-grade') === grade ? 'true' : 'false');
        });
        result.textContent = grade ? count + T.classesFor + grade.replace('-', '–') : '';
        state.grade = grade;
        updateWhatsApp();
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var grade = chip.getAttribute('data-grade');
            choose(chip.getAttribute('aria-pressed') === 'true' ? '' : grade);
        });
    });
})();

// Floating WhatsApp button appears once the top of the page has scrolled away.
(function () {
    var fab = document.querySelector('.wa-float');
    function update() { fab.classList.toggle('show', window.scrollY > 420); }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// Send the contact form without leaving the page.
// If this fails for any reason, the form falls back to a normal submit.
(function () {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (!window.fetch || !window.FormData) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        status.className = 'form-status';
        status.textContent = T.sending;
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        }).then(function (res) {
            if (!res.ok) throw new Error('send failed');
            form.reset();
            status.className = 'form-status success';
            status.textContent = T.sent;
        }).catch(function () {
            status.className = 'form-status error';
            status.textContent = T.failed;
        }).then(function () {
            button.disabled = false;
        });
    });
})();
