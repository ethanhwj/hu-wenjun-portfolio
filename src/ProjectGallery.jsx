import React, { useEffect, useRef, useState } from 'react';

const images = ['主视觉', '设计细节', '视觉应用'];
const speed = 42;

export default function ProjectGallery({ project, onOpen }) {
  const rail = useRef(null);
  const cursor = useRef(null);
  const cycle = useRef(0);
  const drag = useRef(null);
  const touch = useRef(false);
  const resumeAfter = useRef(0);
  const suppressClick = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  function wrap(left) {
    const length = cycle.current;
    return length ? left - Math.round((left - length) / length) * length : left;
  }

  useEffect(() => {
    const track = rail.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);

    const measure = () => {
      const length = track.children[images.length].offsetLeft - track.firstElementChild.offsetLeft;
      if (!length || length === cycle.current) return;
      track.scrollLeft = cycle.current ? track.scrollLeft / cycle.current * length : length;
      cycle.current = length;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    return () => {
      resize.disconnect();
      motion.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const track = rail.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    let frame = 0;
    let last = 0;
    let remainder = 0;

    function tick(time) {
      const interacting = drag.current || touch.current || time < resumeAfter.current;
      const hasFocus = track.matches(':focus-visible') || track.querySelector(':focus-visible');
      if (last && cycle.current && !interacting && !hasFocus) {
        remainder += Math.min(time - last, 40) * speed / 1000;
        const pixels = Math.floor(remainder);
        if (pixels) {
          track.scrollLeft = wrap(track.scrollLeft + pixels);
          remainder -= pixels;
        }
      }
      last = time;
      frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      last = 0;
      if (entry.isIntersecting) frame = requestAnimationFrame(tick);
    });
    observer.observe(track);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  function startDrag(event) {
    suppressClick.current = false;
    if (event.pointerType !== 'mouse') {
      touch.current = true;
      return;
    }
    if (event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft };
  }

  function moveCursor(event) {
    if (event.pointerType !== 'mouse') return;
    const hint = cursor.current;
    hint.style.left = event.clientX + 'px';
    hint.style.top = event.clientY + 'px';
  }

  function moveDrag(event) {
    moveCursor(event);
    const start = drag.current;
    if (!start || start.id !== event.pointerId || event.buttons !== 1) return;
    const distance = event.clientX - start.x;
    const track = event.currentTarget;
    if (!suppressClick.current && Math.abs(distance) < 6) return;
    if (!suppressClick.current) {
      suppressClick.current = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('dragging');
    }
    track.scrollLeft = wrap(start.left - distance);
  }

  function endDrag(event) {
    if (touch.current && event.pointerType !== 'mouse') {
      touch.current = false;
      resumeAfter.current = performance.now() + 400;
    }
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.classList.remove('dragging');
  }

  function moveWithKey(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const track = event.currentTarget;
    track.scrollLeft = wrap(track.scrollLeft);
    track.scrollBy({
      left: (event.key === 'ArrowRight' ? 1 : -1) * track.clientWidth * .65,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  }

  return (
    <div className="case-gallery-wrap">
      <div className="case-gallery" ref={rail} tabIndex={0} role="region"
        aria-label={project.name + ' 作品画廊，可横向滚动'}
        onKeyDown={moveWithKey} onPointerEnter={moveCursor} onPointerDown={startDrag} onPointerMove={moveDrag}
        onScroll={() => {
          const now = performance.now();
          if (touch.current || now < resumeAfter.current) resumeAfter.current = now + 400;
        }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
        onPointerLeave={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) endDrag(event); }}
        onClickCapture={event => {
          if (!event.detail || !suppressClick.current) return;
          event.stopPropagation();
          suppressClick.current = false;
        }}>
        {[0, 1, 2].flatMap(copy => images.map((label, index) => (
          <button key={copy + '-' + index} className="gallery-frame" type="button"
            data-gallery-image={index}
            aria-hidden={copy !== 1 ? true : undefined} tabIndex={copy !== 1 ? -1 : undefined}
            onClick={event => onOpen(project, event)}
            aria-label={'查看 ' + project.name + ' 第 ' + (index + 1) + ' 张作品'}>
            <img src={project.id === 'cest-la-vie' ? '/works/chengle/' + ['04', '05', '07'][index] + '-2200.webp' : project.id === 'sheld' ? '/works/sheld/' + ['23', '17', '11'][index] + '-2200.webp' : project.id === 'new-choice' ? '/works/newchoice/' + ['01', '02', '04'][index] + '-2200.webp' : project.id === 'sogue' ? '/works/sogue/' + ['06', '07', '08'][index] + '-2200.webp' : project.id === 'blinblin' ? '/works/blinblin/' + ['03', '05', '07'][index] + '-2200.webp' : '/works/gallery-' + project.cover + '-' + index + '.jpg'} alt={project.name + ' ' + label} loading="lazy" draggable="false" />
            <span className="gallery-zoom" aria-hidden="true">＋</span>
          </button>
        )))}
      </div>
      <span className="gallery-cursor" ref={cursor} aria-hidden="true">
        <img src="/icons/stickers/14.svg" alt="" draggable="false" width="25" height="25"/>
      </span>
    </div>
  );
}
