/* A small, fast chess engine for the sparring bot and the coach.
   Rules, notation and game state for the interface come from chess.js; this file only searches.
   Board: 0x88 mailbox. Pieces: 1 pawn, 2 knight, 3 bishop, 4 rook, 5 queen, 6 king; +8 for Black. */
(function (root) {
  'use strict';
  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  var NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  var MATE = 100000, PV = [0, 100, 320, 330, 500, 900, 0], LET = ' pnbrqk';
  var N_OFF = [-33, -31, -18, -14, 14, 18, 31, 33], K_OFF = [-17, -16, -15, -1, 1, 15, 16, 17];
  var B_OFF = [-17, -15, 15, 17], R_OFF = [-16, -1, 1, 16];

  // Piece-square tables from White's side, rank 8 first.
  var T = [null,
    [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,22,22,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-22,-22,10,10,5, 0,0,0,0,0,0,0,0],
    [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
  ];
  var KE = [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50];
  var CMASK = new Int8Array(128); for (var i0 = 0; i0 < 128; i0++) CMASK[i0] = 15;
  CMASK[4] = 12; CMASK[0] = 13; CMASK[7] = 14; CMASK[116] = 3; CMASK[112] = 7; CMASK[119] = 11;

  var bd = new Int8Array(128), side = 0, rights = 0, ep = -1, king = [0, 0], stack = [];

  function load(fen) {
    var p = fen.split(/\s+/), rows = p[0].split('/'), r, f, i, ch, code;
    for (i = 0; i < 128; i++) bd[i] = 0;
    king = [-1, -1]; stack = [];
    for (r = 0; r < 8; r++) {
      f = 0;
      for (i = 0; i < rows[r].length; i++) {
        ch = rows[r][i];
        if (ch >= '1' && ch <= '8') { f += +ch; continue; }
        code = LET.indexOf(ch.toLowerCase()); if (ch === ch.toLowerCase()) code += 8;
        bd[(7 - r) * 16 + f] = code;
        if ((code & 7) === 6) king[code >> 3] = (7 - r) * 16 + f;
        f++;
      }
    }
    side = p[1] === 'b' ? 1 : 0;
    rights = 0; var c = p[2] || '-';
    if (c.indexOf('K') >= 0) rights |= 1; if (c.indexOf('Q') >= 0) rights |= 2;
    if (c.indexOf('k') >= 0) rights |= 4; if (c.indexOf('q') >= 0) rights |= 8;
    ep = (p[3] && p[3] !== '-') ? (p[3].charCodeAt(1) - 49) * 16 + (p[3].charCodeAt(0) - 97) : -1;
  }

  function attacked(sq, by) {
    var i, t, p, o;
    if (by === 0) { t = sq - 15; if (!(t & 0x88) && bd[t] === 1) return true; t = sq - 17; if (!(t & 0x88) && bd[t] === 1) return true; }
    else { t = sq + 15; if (!(t & 0x88) && bd[t] === 9) return true; t = sq + 17; if (!(t & 0x88) && bd[t] === 9) return true; }
    var kn = 2 | (by << 3), kg = 6 | (by << 3);
    for (i = 0; i < 8; i++) {
      t = sq + N_OFF[i]; if (!(t & 0x88) && bd[t] === kn) return true;
      t = sq + K_OFF[i]; if (!(t & 0x88) && bd[t] === kg) return true;
    }
    for (i = 0; i < 4; i++) {
      o = B_OFF[i]; t = sq + o;
      while (!(t & 0x88)) { p = bd[t]; if (p) { if ((p >> 3) === by && ((p & 7) === 3 || (p & 7) === 5)) return true; break; } t += o; }
      o = R_OFF[i]; t = sq + o;
      while (!(t & 0x88)) { p = bd[t]; if (p) { if ((p >> 3) === by && ((p & 7) === 4 || (p & 7) === 5)) return true; break; } t += o; }
    }
    return false;
  }

  // move = from | to<<7 | promo<<14 | flag<<17   (flag: 1 en passant, 2 castle short, 3 castle long, 4 double push)
  function gen(capsOnly) {
    var out = [], sq, p, t, i, o, ty, dir, tp, offs, x;
    for (sq = 0; sq < 120; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = bd[sq]; if (!p || (p >> 3) !== side) continue;
      ty = p & 7;
      if (ty === 1) {
        dir = side ? -16 : 16; t = sq + dir;
        var promo = (t >> 4) === (side ? 0 : 7);
        if (!bd[t]) {
          if (promo) { out.push(sq | t << 7 | 5 << 14); if (!capsOnly) out.push(sq | t << 7 | 4 << 14, sq | t << 7 | 3 << 14, sq | t << 7 | 2 << 14); }
          else if (!capsOnly) { out.push(sq | t << 7); if ((sq >> 4) === (side ? 6 : 1) && !bd[t + dir]) out.push(sq | (t + dir) << 7 | 4 << 17); }
        }
        for (i = -1; i <= 1; i += 2) {
          t = sq + dir + i; if (t & 0x88) continue;
          tp = bd[t];
          if (tp && (tp >> 3) !== side) { if (promo) out.push(sq | t << 7 | 5 << 14, sq | t << 7 | 4 << 14, sq | t << 7 | 3 << 14, sq | t << 7 | 2 << 14); else out.push(sq | t << 7); }
          else if (t === ep && !tp) out.push(sq | t << 7 | 1 << 17);
        }
      } else if (ty === 2 || ty === 6) {
        offs = ty === 2 ? N_OFF : K_OFF;
        for (i = 0; i < 8; i++) { t = sq + offs[i]; if (t & 0x88) continue; tp = bd[t]; if (tp ? (tp >> 3) !== side : !capsOnly) out.push(sq | t << 7); }
        if (ty === 6 && !capsOnly) {
          x = side ? 112 : 0;
          if (sq === x + 4) {
            if ((rights & (side ? 4 : 1)) && !bd[x + 5] && !bd[x + 6] && bd[x + 7] === (4 | side << 3) && !attacked(x + 4, side ^ 1) && !attacked(x + 5, side ^ 1)) out.push(sq | (x + 6) << 7 | 2 << 17);
            if ((rights & (side ? 8 : 2)) && !bd[x + 3] && !bd[x + 2] && !bd[x + 1] && bd[x] === (4 | side << 3) && !attacked(x + 4, side ^ 1) && !attacked(x + 3, side ^ 1)) out.push(sq | (x + 2) << 7 | 3 << 17);
          }
        }
      } else {
        for (i = 0; i < 4; i++) {
          if (ty !== 4) { o = B_OFF[i]; t = sq + o; while (!(t & 0x88)) { tp = bd[t]; if (tp) { if ((tp >> 3) !== side) out.push(sq | t << 7); break; } if (!capsOnly) out.push(sq | t << 7); t += o; } }
          if (ty !== 3) { o = R_OFF[i]; t = sq + o; while (!(t & 0x88)) { tp = bd[t]; if (tp) { if ((tp >> 3) !== side) out.push(sq | t << 7); break; } if (!capsOnly) out.push(sq | t << 7); t += o; } }
        }
      }
    }
    return out;
  }

  function make(m) {
    var from = m & 127, to = (m >> 7) & 127, promo = (m >> 14) & 7, flag = m >> 17, p = bd[from], cap = bd[to], capSq = to;
    if (flag === 1) { capSq = to + (side ? 16 : -16); cap = bd[capSq]; bd[capSq] = 0; }
    stack.push(cap, capSq, rights, ep, king[0], king[1], m);
    bd[to] = promo ? (promo | side << 3) : p; bd[from] = 0;
    if (flag === 2) { bd[to - 1] = bd[to + 1]; bd[to + 1] = 0; }
    else if (flag === 3) { bd[to + 1] = bd[to - 2]; bd[to - 2] = 0; }
    if ((p & 7) === 6) king[side] = to;
    rights &= CMASK[from] & CMASK[to];
    ep = flag === 4 ? (from + to) >> 1 : -1;
    side ^= 1;
    if (attacked(king[side ^ 1], side)) { unmake(); return false; }
    return true;
  }

  function unmake() {
    var m = stack.pop(); king[1] = stack.pop(); king[0] = stack.pop(); ep = stack.pop(); rights = stack.pop();
    var capSq = stack.pop(), cap = stack.pop();
    side ^= 1;
    var from = m & 127, to = (m >> 7) & 127, promo = (m >> 14) & 7, flag = m >> 17;
    bd[from] = promo ? (1 | side << 3) : bd[to]; bd[to] = 0; bd[capSq] = cap;
    if (flag === 2) { bd[to + 1] = bd[to - 1]; bd[to - 1] = 0; }
    else if (flag === 3) { bd[to - 2] = bd[to + 1]; bd[to + 1] = 0; }
  }

  function evalPos() {
    var s = 0, sq, p, ty, idx, npm = 0, wm = 0, bm = 0, v;
    for (sq = 0; sq < 120; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = bd[sq]; if (!p) continue; ty = p & 7; if (ty === 6) continue;
      if (ty !== 1) npm += PV[ty];
      if (p < 8) { idx = (7 - (sq >> 4)) * 8 + (sq & 7); v = PV[ty] + T[ty][idx]; s += v; wm += PV[ty]; }
      else { idx = (sq >> 4) * 8 + (sq & 7); v = PV[ty] + T[ty][idx]; s -= v; bm += PV[ty]; }
    }
    var kt = npm <= 1400 ? KE : T[6], wk = king[0], bk = king[1];
    s += kt[(7 - (wk >> 4)) * 8 + (wk & 7)] - kt[(bk >> 4) * 8 + (bk & 7)];
    if ((wm === 0 || bm === 0) && wm !== bm) {
      // Bare king: the stronger side wants the kings close and the lone king on the rim.
      var dist = Math.max(Math.abs((wk >> 4) - (bk >> 4)), Math.abs((wk & 7) - (bk & 7)));
      var lone = wm === 0 ? wk : bk;
      var rim = Math.max(Math.abs((lone >> 4) - 3.5), Math.abs((lone & 7) - 3.5));
      var bonus = (7 - dist) * 12 + rim * 30;
      s += wm === 0 ? -bonus : bonus;
    }
    return side ? -s : s;
  }

  function sortMoves(ms) {
    var keys = new Map(), i, m, cap, k;
    for (i = 0; i < ms.length; i++) {
      m = ms[i]; cap = bd[(m >> 7) & 127]; k = 0;
      if (cap) k = 10000 + 10 * PV[cap & 7] - PV[bd[m & 127] & 7];
      if ((m >> 14) & 7) k += 9000;
      keys.set(m, k);
    }
    ms.sort(function (a, b) { return keys.get(b) - keys.get(a); });
    return ms;
  }

  function quiesce(a, b, d) {
    var stand = evalPos();
    if (d === 0) return stand;
    if (stand >= b) return b;
    if (stand > a) a = stand;
    var ms = sortMoves(gen(true)), i, sc;
    for (i = 0; i < ms.length; i++) {
      if (!make(ms[i])) continue;
      sc = -quiesce(-b, -a, d - 1); unmake();
      if (sc >= b) return b;
      if (sc > a) a = sc;
    }
    return a;
  }

  function negamax(depth, a, b, ply) {
    if (depth === 0) return quiesce(a, b, 6);
    var ms = sortMoves(gen(false)), i, sc, legal = 0;
    for (i = 0; i < ms.length; i++) {
      if (!make(ms[i])) continue;
      legal++;
      sc = -negamax(depth - 1, -b, -a, ply + 1); unmake();
      if (sc >= b) return b;
      if (sc > a) a = sc;
    }
    if (!legal) return attacked(king[side], side ^ 1) ? -MATE + ply : 0;
    return a;
  }

  function sqStr(s) { return 'abcdefgh'[s & 7] + ((s >> 4) + 1); }
  function out(m, score) {
    var pr = (m >> 14) & 7;
    return { from: sqStr(m & 127), to: sqStr((m >> 7) & 127), promotion: pr ? LET[pr] : undefined, score: score };
  }

  /* Score every legal move, looking `depth` plies ahead in total. Best first. */
  function rank(fen, depth) {
    load(fen);
    var ms = sortMoves(gen(false)), res = [], i;
    for (i = 0; i < ms.length; i++) {
      if (!make(ms[i])) continue;
      var sc = -negamax(depth - 1, -MATE * 2, MATE * 2, 1); unmake();
      res.push(out(ms[i], sc));
    }
    res.sort(function (x, y) { return y.score - x.score; });
    return res;
  }

  /* Best move only (prunes at the root, so it is quicker than rank). */
  function best(fen, depth) {
    load(fen);
    var ms = sortMoves(gen(false)), a = -MATE * 2, pick = 0, i;
    for (i = 0; i < ms.length; i++) {
      if (!make(ms[i])) continue;
      var sc = -negamax(depth - 1, -MATE * 2, -a, 1); unmake();
      if (sc > a) { a = sc; pick = ms[i]; }
    }
    return pick ? out(pick, a) : null;
  }

  /* The sparring partner. Level 1 slips often, 2 is steady, 3 looks further ahead. */
  function botMove(fen, level, pieces) {
    if (level >= 3) return best(fen, pieces <= 8 ? 5 : 4);
    var r = rank(fen, level === 2 ? 2 : 1);
    if (!r.length) return null;
    if (level === 1 && r[0].score < MATE / 2 && Math.random() < 0.3) return r[Math.floor(Math.random() * r.length)];
    var slack = level === 1 ? 60 : 15;
    var pool = r.filter(function (m) { return m.score >= r[0].score - slack; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function perft(fen, d) {
    load(fen);
    function go(d) { if (d === 0) return 1; var ms = gen(false), n = 0, i; for (i = 0; i < ms.length; i++) { if (!make(ms[i])) continue; n += go(d - 1); unmake(); } return n; }
    return go(d);
  }

  // ---- Reading a chess.js board(): who attacks what (used for the threat overlay) ----
  var KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  var DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]], ORTH = [[-1,0],[1,0],[0,-1],[0,1]];
  function on(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
  function attackers(b, r, c, color) {
    var res = [], i, p, rr, cc, d;
    for (i = 0; i < 8; i++) { rr = r + KN[i][0]; cc = c + KN[i][1]; if (on(rr, cc) && (p = b[rr][cc]) && p.color === color && p.type === 'n') res.push('n'); }
    var pr = color === 'w' ? r + 1 : r - 1;
    for (i = -1; i <= 1; i += 2) if (on(pr, c + i) && (p = b[pr][c + i]) && p.color === color && p.type === 'p') res.push('p');
    for (rr = r - 1; rr <= r + 1; rr++) for (cc = c - 1; cc <= c + 1; cc++)
      if ((rr !== r || cc !== c) && on(rr, cc) && (p = b[rr][cc]) && p.color === color && p.type === 'k') res.push('k');
    function ray(dirs, a) {
      for (var j = 0; j < 4; j++) {
        d = dirs[j]; rr = r + d[0]; cc = c + d[1];
        while (on(rr, cc)) { p = b[rr][cc]; if (p) { if (p.color === color && (p.type === a || p.type === 'q')) res.push(p.type); break; } rr += d[0]; cc += d[1]; }
      }
    }
    ray(DIAG, 'b'); ray(ORTH, 'r');
    return res;
  }
  /* Pieces that can be won right now: attacked, and either undefended or attacked by something cheaper. */
  function loose(g) {
    var b = g.board(), res = [], r, c, p;
    for (r = 0; r < 8; r++) for (c = 0; c < 8; c++) {
      p = b[r][c]; if (!p || p.type === 'k') continue;
      var att = attackers(b, r, c, p.color === 'w' ? 'b' : 'w'); if (!att.length) continue;
      var def = attackers(b, r, c, p.color);
      var cheapest = Math.min.apply(null, att.map(function (t) { return t === 'k' ? 10000 : VAL[t]; }));
      if (cheapest === 10000 && def.length) continue; // a king cannot take a defended piece
      if (!def.length || cheapest < VAL[p.type]) res.push({ square: 'abcdefgh'[c] + (8 - r), color: p.color, type: p.type });
    }
    return res;
  }
  function material(g) {
    var b = g.board(), w = 0, k = 0, n = 0, r, c, p;
    for (r = 0; r < 8; r++) for (c = 0; c < 8; c++) { p = b[r][c]; if (p) { n++; if (p.color === 'w') w += VAL[p.type]; else k += VAL[p.type]; } }
    return { w: w, b: k, count: n };
  }

  var api = { VAL: VAL, NAME: NAME, MATE: MATE, rank: rank, best: best, botMove: botMove, perft: perft, attackers: attackers, loose: loose, material: material };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(this);
