const API_BASE = 'http://localhost:3000/api';
// Replace these with Anita Catering's real details before publishing.
const BUSINESS = { whatsapp: '254700000000', greeting: 'Hello Anita Catering, I would like to ask about your catering services.' };
const VIDEO_ASSETS = { wedding: 'assets/videos/wedding-highlights.mp4', corporate: 'assets/videos/corporate-highlights.mp4', party: 'assets/videos/party-highlights.mp4' };
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const heroPerspective=$('[data-hero-perspective]');
if(heroPerspective&&window.matchMedia('(pointer:fine)').matches){
  heroPerspective.addEventListener('pointermove',event=>{
    const rect=heroPerspective.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    heroPerspective.style.setProperty('--hero-rx',`${y*-5}deg`);
    heroPerspective.style.setProperty('--hero-ry',`${x*7}deg`);
  });
  heroPerspective.addEventListener('pointerleave',()=>{
    heroPerspective.style.setProperty('--hero-rx','0deg');
    heroPerspective.style.setProperty('--hero-ry','0deg');
  });
}
const revealHeadings=$$('.hero h1, .about-copy h2, .events-section .section-heading h2, .menu-section .section-heading h2, .reviews-section .section-heading h2');
revealHeadings.forEach((heading,index)=>{
  heading.classList.add('reveal-heading');
  heading.style.setProperty('--reveal-delay',`${index*80}ms`);
  const textNodes=[];
  const walk=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
  let node=walk.nextNode();
  while(node){
    textNodes.push(node);
    node=walk.nextNode();
  }
  textNodes.forEach(textNode=>{
    if(!textNode.textContent.trim())return;
    const fragment=document.createDocumentFragment();
    textNode.textContent.split(/(\s+)/).forEach(part=>{
      if(!part)return;
      if(/^\s+$/.test(part)){
        fragment.append(document.createTextNode(part));
      }else{
        const word=document.createElement('span');
        word.className='reveal-word';
        word.textContent=part;
        fragment.append(word);
      }
    });
    textNode.replaceWith(fragment);
  });
});
requestAnimationFrame(()=>{
  revealHeadings.forEach(heading=>{
    const words=$$('.reveal-word',heading);
    const lines=[];
    words.forEach(word=>{
      const top=Math.round(word.getBoundingClientRect().top);
      let line=lines.find(entry=>Math.abs(entry.top-top)<4);
      if(!line){
        line={top,items:[]};
        lines.push(line);
      }
      line.items.push(word);
    });
    lines.forEach((line,index)=>line.items.forEach(word=>word.style.setProperty('--line-delay',`${index*110}ms`)));
  });
});
const revealItems=$$('.hero-product, .about-image img, .event-card, .menu-card');
revealItems.forEach((item,index)=>{
  item.classList.add('reveal-item');
  item.style.setProperty('--reveal-delay',`${(index%3)*100}ms`);
});
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.16,rootMargin:'0px 0px -8%'});
  $$('.reveal-heading, .reveal-item').forEach(item=>observer.observe(item));
}else{
  $$('.reveal-heading, .reveal-item').forEach(item=>item.classList.add('is-revealed'));
}
$('#year').textContent = new Date().getFullYear();
const wa = $('#whatsapp-link'); wa.href = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(BUSINESS.greeting)}`;
const menuToggle = $('.menu-toggle'), nav = $('#primary-nav');
menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
$$('#primary-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}));
const bookingForm=$('#booking-form'), bookingMessage=$('#booking-message');
bookingForm.eventDate.min = new Date().toISOString().slice(0,10);
function showMessage(el,message,error=false){el.textContent=message;el.classList.toggle('error',error);}
bookingForm.addEventListener('submit',async e=>{e.preventDefault();if(!bookingForm.reportValidity())return;const button=$('.submit-button',bookingForm);button.disabled=true;$('.button-label',button).textContent='Sending…';showMessage(bookingMessage,'');const data=Object.fromEntries(new FormData(bookingForm).entries());data.guestCount=Number(data.guestCount);try{const response=await fetch(`${API_BASE}/inquiries`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||'We could not send your enquiry.');bookingForm.reset();bookingForm.eventDate.min=new Date().toISOString().slice(0,10);showMessage(bookingMessage,'Thank you for choosing Anita Catering! Your catering inquiry has been received successfully. Our team will contact you to discuss your event.');}catch(err){showMessage(bookingMessage,`${err.message} Please check that the Anita Catering server is running and try again.`,true);}finally{button.disabled=false;$('.button-label',button).textContent='Send my enquiry';}});
const videoModal=$('#video-modal'),video=$('#highlight-video'),source=$('#video-source');
function closeVideo(){video.pause();video.removeAttribute('src');source.removeAttribute('src');video.load();videoModal.hidden=true;document.body.classList.remove('modal-open');}
$$('[data-video]').forEach(btn=>btn.addEventListener('click',()=>{const kind=btn.dataset.video;$('#video-title').textContent=kind==='wedding'?'Wedding moments':kind==='corporate'?'Corporate gatherings':'Celebration highlights';video.poster='assets/images/video-poster.svg';source.src=VIDEO_ASSETS[kind];video.load();videoModal.hidden=false;document.body.classList.add('modal-open');$('.modal-close',videoModal).focus();}));
$$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeVideo));
const reviewModal=$('#review-modal'),reviewForm=$('#review-form'),reviewMessage=$('#review-message');
$('#open-review').addEventListener('click',()=>{$('.submit-button',reviewForm).hidden=false;showMessage(reviewMessage,'');reviewModal.hidden=false;document.body.classList.add('modal-open');$('input[name="customerName"]',reviewForm).focus();});
function closeReview(){reviewModal.hidden=true;document.body.classList.remove('modal-open');}
$$('[data-close-review]').forEach(el=>el.addEventListener('click',closeReview));
let selectedRating=0;$$('[data-rating]').forEach(btn=>btn.addEventListener('click',()=>{selectedRating=Number(btn.dataset.rating);$('input[name="rating"]',reviewForm).value=String(selectedRating);$$('[data-rating]').forEach(star=>{const on=Number(star.dataset.rating)<=selectedRating;star.classList.toggle('selected',on);star.setAttribute('aria-pressed',String(Number(star.dataset.rating)===selectedRating));});}));
reviewForm.addEventListener('submit',async e=>{e.preventDefault();if(!reviewForm.reportValidity())return;if(!selectedRating){showMessage(reviewMessage,'Please select a star rating.',true);return;}const button=$('.submit-button',reviewForm);button.disabled=true;$('.button-label',button).textContent='Submitting…';showMessage(reviewMessage,'');const data=Object.fromEntries(new FormData(reviewForm).entries());data.rating=selectedRating;try{const response=await fetch(`${API_BASE}/reviews`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to submit review.');reviewForm.reset();selectedRating=0;$$('[data-rating]').forEach(s=>s.classList.remove('selected'));showMessage(reviewMessage,result.message);button.hidden=true;}catch(err){showMessage(reviewMessage,`${err.message} Please try again.`,true);}finally{button.disabled=false;$('.button-label',button).textContent='Submit review';}});
let reviewPage=1;
function renderReview(review){const card=document.createElement('article');card.className='review-card';const stars=document.createElement('div');stars.className='stars';stars.textContent='★'.repeat(review.rating)+'☆'.repeat(5-review.rating);const quote=document.createElement('blockquote');quote.textContent=`“${review.message}”`;const footer=document.createElement('footer');const name=document.createElement('strong');name.textContent=review.customerName;footer.append(name,document.createTextNode(`${review.eventType} · ${new Date(review.createdAt+'Z').toLocaleDateString()}`));card.append(stars,quote,footer);return card;}
async function loadReviews(reset=false){const list=$('#review-list'),load=$('#load-more-reviews');if(reset){reviewPage=1;list.replaceChildren();}try{const response=await fetch(`${API_BASE}/reviews?page=${reviewPage}`);if(!response.ok)throw new Error('Reviews unavailable');const data=await response.json();$('#average-rating').textContent=data.total?data.average.toFixed(1):'—';$('#average-stars').textContent=data.total?'★'.repeat(Math.round(data.average))+'☆'.repeat(5-Math.round(data.average)):'☆☆☆☆☆';$('#review-count').textContent=`${data.total} approved ${data.total===1?'review':'reviews'}`;if(!data.items.length&&reviewPage===1){const empty=document.createElement('div');empty.className='review-empty';empty.textContent='Our customer stories will appear here once approved. We would love to hear about your experience.';list.append(empty);}data.items.forEach(item=>list.append(renderReview(item)));load.hidden=!data.hasMore;}catch{if(reset){const empty=document.createElement('div');empty.className='review-empty';empty.textContent='Customer reviews could not be loaded right now. Please refresh to try again.';list.append(empty);}load.hidden=true;}}
$('#load-more-reviews').addEventListener('click',()=>{reviewPage++;loadReviews(false);});loadReviews(true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!videoModal.hidden)closeVideo();if(!reviewModal.hidden)closeReview();}});
