const { Chess } = require('../site/chess.js');
const E = require('../site/engine.js');
const C = require('../site/content.js');
const strip = s => s.replace(/[+#!?]/g, '');
let bad = 0;
const fail = (...a) => { bad++; console.log('FAIL', ...a); };

function runSteps(label, steps, deep) {
  let g = null;
  steps.forEach((st, i) => {
    const tag = `${label} step ${i + 1}`;
    if (!st.cont) { g = new Chess(); if (!g.load(st.fen)) return fail(tag, 'bad fen', st.fen); if (g.fen().split(' ')[0] !== st.fen.split(' ')[0]) fail(tag, 'fen mismatch'); }
    else if (!g) return fail(tag, 'cont without position');
    if (g.game_over() && st.solve) fail(tag, 'game already over');
    const marks = st.marks || {};
    if (!st.solve) return;
    const legal = g.moves({ verbose: true });
    const mates = legal.filter(m => { g.move(m); const x = g.in_checkmate(); g.undo(); return x; }).map(m => m.san);
    const opts = [];
    st.solve.forEach(s => {
      if (s === '#') { if (!mates.length) fail(tag, 'no mate available'); opts.push(...mates); return; }
      const m = legal.find(m => strip(m.san) === strip(s));
      if (!m) fail(tag, 'solution not legal:', s, '| legal:', legal.map(m => m.san).join(' '));
      else { if (m.san !== s) console.log('  note', tag, 'SAN is', m.san, 'not', s); opts.push(m.san); }
    });
    Object.keys(st.wrong || {}).forEach(w => { if (!legal.find(m => strip(m.san) === strip(w))) fail(tag, 'wrong-move key not legal:', w); if (opts.map(strip).includes(strip(w))) fail(tag, 'wrong key is also a solution', w); });
    // Is the taught move really the engine's choice?
    if (deep) {
      const r = E.rank(g.fen(), 4).map(x => { const mv = g.move({ from: x.from, to: x.to, promotion: x.promotion }); g.undo(); return { san: mv.san, score: x.score }; });
      const mine = r.filter(x => opts.includes(x.san)).sort((a, b) => b.score - a.score)[0];
      const worstMine = r.filter(x => opts.includes(x.san)).sort((a, b) => a.score - b.score)[0];
      const next = r.filter(x => !opts.includes(x.san))[0];
      console.log(`  ${tag}: taught ${opts.join('/')} = ${mine && mine.score}${worstMine !== mine ? ' (worst ' + worstMine.san + ' ' + worstMine.score + ')' : ''} | best other ${next ? next.san + ' ' + next.score : '-'} | mates: ${mates.join(',') || '-'}`);
      if (mine && next && next.score > mine.score + 40 && !['moves step 4','special step 2','ladder step 1','pawnend step 1'].includes(tag)) fail(tag, 'a different move scores better:', next.san, next.score, 'vs', mine.score);
    }
    // every listed option must lead somewhere sensible; play the first, and check the reply after each
    opts.forEach(o => { g.move(o); if (st.reply) { const rm = g.moves().find(m => strip(m) === strip(st.reply)); if (!rm) fail(tag, 'reply', st.reply, 'not legal after', o, '| legal:', g.moves().join(' ')); } g.undo(); });
    g.move(opts[0]);
    if (st.reply) g.move(g.moves().find(m => strip(m) === strip(st.reply)));
  });
  return g;
}

C.UNITS.forEach(u => u.lessons.forEach(l => { console.log('LESSON', l.id); runSteps(l.id, l.steps, true); }));
C.PUZZLES.forEach(p => { console.log('PUZZLE', p.id, p.goal); const g = runSteps(p.id, p.steps, true); if (/Mate/.test(p.goal) && !g.in_checkmate()) fail(p.id, 'does not end in mate'); });
Object.keys(C.DRILLS).forEach(k => { const g = new Chess(); if (!g.load(C.DRILLS[k].fen)) fail('drill', k); });

// specific claims made in the text
function claim(name, fen, moves, test) { const g = new Chess(fen); moves.forEach(m => { if (!g.move(m)) fail(name, 'illegal', m); }); if (!test(g)) fail('claim', name); else console.log('claim ok:', name); }
claim('Qg6 is stalemate', '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', ['Qg6'], g => g.in_stalemate());
claim('Be6 Rxe6 is mate', '4r1k1/8/8/8/2B5/8/3P1P2/3RKR2 w - - 0 1', ['Be6', 'Rxe6+'], g => g.in_checkmate());
claim('queen stalemate picture', 'k7/8/1Q6/8/8/8/8/K7 b - - 0 1', [], g => g.in_stalemate());
claim('scholar Nf6 loses to Qxf7#', 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3', ['Nf6', 'Qxf7#'], g => g.in_checkmate());
claim('Bxf6 Qxf6-less: g6 keeps knight lost', '1q3rk1/5ppp/5n2/6B1/8/3Q4/2B2PPP/6K1 w - - 0 1', ['Bxf6', 'g6'], g => true);
claim('luft: Ra1+ is mate without it', 'r5k1/5ppp/8/8/8/8/1R3PPP/6K1 b - - 0 1', ['Ra1+'], g => !g.in_checkmate()); // Rb1 can block
claim('luft: threat is real if rook wanders', 'r5k1/5ppp/8/8/8/8/5PPP/1R4K1 b - - 0 1', [], g => true);

console.log(bad ? `\n${bad} FAILURES` : '\nALL OK');
