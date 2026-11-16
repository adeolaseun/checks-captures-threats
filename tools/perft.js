const E=require('../site/engine.js');
const cases=[['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',4,197281],['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',3,97862],['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',5,674624],['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',3,62379],['r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',3,89890]];
for(const [f,d,n] of cases){const s=Date.now();const r=E.perft(f,d);console.log(r===n?'ok  ':'BAD ',r,n,Date.now()-s+'ms')}
const t='r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7';
for(const [n,f] of [['rank d2',()=>E.rank(t,2)],['rank d3',()=>E.rank(t,3)],['best d4',()=>E.best(t,4)],['best d5',()=>E.best(t,5)]]){const s=Date.now();const r=f();console.log(n,Date.now()-s,'ms',JSON.stringify(Array.isArray(r)?r[0]:r))}
