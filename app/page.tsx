"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import artifacts from "../data/artifacts.json";

type Artifact = typeof artifacts[number];

function useRepositoryPulse() {
  const [pulse, setPulse] = useState("ARCHIVE ONLINE");
  useEffect(() => {
    fetch("https://api.github.com/repos/jean-tmk/tiny-internet-museum")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => setPulse(`${data.size ?? 0} KB / ${data.default_branch?.toUpperCase() ?? "MAIN"}`))
      .catch(() => setPulse("LOCAL COPY / ONLINE"));
  }, []);
  return pulse;
}

export default function Museum() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [visits, setVisits] = useState(42);
  const [guest, setGuest] = useState("");
  const [savedGuest, setSavedGuest] = useState("");
  const [playing, setPlaying] = useState(false);
  const [trailOn, setTrailOn] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [message, setMessage] = useState("");
  const [sparks, setSparks] = useState<{x:number;y:number;id:number}[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const repositoryPulse = useRepositoryPulse();
  const artifact: Artifact = artifacts[active];

  const move = useCallback((direction:number) => {
    setActive(index => (index + direction + artifacts.length) % artifacts.length);
    setOpen(false);
  }, []);

  useEffect(() => {
    const key = (event:KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") move(1);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") move(-1);
      if (event.key === "Enter") setOpen(value => !value);
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [move]);

  const synth = () => {
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    [0, .13, .27].forEach((delay, i) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = i === 1 ? "square" : "triangle";
      oscillator.frequency.value = [261.6, 329.6, 392][i];
      gain.gain.setValueAtTime(.0001, context.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.055, context.currentTime + delay + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + delay + .55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + .6);
    });
    setPlaying(true); window.setTimeout(() => setPlaying(false), 900);
  };

  const flash = (text:string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(current => current === text ? "" : current), 2200);
  };

  const activate = () => {
    if (artifact.id === "hit-counter") {
      setVisits(value => value + 1);
      flash("VISIT RECORDED. YOU WERE HERE.");
    }
    if (artifact.id === "midi-room") {
      synth();
      flash("WELCOME.MID IS PLAYING");
    }
    if (artifact.id === "under-construction") {
      setSparks(Array.from({length:22},(_,i)=>({x:window.innerWidth*(.08+Math.random()*.84),y:window.innerHeight*(.08+Math.random()*.76),id:Date.now()+i})));
      flash("CONSTRUCTION RESUMED. COMPLETION: UNKNOWN.");
    }
    if (artifact.id === "cursor-trail") {
      setTrailOn(value => !value);
      flash(trailOn ? "CURSOR TRAIL DISABLED" : "CURSOR TRAIL ENABLED — MOVE AROUND");
    }
    if (artifact.id === "dithered-sky") {
      setLowBandwidth(value => !value);
      flash(lowBandwidth ? "FULL COLOR RESTORED" : "28.8K BANDWIDTH MODE ENABLED");
    }
    if (artifact.id === "web-ring") {
      setActive(index => (index + 1) % artifacts.length);
      flash("WEBRING: NEXT SITE FOUND");
    }
  };

  return <main className={`museum ${lowBandwidth ? "lowBandwidth" : ""}`} style={{"--accent":artifact.accent} as React.CSSProperties} onPointerMove={event => {
    if (!trailOn || Math.random() > .16) return;
    setSparks(old => [...old.slice(-18), {x:event.clientX,y:event.clientY,id:Date.now()}]);
  }}>
    <div className="noise" aria-hidden="true"/>
    {message && <div className="artifactToast" role="status">{message}</div>}
    {sparks.map(spark => <i className="spark" key={spark.id} style={{left:spark.x,top:spark.y}} aria-hidden="true">✦</i>)}
    <header><div className="identity"><span>TIM</span><p>THE TINY<br/>INTERNET MUSEUM</p></div><div className="status"><i/> {repositoryPulse}</div><a href="https://github.com/jean-tmk/tiny-internet-museum">SOURCE ↗</a></header>

    <section className="gallery" aria-label="Museum gallery">
      <div className="galleryMeta"><small>COLLECTION / 001</small><b>{String(active+1).padStart(2,"0")} <i>/</i> {String(artifacts.length).padStart(2,"0")}</b><p>Use arrows, wheel,<br/>or the index below.</p></div>
      <button className="arrow previous" onClick={()=>move(-1)} aria-label="Previous artifact">←</button>
      <article className={`artifact ${open?"isOpen":""}`} onClick={()=>setOpen(true)}>
        <div className="artifactAura" aria-hidden="true"/>
        <div className={`artifactObject object-${artifact.id}`} aria-hidden="true"><span>{artifact.id === "hit-counter" ? String(visits).padStart(6,"0") : artifact.symbol}</span><i/><i/><i/></div>
        <div className="artifactTitle"><small>{artifact.year} / {artifact.type}</small><h1>{artifact.title}</h1><button onClick={event=>{event.stopPropagation();setOpen(true)}}>INSPECT OBJECT <span>↗</span></button></div>
      </article>
      <button className="arrow next" onClick={()=>move(1)} aria-label="Next artifact">→</button>
      <aside className="wallNote"><span>PLEASE</span><b>touch<br/>the art.</b><i>↘</i></aside>
    </section>

    <nav className="index" aria-label="Artifact index">{artifacts.map((item,i)=><button key={item.id} onClick={()=>{setActive(i);setOpen(false)}} className={active===i?"active":""}><small>{String(i+1).padStart(2,"0")}</small><span>{item.title}</span><i style={{background:item.accent}}/></button>)}</nav>

    <div className={`drawer ${open?"open":""}`} aria-hidden={!open}>
      <button className="close" onClick={()=>setOpen(false)}>CLOSE ×</button>
      <div className="drawerNumber">{String(active+1).padStart(2,"0")}</div>
      <section><small>ACQUIRED / {artifact.year}</small><h2>{artifact.title}</h2><p>{artifact.story}</p><div className="tags">{artifact.tags.map(tag=><span key={tag}>{tag}</span>)}</div></section>
      <div className="interact">
        <span>INTERACTION</span><p>{artifact.interaction}</p>
        {artifact.id === "guestbook" ? <form onSubmit={e=>{e.preventDefault();if(!guest.trim())return;setSavedGuest(guest);setGuest("");flash("GUESTBOOK SIGNED")}}><input value={guest} onChange={e=>setGuest(e.target.value)} placeholder="leave a name or tiny note"/><button>SIGN</button>{savedGuest&&<em>“{savedGuest}” is here until this tab closes.</em>}</form> : <button className={playing?"playing":""} onClick={activate}>{artifact.id === "midi-room"?(playing?"PLAYING…":"PLAY THE FILE"):artifact.id === "hit-counter"?"COUNT THIS VISIT":artifact.id === "web-ring"?"FOLLOW THE WEBRING":artifact.id === "cursor-trail"?(trailOn?"TURN TRAIL OFF":"TURN TRAIL ON"):artifact.id === "dithered-sky"?(lowBandwidth?"RESTORE FULL COLOR":"SIMULATE 28.8K"):artifact.id === "under-construction"?"RESUME CONSTRUCTION":"ACTIVATE ARTIFACT"}</button>}
      </div>
    </div>
    <footer><span>HANDMADE WEB / PERMANENTLY UNFINISHED</span><span>← → NAVIGATE · ENTER INSPECT · ESC CLOSE</span></footer>
  </main>;
}
