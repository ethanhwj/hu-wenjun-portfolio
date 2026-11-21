import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter;
const stickers = [
  ['sticker sticker-brand', 'READING & THINKING', ''],
  ['sticker sticker-graphic', 'VISUAL STORYTELLING', ''],
  ['sticker sticker-ideas', 'CHASING LIGHT', '☀'],
  ['sticker sticker-motion', 'TYPE & LAYOUT', '⌘'],
  ['sticker sticker-visual', 'PIXEL PERFECTIONIST', '/icons/stickers/08.svg'],
  ['sticker sticker-digital', 'ONE MORE REVISION', '/icons/stickers/12.svg'],
  ['sticker sticker-different', 'CONTROLLED CHAOS（有序的混乱）', ''],
  ['sticker sticker-undo', 'CMD + Z（撤销人生的小失误）', '/icons/stickers/09.svg'],
  ['sticker sticker-experience', 'BETTER USER EXPERIENCES', '⊕'],
  ['sticker-orb orb-orange', '', '/icons/stickers/11.svg'],
  ['sticker-orb orb-blue', '', '/icons/stickers/10.svg'],
  ['sticker-orb orb-yellow', '', '/icons/stickers/13.svg'],
];

// Centres and angles of the initial composition on a 1280px canvas.
const initialLayout = [
  [718, 29, 0], [510, 29, 0], [425, 87, 0], [212, 65, -21],
  [636, 127, -29], [1068, 87, 0], [224, 119, -16],
  [830, 78, 18], [1130, 29, 0], [28, 29, 0], [84, 29, 0], [1220, 87, 0],
];

export default function PhysicsStickers() {
  const field = useRef(null);
  const physics = useRef(null);
  useEffect(() => {
    const el = field.current;
    const nodes = [...el.querySelectorAll('button')];
    const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8, constraintIterations: 4 });
    engine.gravity.y = 1;
    let frame, previous, accumulator = 0, running = false, disposed = false, size = '', entered = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = 1000 / 120;
    const state = { engine, bodies: [], sizes: [], poses: [], held: null, origins: [], start: null, activated: false };
    physics.current = state;
    const paint = (alpha = 1) => state.bodies.forEach((body, i) => {
      const node = nodes[i];
      const { width, height } = state.sizes[i], pose = state.poses[i];
      const x = pose.x + (body.position.x - pose.x) * alpha;
      const y = pose.y + (body.position.y - pose.y) * alpha;
      const angle = pose.angle + (body.angle - pose.angle) * alpha;
      node.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0) rotate(${angle}rad)`;
    });
    const tick = time => {
      if (disposed) return;
      accumulator += Math.min(time - (previous ?? time), 50);
      previous = time;
      while (accumulator >= step) {
        state.bodies.forEach((b, i) => { state.poses[i] = { x: b.position.x, y: b.position.y, angle: b.angle }; });
        Engine.update(engine, step);
        accumulator -= step;
      }
      paint(accumulator / step);
      if (state.held || state.bodies.some(b => !b.isSleeping)) frame = requestAnimationFrame(tick);
      else { paint(); running = false; previous = undefined; accumulator = 0; }
    };
    state.start = () => {
      if (!state.activated) {
        state.activated = true;
        state.bodies.forEach(b => Sleeping.set(b, false));
      }
      if (!running) { running = true; previous = undefined; frame = requestAnimationFrame(tick); }
    };
    const setup = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h || `${w}:${h}` === size) return;
      size = `${w}:${h}`;
      cancelAnimationFrame(frame); running = false; previous = undefined; accumulator = 0;
      Composite.clear(engine.world, false); Engine.clear(engine); state.held = null; state.activated = false;
      nodes.forEach(node => { node.removeAttribute('style'); node.classList.remove('is-dragging'); });
      state.sizes = nodes.map(node => ({ width: node.offsetWidth, height: node.offsetHeight }));
      state.bodies = nodes.map((node, i) => {
        const { width, height } = state.sizes[i];
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        const layout = w > 700 ? initialLayout[i] : null;
        const scale = w / 1280;
        const angle = layout ? layout[2] * Math.PI / 180 : Math.atan2(matrix.b, matrix.a);
        const x = layout ? layout[0] * scale : Math.max(width / 2 + 2, Math.min(w - width / 2 - 2, node.offsetLeft + width / 2));
        const y = layout ? h - layout[1] * scale : Math.min(h - height / 2 - 6, node.offsetTop + height / 2);
        const options = { angle, restitution: .22, friction: .35, frictionStatic: .6, frictionAir: .012, density: .002, sleepThreshold: 90 };
        const body = width === height ? Bodies.circle(x, y, width / 2, options) : Bodies.rectangle(x, y, width, height, { ...options, chamfer: { radius: height / 2 - 1, quality: 12 } });
        node.style.left = '0'; node.style.top = '0'; node.style.right = 'auto'; node.style.bottom = 'auto';
        Sleeping.set(body, true);
        return body;
      });
      state.origins = state.bodies.map(b => ({ position: { ...b.position }, angle: b.angle }));
      state.poses = state.bodies.map(b => ({ x: b.position.x, y: b.position.y, angle: b.angle }));
      Composite.add(engine.world, [
        ...state.bodies,
        Bodies.rectangle(w / 2, h + 50, w + 200, 100, { isStatic: true, friction: .7 }),
        Bodies.rectangle(-50, h / 2, 100, h * 2, { isStatic: true }),
        Bodies.rectangle(w + 50, h / 2, 100, h * 2, { isStatic: true }),
      ]);
      // Start above the canvas at staggered heights, then let the same physics
      // engine handle the entrance, landing, and subsequent pointer dragging.
      if (!entered && !reducedMotion) {
        state.bodies.forEach((body, i) => {
          const { width, height } = state.sizes[i];
          const x = Math.max(width / 2 + 4, Math.min(w - width / 2 - 4, body.position.x));
          Body.setPosition(body, { x, y: -100 - i * 85 - height });
          Body.setAngularVelocity(body, (i % 3 - 1) * .008);
        });
        state.poses = state.bodies.map(b => ({ x: b.position.x, y: b.position.y, angle: b.angle }));
        state.start();
      }
      entered = true;
      paint();
    };
    setup();
    const observer = new ResizeObserver(setup); observer.observe(el);
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(frame); Composite.clear(engine.world, false); Engine.clear(engine); physics.current = null; };
  }, []);

  const point = e => {
    const r = field.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const release = e => {
    const s = physics.current;
    if (!s?.held || s.held.pointer !== e.pointerId) return;
    Composite.remove(s.engine.world, s.held.constraint);
    Sleeping.set(s.held.body, false);
    s.held = null;
    e.currentTarget.classList.remove('is-dragging');
    s.start();
  };
  return <div ref={field} className="sticker-field" aria-label="带重力碰撞的可拖动设计标签">
    {stickers.map(([className, text, symbol], i) => <button type="button" key={className} className={className}
      aria-label={`${text || '彩色圆形标签'}，拖动后松开可下落碰撞；方向键移动，Home 复位`}
      onPointerDown={e => {
        if (e.button !== 0) return;
        const s = physics.current; if (!s || s.held) return;
        e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.classList.add('is-dragging');
        const body = s.bodies[i], p = point(e);
        Sleeping.set(body, false);
        const constraint = Constraint.create({ pointA: p, bodyB: body, pointB: { x: p.x - body.position.x, y: p.y - body.position.y }, length: 0, stiffness: .6, damping: .2, angularStiffness: .8 });
        s.held = { pointer: e.pointerId, constraint, body }; Composite.add(s.engine.world, constraint); s.start();
      }}
      onPointerMove={e => {
        const held = physics.current?.held;
        if (held?.pointer === e.pointerId) {
          Sleeping.set(held.body, false);
          held.constraint.pointA = point(e);
        }
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onKeyDown={e => {
        const s = physics.current; if (!s) return;
        const body = s.bodies[i];
        if (e.key === 'Home') { e.preventDefault(); Sleeping.set(body, false); Body.setPosition(body, s.origins[i].position); Body.setAngle(body, s.origins[i].angle); Body.setVelocity(body, { x: 0, y: 0 }); Body.setAngularVelocity(body, 0); s.start(); return; }
        const d = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -50], ArrowDown: [0, 24] }[e.key];
        if (d) { e.preventDefault(); Sleeping.set(body, false); Body.translate(body, { x: d[0], y: d[1] }); s.start(); }
      }}>
      {text}{symbol && (symbol.startsWith('/') ? <img className="sticker-asset-icon" src={symbol} alt="" aria-hidden="true" draggable={false} width="18" height="18"/> : text ? <span aria-hidden="true">{symbol}</span> : symbol)}
    </button>)}
  </div>;
}
