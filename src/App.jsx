import { useState, useCallback } from 'react'

/* ─── THEME ─── */
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

/* ─── TOOL CATALOGUE ─── */
// prompt_key: which field from brief to use for this tool
const CATS=[
  {id:'i2v',label:'🖼️ Image → Video',color:C.ac,
   tip:'Upload ảnh mockup SP vào tool → paste prompt → gen motion video',tools:[
    {id:'kling_i2v', name:'Kling I2V',  url:'https://klingai.com/image-to-video',              star:true, free:true,  badge:'Best for POD',  pkey:'kling_i2v', tip:'Upload product photo trước, rồi paste prompt'},
    {id:'pika',      name:'Pika 2.2',   url:'https://pika.art',                                 star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'luma',      name:'Luma I2V',   url:'https://lumalabs.ai/dream-machine',                star:false,free:true,  badge:'Cinematic',     pkey:'luma',      tip:''},
    {id:'hailuo_i2v',name:'Hailuo I2V', url:'https://hailuoai.video',                          star:false,free:true,  badge:'Free',          pkey:'hailuo',    tip:''},
    {id:'pixverse',  name:'PixVerse',   url:'https://pixverse.ai',                              star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'runway',    name:'Runway Gen4',url:'https://runwayml.com',                             star:false,free:false, badge:'Pro',           pkey:'kling_i2v', tip:''},
    {id:'haiper',    name:'Haiper 2.0', url:'https://haiper.ai',                                star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'vidu',      name:'Vidu 2.0',   url:'https://www.vidu.studio',                          star:false,free:true,  badge:'Free',          pkey:'kling_i2v', tip:''},
    {id:'wan_i2v',   name:'Wan 2.1 I2V',url:'https://replicate.com/wan-ai/wan2.1-i2v-480p',    star:false,free:false, badge:'$0.06/clip',    pkey:'kling_i2v', tip:'Via Replicate API'},
    {id:'minimax',   name:'MiniMax I2V',url:'https://hailuoai.video',                          star:false,free:true,  badge:'Free',          pkey:'hailuo',    tip:''},
  ]},
  {id:'t2v',label:'✍️ Text → Video',color:C.cy,
   tip:'Không cần ảnh — chỉ paste prompt text, AI tự tưởng tượng cảnh quay',tools:[
    {id:'kling_t2v', name:'Kling T2V',  url:'https://klingai.com/text-to-video',               star:true, free:true,  badge:'High quality',  pkey:'kling_t2v', tip:''},
    {id:'hailuo',    name:'Hailuo AI',  url:'https://hailuoai.video',                          star:true, free:true,  badge:'Viral TikTok',  pkey:'hailuo',    tip:''},
    {id:'pika_t2v',  name:'Pika T2V',   url:'https://pika.art',                                 star:false,free:true,  badge:'Free',          pkey:'kling_t2v', tip:''},
    {id:'luma_t2v',  name:'Luma T2V',   url:'https://lumalabs.ai/dream-machine',                star:false,free:true,  badge:'Free',          pkey:'luma',      tip:''},
    {id:'invideo',   name:'InVideo AI', url:'https://ai.invideo.io',                            star:false,free:true,  badge:'Script→Video',  pkey:'invideo',   tip:'Paste trực tiếp vào script field'},
    {id:'runway_t2v',name:'Runway T2V', url:'https://runwayml.com',                             star:false,free:false, badge:'Trial',         pkey:'kling_t2v', tip:''},
    {id:'sora',      name:'Sora',       url:'https://sora.com',                                 star:false,free:false, badge:'OpenAI',        pkey:'kling_t2v', tip:''},
    {id:'veo2',      name:'Veo 2',      url:'https://labs.google/experiments/video-fx',         star:false,free:false, badge:'Google',        pkey:'kling_t2v', tip:''},
    {id:'wan_t2v',   name:'Wan 2.1 T2V',url:'https://replicate.com/wan-ai/wan2.1-t2v-480p',    star:false,free:false, badge:'$0.04/clip',    pkey:'kling_t2v', tip:''},
    {id:'cogvideo',  name:'CogVideoX',  url:'https://huggingface.co/spaces/THUDM/CogVideoX',   star:false,free:true,  badge:'HuggingFace',   pkey:'kling_t2v', tip:'Free, chậm'},
  ]},
  {id:'ugc',label:'🧑 Avatar / UGC',color:C.pk,
   tip:'AI tạo người ảo nói chuyện hoặc mặc SP — cần voiceover script',tools:[
    {id:'heygen',    name:'HeyGen',     url:'https://heygen.com',                               star:true, free:false, badge:'Best avatar',   pkey:'avatar_vo', tip:'Paste script vào voice field'},
    {id:'creatify',  name:'Creatify',   url:'https://creatify.ai',                              star:true, free:true,  badge:'UGC ecom',      pkey:'avatar_vo', tip:'Free trial, chuyên POD ads'},
    {id:'arcads',    name:'Arcads',     url:'https://arcads.ai',                                star:false,free:false, badge:'UGC ads',       pkey:'avatar_vo', tip:''},
    {id:'did',       name:'D-ID',       url:'https://studio.d-id.com',                          star:false,free:true,  badge:'Talking photo', pkey:'avatar_vo', tip:'Upload ảnh → talking avatar'},
    {id:'synthesia', name:'Synthesia',  url:'https://synthesia.io',                             star:false,free:false, badge:'Business',      pkey:'avatar_vo', tip:''},
    {id:'captions',  name:'Captions AI',url:'https://captions.ai',                             star:false,free:true,  badge:'Mobile app',    pkey:'avatar_vo', tip:'App mobile'},
    {id:'virbo',     name:'Virbo',      url:'https://virbo.wondershare.com',                    star:false,free:true,  badge:'Free tier',     pkey:'avatar_vo', tip:''},
  ]},
  {id:'edit',label:'✂️ Edit & Publish',color:C.gn,
   tip:'Sau khi có video từ AI — thêm caption, nhạc, export MP4 để đăng TikTok',tools:[
    {id:'capcut',    name:'CapCut',     url:'https://capcut.com',                               star:true, free:true,  badge:'#1 TikTok',     pkey:null, tip:'Thêm text, sound, filter, export MP4'},
    {id:'veed',      name:'Veed.io',    url:'https://veed.io',                                  star:false,free:true,  badge:'Auto-caption',  pkey:null, tip:'Tự động add subtitle'},
    {id:'opus',      name:'Opus Clip',  url:'https://opus.pro',                                 star:false,free:true,  badge:'Auto-clip',     pkey:null, tip:'Cắt viral moments tự động'},
    {id:'descript',  name:'Descript',   url:'https://descript.com',                             star:false,free:true,  badge:'Edit by text',  pkey:null, tip:''},
    {id:'kapwing',   name:'Kapwing',    url:'https://kapwing.com',                              star:false,free:true,  badge:'Subtitle',      pkey:null, tip:''},
    {id:'canva',     name:'Canva Video',url:'https://canva.com/video',                          star:false,free:true,  badge:'Easy',          pkey:null, tip:''},
    {id:'adobe',     name:'Adobe Express',url:'https://express.adobe.com',                      star:false,free:true,  badge:'Free tier',     pkey:null, tip:''},
  ]},
]

/* ─── AI GEN (Groq → Pollinations with retry) ─── */
async function fetchWithRetry(fn, retries=2){
  for(let i=0;i<=retries;i++){
    try{return await fn()}
    catch(e){if(i===retries)throw e; await new Promise(r=>setTimeout(r,1500))}
  }
}

function buildPrompt(name, quote, niche, hasImgs){
  return `You are a TikTok UGC video director for POD (Print-on-Demand) apparel targeting US buyers.

PRODUCT: "${name}"
${quote?`DESIGN QUOTE (MOST IMPORTANT): "${quote}" — build everything around this quote`:''}
NICHE: "${niche||'US TikTok lifestyle'}"
${hasImgs?'Seller has product mockup photos available.':'No product photos — will need Text-to-Video.'}

Generate 4 DISTINCT video concepts. Each needs REAL motion video prompts for Kling AI and Pika Labs.

RULES for video prompts:
- Describe SPECIFIC BODY MOVEMENTS: walking toward camera, spinning to show design, pointing at the quote on shirt, jumping into frame, sitting/reading, dancing
- Include: subject appearance, exact action, setting, lighting, camera angle, 9:16 vertical TikTok
- Feel like authentic UGC, not a commercial
- If quote exists: the text should be readable and the person's action should relate to it

Return ONLY valid JSON (no markdown, no extra text):
{"concepts":[{
  "id":1,
  "title":"Tên concept ngắn gọn (Tiếng Việt)",
  "vibe":"2-word aesthetic: e.g. Dark Academia / Cottage Dreamer / Y2K Chaos / Clean Minimal",
  "viral_score":9,
  "hook":"Hook text overlay — 5-7 words English, ultra-relatable or funny",
  "why":"Lý do viral một câu (Tiếng Việt)",
  "kling_i2v":"KLING I2V: Upload product photo → describe the person wearing it with SPECIFIC MOTION. 2-3 sentences. Include: gender/aesthetic vibe, exact body movement, setting, lighting quality, camera angle. TikTok vertical 9:16.",
  "kling_t2v":"KLING T2V: Full scene description including person wearing the shirt. [Person description] wearing ${name}${quote?`, shirt reads '${quote}'`:''}, [specific movement], [setting], [lighting]. Cinematic, smooth motion, TikTok 9:16 vertical.",
  "luma":"LUMA: Cinematic variation — same concept but with dramatic lighting and film-quality movement description.",
  "hailuo":"HAILUO: High-energy TikTok version — fast pace, bright colors, trendy movement. Same product, more viral energy.",
  "invideo":"INVIDEO SCRIPT: Full 15s casual script — paste into InVideo script field. Start with hook, tell a micro-story about the product${quote?` and the quote '${quote}'`:''}, end with CTA. English, casual, NOT an ad.",
  "avatar_vo":"AVATAR/UGC VOICEOVER: 15s script for HeyGen/Creatify avatar to speak naturally. First person, casual, like talking to a friend. NOT a sales pitch. Mention the product naturally${quote?` and reference '${quote}'`:''}.  English only.",
  "overlays":[
    {"sec":"0-3s","text":"${quote?quote.substring(0,30)+'...':'Hook text here'}","note":"Large bold, white, center"},
    {"sec":"3-9s","text":"body text here","note":"Caption style, lower third"},
    {"sec":"9-15s","text":"Link in bio 👆","note":"CTA, animated"}
  ],
  "caption":"TikTok caption <90 chars with 2-3 emoji",
  "hashtags":["tag1","tag2","tag3","tag4","tag5","tag6"],
  "sound":"Specific TikTok sound name or music genre that fits this vibe"
}]}`
}

async function genBrief(groqKey, name, quote, niche, hasImgs){
  const prompt=buildPrompt(name,quote,niche,hasImgs)

  const tryGroq=()=>fetchWithRetry(async()=>{
    const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:4500,
        messages:[{role:'system',content:'You are a POD TikTok expert. Return ONLY valid JSON. No explanation.'},{role:'user',content:prompt}],
        response_format:{type:'json_object'}})
    })
    if(!r.ok)throw new Error('Groq '+r.status)
    const d=await r.json()
    return JSON.parse(d.choices?.[0]?.message?.content||'{}')
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

  const d=groqKey? (await tryGroq().catch(()=>tryPoll())) : (await tryPoll())
  if(!d?.concepts?.length)throw new Error('AI không gen được — thử lại')
  return d
}

/* ─── VISION ANALYZE ─── */
async function visionAnalyze(imgs){
  // Support both uploaded files (base64) and URL-only images (from HTML parse)
  const content=await Promise.all(imgs.slice(0,4).map(async im=>{
    // If image was loaded from URL (Etsy CDN) — send URL directly to Claude API
    // Claude's servers fetch it server-side, bypassing browser CORS
    if(im.srcUrl){
      return{type:'image',source:{type:'url',url:im.srcUrl}}
    }
    // Uploaded file — convert to base64 via canvas
    const c=document.createElement('canvas')
    c.width=Math.min(im.img.naturalWidth,800); c.height=Math.min(im.img.naturalHeight,1400)
    c.getContext('2d').drawImage(im.img,0,0,c.width,c.height)
    return{type:'image',source:{type:'base64',media_type:'image/jpeg',data:c.toDataURL('image/jpeg',.85).split(',')[1]}}
  }))
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,
      messages:[{role:'user',content:[...content,{type:'text',
        text:'Analyze this POD apparel. Return ONLY JSON (no markdown): {"name":"product name","quote":"exact text/quote on design or empty string if none","niche":"3-4 US TikTok keywords","design":"1-sentence description"}'}]}]})
  })
  if(!r.ok)throw new Error('Vision API '+r.status)
  const d=await r.json()
  const txt=d.content?.map(c=>c.text||'').join('')||''
  return JSON.parse(txt.replace(/```json|```/g,'').trim())
}

/* ─── IMAGE LOADING ─── */
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

async function urlToImg(src){
  const img=new Image(); img.crossOrigin='anonymous'
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=src})
  const oc=document.createElement('canvas')
  oc.width=Math.min(img.naturalWidth,1080); oc.height=Math.min(img.naturalHeight,1920)
  oc.getContext('2d').drawImage(img,0,0,oc.width,oc.height)
  const data=oc.toDataURL('image/jpeg',.9)
  const safe=new Image(); safe.src=data; await new Promise(r=>{safe.onload=r})
  return{url:data,img:safe}
}

/* ─── PARSE HTML ─── */
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

/* ─── EXPORT BRIEF AS TEXT ─── */
function exportBrief(brief){
  return[
    `═══ POD Content Brief ═══`,
    `Concept: ${brief.title} (${brief.vibe})`,
    `Viral score: ${brief.viral_score}/10`,
    `Hook: ${brief.hook}`,
    `Why: ${brief.why}`,
    ``,
    `── KLING I2V PROMPT ──`,
    brief.kling_i2v||'',
    ``,
    `── KLING T2V PROMPT ──`,
    brief.kling_t2v||'',
    ``,
    `── HAILUO PROMPT ──`,
    brief.hailuo||'',
    ``,
    `── AVATAR/UGC VOICEOVER ──`,
    brief.avatar_vo||'',
    ``,
    `── INVIDEO SCRIPT ──`,
    brief.invideo||'',
    ``,
    `── TIKTOK CAPTION ──`,
    brief.caption||'',
    (brief.hashtags||[]).map(h=>'#'+h).join(' '),
    `Sound: ${brief.sound||''}`,
    ``,
    `── TEXT OVERLAYS ──`,
    ...(brief.overlays||[]).map(o=>`${o.sec}: ${o.text}`),
  ].join('\n')
}

/* ─── APP ─── */
export default function App(){
  const[images,setImages]=useState([])
  const[name,setName]=useState('')
  const[quote,setQuote]=useState('')
  const[niche,setNiche]=useState('')
  const[htmlSrc,setHtmlSrc]=useState('')
  const[groqKey,setGroqKey]=useState(()=>localStorage.getItem('pk-gk')||'')
  const[showSettings,setShowSettings]=useState(false)
  const[loading,setLoading]=useState('')
  const[concepts,setConcepts]=useState([])
  const[sel,setSel]=useState(0)
  const[activeTab,setActiveTab]=useState('i2v')
  const[drag,setDrag]=useState(false)
  const[copied,setCopied]=useState('')
  const[toast,setToast]=useState(null)

  const brief=concepts[sel]||null
  const hasBrief=concepts.length>0

  const notify=useCallback((msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),2800)},[])
  const cp=useCallback((id,text)=>{
    if(!text)return
    navigator.clipboard.writeText(text);setCopied(id);notify('✓ Đã copy!');setTimeout(()=>setCopied(''),2200)
  },[notify])
  const openTool=useCallback((tool,prompt)=>{
    navigator.clipboard.writeText(prompt||'')
    window.open(tool.url,'_blank')
    notify(`Prompt đã copy → Ctrl+V vào ${tool.name}`)
  },[notify])

  const addFiles=useCallback(async files=>{
    for(const f of Array.from(files)){
      if(!f.type.startsWith('image/'))continue
      try{const r=await fileToImg(f);setImages(p=>[...p,r])}catch(e){notify('Lỗi upload ảnh',false)}
    }
  },[notify])

  const doVision=useCallback(async()=>{
    if(!images.length){notify('Upload ảnh trước',false);return}
    setLoading('AI đang nhận diện design...')
    try{
      const r=await visionAnalyze(images)
      if(r.name&&!name)setName(r.name)
      if(r.quote&&!quote)setQuote(r.quote)
      if(r.niche&&!niche)setNiche(r.niche)
      notify('✅ Đọc xong — kiểm tra và chỉnh nếu cần')
    }catch(e){notify('Vision lỗi: '+e.message+' — nhập tay thay thế',false)}
    setLoading('')
  },[images,name,quote,niche,notify])

  const doParseHTML=useCallback(async()=>{
    if(!htmlSrc.trim()){notify('Paste HTML trước',false);return}
    setLoading('Đang trích xuất ảnh...')
    try{
      const urls=extractImgUrls(htmlSrc)
      const tm=htmlSrc.match(/<title[^>]*>([^<]+)<\/title>/i)
      if(tm&&!name)setName(tm[1].replace(/\s*[-|].*/,'').trim().slice(0,80))
      // Also extract rating/price info
      const ratingM=htmlSrc.match(/(\d+(?:\.\d+)?)\s*(?:stars?|★)/i)
      const reviewM=htmlSrc.match(/(\d[\d,]+)\s*(?:reviews?|ratings?)/i)
      const saleM=htmlSrc.match(/(\d+)%\s*off/i)
      
      if(!urls.length){notify('Không tìm thấy ảnh trong HTML',false);setLoading('');return}
      
      // FIX: Add images immediately using srcUrl (display-only via <img> tag)
      // No canvas, no CORS — just store the URL directly
      // Claude Vision API can fetch these URLs server-side
      const newImgs=urls.map(url=>({
        url:url,          // for <img src="..."> display — works fine, no CORS for display
        srcUrl:url,       // flag: this is a URL-sourced image, Vision will use URL mode
        img:null,         // no Image object needed for display
      }))
      setImages(p=>[...p,...newImgs])
      setHtmlSrc('')
      notify(`📸 Lấy được ${urls.length} ảnh từ trang — bấm AI đọc ảnh để phân tích design`)
    }catch(e){notify('Lỗi: '+e.message,false)}
    setLoading('')
  },[htmlSrc,name,notify])

  const doGenerate=useCallback(async()=>{
    if(!name&&!images.length){notify('Nhập tên SP hoặc upload ảnh',false);return}
    setLoading('AI đang viết content brief...')
    try{
      const d=await genBrief(groqKey,name||'POD apparel',quote,niche,images.length>0)
      setConcepts(d.concepts);setSel(0);setActiveTab('i2v')
    }catch(e){notify(e.message,false)}
    setLoading('')
  },[groqKey,name,quote,niche,images.length,notify])

  const doRegen=useCallback(()=>{setConcepts([]);doGenerate()},[doGenerate])

  const getPrompt=useCallback((pkey)=>{
    if(!brief||!pkey)return ''
    return brief[pkey]||''
  },[brief])

  const doExport=useCallback(()=>{
    if(!brief)return
    navigator.clipboard.writeText(exportBrief(brief))
    notify('📋 Full brief đã copy vào clipboard!')
  },[brief,notify])

  /* ─── RENDER ─── */
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
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .cb{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;transition:all .15s;cursor:pointer}
        .cb:hover{opacity:.85}
        select option{background:${C.card}}
      `}</style>

      {/* TOAST */}
      {toast&&<div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',padding:'9px 22px',borderRadius:24,background:toast.ok?C.gn:C.rd,color:'#fff',fontSize:13,fontWeight:700,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,.5)',whiteSpace:'nowrap',animation:'fi .18s ease'}}>
        {toast.msg}
      </div>}

      {/* HEADER */}
      <header style={{background:C.panel,borderBottom:`1px solid ${C.bdr}`,position:'sticky',top:0,zIndex:100,backdropFilter:'blur(16px)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'10px 20px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:C.acG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>🎬</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,background:C.acG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>POD Content Brief</span>
          <span style={{fontSize:11,color:C.txD,display:'none @media(max-width:600px)'}}>ảnh SP → AI video prompts</span>
          <div style={{flex:1}}/>
          {loading&&<div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.tx2}}>
            <div style={{width:14,height:14,borderRadius:'50%',border:`2px solid ${C.ac}40`,borderTopColor:C.ac,animation:'spin .7s linear infinite'}}/>
            {loading}
          </div>}
          {hasBrief&&<>
            <button onClick={doExport} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${C.ac}40`,background:C.acS,color:C.acT,fontSize:12,fontWeight:600}}>📋 Export brief</button>
            <button onClick={()=>{setConcepts([]);setImages([]);setName('');setQuote('');setNiche('')}} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${C.bdr}`,background:'transparent',color:C.tx2,fontSize:12}}>↺ Làm mới</button>
          </>}
          <button onClick={()=>setShowSettings(!showSettings)} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${showSettings?C.ac:C.bdr}`,background:showSettings?C.acS:'transparent',color:showSettings?C.acT:C.tx2,fontSize:12}}>⚙️ API Key</button>
        </div>
      </header>

      {/* SETTINGS */}
      {showSettings&&<div style={{maxWidth:1200,margin:'0 auto',padding:'10px 20px 0'}}>
        <div className="fd" style={{padding:14,borderRadius:12,background:C.panel,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.acT,marginBottom:6}}>Groq API Key — <a href="https://console.groq.com/keys" target="_blank" style={{color:C.acT,fontSize:11}}>console.groq.com/keys</a> <span style={{color:C.txD,fontWeight:400}}>(free, nhanh hơn Pollinations)</span></div>
          <div style={{display:'flex',gap:8}}>
            <input type="password" value={groqKey} onChange={e=>{setGroqKey(e.target.value);localStorage.setItem('pk-gk',e.target.value)}} placeholder="gsk_..." style={{flex:1,padding:'9px 14px',borderRadius:9,border:`1px solid ${C.bdr}`,background:C.el,color:C.tx,fontSize:13}}/>
            <button onClick={()=>setShowSettings(false)} style={{padding:'9px 20px',borderRadius:9,background:C.ac,color:'#fff',fontSize:13,fontWeight:700}}>Lưu</button>
          </div>
          <div style={{fontSize:11,color:C.txD,marginTop:5}}>Không có key vẫn dùng được (Pollinations free, có retry tự động)</div>
        </div>
      </div>}

      <main style={{maxWidth:1200,margin:'0 auto',padding:'16px 20px 60px'}}>

        {/* ══ INPUT SCREEN ══ */}
        {!hasBrief&&<div className="fd" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>

          {/* LEFT: Images */}
          <div style={{background:C.panel,borderRadius:16,padding:20,border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:12}}>📸 Ảnh sản phẩm</div>

            {/* Drop zone */}
            <div
              onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files)}}
              onClick={()=>document.getElementById('imgIn').click()}
              style={{border:`2px dashed ${drag?C.ac:C.bdrH}`,borderRadius:12,padding:images.length?12:28,background:drag?C.acS:C.el,transition:'all .2s',cursor:'pointer',textAlign:'center',minHeight:images.length?'auto':120,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <input id="imgIn" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
              {images.length===0?(
                <>
                  <div style={{fontSize:28,marginBottom:6}}>📸</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.tx}}>Kéo thả hoặc click upload</div>
                  <div style={{fontSize:11,color:C.txD,marginTop:3}}>Mockup / flat lay / lifestyle · JPG PNG WEBP</div>
                  <div style={{marginTop:8,fontSize:10,padding:'3px 10px',borderRadius:6,background:C.acS,color:C.acT}}>✨ AI Vision sẽ đọc design tự động</div>
                </>
              ):(
                <div style={{display:'flex',gap:8,flexWrap:'wrap',width:'100%'}}>
                  {images.map((im,i)=>(
                    <div key={i} style={{position:'relative',flexShrink:0}}>
                      <img src={im.url} style={{width:60,height:60,borderRadius:8,objectFit:'cover',border:`2px solid ${im.srcUrl?C.or:C.ac}50`}} onError={e=>{e.target.style.background=C.el;e.target.style.opacity='.3'}}/>
                      {im.srcUrl&&<div style={{position:'absolute',bottom:0,left:0,right:0,fontSize:8,fontWeight:700,color:'#fff',background:'rgba(245,158,11,.85)',textAlign:'center',borderRadius:'0 0 6px 6px',padding:'1px 0'}}>Etsy</div>}
                      <button onClick={e=>{e.stopPropagation();setImages(p=>p.filter((_,j)=>j!==i))}} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:9,background:C.rd,color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                  ))}
                  <div style={{width:60,height:60,borderRadius:8,border:`2px dashed ${C.bdrH}`,display:'flex',alignItems:'center',justifyContent:'center',color:C.txD,fontSize:18}}>+</div>
                </div>
              )}
            </div>

            {/* Vision */}
            {images.length>0&&(
              <button onClick={doVision} disabled={!!loading} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:10,background:loading?C.el:C.acG,color:'#fff',fontSize:13,fontWeight:700,opacity:loading?0.5:1,transition:'all .2s'}}>
                {loading==='AI đang nhận diện design...'?'⏳ Đang đọc...':'🔍 AI đọc ảnh → tự điền thông tin'}
              </button>
            )}

            {/* HTML parse */}
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.bdr}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.orT,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:8}}>🔗 Hoặc Paste HTML Etsy / Amazon</div>
              <div style={{fontSize:11,color:C.orT,padding:'6px 10px',borderRadius:8,background:C.orS,lineHeight:1.6,marginBottom:8}}>
                Mở trang SP → <b>Ctrl+U</b> → <b>Ctrl+A</b> → <b>Ctrl+C</b> → paste vào đây → AI tự lấy ảnh
              </div>
              <div style={{position:'relative'}}>
                <textarea value={htmlSrc} onChange={e=>setHtmlSrc(e.target.value)} rows={3} placeholder="Paste toàn bộ HTML source..." style={{width:'100%',padding:'9px 12px',borderRadius:9,border:`1px solid ${htmlSrc?C.or:C.bdr}`,background:C.el,color:C.tx,fontSize:12,resize:'vertical',fontFamily:'monospace',lineHeight:1.4,transition:'border .2s'}}/>
                {htmlSrc&&<button onClick={()=>setHtmlSrc('')} style={{position:'absolute',top:5,right:5,width:18,height:18,borderRadius:9,background:C.rd,color:'#fff',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>}
              </div>
              <button onClick={doParseHTML} disabled={!!loading||!htmlSrc.trim()} style={{width:'100%',marginTop:7,padding:'10px',borderRadius:9,background:loading||!htmlSrc.trim()?C.el:`linear-gradient(135deg,${C.or},${C.pk})`,color:'#fff',fontSize:13,fontWeight:700,opacity:loading||!htmlSrc.trim()?0.4:1,transition:'all .2s'}}>
                {loading==='Đang trích xuất ảnh...'?'⏳ Đang lấy...':'📸 Lấy ảnh + tên từ HTML'}
              </button>
            </div>
          </div>

          {/* RIGHT: Product info */}
          <div>
            <div style={{background:C.panel,borderRadius:16,padding:20,border:`1px solid ${C.bdr}`,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:12}}>📝 Thông tin sản phẩm</div>
              {[
                {label:'Tên sản phẩm *',val:name,set:setName,ph:'VD: Frog Moon Vintage Graphic T-Shirt',hl:false},
                {label:'Chữ / quote trên design — yếu tố viral chính ⚡',val:quote,set:setQuote,ph:'"I survived another meeting that could have been an email"',hl:true},
                {label:'Niche / đối tượng người mua',val:niche,set:setNiche,ph:'VD: cottagecore girl, nurse humor, cat mom, gym bro, teacher...',hl:false},
              ].map((f,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:f.hl?C.acT:C.tx2,marginBottom:4}}>{f.label}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:`1px solid ${f.val?C.ac:C.bdr}`,background:C.el,color:C.tx,fontSize:13,transition:'border .2s'}}/>
                </div>
              ))}
            </div>

            <button onClick={doGenerate} disabled={!!loading||(!name&&!images.length)}
              style={{width:'100%',padding:'18px',borderRadius:14,background:loading||(!name&&!images.length)?C.el:C.acG,color:'#fff',fontSize:16,fontWeight:800,opacity:loading||(!name&&!images.length)?0.4:1,boxShadow:name||images.length?'0 8px 32px rgba(99,102,241,.4)':'none',transition:'all .2s',fontFamily:"'Syne',sans-serif"}}>
              {loading?`⏳ ${loading}`:'✨ Tạo Content Brief (4 concepts)'}
            </button>
            {!name&&!images.length&&<div style={{fontSize:11,color:C.txD,textAlign:'center',marginTop:6}}>Nhập tên SP hoặc upload ảnh để bắt đầu</div>}

            <div style={{marginTop:12,padding:14,borderRadius:12,background:C.panel,border:`1px solid ${C.bdr}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.txD,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>Output bạn sẽ nhận được</div>
              {[
                ['🤖','Prompt cho Kling I2V / T2V — người mặc áo, chuyển động cụ thể'],
                ['🌊','Prompt riêng cho Hailuo, Luma, Pika, InVideo...'],
                ['🎭','Voiceover script cho HeyGen / Creatify avatar'],
                ['📝','Text overlays theo giây cho CapCut'],
                ['📱','TikTok caption + hashtags + sound gợi ý'],
                ['📱','Hướng dẫn tự quay UGC 3 bước nếu không có tool AI'],
              ].map(([ic,t])=>(
                <div key={t} style={{display:'flex',gap:7,marginBottom:5}}>
                  <span style={{fontSize:13,flexShrink:0}}>{ic}</span>
                  <span style={{fontSize:12,color:C.tx2,lineHeight:1.5}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* ══ BRIEF SCREEN ══ */}
        {hasBrief&&brief&&(
          <div className="fd">
            {/* Concept switcher */}
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:11,color:C.txD,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',flexShrink:0}}>Concept:</span>
              {concepts.map((c,i)=>(
                <button key={i} onClick={()=>{setSel(i);setActiveTab('i2v')}}
                  style={{padding:'6px 14px',borderRadius:9,border:`1px solid ${sel===i?C.ac:C.bdr}`,background:sel===i?C.acS:'transparent',color:sel===i?C.acT:C.tx2,fontSize:12,fontWeight:sel===i?700:400,transition:'all .15s'}}>
                  #{i+1} {(c.vibe||'').split(' ').slice(0,2).join(' ')} <span style={{fontSize:10,color:sel===i?C.acT:C.txD}}>🔥{c.viral_score}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              <button onClick={doRegen} disabled={!!loading} style={{padding:'6px 14px',borderRadius:9,border:`1px solid ${C.bdr}`,background:'transparent',color:C.tx2,fontSize:12,opacity:loading?0.5:1}}>
                🔄 Tạo lại
              </button>
              <button onClick={()=>setConcepts([])} style={{padding:'6px 14px',borderRadius:9,border:`1px solid ${C.bdr}`,background:'transparent',color:C.tx2,fontSize:12}}>
                ← Nhập lại
              </button>
            </div>

            {/* Concept header */}
            <div style={{padding:'14px 18px',borderRadius:14,background:C.panel,border:`1px solid ${C.bdr}`,marginBottom:14,display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:3}}>{brief.title}</div>
                <div style={{fontSize:12,color:C.tx2}}>{brief.vibe} · {brief.why}</div>
              </div>
              {brief.hook&&<div style={{flex:2,padding:'8px 14px',borderRadius:10,background:C.acS,border:`1px solid ${C.ac}30`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,minWidth:200}}>
                <span style={{fontSize:14,fontWeight:700,color:C.tx}}>"{brief.hook}"</span>
                <button onClick={()=>cp('hook',brief.hook)} className="cb" style={{background:copied==='hook'?C.gn:C.ac,color:'#fff',flexShrink:0}}>
                  {copied==='hook'?'✓':'Copy hook'}
                </button>
              </div>}
              {images.length>0&&<div style={{display:'flex',gap:5}}>
                {images.slice(0,2).map((im,i)=><img key={i} src={im.url} style={{height:52,borderRadius:7,objectFit:'cover',border:`1px solid ${C.bdr}`}}/>)}
              </div>}
            </div>

            {/* ── HERO: Kling I2V — most important prompt ── */}
            {brief.kling_i2v&&<div style={{padding:18,borderRadius:16,background:C.card,border:`2px solid ${C.ac}50`,marginBottom:14,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:C.acG}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:C.acT}}>🤖 Kling I2V — Best Prompt to Start</span>
                  <span style={{marginLeft:8,fontSize:10,padding:'2px 7px',borderRadius:5,background:C.gnS,color:C.gnT,fontWeight:700}}>⭐ Recommended</span>
                </div>
                <div style={{display:'flex',gap:7}}>
                  <button onClick={()=>cp('ki',brief.kling_i2v)} className="cb" style={{background:copied==='ki'?C.gn:C.el,color:copied==='ki'?'#fff':C.tx2,border:`1px solid ${copied==='ki'?C.gn:C.bdr}`}}>
                    {copied==='ki'?'✓ Copied':'📋 Copy'}
                  </button>
                  <button onClick={()=>openTool({name:'Kling I2V',url:'https://klingai.com/image-to-video'},brief.kling_i2v)} className="cb" style={{background:C.acG,color:'#fff',fontWeight:700}}>
                    Mở Kling →
                  </button>
                </div>
              </div>
              <div style={{fontSize:11,color:C.acT,marginBottom:8,padding:'5px 10px',borderRadius:6,background:C.acS,display:'inline-block'}}>
                💡 Upload ảnh SP vào Kling trước, rồi paste prompt này vào ô Motion Prompt
              </div>
              <div style={{fontSize:13,color:C.tx,lineHeight:1.7,background:C.bg,padding:'10px 14px',borderRadius:10}}>{brief.kling_i2v}</div>
            </div>}

            {/* Main grid: tools left, content kit right */}
            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:14,alignItems:'start'}}>

              {/* LEFT: Tool tabs */}
              <div>
                {/* Category tabs */}
                <div style={{display:'flex',gap:3,marginBottom:12,padding:4,background:C.panel,borderRadius:12,border:`1px solid ${C.bdr}`}}>
                  {CATS.map(cat=>(
                    <button key={cat.id} onClick={()=>setActiveTab(cat.id)}
                      style={{flex:1,padding:'8px 4px',borderRadius:9,background:activeTab===cat.id?cat.color:'transparent',color:activeTab===cat.id?'#fff':C.tx2,fontSize:11,fontWeight:700,transition:'all .15s',letterSpacing:'.01em'}}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Active category */}
                {CATS.filter(c=>c.id===activeTab).map(cat=>(
                  <div key={cat.id} className="fd">
                    <div style={{fontSize:11,color:C.tx2,marginBottom:12,padding:'6px 10px',borderRadius:8,background:cat.color+'15',borderLeft:`3px solid ${cat.color}`}}>{cat.tip}</div>
                    <div style={{display:'grid',gap:8}}>
                      {cat.tools.map(tool=>{
                        const prompt=getPrompt(tool.pkey)
                        return(
                          <div key={tool.id} style={{background:tool.star?C.card:C.el,borderRadius:12,padding:12,border:`1px solid ${tool.star?cat.color+'40':C.bdr}`,display:'flex',alignItems:'flex-start',gap:12}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:prompt?6:0,flexWrap:'wrap'}}>
                                <span style={{fontWeight:700,color:C.tx,fontSize:13}}>{tool.name}</span>
                                <span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:tool.free?C.gnS:C.orS,color:tool.free?C.gnT:C.orT,fontWeight:700}}>{tool.badge}</span>
                                {tool.star&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:cat.color+'25',color:cat.color,fontWeight:700}}>⭐</span>}
                                {tool.tip&&<span style={{fontSize:10,color:C.txD}}>{tool.tip}</span>}
                              </div>
                              {prompt&&<div style={{fontSize:12,color:C.tx2,lineHeight:1.6,background:C.bg,padding:'7px 10px',borderRadius:8,maxHeight:72,overflow:'auto'}}>{prompt}</div>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                              {prompt&&<button onClick={()=>cp(tool.id,prompt)} className="cb" style={{background:copied===tool.id?C.gn:C.el,color:copied===tool.id?'#fff':C.tx2,border:`1px solid ${copied===tool.id?C.gn:C.bdr}`,padding:'5px 10px'}}>
                                {copied===tool.id?'✓':'Copy'}
                              </button>}
                              <button onClick={()=>prompt?openTool(tool,prompt):window.open(tool.url,'_blank')} className="cb" style={{background:cat.color,color:'#fff',padding:'5px 10px',justifyContent:'center'}}>
                                Mở →
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: Content kit */}
              <div style={{display:'flex',flexDirection:'column',gap:10}}>

                {/* Overlays */}
                <div style={{background:C.panel,borderRadius:14,padding:14,border:`1px solid ${C.bdr}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>📝 Text Overlays (CapCut)</div>
                  {(brief.overlays||[]).map((ov,i)=>(
                    ov.text?<div key={i} style={{display:'flex',gap:7,alignItems:'center',padding:'6px 8px',borderRadius:7,background:C.el,marginBottom:5}}>
                      <span style={{fontSize:9,color:C.txD,width:32,flexShrink:0}}>{ov.sec}</span>
                      <span style={{fontSize:12,color:C.tx,flex:1,lineHeight:1.4}}>{ov.text}</span>
                      <button onClick={()=>cp('ov'+i,ov.text)} className="cb" style={{background:'transparent',border:`1px solid ${C.bdr}`,color:C.txD,padding:'2px 7px',flexShrink:0}}>
                        {copied==='ov'+i?'✓':'Copy'}
                      </button>
                    </div>:null
                  ))}
                </div>

                {/* Caption */}
                <div style={{background:C.panel,borderRadius:14,padding:14,border:`1px solid ${C.bdr}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase'}}>📱 TikTok Caption</div>
                    <button onClick={()=>cp('cap',(brief.caption||'')+'\n\n'+(brief.hashtags||[]).map(h=>'#'+h).join(' '))} className="cb" style={{background:copied==='cap'?C.gn:C.ac,color:'#fff',padding:'4px 10px'}}>
                      {copied==='cap'?'✓ Copied':'Copy all'}
                    </button>
                  </div>
                  <div style={{fontSize:13,color:C.tx,lineHeight:1.6,padding:'8px 10px',borderRadius:8,background:C.el,marginBottom:6}}>{brief.caption}</div>
                  <div style={{fontSize:11,color:C.acT,lineHeight:1.9}}>{(brief.hashtags||[]).map(h=>'#'+h).join(' ')}</div>
                  {brief.sound&&<div style={{marginTop:6,fontSize:11,color:C.txD}}>🎵 {brief.sound}</div>}
                </div>

                {/* UGC self-shoot */}
                {brief.ugc_steps&&<div style={{background:C.gnS,borderRadius:14,padding:14,border:`1px solid ${C.gn}30`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.gnT,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>📱 Tự Quay UGC (không cần AI tool)</div>
                  <div style={{fontSize:12,color:C.gnT,lineHeight:1.75,whiteSpace:'pre-wrap'}}>{brief.ugc_steps}</div>
                  <button onClick={()=>cp('ugc',brief.ugc_steps)} className="cb" style={{marginTop:8,background:'transparent',border:`1px solid ${C.gn}40`,color:C.gnT,padding:'4px 10px'}}>
                    {copied==='ugc'?'✓':'Copy guide'}
                  </button>
                </div>}

                {/* Avatar voiceover */}
                {brief.avatar_vo&&<div style={{background:C.panel,borderRadius:14,padding:14,border:`1px solid ${C.bdr}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.pkT||C.acT,letterSpacing:'.07em',textTransform:'uppercase'}}>🎭 Avatar Voiceover (HeyGen/Creatify)</div>
                    <button onClick={()=>cp('avo',brief.avatar_vo)} className="cb" style={{background:copied==='avo'?C.gn:C.el,color:copied==='avo'?'#fff':C.tx2,border:`1px solid ${C.bdr}`,padding:'4px 10px'}}>
                      {copied==='avo'?'✓':'Copy'}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:C.tx2,lineHeight:1.65,maxHeight:80,overflow:'auto'}}>{brief.avatar_vo}</div>
                </div>}

                {/* InVideo */}
                {brief.invideo&&<div style={{background:C.panel,borderRadius:14,padding:14,border:`1px solid ${C.bdr}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.tx2,letterSpacing:'.07em',textTransform:'uppercase'}}>🎬 InVideo Script</div>
                    <button onClick={()=>cp('iv',brief.invideo)} className="cb" style={{background:copied==='iv'?C.gn:C.el,color:copied==='iv'?'#fff':C.tx2,border:`1px solid ${C.bdr}`,padding:'4px 10px'}}>
                      {copied==='iv'?'✓':'Copy'}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:C.tx2,lineHeight:1.65,maxHeight:80,overflow:'auto'}}>{brief.invideo}</div>
                </div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
