/* Lessons, puzzles and drills. Every move here is checked by test.js before publishing.
   Step fields: fen | cont (carry on from the last position), text, ask, solve (SAN list; '#' = any checkmate),
   reply (opponent's answer), done, hint, wrong {SAN: message}, marks {sq:[], arrows:[[from,to]]}, drill. */
(function (root) {
  'use strict';
  var START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var UNITS = [
    { id: 'u1', title: 'The pieces', lessons: [
      { id: 'moves', title: 'Six ways to move', blurb: 'A fast refresher. One capture per piece.', steps: [
        { fen: '4k3/8/8/3p4/8/8/3R4/4K3 w - - 0 1', text: '<b>Rook.</b> Straight lines, any distance, until something is in the way.', ask: 'Take the pawn with the rook.', solve: ['Rxd5'] },
        { fen: '4k3/8/5p2/8/8/2B5/8/4K3 w - - 0 1', text: '<b>Bishop.</b> Diagonals only. Each bishop lives on one colour for the whole game.', ask: 'Take the pawn with the bishop.', solve: ['Bxf6'] },
        { fen: '7k/8/8/8/1p3Q2/8/8/4K3 w - - 0 1', text: '<b>Queen.</b> A rook and a bishop in one piece. That is why she is worth so much.', ask: 'Take the pawn with the queen.', solve: ['Qxb4'] },
        { fen: '4k3/8/8/8/3PPp2/3N4/8/4K3 w - - 0 1', text: '<b>Knight.</b> Two squares one way, one square sideways. It is the only piece that jumps.', ask: 'Take the pawn with the knight.', solve: ['Nxf4'] },
        { fen: '4k3/8/8/8/8/2p1p3/3P4/4K3 w - - 0 1', text: '<b>Pawn.</b> Moves straight ahead, captures one square diagonally. It never goes backwards.', ask: 'Capture either black pawn.', solve: ['dxc3', 'dxe3'], wrong: { d3: 'Legal, but pawns capture diagonally. Take one.', d4: 'Legal, but pawns capture diagonally. Take one.' } },
        { fen: '4k3/8/8/8/8/8/3p4/4K3 w - - 0 1', text: '<b>King.</b> One square in any direction, and never onto a square that is attacked. Right now the pawn has you in check.', ask: 'Get out of check by taking the pawn.', solve: ['Kxd2'], wrong: { Ke2: 'That escapes, but the pawn is free. Take it.', Kf2: 'That escapes, but the pawn is free. Take it.', Kf1: 'That escapes, but the pawn is free. Take it.', Kd1: 'That escapes, but the pawn is free. Take it.' } }
      ] },
      { id: 'values', title: 'What each piece is worth', blurb: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.', steps: [
        { fen: '7k/8/2n3r1/8/4Q3/8/8/4K3 w - - 0 1', text: 'Count in pawns: <b>pawn 1, knight 3, bishop 3, rook 5, queen 9.</b> The king has no price because losing him ends the game.', ask: 'Your queen can take two things. Take the one worth more.', solve: ['Qxg6'], wrong: { Qxc6: 'A knight is 3. The rook on g6 is 5.' } },
        { fen: '6k1/5ppp/4p3/3n4/8/1b3Q2/8/6K1 w - - 0 1', text: 'A capture is only free if nothing takes back. The knight on d5 is guarded by a pawn. The bishop on b3 is guarded by nobody.', ask: 'Win a piece for nothing.', solve: ['Qxb3'], wrong: { Qxd5: 'The e6 pawn takes back. You would swap a queen (9) for a knight (3).', 'Qxf7': 'The king takes back. That costs you the queen.' }, marks: { arrows: [['e6', 'd5']] } },
        { fen: '6k1/5ppp/4p3/3n4/8/1Q6/8/6K1 b - - 0 1', text: 'That habit has a name: before any capture, ask <b>what takes back?</b> If the answer is "nothing", take. If the answer costs you more than you gain, leave it.' }
      ] }
    ] },

    { id: 'u2', title: 'Rules that decide games', lessons: [
      { id: 'check', title: 'Check, mate and stalemate', blurb: 'Three ways out of check. One way to throw away a win.', steps: [
        { fen: '4r1k1/8/8/8/8/8/8/4K3 w - - 0 1', text: 'When your king is attacked you must fix it at once. There are only three ways. First: <b>move</b> the king.', ask: 'Step out of the rook\'s line.', solve: ['Kd1', 'Kd2', 'Kf1', 'Kf2'] },
        { fen: '4r1k1/8/8/8/2B5/8/3P1P2/3RKR2 w - - 0 1', text: 'Second: <b>block</b>. Put a piece between the attacker and your king. Your king has no squares here, so a block is all you have.', ask: 'Block the check safely.', solve: ['Be2'], wrong: { Be6: 'It blocks, but the rook takes the bishop with check and now nothing can block. That is mate.' } },
        { fen: '6k1/8/8/5B2/8/3n4/8/4K3 w - - 0 1', text: 'Third: <b>capture</b> the piece giving check. A knight check can never be blocked, so here it is capture or run.', ask: 'Take the knight.', solve: ['Bxd3'], wrong: { Kd1: 'That escapes, but the knight was free.', Kd2: 'That escapes, but the knight was free.', Ke2: 'That escapes, but the knight was free.', Kf1: 'That escapes, but the knight was free.' } },
        { fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', text: '<b>Checkmate</b> is check with none of the three answers available. <b>Stalemate</b> is no legal move while <i>not</i> in check, and it is a draw. One move here wins. Another one gives away half a point.', ask: 'Deliver checkmate.', solve: ['#'], hint: 'The queen needs to land next to the king on a square your own king protects.' }
      ] },
      { id: 'special', title: 'Castling, en passant, promotion', blurb: 'The three moves that break the normal rules.', steps: [
        { fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', text: '<b>Castling.</b> The king slides two squares toward a rook and the rook hops over him. It tucks the king away and brings the rook into play in one move.', ask: 'Castle kingside: tap the king, then g1.', solve: ['O-O'] },
        { fen: '4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1', text: 'You cannot castle if the king or that rook has already moved, if you are in check, or if the king would <b>pass through</b> an attacked square. The rook on f8 guards f1.', ask: 'Castle on the side that is allowed.', solve: ['O-O-O'], marks: { arrows: [['f8', 'f1']] } },
        { fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2', text: '<b>En passant.</b> Black just played d7 to d5, two squares, landing beside your pawn. For one move only, you may capture it as if it had moved one square.', ask: 'Take en passant.', solve: ['exd6'], marks: { arrows: [['d7', 'd5']] } },
        { fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1', text: '<b>Promotion.</b> A pawn that reaches the far rank becomes any piece you choose. Choose the queen unless you have a specific reason not to.', ask: 'Promote the pawn.', solve: ['e8=Q'], wrong: { 'e8=R': 'Legal, but the queen does everything a rook does and more.', 'e8=B': 'Legal, but take the queen.', 'e8=N': 'Legal, but take the queen.' } }
      ] }
    ] },

    { id: 'u3', title: 'Stop giving pieces away', lessons: [
      { id: 'hanging', title: 'Hanging pieces', blurb: 'Most games at club level are decided by one loose piece.', steps: [
        { fen: 'r3k2r/ppp2ppp/2n5/3q4/8/2N5/PPP2PPP/R2QK2R w KQkq - 0 1', text: 'A piece is <b>hanging</b> when it is attacked and nothing defends it. Spotting these, yours and theirs, wins more games than any opening.', ask: 'Black has left something hanging. Take it.', solve: ['Nxd5', 'Qxd5'] },
        { fen: '6k1/5ppp/8/8/3b4/2N5/PP3PPP/6K1 w - - 0 1', text: 'The bishop attacks your knight. Is that a problem? The b2 pawn defends it. If Black takes, you take back, and a 3 has been swapped for a 3. Nothing to fear.', marks: { arrows: [['d4', 'c3'], ['b2', 'c3']] } },
        { fen: '6k1/5ppp/8/8/3b4/2N5/P4PPP/6K1 w - - 0 1', text: 'Same position without the b2 pawn. Now the knight is hanging.', ask: 'Move the knight to safety.', solve: ['Nb5', 'Ne2', 'Na4', 'Nb1', 'Nd1', 'Nd5', 'Ne4'], done: 'Safe. The sharpest squares were b5 and e2: they step away and attack the bishop back.' },
        { fen: '3r2k1/5ppp/8/3p4/8/2N2B2/5PPP/6K1 w - - 0 1', text: 'When a piece is defended, <b>count</b>. You attack the d5 pawn twice, with knight and bishop. Black defends it once, with the rook. More attackers than defenders means it falls.', ask: 'Win the pawn.', solve: ['Nxd5', 'Bxd5'], done: 'If the rook takes back, your other piece takes the rook.', marks: { arrows: [['c3', 'd5'], ['f3', 'd5'], ['d8', 'd5']] } },
        { fen: '3r2k1/5ppp/8/3N4/8/5B2/5PPP/6K1 b - - 0 1', text: 'Build this into every move. <b>Before you move:</b> what did their last move attack? <b>Before you let go:</b> is the piece I am moving, or the one it was guarding, now hanging? The Play tab can check this for you while you learn.' }
      ] }
    ] },

    { id: 'u4', title: 'The opening', lessons: [
      { id: 'opening', title: 'Three jobs in the first ten moves', blurb: 'Centre, development, king safety. Played out on the board.', steps: [
        { fen: START, text: 'You do not need to memorise openings yet. You need three jobs done. <b>Job one: take space in the centre.</b> Pieces in the middle reach both sides of the board.', ask: 'Put your king\'s pawn two squares forward.', solve: ['e4'], reply: 'e5', wrong: { d4: 'Also a fine first move. For this lesson, play the king\'s pawn.' } },
        { cont: true, text: '<b>Job two: get the pieces out.</b> Knights before bishops, toward the centre. A good developing move also makes a threat.', ask: 'Develop a knight so that it attacks the e5 pawn.', solve: ['Nf3'], reply: 'Nc6' },
        { cont: true, text: 'Black defended the pawn. Now the bishop. The best diagonal aims at f7, the one square next to Black\'s king that only the king protects.', ask: 'Develop the bishop so it looks at f7.', solve: ['Bc4'], reply: 'Bc5', marks: { sq: ['f7'] } },
        { cont: true, text: '<b>Job three: make the king safe.</b> The centre is about to open, and the king is standing in it.', ask: 'Castle.', solve: ['O-O'], reply: 'Nf6' },
        { cont: true, text: 'Four moves each. A pawn in the centre, two pieces out, king castled. This is the Italian Game, played for five hundred years for exactly these reasons. From here: bring out the rest, connect the rooks, and only then start attacking.' }
      ] },
      { id: 'scholar', title: 'The four-move trap', blurb: 'Deliver the Scholar\'s Mate once, then never fall for it.', steps: [
        { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', text: 'White has brought the queen out early and aimed queen and bishop at f7. Black just played a natural developing move and missed the threat.', ask: 'Checkmate in one.', solve: ['#'], marks: { sq: ['f7'] } },
        { fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3', text: 'Now you are Black, one move earlier. White threatens mate on f7. The clean answer blocks the queen\'s path and attacks her at the same time.', ask: 'Stop the mate.', solve: ['g6'], reply: 'Qf3', wrong: { Nf6: 'That is the losing move from the last position: the queen takes f7, mate.', Qe7: 'It defends f7, but it blocks your bishop. There is a move that defends and gains time.', Qf6: 'It defends f7, but your knight wants that square. There is a move that defends and gains time.' }, marks: { arrows: [['h5', 'f7'], ['c4', 'f7']] } },
        { cont: true, text: 'The queen stepped back and is threatening f7 again, this time along the f-file.', ask: 'Block her with a developing move.', solve: ['Nf6'], wrong: { Qf6: 'It works, but you would rather put a knight there and keep the queen at home.', Qe7: 'It works, but a knight on f6 blocks and develops at once.' } },
        { cont: true, text: 'The threat is over and look at the board: you have two knights out, White has moved the queen three times. <b>Bringing the queen out early loses time</b>, because every move that attacks her is a free developing move for the other side.' }
      ] }
    ] },

    { id: 'u5', title: 'Tactics', lessons: [
      { id: 'fork', title: 'The fork', blurb: 'One piece attacks two things. Only one can be saved.', steps: [
        { fen: 'r3k3/pp3ppp/8/1N6/8/8/PPP2PPP/4K3 w q - 0 1', text: 'A <b>fork</b> is one move that attacks two targets. If one of them is the king, the other one is lost, because the check must be answered first.', ask: 'Fork the king and the rook.', solve: ['Nc7+'], reply: 'Kd7', hint: 'Find the square where a knight would hit e8 and a8 together.' },
        { cont: true, text: 'The king had to move.', ask: 'Collect the rook.', solve: ['Nxa8'] },
        { fen: '6k1/5p1p/6p1/3q4/4N3/8/5PPP/6K1 w - - 0 1', text: 'King and queen on squares a knight can hit together is the dream. It is called a royal fork.', ask: 'Fork the king and the queen.', solve: ['Nf6+'], reply: 'Kg7' },
        { cont: true, ask: 'Take the queen.', solve: ['Nxd5'] },
        { fen: '4k3/pp3ppp/8/2r1n3/8/3P3P/5PPK/8 w - - 0 1', text: 'Any piece can fork. The pawn is the most annoying one, because whatever it attacks is worth more than it is.', ask: 'Fork the rook and the knight with a pawn.', solve: ['d4'], done: 'One of them moves away and you take the other.' },
        { fen: '4k3/5ppp/8/8/1b6/8/5PPP/3Q2K1 w - - 0 1', text: 'The queen forks along lines. Look for a check that also points at something loose.', ask: 'Check the king and attack the bishop.', solve: ['Qa4+'], reply: 'Ke7' },
        { cont: true, ask: 'Take the bishop.', solve: ['Qxb4+'] }
      ] },
      { id: 'pin', title: 'The pin', blurb: 'A piece that cannot move without losing what stands behind it.', steps: [
        { fen: '4k3/pppp1ppp/8/4n3/8/8/PPP2PPP/R5K1 w - - 0 1', text: 'A <b>pin</b> attacks a piece that has something more valuable behind it on the same line. If the king is behind it, the pinned piece is not allowed to move at all.', ask: 'Pin the knight to the king.', solve: ['Re1'], reply: 'd6' },
        { cont: true, text: 'Black defended the knight with a pawn, so taking it now would only be a trade. But a pinned piece cannot run. <b>Attack it again with something cheap.</b>', ask: 'Attack the pinned knight with a pawn.', solve: ['f4'], reply: 'Kd7', wrong: { 'Rxe5+': 'The pawn takes back. You give a rook (5) for a knight (3). Use something cheaper.' } },
        { cont: true, text: 'The king stepped out of the pin, one move too late.', ask: 'Take the knight.', solve: ['fxe5'] },
        { fen: 'r5k1/5ppp/5n2/8/8/8/1B3P1P/6RK w - - 0 1', text: 'A pinned piece is also a <b>bad defender</b>. The g7 pawn looks like it guards the knight. It does not: it is pinned to the king by your rook and may not leave the g-file.', ask: 'Win the knight.', solve: ['Bxf6'], marks: { arrows: [['g1', 'g8']] } },
        { fen: '4k3/pp2qppp/8/8/8/8/PP3PPP/R4K2 w - - 0 1', text: 'The best pins have the king behind and the queen in front.', ask: 'Pin the queen.', solve: ['Re1'], reply: 'Qxe1+' },
        { cont: true, text: 'She cannot leave the file, so she takes the rook to get something for herself.', ask: 'Take back.', solve: ['Kxe1'], done: 'A rook for a queen: you are four points up.' }
      ] },
      { id: 'skewer', title: 'The skewer', blurb: 'A pin turned around: the valuable piece is in front.', steps: [
        { fen: '3q4/8/8/3k4/8/8/8/R5K1 w - - 0 1', text: 'In a <b>skewer</b> the more valuable piece is in front. It has to move, and whatever stood behind it falls.', ask: 'Check the king so that the queen is behind him.', solve: ['Rd1+'], reply: 'Ke6' },
        { cont: true, ask: 'Take the queen.', solve: ['Rxd8'] },
        { fen: '7q/8/8/4k3/8/8/8/2B3K1 w - - 0 1', text: 'Bishops skewer on diagonals. King and queen share the long diagonal here.', ask: 'Skewer them.', solve: ['Bb2+'], reply: 'Kf5' },
        { cont: true, ask: 'Take the queen.', solve: ['Bxh8'] }
      ] },
      { id: 'discovered', title: 'Discovered attacks', blurb: 'Move one piece, unleash the one behind it.', steps: [
        { fen: '4k3/ppp2ppp/8/1q6/4N3/8/PPP2PPP/4R1K1 w - - 0 1', text: 'Your rook is aimed at the king with your own knight in the way. When the knight moves, the rook gives check: a <b>discovered check</b>. The knight gets a free move, so send it somewhere it attacks something.', ask: 'Move the knight so it attacks the queen.', solve: ['Nc3+', 'Nd6+'], hint: 'Any knight move gives check. Pick one that also hits b5.', marks: { arrows: [['e1', 'e8']] } },
        { fen: '3q2k1/5ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1', text: 'Same idea in reverse: the rook is aimed at the queen, and the bishop in front can leave with a check that Black has to answer.', ask: 'Win the queen.', solve: ['Bxh7+'], reply: 'Kxh7', marks: { arrows: [['d1', 'd8']] } },
        { cont: true, ask: 'Take the queen.', solve: ['Rxd8'], done: 'A bishop for a queen.' }
      ] },
      { id: 'defender', title: 'Remove the defender', blurb: 'If one piece is holding everything together, take that piece.', steps: [
        { fen: '1q3rk1/5ppp/5n2/6B1/8/3Q4/2B2PPP/6K1 w - - 0 1', text: 'Your queen and bishop are lined up on h7. Only one thing stops Qxh7 mate: the knight on f6. When a single piece is holding the position, <b>get rid of it</b>.', ask: 'Remove the defender.', solve: ['Bxf6'], reply: 'gxf6', marks: { arrows: [['d3', 'h7'], ['f6', 'h7']] } },
        { cont: true, ask: 'Checkmate.', solve: ['#'] }
      ] }
    ] },

    { id: 'u6', title: 'Checkmate patterns', lessons: [
      { id: 'backrank', title: 'Back-rank mate', blurb: 'A king shut in by his own pawns.', steps: [
        { fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', text: 'A castled king behind three unmoved pawns has no escape if a rook or queen lands on his back rank. This is the most common mate in real games.', ask: 'Checkmate in one.', solve: ['#'] },
        { fen: '3r2k1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1', text: 'The back rank is guarded by one rook. You attack that rook twice. Count.', ask: 'Checkmate in one.', solve: ['#'] },
        { fen: 'r5k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1', text: 'Now the danger is yours. Black threatens to bring the rook to a1 with mate. The lasting fix is to give the king a square to run to. Players call it <b>making luft</b>.', ask: 'Move a pawn so your king has an escape square.', solve: ['h3', 'g3', 'h4', 'g4', 'f3', 'f4'], wrong: { Rb1: 'That holds for now, but the rook is stuck guarding. A pawn move fixes it for good.' }, marks: { arrows: [['a8', 'a1']] } }
      ] },
      { id: 'ladder', title: 'The ladder', blurb: 'Two rooks walk the king to the edge.', steps: [
        { fen: '8/8/8/6k1/R7/8/1R6/6K1 w - - 0 1', text: 'One rook holds a rank so the king cannot cross it. The other rook checks on the next rank, and the king is pushed back. Then they swap jobs. The rook on a4 already holds the fourth rank.', ask: 'Check on the fifth rank with the other rook.', solve: ['Rb5+'], reply: 'Kf6', marks: { arrows: [['a4', 'h4']] } },
        { cont: true, ask: 'Leapfrog: check on the sixth rank.', solve: ['Ra6+'], reply: 'Ke7' },
        { cont: true, ask: 'And the seventh.', solve: ['Rb7+'], reply: 'Kd8' },
        { cont: true, ask: 'Finish it.', solve: ['#'], done: 'If the king ever walks toward your rooks, swing them to the far side of the board and carry on.', drill: 'ladder' }
      ] },
      { id: 'helpers', title: 'Queen with a helper', blurb: 'The queen mates when something protects her.', steps: [
        { fen: '6k1/5p1p/6pQ/8/8/8/1B3PPP/6K1 w - - 0 1', text: 'A queen right next to the enemy king is only safe if a second piece protects her. Here your bishop covers the whole long diagonal.', ask: 'Checkmate in one.', solve: ['#'], marks: { arrows: [['b2', 'g7']] } },
        { fen: '5rk1/5pp1/8/6NQ/8/8/5PPP/6K1 w - - 0 1', text: 'Queen and knight work the same way.', ask: 'Checkmate in one.', solve: ['#'] },
        { fen: '6rk/6pp/8/6N1/8/8/5PPP/6K1 w - - 0 1', text: 'Sometimes the helpers are the enemy\'s own pieces. This king has no squares at all, so any check he cannot answer is mate. It is called a <b>smothered mate</b>.', ask: 'Checkmate in one.', solve: ['#'] }
      ] }
    ] },

    { id: 'u7', title: 'Endgames', lessons: [
      { id: 'queenmate', title: 'King and queen against king', blurb: 'The first ending to master. Box, walk, mate.', steps: [
        { fen: '8/8/8/3k4/8/2Q5/8/K7 w - - 0 1', text: 'A queen cannot mate alone. The method has three parts. <b>Box:</b> use the queen to shrink the area the king can reach. <b>Walk:</b> bring your own king up. <b>Mate:</b> on the edge, with your king protecting the queen.', marks: { sq: ['c4', 'c5', 'c6', 'c7', 'c8', 'd3', 'e3', 'f3', 'g3', 'h3'] } },
        { fen: 'k7/8/1Q6/8/8/8/8/K7 b - - 0 1', text: 'The one way to spoil it. Black is to move here, is not in check, and has no legal move: <b>stalemate</b>, a draw. Before every queen move ask whether the king still has a square. If he is down to his last two, stop boxing and bring your king.' },
        { fen: '3k4/7Q/3K4/8/8/8/8/8 w - - 0 1', text: 'This is the picture you are aiming for: enemy king on the edge, your king directly opposite.', ask: 'Checkmate in one.', solve: ['#'], drill: 'queen' }
      ] },
      { id: 'rookmate', title: 'King and rook against king', blurb: 'Slower than the queen, same idea.', steps: [
        { fen: '8/8/8/4k3/8/R7/8/4K3 w - - 0 1', text: 'The rook holds a line the king cannot cross. Then your king does the pushing. When the two kings stand directly opposite each other with one square between, a rook check drives the enemy king back a rank.', marks: { arrows: [['a3', 'h3']] } },
        { fen: '8/8/4k3/8/4K3/8/8/R7 w - - 0 1', text: 'The kings face each other. That is the moment to check.', ask: 'Drive the king back a rank.', solve: ['Ra6+'], reply: 'Kd7', marks: { arrows: [['e4', 'e6']] } },
        { fen: '3k4/8/3K4/8/8/8/8/7R w - - 0 1', text: 'Repeat until he is on the edge. The final position always looks like this.', ask: 'Checkmate in one.', solve: ['#'], drill: 'rook' }
      ] },
      { id: 'pawnend', title: 'King and pawn', blurb: 'Most endgames come down to one pawn trying to promote.', steps: [
        { fen: '8/8/8/8/P6k/8/8/K7 w - - 0 1', text: '<b>The square.</b> Draw a square from the pawn to its promotion rank. If the enemy king cannot step inside it, the pawn simply runs. Here he is far outside.', ask: 'Run.', solve: ['a5'], marks: { sq: ['a4', 'b4', 'c4', 'd4', 'e4', 'a8', 'b8', 'c8', 'd8', 'e8', 'a5', 'a6', 'a7', 'e5', 'e6', 'e7'] } },
        { fen: '4k3/8/8/8/4P3/4K3/8/8 w - - 0 1', text: 'When the enemy king <i>is</i> in front of the pawn, pushing it only gets it blocked. <b>The king goes first.</b> Your king clears the road and the pawn follows behind.', ask: 'Lead with the king.', solve: ['Kd4', 'Kf4'], wrong: { e5: 'Pawn first lets the black king sit in front of it, and that is a draw. King first.' }, drill: 'pawn' }
      ] }
    ] }
  ];

  var PUZZLES = [
    { id: 'p1', goal: 'Mate in 1', theme: 'Back rank', steps: [{ fen: '2r3k1/5ppp/8/N7/8/8/5PPP/6K1 b - - 0 1', solve: ['#'] }], explain: 'The king is shut in by his own pawns and nothing can block on the first rank.' },
    { id: 'p2', goal: 'Mate in 1', theme: 'Rook and king', steps: [{ fen: '7k/5K2/8/8/8/8/8/6R1 w - - 0 1', solve: ['#'] }], explain: 'Your king already covers g7 and g8. The rook only has to take the h-file.' },
    { id: 'p3', goal: 'Win material', theme: 'Knight fork', steps: [{ fen: '6k1/5ppp/8/8/3n4/8/5PPP/2Q3K1 b - - 0 1', solve: ['Ne2+'], reply: 'Kf1' }, { cont: true, solve: ['Nxc1'] }], explain: 'A knight check that also hits the queen. The check has to be answered first.' },
    { id: 'p4', goal: 'Mate in 1', theme: 'Queen and bishop', steps: [{ fen: '6k1/1b3ppp/8/8/8/5q2/5P1P/5RK1 b - - 0 1', solve: ['#'] }], explain: 'Queen and bishop together own every square around the king. The bishop on b7 covers the whole long diagonal.' },
    { id: 'p5', goal: 'Win material', theme: 'Pin', steps: [{ fen: '6k1/6pp/8/3q4/8/8/PP4PP/3B2K1 w - - 0 1', solve: ['Bb3'], reply: 'Qxb3' }, { cont: true, solve: ['axb3'] }], explain: 'Queen and king stood on the same diagonal. The pinned queen could only sell herself for the bishop.' },
    { id: 'p6', goal: 'Win material', theme: 'Skewer', steps: [{ fen: 'r5k1/5ppp/8/8/4K3/8/8/4Q3 b - - 0 1', solve: ['Re8+'], reply: 'Kf3' }, { cont: true, solve: ['Rxe1'] }], explain: 'King in front, queen behind, both on the e-file. The king steps aside and the queen is gone.' },
    { id: 'p7', goal: 'Win material', theme: 'Pawn fork', steps: [{ fen: '6k1/5ppp/8/4p3/8/3N1R2/5PPP/6K1 b - - 0 1', solve: ['e4'] }], explain: 'One pawn step attacks the knight and the rook. White can save only one.' },
    { id: 'p8', goal: 'Mate in 2', theme: 'The ladder', steps: [{ fen: '7k/8/8/8/8/8/R7/1R4K1 w - - 0 1', solve: ['Rb7', 'Ra7'], reply: 'Kg8' }, { cont: true, solve: ['#'] }], explain: 'One rook takes the seventh rank and shuts the king on the edge. The other delivers mate on the eighth.' },
    { id: 'p9', goal: 'Win material', theme: 'Discovered attack', steps: [{ fen: '3q2k1/5ppp/8/8/8/3B4/PP3PPP/3R2K1 w - - 0 1', solve: ['Bxh7+'], reply: 'Kxh7' }, { cont: true, solve: ['Rxd8'] }], explain: 'The bishop leaves with check and uncovers the rook\'s attack on the queen.' },
    { id: 'p10', goal: 'Win material', theme: 'Queen fork', steps: [{ fen: '6k1/6p1/7p/8/8/8/r4PPP/3Q2K1 w - - 0 1', solve: ['Qd5+', 'Qb3+'], reply: 'Kh7' }, { cont: true, solve: ['Qxa2'] }], explain: 'A check on the long diagonal that also points at the undefended rook. Loose pieces are what make forks work.' },
    { id: 'p11', goal: 'Mate in 2', theme: 'Remove the defender', steps: [{ fen: '1q3rk1/5ppp/5n2/6B1/8/3Q4/2B2PPP/6K1 w - - 0 1', solve: ['Bxf6'], reply: 'gxf6' }, { cont: true, solve: ['#'] }], explain: 'The knight was the only thing guarding h7. Once it is gone the queen walks in.' },
    { id: 'p12', goal: 'Mate in 2', theme: 'Smothered mate', steps: [{ fen: 'r6k/6pp/7N/8/8/1Q6/5PPP/6K1 w - - 0 1', solve: ['Qg8+'], reply: 'Rxg8' }, { cont: true, solve: ['#'] }], explain: 'The queen gives herself up to drag the rook onto g8. The king is then walled in by his own pieces and the knight mates.' }
  ];

  var DRILLS = {
    game: { title: 'Full game', fen: START, note: 'A full game from the starting position.' },
    queen: { title: 'Queen mate', fen: '8/8/8/4k3/8/8/8/KQ6 w - - 0 1', note: 'Box the king in, walk your king up, mate on the edge. Watch for stalemate.', side: 'w' },
    rook: { title: 'Rook mate', fen: '8/8/8/4k3/8/8/8/KR6 w - - 0 1', note: 'Hold a line with the rook, push with the king, check when the kings face each other.', side: 'w' },
    ladder: { title: 'Two-rook ladder', fen: '8/8/8/4k3/8/8/8/RR4K1 w - - 0 1', note: 'One rook holds a rank, the other checks on the next. Then swap.', side: 'w' },
    pawn: { title: 'King and pawn', fen: '4k3/8/8/8/4P3/4K3/8/8 w - - 0 1', note: 'King in front of the pawn. Promote, then finish with the queen mate.', side: 'w' }
  };

  var api = { START: START, UNITS: UNITS, PUZZLES: PUZZLES, DRILLS: DRILLS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Content = api;
})(this);
