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

  function src(view,w){return '/assets/img/'+P.slug+'-'+color+'-'+view+'-'+w+'.webp';}
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
  addEventListener('load',function(){P.views.forEach(function(v){var i=new Image();i.src='/assets/img/'+P.slug+'-stone-'+v+'-1600.webp';});});

  /* gallery dots on mobile */
  var gal=document.getElementById('gal'),dots=[].slice.call(document.querySelectorAll('#dots i'));
  if(gal&&dots.length){gal.addEventListener('scroll',function(){var k=Math.round(gal.scrollLeft/gal.clientWidth);dots.forEach(function(d,j){d.classList.toggle('on',j===k);});},{passive:true});}

  /* sizes (US men) and approximate conversions */
  var EU={4:36,4.5:36.5,5:37.5,5.5:38,6:38.5,6.5:39,7:40,7.5:40.5,8:41,8.5:42,9:42.5,9.5:43,10:44,10.5:44.5,11:45,11.5:45.5,12:46,12.5:47,13:47.5,13.5:48};
  function eu(s){return EU[s]!=null?EU[s]:(48+(s-13.5)*1).toString().replace(/\.0$/,'');}
  var sizeLabel=document.getElementById('sizeLabel'),conv=document.getElementById('conv'),msg=document.getElementById('msg');
  [].forEach.call(document.querySelectorAll('[data-size]'),function(b){
    b.addEventListener('click',function(){
      size=b.dataset.size;
      [].forEach.call(document.querySelectorAll('[data-size]'),function(x){x.setAttribute('aria-checked',x===b?'true':'false');});
      var s=parseFloat(size);
      sizeLabel.textContent='US M '+size;
      conv.textContent='≈ EU '+eu(s)+'  ·  UK '+(s-1)+'  ·  US W '+(s+1.5);
      if(msg)msg.textContent='';
    });
  });

  /* buy: straight to Zellerfeld checkout with model, color and size */
  function b64url(str){return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  var buy=document.getElementById('buy');
  if(buy)buy.addEventListener('click',function(){
    if(!size){msg.textContent='[ Select your size ]';var g=document.querySelector('.sizes');g&&g.scrollIntoView({behavior:'smooth',block:'center'});return;}
    var id=P.variants[color];if(!id)return;
    var props=b64url(JSON.stringify({'Size-Type-Custom':'USM '+size}));
    buy.querySelector('span').textContent='Redirecting';
    location.href='https://shop.zellerfeld.com/cart/'+id+':1?properties='+props;
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
