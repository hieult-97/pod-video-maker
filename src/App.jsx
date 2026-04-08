import { useState, useCallback, useRef, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/* ═══ THEME ═══ */
const T = {
  bg:"#07080f",sf:"#0f1019",card:"#161722",el:"#1e1f2e",
  bdr:"#252638",bdrL:"#333448",
  ac:"#6c4ef2",acS:"rgba(108,78,242,.13)",acT:"#a48cff",
  gn:"#16c784",gnS:"rgba(22,199,132,.1)",gnT:"#6ee7b7",
  or:"#f59e0b",orS:"rgba(245,158,11,.1)",orT:"#fcd34d",
  rd:"#f43f5e",rdS:"rgba(244,63,94,.1)",rdT:"#fda4af",
  bl:"#3b82f6",blS:"rgba(59,130,246,.1)",blT:"#93c5fd",
  pk:"#e879f9",cy:"#22d3ee",
  tx:"#eaeaf8",tx2:"#8b8da8",txD:"#4a4b65",
}
const TRANS = ["fade","slideLeft","slideUp","zoom","none"]
const FONTS = [
  { id:"dm", name:"DM Sans", css:"'DM Sans',sans-serif" },
  { id:"playfair", name:"Playfair", css:"'Playfair Display',serif" },
  { id:"space", name:"Space Grotesk", css:"'Space Grotesk',sans-serif" },
  { id:"marker", name:"Marker", css:"'Permanent Marker',cursive" },
  { id:"bebas", name:"Bebas Neue", css:"'Bebas Neue',sans-serif" },
]
const PROVS = [
  { id:"auto",name:"Auto",icon:"⚡",nk:false,h:"Pollinations (miễn phí)" },
  { id:"pollinations",name:"Pollinations",icon:"🌸",nk:false,h:"FREE, không cần key" },
  { id:"groq",name:"Groq",icon:"⚡",nk:true,h:"FREE — console.groq.com" },
  { id:"gemini",name:"Gemini",icon:"💎",nk:true,h:"FREE — aistudio.google.com" },
  { id:"openai",name:"OpenAI",icon:"🧠",nk:true,h:"Trả phí" },
]
const TOOL_CATS = [
  {
    id:"t2v", label:"🎬 Text → Video", desc:"Paste prompt, AI tự tạo video",
    tools:[
      {id:"invideo",   name:"InVideo AI",    url:"https://ai.invideo.io",              icon:"🎬", free:true,  tip:"Free · Script-to-video tốt nhất"},
      {id:"kling_t2v", name:"Kling T2V",     url:"https://klingai.com/text-to-video",  icon:"🤖", free:true,  tip:"Free tier · Chất lượng cao"},
      {id:"hailuo",    name:"Hailuo AI",     url:"https://hailuoai.video",             icon:"🌊", free:true,  tip:"Free · Minimax · Viral trên TikTok"},
      {id:"pika",      name:"Pika Labs",     url:"https://pika.art",                   icon:"⚡", free:true,  tip:"Free · Nhanh · Đẹp"},
      {id:"luma",      name:"Luma Dream",    url:"https://lumalabs.ai/dream-machine",  icon:"🌙", free:true,  tip:"Free tier · Cinematic"},
      {id:"runway",    name:"Runway Gen-4",  url:"https://runwayml.com",               icon:"✈️", free:false, tip:"Trial · Chất lượng pro"},
      {id:"sora",      name:"Sora",          url:"https://sora.com",                   icon:"🔮", free:false, tip:"OpenAI · Paid"},
      {id:"pictory",   name:"Pictory",       url:"https://pictory.ai",                 icon:"🎥", free:true,  tip:"Free trial · Stock footage"},
      {id:"fliki",     name:"Fliki",         url:"https://fliki.ai",                   icon:"🗣️", free:true,  tip:"Free · Voice + video"},
      {id:"vidsell",   name:"Canva Video",   url:"https://canva.com/video",            icon:"🎨", free:true,  tip:"Free · Dễ dùng"},
    ]
  },
  {
    id:"i2v", label:"🖼️ Image → Video", desc:"Upload ảnh SP → AI làm chuyển động",
    tools:[
      {id:"kling_i2v", name:"Kling I2V",     url:"https://klingai.com/image-to-video", icon:"🤖", free:true,  tip:"Free · Tốt nhất cho POD"},
      {id:"pika_i2v",  name:"Pika I2V",      url:"https://pika.art",                   icon:"⚡", free:true,  tip:"Free · Upload ảnh rồi gen"},
      {id:"luma_i2v",  name:"Luma I2V",      url:"https://lumalabs.ai/dream-machine",  icon:"🌙", free:true,  tip:"Free · Cinematic motion"},
      {id:"runway_i2v",name:"Runway I2V",    url:"https://runwayml.com",               icon:"✈️", free:false, tip:"Trial · Stable motion"},
      {id:"wan_i2v",   name:"Wan 2.1 I2V",   url:"https://replicate.com/wan-ai/wan2.1-i2v-480p", icon:"🚀", free:false, tip:"Replicate · $0.06/clip"},
      {id:"pixverse",  name:"PixVerse",      url:"https://pixverse.ai",                icon:"🎭", free:true,  tip:"Free · I2V chất lượng tốt"},
      {id:"haiper",    name:"Haiper",        url:"https://haiper.ai",                  icon:"💫", free:true,  tip:"Free · Nhanh"},
    ]
  },
  {
    id:"ugc", label:"🧑 AI Avatar / UGC", desc:"Người ảo nói chuyện / mặc sản phẩm",
    tools:[
      {id:"heygen",    name:"HeyGen",        url:"https://heygen.com",                 icon:"🎭", free:false, tip:"$29/mo · Avatar tốt nhất"},
      {id:"creatify",  name:"Creatify",      url:"https://creatify.ai",                icon:"🛍️", free:true,  tip:"Free trial · UGC cho ecom"},
      {id:"arcads",    name:"Arcads",        url:"https://arcads.ai",                  icon:"📱", free:false, tip:"UGC ads chuyên nghiệp"},
      {id:"did",       name:"D-ID",          url:"https://studio.d-id.com",            icon:"👤", free:true,  tip:"Free tier · Talking photo"},
      {id:"synthesia", name:"Synthesia",     url:"https://synthesia.io",               icon:"🎙️", free:false, tip:"Business avatar · $22/mo"},
      {id:"captions",  name:"Captions AI",   url:"https://captions.ai",                icon:"💬", free:true,  tip:"Free · Mobile · Auto-caption"},
    ]
  },
  {
    id:"edit", label:"✂️ Edit & Polish", desc:"Thêm caption, nhạc, hiệu ứng",
    tools:[
      {id:"capcut",    name:"CapCut",        url:"https://capcut.com",                 icon:"✂️", free:true,  tip:"Free · Phổ biến nhất"},
      {id:"veed",      name:"Veed.io",       url:"https://veed.io",                    icon:"🎞️", free:true,  tip:"Free · Auto-caption chuẩn"},
      {id:"opus",      name:"Opus Clip",     url:"https://opus.pro",                   icon:"📎", free:true,  tip:"Free · Auto-clip viral moments"},
      {id:"descript",  name:"Descript",      url:"https://descript.com",               icon:"📝", free:true,  tip:"Free · Edit bằng text"},
      {id:"kapwing",   name:"Kapwing",       url:"https://kapwing.com",                icon:"🔧", free:true,  tip:"Free · Subtitle + edit"},
    ]
  },
]
// Flat TOOLS for backward compat
const TOOLS = TOOL_CATS.flatMap(c=>c.tools)
const TEXT_ANIMS = ["static","typewriter","pop","slideUp","wave"]
const EL_VOICES = [
  {id:'21m00Tcm4TlvDq8ikWAM',name:'Rachel (narrator)'},
  {id:'EXAVITQu4vr4xnSDxMaL',name:'Bella (young)'},
  {id:'ErXwobaYiN019PkySvjV',name:'Antoni (male)'},
  {id:'TxGEqnHWrfWFTfGW9XjX',name:'Josh (deep male)'},
  {id:'pNInz6obpgDQGcFmaJgB',name:'Adam (narration)'},
]

/* ═══ RETRY ═══ */
async function withRetry(fn, retries=2, delay=1500) {
  for(let i=0;i<=retries;i++){try{return await fn()}catch(e){if(i===retries)throw e;await new Promise(r=>setTimeout(r,delay))}}
}

/* ═══ AI ═══ */
async function callAI(pv,key,prompt,json=true){
  if(pv==="auto"||pv==="pollinations"){
    // Pollinations — free, no key needed
    const r=await fetch("https://text.pollinations.ai/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:"You are a POD/TikTok video expert. Respond ONLY with valid JSON when asked. No markdown, no explanation."},{role:"user",content:prompt}],model:"openai",jsonMode:json,seed:Math.floor(Math.random()*9999)})})
    if(!r.ok)throw new Error("Pollinations lỗi "+r.status);return await r.text()
  }
  if(pv==="groq"){
    if(!key)throw new Error("Nhập Groq key trong ⚙️ Settings")
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:3000,messages:[{role:"system",content:"You are a POD/TikTok video expert. Respond ONLY with valid JSON."},{role:"user",content:prompt}],...(json?{response_format:{type:"json_object"}}:{})})})
    if(!r.ok)throw new Error("Groq lỗi "+r.status);const d=await r.json();return d.choices?.[0]?.message?.content||""
  }
  if(pv==="gemini"){
    if(!key)throw new Error("Nhập Gemini key trong ⚙️ Settings")
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{...(json?{responseMimeType:"application/json"}:{}),maxOutputTokens:3000}})})
    if(!r.ok)throw new Error("Gemini lỗi "+r.status);const d=await r.json();return d.candidates?.[0]?.content?.parts?.[0]?.text||""
  }
  if(pv==="openai"){
    if(!key)throw new Error("Nhập OpenAI key trong ⚙️ Settings")
    const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:"gpt-4o-mini",max_tokens:3000,messages:[{role:"system",content:"You are a POD/TikTok video expert. Respond ONLY with valid JSON."},{role:"user",content:prompt}],...(json?{response_format:{type:"json_object"}}:{})})})
    if(!r.ok)throw new Error("OpenAI lỗi "+r.status);const d=await r.json();return d.choices?.[0]?.message?.content||""
  }
  throw new Error("Provider lỗi")
}

async function aiJSON(pv,key,prompt){
  return withRetry(async()=>{
    const raw=await callAI(pv,key,prompt,true)
    try{return JSON.parse(raw.replace(/```json|```/g,"").trim())}
    catch{throw new Error("AI trả format lỗi, đang thử lại...")}
  })
}
async function aiText(pv,key,prompt){return withRetry(()=>callAI(pv,key,prompt,false))}

/* ═══ IMAGE ═══ */
// FIX: Load image with proper crossOrigin for canvas
function loadImg(u){
  return new Promise((res,rej)=>{
    const img=new Image()
    img.crossOrigin="anonymous"
    img.onload=()=>res(img)
    img.onerror=()=>{
      // Try without crossOrigin as fallback
      const img2=new Image()
      img2.onload=()=>res(img2)
      img2.onerror=()=>rej(new Error("Không load được ảnh"))
      img2.src=u+"?t="+Date.now()
    }
    img.src=u
  })
}

// FIX: Load uploaded file as canvas-safe image via ImageBitmap
async function loadUploadedImg(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file)
    const img=new Image()
    img.onload=()=>{
      // Draw to offscreen canvas → get data URL (canvas-safe, no taint)
      const oc=document.createElement("canvas")
      oc.width=Math.min(img.naturalWidth,1080)
      oc.height=Math.min(img.naturalHeight,1920)
      oc.getContext("2d").drawImage(img,0,0,oc.width,oc.height)
      const dataUrl=oc.toDataURL("image/jpeg",0.92)
      URL.revokeObjectURL(url)
      // Build a NEW image from data URL — stable, no blob dependency
      const safe=new Image()
      safe.onload=()=>res({url:dataUrl,img:safe,_safe:true})
      safe.onerror=()=>rej()
      safe.src=dataUrl
    }
    img.onerror=()=>{URL.revokeObjectURL(url);rej()}
    img.src=url
  })
}

function pollImg(p){return`https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1080&height=1920&nologo=true&enhance=true&seed=${Math.floor(Math.random()*99999)}`}

async function generateImage(prompt,dalleKey,repKey){
  if(repKey){try{return await fluxImage(prompt,repKey)}catch{}}
  if(dalleKey){
    try{
      const r=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Authorization":"Bearer "+dalleKey,"Content-Type":"application/json"},body:JSON.stringify({model:"dall-e-3",prompt:"TikTok vertical 9:16: "+prompt,size:"1024x1792",n:1,quality:"standard"})})
      if(r.ok){const d=await r.json();if(d.data?.[0]?.url)return await loadImg(d.data[0].url)}
    }catch{}
  }
  return await loadImg(pollImg(prompt))
}

/* ═══ TTS ═══ */
async function generateTTS(text,elevenLabsKey,voiceId="21m00Tcm4TlvDq8ikWAM"){
  if(elevenLabsKey){
    try{
      const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,{method:"POST",headers:{"xi-api-key":elevenLabsKey,"Content-Type":"application/json"},body:JSON.stringify({text,model_id:"eleven_monolingual_v1",voice_settings:{stability:.5,similarity_boost:.75}})})
      if(r.ok)return URL.createObjectURL(await r.blob())
    }catch{}
  }
  try{
    const r=await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text.slice(0,300))}`)
    if(r.ok)return URL.createObjectURL(await r.blob())
  }catch{}
  return null
}

/* ═══ HEYGEN ═══ */
async function generateHeyGenVideo(script,heygenKey){
  const r=await fetch("https://api.heygen.com/v2/video/generate",{method:"POST",headers:{"X-Api-Key":heygenKey,"Content-Type":"application/json"},body:JSON.stringify({video_inputs:[{character:{type:"avatar",avatar_id:"josh_lite3_20230714"},voice:{type:"text",input_text:script,voice_id:"1bd001e7e50f421d891986aad5c9060"},background:{type:"color",value:"#000000"}}],dimension:{width:1080,height:1920}})})
  if(!r.ok)throw new Error("HeyGen lỗi "+r.status)
  const d=await r.json();const videoId=d.data?.video_id
  if(!videoId)throw new Error("HeyGen không trả video ID")
  for(let i=0;i<24;i++){
    await new Promise(r=>setTimeout(r,5000))
    const s=await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,{headers:{"X-Api-Key":heygenKey}})
    if(s.ok){const sd=await s.json();if(sd.data?.status==="completed")return sd.data.video_url;if(sd.data?.status==="failed")throw new Error("HeyGen render failed")}
  }
  throw new Error("HeyGen timeout")
}

/* ═══ REPLICATE ═══ */
async function replicateRun(model,input,key){
  const r=await fetch("https://api.replicate.com/v1/predictions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"wait"},body:JSON.stringify({model,input})})
  if(!r.ok)throw new Error("Replicate: "+r.status)
  let pred=await r.json()
  if(pred.status!=="succeeded"){
    for(let i=0;i<60;i++){
      await new Promise(r=>setTimeout(r,3000))
      const s=await fetch(pred.urls.get,{headers:{"Authorization":"Bearer "+key}})
      pred=await s.json()
      if(pred.status==="succeeded")break
      if(pred.status==="failed")throw new Error("Replicate failed: "+(pred.error||""))
    }
  }
  if(pred.status!=="succeeded")throw new Error("Replicate timeout")
  return pred.output
}
async function fluxImage(prompt,key){
  const output=await replicateRun("black-forest-labs/flux-schnell",{prompt:"Aesthetic TikTok vertical 9:16: "+prompt,num_outputs:1,aspect_ratio:"9:16",output_format:"webp"},key)
  const url=Array.isArray(output)?output[0]:output
  if(!url)throw new Error("Flux no output")
  return await loadImg(url)
}
async function replicateVoice(text,key){
  const output=await replicateRun("lucataco/xtts-v2",{text,language:"en",speaker:"https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQZI8UBIiMQMkFzU16VGR9VqWAHdE7/male.wav"},key)
  const url=typeof output==="string"?output:output?.audio_out
  if(!url)throw new Error("XTTS no output")
  return url
}
async function replicateVideoClip(imageUrl,key){
  const output=await replicateRun("stability-ai/stable-video-diffusion",{input_image:imageUrl,frames_per_second:12,motion_bucket_id:180},key)
  const url=Array.isArray(output)?output[0]:output
  if(!url)throw new Error("SVD no output")
  return url
}
function loadVideo(url){
  return new Promise((res,rej)=>{const v=document.createElement("video");v.crossOrigin="anonymous";v.muted=true;v.playsInline=true;v.onloadeddata=()=>res(v);v.onerror=()=>rej();v.src=url;v.load()})
}

/* ═══ BEAT ═══ */
function generateBeat(audioCtx,duration,bpm=105){
  const sr=audioCtx.sampleRate,len=Math.ceil(sr*duration),buf=audioCtx.createBuffer(2,len,sr)
  const L=buf.getChannelData(0),R=buf.getChannelData(1)
  const bs=Math.floor(60/bpm*sr),es=bs/2
  for(let i=0;i<len;i++){
    const bp=i%bs,ep=i%es,t=bp/sr,et=ep/sr
    if(bp<sr*.08){const env=Math.exp(-t*40);L[i]+=Math.sin(2*Math.PI*(80-t*400)*t)*env*.25;R[i]+=L[i]}
    if(ep<sr*.015){const env=Math.exp(-et*200);const n=(Math.random()*2-1)*env*.08;L[i]+=n;R[i]+=n}
    if(bp<sr*.15&&(Math.floor(i/bs)%2===0)){const env=Math.exp(-t*15);const bass=Math.sin(2*Math.PI*40*t)*env*.15;L[i]+=bass;R[i]+=bass}
    const pe=.03
    L[i]+=Math.sin(2*Math.PI*220*(i/sr))*pe*Math.sin(Math.PI*(i%(bs*4))/(bs*4))
    R[i]+=Math.sin(2*Math.PI*277*(i/sr))*pe*Math.sin(Math.PI*(i%(bs*4))/(bs*4))
  }
  return buf
}

/* ═══ PARTICLES ═══ */
const SCENE_EMOJIS=["✨","💕","🔥","⭐","💫","🎁","💪","😂","❤️","🌟"]
function drawParticles(ctx,W,H,progress,sceneIdx,time){
  const emoji=SCENE_EMOJIS[sceneIdx%SCENE_EMOJIS.length];const count=4
  ctx.font=`${W*.032}px sans-serif`;ctx.textAlign="center"
  for(let i=0;i<count;i++){
    const seed=sceneIdx*100+i*37
    const x=((Math.sin(seed)*.5+.5)*.8+.1)*W
    const baseY=H*.3+(i/count)*H*.5
    const y=baseY-progress*H*.15-Math.sin(time*2+i)*10
    const a=Math.sin(progress*Math.PI)*.35
    if(a>.05){ctx.globalAlpha=a;ctx.fillText(emoji,x+Math.sin(time*3+i*2)*8,y)}
  }
  ctx.globalAlpha=1
}

/* ═══ CANVAS RENDERER ═══ */
function drawScene(ctx,W,H,img,text,sub,progress,transition,fontCSS,textAnim,sceneIdx){
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#06060d";ctx.fillRect(0,0,W,H)
  const flashAlpha=progress<.04?(1-progress/.04)*.6:0
  let alpha=1,offX=0,offY=0,scale=1
  const ease=t=>t<.5?2*t*t:(4-2*t)*t-1  // easeInOut
  const eased=Math.min(1,ease(Math.min(1,progress*2.5)))
  if(transition==="fade")alpha=Math.min(1,progress*4)
  else if(transition==="slideLeft")offX=(1-eased)*W
  else if(transition==="slideUp")offY=(1-eased)*H*.35
  else if(transition==="zoom")scale=.82+eased*.18
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(offX,offY)

  const isVid=img instanceof HTMLVideoElement
  const imgReady=isVid?(img.readyState>=2):(img&&(img.complete||img._safe)&&(img.naturalWidth||img.width)>0)

  if(imgReady){
    const iw=isVid?img.videoWidth:img.naturalWidth,ih=isVid?img.videoHeight:img.naturalHeight
    const v=sceneIdx%8  // 8 distinct cinematic moves
    let sx=0,sy=0,sw=iw,sh=ih,z=1,panX=0,panY=0

    // DRAMATIC Ken Burns — each scene is a distinct "camera shot"
    if(v===0){
      // Slow push-in (classic)
      z=1+progress*.32; panX=Math.sin(progress*Math.PI)*.018*W
    }else if(v===1){
      // Zoom into top-left detail
      z=1.25+progress*.2; sx=0;sy=0;sw=iw*.7;sh=ih*.7
      panX=progress*.02*W; panY=progress*.015*H
    }else if(v===2){
      // Pull-back reveal (dramatic)
      z=1.45-progress*.3
      panX=-Math.sin(progress*Math.PI*.5)*.025*W
    }else if(v===3){
      // Vertical pan up (product reveal)
      sy=ih*.35*(1-progress); sh=ih*.65+ih*.35*progress
      z=1.15+progress*.12; panX=Math.cos(progress*Math.PI*.7)*.02*W
    }else if(v===4){
      // Horizontal sweep left→right
      z=1.2+progress*.18
      panX=(-0.5+progress)*.06*W; panY=Math.sin(progress*Math.PI)*.01*H
    }else if(v===5){
      // Zoom top then drift down
      z=1.3+progress*.1; sy=0; sh=ih*.75
      panY=progress*.04*H; panX=Math.sin(progress*Math.PI*2)*.012*W
    }else if(v===6){
      // Shake/energy feel (quick scenes)
      z=1.1+Math.sin(progress*Math.PI*3)*.05+progress*.15
      panX=Math.sin(progress*Math.PI*4)*.015*W
      panY=Math.cos(progress*Math.PI*3)*.01*H
    }else{
      // Slow diagonal drift
      z=1.15+progress*.22
      panX=(-0.5+progress)*.04*W; panY=(-0.5+progress)*.05*H
    }

    const ratio=Math.max(W/(sw||iw),H/(sh||ih))*z*scale
    const dw=(sw||iw)*ratio,dh=(sh||ih)*ratio
    try{ctx.drawImage(img,sx,sy,sw||iw,sh||ih,(W-dw)/2+panX,(H-dh)/2+panY,dw,dh)}catch{}

    // Cinematic color grade — shifts per scene type
    const gradeAlpha=.18+Math.sin(progress*Math.PI)*.08
    const gradeHue=(sceneIdx*55)%360
    ctx.fillStyle=`hsla(${gradeHue},60%,20%,${gradeAlpha})`
    ctx.fillRect(0,0,W,H)

    // Vignette (always, stronger at edges)
    const vig=ctx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.75)
    vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.55)")
    ctx.fillStyle=vig;ctx.fillRect(0,0,W,H)
  }else{
    // No image — animated gradient placeholder
    const hue=(sceneIdx*45+progress*20)%360
    const fg=ctx.createLinearGradient(0,0,W*(.5+Math.sin(progress*Math.PI)*.5),H)
    fg.addColorStop(0,`hsl(${hue},60%,16%)`);fg.addColorStop(.5,`hsl(${(hue+40)%360},55%,12%)`);fg.addColorStop(1,`hsl(${(hue+90)%360},70%,8%)`)
    ctx.fillStyle=fg;ctx.fillRect(0,0,W,H)
    for(let c=0;c<4;c++){
      const r=W*(.12+c*.06)+Math.sin(progress*Math.PI*2+c)*.04*W
      ctx.beginPath();ctx.arc(W*(.2+c*.2)+Math.sin(progress*3+c)*20,H*(.2+c*.15)+Math.cos(progress*2+c)*15,r,0,Math.PI*2)
      ctx.fillStyle=`hsla(${(hue+c*70)%360},60%,40%,.12)`;ctx.fill()
    }
    // "Generating..." label
    ctx.fillStyle="rgba(255,255,255,.15)";ctx.font=`${W*.04}px sans-serif`;ctx.textAlign="center"
    ctx.fillText("🎨 Generating image...",W/2,H/2)
  }

  // Bottom gradient for text
  const grad=ctx.createLinearGradient(0,H*.3,0,H)
  grad.addColorStop(0,"rgba(0,0,0,0)");grad.addColorStop(.35,"rgba(0,0,0,.6)");grad.addColorStop(1,"rgba(0,0,0,.95)")
  ctx.fillStyle=grad;ctx.fillRect(0,H*.3,W,H*.7)

  // Text
  if(text){
    const tp=Math.min(1,Math.max(0,(progress-.05)*5))
    ctx.font=`bold ${Math.round(W*.052)}px ${fontCSS}`;ctx.textAlign="center"
    const words=text.split(" "),lines=[];let line=""
    for(const w of words){const test=line?line+" "+w:w;if(ctx.measureText(test).width>W*.84&&line){lines.push(line);line=w}else line=test}
    if(line)lines.push(line)
    const lineH=W*.071,baseY=H*.655-(lines.length*lineH)/2
    const drawBgText=(txt,x,y,a)=>{
      ctx.globalAlpha=a
      const tw=ctx.measureText(txt).width,pad=W*.018
      ctx.fillStyle="rgba(0,0,0,.68)"
      ctx.beginPath();ctx.roundRect(x-tw/2-pad*2,y-lineH*.72,tw+pad*4,lineH*1.12,W*.012);ctx.fill()
      ctx.fillStyle="#fff";ctx.shadowColor="rgba(0,0,0,.5)";ctx.shadowBlur=5
      ctx.fillText(txt,x,y);ctx.shadowBlur=0
    }
    if(textAnim==="typewriter"){
      const vc=Math.floor(tp*text.length*1.35);let cc=0
      lines.forEach((l,i)=>{if(cc<vc){const v=l.slice(0,Math.max(0,vc-cc));drawBgText(v,W/2,baseY+i*lineH,1)};cc+=l.length+1})
    }else if(textAnim==="pop"){
      const ps=tp<.5?tp*2*1.12:1+(1-tp)*.12;ctx.save();ctx.translate(W/2,baseY+(lines.length*lineH)/2);ctx.scale(Math.min(ps,1.12),Math.min(ps,1.12));ctx.translate(-W/2,-(baseY+(lines.length*lineH)/2));lines.forEach((l,i)=>drawBgText(l,W/2,baseY+i*lineH,tp));ctx.restore()
    }else if(textAnim==="slideUp"){
      const so=(1-tp)*H*.11;lines.forEach((l,i)=>drawBgText(l,W/2,baseY+i*lineH+so,tp))
    }else if(textAnim==="wave"){
      let wi=0;const tw=text.split(" ").length
      lines.forEach((l,i)=>{const lw=l.split(" ");let x=W/2-ctx.measureText(l).width/2;lw.forEach(w=>{const wp=Math.max(0,Math.min(1,(tp*tw-wi)*2));drawBgText(w,x+ctx.measureText(w).width/2,baseY+i*lineH+(1-wp)*14,wp);x+=ctx.measureText(w+" ").width;wi++})})
    }else{lines.forEach((l,i)=>drawBgText(l,W/2,baseY+i*lineH,tp))}
  }

  // Subtext
  if(sub){
    const sp=Math.min(1,Math.max(0,(progress-.25)*4));ctx.globalAlpha=sp
    ctx.fillStyle=T.acT;ctx.font=`600 ${Math.round(W*.029)}px ${fontCSS}`;ctx.fillText(sub,W/2,H*.875)
  }
  ctx.restore()
  drawParticles(ctx,W,H,progress,sceneIdx,sceneIdx+progress*3)
  if(flashAlpha>0){ctx.fillStyle=`rgba(255,255,255,${flashAlpha})`;ctx.fillRect(0,0,W,H)}
}

/* ═══ SORTABLE SCENE ═══ */
function SortableScene({scene,index,total,sceneImg,uploadedImgs,onUpdate,onRemove,onRegen,onPreview,onSelectImg}){
  const{attributes,listeners,setNodeRef,transform,transition:dndT,isDragging}=useSortable({id:scene._id})
  const style={transform:CSS.Transform.toString(transform),transition:dndT,opacity:isDragging?0.45:1,padding:10,borderRadius:12,background:T.sf,border:`1px solid ${isDragging?T.ac:T.bdr}`,marginBottom:8,cursor:"pointer"}
  const isH=index===0,isC=index===total-1
  const tc=isH?T.or:isC?T.gn:T.bl,tb=isH?T.orS:isC?T.gnS:T.blS,tl=isH?"HOOK":isC?"CTA":"BODY"
  const thumb=sceneImg?.src||uploadedImgs[scene.image_index]?.url
  const curFont=FONTS.find(f=>f.id===scene.font)||FONTS[0]
  return(
    <div ref={setNodeRef} style={style} {...attributes} onClick={()=>onPreview(index)}>
      <div style={{display:"flex",gap:10}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div {...listeners} style={{cursor:"grab",fontSize:14,padding:"2px 4px",borderRadius:4,background:T.card,color:T.txD,userSelect:"none"}}>⠿</div>
          <div style={{width:50,height:50,borderRadius:8,overflow:"hidden",background:T.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {thumb?<img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:sceneImg===null?<span style={{animation:"spin 1s linear infinite",fontSize:13}}>⏳</span>:<span style={{fontSize:18}}>🖼</span>}
          </div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{padding:"2px 8px",borderRadius:6,background:tb,color:tc,fontSize:10,fontWeight:700}}>{tl}</span>
              <span style={{fontSize:11,color:T.txD}}>{scene.duration}s</span>
            </div>
            <div style={{display:"flex",gap:3}}>
              <button onClick={e=>{e.stopPropagation();onRegen(index)}} style={{width:27,height:27,borderRadius:6,border:`1px solid ${T.ac}40`,background:T.acS,color:T.acT,fontSize:12}}>🎨</button>
              <button onClick={e=>{e.stopPropagation();onRemove(index)}} style={{width:27,height:27,borderRadius:6,border:`1px solid ${T.rd}40`,background:T.rdS,color:T.rdT,fontSize:12}}>×</button>
            </div>
          </div>
          <input value={scene.text} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"text",e.target.value)} placeholder="Text overlay..."
            style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:curFont.css}}/>
          <div style={{display:"flex",gap:5,marginTop:5}}>
            <input value={scene.subtext||""} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"subtext",e.target.value)} placeholder="Subtext..." style={{flex:1,padding:"5px 8px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12,outline:"none"}}/>
            <input type="number" min={1} max={12} value={scene.duration} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"duration",Number(e.target.value)||3)} style={{width:42,padding:"5px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",textAlign:"center"}}/>
            <select value={scene.transition} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"transition",e.target.value)} style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:11,outline:"none"}}>
              {TRANS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select value={scene.font||"dm"} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"font",e.target.value)} style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:11,outline:"none"}}>
              {FONTS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={scene.textAnim||"typewriter"} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"textAnim",e.target.value)} style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.ac}30`,background:T.acS,color:T.acT,fontSize:11,outline:"none"}}>
              {TEXT_ANIMS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {uploadedImgs.length>0&&(
            <div style={{display:"flex",gap:4,marginTop:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:T.txD,flexShrink:0}}>Ảnh:</span>
              {uploadedImgs.map((im,ii)=>(
                <div key={ii} onClick={e=>{e.stopPropagation();onSelectImg(index,ii)}} style={{width:26,height:26,borderRadius:5,overflow:"hidden",border:scene.image_index===ii&&!sceneImg?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,cursor:"pointer",opacity:scene.image_index===ii&&!sceneImg?1:.45}}>
                  <img src={im.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              ))}
            </div>
          )}
          {scene.voice&&<div style={{marginTop:4,padding:"3px 8px",borderRadius:5,background:T.card,fontSize:10,color:T.txD,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>🎙 {scene.voice}</div>}
        </div>
      </div>
    </div>
  )
}

/* ═══ TOAST ═══ */
function Toast({msg,type}){
  if(!msg)return null
  const bg=type==="ok"?T.gn:type==="err"?T.rd:type==="warn"?T.or:T.ac
  return<div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",padding:"10px 22px",borderRadius:24,background:bg,color:"#fff",fontSize:13,fontWeight:600,zIndex:9999,maxWidth:"88vw",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>{msg}</div>
}

/* ═══ OFFLINE BANNER ═══ */
function OfflineBanner(){
  const[offline,setOffline]=useState(!navigator.onLine)
  useEffect(()=>{const on=()=>setOffline(false);const off=()=>setOffline(true);window.addEventListener("online",on);window.addEventListener("offline",off);return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off)}},[])
  if(!offline)return null
  return<div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 16px",background:T.rd,color:"#fff",fontSize:13,fontWeight:600,textAlign:"center",zIndex:999}}>⚠️ Mất kết nối — AI sẽ không hoạt động cho đến khi có mạng</div>
}

/* ═══ MAIN ═══ */
export default function App(){
  const[step,setStep]=useState(()=>localStorage.getItem("pod-v")?"1":"0")
  const[showSettings,setShowSettings]=useState(false)
  const[prov,setProv]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.p||"auto"}catch{return"auto"}})
  const[apiKey,setApiKey]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.k||""}catch{return""}})
  const[elKey,setElKey]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.el||""}catch{return""}})
  const[dalleKey,setDalleKey]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.dalle||""}catch{return""}})
  const[heygenKey,setHeygenKey]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.heygen||""}catch{return""}})
  const[replicateKey,setReplicateKey]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.rep||""}catch{return""}})
  const[voiceId,setVoiceId]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-c"))?.vid||"21m00Tcm4TlvDq8ikWAM"}catch{return"21m00Tcm4TlvDq8ikWAM"}})
  const[images,setImages]=useState([])
  const[ideaText,setIdeaText]=useState("")
  const[productName,setProductName]=useState("")
  const[productNiche,setProductNiche]=useState("")
  const[productQuote,setProductQuote]=useState("")
  const[videoDuration,setVideoDuration]=useState(15)
  const[loading,setLoading]=useState(false)
  const[loadMsg,setLoadMsg]=useState("")
  const[toast,setToast]=useState({m:"",t:""})
  const[ideas,setIdeas]=useState(null)
  const[scenes,setScenes]=useState([])
  const[sceneImgs,setSceneImgs]=useState({})
  const[isPlaying,setIsPlaying]=useState(false)
  const[currentTime,setCurrentTime]=useState(0)
  const[isRecording,setIsRecording]=useState(false)
  const[videoBlob,setVideoBlob]=useState(null)
  const[extData,setExtData]=useState(null)
  const[autoGenning,setAutoGenning]=useState(false)
  const[undoStack,setUndoStack]=useState([])
  const[audioUrl,setAudioUrl]=useState(null)
  const[voiceUrl,setVoiceUrl]=useState(null)
  const[voiceGenning,setVoiceGenning]=useState(false)
  const[proRendering,setProRendering]=useState(false)
  const[heygenUrl,setHeygenUrl]=useState(null)
  const[heygenLoading,setHeygenLoading]=useState(false)
  const[showAdvanced,setShowAdvanced]=useState(false)
  const[templates,setTemplates]=useState(()=>{try{return JSON.parse(localStorage.getItem("pod-tpl"))||[]}catch{return[]}})
  const[showTpl,setShowTpl]=useState(false)
  const[converting,setConverting]=useState(false)
  const[mp4Blob,setMp4Blob]=useState(null)
  const[refineText,setRefineText]=useState("")
  const[lang,setLang]=useState(()=>localStorage.getItem("pod-lang")||"vi")
  const[sceneVideos,setSceneVideos]=useState({})
  const[htmlSrc,setHtmlSrc]=useState("")
  const[productInfo,setProductInfo]=useState("")

  const canvasRef=useRef();const animRef=useRef();const startTimeRef=useRef(0);const recChunksRef=useRef([]);const audioRef=useRef();const voiceRef=useRef()
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}))

  const notify=(m,t="info")=>{setToast({m,t});setTimeout(()=>setToast({m:"",t:""}),2800)}
  const copy=t=>{navigator.clipboard.writeText(t);notify("Đã copy!","ok")}
  const copyOpen=(p,u)=>{navigator.clipboard.writeText(p);window.open(u,"_blank");notify("Prompt đã copy → Ctrl+V","ok")}
  const saveSettings=()=>{localStorage.setItem("pod-c",JSON.stringify({p:prov,k:apiKey,el:elKey,dalle:dalleKey,heygen:heygenKey,rep:replicateKey,vid:voiceId}));setShowSettings(false);notify("Đã lưu!","ok")}

  // Templates
  const saveTemplate=idea=>{
    const tpl={id:Date.now(),title:idea.title,format:idea.format,scenes:idea.scenes?.map(s=>({text:s.text,subtext:s.subtext,duration:s.duration,transition:s.transition,font:s.font||"dm",ai_bg:s.ai_bg})),created:new Date().toLocaleDateString("vi")}
    const updated=[tpl,...templates].slice(0,20);setTemplates(updated);localStorage.setItem("pod-tpl",JSON.stringify(updated));notify("⭐ Đã lưu template!","ok")
  }
  const deleteTemplate=id=>{const u=templates.filter(t=>t.id!==id);setTemplates(u);localStorage.setItem("pod-tpl",JSON.stringify(u))}
  const applyTemplate=tpl=>{let idC=0;const built=tpl.scenes.map(s=>({_id:"sc-"+(idC++),image_index:0,...s}));setScenes(built);setStep("3");setShowTpl(false);notify("Đã áp dụng template!","ok")}

  // FIX: Upload images safely for canvas
  const handleUpload=async e=>{
    const files=Array.from(e.target.files)
    for(const f of files){
      try{
        const result=await loadUploadedImg(f)
        setImages(p=>[...p,result])
      }catch{
        // Fallback: simple url
        const url=URL.createObjectURL(f)
        const img=new Image()
        img.onload=()=>setImages(p=>[...p,{url,img}])
        img.src=url
      }
    }
  }
  const handleAudio=e=>{const f=e.target.files?.[0];if(f){setAudioUrl(URL.createObjectURL(f));notify("Đã thêm nhạc nền!","ok")}}

  // ── Parse HTML: extract product info + images ──
  const parseHTML=async()=>{
    if(!htmlSrc.trim()){notify("Paste HTML trước","warn");return}
    setLoading(true);setLoadMsg("Đang trích xuất ảnh + thông tin SP...")
    try{
      // 1. Extract image URLs from HTML (multiple strategies)
      const foundUrls=new Set()

      // JSON-LD schema (Etsy, Amazon, Shopify standard)
      const ldMatches=[...htmlSrc.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      for(const m of ldMatches){
        try{
          const d=JSON.parse(m[1])
          const items=Array.isArray(d)?d:[d]
          for(const item of items){
            const imgs=item.image||item.logo||[]
            ;(Array.isArray(imgs)?imgs:[imgs]).forEach(img=>{
              const u=typeof img==="string"?img:img?.contentURL||img?.url||img?.thumbnail
              if(u&&u.match(/\.(jpg|jpeg|png|webp)/i))foundUrls.add(u)
            })
          }
        }catch{}
      }

      // og:image meta tags
      ;[...htmlSrc.matchAll(/og:image[^>]*content="([^"]+)"/gi)].forEach(m=>m[1]&&foundUrls.add(m[1]))
      ;[...htmlSrc.matchAll(/content="(https?:\/\/[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/gi)].forEach(m=>m[1]&&foundUrls.add(m[1]))

      // img tags: src, data-src, data-lazy-src, srcset (first url)
      ;[...htmlSrc.matchAll(/<img[^>]+>/gi)].forEach(m=>{
        const tag=m[0]
        // Pull all URL-like attrs
        ;[...tag.matchAll(/(?:src|data-src|data-lazy-src|data-original)="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi)]
          .forEach(a=>foundUrls.add(a[1].split('?')[0]))
        // srcset
        const srcset=tag.match(/srcset="([^"]+)"/i)
        if(srcset){srcset[1].split(",").forEach(s=>{const u=s.trim().split(" ")[0];if(u.match(/\.(jpg|jpeg|png|webp)/i))foundUrls.add(u)})}
      })

      // Etsy-specific: etsystatic.com pattern
      ;[...htmlSrc.matchAll(/https:\/\/i\.etsystatic\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi)].forEach(m=>foundUrls.add(m[0].replace(/\\u002F/g,'/')))

      // Amazon-specific
      ;[...htmlSrc.matchAll(/https:\/\/m\.media-amazon\.com\/images\/[^\s"'<>]+\.(?:jpg|jpeg|png)/gi)].forEach(m=>foundUrls.add(m[0]))

      // Filter: remove tiny icons/logos (usually <100px in URL hints), keep product images
      const productUrls=[...foundUrls].filter(u=>{
        if(u.match(/logo|icon|avatar|sprite|pixel|banner|badge|rating|star/i))return false
        if(u.match(/75x75|32x32|16x16|favicon/i))return false
        return true
      }).slice(0,12) // max 12 images

      // 2. Extract text info from HTML
      let name="",niche="",social=""
      // title tag
      const titleM=htmlSrc.match(/<title[^>]*>([^<]+)<\/title>/i)
      if(titleM){name=titleM[1].replace(/\s*[-|].*$/,"").trim().replace(/&amp;/g,"&").replace(/&#039;/g,"'")}
      // og:title
      const ogTitle=htmlSrc.match(/og:title[^>]*content="([^"]+)"/i)||htmlSrc.match(/content="([^"]+)"[^>]*og:title/i)
      if(ogTitle&&!name)name=ogTitle[1]
      // rating
      const ratingM=htmlSrc.match(/(\d+(?:\.\d+)?)\s*(?:stars?|★|out of 5)/i)||htmlSrc.match(/itemprop="ratingValue"[^>]*>(\d[\d.]*)/i)
      const reviewM=htmlSrc.match(/(\d[\d,]+)\s*(?:reviews?|ratings?|sold)/i)
      if(ratingM)social+=ratingM[1]+"★"
      if(reviewM)social+=(social?" · ":"")+reviewM[1].replace(/,/g,"")+" reviews"
      const saleM=htmlSrc.match(/(\d+)%\s*off/i)
      if(saleM)social+=(social?" · ":"")+saleM[1]+"% off"
      const soldM=htmlSrc.match(/(\d+)\s*(?:people\s+)?(?:bought|sold)\s*(?:this\s+)?(?:in\s+)?(?:last\s+)?24/i)
      if(soldM)social+=(social?" · ":"")+soldM[1]+" bought 24h"
      // niche from title/desc
      const fullText=(name+" "+htmlSrc.slice(0,3000)).toLowerCase()
      const niches=[]
      const nicheMap={nurse:"nurse",nursing:"nurse",doctor:"healthcare",teacher:"teacher",mom:"mom",dad:"dad",cat:"cat lover",dog:"dog mom","frog":"frog lover",witch:"witchy",cottage:"cottagecore",vintage:"vintage",gym:"gym",fitness:"fitness",gamer:"gamer",book:"book lover",coffee:"coffee lover",anxiety:"anxiety humor",introvert:"introvert"}
      Object.entries(nicheMap).forEach(([k,v])=>{if(fullText.includes(k)&&!niches.includes(v))niches.push(v)})
      niche=niches.slice(0,4).join(", ")

      // 3. Load images
      if(productUrls.length>0){
        notify(`🔍 Tìm thấy ${productUrls.length} ảnh — đang tải...`,"info")
        let loaded=0
        await Promise.allSettled(productUrls.slice(0,8).map(async url=>{
          try{
            const result=await loadUploadedImgFromUrl(url)
            setImages(p=>[...p,result])
            loaded++
          }catch{}
        }))
        notify(loaded>0?`📸 Đã tải ${loaded} ảnh sản phẩm!`:"⚠️ Không tải được ảnh (CORS) — thử upload thủ công","ok")
      }else{
        notify("Không tìm thấy ảnh trong HTML — thử upload thủ công","warn")
      }

      // 4. Fill product info
      if(name&&!productName)setProductName(name)
      if(niche&&!productNiche)setProductNiche(niche)
      if(social)setProductInfo(social)
      setHtmlSrc("")
    }catch(e){notify("Lỗi parse: "+e.message,"err")}
    setLoading(false)
  }

  // Helper: load image from URL into canvas-safe format
  const loadUploadedImgFromUrl=async url=>{
    // Try loading directly
    const img=await loadImg(url)
    // Convert to canvas-safe via offscreen canvas
    const oc=document.createElement("canvas")
    oc.width=Math.min(img.naturalWidth,1080);oc.height=Math.min(img.naturalHeight,1920)
    oc.getContext("2d").drawImage(img,0,0,oc.width,oc.height)
    const blob=await new Promise(r=>oc.toBlob(r,"image/jpeg",.92))
    const url2=URL.createObjectURL(blob)
    const img2=new Image();img2.src=url2
    await new Promise(r=>{img2.onload=r})
    return{url:url2,img:img2}
  }

  // ── Vision analysis: AI reads uploaded images ──
  const [visionLoading,setVisionLoading]=useState(false)
  const analyzeWithVision=async()=>{
    if(!images.length){notify("Upload ảnh trước!","warn");return}
    setVisionLoading(true)
    try{
      const imgs=images.slice(0,4)
      // Convert to base64
      const base64Imgs=await Promise.all(imgs.map(async im=>{
        const canvas=document.createElement("canvas")
        const img=im.img
        canvas.width=Math.min(img.naturalWidth||img.width,800)
        canvas.height=Math.min(img.naturalHeight||img.height,1400)
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height)
        const data=canvas.toDataURL("image/jpeg",.85)
        return{type:"image",source:{type:"base64",media_type:"image/jpeg",data:data.split(",")[1]}}
      }))
      const textContent={type:"text",text:`Analyze these POD (Print-on-Demand) apparel product images. Return ONLY valid JSON (no markdown):
{
  "product_name": "concise English product name for ecommerce listing",
  "design_description": "detailed description of the graphic: art style, colors, composition, elements",
  "quote_on_design": "exact text/slogan/quote printed on the design — empty string if none",
  "niche": "3-5 US TikTok niche keywords comma-separated (e.g. cottagecore, frog lover, aesthetic)",
  "shirt_colors": "apparel color options visible in the images",
  "vibe": "5-word aesthetic vibe for TikTok",
  "tiktok_hook": "best 8-word scroll-stopping TikTok hook for this product"
}`}
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:[...base64Imgs,textContent]}]})
      })
      if(!r.ok)throw new Error("Vision API lỗi "+r.status)
      const d=await r.json()
      const raw=d.content?.map(c=>c.text||"").join("")||""
      const result=JSON.parse(raw.replace(/```json|```/g,"").trim())
      if(result.product_name)setProductName(result.product_name)
      if(result.niche)setProductNiche(result.niche)
      if(result.quote_on_design)setProductQuote(result.quote_on_design)
      if(result.design_description||result.vibe)setIdeaText((result.design_description||"")+(result.tiktok_hook?"\nHook: "+result.tiktok_hook:""))
      if(result.shirt_colors)setProductInfo("Colors: "+result.shirt_colors+(result.vibe?"\nVibe: "+result.vibe:""))
      notify("✅ AI đọc xong design — kiểm tra thông tin bên dưới!","ok")
    }catch(e){notify("Vision lỗi: "+e.message+" — nhập tay thay thế","err")}
    setVisionLoading(false)
  }

  // MP4 convert
  const convertToMP4=()=>{
    // ffmpeg.wasm unreliable in production (COEP/COOP headers, 100MB load)
    // Better UX: guide seller to CapCut which is free and what they already use
    notify("Mở CapCut → Import video → Export MP4 (nhanh hơn & miễn phí 🎬)","ok")
    window.open("https://www.capcut.com","_blank")
  }
  const downloadMP4=()=>{if(!mp4Blob)return;const u=URL.createObjectURL(mp4Blob);const a=document.createElement("a");a.href=u;a.download=`pod-${Date.now()}.mp4`;a.click();URL.revokeObjectURL(u)}

  const toggleLang=()=>{const nl=lang==="vi"?"en":"vi";setLang(nl);localStorage.setItem("pod-lang",nl)}

  // ── Replicate Pro Pipeline: gen video clips per scene ──
  const runProPipeline=async()=>{
    if(!replicateKey){notify("Nhập Replicate token trong ⚙️ Settings","warn");return}
    if(!scenes.length)return
    setProRendering(true)
    notify("🚀 Pro Pipeline: gen video clips + XTTS voice (1-3 phút)...","info")
    try{
      for(let i=0;i<scenes.length;i++){
        const img=sceneImgs[i]
        if(img?.src){
          try{
            notify(`🎬 Scene ${i+1}/${scenes.length}: gen video clip...`,"info")
            const videoUrl=await replicateVideoClip(img.src,replicateKey)
            const videoEl=await loadVideo(videoUrl)
            setSceneVideos(p=>({...p,[i]:videoEl}))
          }catch{}
        }
      }
      if(!voiceUrl){
        const script=extData?.fullVoice||scenes.map(s=>s.voice).filter(Boolean).join(". ")
        if(script){
          try{notify("🎙 Gen XTTS voice...","info");const u=await replicateVoice(script,replicateKey);if(u)setVoiceUrl(u)}catch{}
        }
      }
      notify("🚀 Pro Pipeline xong! Bấm Render.","ok")
    }catch(e){notify("Pipeline lỗi: "+e.message,"err")}
    setProRendering(false)
  }

  // ── HeyGen AI Avatar ──
  const genHeyGenVideo=async()=>{
    if(!heygenKey){notify("Nhập HeyGen API key trong ⚙️ Settings","warn");return}
    const script=extData?.fullVoice||scenes.map(s=>s.voice).filter(Boolean).join(". ")
    if(!script){notify("Không có voiceover script","warn");return}
    setHeygenLoading(true);setHeygenUrl(null)
    try{
      const r=await fetch("https://api.heygen.com/v2/video/generate",{method:"POST",headers:{"X-Api-Key":heygenKey,"Content-Type":"application/json"},body:JSON.stringify({video_inputs:[{character:{type:"avatar",avatar_id:"josh_lite3_20230714"},voice:{type:"text",input_text:script,voice_id:"1bd001e7e50f421d891986aad5c9060"},background:{type:"color",value:"#000000"}}],dimension:{width:1080,height:1920}})})
      if(!r.ok)throw new Error("HeyGen "+r.status)
      const d=await r.json();const videoId=d.data?.video_id
      if(!videoId)throw new Error("HeyGen no video ID")
      for(let i=0;i<24;i++){
        await new Promise(r=>setTimeout(r,5000))
        const s=await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,{headers:{"X-Api-Key":heygenKey}})
        if(s.ok){const sd=await s.json();if(sd.data?.status==="completed"){setHeygenUrl(sd.data.video_url);notify("🎭 AI Avatar video sẵn sàng!","ok");break};if(sd.data?.status==="failed")throw new Error("HeyGen render failed")}
      }
    }catch(e){notify("HeyGen: "+e.message,"err")}
    setHeygenLoading(false)
  }

  // ── IMPROVED AI PROMPT ──
  const genIdeas=async()=>{
    if(!images.length&&!productName&&!ideaText){notify("Nhập tên SP hoặc upload ảnh","warn");return}
    setLoading(true);setLoadMsg("AI đang tạo 4 ý tưởng video...")
    try{
      const prodName=productName||ideaText||"POD product"
      const hasImgs=images.length>0
      const sceneCount=videoDuration<=15?"4":videoDuration<=30?"6":videoDuration<=60?"9":"14"

      const imgInstructions=hasImgs
        ? `Seller has ${images.length} real product photos already uploaded. Set ai_bg to "" (empty) for all scenes.`
        : `No photos uploaded. For EACH scene, generate a UNIQUE ai_bg that describes a DIFFERENT camera angle of the product:
          Scene 1 (HOOK): dramatic close-up of the most eye-catching design detail
          Scene 2: flat lay / lifestyle context showing product in use  
          Scene 3: another angle or zoom — focus on text/quote if any
          Scene 4+: mix of lifestyle, detail shots, context shots
          ai_bg must always include: "${prodName}", vertical 9:16, aesthetic TikTok style, specific shot description`

      const prompt=`You are a TikTok viral expert for POD (Print-on-Demand) products, targeting US buyers.

PRODUCT: "${prodName}"
NICHE/AUDIENCE: "${productNiche||"general US buyers"}"
${productQuote?`DESIGN QUOTE ON PRODUCT: "${productQuote}" — build the entire story around this quote!`:""}
${imgInstructions}
VIDEO DURATION: ${videoDuration}s
SCENES NEEDED: ${sceneCount}

Generate 4 DIFFERENT video concepts. Rules:

TEXT OVERLAYS (8 words max, very specific):
- Hook: relatable pain/emotion, e.g. "When your coworker asks why you're so calm 😭" 
- Body: specific features, social proof, humor
- CTA: urgency, e.g. "Link in bio 👆 Ships in 3 days!"
- NEVER: "Amazing product", "New drop", "Check this out"

VOICEOVER: casual TikTok, NOT ad-speak. Name the product. Tell a micro-story.

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Vietnamese title",
      "format": "Humor|Gift Idea|Relatable Story|Before-After|Trend|Review",
      "description": "Vietnamese 2 sentences",
      "viral_score": 8,
      "why": "Vietnamese reason",
      "hook_emotion": "emotion/pain point tapped",
      "scenes": [
        {
          "duration": 3,
          "image_index": 0,
          "text": "ENGLISH overlay — max 8 words, specific to ${prodName}",
          "subtext": "short ENGLISH subtext",
          "transition": "fade",
          "font": "dm",
          "textAnim": "typewriter",
          "voice": "ENGLISH voiceover — casual, specific to ${prodName}",
          "ai_bg": "UNIQUE image description for this scene — see instructions above"
        }
      ],
      "total_duration": ${videoDuration},
      "caption": "ENGLISH TikTok caption <120 chars with emoji",
      "hashtags": ["niche","specific","tags"],
      "sound": "Specific TikTok sound name",
      "full_voiceover": "Complete ENGLISH script — casual ${videoDuration}s, specific to ${prodName}${productQuote?`, featuring: "${productQuote}"`:""}",
      "invideo_prompt": "InVideo AI detailed prompt",
      "kling_prompt": "Kling AI prompt"
    }
  ]
}`
      const d=await aiJSON(prov,apiKey,prompt)
      if(!d?.ideas?.length)throw new Error("AI không gen được — thử lại")
      setIdeas(d);setStep("2")
    }catch(e){notify(e.message,"err")}
    setLoading(false)
  }

  const selectIdea=async idx=>{
    const idea=ideas.ideas[idx];if(!idea?.scenes)return;let idC=0
    const built=idea.scenes.map((s,si)=>({
      _id:"sc-"+(idC++),duration:s.duration||3,
      image_index:images.length>0?(si%images.length):0,
      text:s.text||"",subtext:s.subtext||"",transition:s.transition||"fade",
      ai_bg:s.ai_bg||"",font:FONTS.find(f=>f.id===s.font)?s.font:"dm",
      textAnim:TEXT_ANIMS.includes(s.textAnim)?s.textAnim:"typewriter",voice:s.voice||""
    }))
    setScenes(built);setExtData({inv:idea.invideo_prompt,kl:idea.kling_prompt,cap:idea.caption,ht:idea.hashtags,snd:idea.sound,title:idea.title,format:idea.format,rawIdea:idea,fullVoice:idea.full_voiceover||""});setVideoBlob(null);setMp4Blob(null);setSceneImgs({});setSceneVideos({});setUndoStack([]);setVoiceUrl(null);setHeygenUrl(null);setStep("3")

    // Only gen AI images if NO uploaded images
    if(images.length===0){
      setAutoGenning(true)
      // Parallel generation for speed
      const genPromises=built.map(async(sc,i)=>{
        if(sc.ai_bg&&sc.ai_bg.length>5){
          try{
            const img=await generateImage(sc.ai_bg,dalleKey,replicateKey)
            setSceneImgs(p=>({...p,[i]:img}))
          }catch(e){
            // Fallback with generic prompt
            try{
              const fallback=`${productName||"product"} on aesthetic minimalist background, vertical 9:16`
              const img2=await loadImg(pollImg(fallback))
              setSceneImgs(p=>({...p,[i]:img2}))
            }catch{}
          }
        }
      })
      await Promise.allSettled(genPromises)
      setAutoGenning(false)
      notify("🎨 Ảnh AI gen xong! Upload ảnh SP thật để video chân thực hơn","ok")
    }else{
      setTimeout(()=>renderFrame(0),300)
      notify(`📸 Dùng ${images.length} ảnh SP thật của bạn`,"ok")
    }

    // Voiceover
    const fullScript=idea.full_voiceover||built.map(s=>s.voice).filter(Boolean).join(". ")
    if(fullScript){
      setVoiceGenning(true)
      const url=await generateTTS(fullScript,elKey,voiceId)
      if(url){setVoiceUrl(url);notify("🎙 Voiceover sẵn sàng!","ok")}
      else notify("⚠️ Voiceover lỗi — thêm ElevenLabs key để có giọng đọc đẹp hơn","warn")
      setVoiceGenning(false)
    }
  }

  // Scene ops
  const updateScene=(i,k,v)=>setScenes(p=>p.map((s,j)=>j===i?{...s,[k]:v}:s))
  const removeScene=i=>{setUndoStack(p=>[...p,{type:"rm",scene:scenes[i],index:i}]);setScenes(p=>p.filter((_,j)=>j!==i));notify("Đã xoá. Undo để khôi phục.","warn")}
  const undo=()=>{if(!undoStack.length)return;const last=undoStack[undoStack.length-1];setUndoStack(p=>p.slice(0,-1));if(last.type==="rm"){setScenes(p=>{const a=[...p];a.splice(last.index,0,last.scene);return a});notify("Đã undo!","ok")}}
  const addScene=()=>setScenes(p=>[...p,{_id:"sc-"+Date.now(),duration:3,image_index:0,text:"",subtext:"",transition:"fade",ai_bg:"",font:"dm",textAnim:"typewriter",voice:""}])
  const regenSceneImg=async i=>{const sc=scenes[i];if(!sc?.ai_bg)return;setSceneImgs(p=>({...p,[i]:null}));try{const img=await loadImg(pollImg(sc.ai_bg));setSceneImgs(p=>({...p,[i]:img}));notify("Gen lại OK","ok")}catch{notify("Lỗi gen ảnh","err")}}
  const selectSceneImg=(si,ii)=>{updateScene(si,"image_index",ii);setSceneImgs(p=>{const n={...p};delete n[si];return n})}
  const handleDragEnd=e=>{const{active,over}=e;if(active.id!==over?.id){setScenes(p=>{const oi=p.findIndex(s=>s._id===active.id);const ni=p.findIndex(s=>s._id===over.id);return arrayMove(p,oi,ni)})}}

  const totalDuration=scenes.reduce((s,x)=>s+(x.duration||3),0)

  // FIX: getSceneImage — prioritize uploaded images, clear sceneImgs when user manually selects
  const getSceneImage=(sc,i)=>{
    // Priority: 1) Replicate video clip 2) AI-gen image 3) Uploaded image
    const vid=sceneVideos[i]
    if(vid){if(vid.paused)vid.play().catch(()=>{});return vid}
    const aiImg=sceneImgs[i]
    if(aiImg)return aiImg
    const uploaded=images[sc.image_index]
    if(uploaded?.img)return uploaded.img
    return null
  }

  const getSceneAt=t=>{let a=0;for(let i=0;i<scenes.length;i++){const d=scenes[i].duration||3;if(t<a+d)return{idx:i,progress:(t-a)/d};a+=d};return{idx:scenes.length-1,progress:1}}

  const renderFrame=useCallback((t,forRec=false)=>{
    const cv=canvasRef.current;if(!cv||!scenes.length)return
    const ctx=cv.getContext("2d"),W=cv.width,H=cv.height
    const{idx,progress}=getSceneAt(t);const sc=scenes[idx];if(!sc)return
    const fontCSS=(FONTS.find(f=>f.id===sc.font)||FONTS[0]).css
    const img=getSceneImage(sc,idx)
    drawScene(ctx,W,H,img,sc.text,sc.subtext,progress,sc.transition,fontCSS,sc.textAnim||"typewriter",idx)
    if(!forRec){ctx.fillStyle=T.ac;ctx.fillRect(0,H-3,(t/Math.max(totalDuration,.1))*W,3)}
  },[scenes,images,sceneImgs,totalDuration])

  // Ref to always-latest renderFrame for animation loops
  const renderFrameRef=useRef(renderFrame)
  useEffect(()=>{renderFrameRef.current=renderFrame},[renderFrame])

  // FIX: Live idle animation — always animates even when not playing
  const idleAnimRef=useRef()
  useEffect(()=>{
    if(step!=="3"||!scenes.length||isPlaying||isRecording)return
    let start=null
    const loop=(ts)=>{
      if(!start)start=ts
      const t=((ts-start)/1000)%Math.max(totalDuration,.1)
      setCurrentTime(t)
      renderFrameRef.current(t)  // always use latest renderFrame
      idleAnimRef.current=requestAnimationFrame(loop)
    }
    idleAnimRef.current=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(idleAnimRef.current)
  },[step,scenes.length,sceneImgs,images,isPlaying,isRecording,totalDuration])
  useEffect(()=>{if(step==="3"&&scenes.length)setTimeout(()=>renderFrame(0),250)},[step])

  const previewScene=i=>{setIsPlaying(false);cancelAnimationFrame(animRef.current);let t=0;for(let j=0;j<i;j++)t+=scenes[j]?.duration||3;setCurrentTime(t+.3);renderFrame(t+.3)}
  const play=()=>{
    if(!scenes.length)return;setIsPlaying(true)
    if(audioRef.current&&audioUrl){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{})}
    startTimeRef.current=performance.now()-currentTime*1000
    const loop=n=>{const e=(n-startTimeRef.current)/1000;if(e>=totalDuration){setIsPlaying(false);setCurrentTime(0);renderFrame(0);if(audioRef.current)audioRef.current.pause();return};setCurrentTime(e);renderFrame(e);animRef.current=requestAnimationFrame(loop)};animRef.current=requestAnimationFrame(loop)
  }
  const pause=()=>{setIsPlaying(false);cancelAnimationFrame(animRef.current);if(audioRef.current)audioRef.current.pause()}

  // Record — FIX canvas capture with proper audio mixing
  const recordVideo=async()=>{
    if(isRecording||!scenes.length)return;const cv=canvasRef.current;if(!cv)return
    setIsRecording(true);setVideoBlob(null);setMp4Blob(null);recChunksRef.current=[]
    const cs=cv.captureStream(30)
    const ac=new AudioContext();const dest=ac.createMediaStreamDestination()
    try{
      const bb=generateBeat(ac,totalDuration+2);const bs=ac.createBufferSource();bs.buffer=bb;bs.loop=true
      const bg=ac.createGain();bg.gain.value=(audioUrl||voiceUrl)?0.1:0.22;bs.connect(bg);bg.connect(dest);bs.start()
    }catch{}
    if(audioUrl){try{const a=new Audio(audioUrl);a.crossOrigin="anonymous";a.loop=true;const src=ac.createMediaElementSource(a);const g=ac.createGain();g.gain.value=.28;src.connect(g);g.connect(dest);a.play().catch(()=>{})}catch{}}
    // FIX: voice — fetch as ArrayBuffer to avoid MediaElementSource conflict with <audio> ref
    if(voiceUrl){
      try{
        const resp=await fetch(voiceUrl)
        const buf=await resp.arrayBuffer()
        const decoded=await ac.decodeAudioData(buf)
        const vSrc=ac.createBufferSource();vSrc.buffer=decoded
        const vGain=ac.createGain();vGain.gain.value=.95
        vSrc.connect(vGain);vGain.connect(dest);vSrc.start()
      }catch{
        // fallback: MediaElementSource
        try{const v=new Audio(voiceUrl);v.crossOrigin="anonymous";const s2=ac.createMediaElementSource(v);const g2=ac.createGain();g2.gain.value=.95;s2.connect(g2);g2.connect(dest);v.play().catch(()=>{})}catch{}
      }
    }
    const fs=new MediaStream([...cs.getVideoTracks(),...dest.stream.getAudioTracks()])
    const mimeType=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"
    const rec=new MediaRecorder(fs,{mimeType,videoBitsPerSecond:8e6})
    rec.ondataavailable=e=>{if(e.data.size>0)recChunksRef.current.push(e.data)}
    rec.onstop=()=>{setVideoBlob(new Blob(recChunksRef.current,{type:"video/webm"}));setIsRecording(false);try{ac.close()}catch{};notify("🎬 Video sẵn sàng tải!","ok")}
    rec.start();const st=performance.now()
    const loop=n=>{const e=(n-st)/1000;if(e>=totalDuration){renderFrame(totalDuration-.01,true);setTimeout(()=>rec.stop(),200);return};renderFrame(e,true);animRef.current=requestAnimationFrame(loop)};animRef.current=requestAnimationFrame(loop)
  }
  const downloadVideo=()=>{if(!videoBlob)return;const u=URL.createObjectURL(videoBlob);const a=document.createElement("a");a.href=u;a.download=`pod-video-${Date.now()}.webm`;a.click();URL.revokeObjectURL(u)}

  // Storyboard
  const exportStoryboard=()=>{
    const cols=Math.min(scenes.length,3),rows=Math.ceil(scenes.length/cols)
    const tW=360,tH=640,pad=16;const cv=document.createElement("canvas")
    cv.width=cols*tW+(cols+1)*pad;cv.height=rows*tH+(rows+1)*pad+56;const ctx=cv.getContext("2d")
    ctx.fillStyle="#07080f";ctx.fillRect(0,0,cv.width,cv.height)
    ctx.fillStyle="#fff";ctx.font="bold 22px sans-serif";ctx.fillText("Storyboard — POD Video Maker",pad,36)
    scenes.forEach((sc,i)=>{
      const col=i%cols,row=Math.floor(i/cols),x=pad+col*(tW+pad),y=56+pad+row*(tH+pad)
      const tc=document.createElement("canvas");tc.width=tW;tc.height=tH
      drawScene(tc.getContext("2d"),tW,tH,getSceneImage(sc,i),sc.text,sc.subtext,.5,sc.transition,(FONTS.find(f=>f.id===sc.font)||FONTS[0]).css,sc.textAnim||"static",i)
      ctx.drawImage(tc,x,y);ctx.fillStyle=T.acT;ctx.font="bold 13px sans-serif"
      ctx.fillText(`${i+1}. ${sc.duration}s · ${i===0?"HOOK":i===scenes.length-1?"CTA":"BODY"}`,x,y+tH+14)
    })
    const a=document.createElement("a");a.download=`storyboard-${Date.now()}.png`;a.href=cv.toDataURL("image/png");a.click();notify("Đã tải storyboard!","ok")
  }

  const currentProv=PROVS.find(p=>p.id===prov)

  /* ═══ RENDER ═══ */
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@400;600;700&family=Permanent+Marker&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;font-family:inherit;border:none}
        input,select,textarea{font-family:inherit}
        .fu{animation:fadeUp .3s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.bdrL};border-radius:4px}
        select option{background:${T.card}}
      `}</style>
      <Toast msg={toast.m} type={toast.t}/>
      <OfflineBanner/>
      {audioUrl&&<audio ref={audioRef} src={audioUrl} loop preload="auto"/>}
      {voiceUrl&&<audio ref={voiceRef} src={voiceUrl} preload="auto"/>}

      {/* HEADER */}
      <header style={{padding:"10px 16px",borderBottom:`1px solid ${T.bdr}`,background:T.sf,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:940,margin:"0 auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.ac},${T.pk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,boxShadow:`0 4px 12px ${T.ac}40`}}>🎬</div>
          <span style={{fontSize:15,fontWeight:800,background:`linear-gradient(90deg,${T.acT},${T.cy})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",flex:1}}>POD Video Maker</span>
          {templates.length>0&&<button onClick={()=>setShowTpl(!showTpl)} style={{padding:"6px 11px",borderRadius:8,border:`1px solid ${T.or}35`,background:T.orS,color:T.orT,fontSize:11,fontWeight:700}}>⭐{templates.length}</button>}
          <button onClick={toggleLang} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:11,fontWeight:700}} title="Switch language">{lang==="vi"?"EN":"VI"}</button>
          <button onClick={()=>setShowSettings(!showSettings)} style={{padding:"6px 14px",borderRadius:8,background:showSettings?T.acS:"transparent",border:`1px solid ${showSettings?T.ac:T.bdr}`,color:showSettings?T.acT:T.tx2,fontSize:12,fontWeight:600}}>{currentProv?.icon} {currentProv?.name}</button>
          {step>"1"&&<button onClick={()=>{setStep("1");setIdeas(null);setScenes([]);setVideoBlob(null);setMp4Blob(null);setSceneImgs({});setUndoStack([]);setVoiceUrl(null);setHeygenUrl(null)}} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:12}}>↺ Mới</button>}
        </div>
      </header>

      <main style={{maxWidth:940,margin:"0 auto",padding:"14px 16px 40px"}}>

        {/* Settings */}
        {showSettings&&(
          <div className="fu" style={{marginBottom:14,padding:16,borderRadius:14,background:T.sf,border:`1px solid ${T.bdr}`}}>
            <div style={{fontSize:13,fontWeight:700,color:T.acT,marginBottom:12}}>⚙️ AI Provider</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:7,marginBottom:12}}>
              {PROVS.map(p=>(
                <button key={p.id} onClick={()=>setProv(p.id)} style={{padding:"10px",borderRadius:10,border:prov===p.id?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,background:prov===p.id?T.acS:"transparent",textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:700,color:prov===p.id?T.acT:T.tx}}>{p.icon} {p.name}</div>
                  <div style={{fontSize:10,color:T.txD,marginTop:2}}>{p.h}</div>
                </button>
              ))}
            </div>
            {currentProv?.nk&&(
              <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste API key..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none",marginBottom:10}}/>
            )}
            <div style={{fontSize:11,fontWeight:700,color:T.gnT,marginBottom:5}}>🎙 Voiceover — ElevenLabs (free 10K chars/tháng)</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input type="password" value={elKey} onChange={e=>setElKey(e.target.value)} placeholder="ElevenLabs API key" style={{flex:1,padding:"9px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}/>
              <select value={voiceId} onChange={e=>setVoiceId(e.target.value)} style={{padding:"9px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}>
                {EL_VOICES.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:T.orT,marginBottom:8,paddingTop:10,borderTop:`1px solid ${T.bdr}`}}>⭐ Premium (tuỳ chọn)</div>
            <div style={{display:"grid",gap:6}}>
              <div><div style={{fontSize:10,color:T.txD,marginBottom:3}}>🎨 DALL-E 3 (~$0.04/ảnh)</div><input type="password" value={dalleKey} onChange={e=>setDalleKey(e.target.value)} placeholder="OpenAI key cho DALL-E 3" style={{width:"100%",padding:"9px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}/></div>
              <div><div style={{fontSize:10,color:T.txD,marginBottom:3}}>🎭 HeyGen AI Avatar ($24/tháng)</div><input type="password" value={heygenKey} onChange={e=>setHeygenKey(e.target.value)} placeholder="HeyGen API key" style={{width:"100%",padding:"9px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}/></div>
              <div><div style={{fontSize:10,color:T.txD,marginBottom:3}}>🚀 Replicate Flux + XTTS ($5 free credit)</div><input type="password" value={replicateKey} onChange={e=>setReplicateKey(e.target.value)} placeholder="Replicate API token" style={{width:"100%",padding:"9px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}><button onClick={saveSettings} style={{padding:"10px 24px",borderRadius:10,background:T.ac,color:"#fff",fontSize:13,fontWeight:700}}>Lưu</button><button onClick={()=>setShowSettings(false)} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:13}}>Đóng</button></div>
          </div>
        )}

        {/* Templates */}
        {showTpl&&(
          <div className="fu" style={{marginBottom:14,padding:14,borderRadius:14,background:T.sf,border:`1px solid ${T.bdr}`}}>
            <div style={{fontSize:13,fontWeight:700,color:T.orT,marginBottom:10}}>⭐ Templates đã lưu</div>
            {templates.map(t=>(
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:T.card,marginBottom:5}}>
                <div><span style={{fontWeight:600,fontSize:13}}>{t.title}</span><span style={{fontSize:11,color:T.txD,marginLeft:8}}>{t.format} · {t.scenes?.length} scenes · {t.created}</span></div>
                <div style={{display:"flex",gap:4}}><button onClick={()=>applyTemplate(t)} style={{padding:"5px 12px",borderRadius:6,background:T.acS,border:`1px solid ${T.ac}30`,color:T.acT,fontSize:11,fontWeight:600}}>Dùng</button><button onClick={()=>deleteTemplate(t.id)} style={{padding:"5px 8px",borderRadius:6,border:`1px solid ${T.rd}40`,color:T.rdT,fontSize:11,background:"transparent"}}>×</button></div>
              </div>
            ))}
            <button onClick={()=>setShowTpl(false)} style={{marginTop:6,padding:"7px 16px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:12}}>Đóng</button>
          </div>
        )}

        {/* Steps indicator */}
        {step>="1"&&(
          <div style={{display:"flex",gap:2,marginBottom:16,padding:"12px 14px",borderRadius:12,background:T.sf,border:`1px solid ${T.bdr}`}}>
            {[{n:"1",l:"Nhập SP"},{n:"2",l:"Chọn ý tưởng"},{n:"3",l:"Dựng & Tải"}].map((s,i)=>(
              <div key={s.n} style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:24,height:24,borderRadius:7,background:step>=s.n?T.ac:T.el,color:step>=s.n?"#fff":T.txD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,transition:"all .2s"}}>{step>s.n?"✓":s.n}</div>
                <span style={{fontSize:12,fontWeight:600,color:step>=s.n?T.tx:T.txD}}>{s.l}</span>
                {i<2&&<div style={{flex:1,height:2,borderRadius:1,background:step>s.n?T.ac:T.bdr,minWidth:6,transition:"background .3s"}}/>}
              </div>
            ))}
          </div>
        )}

        {/* WELCOME */}
        {step==="0"&&(
          <div className="fu" style={{textAlign:"center",padding:"52px 20px"}}>
            <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${T.ac},${T.pk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px",boxShadow:`0 12px 40px ${T.ac}40`}}>🎬</div>
            <h1 style={{fontSize:26,fontWeight:800,marginBottom:10,background:`linear-gradient(90deg,${T.acT},${T.cy})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>POD Video Maker</h1>
            <p style={{fontSize:15,color:T.tx2,maxWidth:440,margin:"0 auto 28px",lineHeight:1.75}}>Tạo video TikTok cho sản phẩm POD trong 3 bước. AI viết script, gen ảnh, dựng video. <strong style={{color:T.gnT}}>Miễn phí.</strong></p>
            <button onClick={()=>{localStorage.setItem("pod-v","1");setStep("1")}} style={{padding:"16px 52px",borderRadius:14,background:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:16,fontWeight:700,boxShadow:`0 8px 32px ${T.ac}35`}}>Bắt đầu →</button>
          </div>
        )}

        {/* STEP 1 */}
        {step==="1"&&(
          <div className="fu" style={{padding:18,borderRadius:16,background:T.sf,border:`1px solid ${T.bdr}`}}>
            <div style={{fontSize:14,fontWeight:700,color:T.tx,marginBottom:14}}>📝 Thông tin sản phẩm</div>

            {/* Product inputs */}
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:T.tx2,marginBottom:4}}>Tên sản phẩm *</label>
                <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="VD: Áo thun funny nurse, Mug sarcastic cat mom, Hoodie gym bro..." style={{width:"100%",padding:"12px 14px",borderRadius:11,border:`1px solid ${productName?T.ac:T.bdr}`,background:T.card,color:T.tx,fontSize:14,outline:"none",transition:"border .2s"}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:T.tx2,marginBottom:4}}>Đối tượng / niche</label>
                <input value={productNiche} onChange={e=>setProductNiche(e.target.value)} placeholder="VD: y tá Mỹ, cat lover, gym người, dog mom, introvert, teacher..." style={{width:"100%",padding:"12px 14px",borderRadius:11,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:14,outline:"none"}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:T.tx2,marginBottom:4}}>Câu/chữ trên design <span style={{color:T.acT}}>(quan trọng nhất!)</span></label>
                <input value={productQuote} onChange={e=>setProductQuote(e.target.value)} placeholder='VD: "I survived another meeting that could have been an email"' style={{width:"100%",padding:"12px 14px",borderRadius:11,border:`1px solid ${productQuote?T.ac:T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none",transition:"border .2s"}}/>
                <div style={{fontSize:10,color:T.txD,marginTop:3}}>Câu quote này là yếu tố viral chính — AI sẽ xây dựng video xoay quanh đây</div>
              </div>
            </div>

            {/* Upload images + Vision + HTML */}
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:T.tx2,marginBottom:6}}>
                Ảnh sản phẩm <span style={{color:T.gnT}}>(primary — AI sẽ đọc design tự động)</span>
              </label>
              {images.length===0?(
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px",borderRadius:12,border:`2px dashed ${T.bdrL}`,background:T.card,cursor:"pointer",gap:6,transition:"border .2s"}}>
                  <input type="file" accept="image/*" multiple onChange={handleUpload} style={{display:"none"}}/>
                  <span style={{fontSize:32}}>📸</span>
                  <span style={{fontSize:13,color:T.tx,fontWeight:700}}>Kéo thả hoặc click upload ảnh SP</span>
                  <span style={{fontSize:11,color:T.txD}}>Mockup, lifestyle, product photo · JPG/PNG/WEBP</span>
                  <span style={{fontSize:10,color:T.acT,padding:"3px 10px",borderRadius:6,background:T.acS,marginTop:4}}>✨ AI sẽ đọc design + tự điền thông tin</span>
                </label>
              ):(
                <div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,alignItems:"center"}}>
                    {images.map((im,i)=>(
                      <div key={i} style={{position:"relative",flexShrink:0}}>
                        <img src={im.url} style={{width:72,height:72,borderRadius:10,objectFit:"cover",border:`2px solid ${T.ac}60`}}/>
                        <button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,width:20,height:20,borderRadius:10,background:T.rd,color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      </div>
                    ))}
                    <label style={{width:72,height:72,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:T.txD,cursor:"pointer",flexShrink:0}}>
                      <input type="file" accept="image/*" multiple onChange={handleUpload} style={{display:"none"}}/>+
                    </label>
                  </div>
                  {/* AI Vision analyze button */}
                  <button onClick={analyzeWithVision} disabled={visionLoading} style={{width:"100%",marginTop:8,padding:"11px",borderRadius:10,background:visionLoading?T.el:`linear-gradient(135deg,${T.ac}cc,#e879f9cc)`,color:"#fff",fontSize:13,fontWeight:700,border:`1px solid ${T.ac}40`,opacity:visionLoading?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {visionLoading?<><span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff5",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>AI đang đọc design...</>:<>🔍 AI đọc ảnh → tự điền thông tin</>}
                  </button>
                  <div style={{fontSize:10,color:T.txD,marginTop:4,textAlign:"center"}}>Claude Vision sẽ nhận diện design, chữ trên áo, niche, màu sắc</div>
                </div>
              )}

              {/* HTML paste — collapse toggle */}
              <details style={{marginTop:10}}>
                <summary style={{fontSize:12,color:T.txD,cursor:"pointer",padding:"6px 0",userSelect:"none",display:"flex",alignItems:"center",gap:6}}>
                  <span>🔗</span> Có link trang SP? Paste HTML để lấy ảnh tự động
                </summary>
                <div style={{marginTop:8}}>
                  <div style={{padding:"8px 12px",borderRadius:8,background:T.orS,border:`1px solid ${T.or}25`,fontSize:11,color:T.orT,lineHeight:1.6,marginBottom:8}}>
                    Mở trang SP (Etsy/Amazon/Shopify) → <b>Ctrl+U</b> → <b>Ctrl+A</b> → <b>Ctrl+C</b> → paste vào đây.<br/>
                    Tool sẽ trích xuất <b>ảnh sản phẩm + thông tin</b> tự động.
                  </div>
                  <div style={{position:"relative"}}>
                    <textarea value={htmlSrc} onChange={e=>setHtmlSrc(e.target.value)} placeholder="Paste toàn bộ HTML source code..." rows={4} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"monospace",lineHeight:1.4}}/>
                    {htmlSrc&&<button onClick={()=>setHtmlSrc("")} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:11,background:T.rd,color:"#fff",fontSize:11,border:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
                  </div>
                  <button onClick={parseHTML} disabled={loading||!htmlSrc.trim()} style={{width:"100%",marginTop:6,padding:"12px",borderRadius:10,background:loading||!htmlSrc.trim()?T.el:`linear-gradient(135deg,${T.or}cc,${T.pk}cc)`,color:"#fff",fontSize:13,fontWeight:700,border:"none",opacity:loading||!htmlSrc.trim()?0.5:1}}>
                    {loading?"⏳ Đang trích xuất ảnh...":"📸 Lấy ảnh + info từ HTML"}
                  </button>
                </div>
              </details>
            </div>

            {/* Duration */}
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:T.tx2,marginBottom:6}}>⏱ Thời lượng video</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[{v:15,l:"15s"},{v:30,l:"30s"},{v:60,l:"1m"},{v:90,l:"1.5m"},{v:120,l:"2m"},{v:180,l:"3m"}].map(d=>(
                  <button key={d.v} onClick={()=>setVideoDuration(d.v)} style={{padding:"8px 14px",borderRadius:8,border:videoDuration===d.v?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,background:videoDuration===d.v?T.acS:"transparent",color:videoDuration===d.v?T.acT:T.txD,fontSize:13,fontWeight:600}}>{d.l}</button>
                ))}
              </div>
            </div>

            {/* Gen button */}
            <button onClick={genIdeas} disabled={loading||(!productName&&!ideaText&&!images.length)} style={{width:"100%",padding:"16px",borderRadius:13,background:loading||(!productName&&!ideaText&&!images.length)?T.el:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:15,fontWeight:700,opacity:loading||(!productName&&!ideaText&&!images.length)?0.45:1,boxShadow:loading?"none":`0 6px 24px ${T.ac}30`,transition:"all .2s"}}>
              {loading?`⏳ ${loadMsg}`:"🎬 Tạo 4 ý tưởng video"}
            </button>
            {(!productName&&!ideaText&&!images.length)&&<div style={{fontSize:11,color:T.txD,textAlign:"center",marginTop:6}}>Nhập tên SP hoặc upload ảnh để bắt đầu</div>}
          </div>
        )}

        {/* STEP 2 */}
        {step==="2"&&ideas&&(
          <div className="fu">
            <div style={{fontSize:13,color:T.tx2,marginBottom:12}}>AI tạo 4 concept — chọn 1 để tiếp tục:</div>
            {ideas.ideas?.map((idea,i)=>(
              <button key={i} onClick={()=>selectIdea(i)} style={{display:"block",width:"100%",padding:16,borderRadius:14,background:T.sf,border:`1px solid ${T.bdr}`,marginBottom:10,textAlign:"left",transition:"border .15s",outline:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <span style={{fontSize:15,fontWeight:800}}>{idea.title}</span>
                    <span style={{fontSize:11,color:T.acT,marginLeft:8,padding:"3px 8px",borderRadius:6,background:T.acS,fontWeight:600}}>{idea.format}</span>
                  </div>
                  <span style={{padding:"4px 12px",borderRadius:10,background:idea.viral_score>=8?T.gnS:idea.viral_score>=6?T.orS:T.blS,color:idea.viral_score>=8?T.gnT:idea.viral_score>=6?T.orT:T.blT,fontSize:13,fontWeight:700,flexShrink:0}}>🔥{idea.viral_score}/10</span>
                </div>
                <div style={{fontSize:13,color:T.tx2,lineHeight:1.55,marginBottom:6}}>{idea.description}</div>
                {idea.hook_emotion&&<div style={{fontSize:12,color:T.acT,marginBottom:4}}>🎯 Hook: {idea.hook_emotion}</div>}
                {idea.why&&<div style={{fontSize:11,color:T.txD}}>💡 {idea.why}</div>}
                <div style={{fontSize:11,color:T.txD,marginTop:8,display:"flex",gap:10}}>
                  <span>⏱{idea.total_duration}s</span>
                  <span>🎬{idea.scenes?.length} scenes</span>
                  {idea.sound&&<span>🎵{idea.sound}</span>}
                </div>
                {/* Preview first scene text */}
                {idea.scenes?.[0]?.text&&(
                  <div style={{marginTop:8,padding:"6px 10px",borderRadius:7,background:T.card,fontSize:12,color:T.tx,fontStyle:"italic"}}>
                    Hook: "{idea.scenes[0].text}"
                  </div>
                )}
              </button>
            ))}
            <button onClick={()=>setStep("1")} style={{padding:"11px 20px",borderRadius:10,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:13}}>← Quay lại</button>
          </div>
        )}

        {/* STEP 3 */}
        {step==="3"&&(
          <div className="fu">
            {/* Status banners */}
            {autoGenning&&<div style={{padding:"10px 14px",borderRadius:10,background:T.acS,border:`1px solid ${T.ac}30`,fontSize:13,color:T.acT,marginBottom:8,animation:"shimmer 1.5s infinite"}}>⏳ Đang gen ảnh AI...</div>}
            {voiceGenning&&<div style={{padding:"10px 14px",borderRadius:10,background:T.orS,border:`1px solid ${T.or}30`,fontSize:13,color:T.orT,marginBottom:8,animation:"shimmer 1.5s infinite"}}>🎙 Đang gen voiceover...</div>}
            {voiceUrl&&!voiceGenning&&<div style={{padding:"8px 14px",borderRadius:10,background:T.gnS,border:`1px solid ${T.gn}25`,fontSize:12,color:T.gnT,marginBottom:8}}>🎙 Voiceover sẵn sàng — sẽ mix vào video tự động</div>}
            {images.length>0&&<div style={{padding:"8px 14px",borderRadius:10,background:T.gnS,border:`1px solid ${T.gn}25`,fontSize:12,color:T.gnT,marginBottom:8}}>📸 {images.length} ảnh SP của bạn đang được dùng trong video</div>}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16}}>
              {/* LEFT: Canvas preview */}
              <div>
                <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${T.bdr}`,background:"#000",boxShadow:`0 8px 32px rgba(0,0,0,.5)`,maxWidth:320,margin:"0 auto"}}>
                  <canvas ref={canvasRef} width={1080} height={1920} style={{width:"100%",height:"auto",display:"block",aspectRatio:"9/16"}}/>
                  <div style={{padding:"10px 12px",display:"flex",gap:8,alignItems:"center",background:T.sf}}>
                    <button onClick={isPlaying?pause:play} style={{width:36,height:36,borderRadius:10,background:T.ac,color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 10px ${T.ac}40`}}>{isPlaying?"⏸":"▶"}</button>
                    <div style={{flex:1,height:4,borderRadius:2,background:T.el,overflow:"hidden",cursor:"pointer"}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left;const t=(x/r.width)*totalDuration;setCurrentTime(Math.max(0,Math.min(totalDuration,t)));renderFrame(Math.max(0,Math.min(totalDuration,t)))}}>
                      <div style={{width:`${totalDuration>0?(currentTime/totalDuration)*100:0}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${T.ac},${T.pk})`,transition:isPlaying?"none":"width .12s"}}/>
                    </div>
                    <span style={{fontSize:11,color:T.txD,fontVariantNumeric:"tabular-nums",minWidth:60,textAlign:"right"}}>{currentTime.toFixed(1)}s / {totalDuration}s</span>
                  </div>
                </div>

                {/* Audio upload */}
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  <label style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${audioUrl?T.gn:T.bdr}`,background:audioUrl?T.gnS:T.sf,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,color:audioUrl?T.gnT:T.tx2,fontWeight:600}}>
                    <input type="file" accept="audio/*" onChange={handleAudio} style={{display:"none"}}/>🎵 {audioUrl?"Nhạc nền ✓":"Thêm nhạc nền"}
                  </label>
                  {audioUrl&&<button onClick={()=>setAudioUrl(null)} style={{padding:"10px 12px",borderRadius:10,border:`1px solid ${T.rd}40`,background:T.rdS,color:T.rdT,fontSize:13}}>×</button>}
                </div>

                {/* Render + Download */}
                <button onClick={recordVideo} disabled={isRecording||!scenes.length} style={{width:"100%",marginTop:8,padding:"15px",borderRadius:12,background:isRecording?T.rd:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:14,fontWeight:700,opacity:isRecording?0.65:1,boxShadow:isRecording?"none":`0 6px 20px ${T.ac}30`}}>
                  {isRecording?"⏺ Đang render... (không tắt tab)":"⏺ Render video"+( images.length>0?" (ảnh SP thật)":voiceUrl?" (có voiceover)":"")}
                </button>
                {videoBlob&&(
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                    <button onClick={downloadVideo} style={{width:"100%",padding:"15px",borderRadius:12,background:`linear-gradient(135deg,${T.gn},#059669)`,color:"#fff",fontSize:14,fontWeight:700,boxShadow:`0 6px 20px ${T.gn}30`}}>⬇️ Tải video .webm</button>
                    {!mp4Blob&&<button onClick={convertToMP4} disabled={converting} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${T.ac}40`,background:T.acS,color:T.acT,fontSize:13,fontWeight:600,opacity:converting?0.5:1}}>{converting?"Đang chuyển đổi...":"🔄 Chuyển sang MP4"}</button>}
                    {mp4Blob&&<button onClick={downloadMP4} style={{width:"100%",padding:"15px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:14,fontWeight:700}}>⬇️ Tải MP4</button>}
                  </div>
                )}
                {videoBlob&&<p style={{fontSize:11,color:T.gnT,marginTop:6,textAlign:"center",lineHeight:1.6}}>💡 Tải → CapCut → thêm sound/caption → export MP4 → đăng TikTok!</p>}

                {/* Extra tools */}
                <div style={{display:"flex",gap:6,marginTop:10}}>
                  <button onClick={exportStoryboard} style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12}}>🖼 Storyboard PNG</button>
                  {extData?.rawIdea&&<button onClick={()=>saveTemplate(extData.rawIdea)} style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${T.or}40`,background:T.orS,color:T.orT,fontSize:12}}>⭐ Lưu template</button>}
                </div>

                {/* ══ ALL AI VIDEO TOOLS — categorized ══ */}
                <div style={{marginTop:10,padding:14,borderRadius:14,background:T.sf,border:`1px solid ${T.bdr}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.orT}}>🚀 Mở AI Video Tool — 1 click</div>
                    <div style={{fontSize:10,color:T.txD}}>Prompt tự copy • Ctrl+V là xong</div>
                  </div>

                  {TOOL_CATS.map(cat=>{
                    // Build prompt per category
                    const t2vPrompt=extData?.inv||extData?.kl||""
                    const klingPrompt=extData?.kl||extData?.inv||""
                    const i2vPrompt=(images[0]?.url&&images[0].url.startsWith("http")?images[0].url:"[Upload ảnh SP vào tool]")+" — "+klingPrompt
                    const ugcPrompt=extData?.fullVoice||scenes.map(s=>s.voice).filter(Boolean).join(". ")||t2vPrompt
                    const promptFor=(id)=>{
                      if(cat.id==="edit")return null
                      if(cat.id==="ugc")return ugcPrompt
                      if(cat.id==="i2v")return i2vPrompt
                      // t2v: kling gets klingPrompt, others get t2vPrompt
                      return id.startsWith("kling")?klingPrompt:t2vPrompt
                    }
                    const hasPrompt=cat.id!=="edit"&&(t2vPrompt||ugcPrompt)
                    return(
                      <div key={cat.id} style={{marginBottom:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:700,color:T.tx2}}>{cat.label}</span>
                          <span style={{fontSize:10,color:T.txD}}>{cat.desc}</span>
                        </div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {cat.tools.map(t=>{
                            const prompt=promptFor(t.id)
                            return(
                              <button key={t.id}
                                onClick={()=>prompt?copyOpen(prompt,t.url):window.open(t.url,"_blank")}
                                title={t.tip}
                                style={{
                                  padding:"6px 10px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",
                                  border:`1px solid ${prompt?T.ac+"50":T.bdr}`,
                                  background:prompt?T.acS:T.el,
                                  color:prompt?T.acT:T.tx2,
                                  display:"flex",alignItems:"center",gap:4,
                                  transition:"all .15s"
                                }}>
                                <span>{t.icon}</span>
                                <span>{t.name}</span>
                                {t.free&&<span style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:T.gnS,color:T.gnT,fontWeight:700}}>FREE</span>}
                                {prompt&&<span style={{fontSize:9,color:T.acT,opacity:.7}}>→</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* Caption + hashtag copy */}
                  {extData?.cap&&(
                    <div style={{marginTop:4,borderTop:`1px solid ${T.bdr}`,paddingTop:10}}>
                      <div style={{fontSize:11,fontWeight:600,color:T.tx2,marginBottom:5}}>📋 Copy caption để đăng</div>
                      <div onClick={()=>copy(extData.cap+"\n\n"+extData.ht?.map(h=>"#"+h).join(" "))}
                        style={{padding:"8px 12px",borderRadius:9,background:T.card,fontSize:12,color:T.tx2,cursor:"pointer",lineHeight:1.6,border:`1px solid ${T.bdr}`}}>
                        {extData.cap}
                        <div style={{color:T.acT,marginTop:3,fontSize:11}}>{extData.ht?.map(h=>"#"+h).join(" ")}</div>
                        <div style={{fontSize:10,color:T.txD,marginTop:2}}>Click để copy tất cả →</div>
                      </div>
                      {extData?.snd&&<div style={{fontSize:11,color:T.txD,marginTop:5}}>🎵 Sound gợi ý: {extData.snd}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Scene list */}
              <div>
                {/* Refine & regenerate */}
                <div style={{marginBottom:12,padding:12,borderRadius:12,background:T.sf,border:`1px solid ${T.bdr}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.acT,marginBottom:6}}>✏️ Chỉnh ý tưởng → Gen lại</div>
                  <textarea value={refineText} onChange={e=>setRefineText(e.target.value)} placeholder={"Yêu cầu thay đổi:\n• Funny hơn / thêm humor\n• Nhấn mạnh quà tặng\n• Đổi sang phong cách aesthetic\n• Thêm social proof / giá sale"} rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:9,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.5}}/>
                  <button onClick={()=>{if(refineText){setProductInfo(p=>(p||"")+"\nYêu cầu: "+refineText);setRefineText("")};setStep("1");setTimeout(()=>genIdeas(),150)}} style={{width:"100%",marginTop:6,padding:"10px",borderRadius:9,background:`linear-gradient(135deg,${T.or},${T.pk})`,color:"#fff",fontSize:12,fontWeight:700,border:"none"}}>🔄 Gen lại với chỉnh sửa</button>
                </div>

                {/* Pro Pipeline (Replicate) */}
                {replicateKey&&(
                  <div style={{marginBottom:12}}>
                    <button onClick={runProPipeline} disabled={proRendering} style={{width:"100%",padding:"12px",borderRadius:10,background:proRendering?T.el:`linear-gradient(135deg,${T.gn},#059669)`,color:"#fff",fontSize:13,fontWeight:700,border:"none",opacity:proRendering?0.6:1,boxShadow:proRendering?"none":`0 4px 16px ${T.gn}30`}}>
                      {proRendering?"🚀 Đang gen video clips...":"🚀 Pro Pipeline (Replicate: video clips + XTTS)"}
                    </button>
                    {Object.keys(sceneVideos).length>0&&<div style={{padding:"5px 10px",borderRadius:7,background:T.gnS,fontSize:11,color:T.gnT,marginTop:4,textAlign:"center"}}>🎬 {Object.keys(sceneVideos).length} scene có video clip thật</div>}
                  </div>
                )}

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.acT}}>{scenes.length} scenes · {totalDuration}s tổng</span>
                  <button onClick={()=>setShowAdvanced(!showAdvanced)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${T.bdr}`,background:showAdvanced?T.acS:"transparent",color:showAdvanced?T.acT:T.txD,fontSize:11,fontWeight:600}}>⚙️ {showAdvanced?"Đơn giản":"Chi tiết"}</button>
                </div>

                {!showAdvanced?(
                  // SIMPLE MODE
                  <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:520,overflowY:"auto",paddingRight:4}}>
                    {scenes.map((sc,i)=>{
                      const thumb=sceneImgs[i]?.src||images[sc.image_index]?.url
                      const isH=i===0,isC=i===scenes.length-1
                      const tc=isH?T.or:isC?T.gn:T.acT,tb=isH?T.orS:isC?T.gnS:T.acS,tl=isH?"HOOK":isC?"CTA":"BODY"
                      return(
                        <div key={i} onClick={()=>previewScene(i)} style={{padding:11,borderRadius:11,background:T.sf,border:`1px solid ${T.bdr}`,cursor:"pointer",transition:"border .15s"}}>
                          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                            <div style={{width:46,height:46,borderRadius:8,overflow:"hidden",background:T.card,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              {thumb?<img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:16}}>🖼</span>}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                                <span style={{padding:"1px 7px",borderRadius:4,background:tb,color:tc,fontSize:10,fontWeight:700}}>{tl}</span>
                                <span style={{fontSize:11,color:T.txD}}>{sc.duration}s</span>
                                {images.length>1&&(
                                  <div style={{display:"flex",gap:2,marginLeft:"auto"}}>
                                    {images.slice(0,Math.min(images.length,4)).map((_,ii)=>(
                                      <div key={ii} onClick={e=>{e.stopPropagation();selectSceneImg(i,ii)}} style={{width:18,height:18,borderRadius:3,overflow:"hidden",border:sc.image_index===ii?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,opacity:sc.image_index===ii?1:.4,cursor:"pointer"}}>
                                        <img src={images[ii].url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div style={{fontSize:13,fontWeight:700,color:T.tx,lineHeight:1.35}}>{sc.text||<span style={{color:T.txD,fontStyle:"italic",fontWeight:400}}>Chưa có text</span>}</div>
                              {sc.voice&&<div style={{fontSize:11,color:T.txD,marginTop:3,lineHeight:1.4}}>🎙 {sc.voice.slice(0,80)}{sc.voice.length>80?"...":""}</div>}
                            </div>
                          </div>
                          {/* Editable text in simple mode */}
                          <input value={sc.text} onClick={e=>e.stopPropagation()} onChange={e=>updateScene(i,"text",e.target.value)} placeholder="Text overlay..." style={{width:"100%",marginTop:8,padding:"7px 10px",borderRadius:7,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none"}}/>
                        </div>
                      )
                    })}
                    <div style={{display:"flex",gap:6,paddingTop:4}}>
                      {undoStack.length>0&&<button onClick={undo} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.or}40`,background:T.orS,color:T.orT,fontSize:12,fontWeight:600}}>↩ Undo</button>}
                      <button onClick={addScene} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12}}>+ Thêm scene</button>
                    </div>
                  </div>
                ):(
                  // ADVANCED MODE
                  <div style={{maxHeight:520,overflowY:"auto",paddingRight:4}}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={scenes.map(s=>s._id)} strategy={verticalListSortingStrategy}>
                        {scenes.map((sc,i)=><SortableScene key={sc._id} scene={sc} index={i} total={scenes.length} sceneImg={sceneImgs[i]} uploadedImgs={images} onUpdate={updateScene} onRemove={removeScene} onRegen={regenSceneImg} onPreview={previewScene} onSelectImg={selectSceneImg}/>)}
                      </SortableContext>
                    </DndContext>
                    <div style={{display:"flex",gap:6,paddingTop:4}}>
                      {undoStack.length>0&&<button onClick={undo} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.or}40`,background:T.orS,color:T.orT,fontSize:12,fontWeight:600}}>↩ Undo</button>}
                      <button onClick={addScene} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12}}>+ Thêm scene</button>
                    </div>
                  </div>
                )}

                {/* Full voiceover */}
                {extData?.fullVoice&&(
                  <div style={{marginTop:12,padding:12,borderRadius:12,background:T.card,border:`1px solid ${T.bdr}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.acT,marginBottom:6}}>🎙 Full voiceover script</div>
                    <div style={{fontSize:12,color:T.tx2,lineHeight:1.65,maxHeight:100,overflowY:"auto"}}>{extData.fullVoice}</div>
                    <button onClick={()=>copy(extData.fullVoice)} style={{marginTop:6,padding:"5px 12px",borderRadius:6,border:`1px solid ${T.bdr}`,background:"transparent",color:T.txD,fontSize:11}}>Copy script</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(8px)"}}>
            <div style={{textAlign:"center",padding:"32px 40px",borderRadius:18,background:T.sf,border:`1px solid ${T.bdr}`,boxShadow:"0 24px 64px rgba(0,0,0,.6)",maxWidth:"85vw"}}>
              <div style={{fontSize:38,animation:"pulse 1.2s infinite",marginBottom:12}}>⚡</div>
              <div style={{fontSize:15,fontWeight:700,color:T.tx}}>{loadMsg}</div>
              <div style={{fontSize:12,color:T.txD,marginTop:6}}>Auto-retry nếu lỗi...</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
