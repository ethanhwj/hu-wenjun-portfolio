import React, { useEffect, useRef, useState } from 'react';
import artwork from './playground-artwork.json';

// Scatter the work around the canvas, leaving the title area clear.
const layout = [
  [650, 480, 300, -8], [1590, 470, 305, 7], [1980, 520, 290, -5],
  [205, 580, 380, 5], [663, 1103, 400, -6], [1510, 1137, 390, 5],
  [1015, 1393, 400, -4], [1060, 495, 410, 4], [2030, 1065, 380, 8],
  [205, 1005, 365, -5], [455, 1430, 380, 6], [1540, 1475, 390, -6],
];
const labels = [
  ['花の诗🌸 (练习)', '#084e62', '#ffffff'],
  ['章子怡📓 (练习)', '#c6becf', '#25212c'],
  ['人像实验🎨', '#e9bec8', '#34252c'],
  ['M-net📱 POSM', '#cae5f1', '#203744'],
  ['HUAWEI·生活服务APP☀️ TVC', '#e9edf0', '#2c3842'],
  ['HUAWEI · 你好，今天✈️ TVC', '#6b7f7f', '#ffffff'],
  ['HUAWEI·华为天际通流量卡🧗🏻 TVC', '#506036', '#ffffff'],
  ['JD京东×小熊U租 🖨️  病毒视频', '#cbe1f0', '#263d52'],
  ['腾讯·红魔6手机📱 TVC', '#797997', '#ffffff'],
  ['COREDY·扫地机器人🐶 TVC', '#e3e5d7', '#34392b'],
  ['迈瑞 UX5内窥镜🔬', '#8ab6e0', '#21364c'],
  ['WMBYY 武步运动手表⌚️', '#788d5d', '#ffffff'],
];
const pieces = artwork.map((image, index) => {
  const [x, y, w, angle] = layout[index];
  return { ...image, label: labels[index][0], labelColor: labels[index][1], labelInk: labels[index][2], x, y, w, angle, h: w * image.height / image.width };
});

export default function PlaygroundPage() {
  const canvas = useRef(null), world = useRef(null);
  const view = useRef({ x: 0, y: 0, zoom: .8 });
  const gesture = useRef(null), layer = useRef(10), frame = useRef(0);
  const [zoom, setZoom] = useState(80);
  function draw() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const v = view.current;
      world.current.style.transform = `translate(-50%, -50%) translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
    });
  }
  function changeZoom(delta) {
    view.current.zoom = Math.max(.15, Math.min(1.3, view.current.zoom + delta));
    setZoom(Math.round(view.current.zoom * 100));
    draw();
  }
  function reset() {
    view.current = { x: 0, y: 0, zoom: window.innerWidth < 700 ? .35 : .65 };
    setZoom(Math.round(view.current.zoom * 100));
    draw();
  }
  useEffect(() => {
    reset();
    const element = canvas.current;
    const wheel = event => {
      if (event.target.closest('.canvas-controls')) return;
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) changeZoom(event.deltaY > 0 ? -.025 : .025);
      else {
        view.current.x = Math.max(-1250, Math.min(1250, view.current.x - event.deltaX));
        view.current.y = Math.max(-1000, Math.min(1000, view.current.y - event.deltaY));
        draw();
      }
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => { element.removeEventListener('wheel', wheel); cancelAnimationFrame(frame.current); };
  }, []);
  function start(event) {
    if (event.button !== 0 || event.target.closest('.canvas-controls')) return;
    const piece = event.target.closest('.canvas-piece');
    if (piece) {
      piece.classList.add('piece-dragging');
      piece.style.zIndex = String(++layer.current);
    }
    gesture.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      startX: view.current.x, startY: view.current.y, piece,
      pieceX: piece ? parseFloat(piece.style.left) : 0,
      pieceY: piece ? parseFloat(piece.style.top) : 0,
    };
    canvas.current.setPointerCapture(event.pointerId);
    canvas.current.classList.add('panning');
  }
  function move(event) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x, dy = event.clientY - g.y;
    if (g.piece) {
      g.piece.style.translate = `${dx / view.current.zoom}px ${dy / view.current.zoom}px`;
      g.dx = dx / view.current.zoom;
      g.dy = dy / view.current.zoom;
    } else {
      view.current.x = Math.max(-1250, Math.min(1250, g.startX + dx));
      view.current.y = Math.max(-1000, Math.min(1000, g.startY + dy));
      draw();
    }
  }
  function finish(event) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    if (g.piece) {
      g.piece.style.left = `${g.pieceX + (g.dx || 0)}px`;
      g.piece.style.top = `${g.pieceY + (g.dy || 0)}px`;
      g.piece.style.translate = '';
      g.piece.classList.remove('piece-dragging');
    }
    gesture.current = null;
    canvas.current.classList.remove('panning');
    if (canvas.current.hasPointerCapture(event.pointerId)) canvas.current.releasePointerCapture(event.pointerId);
  }
  return <section ref={canvas} className="exploration-canvas" id="playground-content" aria-label="可拖动探索的作品画布" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}>
    <div className="canvas-title"><span className="playground-folder-icon playground-folder-material" aria-hidden="true"><img src="/icons/playground-folder-v2.png" alt="" width="1000" height="1000" draggable="false" /></span><h1>Playground</h1><p>旧作品、副业及随性探索</p></div>
    <div ref={world} className="exploration-world">
      {pieces.map(piece => <div key={piece.id} className="canvas-piece" onPointerEnter={event => { event.currentTarget.style.zIndex = String(++layer.current); }} role="group" tabIndex={0} aria-label={`作品 ${piece.id}，可用方向键移动`} style={{ left: piece.x, top: piece.y, width: piece.w, '--piece-angle': `${piece.angle}deg`, '--bubble-color': piece.labelColor, '--bubble-ink': piece.labelInk }} onKeyDown={event => {
        const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (!direction) return;
        event.preventDefault();
        const distance = event.shiftKey ? 50 : 15;
        event.currentTarget.style.left = `${parseFloat(event.currentTarget.style.left) + direction[0] * distance}px`;
        event.currentTarget.style.top = `${parseFloat(event.currentTarget.style.top) + direction[1] * distance}px`;
        event.currentTarget.style.zIndex = String(++layer.current);
      }}>
        <div className="canvas-art" style={{ height: piece.h }}><img src={piece.src} alt={`视觉探索作品 ${piece.id}`} width={piece.width} height={piece.height} draggable="false" decoding="async" /></div>
        <span className="canvas-bubble" aria-hidden="true">{piece.label}</span>
      </div>)}
    </div>
    <div className="canvas-controls"><button onClick={reset} aria-label="画布回到中心">回到中心</button><span className="canvas-drag-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" /></svg>拖动即可移动</span><div className="canvas-zoom"><button onClick={() => changeZoom(-.1)} aria-label="缩小画布">−</button><output aria-live="polite">{zoom}%</output><button onClick={() => changeZoom(.1)} aria-label="放大画布">＋</button></div></div>
  </section>;
}
