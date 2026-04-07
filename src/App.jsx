import { useState, useCallback, useRef, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/* ═══ THEME ═══ */
const T = {
  bg:"#0a0b10",sf:"#12131a",card:"#191a24",el:"#222330",
  bdr:"#2a2b3a",bdrL:"#383950",
  ac:"#7c5cfc",acS:"rgba(124,92,252,.12)",acT:"#b4a0ff",
  gn:"#22c55e",gnS:"rgba(34,197,94,.1)",gnT:"#86efac",
  or:"#f97316",orS:"rgba(249,115,22,.1)",orT:"#fdba74",
  rd:"#ef4444",rdS:"rgba(239,68,68,.1)",rdT:"#fca5a5",
  bl:"#3b82f6",blS:"rgba(59,130,246,.1)",
  pk:"#ec4899",tx:"#e8e8f4",tx2:"#9294a6",txD:"#5e5f72",
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
  { id:"auto",name:"Auto",icon:"⚡",nk:false,h:"Claude / Pollinations" },
  { id:"pollinations",name:"Pollinations",icon:"🌸",nk:false,h:"FREE, không cần key" },
  { id:"groq",name:"Groq",icon:"⚡",nk:true,h:"FREE — console.groq.com" },
  { id:"gemini",name:"Gemini",icon:"💎",nk:true,h:"FREE — aistudio.google.com" },
  { id:"openai",name:"OpenAI",icon:"🧠",nk:true,h:"Trả phí" },
]
const TOOLS = [
  { id:"invideo",name:"InVideo AI",url:"https://ai.invideo.io",icon:"🎬" },
  { id:"kling",name:"Kling AI",url:"https://klingai.com",icon:"🤖" },
  { id:"capcut",name:"CapCut",url:"https://capcut.com",icon:"✂️" },
  { id:"kapwing",name:"Kapwing",url:"https://kapwing.com",icon:"🔧" },
  { id:"canva",name:"Canva",url:"https://canva.com",icon:"🎨" },
]

/* ═══ RETRY WRAPPER ═══ */
async function withRetry(fn, retries = 2, delay = 1500) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn() }
    catch (e) {
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

/* ═══ AI PROVIDERS ═══ */
async function callAI(pv, key, prompt, json = true) {
  if (pv === "auto") {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,messages:[{role:"user",content:prompt}]}) })
      if (r.ok) { const d = await r.json(); return d.content?.map(c=>c.text||"").join("") || "" }
    } catch {}
    if (key) {
      try { return await callAI("groq",key,prompt,json) } catch {}
      try { return await callAI("gemini",key,prompt,json) } catch {}
    }
    return await callAI("pollinations","",prompt,json)
  }
  if (pv === "pollinations") {
    const r = await fetch("https://text.pollinations.ai/", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({messages:[{role:"system",content:"Respond valid JSON when asked. No markdown."},{role:"user",content:prompt}],model:"openai",jsonMode:json,seed:Math.floor(Math.random()*9999)}) })
    if (!r.ok) throw new Error("Pollinations lỗi " + r.status); return await r.text()
  }
  if (pv === "groq") {
    if (!key) throw new Error("Nhập Groq key trong ⚙️ Settings")
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+key}, body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:2500,messages:[{role:"system",content:"Respond valid JSON only."},{role:"user",content:prompt}],...(json?{response_format:{type:"json_object"}}:{})}) })
    if (!r.ok) throw new Error("Groq lỗi " + r.status); const d = await r.json(); return d.choices?.[0]?.message?.content || ""
  }
  if (pv === "gemini") {
    if (!key) throw new Error("Nhập Gemini key trong ⚙️ Settings")
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{...(json?{responseMimeType:"application/json"}:{}),maxOutputTokens:2500}}) })
    if (!r.ok) throw new Error("Gemini lỗi " + r.status); const d = await r.json(); return d.candidates?.[0]?.content?.parts?.[0]?.text || ""
  }
  if (pv === "openai") {
    if (!key) throw new Error("Nhập OpenAI key trong ⚙️ Settings")
    const r = await fetch("https://api.openai.com/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+key}, body:JSON.stringify({model:"gpt-4o-mini",max_tokens:2500,messages:[{role:"system",content:"Respond valid JSON only."},{role:"user",content:prompt}],...(json?{response_format:{type:"json_object"}}:{})}) })
    if (!r.ok) throw new Error("OpenAI lỗi " + r.status); const d = await r.json(); return d.choices?.[0]?.message?.content || ""
  }
  throw new Error("Provider lỗi")
}

async function aiJSON(pv, key, prompt) {
  return withRetry(async () => {
    const raw = await callAI(pv, key, prompt, true)
    try { return JSON.parse(raw.replace(/```json|```/g,"").trim()) }
    catch { throw new Error("AI trả format lỗi. Đang thử lại...") }
  })
}
async function aiText(pv, key, prompt) {
  return withRetry(() => callAI(pv, key, prompt, false))
}

/* ═══ IMAGE GEN (Pollinations free → DALL-E 3 premium) ═══ */
function pollImg(p) { return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random()*99999)}` }
function loadImg(u) { return new Promise((r,j) => { const i = new Image(); i.crossOrigin="anonymous"; i.onload=()=>r(i); i.onerror=()=>j(); i.src=u }) }

async function generateImage(prompt, dalleKey, repKey) {
  // Tier 1: Replicate Flux (best quality, $0.003/run)
  if (repKey) {
    try { return await fluxImage(prompt, repKey) } catch {}
  }
  // Tier 2: DALL-E 3 (high quality)
  if (dalleKey) {
    try {
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method:'POST', headers:{'Authorization':'Bearer '+dalleKey,'Content-Type':'application/json'},
        body:JSON.stringify({model:'dall-e-3',prompt:'TikTok vertical 9:16 aesthetic photo: '+prompt,size:'1024x1792',n:1,quality:'standard'})
      })
      if (r.ok) { const d = await r.json(); if (d.data?.[0]?.url) return await loadImg(d.data[0].url) }
    } catch {}
  }
  // Free: Pollinations
  return await loadImg(pollImg(prompt))
}

/* ═══ TTS (ElevenLabs + StreamElements free fallback) ═══ */
async function generateTTS(text, elevenLabsKey, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  if (elevenLabsKey) {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method:'POST', headers:{'xi-api-key':elevenLabsKey,'Content-Type':'application/json'},
        body:JSON.stringify({text, model_id:'eleven_monolingual_v1', voice_settings:{stability:.5,similarity_boost:.75}})
      })
      if (r.ok) return URL.createObjectURL(await r.blob())
    } catch {}
  }
  try {
    const r = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text.slice(0,300))}`)
    if (r.ok) return URL.createObjectURL(await r.blob())
  } catch {}
  return null
}

async function fetchElevenLabsVoices(key) {
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers:{'xi-api-key':key} })
    if (r.ok) { const d = await r.json(); return d.voices?.map(v => ({id:v.voice_id, name:v.name, preview:v.preview_url})) || [] }
  } catch {}
  return []
}

/* ═══ HEYGEN AI AVATAR (premium — $24/mo) ═══ */
async function generateHeyGenVideo(script, heygenKey, avatarId = 'default') {
  // Step 1: Submit generation
  const r = await fetch('https://api.heygen.com/v2/video/generate', {
    method:'POST', headers:{'X-Api-Key':heygenKey,'Content-Type':'application/json'},
    body:JSON.stringify({
      video_inputs:[{
        character:{type:'avatar',avatar_id:avatarId||'josh_lite3_20230714'},
        voice:{type:'text',input_text:script,voice_id:'1bd001e7e50f421d891986aad5c9060'},
        background:{type:'color',value:'#000000'}
      }],
      dimension:{width:1080,height:1920}
    })
  })
  if (!r.ok) throw new Error('HeyGen lỗi ' + r.status)
  const d = await r.json()
  const videoId = d.data?.video_id
  if (!videoId) throw new Error('HeyGen không trả video ID')

  // Step 2: Poll until ready (max 2 min)
  for (let i = 0; i < 24; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const s = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers:{'X-Api-Key':heygenKey}
    })
    if (s.ok) {
      const sd = await s.json()
      if (sd.data?.status === 'completed') return sd.data.video_url
      if (sd.data?.status === 'failed') throw new Error('HeyGen render failed')
    }
  }
  throw new Error('HeyGen timeout — thử lại sau')
}

const EL_VOICES = [
  {id:'21m00Tcm4TlvDq8ikWAM',name:'Rachel (narrator)'},
  {id:'EXAVITQu4vr4xnSDxMaL',name:'Bella (young)'},
  {id:'ErXwobaYiN019PkySvjV',name:'Antoni (male)'},
  {id:'MF3mGyEYCl7XYWbV9V6O',name:'Elli (female)'},
  {id:'TxGEqnHWrfWFTfGW9XjX',name:'Josh (deep male)'},
  {id:'pNInz6obpgDQGcFmaJgB',name:'Adam (narration)'},
]

/* ═══ REPLICATE PIPELINE (Flux + Video + XTTS) ═══ */
async function replicateRun(model, input, key) {
  // Create prediction
  const r = await fetch('https://api.replicate.com/v1/predictions', {
    method:'POST',
    headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'wait'},
    body:JSON.stringify({model, input})
  })
  if (!r.ok) throw new Error('Replicate: ' + r.status)
  let pred = await r.json()
  // If not completed yet (Prefer:wait timeout), poll
  if (pred.status !== 'succeeded') {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const s = await fetch(pred.urls.get, { headers:{'Authorization':'Bearer '+key} })
      pred = await s.json()
      if (pred.status === 'succeeded') break
      if (pred.status === 'failed') throw new Error('Replicate model failed: ' + (pred.error || ''))
    }
  }
  if (pred.status !== 'succeeded') throw new Error('Replicate timeout')
  return pred.output
}

// Flux Schnell — fast, high quality ($0.003/run)
async function fluxImage(prompt, key) {
  const output = await replicateRun('black-forest-labs/flux-schnell', {
    prompt: 'Aesthetic TikTok vertical photo, 9:16 aspect ratio: ' + prompt,
    num_outputs: 1, aspect_ratio: '9:16', output_format: 'webp'
  }, key)
  const url = Array.isArray(output) ? output[0] : output
  if (!url) throw new Error('Flux no output')
  return await loadImg(url)
}

// Stable Video Diffusion — gen 4s video clip from image ($0.06/run)
async function replicateVideoClip(imageUrl, key) {
  const output = await replicateRun('stability-ai/stable-video-diffusion', {
    input_image: imageUrl,
    frames_per_second: 12,
    motion_bucket_id: 180 // more motion
  }, key)
  const url = Array.isArray(output) ? output[0] : output
  if (!url) throw new Error('SVD no output')
  return url // returns video URL
}

// XTTS v2 — natural TTS ($0.01/run, unlimited)
async function replicateVoice(text, key) {
  const output = await replicateRun('lucataco/xtts-v2', {
    text,
    language: 'en',
    speaker: 'https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQZI8UBIiMQMkFzU16VGR9VqWAHdE7/male.wav'
  }, key)
  const url = typeof output === 'string' ? output : output?.audio_out
  if (!url) throw new Error('XTTS no output')
  return url
}

// Load video element for canvas drawing
function loadVideo(url) {
  return new Promise((res, rej) => {
    const v = document.createElement('video')
    v.crossOrigin = 'anonymous'; v.muted = true; v.playsInline = true
    v.onloadeddata = () => res(v); v.onerror = () => rej()
    v.src = url; v.load()
  })
}

/* ═══ CANVAS RENDERER (text animations + stronger motion) ═══ */
const TEXT_ANIMS = ["static","typewriter","pop","slideUp","wave"]

function drawScene(ctx, W, H, img, text, sub, progress, transition, fontCSS = "'DM Sans',sans-serif", textAnim = "typewriter") {
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#08080e"; ctx.fillRect(0,0,W,H)

  // Transition
  let alpha=1,offX=0,offY=0,scale=1
  const ease = Math.min(1, progress*2.5)
  if (transition==="fade") alpha=Math.min(1,progress*3)
  else if (transition==="slideLeft") offX=(1-ease)*W
  else if (transition==="slideUp") offY=(1-ease)*H*.3
  else if (transition==="zoom") scale=.85+ease*.15
  ctx.save(); ctx.globalAlpha=alpha; ctx.translate(offX,offY)

  // Image/Video with STRONGER Ken Burns + subtle zoom pulse
  const isVid = img instanceof HTMLVideoElement
  const imgReady = isVid ? (img.readyState >= 2) : (img?.complete && img.naturalWidth)
  if (imgReady) {
    const kb = 1 + progress * 0.1
    const pulse = 1 + Math.sin(progress * Math.PI * 2) * 0.008
    const iw = isVid ? img.videoWidth : img.naturalWidth
    const ih = isVid ? img.videoHeight : img.naturalHeight
    const ratio = Math.max(W/iw,H/ih) * kb * scale * pulse
    const dw=iw*ratio, dh=ih*ratio
    const panX = Math.sin(progress * Math.PI) * W * 0.03
    ctx.drawImage(img, (W-dw)/2 - panX, (H-dh)/2, dw, dh)
  }

  // Gradient
  const grad=ctx.createLinearGradient(0,H*.35,0,H)
  grad.addColorStop(0,"rgba(8,8,14,0)")
  grad.addColorStop(.3,"rgba(8,8,14,.7)")
  grad.addColorStop(1,"rgba(8,8,14,.95)")
  ctx.fillStyle=grad; ctx.fillRect(0,H*.35,W,H*.65)

  // Text with animation
  if (text) {
    const textProgress = Math.max(0, (progress - 0.06) * 5) // 0→1
    const tp = Math.min(1, textProgress)
    ctx.fillStyle="#fff"
    ctx.font=`bold ${Math.round(W*.052)}px ${fontCSS}`
    ctx.textAlign="center"
    ctx.shadowColor="rgba(0,0,0,.9)"; ctx.shadowBlur=18

    // Word wrap
    const words=text.split(" "), lines=[]; let line=""
    for (const w of words) { const test=line?line+" "+w:w; if(ctx.measureText(test).width>W*.85&&line){lines.push(line);line=w}else line=test }
    if (line) lines.push(line)
    const lineH=W*.066, baseY=H*.69-(lines.length*lineH)/2

    if (textAnim === "typewriter") {
      // Typewriter: reveal characters over time
      const totalChars = text.length
      const visibleChars = Math.floor(tp * totalChars * 1.2)
      let charCount = 0
      ctx.globalAlpha = 1
      lines.forEach((l, i) => {
        const lineStart = charCount
        const lineEnd = charCount + l.length
        if (lineStart < visibleChars) {
          const visible = l.slice(0, Math.max(0, visibleChars - lineStart))
          ctx.fillText(visible, W/2, baseY + i*lineH)
        }
        charCount = lineEnd + 1
      })
    } else if (textAnim === "pop") {
      // Pop: scale from 0 to 1 with bounce
      const popScale = tp < 0.5 ? tp * 2 * 1.15 : 1 + (1 - tp) * 0.15
      ctx.globalAlpha = tp
      ctx.save()
      ctx.translate(W/2, baseY + (lines.length*lineH)/2)
      ctx.scale(Math.min(popScale, 1.15), Math.min(popScale, 1.15))
      ctx.translate(-W/2, -(baseY + (lines.length*lineH)/2))
      lines.forEach((l, i) => ctx.fillText(l, W/2, baseY + i*lineH))
      ctx.restore()
    } else if (textAnim === "slideUp") {
      // Slide up from bottom
      const slideOffset = (1 - tp) * H * 0.15
      ctx.globalAlpha = tp
      lines.forEach((l, i) => ctx.fillText(l, W/2, baseY + i*lineH + slideOffset))
    } else if (textAnim === "wave") {
      // Each word appears with slight delay
      ctx.globalAlpha = 1
      let wordIdx = 0
      const totalWords = text.split(" ").length
      lines.forEach((l, i) => {
        const lineWords = l.split(" ")
        let x = W/2 - ctx.measureText(l).width/2
        lineWords.forEach(w => {
          const wordProgress = Math.max(0, Math.min(1, (tp * totalWords - wordIdx) * 2))
          const wOff = (1 - wordProgress) * 20
          ctx.globalAlpha = wordProgress
          ctx.fillText(w, x + ctx.measureText(w).width/2, baseY + i*lineH + wOff)
          x += ctx.measureText(w + " ").width
          wordIdx++
        })
      })
    } else {
      // Static
      ctx.globalAlpha = tp
      lines.forEach((l, i) => ctx.fillText(l, W/2, baseY + i*lineH))
    }
    ctx.shadowBlur=0
  }

  // Subtext with fade
  if (sub) {
    const subP = Math.min(1, Math.max(0, (progress-.25)*4))
    ctx.globalAlpha = subP
    ctx.fillStyle=T.acT; ctx.font=`600 ${Math.round(W*.03)}px ${fontCSS}`
    const subOffset = (1 - subP) * 10
    ctx.fillText(sub, W/2, H*.86 + subOffset)
  }
  ctx.restore()
}

/* ═══ SORTABLE SCENE (dnd-kit) ═══ */
function SortableScene({ scene, index, total, sceneImg, uploadedImgs, onUpdate, onRemove, onRegen, onPreview, onSelectImg }) {
  const { attributes, listeners, setNodeRef, transform, transition:dndT, isDragging } = useSortable({ id:scene._id })
  const style = { transform:CSS.Transform.toString(transform), transition:dndT, opacity:isDragging?.5:1, padding:10, borderRadius:12, background:T.sf, border:`1px solid ${isDragging?T.ac:T.bdr}`, marginBottom:8, cursor:"pointer" }
  const isH=index===0, isC=index===total-1
  const tc=isH?T.or:isC?T.gn:T.bl, tb=isH?T.orS:isC?T.gnS:T.blS, tl=isH?"HOOK":isC?"CTA":"BODY"
  const thumb = sceneImg?.src || uploadedImgs[scene.image_index]?.url
  const curFont = FONTS.find(f=>f.id===scene.font) || FONTS[0]

  return (
    <div ref={setNodeRef} style={style} {...attributes} onClick={()=>onPreview(index)}>
      <div style={{display:"flex",gap:10}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div {...listeners} style={{cursor:"grab",fontSize:16,padding:"2px 4px",borderRadius:4,background:T.card,color:T.txD,userSelect:"none"}} title="Kéo thả">⠿</div>
          <div style={{width:52,height:52,borderRadius:8,overflow:"hidden",background:T.card,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {thumb ? <img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}}/> :
             sceneImg===null ? <span style={{animation:"spin 1s linear infinite",fontSize:14}}>⏳</span> :
             <span style={{fontSize:18}}>🖼</span>}
          </div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{padding:"2px 8px",borderRadius:6,background:tb,color:tc,fontSize:11,fontWeight:700}}>{tl}</span>
              <span style={{fontSize:12,color:T.txD}}>{scene.duration}s</span>
            </div>
            <div style={{display:"flex",gap:3}}>
              <button onClick={e=>{e.stopPropagation();onRegen(index)}} title="Gen lại ảnh" style={{width:28,height:28,borderRadius:6,border:`1px solid ${T.ac}40`,background:T.acS,color:T.acT,fontSize:12}}>🎨</button>
              <button onClick={e=>{e.stopPropagation();onRemove(index)}} title="Xoá (undo được)" style={{width:28,height:28,borderRadius:6,border:`1px solid ${T.rd}40`,background:T.rdS,color:T.rdT,fontSize:12}}>×</button>
            </div>
          </div>
          <input value={scene.text} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"text",e.target.value)} placeholder="Text overlay..."
            style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:curFont.css}} />
          <div style={{display:"flex",gap:6,marginTop:6}}>
            <input value={scene.subtext||""} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"subtext",e.target.value)} placeholder="Subtext..."
              style={{flex:1,padding:"5px 8px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12,outline:"none"}} />
            <input type="number" min={1} max={10} value={scene.duration} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"duration",Number(e.target.value)||3)}
              style={{width:44,padding:"5px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",textAlign:"center"}} />
            <select value={scene.transition} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"transition",e.target.value)}
              style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:11,outline:"none"}}>
              {TRANS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select value={scene.font||"dm"} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"font",e.target.value)}
              style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:11,outline:"none"}}>
              {FONTS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={scene.textAnim||"typewriter"} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate(index,"textAnim",e.target.value)}
              style={{padding:"5px 6px",borderRadius:6,border:`1px solid ${T.ac}30`,background:T.acS,color:T.acT,fontSize:11,outline:"none"}}>
              {TEXT_ANIMS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {scene.voice && <div style={{marginTop:4,padding:"4px 8px",borderRadius:6,background:T.card,fontSize:10,color:T.txD,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>🎙 {scene.voice}</div>}
          </div>
          {uploadedImgs.length>0 && (
            <div style={{display:"flex",gap:4,marginTop:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.txD}}>Ảnh:</span>
              {uploadedImgs.map((im,ii)=>(
                <div key={ii} onClick={e=>{e.stopPropagation();onSelectImg(index,ii)}}
                  style={{width:28,height:28,borderRadius:6,overflow:"hidden",border:!sceneImg&&scene.image_index===ii?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,cursor:"pointer",opacity:!sceneImg&&scene.image_index===ii?1:.4}}>
                  <img src={im.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══ TOAST ═══ */
function Toast({msg,type}) {
  if (!msg) return null
  const bg = type==="ok"?T.gn:type==="err"?T.rd:type==="warn"?T.or:T.ac
  return <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",padding:"10px 24px",borderRadius:24,background:bg,color:"#fff",fontSize:13,fontWeight:600,zIndex:999,maxWidth:"90vw",textAlign:"center",animation:"slideIn .25s ease",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>{msg}</div>
}

/* ═══ OFFLINE BANNER ═══ */
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off) }
  }, [])
  if (!offline) return null
  return <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 16px",background:T.rd,color:"#fff",fontSize:13,fontWeight:600,textAlign:"center",zIndex:999}}>⚠️ Mất kết nối mạng — AI sẽ không hoạt động cho đến khi có mạng lại</div>
}

/* ═══ MAIN APP ═══ */
export default function App() {
  const [step,setStep] = useState(() => localStorage.getItem("pod-v") ? "1" : "0")
  const [showSettings,setShowSettings] = useState(false)
  const [prov,setProv] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.p||"auto"}catch{return"auto"} })
  const [apiKey,setApiKey] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.k||""}catch{return""} })
  const [inputMode,setInputMode] = useState("upload")
  const [images,setImages] = useState([])
  const [htmlSrc,setHtmlSrc] = useState("")
  const [ideaText,setIdeaText] = useState("")
  const [productInfo,setProductInfo] = useState("")
  const [loading,setLoading] = useState(false)
  const [loadMsg,setLoadMsg] = useState("")
  const [toast,setToast] = useState({m:"",t:""})
  const [ideas,setIdeas] = useState(null)
  const [scenes,setScenes] = useState([])
  const [sceneImgs,setSceneImgs] = useState({})
  const [isPlaying,setIsPlaying] = useState(false)
  const [currentTime,setCurrentTime] = useState(0)
  const [isRecording,setIsRecording] = useState(false)
  const [videoBlob,setVideoBlob] = useState(null)
  const [extData,setExtData] = useState(null)
  const [autoGenning,setAutoGenning] = useState(false)
  const [undoStack,setUndoStack] = useState([])
  const [audioUrl,setAudioUrl] = useState(null)
  const [voiceUrl,setVoiceUrl] = useState(null) // generated voiceover
  const [voiceGenning,setVoiceGenning] = useState(false)
  const [elKey,setElKey] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.el||""}catch{return""} })
  const [dalleKey,setDalleKey] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.dalle||""}catch{return""} })
  const [heygenKey,setHeygenKey] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.heygen||""}catch{return""} })
  const [replicateKey,setReplicateKey] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.rep||""}catch{return""} })
  const [sceneVideos,setSceneVideos] = useState({}) // idx → video element (from Replicate)
  const [proRendering,setProRendering] = useState(false)
  const [voiceId,setVoiceId] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-c"))?.vid||"21m00Tcm4TlvDq8ikWAM"}catch{return"21m00Tcm4TlvDq8ikWAM"} })
  const [heygenUrl,setHeygenUrl] = useState(null)
  const [heygenLoading,setHeygenLoading] = useState(false)
  const [templates,setTemplates] = useState(() => { try{return JSON.parse(localStorage.getItem("pod-tpl"))||[]}catch{return[]} })
  const [showTpl,setShowTpl] = useState(false)
  const [lang,setLang] = useState(() => localStorage.getItem("pod-lang") || "vi")
  const [converting,setConverting] = useState(false)
  const [mp4Blob,setMp4Blob] = useState(null)

  const L = lang === "en" ? {
    title:"POD Video Maker", start:"Get Started →", upload:"Upload images", pasteHtml:"Paste HTML", aiIdea:"AI Suggest",
    genIdeas:"🎬 Generate Video Ideas", chooseIdea:"Choose 1 → AI generates images:", rendering:"⏺ Rendering...",
    render:"⏺ Render video", download:"⬇️ DOWNLOAD VIDEO (.webm)", downloadMp4:"⬇️ DOWNLOAD MP4",
    convertMp4:"🔄 Convert to MP4", converting:"Converting...", addMusic:"Add music (optional)", hasMusic:"Music added ✓",
    scenes:"Scenes", drag:"drag to reorder", undo:"↩ Undo", add:"+ Add", save:"Save", close:"Close",
    saveTpl:"⭐ Save template", exportPng:"🖼 Export storyboard PNG", proTip:"Want pro video? 1 click = copy + open tool",
    copied:"Copied!", promptCopied:"Prompt copied → Ctrl+V in tool", saved:"Saved!", genDone:"Done!",
    extractDone:"Extracted!", imgGenDone:"AI images generated!", deleted:"Deleted. Press Undo to restore.", undone:"Undone!",
    welcome:"Create TikTok videos for POD products in 3 steps.\nAI suggests ideas, generates images, builds video.",
    free:"Free.", offline:"⚠️ No internet — AI won't work until connection is restored",
    step1:"Input", step2:"Choose idea", step3:"Build & Download", retry:"Auto-retry if error...",
    tipFlow:"Download → CapCut → add sound/caption → export MP4 → post TikTok!",
  } : {
    title:"POD Video Maker", start:"Bắt đầu →", upload:"Upload ảnh", pasteHtml:"Paste HTML", aiIdea:"AI gợi ý",
    genIdeas:"🎬 Tạo ý tưởng video", chooseIdea:"Chọn 1 → AI tự gen ảnh + dựng video:", rendering:"⏺ Đang render...",
    render:"⏺ Render video", download:"⬇️ TẢI VIDEO (.webm)", downloadMp4:"⬇️ TẢI MP4",
    convertMp4:"🔄 Chuyển sang MP4", converting:"Đang chuyển đổi...", addMusic:"Thêm nhạc (tuỳ chọn)", hasMusic:"Có nhạc nền ✓",
    scenes:"Scenes", drag:"kéo thả sắp xếp", undo:"↩ Undo", add:"+ Thêm", save:"Lưu", close:"Đóng",
    saveTpl:"⭐ Lưu template", exportPng:"🖼 Tải storyboard PNG", proTip:"Video pro hơn? 1 click = copy + mở tool",
    copied:"Đã copy!", promptCopied:"Prompt đã copy → Ctrl+V", saved:"Đã lưu!", genDone:"Gen xong!",
    extractDone:"Trích xuất xong!", imgGenDone:"Ảnh AI đã gen!", deleted:"Đã xoá. Bấm Undo để hoàn tác.", undone:"Đã undo!",
    welcome:"Tạo video TikTok cho sản phẩm POD trong 3 bước.\nAI gợi ý, gen ảnh, dựng video.",
    free:"Miễn phí.", offline:"⚠️ Mất kết nối mạng — AI sẽ không hoạt động",
    step1:"Nhập liệu", step2:"Chọn ý tưởng", step3:"Dựng & Tải", retry:"Auto-retry nếu lỗi...",
    tipFlow:"Tải → CapCut → thêm sound/caption → export MP4 → đăng TikTok!",
  }
  const toggleLang = () => { const nl = lang==="vi"?"en":"vi"; setLang(nl); localStorage.setItem("pod-lang",nl) }

  // ── MP4 Conversion via FFmpeg.wasm (lazy loaded) ──
  const convertToMP4 = async () => {
    if (!videoBlob || converting) return
    setConverting(true); setMp4Blob(null)
    try {
      const ffmpegUrl = 'https://esm.sh/@ffmpeg/ffmpeg@0.12.10'
      const utilUrl = 'https://esm.sh/@ffmpeg/util@0.12.1'
      const { FFmpeg } = await import(ffmpegUrl)
      const { fetchFile, toBlobURL } = await import(utilUrl)
      const ffmpeg = new FFmpeg()
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      await ffmpeg.writeFile('input.webm', await fetchFile(videoBlob))
      await ffmpeg.exec(['-i','input.webm','-c:v','libx264','-preset','ultrafast','-crf','25','-pix_fmt','yuv420p','output.mp4'])
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data.buffer], { type:'video/mp4' })
      setMp4Blob(blob)
      notify("MP4 sẵn sàng!", "ok")
    } catch (e) {
      notify("MP4 conversion lỗi — dùng CapCut để convert", "warn")
    }
    setConverting(false)
  }
  const downloadMP4 = () => { if(!mp4Blob)return; const u=URL.createObjectURL(mp4Blob); const a=document.createElement("a"); a.href=u; a.download=`pod-video-${Date.now()}.mp4`; a.click(); URL.revokeObjectURL(u) }

  const canvasRef=useRef(); const animRef=useRef(); const startTimeRef=useRef(0); const recChunksRef=useRef([]); const audioRef=useRef()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{distance:5} }))

  const notify = (m,t="info") => { setToast({m,t}); setTimeout(()=>setToast({m:"",t:""}),2500) }
  const copy = t => { navigator.clipboard.writeText(t); notify("Đã copy!","ok") }
  const copyOpen = (p,u) => { navigator.clipboard.writeText(p); window.open(u,"_blank"); notify("Prompt đã copy → Ctrl+V","ok") }
  const saveSettings = () => { localStorage.setItem("pod-c",JSON.stringify({p:prov,k:apiKey,el:elKey,dalle:dalleKey,heygen:heygenKey,rep:replicateKey,vid:voiceId})); setShowSettings(false); notify(L.saved,"ok") }

  // ── Templates ──
  const saveTemplate = (idea) => {
    const tpl = { id:Date.now(), title:idea.title, format:idea.format, scenes:idea.scenes?.map(s=>({text:s.text,subtext:s.subtext,duration:s.duration,transition:s.transition,font:s.font||"dm",ai_bg:s.ai_bg})), created:new Date().toLocaleDateString("vi") }
    const updated = [tpl,...templates].slice(0,20)
    setTemplates(updated); localStorage.setItem("pod-tpl",JSON.stringify(updated))
    notify("⭐ Đã lưu template!","ok")
  }
  const deleteTemplate = id => {
    const updated = templates.filter(t=>t.id!==id)
    setTemplates(updated); localStorage.setItem("pod-tpl",JSON.stringify(updated))
  }
  const applyTemplate = tpl => {
    let idC=0
    const built = tpl.scenes.map(s => ({_id:"sc-"+(idC++), ...s, image_index:0}))
    setScenes(built); setStep("3"); setShowTpl(false)
    notify("Đã áp dụng template — chỉnh ảnh + text rồi render","ok")
  }

  // ── Upload ──
  const handleUpload = e => { Array.from(e.target.files).forEach(f => { const u=URL.createObjectURL(f); const img=new Image(); img.onload=()=>setImages(p=>[...p,{url:u,img}]); img.src=u }) }
  const handleAudio = e => { const f=e.target.files?.[0]; if(f){setAudioUrl(URL.createObjectURL(f)); notify("Đã thêm nhạc nền!","ok")} }

  // ── AI Actions ──
  const parseHTML = async () => {
    if(!htmlSrc.trim()){notify("Paste HTML trước","warn");return} setLoading(true);setLoadMsg("AI đang đọc HTML...")
    try{ const info=await aiText(prov,apiKey,"Extract product info from HTML. Return: Product, Description, Price, Niche, Features, Image URLs.\nHTML:\n"+htmlSrc.slice(0,8000)); setProdInfo(info)
      const urls=info.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi)||[]; for(const u of urls.slice(0,3)){try{const img=await loadImg(u);setImages(p=>[...p,{url:u,img}])}catch{}}
      notify("Trích xuất xong!","ok") }catch(e){notify(e.message,"err")} setLoading(false)
  }
  const setProdInfo = setProductInfo // alias

  const genFromIdea = async () => {
    if(!ideaText.trim()){notify("Nhập ý tưởng","warn");return} setLoading(true);setLoadMsg("AI đang research trend...")
    try{ const info=await aiText(prov,apiKey,`POD trend expert TikTok US. Idea:"${ideaText}". Generate: Product type, Niche, Top 5 quotes, Why viral, TikTok trend, Visual style.`); setProductInfo(info); notify("Gen xong!","ok") }catch(e){notify(e.message,"err")} setLoading(false)
  }

  const genIdeas = async () => {
    if(!images.length&&!productInfo){notify("Cần ảnh hoặc thông tin SP","warn");return} setLoading(true);setLoadMsg("AI đang tạo 4 ý tưởng (auto-retry)...")
    try{
      const d=await aiJSON(prov,apiKey,`Viral TikTok video strategist for POD US. You create COMPLETE video plans including voiceover scripts.\nPRODUCT:${productInfo||"POD product"}\nIMAGES:${images.length}\nFonts: dm(clean), playfair(elegant), space(geometric), marker(handwritten), bebas(tall condensed).\nText animations: typewriter(type in), pop(bounce scale), slideUp(slide from bottom), wave(word by word), static.\nGenerate 4 concepts. ONLY valid JSON:\n{"ideas":[{"title":"name","format":"Gift Idea/Humor/Before-After/Trend/Unboxing/Process","description":"2 sentences","viral_score":8,"why":"1 sentence","scenes":[{"duration":3,"image_index":0,"text":"max 8 words English overlay","subtext":"optional small text","transition":"fade","font":"best font id","textAnim":"best animation","voice":"VOICEOVER SCRIPT for narrator to speak during this scene. Natural, casual, engaging TikTok narration style. 1-2 short sentences.","ai_bg":"Detailed Pollinations prompt: beautiful 9:16 vertical scene. Always provide."}],"total_duration":15,"caption":"TikTok <150 chars emoji","hashtags":["t1","t2","t3","t4","t5"],"sound":"trending sound","full_voiceover":"Complete voiceover script all scenes combined, natural flow","invideo_prompt":"Full InVideo AI prompt for TikTok 9:16. Detailed.","kling_prompt":"Kling AI: ONE cinematic scene."}]}\nRules:image_index 0-${Math.max(0,images.length-1)},first=hook 3s,last=CTA,15-30s,2-5s each. ALWAYS provide ai_bg + voice + font + textAnim. Voice should sound like popular TikTok narration - casual, engaging, with personality.`)
      if(!d?.ideas?.length)throw new Error("Thử lại"); setIdeas(d);setStep("2")
    }catch(e){notify(e.message,"err")} setLoading(false)
  }

  const selectIdea = async idx => {
    const idea=ideas.ideas[idx]; if(!idea?.scenes)return; let idC=0
    const built=idea.scenes.map(s=>({_id:"sc-"+(idC++),duration:s.duration||3,image_index:Math.min(s.image_index||0,Math.max(0,images.length-1)),text:s.text||"",subtext:s.subtext||"",transition:s.transition||"fade",ai_bg:s.ai_bg||"",font:FONTS.find(f=>f.id===s.font)?s.font:"dm",textAnim:TEXT_ANIMS.includes(s.textAnim)?s.textAnim:"typewriter",voice:s.voice||""}))
    setScenes(built);setExtData({inv:idea.invideo_prompt,kl:idea.kling_prompt,cap:idea.caption,ht:idea.hashtags,snd:idea.sound,title:idea.title,format:idea.format,rawIdea:idea,fullVoice:idea.full_voiceover||""});setVideoBlob(null);setMp4Blob(null);setSceneImgs({});setSceneVideos({});setUndoStack([]);setVoiceUrl(null);setStep("3")
    setAutoGenning(true)
    for(let i=0;i<built.length;i++){if(built[i].ai_bg){try{const img=await generateImage(built[i].ai_bg,dalleKey,replicateKey);setSceneImgs(p=>({...p,[i]:img}))}catch{}}}
    setAutoGenning(false);notify(dalleKey?L.imgGenDone+" (DALL-E 3)":L.imgGenDone,"ok")
    // Auto-gen voiceover audio
    const fullScript=idea.full_voiceover||built.map(s=>s.voice).filter(Boolean).join('. ')
    if(fullScript){setVoiceGenning(true);const url=await generateTTS(fullScript,elKey,voiceId);if(url){setVoiceUrl(url);notify("🎙 Voiceover ready!","ok")}else{notify("Voice: preview only (add ElevenLabs key for HD)","info")};setVoiceGenning(false)}
  }

  // ── Scene ops ──
  const updateScene = (i,k,v) => setScenes(p=>p.map((s,j)=>j===i?{...s,[k]:v}:s))
  const removeScene = i => { setUndoStack(p=>[...p,{type:"rm",scene:scenes[i],index:i}]); setScenes(p=>p.filter((_,j)=>j!==i)); notify("Đã xoá. Bấm Undo để hoàn tác.","warn") }
  const undo = () => { if(!undoStack.length)return; const last=undoStack[undoStack.length-1]; setUndoStack(p=>p.slice(0,-1)); if(last.type==="rm"){setScenes(p=>{const a=[...p];a.splice(last.index,0,last.scene);return a});notify("Đã undo!","ok")} }
  const addScene = () => setScenes(p=>[...p,{_id:"sc-"+Date.now(),duration:3,image_index:0,text:"",subtext:"",transition:"fade",ai_bg:"",font:"dm",textAnim:"typewriter",voice:""}])
  const regenSceneImg = async i => { const sc=scenes[i]; if(!sc?.ai_bg)return; setSceneImgs(p=>({...p,[i]:null})); try{const img=await loadImg(pollImg(sc.ai_bg));setSceneImgs(p=>({...p,[i]:img}));notify("Gen lại OK","ok")}catch{notify("Lỗi gen ảnh","err")} }
  const selectSceneImg = (si,ii) => { updateScene(si,"image_index",ii); setSceneImgs(p=>{const n={...p};delete n[si];return n}) }
  const handleDragEnd = e => { const{active,over}=e; if(active.id!==over?.id){setScenes(p=>{const oi=p.findIndex(s=>s._id===active.id);const ni=p.findIndex(s=>s._id===over.id);return arrayMove(p,oi,ni)})} }

  const totalDuration = scenes.reduce((s,x)=>s+(x.duration||3),0)
  const getSceneImage = (sc,i) => {
    // Video clip (from Replicate) > static AI image > uploaded image
    const vid = sceneVideos[i]
    if (vid) { if (vid.paused) vid.play().catch(()=>{}); return vid }
    return sceneImgs[i] || images[sc.image_index]?.img || null
  }
  const getSceneAt = t => { let a=0; for(let i=0;i<scenes.length;i++){const d=scenes[i].duration||3;if(t<a+d)return{idx:i,progress:(t-a)/d};a+=d} return{idx:scenes.length-1,progress:1} }

  const renderFrame = useCallback((t,forRec=false) => {
    const cv=canvasRef.current; if(!cv||!scenes.length)return; const ctx=cv.getContext("2d"),W=cv.width,H=cv.height
    const{idx,progress}=getSceneAt(t); const sc=scenes[idx]; if(!sc)return
    const fontCSS = (FONTS.find(f=>f.id===sc.font) || FONTS[0]).css
    drawScene(ctx,W,H,getSceneImage(sc,idx),sc.text,sc.subtext,progress,sc.transition,fontCSS,sc.textAnim||"typewriter")
    if(!forRec){ctx.fillStyle=T.ac;ctx.fillRect(0,H-4,(t/Math.max(totalDuration,.1))*W,4)}
  },[scenes,images,sceneImgs,totalDuration])

  // ── LIVE PREVIEW on scene edit ──
  useEffect(() => {
    if (step==="3" && scenes.length && !isPlaying && !isRecording) {
      const timer = setTimeout(() => renderFrame(currentTime), 100)
      return () => clearTimeout(timer)
    }
  }, [scenes, sceneImgs, step, isPlaying, isRecording])

  // ── Init canvas ──
  useEffect(() => { if(step==="3"&&scenes.length)setTimeout(()=>renderFrame(0),200) }, [step])

  const previewScene = i => { setIsPlaying(false);cancelAnimationFrame(animRef.current);let t=0;for(let j=0;j<i;j++)t+=scenes[j]?.duration||3;setCurrentTime(t+.3);renderFrame(t+.3) }
  const play = () => {
    if(!scenes.length)return; setIsPlaying(true)
    if(audioRef.current&&audioUrl){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{})}
    startTimeRef.current=performance.now()-currentTime*1000
    const loop=n=>{const e=(n-startTimeRef.current)/1000;if(e>=totalDuration){setIsPlaying(false);setCurrentTime(0);renderFrame(0);if(audioRef.current)audioRef.current.pause();return};setCurrentTime(e);renderFrame(e);animRef.current=requestAnimationFrame(loop)};animRef.current=requestAnimationFrame(loop)
  }
  const pause = () => { setIsPlaying(false);cancelAnimationFrame(animRef.current);if(audioRef.current)audioRef.current.pause() }

  // ── Record ──
  const voiceRef = useRef()
  const recordVideo = () => {
    if(isRecording||!scenes.length)return; const cv=canvasRef.current; if(!cv)return
    setIsRecording(true);setVideoBlob(null);setMp4Blob(null);recChunksRef.current=[]
    const cs=cv.captureStream(30)
    // Mix audio: create FRESH audio elements to avoid createMediaElementSource crash
    const ac=new AudioContext(); const dest=ac.createMediaStreamDestination()
    let hasAudio=false
    if(audioUrl){try{const a=new Audio(audioUrl);a.crossOrigin="anonymous";a.loop=true;const src=ac.createMediaElementSource(a);const gain=ac.createGain();gain.gain.value=0.3;src.connect(gain);gain.connect(dest);a.play().catch(()=>{});hasAudio=true}catch{}}
    if(voiceUrl){try{const v=new Audio(voiceUrl);v.crossOrigin="anonymous";const src2=ac.createMediaElementSource(v);src2.connect(dest);v.play().catch(()=>{});hasAudio=true}catch{}}
    const fs = hasAudio ? new MediaStream([...cs.getVideoTracks(),...dest.stream.getAudioTracks()]) : cs
    const rec=new MediaRecorder(fs,{mimeType:"video/webm;codecs=vp9",videoBitsPerSecond:8e6})
    rec.ondataavailable=e=>{if(e.data.size>0)recChunksRef.current.push(e.data)}
    rec.onstop=()=>{setVideoBlob(new Blob(recChunksRef.current,{type:"video/webm"}));setIsRecording(false);try{ac.close()}catch{};notify("Video sẵn sàng!","ok")}
    rec.start();const st=performance.now()
    const loop=n=>{const e=(n-st)/1000;if(e>=totalDuration){renderFrame(totalDuration-.01,true);rec.stop();return};renderFrame(e,true);animRef.current=requestAnimationFrame(loop)};animRef.current=requestAnimationFrame(loop)
  }
  const downloadVideo = () => { if(!videoBlob)return;const u=URL.createObjectURL(videoBlob);const a=document.createElement("a");a.href=u;a.download=`pod-video-${Date.now()}.webm`;a.click();URL.revokeObjectURL(u) }

  // ── HeyGen AI Avatar Video ──
  const genHeyGenVideo = async () => {
    if (!heygenKey) { notify("Nhập HeyGen API key trong ⚙️ Settings","warn"); return }
    const script = extData?.fullVoice || scenes.map(s=>s.voice).filter(Boolean).join('. ')
    if (!script) { notify("Không có voiceover script","warn"); return }
    setHeygenLoading(true); setHeygenUrl(null)
    try {
      const url = await generateHeyGenVideo(script, heygenKey)
      setHeygenUrl(url)
      notify("🎭 AI Avatar video sẵn sàng!","ok")
    } catch (e) { notify("HeyGen: " + e.message, "err") }
    setHeygenLoading(false)
  }

  // ── Replicate Pro Pipeline: gen video clips per scene ──
  const runProPipeline = async () => {
    if (!replicateKey) { notify("Nhập Replicate API token trong ⚙️ Settings","warn"); return }
    if (!scenes.length) return
    setProRendering(true)
    notify("🚀 Pro Pipeline: đang gen video clips + voice (1-3 phút)...","info")
    try {
      // Step 1: Generate video clips from scene images
      for (let i = 0; i < scenes.length; i++) {
        const img = sceneImgs[i]
        if (img?.src) {
          try {
            notify(`🎬 Scene ${i+1}/${scenes.length}: gen video clip...`,"info")
            const videoUrl = await replicateVideoClip(img.src, replicateKey)
            const videoEl = await loadVideo(videoUrl)
            setSceneVideos(p => ({...p, [i]: videoEl}))
          } catch (e) { /* keep static image as fallback */ }
        }
      }
      // Step 2: Generate XTTS voice if no voice yet
      if (!voiceUrl) {
        const script = extData?.fullVoice || scenes.map(s=>s.voice).filter(Boolean).join('. ')
        if (script) {
          try {
            notify("🎙 Gen XTTS voice...","info")
            const url = await replicateVoice(script, replicateKey)
            if (url) setVoiceUrl(url)
          } catch {}
        }
      }
      notify("🚀 Pro Pipeline hoàn tất! Bấm Render.","ok")
    } catch (e) { notify("Pipeline lỗi: " + e.message, "err") }
    setProRendering(false)
  }

  // ── Export Storyboard PNG ──
  const exportStoryboard = () => {
    const cols=Math.min(scenes.length,3), rows=Math.ceil(scenes.length/cols)
    const thumbW=360, thumbH=640, pad=20
    const cv=document.createElement("canvas")
    cv.width=cols*thumbW+(cols+1)*pad; cv.height=rows*thumbH+(rows+1)*pad+60
    const ctx=cv.getContext("2d")
    ctx.fillStyle="#0a0b10"; ctx.fillRect(0,0,cv.width,cv.height)
    ctx.fillStyle="#fff"; ctx.font="bold 24px 'DM Sans',sans-serif"; ctx.fillText("Storyboard — POD Video Maker",pad,36)
    scenes.forEach((sc,i) => {
      const col=i%cols, row=Math.floor(i/cols)
      const x=pad+col*(thumbW+pad), y=60+pad+row*(thumbH+pad)
      const fontCSS=(FONTS.find(f=>f.id===sc.font)||FONTS[0]).css
      // Create temp canvas for scene
      const tc=document.createElement("canvas"); tc.width=thumbW; tc.height=thumbH
      drawScene(tc.getContext("2d"),thumbW,thumbH,getSceneImage(sc,i),sc.text,sc.subtext,.5,sc.transition,fontCSS,sc.textAnim||"static")
      ctx.drawImage(tc,x,y)
      // Label
      ctx.fillStyle=T.ac; ctx.font="bold 14px 'DM Sans',sans-serif"
      ctx.fillText(`Scene ${i+1} · ${sc.duration}s · ${i===0?"HOOK":i===scenes.length-1?"CTA":"BODY"}`,x,y+thumbH+16)
    })
    const link=document.createElement("a"); link.download=`storyboard-${Date.now()}.png`; link.href=cv.toDataURL("image/png"); link.click()
    notify("Đã tải storyboard PNG!","ok")
  }

  const currentProv = PROVS.find(p=>p.id===prov)

  /* ═══ RENDER ═══ */
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <Toast msg={toast.m} type={toast.t}/>
      <OfflineBanner/>
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop preload="auto"/>}
      {voiceUrl && <audio ref={voiceRef} src={voiceUrl} preload="auto"/>}

      {/* HEADER */}
      <header style={{padding:"10px 16px",borderBottom:`1px solid ${T.bdr}`,background:T.sf,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:920,margin:"0 auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${T.ac},${T.pk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🎬</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>POD Video Maker</div></div>
          {templates.length>0 && <button onClick={()=>setShowTpl(!showTpl)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.or}30`,background:T.orS,color:T.orT,fontSize:11,fontWeight:600}}>⭐ {templates.length}</button>}
          <button onClick={toggleLang} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:11,fontWeight:600}} title="Switch language">{lang==="vi"?"EN":"VI"}</button>
          <button onClick={()=>setShowSettings(!showSettings)} style={{padding:"6px 14px",borderRadius:8,background:T.acS,border:`1px solid ${T.ac}30`,color:T.acT,fontSize:12,fontWeight:600}}>{currentProv?.icon} {currentProv?.name}</button>
          {step>"1" && <button onClick={()=>{setStep("1");setIdeas(null);setScenes([]);setVideoBlob(null);setMp4Blob(null);setSceneImgs({});setSceneVideos({});setUndoStack([]);setVoiceUrl(null)}} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:12}}>↺ Mới</button>}
        </div>
      </header>

      <main style={{maxWidth:920,margin:"0 auto",padding:"12px 16px 32px"}}>
        {/* Settings */}
        {showSettings && <div className="fu" style={{marginBottom:16,padding:16,borderRadius:12,background:T.sf,border:`1px solid ${T.bdr}`}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acT,marginBottom:12}}>⚙️ AI Provider</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:12}}>
            {PROVS.map(p=><button key={p.id} onClick={()=>setProv(p.id)} style={{padding:"10px",borderRadius:10,border:prov===p.id?`2px solid ${T.ac}`:`1px solid ${T.bdr}`,background:prov===p.id?T.acS:"transparent",textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:600,color:prov===p.id?T.acT:T.tx}}>{p.icon} {p.name}</div>
              <div style={{fontSize:11,color:T.txD,marginTop:2}}>{p.h}</div>
              {!p.nk&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:T.gnS,color:T.gnT,marginTop:4,display:"inline-block"}}>No key</span>}
            </button>)}
          </div>
          {currentProv?.nk && <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste API key..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>}
          <div style={{fontSize:12,fontWeight:600,color:T.tx2,marginTop:8,marginBottom:4}}>🎙 Voiceover (ElevenLabs — free 10K chars/tháng)</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <input type="password" value={elKey} onChange={e=>setElKey(e.target.value)} placeholder="ElevenLabs API key (elevenlabs.io)" style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
            <select value={voiceId} onChange={e=>setVoiceId(e.target.value)} style={{padding:"10px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none"}}>
              {EL_VOICES.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div style={{fontSize:12,fontWeight:700,color:T.orT,marginTop:14,marginBottom:8,paddingTop:10,borderTop:`1px solid ${T.bdr}`}}>⭐ Premium (tuỳ chọn — chất lượng cao hơn)</div>

          <div style={{fontSize:11,color:T.txD,marginBottom:4}}>🎨 DALL-E 3 — ảnh đẹp hơn Pollinations (OpenAI key, ~$0.04/ảnh)</div>
          <input type="password" value={dalleKey} onChange={e=>setDalleKey(e.target.value)} placeholder="OpenAI API key cho DALL-E 3 (tuỳ chọn)" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>

          <div style={{fontSize:11,color:T.txD,marginBottom:4}}>🎭 HeyGen — AI avatar/người thật nói trong video ($24/tháng)</div>
          <input type="password" value={heygenKey} onChange={e=>setHeygenKey(e.target.value)} placeholder="HeyGen API key (heygen.com)" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{fontSize:12,fontWeight:600,color:T.gnT,marginTop:4,marginBottom:4}}>🚀 Replicate Pipeline — video clips + Flux ảnh + XTTS voice ($0.05/video)</div>
          <input type="password" value={replicateKey} onChange={e=>setReplicateKey(e.target.value)} placeholder="Replicate API token (replicate.com/account/api-tokens)" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

          <div style={{padding:"10px",borderRadius:8,background:T.card,fontSize:11,color:T.txD,lineHeight:1.6,marginBottom:12}}>
            <strong style={{color:T.gnT}}>FREE</strong>: Pollinations ảnh + StreamElements voice — dùng ngay, $0<br/>
            <strong style={{color:T.acT}}>FREE tier</strong>: ElevenLabs (10K chars) + Groq/Gemini — cần đăng ký lấy key<br/>
            <strong style={{color:T.orT}}>Premium</strong>: DALL-E 3 ($0.04/ảnh) + HeyGen ($24/tháng) — chất lượng pro
          </div>
          <div style={{display:"flex",gap:8}}><button onClick={saveSettings} style={{padding:"10px 24px",borderRadius:10,background:T.ac,color:"#fff",fontSize:13,fontWeight:600,border:"none"}}>Lưu</button><button onClick={()=>setShowSettings(false)} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:13}}>Đóng</button></div>
        </div>}

        {/* Templates panel */}
        {showTpl && <div className="fu" style={{marginBottom:16,padding:16,borderRadius:12,background:T.sf,border:`1px solid ${T.bdr}`}}>
          <div style={{fontSize:13,fontWeight:700,color:T.orT,marginBottom:10}}>⭐ Templates đã lưu</div>
          {templates.map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:T.card,marginBottom:6}}>
            <div><span style={{fontWeight:600}}>{t.title}</span> <span style={{fontSize:11,color:T.txD}}>{t.format} · {t.scenes?.length} scenes · {t.created}</span></div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>applyTemplate(t)} style={{padding:"5px 12px",borderRadius:6,background:T.acS,border:`1px solid ${T.ac}30`,color:T.acT,fontSize:11}}>Dùng</button>
              <button onClick={()=>deleteTemplate(t.id)} style={{padding:"5px 8px",borderRadius:6,border:`1px solid ${T.rd}40`,color:T.rdT,fontSize:11}}>×</button>
            </div>
          </div>)}
          <button onClick={()=>setShowTpl(false)} style={{marginTop:4,padding:"8px 16px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:12}}>Đóng</button>
        </div>}

        {/* Steps */}
        {step>="1" && <div style={{display:"flex",gap:2,marginBottom:16}}>{[{n:"1",l:L.step1},{n:"2",l:L.step2},{n:"3",l:L.step3}].map((s,i)=><div key={s.n} style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:26,height:26,borderRadius:8,background:step>=s.n?T.ac:T.el,color:step>=s.n?"#fff":T.txD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{step>s.n?"✓":s.n}</div>
          <span style={{fontSize:12,fontWeight:600,color:step>=s.n?T.tx:T.txD}}>{s.l}</span>
          {i<2&&<div style={{flex:1,height:2,borderRadius:1,background:step>s.n?T.ac:T.bdr,minWidth:8}}/>}
        </div>)}</div>}

        {/* Welcome */}
        {step==="0" && <div className="fu" style={{textAlign:"center",padding:"48px 20px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🎬</div>
          <h1 style={{fontSize:24,fontWeight:800,marginBottom:8}}>POD Video Maker</h1>
          <p style={{fontSize:15,color:T.tx2,maxWidth:480,margin:"0 auto 24px",lineHeight:1.7}}>Tạo video TikTok cho sản phẩm POD trong 3 bước.<br/>AI gợi ý, gen ảnh, dựng video. <strong style={{color:T.gnT}}>Miễn phí.</strong></p>
          <button onClick={()=>{localStorage.setItem("pod-v","1");setStep("1")}} style={{padding:"16px 48px",borderRadius:14,background:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:16,fontWeight:700,border:"none",boxShadow:"0 8px 32px rgba(124,92,252,.3)"}}>Bắt đầu →</button>
        </div>}

        {/* Step 1 */}
        {step==="1" && <div className="fu">
          <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:`2px solid ${T.bdr}`,overflow:"auto"}}>{[{id:"upload",i:"📸",l:"Upload ảnh"},{id:"html",i:"🔗",l:"Paste HTML"},{id:"idea",i:"💡",l:"AI gợi ý"}].map(m=><button key={m.id} onClick={()=>setInputMode(m.id)} style={{padding:"12px 18px",borderBottom:inputMode===m.id?`3px solid ${T.ac}`:"3px solid transparent",color:inputMode===m.id?T.acT:T.txD,fontSize:13,fontWeight:600,background:"none",whiteSpace:"nowrap",border:"none"}}>{m.i} {m.l}</button>)}</div>
          {inputMode==="upload" && <label style={{display:"flex",flexDirection:"column",alignItems:"center",padding:images.length?"16px":"40px 20px",borderRadius:14,border:`2px dashed ${T.bdrL}`,background:T.sf,cursor:"pointer"}}><input type="file" accept="image/*" multiple onChange={handleUpload} style={{display:"none"}}/><div style={{fontSize:32,marginBottom:8}}>📸</div><div style={{fontSize:14,color:T.tx2}}>Click upload ảnh</div></label>}
          {inputMode==="html" && <div><div style={{padding:"10px 14px",borderRadius:10,background:T.orS,border:`1px solid ${T.or}25`,fontSize:12,color:T.orT,marginBottom:10,lineHeight:1.6}}>Mở trang SP → <b>Ctrl+U</b> → <b>Ctrl+A</b> → <b>Ctrl+C</b> → Paste ↓</div><textarea value={htmlSrc} onChange={e=>setHtmlSrc(e.target.value)} placeholder="Paste HTML..." rows={5} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"monospace"}}/><button onClick={parseHTML} disabled={loading} style={{width:"100%",marginTop:8,padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:loading?.5:1}}>{loading?"⏳":"🔍 AI đọc HTML"}</button></div>}
          {inputMode==="idea" && <div><textarea value={ideaText} onChange={e=>setIdeaText(e.target.value)} placeholder={"• Áo funny gym bro\n• Quà Valentine dog mom"} rows={4} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/><button onClick={genFromIdea} disabled={loading} style={{width:"100%",marginTop:8,padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:loading?.5:1}}>{loading?"⏳":"💡 AI gen concept"}</button></div>}
          {images.length>0 && <div style={{marginTop:14}}><div style={{fontSize:12,fontWeight:700,color:T.tx2,marginBottom:6}}>📸 Ảnh ({images.length})</div><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>{images.map((im,i)=><div key={i} style={{position:"relative",flexShrink:0}}><img src={im.url} style={{width:72,height:72,borderRadius:10,objectFit:"cover",border:`2px solid ${T.bdr}`}}/><button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,width:22,height:22,borderRadius:11,background:T.rd,color:"#fff",fontSize:12,fontWeight:700,border:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>)}<label style={{width:72,height:72,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:T.txD,cursor:"pointer",flexShrink:0}}><input type="file" accept="image/*" multiple onChange={handleUpload} style={{display:"none"}}/>+</label></div></div>}
          {productInfo && <div style={{marginTop:12,padding:12,borderRadius:12,background:T.gnS,border:`1px solid ${T.gn}25`}}><div style={{fontSize:11,fontWeight:700,color:T.gnT,marginBottom:4}}>📋 SP</div><div style={{fontSize:12,color:T.tx2,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:120,overflowY:"auto"}}>{productInfo}</div></div>}
          <button onClick={genIdeas} disabled={loading||(!images.length&&!productInfo)} style={{width:"100%",marginTop:16,padding:"18px",borderRadius:14,background:(loading||(!images.length&&!productInfo))?T.el:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:16,fontWeight:700,border:"none",opacity:(loading||(!images.length&&!productInfo))?.4:1}}>{loading?`⏳ ${loadMsg}`:"🎬 Tạo ý tưởng video"}</button>
        </div>}

        {/* Step 2 */}
        {step==="2"&&ideas && <div className="fu">
          <p style={{fontSize:13,color:T.tx2,marginBottom:14}}>Chọn 1 → AI gen ảnh + dựng video:</p>
          {ideas.ideas?.map((idea,i)=><button key={i} onClick={()=>selectIdea(i)} style={{display:"block",width:"100%",padding:16,borderRadius:14,background:T.sf,border:`1px solid ${T.bdr}`,marginBottom:10,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><span style={{fontSize:15,fontWeight:700}}>{idea.title}</span><span style={{fontSize:11,color:T.acT,marginLeft:8,padding:"3px 8px",borderRadius:8,background:T.acS,fontWeight:600}}>{idea.format}</span></div><span style={{padding:"4px 12px",borderRadius:12,background:idea.viral_score>=7?T.gnS:T.orS,color:idea.viral_score>=7?T.gnT:T.orT,fontSize:13,fontWeight:700}}>🔥{idea.viral_score}/10</span></div>
            <div style={{fontSize:13,color:T.tx2,lineHeight:1.5}}>{idea.description}</div>
            {idea.why&&<div style={{fontSize:12,color:T.txD,marginTop:4}}>💡 {idea.why}</div>}
            <div style={{fontSize:11,color:T.txD,marginTop:8}}>⏱{idea.total_duration}s · 🎬{idea.scenes?.length} scenes · 🎵{idea.sound}</div>
          </button>)}
          <button onClick={()=>setStep("1")} style={{padding:"12px 20px",borderRadius:10,border:`1px solid ${T.bdr}`,background:"transparent",color:T.tx2,fontSize:13}}>← Quay lại</button>
        </div>}

        {/* Step 3 */}
        {step==="3" && <div className="fu">
          {autoGenning && <div style={{padding:"10px 16px",borderRadius:10,background:T.acS,border:`1px solid ${T.ac}30`,fontSize:13,color:T.acT,marginBottom:8}}>⏳ Pollinations đang gen ảnh...</div>}
          {voiceGenning && <div style={{padding:"10px 16px",borderRadius:10,background:T.orS,border:`1px solid ${T.or}30`,fontSize:13,color:T.orT,marginBottom:8}}>🎙 Đang gen voiceover...</div>}
          {voiceUrl && !voiceGenning && <div style={{padding:"8px 16px",borderRadius:10,background:T.gnS,border:`1px solid ${T.gn}30`,fontSize:12,color:T.gnT,marginBottom:8}}>🎙 Voiceover sẵn sàng — sẽ render cùng video</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16}}>
            {/* LEFT */}
            <div>
              <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${T.bdr}`,background:"#000"}}>
                <canvas ref={canvasRef} width={1080} height={1920} style={{width:"100%",display:"block"}}/>
                <div style={{padding:"8px 12px",display:"flex",gap:8,alignItems:"center",background:T.sf}}>
                  <button onClick={isPlaying?pause:play} style={{width:36,height:36,borderRadius:10,background:T.ac,color:"#fff",fontSize:14,border:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>{isPlaying?"⏸":"▶"}</button>
                  <div style={{flex:1,height:5,borderRadius:3,background:T.el,overflow:"hidden"}}><div style={{width:`${totalDuration>0?(currentTime/totalDuration)*100:0}%`,height:"100%",borderRadius:3,background:T.ac,transition:isPlaying?"none":"width .15s"}}/></div>
                  <span style={{fontSize:11,color:T.txD,fontVariantNumeric:"tabular-nums"}}>{currentTime.toFixed(1)}s/{totalDuration}s</span>
                </div>
              </div>
              {/* Audio */}
              <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
                <label style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.bdr}`,background:T.sf,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,color:audioUrl?T.gnT:T.tx2}}>
                  <input type="file" accept="audio/*" onChange={handleAudio} style={{display:"none"}}/>🎵 {audioUrl?"Có nhạc nền ✓":"Thêm nhạc (tuỳ chọn)"}
                </label>
                {audioUrl&&<button onClick={()=>{setAudioUrl(null)}} style={{padding:"10px 12px",borderRadius:10,border:`1px solid ${T.rd}40`,background:T.rdS,color:T.rdT,fontSize:12}}>×</button>}
              </div>
              {/* Actions */}
              {replicateKey && <button onClick={runProPipeline} disabled={proRendering} style={{width:"100%",marginTop:8,padding:"14px",borderRadius:12,background:proRendering?T.or:`linear-gradient(135deg,${T.gn},#059669)`,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:proRendering?.6:1,boxShadow:proRendering?"none":"0 6px 20px rgba(34,197,94,.3)"}}>{proRendering?"🚀 Đang gen video clips...":"🚀 Pro Pipeline (video clips + XTTS voice)"}</button>}
              {Object.keys(sceneVideos).length>0 && <div style={{padding:"6px 12px",borderRadius:8,background:T.gnS,fontSize:11,color:T.gnT,marginTop:4,textAlign:"center"}}>🎬 {Object.keys(sceneVideos).length} scene có video clip thật — render sẽ dùng chúng</div>}
              <button onClick={recordVideo} disabled={isRecording||!scenes.length} style={{width:"100%",marginTop:6,padding:"14px",borderRadius:12,background:isRecording?T.rd:`linear-gradient(135deg,${T.ac},${T.pk})`,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:isRecording?.6:1}}>{isRecording?"⏺ Rendering...":"⏺ Render video"+(Object.keys(sceneVideos).length?" (có video clips)":audioUrl?" (có nhạc)":"")}</button>
              {videoBlob&&<button onClick={downloadVideo} style={{width:"100%",marginTop:6,padding:"16px",borderRadius:12,background:T.gn,color:"#fff",fontSize:15,fontWeight:700,border:"none",boxShadow:"0 6px 24px rgba(34,197,94,.3)"}}>{L.download}</button>}
              {videoBlob&&!mp4Blob&&<button onClick={convertToMP4} disabled={converting} style={{width:"100%",marginTop:4,padding:"12px",borderRadius:10,border:`1px solid ${T.ac}40`,background:T.acS,color:T.acT,fontSize:13,fontWeight:600,opacity:converting?.5:1}}>{converting?L.converting:L.convertMp4}</button>}
              {mp4Blob&&<button onClick={downloadMP4} style={{width:"100%",marginTop:4,padding:"16px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:15,fontWeight:700,border:"none",boxShadow:"0 6px 24px rgba(34,197,94,.4)"}}>{L.downloadMp4}</button>}
              {videoBlob&&<p style={{fontSize:11,color:T.gnT,marginTop:6,textAlign:"center"}}>{L.tipFlow}</p>}
              {/* Storyboard export + Save template */}
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <button onClick={exportStoryboard} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12}}>🖼 Tải storyboard PNG</button>
                {extData?.rawIdea && <button onClick={()=>saveTemplate(extData.rawIdea)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.or}40`,background:T.orS,color:T.orT,fontSize:12}}>⭐ Lưu template</button>}
              </div>
              {/* External */}
              <div style={{marginTop:10,padding:12,borderRadius:12,background:T.sf,border:`1px solid ${T.bdr}`}}>
                <div style={{fontSize:12,fontWeight:700,color:T.orT,marginBottom:8}}>🚀 Video pro hơn? 1 click = copy + mở</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TOOLS.map(t=>{const pr=t.id==="kling"?extData?.kl:extData?.inv;return pr?<button key={t.id} onClick={()=>copyOpen(pr,t.url)} style={{padding:"8px 14px",borderRadius:8,background:T.acS,border:`1px solid ${T.ac}35`,color:T.acT,fontSize:12,fontWeight:600}}>{t.icon} {t.name} →</button>:<a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.bdr}`,color:T.txD,fontSize:12,textDecoration:"none"}}>{t.icon} {t.name}</a>})}</div>
                {extData?.cap&&<div onClick={()=>copy(extData.cap+"\n"+extData.ht?.map(h=>"#"+h).join(" "))} style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:T.card,fontSize:12,color:T.tx2,cursor:"pointer",lineHeight:1.5}}>📝 {extData.cap} <span style={{color:T.acT}}>{extData.ht?.map(h=>"#"+h).join(" ")}</span></div>}
                {extData?.snd&&<div style={{fontSize:11,color:T.txD,marginTop:6}}>🎵 {extData.snd}</div>}
              </div>
            </div>
            {/* RIGHT: Scenes */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:T.acT}}>Scenes ({scenes.length}) — kéo thả sắp xếp</span>
                <div style={{display:"flex",gap:6}}>
                  {undoStack.length>0&&<button onClick={undo} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.or}40`,background:T.orS,color:T.orT,fontSize:11,fontWeight:600}}>↩ Undo</button>}
                  <button onClick={addScene} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${T.bdr}`,background:T.card,color:T.tx2,fontSize:12}}>+ Thêm</button>
                </div>
              </div>
              <div style={{maxHeight:600,overflowY:"auto",paddingRight:4}}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={scenes.map(s=>s._id)} strategy={verticalListSortingStrategy}>
                    {scenes.map((sc,i)=><SortableScene key={sc._id} scene={sc} index={i} total={scenes.length} sceneImg={sceneImgs[i]} uploadedImgs={images} onUpdate={updateScene} onRemove={removeScene} onRegen={regenSceneImg} onPreview={previewScene} onSelectImg={selectSceneImg}/>)}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>}

        {/* Loading */}
        {loading&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(6px)"}}><div className="fu" style={{textAlign:"center",padding:"32px 40px",borderRadius:16,background:T.sf,border:`1px solid ${T.bdr}`,boxShadow:"0 24px 64px rgba(0,0,0,.5)"}}><div style={{fontSize:36,animation:"pulse 1.2s infinite",marginBottom:12}}>⚡</div><div style={{fontSize:15,fontWeight:600}}>{loadMsg}</div><div style={{fontSize:12,color:T.txD,marginTop:6}}>Auto-retry nếu lỗi...</div></div></div>}
      </main>
    </div>
  )
}
