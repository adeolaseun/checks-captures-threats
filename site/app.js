/* Interface: lessons, puzzles and the sparring board. */
(function () {
  'use strict';
  var C = Content, E = Engine, app = document.getElementById('app');
  var NAME = E.NAME, viewToken = 0;
  function strip(s) { return s.replace(/[+#!?]/g, ''); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pcSet(set, color, type) { return '<svg class="pc ' + color + '" viewBox="0 0 45 45" aria-hidden="true"><use href="#' + (set === 'club' ? 'pc' : set) + '-' + type + '"/></svg>'; }
  function pc(color, type) { return pcSet(S.set.pieces || 'pebble', color, type); }
  /* A row of piece sets to choose from. onPick runs after the choice is saved. */
  function piecePicker(onPick) {
    var box = el('div', 'sets'); box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', 'Piece design');
    PieceSets.forEach(function (ps) {
      var on = (S.set.pieces || 'pebble') === ps.id;
      var b = el('button', 'setcard' + (on ? ' on' : ''), '<span class="swatch"><i class="l">' + pcSet(ps.id, 'w', 'k') + '</i><i class="d">' + pcSet(ps.id, 'w', 'n') + '</i><i class="d">' + pcSet(ps.id, 'b', 'q') + '</i><i class="l">' + pcSet(ps.id, 'b', 'p') + '</i></span><span class="nm">' + ps.name + '</span><span class="nt">' + ps.note + '</span>');
      b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.addEventListener('click', function () { if (S.set.pieces === ps.id) return; S.set.pieces = ps.id; save(); onPick(); });
      box.appendChild(b);
    });
    return box;
  }

  var LESSONS = [];
  C.UNITS.forEach(function (u, ui) { u.lessons.forEach(function (l) { l.unit = u.title; l.unitNo = ui + 1; l.no = LESSONS.length + 1; LESSONS.push(l); }); });

  // ---------------- Progress: this browser first, the Claude account when available ----------------
  var KEY = 'cct-progress-v1';
  var S = { lessons: {}, puzzles: {}, play: null, set: { level: 2, color: 'w', guard: true, threats: false, pieces: 'pebble', pv: 3 }, t: 0 };
  var remote = { ref: null, busy: false, dirty: false, timer: 0, ok: false };

  function merge(o) {
    if (!o || typeof o !== 'object') return;
    Object.keys(o.lessons || {}).forEach(function (k) { S.lessons[k] = true; });
    Object.keys(o.puzzles || {}).forEach(function (k) { var a = S.puzzles[k], b = o.puzzles[k]; if (b && (!a || (b.clean && !a.clean))) S.puzzles[k] = { done: true, clean: !!b.clean }; });
    if ((o.t || 0) > (S.t || 0)) {
      if (o.set) { ['level', 'color', 'guard', 'threats', 'pieces'].forEach(function (k) { if (k in o.set) S.set[k] = o.set[k]; }); if (o.set.pv !== 3) S.set.pieces = 'pebble'; }
      if (o.play && C.DRILLS[o.play.drill] && Array.isArray(o.play.moves)) S.play = o.play;
      S.t = o.t;
    }
  }
  function writeLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: progress lasts for this visit */ } }
  function save() {
    S.t = Date.now(); writeLocal();
    if (remote.ref) { clearTimeout(remote.timer); remote.timer = setTimeout(push, 1500); }
  }
  function push() {
    if (!remote.ref) return;
    if (remote.busy) { remote.dirty = true; return; }
    remote.busy = true;
    remote.ref.set(JSON.parse(JSON.stringify(S))).then(function () { remote.ok = true; }, function () { remote.ok = false; }).then(function () {
      remote.busy = false; syncLabel();
      if (remote.dirty) { remote.dirty = false; push(); }
    });
  }
  function initRemote() {
    var c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    Promise.all([c.use('db'), c.use('user')]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) return;
      return user.id().then(function (id) {
        if (!id) return;
        var ref = db.doc('data/users/' + id + '/progress');
        return ref.get().then(function (snap) {
          var localT = S.t, remoteT = 0;
          if (snap.exists) { var d = JSON.parse(JSON.stringify(snap.data() || {})); remoteT = d.t || 0; merge(d); writeLocal(); }
          remote.ref = ref; remote.ok = true; syncLabel();
          if (localT > remoteT) push();
          var hsh = location.hash.slice(1);
          if (snap.exists && (hsh === '' || hsh === 'learn' || hsh === 'puzzles' || (remoteT > localT && hsh.indexOf('play') === 0))) route();
        });
      });
    }).catch(function () { syncLabel(); });
  }
  var foot = el('footer', 'foot');
  foot.style.maxWidth = '1040px'; foot.style.margin = '0 auto 28px'; foot.style.padding = '12px 16px 0';
  foot.innerHTML = '<span id="sync"></span><button type="button" id="reset">Reset progress</button>';
  document.body.appendChild(foot);
  function syncLabel() { document.getElementById('sync').textContent = remote.ref && remote.ok ? 'Progress is saved to your Claude account.' : 'Progress is saved in this browser.'; }
  var resetArmed = 0;
  document.getElementById('reset').addEventListener('click', function () {
    var b = this;
    if (Date.now() - resetArmed > 4000) { resetArmed = Date.now(); b.textContent = 'Tap again to erase everything'; setTimeout(function () { b.textContent = 'Reset progress'; }, 4000); return; }
    S.lessons = {}; S.puzzles = {}; S.play = null; resetArmed = 0; b.textContent = 'Reset progress'; save(); location.hash = '#learn'; route();
  });

  // ---------------- Board ----------------
  function Board(host, mini) {
    var self = this;
    this.mini = !!mini; this.flip = null; this.sel = null; this.targets = []; this.sq = {}; this.o = {}; this.promo = null;
    this.el = el('div', 'board'); host.appendChild(this.el);
    if (!mini) {
      this.el.addEventListener('click', function (ev) { self.click(ev); });
      // Phones: act on the touch itself and cancel the browser's follow-up, so two quick taps never read as double-tap zoom.
      var t0 = null;
      this.el.addEventListener('touchstart', function (ev) { t0 = ev.touches.length === 1 ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY } : null; }, { passive: true });
      this.el.addEventListener('touchend', function (ev) {
        var t = ev.changedTouches[0];
        if (!t0 || !t || ev.touches.length || Math.abs(t.clientX - t0.x) > 12 || Math.abs(t.clientY - t0.y) > 12) { t0 = null; return; }
        t0 = null;
        var hit = document.elementFromPoint(t.clientX, t.clientY);
        if (!hit || !self.el.contains(hit) || hit.closest('.promo')) return;
        ev.preventDefault();
        self.click({ target: hit });
      }, { passive: false });
      ['gesturestart', 'dblclick'].forEach(function (n) { self.el.addEventListener(n, function (ev) { ev.preventDefault(); }); });
    }
  }
  Board.prototype.build = function (flip) {
    this.flip = flip; this.el.innerHTML = ''; this.sq = {};
    for (var vr = 0; vr < 8; vr++) for (var vc = 0; vc < 8; vc++) {
      var f = flip ? 7 - vc : vc, r = flip ? vr + 1 : 8 - vr, name = 'abcdefgh'[f] + r;
      var b = el(this.mini ? 'div' : 'button', 'sq');
      if (!this.mini) b.type = 'button';
      b.dataset.sq = name; b.dataset.base = 'sq ' + ((f + r) % 2 === 1 ? 'dark' : 'light');
      b.dataset.co = (vr === 7 ? '<span class="co f">' + 'abcdefgh'[f] + '</span>' : '') + (vc === 0 ? '<span class="co r">' + r + '</span>' : '');
      this.el.appendChild(b); this.sq[name] = b;
    }
    this.ov = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.ov.setAttribute('class', 'ov'); this.ov.setAttribute('viewBox', '0 0 80 80');
    this.el.appendChild(this.ov);
  };
  Board.prototype.show = function (game, o) {
    this.game = game; this.o = o || {};
    if (this.flip !== !!this.o.flip) this.build(!!this.o.flip);
    this.sel = null; this.targets = []; this.closePromo(); this.paint();
  };
  Board.prototype.xy = function (name) {
    var f = name.charCodeAt(0) - 97, r = +name[1] - 1;
    return [(this.flip ? 7 - f : f) * 10 + 5, (this.flip ? r : 7 - r) * 10 + 5];
  };
  Board.prototype.paint = function () {
    var g = this.game, o = this.o, self = this, marks = o.marks || {}, check = null, tmap = {}, flags = {};
    if (g.in_check()) { var b = g.board(); for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) if (b[r][c] && b[r][c].type === 'k' && b[r][c].color === g.turn()) check = 'abcdefgh'[c] + (8 - r); }
    this.targets.forEach(function (m) { tmap[m.to] = m; });
    (o.flags || []).forEach(function (x) { flags[x.square] = x.color === o.me ? 'mine' : 'theirs'; });
    Object.keys(this.sq).forEach(function (name) {
      var e = self.sq[name], p = g.get(name), cls = e.dataset.base, inner = self.mini ? '' : e.dataset.co;
      if (o.last && (o.last.from === name || o.last.to === name)) cls += ' last';
      if (o.last && o.last.to === name && o.animate) cls += ' arrive';
      if (self.sel === name) cls += ' sel';
      if (check === name) cls += ' incheck';
      if (marks.sq && marks.sq.indexOf(name) >= 0) cls += ' mark';
      if (o.hintSq && o.hintSq.indexOf(name) >= 0) cls += ' hint';
      if (p) inner += pc(p.color, p.type);
      if (tmap[name]) inner += p || tmap[name].flags.indexOf('e') >= 0 ? '<span class="ring"></span>' : '<span class="dot"></span>';
      if (flags[name]) inner += '<span class="flag ' + flags[name] + '"></span>';
      e.className = cls; e.innerHTML = inner;
      if (!self.mini) e.setAttribute('aria-label', name + (p ? ' ' + (p.color === 'w' ? 'white ' : 'black ') + NAME[p.type] : ''));
    });
    o.animate = false;
    var arrows = (marks.arrows || []).concat(o.hintArrow ? [o.hintArrow] : []), svg = '';
    arrows.forEach(function (a) {
      var p1 = self.xy(a[0]), p2 = self.xy(a[1]), dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, ex = p2[0] - ux * 3.2, ey = p2[1] - uy * 3.2, sx = p1[0] + ux * 2.5, sy = p1[1] + uy * 2.5;
      var hx = ex - ux * 2.6, hy = ey - uy * 2.6, px = -uy * 2, py = ux * 2;
      var head = (ex + ux * 1.4) + ',' + (ey + uy * 1.4) + ' ' + (hx + px) + ',' + (hy + py) + ' ' + (hx - px) + ',' + (hy - py);
      svg += '<g opacity=".92"><line x1="' + sx + '" y1="' + sy + '" x2="' + hx + '" y2="' + hy + '" stroke="#16241E" stroke-width="2.6" stroke-linecap="round"/><polygon points="' + head + '" fill="#F2B705" stroke="#16241E" stroke-width=".7" stroke-linejoin="round"/><line x1="' + sx + '" y1="' + sy + '" x2="' + hx + '" y2="' + hy + '" stroke="#F2B705" stroke-width="1.5" stroke-linecap="round"/></g>';
    });
    this.ov.innerHTML = svg;
  };
  Board.prototype.closePromo = function () { if (this.promo) { this.promo.remove(); this.promo = null; } };
  Board.prototype.click = function (ev) {
    var self = this, o = this.o, g = this.game;
    if (this.promo) { if (!ev.target.closest('.promo')) { this.closePromo(); this.paint(); } return; }
    var t = ev.target.closest('.sq'); if (!t || !o.movable || g.turn() !== o.movable) return;
    var name = t.dataset.sq;
    if (this.sel) {
      var hit = this.targets.filter(function (m) { return m.to === name; });
      if (hit.length) {
        var from = this.sel; this.sel = null; this.targets = [];
        if (hit[0].promotion) {
          this.paint();
          this.promo = el('div', 'promo');
          ['q', 'r', 'b', 'n'].forEach(function (k) {
            var b = el('button', '', pc(hit[0].color, k)); b.type = 'button'; b.setAttribute('aria-label', 'Promote to ' + NAME[k]);
            b.addEventListener('click', function (e2) { e2.stopPropagation(); self.closePromo(); if (self.onMove) self.onMove(from, name, k); });
            self.promo.appendChild(b);
          });
          this.el.appendChild(this.promo);
        } else { this.paint(); if (this.onMove) this.onMove(from, name); }
        return;
      }
    }
    var p = g.get(name);
    if (p && p.color === o.movable && name !== this.sel) { this.sel = name; this.targets = g.moves({ square: name, verbose: true }); }
    else { this.sel = null; this.targets = []; }
    this.paint();
  };

  function sideName(c) { return c === 'w' ? 'White' : 'Black'; }
  function turnChip(c, extra) { return '<span class="chip ' + c + '"></span>' + sideName(c) + ' to move' + (extra ? ' · ' + extra : ''); }

  // ---------------- Trainer: runs a list of steps for a lesson or a puzzle ----------------
  function trainer(cfg) {
    var token = viewToken, steps = cfg.steps, i = 0, game = null, flip = false, last = null, solved = false, lock = false;
    var misses = 0, hints = 0, hintLevel = 0, hintSq = null, hintArrow = null;
    app.innerHTML = '<div class="crumb"><a href="' + cfg.back + '">&larr; ' + cfg.backLabel + '</a><span class="where">' + cfg.where + '</span><div class="pips" aria-hidden="true"></div></div>' +
      '<div class="stage"><div class="bwrap"></div><div class="panel"><div class="turn"></div><p class="say"></p><p class="ask"></p><div class="fb" role="status"></div><div class="row actions"></div></div></div>';
    var q = function (s) { return app.querySelector(s); };
    var board = new Board(q('.bwrap')), fb = q('.fb'), actions = q('.actions');
    function setFb(kind, html) { fb.className = 'fb' + (kind ? ' ' + kind : ''); fb.innerHTML = html || ''; }
    function draw(animate) {
      var st = steps[i];
      board.show(game, { flip: flip, movable: st.solve && !solved && !lock ? game.turn() : null, marks: solved ? null : st.marks, last: last, hintSq: hintSq, hintArrow: hintArrow, animate: animate });
    }
    function solution() {
      var st = steps[i], ms = game.moves({ verbose: true }), found = null;
      st.solve.some(function (x) {
        found = ms.filter(function (m) { if (x === '#') { game.move(m); var mate = game.in_checkmate(); game.undo(); return mate; } return strip(m.san) === strip(x); })[0];
        return !!found;
      });
      return found;
    }
    function load() {
      var st = steps[i];
      if (!st.cont || !game) { game = new Chess(st.fen); flip = game.turn() === 'b'; last = null; }
      solved = !st.solve; lock = false; hintLevel = 0; hintSq = null; hintArrow = null;
      var pips = ''; for (var k = 0; k < steps.length; k++) pips += '<i class="' + (k < i ? 'on' : k === i ? 'cur' : '') + '"></i>';
      q('.pips').innerHTML = pips;
      q('.turn').innerHTML = st.solve ? turnChip(game.turn(), 'you are ' + sideName(game.turn())) : 'Read the position';
      q('.say').innerHTML = st.text || '';
      q('.ask').textContent = st.ask || (st.solve ? (i === 0 && cfg.goal ? cfg.goal + '. ' + sideName(game.turn()) + ' to play.' : 'Keep going.') : '');
      setFb('', '');
      actions.innerHTML = '';
      if (st.solve) { var hb = el('button', 'btn small', 'Hint'); hb.type = 'button'; hb.addEventListener('click', hint); actions.appendChild(hb); }
      else nextButton();
      draw(false);
    }
    function nextButton() {
      var st = steps[i], isLast = i === steps.length - 1;
      actions.innerHTML = '';
      var nb = el('button', 'btn primary', isLast ? cfg.finishLabel : 'Continue'); nb.type = 'button';
      nb.addEventListener('click', function () { if (isLast) finish(); else { i++; load(); } });
      actions.appendChild(nb);
      if (st.drill) { var d = el('a', 'btn', 'Practise this against the bot'); d.href = '#play-' + st.drill; actions.appendChild(d); }
      nb.focus({ preventScroll: true });
    }
    function advance() {
      // Puzzles flow straight into the next move; lessons wait so the explanation can be read.
      if (cfg.auto && i < steps.length - 1) { lock = true; setTimeout(function () { if (token !== viewToken) return; i++; load(); }, 650); }
      else nextButton();
    }
    function hint() {
      if (solved) return;
      var st = steps[i], sol = solution(); if (!sol) return;
      hintLevel++; hints++;
      if (hintLevel === 1) { hintSq = [sol.from]; setFb('note', st.hint || 'Look at your ' + NAME[sol.piece] + ' on ' + sol.from + '.'); }
      else { hintArrow = [sol.from, sol.to]; setFb('note', 'Play <span class="mono">' + sol.san + '</span>.'); }
      draw(false);
    }
    board.onMove = function (from, to, promo) {
      if (solved || lock) return;
      var st = steps[i], mv = game.move({ from: from, to: to, promotion: promo || 'q' });
      if (!mv) { draw(false); return; }
      var s = strip(mv.san), wantsMate = st.solve.indexOf('#') >= 0;
      var ok = st.solve.some(function (x) { return x === '#' ? game.in_checkmate() : strip(x) === s; });
      if (ok) {
        solved = true; last = { from: from, to: to }; hintSq = null; hintArrow = null;
        setFb('good', '<b class="g">' + mv.san + '</b>' + (st.done || (game.in_checkmate() ? 'Checkmate.' : 'Correct.')));
        if (st.reply) {
          lock = true; draw(true);
          setTimeout(function () {
            if (token !== viewToken) return;
            var r = game.moves({ verbose: true }).filter(function (m) { return strip(m.san) === strip(st.reply); })[0];
            if (r) { game.move(r); last = { from: r.from, to: r.to }; fb.innerHTML += ' <span class="muted">' + sideName(r.color) + ' answers <span class="mono">' + r.san + '</span>.</span>'; }
            lock = false; draw(true); advance();
          }, 700);
        } else { draw(true); advance(); }
        return;
      }
      var msg = st.wrong && st.wrong[s];
      if (!msg) {
        if (game.in_stalemate()) msg = 'Stalemate. The other king has no legal move and is not in check, so that is a draw.';
        else if (wantsMate && game.in_check()) msg = 'That is check, but the king has an answer. Find the check with no answer.';
        else msg = 'Not this one. Try again, or take a hint.';
      }
      game.undo(); misses++;
      setFb('bad', '<b class="g">' + mv.san + '</b>' + msg);
      draw(false);
    };
    function finish() {
      q('.pips').innerHTML = steps.map(function () { return '<i class="on"></i>'; }).join('');
      q('.turn').innerHTML = ''; q('.say').innerHTML = ''; q('.ask').textContent = ''; setFb('', '');
      actions.innerHTML = '';
      cfg.onDone({ misses: misses, hints: hints }, q('.say'), q('.ask'), actions);
      board.show(game, { flip: flip, movable: null, last: last });
    }
    load();
  }

  // ---------------- Learn ----------------
  function home() {
    var doneN = LESSONS.filter(function (l) { return S.lessons[l.id]; }).length;
    var pzN = C.PUZZLES.filter(function (p) { return S.puzzles[p.id]; }).length;
    var next = LESSONS.filter(function (l) { return !S.lessons[l.id]; })[0];
    var html = '<section class="hero"><div><h1>Before every move, ask three questions.</h1>' +
      '<p class="lede">What can I check? What can I capture? What is being threatened? This course builds that habit from the rules upward: ' + LESSONS.length + ' short lessons on a live board, puzzles to test them, and a sparring bot that stops you before you blunder.</p>' +
      '<div class="tally"><div><b>' + doneN + '/' + LESSONS.length + '</b>lessons</div><div><b>' + pzN + '/' + C.PUZZLES.length + '</b>puzzles</div></div></div>';
    if (next) html += '<div class="nextcard"><div class="mini"></div><div><div class="eyebrow">' + (doneN ? 'Next lesson' : 'Start here') + ' · ' + next.no + ' of ' + LESSONS.length + '</div><h2>' + next.title + '</h2><p>' + next.blurb + '</p><a class="btn primary" href="#lesson-' + next.id + '">' + (doneN ? 'Continue' : 'Start') + '</a></div></div>';
    else html += '<div class="nextcard"><div class="mini"></div><div><div class="eyebrow">Course complete</div><h2>Now use it in games</h2><p>Every lesson is done. Play the bot with blunder check off and see how many moves you can go without a question mark.</p><a class="btn primary" href="#play">Play</a></div></div>';
    html += '</section><section class="unit" id="pieces-pick"><div class="unit-h"><span class="n">Your set</span><h2>Pieces</h2></div><div class="pickhost"></div></section>';
    C.UNITS.forEach(function (u, ui) {
      html += '<section class="unit"><div class="unit-h"><span class="n">Part ' + (ui + 1) + '</span><h2>' + u.title + '</h2></div><ul class="lessons">';
      u.lessons.forEach(function (l) {
        var st = S.lessons[l.id] ? '<span class="pill done">Done</span>' : (next && next.id === l.id ? '<span class="pill next">Next</span>' : '<span class="pill">' + l.steps.length + ' steps</span>');
        html += '<li><a href="#lesson-' + l.id + '"><span class="num">' + (l.no < 10 ? '0' : '') + l.no + '</span><span><span class="t">' + l.title + '</span><br><span class="b">' + l.blurb + '</span></span>' + st + '</a></li>';
      });
      html += '</ul></section>';
    });
    app.innerHTML = html;
    var fen = next ? next.steps[0].fen : C.START, g = new Chess(fen);
    new Board(app.querySelector('.mini'), true).show(g, { flip: g.turn() === 'b' });
    app.querySelector('.pickhost').appendChild(piecePicker(function () { var y = window.scrollY; home(); window.scrollTo(0, y); }));
  }

  function lesson(id) {
    var l = LESSONS.filter(function (x) { return x.id === id; })[0];
    if (!l) { home(); return; }
    trainer({
      steps: l.steps, back: '#learn', backLabel: 'Lessons', where: 'Part ' + l.unitNo + ' · ' + l.title, finishLabel: 'Finish lesson',
      onDone: function (stat, say, ask, actions) {
        S.lessons[l.id] = true; save();
        var nx = LESSONS[l.no] || null, drills = l.steps.filter(function (s) { return s.drill; });
        ask.textContent = 'Lesson complete.';
        say.innerHTML = stat.misses + stat.hints === 0 ? 'No slips and no hints.' : (stat.misses + ' wrong ' + (stat.misses === 1 ? 'try' : 'tries') + ', ' + stat.hints + ' ' + (stat.hints === 1 ? 'hint' : 'hints') + '. Run it again tomorrow and aim for zero.');
        if (nx) { var a = el('a', 'btn primary', 'Next: ' + nx.title); a.href = '#lesson-' + nx.id; actions.appendChild(a); }
        else { var p = el('a', 'btn primary', 'Go to puzzles'); p.href = '#puzzles'; actions.appendChild(p); }
        if (drills.length) { var d = el('a', 'btn', 'Practise against the bot'); d.href = '#play-' + drills[drills.length - 1].drill; actions.appendChild(d); }
        var again = el('button', 'btn small', 'Repeat'); again.type = 'button'; again.addEventListener('click', route); actions.appendChild(again);
      }
    });
  }

  // ---------------- Puzzles ----------------
  function puzzles() {
    var clean = C.PUZZLES.filter(function (p) { return S.puzzles[p.id] && S.puzzles[p.id].clean; }).length;
    var html = '<h1>Puzzles</h1><p class="lede muted" style="margin-top:8px;max-width:56ch">You get the goal and nothing else. The theme is revealed once you solve it. A clean solve means first try, no hint. Clean so far: <span class="mono">' + clean + '/' + C.PUZZLES.length + '</span>.</p><div class="pgrid">';
    C.PUZZLES.forEach(function (p, i) {
      var r = S.puzzles[p.id], side = p.steps[0].fen.split(' ')[1] === 'w' ? 'White' : 'Black';
      html += '<a class="ptile' + (r ? (r.clean ? ' clean' : ' done') : '') + '" href="#puzzle-' + p.id + '"><span class="k">' + (i + 1) + '</span><span class="g">' + p.goal + ' · ' + side + '</span><span class="s">' + (r ? (r.clean ? 'Solved clean · ' + p.theme : 'Solved · ' + p.theme) : 'Not solved') + '</span></a>';
    });
    app.innerHTML = html + '</div>';
  }
  function puzzle(id) {
    var idx = -1; C.PUZZLES.forEach(function (p, i) { if (p.id === id) idx = i; });
    if (idx < 0) { puzzles(); return; }
    var p = C.PUZZLES[idx];
    trainer({
      steps: p.steps, back: '#puzzles', backLabel: 'Puzzles', where: 'Puzzle ' + (idx + 1) + ' · ' + p.goal, goal: p.goal, auto: true, finishLabel: 'See the idea',
      onDone: function (stat, say, ask, actions) {
        var isClean = stat.misses + stat.hints === 0, prev = S.puzzles[p.id];
        S.puzzles[p.id] = { done: true, clean: isClean || !!(prev && prev.clean) }; save();
        ask.textContent = p.theme + '.';
        say.innerHTML = p.explain + (isClean ? ' <b>Clean solve.</b>' : ' Come back to this one for a clean solve.');
        var nx = C.PUZZLES[idx + 1];
        var a = el('a', 'btn primary', nx ? 'Next puzzle' : 'All puzzles'); a.href = nx ? '#puzzle-' + nx.id : '#puzzles'; actions.appendChild(a);
        var again = el('button', 'btn small', 'Repeat'); again.type = 'button'; again.addEventListener('click', route); actions.appendChild(again);
      }
    });
  }

  // ---------------- Play ----------------
  function play(drillParam) {
    var token = viewToken, game, drillId, color, notes = [], busy = false, last = null, cache = null, hintLevel = 0, hintSq = null, hintArrow = null, pending = null;
    app.innerHTML = '<div class="stage"><div class="bwrap"></div><div class="panel">' +
      '<div class="status" role="status"></div><div class="meta"></div><div class="fb"></div>' +
      '<div class="row"><button type="button" class="btn small" id="b-hint">Hint</button><button type="button" class="btn small" id="b-undo">Take back</button><button type="button" class="btn small" id="b-new">New game</button></div>' +
      '<div class="moves" aria-label="Moves played"></div>' +
      '<fieldset><legend>Coach</legend><div class="opts">' +
      '<label for="o-level">Bot strength<select id="o-level"><option value="1">Beginner (slips often)</option><option value="2">Steady (takes what you hang)</option><option value="3">Tough (sees tactics)</option></select></label>' +
      '<label for="o-color">You play<select id="o-color"><option value="w">White</option><option value="b">Black</option></select></label>' +
      '<label class="check" for="o-guard"><input type="checkbox" id="o-guard"><span><b>Blunder check.</b> Stop me before a move that loses material, allows mate or stalemates.</span></label>' +
      '<label class="check" for="o-threats"><input type="checkbox" id="o-threats"><span><b>Show loose pieces.</b> Red dot: mine can be won. Green dot: theirs can.</span></label>' +
      '</div></fieldset>' +
      '<fieldset><legend>Start a new game from</legend><div class="drills"></div></fieldset>' +
      '<fieldset><legend>Pieces</legend><div class="pickhost"></div></fieldset></div></div>';
    var q = function (s) { return app.querySelector(s); };
    var board = new Board(q('.bwrap')), fb = q('.fb');
    function setFb(kind, html) { fb.className = 'fb' + (kind ? ' ' + kind : ''); fb.innerHTML = html || ''; }
    q('#o-level').value = String(S.set.level); q('#o-color').value = S.set.color; q('#o-guard').checked = !!S.set.guard; q('#o-threats').checked = !!S.set.threats;
    q('#o-level').addEventListener('change', function () { S.set.level = +this.value; save(); render(); });
    q('#o-color').addEventListener('change', function () { S.set.color = this.value; save(); setFb('note', 'You will play ' + sideName(S.set.color) + ' from the next full game.'); });
    q('#o-guard').addEventListener('change', function () { S.set.guard = this.checked; save(); });
    q('#o-threats').addEventListener('change', function () { S.set.threats = this.checked; save(); render(); });
    Object.keys(C.DRILLS).forEach(function (k) {
      var b = el('button', 'btn small', C.DRILLS[k].title); b.type = 'button';
      b.addEventListener('click', function () { plainHash(); start(k); }); q('.drills').appendChild(b);
    });
    function plainHash() { if (location.hash !== '#play') { try { history.replaceState(null, '', '#play'); } catch (e) { /* keep the current address */ } } }
    function mountPicker() { var h = q('.pickhost'); h.innerHTML = ''; h.appendChild(piecePicker(function () { mountPicker(); render(); })); }
    mountPicker();
    q('#b-new').addEventListener('click', function () { start(drillId); });
    q('#b-hint').addEventListener('click', hint);
    q('#b-undo').addEventListener('click', undo);

    function over() { return game.game_over(); }
    function persist() { S.play = { drill: drillId, color: color, moves: notes.map(function (n) { return { san: n.san, g: n.g }; }) }; save(); }
    function pieces() { return E.material(game).count; }
    function depth() { return pieces() <= 7 ? 5 : 3; }
    function analysis() { var f = game.fen(); if (!cache || cache.fen !== f) cache = { fen: f, list: E.rank(f, depth()) }; return cache.list; }
    function san(m) { var mv = game.move({ from: m.from, to: m.to, promotion: m.promotion }); if (mv) game.undo(); return mv; }

    function start(id) {
      drillId = C.DRILLS[id] ? id : 'game';
      var d = C.DRILLS[drillId];
      game = new Chess(d.fen); color = d.side || S.set.color; notes = []; last = null; cache = null; busy = false; pending = null; clearHint();
      setFb('note', d.note + (drillId === 'game' ? ' You are ' + sideName(color) + '.' : ''));
      persist(); render();
      if (game.turn() !== color) botTurn();
    }
    function restore(p) {
      drillId = p.drill; var d = C.DRILLS[drillId];
      game = new Chess(d.fen); color = p.color === 'b' ? 'b' : 'w'; notes = [];
      for (var k = 0; k < p.moves.length; k++) { var mv = game.move(p.moves[k].san); if (!mv) break; notes.push({ san: mv.san, g: p.moves[k].g || '' }); last = { from: mv.from, to: mv.to }; }
      setFb('note', notes.length ? 'Game restored. ' + (over() ? '' : 'Carry on.') : d.note);
      render();
      if (over()) finish(); else if (game.turn() !== color) botTurn();
    }
    function clearHint() { hintLevel = 0; hintSq = null; hintArrow = null; }

    function render(animate) {
      var isOver = over(), mine = game.turn() === color;
      board.show(game, { flip: color === 'b', movable: !isOver && !busy && mine ? color : null, last: last, hintSq: hintSq, hintArrow: hintArrow, animate: animate, me: color, flags: S.set.threats && !isOver ? E.loose(game) : null });
      if (!isOver) q('.status').textContent = busy ? 'The bot is thinking…' : (game.in_check() ? 'Check. Your move.' : 'Your move.');
      var m = E.material(game), d = Math.round((m[color] - m[color === 'w' ? 'b' : 'w']) / 100);
      q('.meta').innerHTML = '<span>' + C.DRILLS[drillId].title + '</span><span>You: ' + sideName(color) + '</span><span>Material: ' + (d === 0 ? 'level' : (d > 0 ? '+' + d : '−' + (-d))) + '</span>';
      var html = '';
      for (var k = 0; k < notes.length; k++) {
        var n = notes[k], cls = n.g === '??' || n.g === '?' ? ' q' : n.g === '!' ? ' e' : '';
        html += (k ? ' ' : '') + '<span class="m">' + (k % 2 === 0 ? '<span class="n">' + (k / 2 + 1) + '.</span>' : '') + '<span class="' + cls.trim() + '">' + n.san + n.g + '</span></span>';
      }
      var mvEl = q('.moves'); mvEl.innerHTML = html || '<span class="muted">No moves yet.</span>'; mvEl.scrollTop = mvEl.scrollHeight;
      q('#b-hint').disabled = isOver || busy || !mine; q('#b-undo').disabled = busy || !notes.length;
    }

    function replyLine(depthNow) {
      // Called with the user's move already on the board: what does the opponent do about it?
      var r = E.best(game.fen(), depthNow); if (!r) return '';
      var mv = san(r); if (!mv) return '';
      if (r.score >= E.MATE / 2) return mv.san.indexOf('#') >= 0 ? 'It allows <span class="mono">' + mv.san + '</span>, checkmate.' : 'It allows <span class="mono">' + mv.san + '</span> with a forced mate.';
      if (mv.captured) return 'It allows <span class="mono">' + mv.san + '</span>, taking your ' + NAME[mv.captured] + '.';
      return 'After <span class="mono">' + mv.san + '</span> you are in trouble.';
    }

    board.onMove = function (from, to, promo) { userMove(from, to, promo, false); };
    function userMove(from, to, promo, force) {
      if (busy || over() || game.turn() !== color) return;
      var list = analysis(), dp = depth();
      var ent = list.filter(function (x) { return x.from === from && x.to === to && (x.promotion || '') === (promo || ''); })[0];
      if (!ent) { render(); return; }
      var bestMv = san(list[0]), diff = list[0].score - ent.score;
      var onlyGood = list.length > 1 && ent === list[0] && list[0].score - list[1].score >= 150;
      var hadMate = list[0].score >= E.MATE / 2 && ent.score < E.MATE / 2;
      var mv = game.move({ from: from, to: to, promotion: promo });
      var stale = game.in_stalemate(), text = '', glyph = '', kind = 'good';
      if (stale) { glyph = '??'; kind = 'bad'; text = 'Stalemate. ' + sideName(game.turn()) + ' has no legal move and is not in check, so the game is a draw. <span class="mono">' + bestMv.san + '</span> kept the win.'; }
      else if (hadMate) { glyph = diff >= 300 ? '??' : '?'; kind = 'bad'; text = 'You had <span class="mono">' + bestMv.san + '</span>' + (bestMv.san.indexOf('#') >= 0 ? ', checkmate.' : ', which forces mate.'); if (diff < 300 && ent.score > 300) { glyph = '?!'; kind = 'warn'; } }
      else if (diff >= 300) { glyph = '??'; kind = 'bad'; text = replyLine(dp - 1) + ' Better was <span class="mono">' + bestMv.san + '</span>.'; }
      else if (diff >= 150) { glyph = '?'; kind = 'bad'; text = 'A mistake. ' + replyLine(dp - 1) + ' Better was <span class="mono">' + bestMv.san + '</span>.'; }
      else if (diff >= 60) { glyph = '?!'; kind = 'warn'; text = 'Playable, but <span class="mono">' + bestMv.san + '</span> was stronger.'; }
      else if (game.in_checkmate()) text = 'Checkmate.';
      else if (onlyGood) { glyph = '!'; text = 'The best move, and nothing else was close.'; }
      else if (mv.captured) text = 'Good capture.';
      else text = 'Good move.';
      if (S.set.guard && !force && (stale || diff >= 300)) {
        game.undo(); pending = { from: from, to: to, promo: promo };
        setFb('warn', '<b>Wait.</b> <span class="mono">' + mv.san + '</span>: ' + text + '<div class="row"><button type="button" class="btn small primary" id="g-back">Choose another move</button><button type="button" class="btn small" id="g-go">Play it anyway</button></div>');
        q('#g-back').addEventListener('click', function () { pending = null; setFb('note', 'Good. Scan again: checks, captures, threats.'); });
        q('#g-go').addEventListener('click', function () { var p = pending; pending = null; if (p) userMove(p.from, p.to, p.promo, true); });
        render(); return;
      }
      if (hintLevel >= 2 && glyph === '!') glyph = '';
      notes.push({ san: mv.san, g: glyph }); last = { from: from, to: to }; pending = null; clearHint();
      setFb(kind, '<b class="g">' + mv.san + glyph + '</b>' + text);
      persist();
      if (over()) { render(true); finish(); return; }
      botTurn(true);
    }

    function botTurn(animate) {
      busy = true; render(animate);
      setTimeout(function () {
        if (token !== viewToken) return;
        var lvl = drillId === 'game' ? S.set.level : 3;
        var m = E.botMove(game.fen(), lvl, pieces()), mv = m && game.move({ from: m.from, to: m.to, promotion: m.promotion });
        busy = false;
        if (mv) { notes.push({ san: mv.san, g: '' }); last = { from: mv.from, to: mv.to }; persist(); }
        render(true);
        if (over()) finish();
        else setTimeout(function () { if (token === viewToken && !busy) analysis(); }, 60);
      }, 420);
    }

    function finish() {
      var s, youWon = false;
      if (game.in_checkmate()) { youWon = game.turn() !== color; s = youWon ? 'Checkmate. You win.' : 'Checkmate. The bot wins.'; }
      else if (game.in_stalemate()) s = 'Stalemate. A draw.';
      else if (game.in_threefold_repetition()) s = 'Draw by repetition.';
      else if (game.insufficient_material()) s = 'Draw. Nobody has enough left to mate.';
      else s = 'Draw by the fifty-move rule.';
      q('.status').textContent = s;
      var mineNotes = notes.filter(function (n, k) { return (k % 2 === 0) === (color === 'w'); });
      var cnt = function (g) { return mineNotes.filter(function (n) { return n.g === g; }).length; };
      var line = 'Your ' + mineNotes.length + ' moves: <span class="mono">' + cnt('??') + ' ?? · ' + cnt('?') + ' ? · ' + cnt('?!') + ' ?! · ' + cnt('!') + ' !</span>. ';
      if (drillId !== 'game') line += youWon ? 'Mate in ' + mineNotes.length + '. Run it again and try to do it faster.' : 'Reset and try again. The lesson is one tap away under Learn.';
      else if (cnt('??') + cnt('?') > 0) line += 'The question marks are where the game turned. <a href="#lesson-hanging">Hanging pieces</a> is the lesson to repeat.';
      else line += 'No serious errors. Move the bot up a level.';
      fb.className = 'fb note'; fb.innerHTML += (fb.innerHTML ? '<br>' : '') + line;
      q('#b-hint').disabled = true;
    }

    function hint() {
      if (busy || over() || game.turn() !== color) return;
      var b = analysis()[0], mv = san(b); if (!mv) return;
      hintLevel++;
      if (hintLevel === 1) {
        hintSq = [mv.from];
        var t = mv.san.indexOf('#') >= 0 ? 'There is a checkmate on the board.' : mv.captured ? 'Something can be captured.' : mv.san.indexOf('+') >= 0 ? 'There is a useful check.' : 'Nothing forcing. Improve a piece.';
        setFb('note', t + ' Look at your ' + NAME[mv.piece] + ' on ' + mv.from + '. Tap Hint again for the move.');
      } else { hintArrow = [mv.from, mv.to]; setFb('note', 'The engine likes <span class="mono">' + mv.san + '</span>.'); }
      render();
    }

    function undo() {
      if (busy || !notes.length) return;
      do { game.undo(); notes.pop(); } while (game.turn() !== color && notes.length);
      var h = game.history({ verbose: true }); last = h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null;
      cache = null; pending = null; clearHint(); setFb('note', 'Taken back. Scan again: checks, captures, threats.');
      persist(); render();
      if (game.turn() !== color) botTurn();
    }

    var saved = S.play;
    if (drillParam && C.DRILLS[drillParam] && (!saved || saved.drill !== drillParam || !saved.moves.length)) start(drillParam);
    else if (saved && C.DRILLS[saved.drill]) restore(saved);
    else start('game');
  }

  // ---------------- Routing ----------------
  function route() {
    viewToken++;
    var hsh = (location.hash || '#learn').slice(1), tab = 'learn';
    if (hsh.indexOf('lesson-') === 0) lesson(hsh.slice(7));
    else if (hsh === 'puzzles') { tab = 'puzzles'; puzzles(); }
    else if (hsh.indexOf('puzzle-') === 0) { tab = 'puzzles'; puzzle(hsh.slice(7)); }
    else if (hsh === 'play') { tab = 'play'; play(null); }
    else if (hsh.indexOf('play-') === 0) { tab = 'play'; play(hsh.slice(5)); }
    else home();
    Array.prototype.forEach.call(document.querySelectorAll('.tabs a'), function (a) { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    window.scrollTo(0, 0);
  }

  try { var raw = localStorage.getItem(KEY); if (raw) merge(JSON.parse(raw)); } catch (e) { /* start fresh */ }
  if (!PieceSets.some(function (p) { return p.id === S.set.pieces; })) S.set.pieces = 'pebble';
  syncLabel();
  window.addEventListener('hashchange', route);
  route();
  initRemote();
})();
