(() => {
  const c = document.querySelector('canvas'),
    g = c.getContext('2d'),
    W = 960,
    H = 600,
    t = document.querySelector('#toast'),
    n = document.querySelector('#n');
  g.imageSmoothingEnabled = false;
  let tm = 0,
    last = 0,
    found = new Set(),
    sel = null;
  const R = (x, y, w, h, col) => {
      g.fillStyle = col;
      g.fillRect(x | 0, y | 0, w | 0, h | 0)
    },
    E = (x, y, a, b, col) => {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x, y, a, b, 0, 0, 7);
      g.fill()
    },
    L = (x, y, X, Y, col, w = 2) => {
      g.strokeStyle = col;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(X, Y);
      g.stroke()
    },
    B = (x, y, w, h, rad, col) => {
      g.fillStyle = col;
      g.beginPath();
      g.roundRect(x, y, w, h, rad);
      g.fill()
    };
  const cats = [
    ['Mochi', 300, 345, '#e9b39b', '#fff0dc', '#d98e91', 'bow', 25, 'I picked a flower for you. It is the prettiest one I could find.', 'garden'],
    ['Biscuit', 580, 390, '#e6a36d', '#fff0d8', '#d58c72', 'scarf', 22, 'I saved you a fish-shaped biscuit. Happy almost-birthday!', 'shop'],
    ['Pebble', 700, 265, '#9b9bad', '#e8e6ef', '#77778f', 'bell', 19, 'The pond is quiet today. It reminded me how lovely a pause can be.', 'pond'],
    ['Pudding', 270, 475, '#f1d9a6', '#fff2d6', '#d6a66f', 'hat', 20, 'I was saving this sunny spot for you. You deserve a cosy day.', 'cottage'],
    ['Clover', 850, 300, '#b8b7b0', '#f7eee1', '#96958e', 'flower', 23, 'You are loved more than all the flowers in this garden.', 'garden'],
    ['Miso', 500, 210, '#d9a18b', '#fff0df', '#bd7e75', 'none', 21, 'Welcome to Sayanika’s Village! We are so happy you are here.', 'library']
  ].map(a => ({
    name: a[0],
    x: a[1],
    y: a[2],
    color: a[3],
    light: a[4],
    ear: a[5],
    acc: a[6],
    speed: a[7],
    line: a[8],
    fav: a[9],
    tx: a[1],
    ty: a[2],
    wait: Math.random() * 2,
    state: 'idle',
    blink: 0,
    blinkAt: 2 + Math.random() * 3,
    dir: 1,
    meet: 0,
    sit: false
  }));
  const dest = [
    [300, 345],
    [580, 390],
    [700, 265],
    [270, 475],
    [850, 300],
    [500, 210],
    [145, 250],
    [340, 320],
    [450, 230],
    [620, 310],
    [780, 250],
    [785, 400],
    [160, 390],
    [400, 450],
    [540, 480],
    [700, 450]
  ];
  const places = [
    ['cottage', 'The Little Cottage', 145, 160, 90, 'A cosy cottage with a warm window. A birthday wish is being prepared.', 'A tiny paper heart is tucked beside the cottage steps.'],
    ['library', 'The Cat Library', 450, 145, 95, 'A library full of stories, sleepy cats and one special page.', 'A bookmark says: “You make ordinary days feel special.”'],
    ['shop', 'The Fish Shop', 775, 145, 90, 'The fish shop smells faintly of the sea. Treats are best shared.', 'A shiny fish-shaped charm glimmers near the shop.'],
    ['garden', 'The Flower Garden', 155, 355, 110, 'Flowers sway gently here. Mochi visits for a little colour.', 'A flower has a note: “Keep blooming.”'],
    ['pond', 'The Quiet Pond', 785, 365, 100, 'Pebble’s favourite place to think. Watch the water sparkle.', 'A heart-shaped ripple appears on the pond.']
  ];

  function msg(s) {
    t.textContent = s
  }

  function flower(x, y, col) {
    L(x, y + 3, x, y + 12, '#729b70', 2);
    for (let i = 0; i < 5; i++) {
      let a = i * 6.28 / 5;
      R(x + Math.cos(a) * 4 - 2, y + Math.sin(a) * 4 - 2, 4, 4, col)
    }
    R(x - 1, y - 1, 3, 3, '#f8e7aa')
  }

  function tree(x, y, s = 1) {
    E(x, y + 8 * s, 19 * s, 6 * s, '#9abb91');
    R(x - 3 * s, y - 2 * s, 6 * s, 18 * s, '#a97861');
    E(x, y - 12 * s, 17 * s, 16 * s, '#83b68d');
    E(x - 10 * s, y - 7 * s, 11 * s, 11 * s, '#9bc99a');
    E(x + 9 * s, y - 8 * s, 11 * s, 12 * s, '#75aa82')
  }

  function house(x, y, w, h, roof, wall, label) {
    E(x + w / 2, y + h + 9, w * .58, 8, '#9cbd94');
    R(x, y + 22, w, h - 22, wall);
    R(x + 5, y + 27, w - 10, h - 30, '#fff1d8');
    g.fillStyle = roof;
    g.beginPath();
    g.moveTo(x - 9, y + 29);
    g.lineTo(x + w / 2, y - 10);
    g.lineTo(x + w + 9, y + 29);
    g.fill();
    R(x + w / 2 - 9, y + h - 28, 18, 28, '#a87969');
    B(x + w / 2 - 43, y - 1, 86, 17, 6, '#fff8e9');
    g.fillStyle = '#75677d';
    g.textAlign = 'center';
    g.font = 'bold 10px sans-serif';
    g.fillText(label, x + w / 2, y + 11)
  }

  function world() {
    R(0, 0, W, H, '#b9d6ae');
    for (let y = 8; y < H; y += 24)
      for (let x = 8; x < W; x += 24) {
        let z = (x * 7 + y * 13) % 11;
        if (z < 3) R(x + (z % 2) * 4, y, 3, 2, z === 0 ? '#a5ca9b' : '#c9e1bb')
      }
    g.lineCap = 'round';
    g.strokeStyle = '#d6c39f';
    g.lineWidth = 78;
    g.beginPath();
    g.moveTo(-20, 430);
    g.bezierCurveTo(170, 420, 220, 310, 410, 330);
    g.bezierCurveTo(570, 350, 620, 470, 790, 430);
    g.bezierCurveTo(875, 410, 900, 310, 990, 290);
    g.stroke();
    g.strokeStyle = '#ead9b9';
    g.lineWidth = 68;
    g.stroke();

    house(65, 95, 155, 112, '#d99ba0', '#f1d8c6', 'COTTAGE');
    house(365, 78, 170, 120, '#aaa5c8', '#e8d8c7', 'CAT LIBRARY');
    house(705, 88, 145, 110, '#e4b77d', '#f2dfbd', 'FISH SHOP');
    B(65, 285, 185, 112, 18, '#a8ca99');
    for (let i = 0; i < 24; i++) flower(82 + i % 6 * 29, 300 + (i / 6 | 0) * 25, ['#efb8cc', '#f4d58d', '#c7b8e7', '#fff0d0'][i % 4]);
    E(815, 445, 70, 39, '#8ebfca');
    E(815, 441, 61, 31, '#a8d4d5');
    L(790, 432, 808, 429, '#e7f4e7', 3);
    E(790, 450, 9, 4, '#83b88d');

    [
      [285, 110, 1],
      [570, 115, .9],
      [890, 95, 1.1],
      [45, 510, 1.1],
      [340, 520, .9],
      [620, 540, 1],
      [915, 510, 1.1],
      [880, 245, .8],
      [290, 245, .7]
    ].forEach(a => tree(...a));
    [
      [250, 165],
      [540, 180],
      [645, 260],
      [860, 410],
      [145, 480],
      [480, 520],
      [760, 520],
      [550, 270],
      [335, 405]
    ].forEach(([x, y]) => {
      E(x, y + 5, 17, 7, '#93bc8b');
      E(x - 9, y, 10, 9, '#a9ce9c');
      E(x + 3, y - 4, 12, 11, '#8fbd8b')
    });
    R(468, 230, 16, 78, '#a87961');
    B(340, 202, 270, 56, 5, '#b98769');
    B(347, 208, 256, 44, 3, '#f5e4c9');
    g.fillStyle = '#75627a';
    g.textAlign = 'center';
    g.font = '800 20px sans-serif';
    g.fillText('Sayanika’s Village', 475, 237);
    flower(632, 253, '#f0c3cf');
  }
  // function cat(c) { let x = c.x, y = c.y + Math.sin(tm * 7 + c.x) * 1.2; g.save(); g.translate(x, y); g.scale(c.dir, 1); g.strokeStyle = c.color; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(13, -3); g.quadraticCurveTo(28, -19 + Math.sin(tm * 4 + c.x) * 4, 24, -31); g.stroke(); g.strokeStyle = c.ear; g.lineWidth = 3; g.stroke(); R(-10, 3, 7, 9, c.ear); R(5, 3, 7, 9, c.ear); B(-14, -13, 29, 22, 7, c.color); B(-11, -11, 23, 16, 6, c.light); R(-12, -29, 8, 12, c.color); R(5, -29, 8, 12, c.color); R(-10, -27, 4, 7, '#eaa4a3'); R(7, -27, 4, 7, '#eaa4a3'); B(-15, -29, 32, 25, 8, c.color); B(-12, -26, 26, 20, 7, c.light); R(-11, -18, 7, 5, c.color); R(5, -18, 7, 5, c.color); if (c.blink > 0) { L(-8, -17, -3, -17, '#514b58', 2); L(5, -17, 10, -17, '#514b58', 2) } else { R(-8, -18, 3, 4, '#514b58'); R(6, -18, 3, 4, '#514b58') } R(-2, -12, 4, 3, '#bd8582'); L(0, -9, -2, -7, '#8b7072', 1); L(0, -9, 2, -7, '#8b7072', 1); if (c.acc === 'bow') { R(-3, -30, 6, 4, '#e98fa9'); R(-8, -33, 5, 5, '#e98fa9'); R(3, -33, 5, 5, '#e98fa9') } if (c.acc === 'scarf') { R(-10, -5, 20, 4, '#8fb8a0'); R(5, -3, 5, 10, '#8fb8a0') } if (c.acc === 'bell') { R(-5, -5, 10, 4, '#9fc7d0'); R(-1, -1, 4, 4, '#f5df9b') } if (c.acc === 'hat') { R(-11, -34, 22, 4, '#d9b76f'); R(-6, -42, 13, 9, '#d9b76f') } if (c.acc === 'flower') { R(9, -35, 5, 5, '#e99bb3'); R(13, -31, 4, 4, '#f5d47c') } g.restore(); if (sel === c) { B(x - 30, y - 52, 60, 16, 6, '#fff8e9'); g.fillStyle = '#75677d'; g.textAlign = 'center'; g.font = 'bold 10px sans-serif'; g.fillText(c.name, x, y - 40) } }

  function cat(c) {
    const x = c.x;
    const y = c.y + Math.sin(tm * 7 + c.x) * 1.2;

    g.save();
    g.translate(x, y);
    g.scale(c.dir, 1);
    g.scale(0.8, 0.8);

    // Tail — animated swishing motion
    const wag = Math.sin(tm * 5 + c.x) * 9;

    g.lineCap = 'round';
    g.lineJoin = 'round';

    g.strokeStyle = c.ear;
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(11, -5);
    g.quadraticCurveTo(31, -17 + wag, 25, -32 + wag);
    g.stroke();

    g.strokeStyle = c.color;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(11, -5);
    g.quadraticCurveTo(31, -17 + wag, 25, -32 + wag);
    g.stroke();

    // Back legs
    E(-9, 1, 7, 6, c.color);
    E(8, 1, 7, 6, c.color);

    // Rounded body
    E(0, -13, 15, 19, c.color);
    E(-2, -12, 11, 15, c.light);

    // Front paws
    E(-10, 1, 6, 5, c.light);
    E(10, 1, 6, 5, c.light);

    // Neck and head
    E(0, -27, 11, 8, c.color);
    E(0, -35, 15, 14, c.color);

    // Pointed ears
    g.fillStyle = c.color;
    g.beginPath();
    g.moveTo(-13, -39);
    g.lineTo(-13, -54);
    g.lineTo(-3, -44);
    g.closePath();
    g.fill();

    g.beginPath();
    g.moveTo(3, -44);
    g.lineTo(13, -54);
    g.lineTo(13, -39);
    g.closePath();
    g.fill();

    // Inner ears
    g.fillStyle = '#eaa4a3';
    g.beginPath();
    g.moveTo(-11, -43);
    g.lineTo(-11, -50);
    g.lineTo(-6, -44);
    g.closePath();
    g.fill();

    g.beginPath();
    g.moveTo(6, -44);
    g.lineTo(11, -50);
    g.lineTo(11, -43);
    g.closePath();
    g.fill();

    // Face
    E(-5, -35, 2.1, c.blink > 0 ? 0.8 : 3, '#514b58');
    E(5, -35, 2.1, c.blink > 0 ? 0.8 : 3, '#514b58');

    // Muzzle
    E(-3, -29, 4, 3, '#fff0dc');
    E(3, -29, 4, 3, '#fff0dc');

    E(0, -30, 2, 1.8, '#bd8582');

    L(0, -28, -2, -26, '#8b7072', 1);
    L(0, -28, 2, -26, '#8b7072', 1);

    // Whiskers
    L(-9, -29, -17, -31, '#9b8580', 1);
    L(-9, -27, -17, -26, '#9b8580', 1);
    L(9, -29, 17, -31, '#9b8580', 1);
    L(9, -27, 17, -26, '#9b8580', 1);

    // Accessories
    if (c.acc === 'bow') {
      E(-5, -49, 5, 4, '#e98fa9');
      E(5, -49, 5, 4, '#e98fa9');
      E(0, -49, 2, 2, '#f5d47c');
    }

    if (c.acc === 'scarf') {
      B(-11, -23, 22, 5, 3, '#8fb8a0');
      R(5, -20, 5, 10, '#8fb8a0');
    }

    if (c.acc === 'bell') {
      E(0, -23, 4, 4, '#f5df9b');
      E(0, -22, 1, 1, '#9b8580');
    }

    if (c.acc === 'hat') {
      B(-12, -53, 24, 4, 3, '#d9b76f');
      B(-7, -62, 14, 11, 4, '#d9b76f');
    }

    if (c.acc === 'flower') {
      flower(13, -49, '#e99bb3');
    }

    g.restore();

    // Selected cat name
    if (sel === c) {
      B(x - 32, y - 72, 64, 17, 6, '#fff8e9');
      g.fillStyle = '#75677d';
      g.textAlign = 'center';
      g.font = 'bold 10px sans-serif';
      g.fillText(c.name, x, y - 60);
    }
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function update(dt) {
    tm += dt;
    cats.forEach(c => {
      c.blinkAt -= dt;
      if (c.blinkAt <= 0) {
        c.blink = .14;
        c.blinkAt = 2.5 + Math.random() * 3
      }
      if (c.blink > 0) c.blink -= dt;
      if (c.state === 'walk') {
        let dx = c.tx - c.x,
          dy = c.ty - c.y,
          d = Math.hypot(dx, dy);
        if (d < 3) {
          c.state = 'idle';
          c.wait = 1.5 + Math.random() * 2.5
        } else {
          c.dir = dx >= 0 ? 1 : -1;
          c.x += dx / d * c.speed * dt;
          c.y += dy / d * c.speed * dt
        }
      } else {
        c.wait -= dt;
        if (c.wait <= 0) {
          c.state = 'walk';
          let q = dest.filter(p => Math.hypot(p[0] - c.x, p[1] - c.y) > 60);
          [c.tx, c.ty] = pick(q)
        }
      }
    });
    for (let i = 0; i < cats.length; i++)
      for (let j = i + 1; j < cats.length; j++) {
        let a = cats[i],
          b = cats[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 34 && a.meet <= 0 && b.meet <= 0) {
          a.meet = b.meet = 2;
          a.state = b.state = 'idle';
          a.wait = b.wait = 2;
          a.dir = b.x >= a.x ? 1 : -1;
          b.dir = -a.dir
        }
      }
    cats.forEach(c => c.meet = Math.max(0, c.meet - dt))
  }

  function add(id, text) {
    if (!found.has(id)) {
      found.add(id);
      n.textContent = found.size;
      msg('Discovery found! ' + text)
    }
  }

  function click(x, y) {
    let a = [...cats].reverse().find(c => Math.hypot(c.x - x, c.y - y + 5) < 28);
    if (a) {
      sel = a;
      msg(a.name + ': “' + a.line + '”');
      return
    }
    sel = null;
    let p = places.find(p => Math.hypot(p[2] - x, p[3] - y) < p[4]);
    if (p) {
      if (!found.has(p[0])) add(p[0], p[6]);
      else msg(p[5]);
      return
    }
    let hs = [
      [300, 270],
      [620, 290],
      [90, 455],
      [870, 465],
      [505, 500]
    ];
    let i = hs.findIndex((h, i) => !found.has('h' + i) && Math.hypot(h[0] - x, h[1] - y) < 23);
    if (i >= 0) {
      add('h' + i, 'You found a hidden heart — a little reminder that you are cherished.');
      return
    }
    msg('A gentle breeze moves through Sayanika’s Village. Take your time and look around.')
  }
  c.addEventListener('click', e => {
    let r = c.getBoundingClientRect();
    click((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height)
  });

  function draw() {
    world();
    [
      [300, 270],
      [620, 290],
      [90, 455],
      [870, 465],
      [505, 500]
    ].forEach((h, i) => {
      if (!found.has('h' + i)) {
        g.fillStyle = '#e99eae';
        g.font = 'bold 19px sans-serif';
        g.textAlign = 'center';
        g.fillText('♥', ...h)
      }
    });
    cats.slice().sort((a, b) => a.y - b.y).forEach(cat);
    B(16, 15, 190, 34, 10, '#fff8e8');
    g.fillStyle = '#786b83';
    g.font = 'bold 13px sans-serif';
    g.textAlign = 'left';
    g.fillText('♡ A village full of little joys', 28, 37)
  }

  function loop(ts) {
    if (!last) last = ts;
    let dt = Math.min((ts - last) / 1000, .04);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('mute-btn');

  btn.addEventListener('click' ,() => {
            audio.muted = !audio.muted;
            btn.textContent = audio.muted ? '🔊' : '🔇';
  })


/* ===== REOPEN BIRTHDAY MESSAGE ===== */

const reopenMessage = document.getElementById("reopen-message");
const birthdaySurprise = document.getElementById("surprise");

reopenMessage.addEventListener("click", () => {
    birthdaySurprise.classList.remove("hidden");
});

})();