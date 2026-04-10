import { useState, useCallback } from 'react'

/* --- THEME --- */
const C={
  bg:'#07080f',panel:'#0d0e1a',card:'#131525',el:'#1a1c2e',
  bdr:'#232540',bdrH:'#353860',
  ac:'#6366f1',acG:'linear-gradient(135deg,#6366f1,#a855f7)',acT:'#a5b4fc',acS:'rgba(99,102,241,.12)',
  gn:'#10b981',gnS:'rgba(16,185,129,.1)',gnT:'#6ee7b7',
  or:'#f59e0b',orS:'rgba(245,158,11,.1)',orT:'#fcd34d',
  pk:'#d946ef',cy:'#06b6d4',
  rd:'#ef4444',
  tx:'#e4e4f0',tx2:'#8587a2',txD:'#42445e',
}

/* --- TOOL CATALOGUE --- */
const CATS=[
  {id:'i2v',label:'Image to Video',color:C.ac,
   tip:'Upload ảnh mockup SP vào tool → paste prompt → gen video',tools:[
    {id:'kling_i2v', name:'Kling I2V',  url:'https://klingai.com/global/ai/image-to-video',    star:true, free:true,  badge:'Best for POD',  pkey:'kling_i2v', tip:'Upload ảnh trước, rồi paste prompt'},
    {id:'pika',      name:'Pika 2.2',   url:'https://pika.art/home',                            star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'luma',      name:'Luma I2V',   url:'https://lumalabs.ai/dream-machine/creations',      star:false,free:true,  badge:'Cinematic',     pkey:'luma',      tip:''},
    {id:'hailuo_i2v',name:'Hailuo I2V', url:'https://hailuoai.video/create',                    star:false,free:true,  badge:'Free',          pkey:'hailuo',    tip:''},
    {id:'pixverse',  name:'PixVerse',   url:'https://app.pixverse.ai/create',                   star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'runway',    name:'Runway Gen4',url:'https://app.runwayml.com/',                        star:false,free:false, badge:'Pro',           pkey:'kling_i2v', tip:''},
    {id:'haiper',    name:'Haiper 2.0', url:'https://app.haiper.ai/create',                     star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'vidu',      name:'Vidu 2.0',   url:'https://www.vidu.studio/create',                   star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'wan_i2v',   name:'Wan 2.1 I2V',url:'https://replicate.com/wan-ai/wan2.1-i2v-480p',    star:false,free:false, badge:'$0.06/clip',    pkey:'kling_i2v', tip:'Via Replicate API'},
    {id:'minimax',   name:'MiniMax I2V',url:'https://hailuoai.video/create',                    star:false,free:true,  badge:'Free',          pkey:'hailuo',    tip:''},
  ]},
  {id:'t2v',label:'Text to Video',color:C.cy,
   tip:'Không cần ảnh — chỉ paste prompt text, AI tự tạo cảnh quay',tools:[
    {id:'veo2',      name:'Veo 3.1 (Google)',url:'https://labs.google/fx/tools/video-fx',         star:true, free:true,  badge:'Best free',  pkey:'veo2',      tip:'Chọn Video → 9:16 → x4. Có thể upload ảnh SP làm Start frame!'},
    {id:'kling_t2v', name:'Kling T2V',  url:'https://klingai.com/global/ai/text-to-video',     star:true, free:true,  badge:'High quality',  pkey:'kling_t2v', tip:''},
    {id:'hailuo',    name:'Hailuo AI',  url:'https://hailuoai.video/create',                    star:true, free:true,  badge:'Viral TikTok',  pkey:'hailuo',    tip:''},
    {id:'pika_t2v',  name:'Pika T2V',   url:'https://pika.art/home',                            star:false,free:true,  badge:'Free',          pkey:'kling_t2v', tip:''},
    {id:'luma_t2v',  name:'Luma T2V',   url:'https://lumalabs.ai/dream-machine/creations',      star:false,free:true,  badge:'Free',          pkey:'luma',      tip:''},
    {id:'invideo',   name:'InVideo AI', url:'https://ai.invideo.io/workspace',                  star:false,free:true,  badge:'Script to Video',pkey:'invideo',  tip:'Paste trực tiếp vào script field'},
    {id:'runway_t2v',name:'Runway T2V', url:'https://app.runwayml.com/',                        star:false,free:false, badge:'Trial',         pkey:'kling_t2v', tip:''},
    {id:'sora',      name:'Sora',       url:'https://sora.com/library',                         star:false,free:false, badge:'OpenAI',        pkey:'kling_t2v', tip:''},
    {id:'wan_t2v',   name:'Wan 2.1 T2V',url:'https://replicate.com/wan-ai/wan2.1-t2v-480p',    star:false,free:false, badge:'$0.04/clip',    pkey:'kling_t2v', tip:''},
    {id:'cogvideo',  name:'CogVideoX',  url:'https://huggingface.co/spaces/THUDM/CogVideoX',   star:false,free:true,  badge:'HuggingFace',   pkey:'kling_t2v', tip:'Free, chậm'},
  ]},
  {id:'ugc',label:'Avatar / UGC',color:C.pk,
   tip:'AI tạo người ảo nói chuyện hoặc mặc SP — cần voiceover script',tools:[
    {id:'heygen',    name:'HeyGen',     url:'https://app.heygen.com/create-v3/instant_avatar',  star:true, free:false, badge:'Best avatar',   pkey:'avatar_vo', tip:'Paste script vào voice field'},
    {id:'creatify',  name:'Creatify',   url:'https://app.creatify.ai/generate',                 star:true, free:true,  badge:'UGC ecom',      pkey:'avatar_vo', tip:'Free trial, chuyên POD ads'},
    {id:'arcads',    name:'Arcads',     url:'https://app.arcads.ai/create',                     star:false,free:false, badge:'UGC ads',       pkey:'avatar_vo', tip:''},
    {id:'did',       name:'D-ID',       url:'https://studio.d-id.com/editor',                   star:false,free:true,  badge:'Talking photo', pkey:'avatar_vo', tip:'Upload ảnh → talking avatar'},
    {id:'synthesia', name:'Synthesia',  url:'https://app.synthesia.io/create',                  star:false,free:false, badge:'Business',      pkey:'avatar_vo', tip:''},
    {id:'captions',  name:'Captions AI',url:'https://captions.ai',                             star:false,free:true,  badge:'Mobile app',    pkey:'avatar_vo', tip:'App mobile'},
    {id:'virbo',     name:'Virbo',      url:'https://virbo.wondershare.com/app/video-creator',  star:false,free:true,  badge:'Free tier',     pkey:'avatar_vo', tip:''},
  ]},
  {id:'edit',label:'Edit & Publish',color:C.gn,
   tip:'Sau khi có video từ AI → thêm caption, nhạc → export MP4 → đăng TikTok',tools:[
    {id:'capcut',    name:'CapCut',     url:'https://www.capcut.com/editor',                    star:true, free:true,  badge:'#1 TikTok',     pkey:null, tip:'Thêm text, sound, filter → export MP4'},
    {id:'veed',      name:'Veed.io',    url:'https://www.veed.io/new',                          star:false,free:true,  badge:'Auto-caption',  pkey:null, tip:'Tự động add subtitle'},
    {id:'opus',      name:'Opus Clip',  url:'https://opus.pro/dashboard',                       star:false,free:true,  badge:'Auto-clip',     pkey:null, tip:'Cắt viral moments tự động'},
    {id:'descript',  name:'Descript',   url:'https://web.descript.com/projects',                star:false,free:true,  badge:'Edit by text',  pkey:null, tip:''},
    {id:'kapwing',   name:'Kapwing',    url:'https://www.kapwing.com/studio/editor',            star:false,free:true,  badge:'Subtitle',      pkey:null, tip:''},
    {id:'canva',     name:'Canva Video',url:'https://www.canva.com/design/video',               star:false,free:true,  badge:'Easy',          pkey:null, tip:''},
    {id:'adobe',     name:'Adobe Express',url:'https://new.express.adobe.com/',                 star:false,free:true,  badge:'Free tier',     pkey:null, tip:''},
  ]},
]

/* --- AI GEN (Groq -> Pollinations with retry) --- */
async function fetchWithRetry(fn, retries=2){
  for(let i=0;i<=retries;i++){
    try{return await fn()}
    catch(e){if(i===retries)throw e; await new Promise(r=>setTimeout(r,1500))}
  }
}

function buildPrompt(name, quote, niche, hasImgs){
  return [
    'You are the #1 TikTok content strategist for POD products. Your videos consistently get 500K+ views.',
    '',
    'PRODUCT: "' + name + '"',
    quote ? 'DESIGN TEXT/QUOTE: "' + quote + '" — THIS IS THE VIRAL ELEMENT. Build EVERYTHING around it.' : '',
    'NICHE/AUDIENCE: "' + (niche || 'US Gen Z + Millennial') + '"',
    hasImgs ? 'Seller has product mockup photos to use as starting image.' : 'No photos. Text-to-Video only.',
    '',
    '=== GENERATE 4 CONCEPTS ===',
    'Each concept MUST use a DIFFERENT viral TikTok format:',
    '- Format 1: POV / Reaction ("POV: your nurse friend opens this gift")',
    '- Format 2: "Wait for it" / Reveal / Before-After',
    '- Format 3: Storytime / "The story behind this shirt"',
    '- Format 4: Trend / Challenge / Gift Guide',
    '',
    '=== PROMPT QUALITY RULES (CRITICAL) ===',
    '',
    'KLING I2V PROMPT must include ALL of these:',
    '1. SUBJECT: age, gender, aesthetic (e.g. "a 25yo woman with messy bun, gold hoop earrings, casual but stylish")',
    '2. WEARING: the exact product, describe how it fits',
    '3. MOVEMENT (most important): hyper-specific micro-movements:',
    '   BAD: "walking toward camera" (too generic)',
    '   GOOD: "turns head to camera with a knowing smirk, then looks down at shirt and back up with raised eyebrows, subtle shoulder shrug"',
    '4. SETTING: specific location with atmospheric details (not just "room")',
    '5. LIGHTING: golden hour / ring light / neon / natural window light',
    '6. CAMERA: slow push-in / slight tilt up / handheld follow / static close-up',
    '',
    'VOICEOVER must have PERSONALITY:',
    '- Use "..." for dramatic pauses: "So I found this shirt... and honestly? Its perfect."',
    '- Use CAPS for emphasis: "like THIS is the gift you get"',
    '- Use reactions: "wait—", "okay but—", "no because—", "hear me out—"',
    '- Sound like a real person talking to their phone, NOT a script',
    '- 15-20 seconds of natural speech',
    '',
    'TEXT OVERLAYS must change every 1-2 seconds (6-8 total):',
    '- Each overlay = max 5 words, punchy',
    '- First overlay = scroll-stopper (0-1s)',
    '- Build curiosity in middle',
    '- Last = clear CTA',
    '',
    'LANGUAGE RULES:',
    '- title, why: VIETNAMESE (cho seller Viet Nam hieu)',
    '- ALL other fields: ENGLISH (US audience)',
    '',
    '=== JSON FORMAT (return ONLY this, no markdown) ===',
    '{"concepts":[{',
    '  "id":1,',
    '  "title":"VIETNAMESE ten concept",',
    '  "format":"POV / Reveal / Storytime / Trend",',
    '  "vibe":"2-word aesthetic",',
    '  "viral_score":9,',
    '  "why":"VIETNAMESE ly do viral",',
    '  "hooks":["hook option A 5-7 words","hook option B","hook option C"],',
    '  "scroll_stopper":"Describe the FIRST FRAME that makes people stop scrolling. What do they see in 0.3 seconds?",',
    '  "kling_i2v":"PREMIUM prompt following ALL rules above. 3-4 sentences. Subject + wearing product + micro-movements + setting + lighting + camera.",',
    '  "kling_t2v":"Full scene from scratch. Describe person + product + movement + environment. The ' + name + (quote ? ' with text ' + quote : '') + ' must be visible.",',
    '  "veo2":"GOOGLE VEO 3.1 PROMPT (THIS IS THE MOST IMPORTANT — write like a film director): 2-3 concise sentences. Describe the shot as a cinematographer would. Include: (1) exact subject appearance and what they wear, (2) specific physical action in present tense, (3) setting with atmospheric details, (4) camera movement (handheld/dolly/tracking/slow push-in/static close-up), (5) lighting quality (golden hour/soft window light/neon glow/overcast). Style: authentic, intimate, NOT commercial. Example quality: A woman in her 20s wearing a graphic tee that reads [quote] sits cross-legged on a sunlit bedroom floor, slowly looks up at camera with a knowing half-smile. Handheld, warm morning light through sheer curtains, shallow depth of field.",',
    '  "luma":"Cinematic art-house version. Dramatic shadows, slow-motion details, film grain. Same product different energy.",',
    '  "hailuo":"HIGH ENERGY TikTok native. Fast cuts feeling, bright saturated colors, trend-matching movement. Viral energy.",',
    '  "invideo":"Full 15-20s script with [SCENE] markers. Start with hook, micro-story, emotional beat, CTA.",',
    '  "avatar_vo":"First-person voiceover with personality markers. Use ... for pauses, CAPS for emphasis. Sound like talking to bestie not reading script.",',
    '  "overlays":[',
    '    {"sec":"0-1s","text":"scroll stopper text","style":"large center"},',
    '    {"sec":"1-3s","text":"hook continuation","style":"bold"},',
    '    {"sec":"3-5s","text":"story beat 1","style":"caption"},',
    '    {"sec":"5-7s","text":"story beat 2","style":"caption"},',
    '    {"sec":"7-9s","text":"emotional peak","style":"large"},',
    '    {"sec":"9-11s","text":"product callout","style":"highlight"},',
    '    {"sec":"11-13s","text":"social proof or urgency","style":"small"},',
    '    {"sec":"13-15s","text":"CTA link in bio","style":"animated"}',
    '  ],',
    '  "caption":"Under 90 chars, curiosity-driven, 2-3 emoji. NOT salesy.",',
    '  "hashtags":["niche-specific","trending","product-relevant","6-8 tags"],',
    '  "sound":"SPECIFIC TikTok sound: artist - song name, or describe exact vibe + BPM"',
    '}]}'
  ].filter(Boolean).join('\n')
}

async function genBrief(groqKey, geminiKey, name, quote, niche, hasImgs){
  const prompt=buildPrompt(name,quote,niche,hasImgs)
  const sysMsg='You are a POD TikTok expert. Return ONLY valid JSON. No explanation.'

  const tryGroq=()=>fetchWithRetry(async()=>{
    const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:6000,
        messages:[{role:'system',content:sysMsg},{role:'user',content:prompt}],
        response_format:{type:'json_object'}})
    })
    if(!r.ok)throw new Error('Groq '+r.status)
    const d=await r.json()
    return JSON.parse(d.choices?.[0]?.message?.content||'{}')
  })

  const tryGemini=()=>fetchWithRetry(async()=>{
    var url='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+geminiKey
    const r=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts:[{text:sysMsg+'\n\n'+prompt}]}],
        generationConfig:{responseMimeType:'application/json',maxOutputTokens:6000}
      })
    })
    if(!r.ok)throw new Error('Gemini '+r.status)
    const d=await r.json()
    var txt=d.candidates?.[0]?.content?.parts?.[0]?.text||'{}'
    return JSON.parse(txt.replace(/```json|```/g,'').trim())
  })

  const tryPoll=()=>fetchWithRetry(async()=>{
    const r=await fetch('https://text.pollinations.ai/',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        messages:[
          {role:'system',content:'Return ONLY valid compact JSON. No markdown, no explanation.'},
          {role:'user',content:prompt}
        ],
        model:'openai',jsonMode:true,seed:Math.random()*9999|0
      })
    })
    if(!r.ok)throw new Error('Pollinations '+r.status)
    const txt=await r.text()
    return JSON.parse(txt.replace(/```json|```/g,'').trim())
  })

  // Chain: Groq → Gemini → Pollinations (auto-fallback)
  var d = null
  if(groqKey){try{d=await tryGroq()}catch(e){}}
  if(!d&&geminiKey){try{d=await tryGemini()}catch(e){}}
  if(!d){d=await tryPoll()}
  if(!d?.concepts?.length)throw new Error('AI không tạo được. Thử lại hoặc thêm API key.')
  return d
}

/* --- VISION ANALYZE (Groq Vision free, works everywhere) --- */
async function visionAnalyze(imgs, groqKey){
  // Use Groq llama-3.2-90b-vision if key available
  // Fallback: skip vision, user inputs manually
  if(!groqKey) throw new Error('Cần Groq API key để AI đọc ảnh. Vào Settings nhập key.')
  
  // Convert first image to base64 for Groq Vision
  var im = imgs[0]
  var base64data = ''
  if(im.img){
    var c=document.createElement('canvas')
    c.width=Math.min(im.img.naturalWidth,800); c.height=Math.min(im.img.naturalHeight,800)
    c.getContext('2d').drawImage(im.img,0,0,c.width,c.height)
    base64data=c.toDataURL('image/jpeg',.8).split(',')[1]
  } else if(im.srcUrl){
    // For URL images, try fetch via proxy or tell user to upload
    throw new Error('Ảnh từ Etsy chưa tải về. Bấm chuột phải vào ảnh > Save Image > Upload lại.')
  }
  
  if(!base64data) throw new Error('Không đọc được ảnh. Upload lại thử.')
  
  var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
    body:JSON.stringify({
      model:'llama-3.2-90b-vision-preview',
      max_tokens:300,
      messages:[{role:'user',content:[
        {type:'image_url',image_url:{url:'data:image/jpeg;base64,'+base64data}},
        {type:'text',text:'Analyze this POD apparel product. Return ONLY valid JSON: {"name":"product name in English","quote":"exact text/quote printed on the design, or empty string if none","niche":"3-4 US TikTok audience keywords","design":"1-sentence visual description of the design"}'}
      ]}],
      response_format:{type:'json_object'}
    })
  })
  if(!r.ok) throw new Error('Groq Vision lỗi '+r.status+' — nhập tay thay thế')
  var d=await r.json()
  var txt=d.choices?.[0]?.message?.content||'{}'
  return JSON.parse(txt.replace(/```json|```/g,'').trim())
}

/* --- IMAGE LOADING --- */
async function fileToImg(file){
  const url=URL.createObjectURL(file), img=new Image()
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url})
  const oc=document.createElement('canvas')
  oc.width=Math.min(img.naturalWidth,1080); oc.height=Math.min(img.naturalHeight,1920)
  oc.getContext('2d').drawImage(img,0,0,oc.width,oc.height)
  const data=oc.toDataURL('image/jpeg',.92); URL.revokeObjectURL(url)
  const safe=new Image(); safe.src=data; await new Promise(r=>{safe.onload=r})
  return{url:data,img:safe}
}

/* --- PARSE HTML --- */
function extractImgUrls(html){
  const urls=new Set()
  for(const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)){
    try{
      const d=JSON.parse(m[1])
      const imgs=[...(Array.isArray(d.image)?d.image:[d.image])]
      imgs.forEach(img=>{const u=img?.contentURL||img?.url||img;if(typeof u==='string'&&/\.(jpg|jpeg|png|webp)/i.test(u))urls.add(u)})
    }catch{}
  }
  for(const m of html.matchAll(/<img[^>]+>/gi)){
    for(const a of m[0].matchAll(/(?:src|data-src|data-lazy)="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi))
      urls.add(a[1].split('?')[0])
  }
  for(const m of html.matchAll(/https:\/\/i\.etsystatic\.com\/[^\s"'<>]+\.(?:jpg|png|webp)/gi))urls.add(m[0])
  for(const m of html.matchAll(/https:\/\/m\.media-amazon\.com\/images\/[^\s"'<>]+\.jpg/gi))urls.add(m[0])
  return[...urls].filter(u=>!/logo|icon|avatar|favicon|sprite|badge|rating|star\./i.test(u)).slice(0,8)
}

/* --- EXPORT BRIEF AS TEXT --- */
function exportBrief(brief){
  return[
    '=== POD Content Brief ===',
    'Concept: '+brief.title,
    'Format: '+(brief.format||brief.vibe||''),
    'Vibe: '+(brief.vibe||''),
    'Viral score: '+brief.viral_score+'/10',
    'Why: '+brief.why,
    '',
    '-- HOOKS (A/B test) --',
    ...(brief.hooks||[brief.hook]).filter(Boolean).map(function(h,i){return 'Hook '+('ABC'[i]||i)+': '+h}),
    '',
    '-- SCROLL STOPPER --',
    brief.scroll_stopper||'',
    '',
    '-- KLING I2V PROMPT --',
    brief.kling_i2v||'',
    '',
    '-- KLING T2V PROMPT --',
    brief.kling_t2v||'',
    '',
    '-- VEO 3.1 (GOOGLE) PROMPT --',
    brief.veo2||'',
    '',
    '-- LUMA PROMPT --',
    brief.luma||'',
    '',
    '-- HAILUO PROMPT --',
    brief.hailuo||'',
    '',
    '-- AVATAR/UGC VOICEOVER --',
    brief.avatar_vo||'',
    '',
    '-- INVIDEO SCRIPT --',
    brief.invideo||'',
    '',
    '-- TEXT OVERLAYS --',
    ...(brief.overlays||[]).map(function(o){return o.sec+' ['+( o.style||'')+'] '+o.text}),
    '',
    '-- TIKTOK CAPTION --',
    brief.caption||'',
    (brief.hashtags||[]).map(function(h){return'#'+h}).join(' '),
    'Sound: '+(brief.sound||''),
  ].join('\n')
}

/* --- DOWNLOAD IMAGE HELPER --- */
function downloadImage(url, filename){
  if(url.startsWith('data:')){
    // Uploaded image (base64) — direct download works
    var a=document.createElement('a')
    a.href=url; a.download=filename||'product-mockup.jpg'; a.click()
  } else {
    // External URL (Etsy/Amazon) — open in new tab, user right-click saves
    window.open(url,'_blank')
  }
}

/* --- APP --- */
export default function App(){
  const[images,setImages]=useState([])
  const[name,setName]=useState('')
  const[quote,setQuote]=useState('')
  const[niche,setNiche]=useState('')
  const[htmlSrc,setHtmlSrc]=useState('')
  const[groqKey,setGroqKey]=useState(function(){return localStorage.getItem('pk-gk')||''})
  const[geminiKey,setGeminiKey]=useState(function(){return localStorage.getItem('pk-gem')||''})
  const[showSettings,setShowSettings]=useState(false)
  const[loading,setLoading]=useState('')
  const[concepts,setConcepts]=useState([])
  const[sel,setSel]=useState(0)
  const[activeTab,setActiveTab]=useState('i2v')
  const[drag,setDrag]=useState(false)
  const[copied,setCopied]=useState('')
  const[toast,setToast]=useState(null)
  const[showAll,setShowAll]=useState(false)
  const[refineText,setRefineText]=useState('')
  const[showHtml,setShowHtml]=useState(false)

  const brief=concepts[sel]||null
  const hasBrief=concepts.length>0

  const notify=useCallback(function(msg,ok){if(ok===undefined)ok=true;setToast({msg:msg,ok:ok});setTimeout(function(){setToast(null)},2800)},[])
  const cp=useCallback(function(id,text){
    if(!text)return
    navigator.clipboard.writeText(text);setCopied(id);notify('Đã copy!');setTimeout(function(){setCopied('')},2200)
  },[notify])
  const openTool=useCallback(function(tool,prompt){
    var w=window.open(tool.url,'_blank')
    if(prompt){navigator.clipboard.writeText(prompt).then(function(){notify('Prompt đã copy → Ctrl+V vào '+tool.name)})}
  },[notify])

  const addFiles=useCallback(async function(files){
    for(const f of Array.from(files)){
      if(!f.type.startsWith('image/'))continue
      try{const r=await fileToImg(f);setImages(function(p){return[...p,r]})}catch(e){notify('Lỗi upload ảnh',false)}
    }
  },[notify])

  const doVision=useCallback(async function(){
    if(!images.length){notify('Upload ảnh trước',false);return}
    setLoading('AI đang nhận diện design...')
    try{
      const r=await visionAnalyze(images, groqKey)
      if(r.name&&!name)setName(r.name)
      if(r.quote&&!quote)setQuote(r.quote)
      if(r.niche&&!niche)setNiche(r.niche)
      notify('Đọc xong — kiểm tra và chỉnh nếu cần')
    }catch(e){notify('Vision lỗi: '+e.message+' — nhập tay thay thế',false)}
    setLoading('')
  },[images,name,quote,niche,groqKey,notify])

  const doParseHTML=useCallback(async function(){
    if(!htmlSrc.trim()){notify('Paste HTML trước',false);return}
    setLoading('Đang trích xuất ảnh...')
    try{
      const urls=extractImgUrls(htmlSrc)
      const tm=htmlSrc.match(/<title[^>]*>([^<]+)<\/title>/i)
      if(tm&&!name)setName(tm[1].replace(/\s*[-|].*/,'').trim().slice(0,80))
      if(!urls.length){notify('Không tìm thấy ảnh trong HTML',false);setLoading('');return}
      var newImgs=urls.map(function(url){return{url:url,srcUrl:url,img:null}})
      setImages(function(p){return[...p,...newImgs]})
      setHtmlSrc('')
      notify('Lấy được '+urls.length+' ảnh từ trang — bấm AI đọc ảnh để phân tích')
    }catch(e){notify('Loi: '+e.message,false)}
    setLoading('')
  },[htmlSrc,name,notify])

  const doGenerate=useCallback(async function(){
    if(!name&&!images.length){notify('Nhập tên SP hoặc upload ảnh',false);return}
    setLoading('AI đang viết content brief...')
    try{
      const d=await genBrief(groqKey,geminiKey,name||'POD apparel',quote,niche,images.length>0)
      setConcepts(d.concepts);setSel(0);setActiveTab('i2v')
    }catch(e){notify(e.message,false)}
    setLoading('')
  },[groqKey,geminiKey,name,quote,niche,images.length,notify])

  var doRegen=useCallback(function(){setConcepts([]);doGenerate()},[doGenerate])

  var getPrompt=useCallback(function(pkey){
    if(!brief||!pkey)return ''
    return brief[pkey]||''
  },[brief])

  var doExport=useCallback(function(){
    if(!brief)return
    navigator.clipboard.writeText(exportBrief(brief))
    notify('Full brief đã copy vào clipboard!')
  },[brief,notify])

  /* --- RENDER --- */
  return(
    <div style={{minHeight:'100vh',background:C.bg,color:C.tx,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;font-family:inherit;border:none;outline:none}
        input,textarea{font-family:inherit;outline:none}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.bdrH};border-radius:4px}
        .fd{animation:fi .22s ease both}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cb{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;transition:all .15s;cursor:pointer}
        .cb:hover{opacity:.85}
        select option{background:${C.card}}
      `}</style>

      {toast&&<div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',padding:'9px 22px',borderRadius:24,background:toast.ok?C.gn:C.rd,color:'#fff',fontSize:13,fontWeight:700,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,.5)',whiteSpace:'nowrap',animation:'fi .18s ease'}}>
        {toast.msg}
      </div>}

      {/* HEADER */}
      <header style={{background:C.panel,borderBottom:'1px solid '+C.bdr,position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'10px 20px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:C.acG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{'🎬'}</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,background:C.acG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>POD Content Brief</span>
          <div style={{flex:1}}/>
          {loading&&<div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.tx2}}>
            <div style={{width:14,height:14,borderRadius:'50%',border:'2px solid '+C.ac+'40',borderTopColor:C.ac,animation:'spin .7s linear infinite'}}/>
            {loading}
          </div>}
          {hasBrief&&<>
            <button onClick={doExport} style={{padding:'6px 12px',borderRadius:8,border:'1px solid '+C.ac+'40',background:C.acS,color:C.acT,fontSize:12,fontWeight:600}}>Xu1EA5t brief</button>
            <button onClick={function(){setConcepts([]);setImages([]);setName('');setQuote('');setNiche('')}} style={{padding:'6px 12px',borderRadius:8,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12}}>L00E0m m1EDBi</button>
          </>}
          <button onClick={function(){setShowSettings(!showSettings)}} style={{padding:'6px 12px',borderRadius:8,border:'1px solid '+(showSettings?C.ac:C.bdr),background:showSettings?C.acS:'transparent',color:showSettings?C.acT:C.tx2,fontSize:12}}>API Key</button>
        </div>
      </header>

      {/* SETTINGS */}
      {showSettings&&<div style={{maxWidth:1200,margin:'0 auto',padding:'10px 20px 0'}}>
        <div className="fd" style={{padding:16,borderRadius:12,background:C.panel,border:'1px solid '+C.bdr}}>
          <div style={{fontSize:13,fontWeight:700,color:C.tx,marginBottom:12}}>{"AI Provider (t\u1EF1 \u0111\u1ED9ng ch\u1ECDn nhanh nh\u1EA5t c\u00F3 key)"}</div>
          
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div style={{padding:12,borderRadius:10,border:'1px solid '+(groqKey?C.gn:C.bdr),background:groqKey?C.gnS:C.el}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:700,color:C.tx}}>{"Groq (Llama 3.3 70B)"}</span>
                {groqKey&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:C.gnS,color:C.gnT,fontWeight:700}}>{"S\u1EB5n s\u00E0ng"}</span>}
              </div>
              <input type="password" value={groqKey} onChange={function(e){setGroqKey(e.target.value);localStorage.setItem('pk-gk',e.target.value)}} placeholder="gsk_..." style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid '+C.bdr,background:C.bg,color:C.tx,fontSize:12,marginBottom:4}}/>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.acT}}>{"L\u1EA5y key mi\u1EC5n ph\u00ED \u2192"}</a>
            </div>
            
            <div style={{padding:12,borderRadius:10,border:'1px solid '+(geminiKey?C.gn:C.bdr),background:geminiKey?C.gnS:C.el}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:700,color:C.tx}}>{"Gemini 2.0 Flash"}</span>
                {geminiKey&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:C.gnS,color:C.gnT,fontWeight:700}}>{"S\u1EB5n s\u00E0ng"}</span>}
              </div>
              <input type="password" value={geminiKey} onChange={function(e){setGeminiKey(e.target.value);localStorage.setItem('pk-gem',e.target.value)}} placeholder="AIza..." style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid '+C.bdr,background:C.bg,color:C.tx,fontSize:12,marginBottom:4}}/>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.acT}}>{"L\u1EA5y key mi\u1EC5n ph\u00ED \u2192"}</a>
            </div>
          </div>
          
          <div style={{padding:10,borderRadius:8,background:C.el,fontSize:11,color:C.tx2,lineHeight:1.7,marginBottom:10}}>
            {"AI t\u1EF1 \u0111\u1ED9ng ch\u1ECDn: Groq (nhanh nh\u1EA5t) \u2192 Gemini (m\u1EA1nh nh\u1EA5t) \u2192 Pollinations (kh\u00F4ng c\u1EA7n key)"}
          </div>
          
          <button onClick={function(){setShowSettings(false)}} style={{padding:'9px 24px',borderRadius:9,background:C.ac,color:'#fff',fontSize:13,fontWeight:700}}>{"L\u01B0u & \u0110\u00F3ng"}</button>
        </div>
      </div>}

      <main style={{maxWidth:1200,margin:'0 auto',padding:'16px 20px 60px'}}>

        {/* INPUT SCREEN */}
        {!hasBrief&&<div className="fd" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>

          {/* LEFT: Images */}
          <div style={{background:C.panel,borderRadius:16,padding:20,border:'1px solid '+C.bdr}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
              <span style={{width:22,height:22,borderRadius:7,background:C.ac,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>1</span>
              <span style={{fontSize:12,fontWeight:700,color:C.tx}}>Upload ảnh sản phẩm</span>
            </div>

            <div
              onDragOver={function(e){e.preventDefault();setDrag(true)}} onDragLeave={function(){setDrag(false)}}
              onDrop={function(e){e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files)}}
              onClick={function(){document.getElementById('imgIn').click()}}
              style={{border:'2px dashed '+(drag?C.ac:C.bdrH),borderRadius:12,padding:images.length?12:28,background:drag?C.acS:C.el,cursor:'pointer',textAlign:'center',minHeight:images.length?'auto':100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <input id="imgIn" type="file" accept="image/*" multiple style={{display:'none'}} onChange={function(e){addFiles(e.target.files)}}/>
              {images.length===0?(
                <>
                  <div style={{fontSize:28,marginBottom:6}}>{'📸'}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.tx}}>Click chọn ảnh hoặc kéo thả vào đây</div>
                  <div style={{fontSize:11,color:C.txD,marginTop:3}}>Ảnh mockup từ Printify, Placeit, Canva...</div>
                </>
              ):(
                <div style={{display:'flex',gap:8,flexWrap:'wrap',width:'100%'}}>
                  {images.map(function(im,i){return(
                    <div key={i} style={{position:'relative',flexShrink:0}}>
                      <img src={im.url} style={{width:60,height:60,borderRadius:8,objectFit:'cover',border:'2px solid '+(im.srcUrl?C.or:C.ac)+'50'}} onError={function(e){e.target.style.background=C.el;e.target.style.opacity='.3'}}/>
                      {im.srcUrl&&<div style={{position:'absolute',bottom:0,left:0,right:0,fontSize:8,fontWeight:700,color:'#fff',background:'rgba(245,158,11,.85)',textAlign:'center',borderRadius:'0 0 6px 6px',padding:'1px 0'}}>URL</div>}
                      <button onClick={function(e){e.stopPropagation();setImages(function(p){return p.filter(function(_,j){return j!==i})})}} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:9,background:C.rd,color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>x</button>
                    </div>
                  )})}
                  <div style={{width:60,height:60,borderRadius:8,border:'2px dashed '+C.bdrH,display:'flex',alignItems:'center',justifyContent:'center',color:C.txD,fontSize:18}}>+</div>
                </div>
              )}
            </div>

            {images.length>0&&<div style={{marginTop:8,display:'flex',gap:6}}>
              <button onClick={doVision} disabled={!!loading} style={{flex:1,padding:'10px',borderRadius:10,background:loading?C.el:C.acG,color:'#fff',fontSize:12,fontWeight:700,opacity:loading?0.5:1}}>
                {loading==='AI đang nhận diện design...'?'Đang đọc...':'AI đọc ảnh (tự điền thông tin)'}
              </button>
              <button onClick={function(){images.forEach(function(im,i){downloadImage(im.url,'mockup-'+(i+1)+'.jpg')})}} style={{padding:'10px 14px',borderRadius:10,border:'1px solid '+C.gn+'40',background:C.gnS,color:C.gnT,fontSize:12,fontWeight:700}}>
                {'Tai '}{images.length}{' anh'}
              </button>
            </div>}

            {/* HTML parse - collapsed by default */}
            <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid '+C.bdr}}>
              <button onClick={function(){setShowHtml(!showHtml)}} style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span>Có link Etsy/Amazon? Lấy ảnh từ đó</span>
                <span>{showHtml?'▲':'▼'}</span>
              </button>
              {showHtml&&<div style={{marginTop:8}}>
                <div style={{fontSize:11,color:C.orT,padding:'6px 10px',borderRadius:8,background:C.orS,lineHeight:1.6,marginBottom:8}}>
                  Mở trang SP → Ctrl+U → Ctrl+A → Ctrl+C → paste vào đây
                </div>
                <div style={{position:'relative'}}>
                  <textarea value={htmlSrc} onChange={function(e){setHtmlSrc(e.target.value)}} rows={3} placeholder="Paste toàn bộ HTML source..." style={{width:'100%',padding:'9px 12px',borderRadius:9,border:'1px solid '+(htmlSrc?C.or:C.bdr),background:C.el,color:C.tx,fontSize:12,resize:'vertical',fontFamily:'monospace',lineHeight:1.4}}/>
                  {htmlSrc&&<button onClick={function(){setHtmlSrc('')}} style={{position:'absolute',top:5,right:5,width:18,height:18,borderRadius:9,background:C.rd,color:'#fff',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>x</button>}
                </div>
                <button onClick={doParseHTML} disabled={!!loading||!htmlSrc.trim()} style={{width:'100%',marginTop:7,padding:'10px',borderRadius:9,background:loading||!htmlSrc.trim()?C.el:'linear-gradient(135deg,'+C.or+','+C.pk+')',color:'#fff',fontSize:13,fontWeight:700,opacity:loading||!htmlSrc.trim()?0.4:1}}>
                  Lấy ảnh + tên từ HTML
                </button>
              </div>}
            </div>
          </div>

          {/* RIGHT: Product info */}
          <div>
            <div style={{background:C.panel,borderRadius:16,padding:20,border:'1px solid '+C.bdr,marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
                <span style={{width:22,height:22,borderRadius:7,background:C.ac,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>2</span>
                <span style={{fontSize:12,fontWeight:700,color:C.tx}}>Mô tả sản phẩm</span>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:C.tx2,marginBottom:4}}>Tên sản phẩm *</label>
                <input value={name} onChange={function(e){setName(e.target.value)}} placeholder="VD: Funny Nurse T-Shirt, Cat Mom Mug, Gym Bro Hoodie..."
                  style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid '+(name?C.ac:C.bdr),background:C.el,color:C.tx,fontSize:13}}/>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:C.acT,marginBottom:4}}>Dòng chữ / câu trên thiết kế (nếu có)</label>
                <input value={quote} onChange={function(e){setQuote(e.target.value)}} placeholder='VD: "I survived another meeting that should have been an email"'
                  style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid '+(quote?C.ac:C.bdr),background:C.el,color:C.tx,fontSize:13}}/>
                <div style={{fontSize:10,color:C.txD,marginTop:3}}>Đây là yếu tố viral quan trọng nhất. Nếu áo có chữ, nhập chính xác vào đây.</div>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:C.tx2,marginBottom:4}}>Khách hàng mục tiêu</label>
                <input value={niche} onChange={function(e){setNiche(e.target.value)}} placeholder="VD: y ta My, me bim, dan gym, dan IT, nguoi yeu meo..."
                  style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid '+(niche?C.ac:C.bdr),background:C.el,color:C.tx,fontSize:13}}/>
              </div>
            </div>

            <button onClick={doGenerate} disabled={!!loading||(!name&&!images.length)}
              style={{width:'100%',padding:'18px',borderRadius:14,background:loading||(!name&&!images.length)?C.el:C.acG,color:'#fff',fontSize:16,fontWeight:800,opacity:loading||(!name&&!images.length)?0.4:1,boxShadow:name||images.length?'0 8px 32px rgba(99,102,241,.4)':'none',fontFamily:"'Syne',sans-serif"}}>
              {loading?loading:'Tạo 4 ý tưởng video TikTok'}
            </button>
            {!name&&!images.length&&<div style={{fontSize:11,color:C.txD,textAlign:'center',marginTop:6}}>Nhập tên SP hoặc upload ảnh để bắt đầu</div>}
          </div>
        </div>}

        {/* BRIEF SCREEN */}
        {hasBrief&&brief&&(
          <div className="fd">
            {/* Workflow steps */}
            <div style={{display:'flex',gap:4,marginBottom:14,padding:'10px 14px',borderRadius:12,background:C.panel,border:'1px solid '+C.bdr,overflowX:'auto'}}>
              {[
                {n:'1',t:'Tải ảnh mockup',d:'Download ảnh SP về máy'},
                {n:'2',t:'Tạo video AI',d:'Copy prompt → paste vào Kling/Hailuo'},
                {n:'3',t:'Edit + đăng',d:'CapCut thêm nhạc, text, export'},
              ].map(function(s,i){return(
                <div key={i} style={{flex:1,display:'flex',alignItems:'center',gap:8,minWidth:140}}>
                  <div style={{width:24,height:24,borderRadius:8,background:C.acG,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0}}>{s.n}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:C.tx}}>{s.t}</div><div style={{fontSize:10,color:C.txD}}>{s.d}</div></div>
                  {i<2&&<div style={{width:20,color:C.txD,textAlign:'center',flexShrink:0}}>{'>'}</div>}
                </div>
              )})}
            </div>

            {/* Concept switcher */}
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:11,color:C.txD,fontWeight:700,flexShrink:0}}>Ý tưởng:</span>
              {concepts.map(function(c,i){return(
                <button key={i} onClick={function(){setSel(i);setActiveTab('i2v')}}
                  style={{padding:'6px 14px',borderRadius:9,border:'1px solid '+(sel===i?C.ac:C.bdr),background:sel===i?C.acS:'transparent',color:sel===i?C.acT:C.tx2,fontSize:12,fontWeight:sel===i?700:400}}>
                  {'#'}{i+1}{' '}{c.format||c.vibe||''}{' '}{c.viral_score}{'/10'}
                </button>
              )})}
              <div style={{flex:1}}/>
              <button onClick={doRegen} disabled={!!loading} style={{padding:'6px 14px',borderRadius:9,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12}}>Tạo lại</button>
              <button onClick={function(){setConcepts([])}} style={{padding:'6px 14px',borderRadius:9,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12}}>Nhập lại</button>
            </div>

            {/* Concept header */}
            <div style={{padding:'14px 18px',borderRadius:14,background:C.panel,border:'1px solid '+C.bdr,marginBottom:14}}>
              <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap',marginBottom:10}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800}}>{brief.title}</span>
                    {brief.format&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:C.orS,color:C.orT,fontWeight:700}}>{brief.format}</span>}
                  </div>
                  <div style={{fontSize:12,color:C.tx2}}>{brief.vibe}{' - '}{brief.why}</div>
                </div>
                {images.length>0&&<div style={{display:'flex',gap:5,alignItems:'center'}}>
                  {images.slice(0,2).map(function(im,i){return <img key={i} src={im.url} style={{height:48,borderRadius:7,objectFit:'cover',border:'1px solid '+C.bdr}}/>})}
                  <button onClick={function(){images.forEach(function(im,i){downloadImage(im.url,'mockup-'+(i+1)+'.jpg')})}} className="cb" style={{background:C.gnS,color:C.gnT,border:'1px solid '+C.gn+'30',flexShrink:0}}>
                    {'Tải ảnh'}
                  </button>
                </div>}
              </div>
              {/* Hook variants for A/B testing */}
              {(brief.hooks||[brief.hook]).length>0&&<div style={{marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:C.txD,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Hook variants (A/B test)</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {(brief.hooks||[brief.hook]).filter(Boolean).map(function(h,i){return(
                    <div key={i} onClick={function(){cp('h'+i,h)}} style={{padding:'6px 12px',borderRadius:8,background:C.acS,border:'1px solid '+C.ac+'30',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:10,color:C.txD,fontWeight:700}}>{'ABC'[i]||i}</span>
                      <span style={{fontSize:13,fontWeight:700,color:C.tx}}>"{h}"</span>
                      <span style={{fontSize:10,color:copied===('h'+i)?C.gnT:C.txD}}>{copied===('h'+i)?'OK':'copy'}</span>
                    </div>
                  )})}
                </div>
              </div>}
              {/* Scroll stopper */}
              {brief.scroll_stopper&&<div style={{padding:'6px 10px',borderRadius:8,background:C.orS,border:'1px solid '+C.or+'25',fontSize:12,color:C.orT,lineHeight:1.5}}>
                <span style={{fontWeight:700}}>First frame: </span>{brief.scroll_stopper}
              </div>}
            </div>

            {/* HERO: Kling I2V */}
            {brief.kling_i2v&&<div style={{padding:18,borderRadius:16,background:C.card,border:'2px solid '+C.ac+'50',marginBottom:14,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:C.acG}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
                <div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:C.acT}}>Kling I2V - Best Prompt to Start</span>
                  <span style={{marginLeft:8,fontSize:10,padding:'2px 7px',borderRadius:5,background:C.gnS,color:C.gnT,fontWeight:700}}>Recommended</span>
                </div>
                <div style={{display:'flex',gap:7}}>
                  <button onClick={function(){cp('ki',brief.kling_i2v)}} className="cb" style={{background:copied==='ki'?C.gn:C.el,color:copied==='ki'?'#fff':C.tx2,border:'1px solid '+(copied==='ki'?C.gn:C.bdr)}}>
                    {copied==='ki'?'OK':'Copy'}
                  </button>
                  <button onClick={function(){openTool({name:'Kling I2V',url:'https://klingai.com/global/ai/image-to-video'},brief.kling_i2v)}} className="cb" style={{background:C.acG,color:'#fff',fontWeight:700}}>
                    Mở Kling →
                  </button>
                </div>
              </div>
              <div style={{fontSize:11,color:C.acT,marginBottom:8,padding:'5px 10px',borderRadius:6,background:C.acS,display:'inline-block'}}>
                Upload ảnh SP vào Kling trước, rồi paste prompt này vào ô Motion Prompt
              </div>
              <div style={{fontSize:13,color:C.tx,lineHeight:1.7,background:C.bg,padding:'10px 14px',borderRadius:10}}>{brief.kling_i2v}</div>
            </div>}

            {/* HERO: Veo 3.1 */}
            {brief.veo2&&<div style={{padding:18,borderRadius:16,background:C.card,border:'2px solid '+C.cy+'50',marginBottom:14,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(135deg,'+C.cy+','+C.gn+')'}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
                <div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:C.cy}}>{"Veo 3.1 (Google) \u2014 Ch\u1EA5t l\u01B0\u1EE3ng cao nh\u1EA5t, mi\u1EC5n ph\u00ED"}</span>
                  <span style={{marginLeft:8,fontSize:10,padding:'2px 7px',borderRadius:5,background:C.gnS,color:C.gnT,fontWeight:700}}>Free</span>
                </div>
                <div style={{display:'flex',gap:7}}>
                  <button onClick={function(){cp('veo',brief.veo2)}} className="cb" style={{background:copied==='veo'?C.gn:C.el,color:copied==='veo'?'#fff':C.tx2,border:'1px solid '+(copied==='veo'?C.gn:C.bdr)}}>
                    {copied==='veo'?'OK':'Copy'}
                  </button>
                  <button onClick={function(){openTool({name:'Veo 3.1',url:'https://labs.google/fx/tools/video-fx'},brief.veo2)}} className="cb" style={{background:'linear-gradient(135deg,'+C.cy+','+C.gn+')',color:'#fff',fontWeight:700}}>
                    {"M\u1EDF Veo 3.1 \u2192"}
                  </button>
                </div>
              </div>
              <div style={{fontSize:11,color:C.cy,marginBottom:8,padding:'5px 10px',borderRadius:6,background:C.cy+'15',display:'inline-block'}}>
                {"Ch\u1ECDn Video \u2192 Frames \u2192 9:16 \u2192 x4 \u2192 Veo 3.1. Upload \u1EA3nh SP l\u00E0m Start frame \u0111\u1EC3 video ch\u00EDnh x\u00E1c h\u01A1n!"}
              </div>
              <div style={{fontSize:13,color:C.tx,lineHeight:1.7,background:C.bg,padding:'10px 14px',borderRadius:10}}>{brief.veo2}</div>
            </div>}

            {/* Main grid */}
            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:14,alignItems:'start'}}>

              {/* LEFT: Tool tabs */}
              <div>
                <div style={{display:'flex',gap:3,marginBottom:12,padding:4,background:C.panel,borderRadius:12,border:'1px solid '+C.bdr}}>
                  {CATS.map(function(cat){return(
                    <button key={cat.id} onClick={function(){setActiveTab(cat.id)}}
                      style={{flex:1,padding:'8px 4px',borderRadius:9,background:activeTab===cat.id?cat.color:'transparent',color:activeTab===cat.id?'#fff':C.tx2,fontSize:11,fontWeight:700,letterSpacing:'.01em'}}>
                      {cat.label}
                    </button>
                  )})}
                </div>

                {CATS.filter(function(c){return c.id===activeTab}).map(function(cat){
                  var visibleTools = showAll ? cat.tools : cat.tools.filter(function(t){return t.star})
                  var hiddenCount = cat.tools.length - visibleTools.length
                  return(
                  <div key={cat.id} className="fd">
                    <div style={{fontSize:11,color:C.tx2,marginBottom:12,padding:'6px 10px',borderRadius:8,background:cat.color+'15',borderLeft:'3px solid '+cat.color}}>{cat.tip}</div>
                    <div style={{display:'grid',gap:8}}>
                      {visibleTools.map(function(tool){
                        var prompt=getPrompt(tool.pkey)
                        return(
                          <div key={tool.id} style={{background:tool.star?C.card:C.el,borderRadius:12,padding:12,border:'1px solid '+(tool.star?cat.color+'40':C.bdr),display:'flex',alignItems:'flex-start',gap:12}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:prompt?6:0,flexWrap:'wrap'}}>
                                <span style={{fontWeight:700,color:C.tx,fontSize:13}}>{tool.name}</span>
                                <span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:tool.free?C.gnS:C.orS,color:tool.free?C.gnT:C.orT,fontWeight:700}}>{tool.badge}</span>
                                {tool.star&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:cat.color+'25',color:cat.color,fontWeight:700}}>Best</span>}
                              </div>
                              {prompt&&<div style={{fontSize:12,color:C.tx2,lineHeight:1.6,background:C.bg,padding:'7px 10px',borderRadius:8,maxHeight:72,overflow:'auto'}}>{prompt}</div>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                              {prompt&&<button onClick={function(){cp(tool.id,prompt)}} className="cb" style={{background:copied===tool.id?C.gn:C.el,color:copied===tool.id?'#fff':C.tx2,border:'1px solid '+(copied===tool.id?C.gn:C.bdr),padding:'5px 10px'}}>
                                {copied===tool.id?'OK':'Copy'}
                              </button>}
                              <button onClick={function(){if(prompt)openTool(tool,prompt);else window.open(tool.url,'_blank')}} className="cb" style={{background:cat.color,color:'#fff',padding:'5px 10px',justifyContent:'center'}}>
                                Mo
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {!showAll&&hiddenCount>0&&<button onClick={function(){setShowAll(true)}} style={{width:'100%',marginTop:8,padding:'8px',borderRadius:8,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12}}>
                      {'Xem thêm '}{hiddenCount}{' tool khác ▼'}
                    </button>}
                    {showAll&&hiddenCount>0&&<button onClick={function(){setShowAll(false)}} style={{width:'100%',marginTop:8,padding:'8px',borderRadius:8,border:'1px solid '+C.bdr,background:'transparent',color:C.tx2,fontSize:12}}>
                      Thu gọn ▲
                    </button>}
                  </div>
                )})}
              </div>

              {/* RIGHT: Content kit */}
              <div style={{display:'flex',flexDirection:'column',gap:10}}>

                {/* Overlays */}
                <div style={{background:C.panel,borderRadius:14,padding:14,border:'1px solid '+C.bdr}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>Text Overlays (CapCut)</div>
                  {(brief.overlays||[]).map(function(ov,i){
                    return ov.text?<div key={i} style={{display:'flex',gap:7,alignItems:'center',padding:'5px 8px',borderRadius:7,background:C.el,marginBottom:4}}>
                      <span style={{fontSize:9,color:C.txD,width:36,flexShrink:0,fontWeight:600}}>{ov.sec}</span>
                      <span style={{fontSize:12,color:C.tx,flex:1,lineHeight:1.4}}>{ov.text}</span>
                      {ov.style&&<span style={{fontSize:9,color:C.txD,flexShrink:0}}>{ov.style}</span>}
                      <button onClick={function(){cp('ov'+i,ov.text)}} className="cb" style={{background:'transparent',border:'1px solid '+C.bdr,color:C.txD,padding:'2px 7px',flexShrink:0}}>
                        {copied==='ov'+i?'OK':'Copy'}
                      </button>
                    </div>:null
                  })}
                </div>

                {/* Caption */}
                <div style={{background:C.panel,borderRadius:14,padding:14,border:'1px solid '+C.bdr}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase'}}>TikTok Caption</div>
                    <button onClick={function(){cp('cap',(brief.caption||'')+'\n\n'+(brief.hashtags||[]).map(function(h){return'#'+h}).join(' '))}} className="cb" style={{background:copied==='cap'?C.gn:C.ac,color:'#fff',padding:'4px 10px'}}>
                      {copied==='cap'?'OK':'Copy all'}
                    </button>
                  </div>
                  <div style={{fontSize:13,color:C.tx,lineHeight:1.6,padding:'8px 10px',borderRadius:8,background:C.el,marginBottom:6}}>{brief.caption}</div>
                  <div style={{fontSize:11,color:C.acT,lineHeight:1.9}}>{(brief.hashtags||[]).map(function(h){return'#'+h}).join(' ')}</div>
                  {brief.sound&&<div style={{marginTop:6,fontSize:11,color:C.txD}}>Sound: {brief.sound}</div>}
                </div>

                {/* Avatar voiceover */}
                {brief.avatar_vo&&<div style={{background:C.panel,borderRadius:14,padding:14,border:'1px solid '+C.bdr}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.acT,letterSpacing:'.07em',textTransform:'uppercase'}}>Avatar Voiceover</div>
                    <button onClick={function(){cp('avo',brief.avatar_vo)}} className="cb" style={{background:copied==='avo'?C.gn:C.el,color:copied==='avo'?'#fff':C.tx2,border:'1px solid '+C.bdr,padding:'4px 10px'}}>
                      {copied==='avo'?'OK':'Copy'}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:C.tx2,lineHeight:1.65,maxHeight:80,overflow:'auto'}}>{brief.avatar_vo}</div>
                </div>}

                {/* InVideo */}
                {brief.invideo&&<div style={{background:C.panel,borderRadius:14,padding:14,border:'1px solid '+C.bdr}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase'}}>InVideo Script</div>
                    <button onClick={function(){cp('iv',brief.invideo)}} className="cb" style={{background:copied==='iv'?C.gn:C.el,color:copied==='iv'?'#fff':C.tx2,border:'1px solid '+C.bdr,padding:'4px 10px'}}>
                      {copied==='iv'?'OK':'Copy'}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:C.tx2,lineHeight:1.65,maxHeight:80,overflow:'auto'}}>{brief.invideo}</div>
                </div>}

                {/* Refine */}
                <div style={{background:C.panel,borderRadius:14,padding:14,border:'1px solid '+C.or+'30'}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.orT,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>Chỉnh sửa và tạo lại</div>
                  <textarea value={refineText} onChange={function(e){setRefineText(e.target.value)}} rows={2} placeholder="VD: Đổi sang phong cách hài hước hơn / Nhấn mạnh là quà tặng..." style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid '+C.bdr,background:C.el,color:C.tx,fontSize:12,resize:'vertical',lineHeight:1.5}}/>
                  <button onClick={function(){if(refineText){setNiche(function(p){return p+'. '+refineText});setRefineText('');setConcepts([]);doGenerate()}}} disabled={!refineText||!!loading} style={{width:'100%',marginTop:6,padding:'10px',borderRadius:8,background:!refineText||loading?C.el:'linear-gradient(135deg,'+C.or+','+C.pk+')',color:'#fff',fontSize:12,fontWeight:700,opacity:!refineText||loading?0.4:1}}>
                    Tạo lại theo yeu cau
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
