/* Extra piece sets. Each symbol is drawn from three variables set per colour: --pf fill, --ps outline, --pd detail. */
(function (root) {
  'use strict';
  var G = function (inner, sw) { return '<g fill="var(--pf)" stroke="var(--ps)" stroke-width="' + (sw || 1.5) + '" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g>'; };
  var sets = {};

  // Pebble: chunky, rounded, tonally shaded. Colours come from --f fill, --s shade, --h highlight, --o edge, --w edge width, --e eye.
  sets.pebble = {"k": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><path d=\"M20.300 2.500h4.400v2.700h2.800v4.200h-2.800V13h-4.400V9.400h-2.800V5.200h2.800z\"/><path d=\"M22.500 14c-2.800-3.800-13-3.800-13 5.200 0 6 4 9.800 5.500 14.800h15c1.500-5 5.500-8.800 5.500-14.800 0-9-10.200-9-13-5.200z\"/><path d=\"M14 27.500h17\" fill=\"none\" stroke=\"var(--s)\" stroke-width=\"2.200\" stroke-linecap=\"round\"/><ellipse cx=\"14.2\" cy=\"17.8\" rx=\"1.6\" ry=\"2.8\" transform=\"rotate(15 14.2 17.8)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>", "q": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><path d=\"M8.500 13.200c-.200-1.500 1.500-2.500 2.700-1.500l5 4.300 4.300-8c.900-1.600 3.100-1.600 4 0l4.300 8 5-4.300c1.200-1 2.900 0 2.700 1.500L34 30c-.300 2.300-2.200 4-4.500 4h-14c-2.300 0-4.200-1.700-4.500-4z\"/><circle cx=\"22.500\" cy=\"4.800\" r=\"2.800\"/><path d=\"M13.500 26.500h18\" fill=\"none\" stroke=\"var(--s)\" stroke-width=\"2.200\" stroke-linecap=\"round\"/><ellipse cx=\"14\" cy=\"19.5\" rx=\"1.5\" ry=\"2.6\" transform=\"rotate(-10 14 19.5)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>", "r": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><rect x=\"13\" y=\"13\" width=\"19\" height=\"21\" rx=\"3\"/><path d=\"M10 9c0-1.700 1.300-3 3-3h3v3.500h4V6h5v3.500h4V6h3c1.700 0 3 1.300 3 3v4.500c0 1.700-1.300 3-3 3H13c-1.700 0-3-1.300-3-3z\"/><path d=\"M14.500 21.500h16\" fill=\"none\" stroke=\"var(--s)\" stroke-width=\"2.200\" stroke-linecap=\"round\"/><ellipse cx=\"14\" cy=\"10.2\" rx=\"2.2\" ry=\"1.4\" transform=\"rotate(0 14 10.2)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>", "b": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><path d=\"M16.500 34c0-3.500 2.500-6 6-6s6 2.500 6 6z\"/><path d=\"M22.500 6.500c6.300 5 9.500 9.500 9.500 14.300 0 5.200-4.200 9.200-9.500 9.200S13 26 13 20.800c0-4.800 3.200-9.300 9.500-14.300z\"/><circle cx=\"22.500\" cy=\"5.300\" r=\"2.800\"/><path d=\"M26 13.500l-5.500 7.500\" fill=\"none\" stroke=\"var(--s)\" stroke-width=\"2.400\" stroke-linecap=\"round\"/><ellipse cx=\"17.5\" cy=\"18.5\" rx=\"1.6\" ry=\"2.8\" transform=\"rotate(20 17.5 18.5)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>", "n": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><path d=\"M14 34c0-5.500 1-9.500 3.500-13l-4.700 1.600c-2.400.800-4.600-1.600-3.500-3.900l3.400-7.200c1.500-3.200 4.500-5.500 8-6l.800-2.700c.300-1 1.600-1.200 2.200-.300l2.300 3.500c5.500 1.700 9 6.800 9 13.500V34z\"/><circle cx=\"19\" cy=\"12.300\" r=\"1.500\" fill=\"var(--e)\" stroke=\"none\"/><path d=\"M29 13c1.600 3 2.200 6.500 2.200 10.500\" fill=\"none\" stroke=\"var(--s)\" stroke-width=\"2.200\" stroke-linecap=\"round\"/><ellipse cx=\"22.5\" cy=\"8.3\" rx=\"2.2\" ry=\"1.3\" transform=\"rotate(-20 22.5 8.3)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>", "p": "<ellipse cx=\"22.500\" cy=\"40.300\" rx=\"14.500\" ry=\"2.600\" fill=\"#0B1410\" opacity=\".28\" stroke=\"none\"/><g fill=\"var(--f)\" stroke=\"var(--o)\" stroke-width=\"var(--w)\" stroke-linejoin=\"round\"><rect x=\"8.500\" y=\"32\" width=\"28\" height=\"8\" rx=\"4\" fill=\"var(--s)\"/><path d=\"M14 34c0-6.500 3.300-11 8.500-11s8.500 4.500 8.500 11z\"/><circle cx=\"22.500\" cy=\"14.500\" r=\"8.200\"/><ellipse cx=\"19.2\" cy=\"11.2\" rx=\"2.8\" ry=\"1.7\" transform=\"rotate(-35 19.2 11.2)\" fill=\"var(--h)\" stroke=\"none\" opacity=\".9\"/></g>"};

  // Tournament: classic club silhouettes.
  var tr = {"k": "<path d=\"M14.500 28.500c0 2.500-1.500 4.200-3.500 6h23c-2-1.800-3.500-3.500-3.500-6z\"/><path d=\"M13 25.800h19v2.900H13z\"/><path d=\"M22.500 12.500c-3-2.800-12-2.300-12 4.700 0 4 3 6.300 4 8.800h16c1-2.500 4-4.800 4-8.800 0-7-9-7.500-12-4.700z\"/><path d=\"M21 2.500h3v3h3v3h-3v4h-3v-4h-3v-3h3z\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>", "q": "<path d=\"M14.500 28.500c0 2.500-1.500 4.200-3.500 6h23c-2-1.800-3.500-3.500-3.500-6z\"/><path d=\"M13 25.800h19v2.900H13z\"/><path d=\"M8.500 12.500l5 13.500h18l5-13.500-6.500 7.500-2-11-5.500 10.500L17 8.500l-2 11z\"/><circle cx=\"8.500\" cy=\"11\" r=\"2.200\"/><circle cx=\"16.800\" cy=\"7\" r=\"2.200\"/><circle cx=\"28.200\" cy=\"7\" r=\"2.200\"/><circle cx=\"36.500\" cy=\"11\" r=\"2.200\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>", "r": "<path d=\"M15.500 16.500h14l1 13 2.500 5H12l2.500-5z\"/><path d=\"M12 6h5v3.500h3.500V6h4v3.500H28V6h5v8.500l-3 2.500H15l-3-2.500z\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>", "b": "<path d=\"M19.500 26.500c0 3.500-2.500 6-6 8h18c-3.500-2-6-4.500-6-8z\"/><ellipse cx=\"22.500\" cy=\"25.800\" rx=\"7.200\" ry=\"1.900\"/><path d=\"M22.500 8c-4.500 3.500-7 7.500-7 11 0 2.500 1.200 4.500 3 5.800h8c1.800-1.300 3-3.300 3-5.800 0-3.500-2.500-7.500-7-11z\"/><circle cx=\"22.500\" cy=\"5.600\" r=\"2.300\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>", "n": "<path d=\"M14 34.500c.500-5.500 2.500-9.500 6.500-13-1.500.300-3.500 1-5.500 2.500l-2.500 2.500c-1.200.800-2.500.300-3-1l.500-3.500 6-9.500c.500-1.500 1.500-3 3-4l-.500-4.500 3.500 3 1.200-2.800 2.300 3.800c6 2.500 9.500 9 9.500 17.500v9z\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>", "p": "<path d=\"M19 19.500c.500 5-2.500 9.800-6 15h19c-3.500-5.200-6.500-10-6-15z\"/><ellipse cx=\"22.500\" cy=\"18.600\" rx=\"6.600\" ry=\"1.900\"/><circle cx=\"22.500\" cy=\"11.300\" r=\"5.600\"/><path d=\"M9 39.500h27v-2.800c0-1.200-.800-2-2-2H11c-1.200 0-2 .800-2 2z\"/>"};
  sets.tournament = {};
  Object.keys(tr).forEach(function (t) { sets.tournament[t] = G(tr[t], 1.4); });

  // Soft: chunky rounded toy pieces.
  var sb = '<rect x="9.5" y="34" width="26" height="6.5" rx="3.2"/>';
  sets.soft = {
    p: G('<path d="M15.5 34c0-8 2.500-11.500 7-11.500s7 3.500 7 11.500z"/><circle cx="22.5" cy="15.500" r="7"/>' + sb, 2.4),
    r: G('<rect x="11.500" y="6" width="6" height="9" rx="1.800"/><rect x="19.500" y="6" width="6" height="9" rx="1.800"/><rect x="27.500" y="6" width="6" height="9" rx="1.800"/><rect x="13" y="11.500" width="19" height="23" rx="3"/>' + sb, 2.4),
    n: G('<path d="M14.500 34c0-9 2-13 6-16.500l-5.500 1.500c-2.500.500-4-2-2.500-4l7-8.500c.800-1.800 1.800-2.800 3.500-3l1 3.500c6.500 2.500 9.500 9 9.500 17.500V34z"/><circle cx="20.500" cy="12.800" r="1.400" fill="var(--pd)" stroke="none"/>' + sb, 2.4),
    b: G('<path d="M16 34c1-2.500 2.500-4 4-5.500-3.500-1.800-5.500-5-5.500-8.500 0-4.500 3-8.500 8-12 5 3.500 8 7.500 8 12 0 3.500-2 6.700-5.500 8.500 1.500 1.500 3 3 4 5.500z"/><circle cx="22.500" cy="5.800" r="2.800"/><path d="M22.500 15v8" fill="none" stroke="var(--pd)"/>' + sb, 2.4),
    q: G('<path d="M10.500 14.500l4.500 19.500h15l4.500-19.500-6.500 7-5.500-10-5.500 10z"/><circle cx="10" cy="12.500" r="3"/><circle cx="22.500" cy="8.500" r="3"/><circle cx="35" cy="12.500" r="3"/>' + sb, 2.4),
    k: G('<path d="M20.700 2.500h3.600v3.700H28v3.600h-3.700V16h-3.600V9.800H17V6.200h3.700z" stroke-width="1.800"/><path d="M15 34c-3.500-5.500-5.500-10-2.500-14 2.500-3.200 7-2.500 10 1 3-3.500 7.500-4.200 10-1 3 4 1 8.500-2.500 14z"/>' + sb, 2.4)
  };

  // Signal: the shape shows how the piece moves.
  var star = '', i, a, rr;
  for (i = 0; i < 16; i++) { a = Math.PI * i / 8 - Math.PI / 2; rr = i % 2 ? 8.5 : 18.5; star += (22.5 + rr * Math.cos(a)).toFixed(1) + ',' + (22.5 + rr * Math.sin(a)).toFixed(1) + ' '; }
  var det = function (d) { return '<path d="' + d + '" fill="none" stroke="var(--pd)" stroke-width="1.6"/>'; };
  sets.signal = {
    p: G('<circle cx="22.5" cy="24" r="9"/>' + det('M22.5 28.500v-9M19 22.500l3.500-3.500 3.500 3.500'), 1.8),
    r: G('<rect x="8.500" y="8.500" width="28" height="28"/>' + det('M22.500 13v19M13 22.500h19'), 1.8),
    n: G('<path d="M11 6.500h11.500v20H35V38.500H11z"/>' + det('M16.700 12v20.500H29'), 1.8),
    b: G('<path d="M22.500 4.500l18 18-18 18-18-18z"/>' + det('M15.500 15.500l14 14M29.500 15.500l-14 14'), 1.8),
    q: G('<polygon points="' + star.trim() + '"/><circle cx="22.5" cy="22.5" r="2.600" fill="var(--pd)" stroke="none"/>', 1.8),
    k: G('<path d="M20.500 3h4v4.500H29v4h-4.500V15h-4v-3.500H16v-4h4.500z"/><circle cx="22.500" cy="28" r="12"/><circle cx="22.500" cy="28" r="5.500" fill="none" stroke="var(--pd)" stroke-width="1.600"/>', 1.8)
  };

  // Type: counters with the notation letter, like a printed diagram.
  var disc = function (ch, r) {
    return G('<circle cx="22.5" cy="22.5" r="' + r + '"/><circle cx="22.5" cy="22.5" r="' + (r - 3.2) + '" fill="none" stroke="var(--pd)" stroke-width=".7" opacity=".6"/>', 1.8) +
      '<text x="22.5" y="' + (r > 15 ? 31.5 : 29.7) + '" text-anchor="middle" font-family="\'Big Shoulders Display\',\'Arial Narrow\',Arial,sans-serif" font-weight="800" font-size="' + (r > 15 ? 25 : 20) + '" fill="var(--pd)">' + ch + '</text>';
  };
  sets.type = { p: disc('P', 13.5), r: disc('R', 18.5), n: disc('N', 18.5), b: disc('B', 18.5), q: disc('Q', 18.5), k: disc('K', 18.5) };

  // Arcade: 11 by 11 pixel pieces. X outline, o fill.
  var px = {
    p: ['...........', '....XXX....', '...XoooX...', '...XoooX...', '....XoX....', '...XoooX...', '...XoooX...', '..XoooooX..', '..XoooooX..', '.XoooooooX.', '.XXXXXXXXX.'],
    r: ['...........', '.XX.XXX.XX.', '.XoXXoXXoX.', '.XoooooooX.', '..XoooooX..', '..XoooooX..', '..XoooooX..', '..XoooooX..', '.XoooooooX.', '.XoooooooX.', '.XXXXXXXXX.'],
    n: ['...........', '....XX.X...', '...XooXoX..', '..XoooooX..', '.XoXooooX..', '.XooXoooX..', '..XXXooooX.', '...XoooooX.', '..XooooooX.', '.XoooooooX.', '.XXXXXXXXX.'],
    b: ['.....X.....', '....XoX....', '...XoooX...', '...XoXoX...', '...XoooX...', '....XoX....', '...XoooX...', '...XoooX...', '..XoooooX..', '.XoooooooX.', '.XXXXXXXXX.'],
    q: ['.X...X...X.', '.X..XoX..X.', '.XX.XoX.XX.', '.XoXXoXXoX.', '.XoooooooX.', '..XoooooX..', '..XoooooX..', '..XoooooX..', '.XoooooooX.', '.XoooooooX.', '.XXXXXXXXX.'],
    k: ['.....X.....', '....XXX....', '.....X.....', '..XXXoXXX..', '.XoooXoooX.', '.XoooooooX.', '..XoooooX..', '..XoooooX..', '.XoooooooX.', '.XoooooooX.', '.XXXXXXXXX.']
  };
  sets.arcade = {};
  Object.keys(px).forEach(function (t) {
    var o = '', x = '', c = 4, off = 0.5;
    px[t].forEach(function (row, y) { for (var k = 0; k < 11; k++) { var d = 'M' + (off + k * c) + ' ' + (off + y * c) + 'h' + c + 'v' + c + 'h-' + c + 'z'; if (row[k] === 'X') x += d; else if (row[k] === 'o') o += d; } });
    sets.arcade[t] = '<g shape-rendering="crispEdges"><path d="' + o + '" fill="var(--pf)"/><path d="' + x + '" fill="var(--ps)"/></g>';
  });

  var html = '';
  Object.keys(sets).forEach(function (s) { Object.keys(sets[s]).forEach(function (t) { html += '<symbol id="' + s + '-' + t + '" viewBox="0 0 45 45">' + sets[s][t] + '</symbol>'; }); });
  var LIST = [
    { id: 'pebble', name: 'Pebble', note: 'Chunky and tonal' },
    { id: 'tournament', name: 'Tournament', note: 'Classic silhouettes' },
    { id: 'club', name: 'Club', note: 'Simple outlines' },
    { id: 'soft', name: 'Soft', note: 'Chunky and rounded' },
    { id: 'signal', name: 'Signal', note: 'Shape shows the move' },
    { id: 'type', name: 'Type', note: 'Notation letters' },
    { id: 'arcade', name: 'Arcade', note: 'Pixel pieces' }
  ];
  if (typeof document !== 'undefined') {
    var holder = document.createElement('div');
    holder.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + html + '</defs></svg>';
    document.body.appendChild(holder.firstChild);
  }
  root.PieceSets = LIST;
})(this);
