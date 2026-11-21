import React, { useEffect, useRef } from 'react';

export default function ScrollProgress({ variant = 'home' }) {
  const fill = useRef(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const page = document.scrollingElement;
      const distance = page.scrollHeight - page.clientHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, page.scrollTop / distance)) : 0;
      fill.current.style.transform = 'scaleX(' + progress + ')';
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    update();

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className={`home-scroll-progress${variant === 'project' ? ' project-scroll-progress' : ''}`} aria-hidden="true"><span ref={fill} /></div>;
}
