/* header hairline after scrolling */
(function(){var h=document.getElementById('hd');if(!h)return;function f(){h.classList.toggle('line',scrollY>8);}f();addEventListener('scroll',f,{passive:true});})();

/* reveal on scroll */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e);});
})();

/* product page */
(function(){
  var P=window.PRODUCT;if(!P)return;
  var color='black',size=null;
  var imgs=[].slice.call(document.querySelectorAll('#gal img'));
  var colorLabel=document.getElementById('colorLabel');

  function src(view,w){return '/assets/img/'+P.slug+'-'+color+'-'+view+'-'+w+'.jpg';}
  function setColor(c){
    if(c===color)return;color=c;
    [].forEach.call(document.querySelectorAll('[data-color]'),function(b){b.setAttribute('aria-pressed',b.dataset.color===c?'true':'false');});
    colorLabel.textContent=c==='black'?'Black':'Stone';
    imgs.forEach(function(im){
      var v=im.dataset.view,n=new Image();n.src=src(v,1600);
      im.classList.add('fade');
      var swap=function(){im.srcset=src(v,800)+' 800w, '+src(v,1600)+' 1600w';im.src=src(v,1600);requestAnimationFrame(function(){im.classList.remove('fade');});};
      if(n.decode)n.decode().then(swap,swap);else setTimeout(swap,200);
    });
    var u=new URL(location.href);u.searchParams.set('color',c);history.replaceState(null,'',u);
  }
  [].forEach.call(document.querySelectorAll('[data-color]'),function(b){b.addEventListener('click',function(){setColor(b.dataset.color);});});
  /* preload the other color */
  addEventListener('load',function(){P.views.forEach(function(v){var i=new Image();i.src='/assets/img/'+P.slug+'-stone-'+v+'-1600.jpg';});});

  /* gallery dots on mobile */
  var gal=document.getElementById('gal'),dots=[].slice.call(document.querySelectorAll('#dots i'));
  if(gal&&dots.length){gal.addEventListener('scroll',function(){var k=Math.round(gal.scrollLeft/gal.clientWidth);dots.forEach(function(d,j){d.classList.toggle('on',j===k);});},{passive:true});}

  /* sizes: every system Zellerfeld offers (value sent as "USM 10", "USW 8.5", "UK 9.5", "EU 43") */
  function rng(a,b){var r=[];for(var x=a;x<=b+1e-9;x+=.5)r.push(String(x));return r;}
  var SYS={USM:{label:'US M',list:rng(4,21)},USW:{label:'US W',list:rng(5.5,22.5)},UK:{label:'UK',list:rng(3,20)},EU:{label:'EU',list:rng(36.5,58)}};
  var sys='USM',grid=document.getElementById('sizes'),sizeLabel=document.getElementById('sizeLabel'),msg=document.getElementById('msg');
  function draw(){
    if(!grid)return;
    grid.innerHTML=SYS[sys].list.map(function(v){return '<button type="button" role="radio" aria-checked="false" data-size="'+v+'">'+v+'</button>';}).join('');
    size=null;sizeLabel.textContent='Select';
    [].forEach.call(grid.querySelectorAll('[data-size]'),function(b){b.addEventListener('click',function(){
      size=b.dataset.size;
      [].forEach.call(grid.querySelectorAll('[data-size]'),function(x){x.setAttribute('aria-checked',x===b?'true':'false');});
      sizeLabel.textContent=SYS[sys].label+' '+size;if(msg)msg.textContent='';
    });});
  }
  [].forEach.call(document.querySelectorAll('[data-sys]'),function(b){b.addEventListener('click',function(){
    sys=b.dataset.sys;[].forEach.call(document.querySelectorAll('[data-sys]'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});draw();
  });});
  draw();

  /* buy: straight to Zellerfeld checkout with model, color and size */
  function b64url(str){return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  var buy=document.getElementById('buy');
  if(buy)buy.addEventListener('click',function(){
    if(!size){msg.textContent='[ Select your size ]';var g=document.querySelector('.sizes');g&&g.scrollIntoView({behavior:'smooth',block:'center'});return;}
    var id=P.variants[color];if(!id)return;
    var props=b64url(JSON.stringify({'Size-Type-Custom':sys+' '+size}));
    var url='https://shop.zellerfeld.com/cart/'+id+':1?properties='+props;
    /* checkout opens in a new tab so vampyro.space stays open behind it */
    var w=window.open(url,'_blank','noopener');
    if(!w){var a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();}
    msg.textContent='[ Checkout opened in a new tab ]';
  });

  addEventListener('pageshow',function(){if(buy)buy.querySelector('span').textContent='Buy now';});

  /* deep link ?color=stone */
  var q=new URLSearchParams(location.search).get('color');if(q==='stone')setColor('stone');
})();

/* header: brackets follow the active section (Shop / About) */
(function(){
  var links=[].slice.call(document.querySelectorAll('.nl'));if(!links.length)return;
  function set(k){links.forEach(function(a){a.classList.toggle('on',a.dataset.nav===k);});}
  set(location.hash==='#about'?'about':'shop');
  links.forEach(function(a){a.addEventListener('click',function(){set(a.dataset.nav);});});
  var ab=document.getElementById('about');
  if(ab&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){set(e.isIntersecting?'about':'shop');});},{rootMargin:'-30% 0px -30% 0px'}).observe(ab);
  }
})();

/* hero slider (swipe, drag, buttons, keys) */
(function(){
  var s=document.getElementById('slides');if(!s)return;
  var n=s.children.length,cnt=document.getElementById('count');
  function idx(){return Math.round(s.scrollLeft/s.clientWidth);}
  function pad(x){return (x<10?'0':'')+x;}
  function upd(){cnt.textContent=pad(idx()+1)+' / '+pad(n);}
  function go(k){k=(k+n)%n;s.scrollTo({left:k*s.clientWidth,behavior:'smooth'});}
  document.getElementById('prev').addEventListener('click',function(){go(idx()-1);});
  document.getElementById('next').addEventListener('click',function(){go(idx()+1);});
  s.addEventListener('scroll',upd,{passive:true});
  var down=false,x0=0,l0=0,moved=0;
  s.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=0;x0=e.clientX;l0=s.scrollLeft;s.classList.add('drag');});
  addEventListener('pointermove',function(e){if(!down)return;moved=e.clientX-x0;s.scrollLeft=l0-moved;});
  addEventListener('pointerup',function(){if(!down)return;down=false;s.classList.remove('drag');var k=Math.round(l0/s.clientWidth);if(Math.abs(moved)>50)k+=moved<0?1:-1;go(Math.max(0,Math.min(n-1,k)));});
  s.tabIndex=0;s.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(idx()+1);if(e.key==='ArrowLeft')go(idx()-1);});
})();
