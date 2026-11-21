import React, { useEffect, useRef, useState } from 'react';
import './project-detail.css';
import sheldArtwork from './sheld-artwork.json';
import newchoiceArtwork from './newchoice-artwork.json';
import blinblinArtwork from './blinblin-artwork.json';
import imanArtwork from './iman-artwork.json';
import sogueArtwork from './sogue-artwork.json';

const chengleArtwork = [
  { id: '04', height: 2758, name: '伸展', alt: '浅橙色海报中，一位运动者抬腿伸展，橙色弧线环绕身体' },
  { id: '05', height: 2746, name: '壶铃训练', alt: '橙红色海报中，一位运动者撑地拉起壶铃，弧线叠在训练照片上' },
  { id: '06', height: 2323, name: '负重训练', alt: '黑白训练照片中，一位运动者准备拉起杠铃，画面叠加橙色弧线与字标' },
  { id: '01', height: 2073, name: '英文标志', alt: '黑底白字的 C’EST LA VIE FITNESS 标志' },
  { id: '02', height: 1931, name: '中英文标志组合', alt: '橙乐健康中文标志与 C’EST LA VIE 英文标志的三种组合' },
  { id: '03', height: 1377, name: '弧形图形与橙色色板', alt: '由三条弧线和圆点组成的图形，右侧为三种橙色色块' },
  { id: '07', height: 5186, name: '动态标志分镜', alt: '动态标志的方案与分镜，弧线和圆点移动后逐步露出英文标志' },
].sort((a, b) => a.id.localeCompare(b.id));

const imageSizes = '(max-width: 650px) calc(100vw - 36px), (max-width: 1008px) calc(100vw - 88px), 920px';

const summaryCards = [
  {
    id: 'identity',
    title: '标志系统',
    points: ['以英文标志为核心。', '搭配可独立使用的中文字标。', '组合适配不同的版面。'],
    icon: '/icons/chengle/001.svg',
  },
  {
    id: 'visual-language',
    title: '图形与色彩',
    points: ['连续弧线描绘运动轨迹。', '以深浅不同的橙色建立层次。', '串联伸展与力量训练海报。'],
    icon: '/icons/chengle/004.svg',
  },
  {
    id: 'motion',
    title: '动态分镜',
    points: ['把圆点与弧线化为动线。', '图形先经过画面。', '逐步显露完整的品牌标志。'],
    icon: '/icons/chengle/006.svg',
  },
];

function artworkUrl({ id, folder = 'chengle' }, width) {
  return '/works/' + folder + '/' + id + '-' + width + '.webp';
}

function ArtworkImage({ image, decorative = false, sizes = imageSizes, loading = 'lazy' }) {
  return (
    <img
      src={artworkUrl(image, 960)}
      srcSet={artworkUrl(image, 960) + ' 960w, ' + artworkUrl(image, 2200) + ' 2200w'}
      sizes={sizes}
      alt={decorative ? '' : image.alt}
      width={image.width || 4134}
      height={image.height}
      loading={loading}
      decoding="async"
    />
  );
}

function ArtworkCard({ index, onOpen, sizes, artwork }) {
  const image = artwork[index];
  return (
    <button className="detail-artwork-button" data-artwork-reveal type="button" onClick={() => onOpen(index)} aria-label={'放大查看 ' + image.name} aria-description={image.alt}>
      <ArtworkImage image={image} sizes={sizes} decorative />
    </button>
  );
}

function ArtworkComparison({ artwork, onOpen }) {
  const container = useRef(null);
  const position = useRef(50);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function updatePosition(value) {
    position.current = Math.max(0, Math.min(100, value));
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      container.current.style.setProperty('--comparison-position', position.current + '%');
      const slider = container.current.querySelector('[role="slider"]');
      slider.setAttribute('aria-valuenow', Math.round(position.current));
      slider.setAttribute('aria-valuetext', '日线展示 ' + Math.round(position.current) + '%');
    });
  }
  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    updatePosition((event.clientX - rect.left) / rect.width * 100);
  }
  return <div ref={container} className="detail-comparison" data-artwork-reveal>
    <ArtworkImage image={artwork[3]} />
    <div className="detail-comparison-front"><ArtworkImage image={artwork[2]} /></div>
    <div className="detail-comparison-slider" role="slider" tabIndex={0} aria-label="日线与夜线包装对比" aria-valuemin={0} aria-valuemax={100} aria-valuenow="50" aria-valuetext="日线展示 50%"
      onPointerDown={event => { event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId); move(event); }}
      onPointerMove={event => { if (event.pointerType === 'mouse' || event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }}
      onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onKeyDown={event => {
        const changes = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 };
        if (event.key in changes || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          updatePosition(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : position.current + changes[event.key]);
        }
      }}>
      <span className="detail-comparison-divider" aria-hidden="true" />
    </div>
    <button className="detail-comparison-label comparison-pink" onClick={() => onOpen(2)} aria-label="放大查看日线系列包装">日线系列</button>
    <button className="detail-comparison-label comparison-blue" onClick={() => onOpen(3)} aria-label="放大查看夜线系列包装">夜线系列</button>
  </div>;
}

function ProjectSummary({ cards = summaryCards }) {
  return (
    <nav className="detail-summary detail-reading" aria-label="项目内容">
      <ul>
        {cards.map(({ id, title, points, icon }) => (
          <li key={id} data-detail-reveal>
            <a href={'#' + id}>
              <span className="detail-summary-icon" aria-hidden="true">
                <img src={icon} alt="" width="29" height="29" />
              </span>
              
              <h3>{title}</h3>
              <ul className="detail-summary-points">{points.map(point => <li key={point}>{point}</li>)}</ul>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NextProject({ projectId }) {
  const next = projectId === 'sogue'
    ? { href: '/work/blinblin', name: 'blinblin', image: '/works/blinblin/03-960.webp' }
    : projectId === 'iman'
    ? { href: '/work/cest-la-vie', name: 'C’EST LA VIE', image: '/works/chengle/04-960.webp' }
    : projectId === 'blinblin'
    ? { href: '/work/iman', name: 'iMAN', image: '/works/iman/01-960.webp' }
    : projectId === 'sheld'
    ? { href: '/work/new-choice', name: 'new choice', image: '/works/newchoice/01-960.webp' }
    : projectId === 'new-choice'
      ? { href: '/work/sogue', name: 'Sogue 肆悦', image: '/works/sogue/06-960.webp' }
      : { href: '/work/sheld', name: 'SHēld', image: '/works/sheld/23-960.webp' };
  const link = useRef(null);
  function movePrompt(event) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    link.current.style.setProperty('--next-x', `${event.clientX - rect.left}px`);
    link.current.style.setProperty('--next-y', `${event.clientY - rect.top}px`);
  }
  return (
    <nav className="detail-next-project" aria-label="其他作品">
      <a ref={link} href={next.href} aria-label={"查看下一个项目 " + next.name} onPointerMove={movePrompt}>
        <div className="detail-next-track" aria-hidden="true">
          {[0, 1].map(group => <div className="detail-next-cycle" key={group}>
            {[0, 1, 2].map(item => <div className="detail-next-item" key={item}>
              <span>下一个项目</span>
              <img src={next.image} alt="" loading="lazy" />
            </div>)}
          </div>)}
        </div>
        <span className="detail-next-prompt" aria-hidden="true"><img src="/icons/stickers/16.svg" alt="" width="26" height="26" draggable="false"/></span>
      </a>
    </nav>
  );
}

const sheldCards = [
  { id: 'identity', title: '标志与包装', points: ['以简洁字标建立品牌识别。', '以粉色与蓝色区分产品系列。', '将渐变色彩延伸到瓶身与外盒。'], icon: '/icons/chengle/001.svg' },
  { id: 'visual-language', title: '视觉海报', points: ['柔和渐变营造轻盈氛围。', '结合产品与人物呈现品牌形象。', '通过光影强调通透质感。'], icon: '/icons/chengle/004.svg' },
  { id: 'applications', title: '产品摄影', points: ['展示单品与系列组合。', '用光影和构图突出产品轮廓。', '保持不同产品画面的视觉统一。'], icon: '/icons/chengle/006.svg' },
];

const newchoiceCards = [
  { id: 'identity', title: '品牌标志', points: ['以 nc 字母组合构建品牌符号。', '搭配简洁的英文品牌名称。', '传递轻松、亲和的品牌印象。'], icon: '/icons/chengle/001.svg' },
  { id: 'visual-language', title: '图形与色彩', points: ['以温暖红色作为主色。', '搭配浅蓝与深色形成层次。', '用趣味图形延伸童装品牌语言。'], icon: '/icons/chengle/004.svg' },
  { id: 'applications', title: '品牌应用', points: ['将标志延伸至服装吊牌。', '结合人物与图形呈现品牌氛围。', '保持应用画面的视觉统一。'], icon: '/icons/chengle/006.svg' },
];

const blinblinCards = [
  { id: 'identity', title: '品牌识别', points: ['以蓝绿色建立品牌印象。', '展示标志结构与应用方式。', '统一产品与传播中的视觉表达。'], icon: '/icons/chengle/001.svg' },
  { id: 'visual-language', title: '网页设计', points: ['围绕产品展示组织页面。', '结合品牌色与清晰的信息层级。', '让数字界面延续品牌语言。'], icon: '/icons/chengle/004.svg' },
  { id: 'applications', title: '产品摄影', points: ['呈现产品外观与材质细节。', '结合灯光、色彩与场景构图。', '展示产品在不同环境中的形象。'], icon: '/icons/chengle/006.svg' },
];

const imanCards = [
  { id: 'identity', title: '标志设计', points: ['以鲜明的企业橙色建立品牌印象。', '结合几何字形呈现硬朗气质。', '统一标志与页面的视觉语言。'], icon: '/icons/chengle/001.svg' },
  { id: 'applications', title: '网页设计', points: ['围绕产品特点组织内容。', '通过深浅背景区分信息层级。', '结合场景画面延伸产品表达。'], icon: '/icons/chengle/004.svg' },
  { id: 'product-visual', title: '产品修图', points: ['突出产品轮廓与材质细节。', '以光影强化硬朗的外观。', '保持不同展示画面的视觉统一。'], icon: '/icons/chengle/006.svg' },
];

const sogueCards = [
 { id: 'identity', title: '品牌识别', points: ['以黑白对比建立清晰的品牌印象。', '梳理字形、比例与标志规范。', '将品牌识别延展到应用物料。'], icon: '/icons/chengle/001.svg' },
 { id: 'visual-language', title: '视觉与应用', points: ['以流动肌理表现品牌个性。', '结合文字与图像传递鲜明态度。', '连接品牌设计、包装与海报表达。'], icon: '/icons/chengle/004.svg' },
 { id: 'applications', title: '创意摄影', points: ['以光影呈现产品轮廓与材质。', '通过色彩与场景建立画面层次。', '让口腔护理融入日常生活。'], icon: '/icons/chengle/006.svg' },
];

export default function ProjectDetailPage({ projectId = 'cest-la-vie' }) {
  const sogue = projectId === 'sogue';
  const iman = projectId === 'iman';
  const blinblin = projectId === 'blinblin';
  const sheld = projectId === 'sheld';
  const choice = projectId === 'new-choice';
  const artwork = sogue ? sogueArtwork : iman ? imanArtwork : blinblin ? blinblinArtwork : choice ? newchoiceArtwork : sheld ? sheldArtwork : chengleArtwork;
  const titleLines = sogue ? ['以鲜明态度', '焕新日常护理'] : iman ? ['以鲜明视觉', '回应产品个性'] : blinblin ? ['让品牌的光芒', '照进日常与户外'] : choice ? ['Wear Joy, Grow Free', '穿上快乐，自由成长'] : sheld ? ['轻盈、纯净', '感受色彩的呼吸'] : ['让运动的轨迹', '成为品牌的标记'];
  const article = useRef(null);
  const viewer = useRef(null);
  const [selected, setSelected] = useState(null);
  const current = selected === null ? null : artwork[selected];

  useEffect(() => {
    const page = article.current;
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && page.contains(target)) target.scrollIntoView({ behavior: 'instant' });
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('detail-revealed');
        observer.unobserve(target);
      }
    }, { threshold: .22 });
    // A small threshold also reveals the tall storyboard on short screens.
    const artworkObserver = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('artwork-revealed');
        artworkObserver.unobserve(target);
      }
    }, { threshold: .01, rootMargin: '0px 0px -36px 0px' });
    page.querySelectorAll('[data-artwork-reveal]').forEach(element => artworkObserver.observe(element));
    page.dataset.detailRevealReady = '';
    page.querySelectorAll('[data-detail-reveal]').forEach(element => observer.observe(element));
    return () => {
      observer.disconnect();
      artworkObserver.disconnect();
      delete page.dataset.detailRevealReady;
    };
  }, []);

  function openArtwork(index) {
    setSelected(index);
    viewer.current.showModal();
  }

  function stepArtwork(direction) {
    setSelected(index => (index + direction + artwork.length) % artwork.length);
  }

  return (
    <article className={"project-detail" + (sheld ? " detail-sheld" : "")} id="project-content" ref={article}>
      <header className="detail-masthead">
        <div className="detail-hero-wordmark">
          {sogue ? <img className="detail-sogue-logo" src="/works/sogue/logo.png" alt="Sogue 肆悦品牌标志" width="2873" height="483"/> : iman ? <img className="detail-newchoice-logo detail-iman-logo" src="/works/iman/logo.png" alt="iMAN 品牌标志" width="1000" height="1000" /> : blinblin ? <img className="detail-newchoice-logo detail-blinblin-logo" src="/works/blinblin/logo.png" alt="blinblin 品牌标志" width="1000" height="1000" /> : choice ? <img className="detail-newchoice-logo" src="/works/newchoice/logo.png" alt="New Choice 品牌标志" width="1000" height="1000" /> : <img src={sheld ? "/works/sheld/logo.png" : "/works/chengle/logo.png"} alt={sheld ? "SHēld" : "橙乐健康 C’EST LA VIE FITNESS"} width={sheld ? 1888 : 2450} height={sheld ? 672 : 585} />}
        </div>
        <h1 className={choice ? "detail-bilingual-title" : undefined} aria-label={titleLines.join("，")}>
          {titleLines.map((line, lineIndex) => (
            <span className="detail-title-line" aria-hidden="true" key={line}>
              {[...line].map((character, index) => (
                <span className="detail-title-letter" key={index} style={{ '--letter-delay': `${180 + (lineIndex * 6 + index) * 45}ms` }}>{character}</span>
              ))}
            </span>
          ))}
        </h1>
      </header>

      <section className="detail-overview detail-reading" aria-labelledby="detail-overview-title">
        <div className="detail-overview-copy">
          <h2 id="detail-overview-title" className="detail-kicker">项目概述</h2>
          {sogue ? <>
            <p>Sogue 肆悦围绕<strong>口腔护理产品</strong>展开品牌视觉设计，以鲜明的黑白对比与简洁的字形建立识别，让日常护理拥有清晰而有个性的品牌表达。</p>
            <p>项目涵盖<strong>品牌设计、包装设计、创意摄影与海报设计</strong>。从标志规范、品牌物料到产品画面，将识别系统与应用场景串联起来，保持不同触点中的视觉一致。</p>
            <p>视觉以黑白为基础，结合流动的肌理、直接的文字与富有张力的构图，传递“爱我所爱，我心有我”的品牌态度；在产品呈现中加入光彩与生活场景，让理性的产品形象多一份感受与温度。</p>
            <p>通过材质、灯光与构图的变化，突出产品的轮廓和细节。从金属质感到明亮的日常空间，让品牌从平面识别延伸到具体的使用想象。</p>
          </> : iman ? <>
            <p>iMAN 是一家生产<strong>户外三防手机</strong>的品牌，产品面向户外使用场景，强调坚固、耐用与可靠的产品形象。项目需求涵盖品牌策划、logo 设计、网页设计、网站搭建及产品卖点图设计。</p>
            <p>负责<strong>品牌视觉与产品视觉设计</strong>，将品牌识别、网页界面与产品展示串联起来，让消费者从整体形象到功能细节，都能感受到一致的品牌气质。</p>
            <p>围绕三防手机的防护特性，视觉采用较为刚硬的设计语言，以深色基调、清晰的结构与有力度的构图呈现产品的稳重感。以<strong>活跃的企业橙色</strong>点缀标志、页面重点与关键信息，让画面沉稳而不沉闷。</p>
            <p>网页围绕产品外观、功能卖点与户外场景组织内容，结合产品修图，强化机身轮廓、材质与光影细节。通过深浅背景的切换和重点信息的突出，让产品特点更直观，也让品牌表达更鲜明。</p>
          </> : blinblin ? <>
            <p>blinblin 成立于 2017 年，致力于将<strong>科技与娱乐融入优质生活</strong>，主要产品为户外激光镭射灯。品牌已进入欧洲、俄罗斯市场，并进一步拓展美国与加拿大市场，希望以更人性化、更智能的产品体验连接消费者。</p>
            <p>本项目负责<strong>品牌重塑、网站构建与品牌产品视觉设计</strong>。面对不同市场与传播场景，将品牌识别、数字界面和产品画面串联起来，建立清晰、统一且富有趣味的品牌表达。</p>
            <p>视觉概念从激光灯照射出的一闪一闪的光源出发，呼应“bulinbulin”的声音联想。围绕光点、闪烁与光线的节奏，发展完整的视觉标识，让产品的科技感与娱乐属性成为可识别的品牌语言。</p>
            <p>以明亮蓝绿色搭配深色与留白，将品牌美学延伸至网站页面、产品摄影和宣传海报。网页围绕产品特点与使用场景组织内容，摄影通过光线、材质和构图呈现细节，让品牌从视觉识别到浏览体验保持连贯。</p>
          </> : choice ? <>
            <p>New Choice 为<strong>1–10 岁孩童</strong>提供兼顾品质与性价比的儿童服饰，满足日常大多数穿搭场景。从自在玩耍到勇敢尝试，品牌希望以舒适、亲和的衣着，陪伴孩子走过成长中的每一个日常。</p>
            <p>品牌相信，孩子的天性需要在探索中被释放。<strong>Wear Joy, Grow Free——穿上快乐，自由成长。</strong>这份初心，是让衣服成为快乐探索的陪伴：自在奔跑、大胆尝试，在每一点新发现中表达自己。New Choice 希望以舒适的日常穿着与充满童趣的视觉，让成长多一些自由，也多一些快乐。</p>
            <p>围绕这一理念，标志将品牌名称的首字母 n 与 c 融合为简洁、圆润的图形，搭配清晰的英文名称，在易于识别的同时，传递童装品牌应有的柔和、活力与亲近感。</p>
            <p>以温暖红色为主色，搭配浅蓝与深色，再以富有童趣的图形延伸视觉语言。负责<strong>logo 设计</strong>，并结合服装吊牌与人物画面，呈现品牌从标志到日常穿着场景的表达，让“陪伴探索”的初心被看见。</p>
          </> : sheld ? <>
            <p>随着都市生活节奏的加快，当代女性对肌肤护理的需求逐渐从事后补救转向日常预防。SHēld 关注日晒、空气污染与生活压力带来的护理需求，以<strong>从补救式护理到预防式护理</strong>的理念，构建轻盈、纯净的护肤品牌形象。</p>
            <p>项目涵盖概念与创意策略、品牌视觉识别及包装设计，目标是建立区别于同类品牌的视觉语言，并将全天候护理的品牌主张贯穿到产品与传播中。</p>
            <p>渐变色彩的灵感来自<strong>朝霞与夜晚的天空</strong>：柔和的粉色对应日线系列，通透的蓝色对应夜线系列。色彩从品牌标志延伸至瓶身、外盒和海报，传递自然、清透的产品意象，塑造优质护肤品牌的定位。</p>
            <p>负责<strong>logo 设计、产品设计、包装设计、创意摄影与海报设计</strong>。通过柔和光影、渐变背景与产品构图，呈现材质与轮廓，让品牌识别、系列组合与宣传画面形成连贯的视觉体验。</p>
          </> : <>
          <p>橙乐健康（C’EST LA VIE FITNESS）以<strong>专业运动和健身指导</strong>为方向。</p>
          <p>近年来在健身领域有一定经验，如何保持自身优势并顺应市场发展趋势，打造出区别其他健身品牌的差异化优势，梳理完整的品牌形象，是橙乐健身急需解决的关键问题。</p>
          <p>负责<strong>品牌重塑视觉设计与品牌调性把控</strong>。</p>
          <p>将常见于运动员中的“康复性健身”概念应用于橙乐健身品牌中，用<strong>“人体运动力学”理念</strong>指导都市人群完成高效、科学的健身。陪伴式的健身服务、专业的健身教练与课程、多维度的产品、可视化的辅助工具共同构建品牌价值。</p>
          <p>视觉识别从中英文标志出发，用<strong>连续弧线勾勒运动轨迹</strong>。深浅不同的橙色贯穿训练海报，弧线与圆点也延伸到动态标志的分镜中。</p>
          </>}
        </div>
        <dl className="detail-meta">
          <div><dt className="detail-kicker">角色</dt><dd>{iman ? "平面设计师" : "品牌设计师"}</dd></div>
          <div><dt className="detail-kicker">领域</dt>{(sogue ? ["口腔护理"] : iman ? ["3C产品"] : blinblin ? ["户外产品"] : choice ? ["服装"] : sheld ? ["护肤品", "B2C"] : ["运动健身", "人体运动力学"]).map(label => <dd key={label}>{label}</dd>)}</div>
          <div><dt className="detail-kicker">类型</dt>{(sogue ? ["品牌设计", "包装设计", "创意摄影", "海报设计"] : iman ? ["logo设计", "网页设计", "产品修图"] : blinblin ? ["品牌设计", "网页设计", "产品摄影"] : choice ? ["logo设计"] : sheld ? ["logo设计", "产品设计", "包装设计", "创意摄影", "海报设计"] : ["品牌设计", "视觉海报", "标识动画"]).map(label => <dd key={label}>{label}</dd>)}</div>
          <div className="detail-tools">
            <dt className="detail-kicker">工具</dt>
            <dd className="detail-tool" tabIndex={0} data-name="Photoshop"><img src="/icons/adobe/photoshop.svg" alt="Adobe Photoshop" width="36" height="36" /></dd>
            <dd className="detail-tool" tabIndex={0} data-name="Illustrator"><img src="/icons/adobe/illustrator.svg" alt="Adobe Illustrator" width="36" height="36" /></dd>
            {!choice && !iman && ((sheld || blinblin || sogue) ? <dd className="detail-tool" tabIndex={0} data-name="相机"><svg role="img" aria-label="相机" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 5l1-2h6l1 2h4a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z"/><circle cx="12" cy="12" r="4"/><path d="M18 8h1"/></svg></dd> : <dd className="detail-tool" tabIndex={0} data-name="After Effects"><img src="/icons/adobe/after-effects.svg" alt="Adobe After Effects" width="36" height="36" /></dd>)}
          </div>
        </dl>
      </section>

      <ProjectSummary cards={sogue ? sogueCards : iman ? imanCards : blinblin ? blinblinCards : choice ? newchoiceCards : sheld ? sheldCards : summaryCards} />

      <div className="detail-divider detail-reading"><span>Final screens</span></div>
      <div className="detail-artwork-grid detail-reading" role="region" aria-label={sogue ? "Sogue 肆悦作品图片" : iman ? "iMAN 作品图片" : blinblin ? "blinblin 作品图片" : choice ? "new choice 作品图片" : sheld ? "SHēld 作品图片" : "橙乐健康作品图片"}>
        {sogue ? [
          { id: 'identity', indices: [0, 1, 2] },
          { id: 'visual-language', indices: [3, 4] },
          { id: 'applications', indices: [5, 6, 7, 8] },
        ].map(group => <section className="detail-artwork-group" id={group.id} key={group.id} aria-label={sogueCards.find(card => card.id === group.id).title}>
          {group.id === 'visual-language' ? <div className="detail-sheld-pair">
            {group.indices.map(index => <ArtworkCard artwork={artwork} index={index} key={index} onOpen={openArtwork} sizes="(max-width: 650px) calc((100vw - 50px) / 2), 450px"/>)}
          </div> : group.indices.map(index => <ArtworkCard artwork={artwork} index={index} key={index} onOpen={openArtwork}/>)}
        </section>) : iman ? artwork.map((image, index) => <section className="detail-artwork-group" id={index === 0 ? 'identity' : 'applications'} key={image.id} aria-label={image.name}>
          {index === 0 && <span id="product-visual" style={{ position: "absolute" }} />}
          <ArtworkCard artwork={artwork} index={index} onOpen={openArtwork} />
        </section>) : blinblin ? [
          { id: 'identity', indices: [0, 1] },
          { id: 'visual-language', indices: [2] },
          { id: 'applications', indices: [3, 4, 5, 6] },
        ].map(group => <section className="detail-artwork-group" id={group.id} key={group.id} aria-label={blinblinCards.find(card => card.id === group.id).title}>
          {group.id === 'applications' ? [[3, 4], [5, 6]].map(pair => <div className="detail-sheld-pair" key={pair[0]}>
            {pair.map(index => <ArtworkCard artwork={artwork} index={index} key={index} onOpen={openArtwork} sizes="(max-width: 650px) calc((100vw - 50px) / 2), 450px" />)}
          </div>) : group.indices.map(index => <ArtworkCard artwork={artwork} index={index} key={index} onOpen={openArtwork} />)}
        </section>) : choice ? [
          { id: 'identity', indices: [0] },
          { id: 'visual-language', indices: [1, 2] },
          { id: 'applications', indices: [3] },
        ].map(group => <section className="detail-artwork-group" id={group.id} key={group.id} aria-label={newchoiceCards.find(card => card.id === group.id).title}>
          {group.indices.map(index => <ArtworkCard artwork={artwork} index={index} key={index} onOpen={openArtwork} />)}
        </section>) : sheld ? [
          { id: 'identity', start: 0, end: 6 },
          { id: 'visual-language', start: 6, end: 9 },
          { id: 'applications', start: 9, end: artwork.length },
        ].map(group => <section className="detail-artwork-group" id={group.id} key={group.id} aria-label={sheldCards.find(card => card.id === group.id).title}>
          {artwork.slice(group.start, group.end).map((image, offset) => {
            const index = group.start + offset;
            if (['04', '08', '13', '15', '17', '19', '21', '23'].includes(image.id)) return null;
            if (image.id === '03') return <ArtworkComparison key="comparison" artwork={artwork} onOpen={openArtwork} />;
            if (['07', '12', '14', '16', '18', '20', '22'].includes(image.id)) return <div className="detail-sheld-pair" key={image.id}>
              <ArtworkCard artwork={artwork} index={image.id === '14' ? artwork.findIndex(item => item.id === '16') : image.id === '16' ? artwork.findIndex(item => item.id === '15') : index} onOpen={openArtwork} sizes="(max-width: 650px) calc((100vw - 50px) / 2), 450px" />
              <ArtworkCard artwork={artwork} index={image.id === '14' ? artwork.findIndex(item => item.id === '14') : index + 1} onOpen={openArtwork} sizes="(max-width: 650px) calc((100vw - 50px) / 2), 450px" />
            </div>;
            return <ArtworkCard key={image.id} artwork={artwork} index={index} onOpen={openArtwork} />;
          })}
        </section>) : <>
        <section className="detail-artwork-group detail-identity" id="identity" aria-label="标志系统">
          <div className="detail-artwork-pair">
            <ArtworkCard artwork={artwork} index={0} onOpen={openArtwork} />
            <ArtworkCard artwork={artwork} index={1} onOpen={openArtwork} />
          </div>
        </section>
        <section className="detail-artwork-group" id="visual-language" aria-label="图形与色彩">
          <ArtworkCard artwork={artwork} index={2} onOpen={openArtwork} />
        </section>
        <section className="detail-artwork-group" id="applications" aria-label="运动主视觉">
          <ArtworkCard artwork={artwork} index={3} onOpen={openArtwork} />
          <div className="detail-artwork-pair">
            <ArtworkCard artwork={artwork} index={4} onOpen={openArtwork} />
            <ArtworkCard artwork={artwork} index={5} onOpen={openArtwork} />
          </div>
        </section>
        <section className="detail-artwork-group detail-storyboard" id="motion" aria-label="动态分镜">
          <ArtworkCard artwork={artwork} index={6} onOpen={openArtwork} />
        </section>
        </>}
      </div>

      <NextProject projectId={projectId} />

      <dialog className="detail-viewer" aria-label="作品大图，点击画面或按 Escape 关闭" tabIndex={-1} ref={viewer}
        onClick={() => viewer.current.close()}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') stepArtwork(-1);
          if (event.key === 'ArrowRight') stepArtwork(1);
        }}>
        <div className="detail-viewer-content">
          {current && <img src={artworkUrl(current, 2200)} alt={current.alt} />}
        </div>
      </dialog>
    </article>
  );
}
