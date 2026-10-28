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
    colorLabel.textContent=(P.colors||[]).reduce(function(a,x){return x[0]===c?x[1]:a;},c);
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
  addEventListener('load',function(){P.views.forEach(function(v){var i=new Image();i.src='/assets/img/'+P.slug+'-'+(P.colors?P.colors[1][0]:'stone')+'-'+v+'-1600.jpg';});});

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
  if(P.checkout==='stripe'){if(grid){
    /* fixed sizes S / M / L */
    [].forEach.call(grid.querySelectorAll('[data-size]'),function(b){b.addEventListener('click',function(){
      size=b.dataset.size;[].forEach.call(grid.querySelectorAll('[data-size]'),function(x){x.setAttribute('aria-checked',x===b?'true':'false');});
      sizeLabel.textContent=size;msg.textContent='';});});
    var add=document.getElementById('add');
    add.addEventListener('click',function(){
      if(!size){msg.textContent='[ Select your size ]';return;}
      window.VPCART.add({slug:P.slug,name:P.name,price:P.price,color:color,colorName:colorLabel.textContent,size:size});
      msg.textContent='[ Added to cart ]';window.VPCART.open();
    });
  }} else draw();

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
  var q=new URLSearchParams(location.search).get('color');if(q&&q!=='black'&&(P.colors||[]).some(function(x){return x[0]===q;}))setColor(q);
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
  s.addEventListener('click',function(e){if(Math.abs(moved)>6){e.preventDefault();moved=0;}},true);
  s.tabIndex=0;s.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(idx()+1);if(e.key==='ArrowLeft')go(idx()-1);});
})();

/* grid size: 2 or 4 per row (remembered on this device) */
(function(){
  var g=document.getElementById('grid');if(!g)return;
  var btns=[].slice.call(document.querySelectorAll('[data-cols]'));
  function set(n,keep){g.classList.toggle('g4',n==='4');btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.cols===n?'true':'false');});if(keep){try{localStorage.setItem('vp-cols2',n);}catch(e){}}}
  /* default: 4 on desktop (mouse + wide screen), 2 on tablet/phone */
  var pc=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine) and (min-width:1024px)').matches;
  var saved=null;try{saved=localStorage.getItem('vp-cols2');}catch(e){}
  set(saved||(pc?'4':'2'));
  btns.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.cols,true);});});
})();

/* category filter above the grid (All / Footwear / Accessories) */
(function(){
  var btns=[].slice.call(document.querySelectorAll('[data-cat]')).filter(function(b){return b.tagName==='BUTTON';});if(!btns.length)return;
  var cards=[].slice.call(document.querySelectorAll('#grid .card')),n=document.getElementById('nModels');
  function set(c){btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.cat===c?'true':'false');});var k=0;cards.forEach(function(e){var on=c==='all'||e.dataset.cat===c;e.hidden=!on;if(on){k++;e.classList.add('in');}});if(n)n.textContent=k+(k===1?' Model':' Models');}
  btns.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.cat);});});
  var h=location.hash.slice(1).toLowerCase();btns.forEach(function(b){if(b.dataset.cat.toLowerCase()===h){set(b.dataset.cat);var t=document.getElementById('shop');t&&t.scrollIntoView();}});
})();

/* cart + checkout
   CHECKOUT_URL empty  -> test mode (simulated Stripe page, nothing is charged)
   CHECKOUT_URL set    -> the cart is POSTed to the VAMPYRO checkout worker, which opens Stripe Checkout */
var CHECKOUT_URL=window.VP_CHECKOUT_URL||'';
(function(){
  var KEY='vp-cart',CK='vp-country';
  var ZONES={AR:{n:'Argentina',r:12,eta:'3\u20136 business days'},SA:{n:'South America',r:29,eta:'7\u201312 business days'},NA:{n:'North & Central America',r:39,eta:'7\u201314 business days'},EU:{n:'Europe',r:45,eta:'8\u201315 business days'},RW:{n:'Rest of the world',r:49,eta:'10\u201320 business days'}};
  var C=[['AR','AR','Argentina'],['SA','BR','Brazil'],['SA','CL','Chile'],['SA','UY','Uruguay'],['SA','PY','Paraguay'],['SA','BO','Bolivia'],['SA','PE','Peru'],['SA','CO','Colombia'],['SA','EC','Ecuador'],
    ['NA','US','United States'],['NA','CA','Canada'],['NA','MX','Mexico'],['NA','CR','Costa Rica'],['NA','PA','Panama'],['NA','GT','Guatemala'],['NA','DO','Dominican Republic'],['NA','PR','Puerto Rico'],
    ['EU','ES','Spain'],['EU','FR','France'],['EU','IT','Italy'],['EU','DE','Germany'],['EU','PT','Portugal'],['EU','GB','United Kingdom'],['EU','NL','Netherlands'],['EU','BE','Belgium'],['EU','CH','Switzerland'],['EU','AT','Austria'],['EU','IE','Ireland'],['EU','SE','Sweden'],['EU','DK','Denmark'],['EU','NO','Norway'],['EU','FI','Finland'],['EU','PL','Poland'],['EU','GR','Greece'],
    ['RW','JP','Japan'],['RW','KR','South Korea'],['RW','CN','China'],['RW','HK','Hong Kong'],['RW','SG','Singapore'],['RW','AU','Australia'],['RW','NZ','New Zealand'],['RW','AE','United Arab Emirates'],['RW','IL','Israel'],['RW','ZA','South Africa'],['RW','IN','India']];
  var cart=[],country='US',email='',view='cart',order=null;
  try{cart=JSON.parse(localStorage.getItem(KEY)||'[]');country=localStorage.getItem(CK)||country;if(country.length>2)country='US';}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(cart));localStorage.setItem(CK,country);}catch(e){}}
  var dr=document.getElementById('drawer'),sc=document.getElementById('scrim'),body=document.getElementById('dbody'),cc=document.getElementById('cc'),ttl=document.getElementById('dTitle');
  if(!dr)return;
  function m(n){return '$'+(Math.round(n*100)/100).toFixed(n%1?2:0);}
  function cinfo(){for(var k=0;k<C.length;k++)if(C[k][1]===country)return C[k];return C[9];}
  function zone(){return ZONES[cinfo()[0]];}
  function sub(){return cart.reduce(function(a,i){return a+i.qty*i.price;},0);}
  function count(){return cart.reduce(function(a,i){return a+i.qty;},0);}
  function th(i){return '/assets/img/'+i.slug+'-'+i.color+'-front-800.jpg';}
  function line(i){return i.name+' \u00b7 '+i.colorName+' \u00b7 '+i.size+' \u00d7 '+i.qty;}
  function okMail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);}
  function esc(v){return String(v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function render(){
    cc.textContent=count();
    var z=zone();
    if(view==='cart'){
      ttl.textContent='Cart';
      body.innerHTML=(cart.length?'<div class="items">'+cart.map(function(i,k){return '<div class="it"><img src="'+th(i)+'" alt=""><div class="meta"><span>'+i.name+'</span><span class="muted">'+i.colorName+' \u00b7 Size '+i.size+'</span><span>'+m(i.price)+'</span><div class="qty"><button type="button" data-q="'+k+'" data-d="-1" aria-label="Remove one">\u2212</button><span>'+i.qty+'</span><button type="button" data-q="'+k+'" data-d="1" aria-label="Add one">+</button></div></div></div>';}).join('')+'</div>'
        :'<div class="items"><p class="empty">Your cart is empty.</p></div>')+
        '<div class="sum"><label for="country" class="muted">Ship to</label><select id="country">'+C.map(function(x){return '<option value="'+x[1]+'"'+(x[1]===country?' selected':'')+'>'+x[2]+'</option>';}).join('')+'</select>'+
        '<label for="email" class="muted">Email</label><input type="email" id="email" autocomplete="email" placeholder="you@example.com" value="'+esc(email)+'">'+
        '<p class="fine">Your receipt, invoice and shipping updates with the tracking number are sent to this email.</p>'+
        '<div class="ln"><span>Subtotal</span><span>'+m(sub())+'</span></div>'+
        '<div class="ln"><span>Shipping \u00b7 '+z.n+'</span><span>'+(cart.length?m(z.r):'\u2014')+'</span></div>'+
        '<div class="ln muted"><span>Delivery after printing</span><span>'+(cart.length?z.eta:'\u2014')+'</span></div>'+
        '<div class="ln tot"><span>Total USD</span><span>'+m(cart.length?sub()+z.r:0)+'</span></div>'+
        '<button class="cta" id="ck" type="button"'+(cart.length?'':' disabled')+'><span class="br">Checkout</span></button>'+
        '<p class="fine">Secure payment with Stripe. Import duties and taxes, if any, are paid on delivery.</p></div>';
      [].forEach.call(body.querySelectorAll('[data-q]'),function(b){b.onclick=function(){var i=cart[+b.dataset.q];i.qty+=+b.dataset.d;if(i.qty<1)cart.splice(+b.dataset.q,1);save();render();};});
      document.getElementById('country').onchange=function(e){country=e.target.value;save();render();};
      var em=document.getElementById('email');em.oninput=function(){email=em.value.trim();em.removeAttribute('aria-invalid');};
      document.getElementById('ck').onclick=function(){
        if(!okMail(email)){em.setAttribute('aria-invalid','true');em.focus();return;}
        if(CHECKOUT_URL){go();return;}
        view='pay';render();};
    } else if(view==='pay'){
      ttl.textContent='Checkout';
      body.innerHTML='<div class="items"><p class="test">[ Test mode ]</p><p class="fine">In the live store this step opens Stripe\u2019s secure payment page: card, Apple Pay or Google Pay, plus the shipping address. Nothing is charged here.</p>'+
        cart.map(function(i){return '<div class="ln"><span>'+line(i)+'</span><span>'+m(i.qty*i.price)+'</span></div>';}).join('')+
        '<div class="ln"><span>Shipping \u00b7 '+z.n+'</span><span>'+m(z.r)+'</span></div><div class="ln muted"><span>Email</span><span style="text-transform:none">'+esc(email)+'</span></div></div>'+
        '<div class="sum"><div class="ln tot"><span>Total USD</span><span>'+m(sub()+z.r)+'</span></div><button class="cta" id="pay" type="button"><span class="br">Simulate payment</span></button><button type="button" class="back" id="bk">Back to cart</button></div>';
      document.getElementById('bk').onclick=function(){view='cart';render();};
      document.getElementById('pay').onclick=function(){order={id:'VP-'+(1000+Math.floor(Math.random()*9000)),items:cart.slice(),z:z,total:sub()+z.r,country:cinfo()[2],email:email};cart=[];save();view='done';render();};
    } else {
      ttl.textContent='Order '+order.id;
      var st=function(t,d,c){return '<li class="'+c+'"><i></i><span>'+t+'<small>'+d+'</small></span></li>';};
      body.innerHTML='<div class="items"><p class="test">[ Paid \u00b7 test mode ]</p>'+order.items.map(function(i){return '<div class="ln"><span>'+line(i)+'</span><span>'+m(i.qty*i.price)+'</span></div>';}).join('')+
        '<div class="ln"><span>Shipping \u00b7 '+order.z.n+'</span><span>'+m(order.z.r)+'</span></div><div class="ln tot"><span>Paid USD</span><span>'+m(order.total)+'</span></div>'+
        '<ol class="steps">'+st('Paid','Receipt and invoice sent to '+esc(order.email)+'.','done')+st('Order received','The order arrives with color, size and address. The print job is queued.','now')+st('Printing','Made to order in 5\u20137 days.','')+st('Shipped from Argentina','The tracking number is emailed to '+esc(order.email)+'.','')+st('Delivered',order.z.eta+' to '+order.country+'.','')+'</ol></div>'+
        '<div class="sum"><button class="cta" id="again" type="button"><span class="br">Continue shopping</span></button></div>';
      document.getElementById('again').onclick=function(){view='cart';close();render();};
    }
  }
  /* live: POST the cart (not in the URL) to the checkout worker, which answers with a redirect to Stripe */
  function go(){
    var f=document.createElement('form');f.method='POST';f.action=CHECKOUT_URL;
    var add=function(k,v){var i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;f.appendChild(i);};
    add('items',JSON.stringify(cart.map(function(i){return {slug:i.slug,color:i.color,size:i.size,qty:i.qty};})));
    add('country',country);add('email',email);add('return',location.origin+location.pathname);
    document.body.appendChild(f);f.submit();
  }
  function open(){dr.hidden=false;sc.hidden=false;document.documentElement.classList.add('lock');}
  function close(){dr.hidden=true;sc.hidden=true;document.documentElement.classList.remove('lock');if(view==='done')view='cart';}
  document.getElementById('openCart').onclick=function(){render();open();};
  document.getElementById('closeCart').onclick=close;sc.onclick=close;
  addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  window.VPCART={open:function(){view='cart';render();open();},add:function(it){var ex=cart.filter(function(i){return i.slug===it.slug&&i.color===it.color&&i.size===it.size;})[0];if(ex)ex.qty++;else{it.qty=1;cart.push(it);}save();render();}};
  /* back from Stripe: ?paid=1 empties the cart and shows a thank-you */
  var q=new URLSearchParams(location.search);if(q.get('paid')==='1'){cart=[];save();ttl.textContent='Thank you';render();body.innerHTML='<div class="items"><p class="test">[ Payment received ]</p><p class="fine">Your receipt and invoice are on their way to your email. We will email you again with the tracking number when your order ships from Argentina.</p></div>';open();}
  render();
})();
