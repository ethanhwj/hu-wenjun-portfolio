import React from 'react';
const pictures = [
 { id: '02', alt: '制作一杯饮品', label: '学习调酒🍸', angle: -12, y: 20 },
 { id: '03', alt: '用画笔记录创意', angle: -4, y: -18 },
 { id: '04', alt: '在桌边画画', angle: 1, y: 0 },
 { id: '05', alt: '海边的户外时光', angle: 5, y: -15 },
 { id: '06', alt: '椰林海岸旅行留影', label: '旅行途中🌴', angle: 9, y: 5 },
 { id: '07', alt: '与手作作品的合影', angle: 12, y: 19 },
 { id: '08', alt: '生活中的自拍记录', angle: 15, y: 30 },
];
function LifeCollage() {
 const collage = React.useRef(null);
 const [expanded, setExpanded] = React.useState(false);
 React.useEffect(() => {
   let timer, disposed = false;
   const show = async () => {
     await Promise.all([...collage.current.querySelectorAll('img')].map(image => image.decode().catch(() => {})));
     if (!disposed) timer = setTimeout(() => setExpanded(true), 500);
   };
   if (!window.IntersectionObserver) { show(); return () => { disposed = true; clearTimeout(timer); }; }
   const observer = new IntersectionObserver(entries => {
     if (entries.some(entry => entry.isIntersecting)) { show(); observer.disconnect(); }
   }, { threshold: .25 });
   observer.observe(collage.current);
   return () => { disposed = true; clearTimeout(timer); observer.disconnect(); };
 }, []);
 return <div ref={collage} className={'about-life-collage' + (expanded ? ' is-expanded' : '')} aria-label="我的生活照片">
   {pictures.map(({ id, alt, label, angle, y }, index) => <figure key={id} style={{ '--photo-slot': index - (pictures.length - 1) / 2, '--photo-angle': `${angle}deg`, '--photo-y': `${y}px`, '--photo-delay': `${index * 55}ms`, zIndex: pictures.length - index }}>
     <img src={`/life/${id}.webp`} alt={alt} draggable="false" />
     {label && <figcaption>{label}</figcaption>}
   </figure>)}
 </div>;
}
export default function AboutPage() {
 return <div className="about-page" id="about-content"><section className="about-page-hero wrap"><p className="eyebrow">A LITTLE ABOUT ME</p><h1>A designer with a camera<br/>and too many <em>interests.</em><span className="about-hero-continuation">Always <em>curious.</em> Always creating.</span></h1></section><LifeCollage /><section className="about-story">
  <h2>一个靠设计谋生，靠好奇心活着的人。</h2>
  <p className="story-lead">喜欢好看的东西，也喜欢琢磨它们为什么好看。对世界有很多疑问，偶尔也会认真思考一些没什么用的问题。</p>
  <div className="story-row">
    <h3>我平时都在干什么<span>WHAT I DO</span></h3>
    <div>
      <p>主要从事品牌视觉、平面设计、电商视觉，以及产品和人像精修等工作。</p>
      <p>偏爱简洁的设计，也喜欢研究字体、色彩、构图和各种视觉细节。享受把脑海中那些模糊的想法，一点点变成具体画面的过程。</p>
      <p>我不太相信设计有唯一的正确答案，但至少得让它看起来不错，而且真正有用。</p>
      <div className="about-tags"><span>品牌视觉</span><span>平面设计</span><span>视觉创意</span><span>电商视觉</span></div>
    </div>
  </div>
  <div className="story-row">
    <h3>一些不那么正经的事<span>THE LESS SERIOUS STUFF</span></h3>
    <div>
      <p>喜欢摄影、旅行、阅读、艺术和美食，兴趣有点多，而且还在不断增加。</p>
      <p>喜欢去陌生的城市走走，观察建筑、街道和人们的生活；也喜欢和不同的人聊天，听听那些与自己截然不同的人生。</p>
      <p>有时候会因为一件微不足道的小事，花上很长时间去了解它。</p>
      <p className="story-closing"><strong>毕竟，生活又不是每天都要交作品。</strong></p>
    </div>
  </div>
</section></div>;
}
