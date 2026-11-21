import React, {useEffect, useRef} from 'react';
const symbols={mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 6 9-6"/></>,about:<><circle cx="12" cy="12" r="9"/><path d="M8 14a4.5 4.5 0 0 0 8 0M8.5 9h.01M15.5 9h.01"/></>,top:<><path d="M12 20V4m-6 6 6-6 6 6"/></>};
function Icon({name}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{symbols[name]}</svg>}
export default function SiteFooter({onCopy,copied}){
 const eyes=useRef(null);
 useEffect(()=>{
  const trackers=[...eyes.current.querySelectorAll('.eye-tracker')];
  const positions=trackers.map(()=>({x:0,y:0}));
  let pointer=null,frame=0,lastTime=0;
  const animate=time=>{
   const blend=1-Math.exp(-Math.min(time-(lastTime||time-16),50)/45);
   lastTime=time;
   let moving=false;
   trackers.forEach((tracker,i)=>{
    const r=tracker.parentElement.getBoundingClientRect();
    const dx=pointer?pointer.x-r.left-r.width/2:0,dy=pointer?pointer.y-r.top-r.height/2:0;
    const angle=Math.atan2(dy,dx),strength=Math.min(1,Math.hypot(dx,dy)/90);
    const x=Math.cos(angle)*strength*r.width*.115,y=Math.sin(angle)*strength*r.height*.16;
    const p=positions[i];p.x+=(x-p.x)*blend;p.y+=(y-p.y)*blend;
    tracker.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;
    moving ||= Math.abs(x-p.x)+Math.abs(y-p.y)>.015;
   });
   frame=moving?requestAnimationFrame(animate):0;
   if(!moving)lastTime=0;
  };
  const start=()=>{if(!frame)frame=requestAnimationFrame(animate)};
  const follow=e=>{pointer={x:e.clientX,y:e.clientY};start()};
  const reset=()=>{pointer=null;start()};
  window.addEventListener('pointermove',follow,{passive:true});
  window.addEventListener('scroll',start,{passive:true});
  window.addEventListener('resize',start);
  document.documentElement.addEventListener('pointerleave',reset);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',follow);window.removeEventListener('scroll',start);window.removeEventListener('resize',start);document.documentElement.removeEventListener('pointerleave',reset)};
 },[]);
 const moveHint=e=>{
  e.currentTarget.style.setProperty('--home-x',`${Math.min(e.clientX+18,window.innerWidth-80)}px`);
  e.currentTarget.style.setProperty('--home-y',`${Math.min(e.clientY+18,window.innerHeight-80)}px`);
 };
 return <footer className="site-footer" id="contact"><div className="footer-inner wrap"><div ref={eyes} className="footer-eyes" aria-hidden="true"><span className="eye"><span className="eye-tracker"><span className="eye-pupil"><span className="eye-highlight"/></span></span></span><span className="eye"><span className="eye-tracker"><span className="eye-pupil"><span className="eye-highlight"/></span></span></span></div><div className="footer-connect"><div className="footer-message"><h2>努力创造点不一样的。</h2><p>我随时乐意聊天。</p></div><div className="footer-actions"><div className="footer-copy-control"><button onClick={onCopy} aria-label="复制联系邮箱"><Icon name="mail"/></button><span className={`copy-toast ${copied?'copy-toast-visible':''}`} role="status">{copied?'Copied!':''}</span></div><a href="/about" aria-label="关于 Hu wenjun"><Icon name="about"/></a><a href="#" aria-label="回到顶部"><Icon name="top"/></a></div></div><a className="footer-display-name" href="/" aria-label="Hu wenjun 首页" onPointerMove={moveHint}>Hu wenjun<span className="footer-home-hint" aria-hidden="true"><img src="/icons/stickers/15.svg" alt="" width="26" height="26" draggable="false"/></span></a><div className="footer-meta"><span>© {new Date().getFullYear()} Hu wenjun</span><span>Visual Designer</span></div></div></footer>
}
