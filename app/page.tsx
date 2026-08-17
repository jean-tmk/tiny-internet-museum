"use client";

import { useEffect, useRef, useState } from "react";
import artifacts from "../data/artifacts.json";

type Artifact = typeof artifacts[number];

function ArtifactVisual({ id, visits }: { id: string; visits: number }) {
  if (id === "under-construction") return <div className="relic construction"><span>UNDER</span><i /><b>CONSTRUCTION</b></div>;
  if (id === "guestbook") return <div className="relic guestbook"><span>GUESTBOOK</span><i /><b>sign here</b></div>;
  if (id === "hit-counter") return <div className="relic counter"><small>YOU ARE VISITOR</small><b>{String(visits).padStart(6, "0")}</b></div>;
  if (id === "cursor-trail") return <div className="relic cursor"><b>↖</b><i>+</i><i>+</i><i>+</i></div>;
  if (id === "midi-room") return <div className="relic midi"><span>midi player</span><b>▶</b><i /><small>00:03</small></div>;
  if (id === "dithered-sky") return <div className="relic dither"><i /><i /><i /><b>28.8k sky</b></div>;
  return <div className="relic webring"><small>← PREV</small><b>WEB<br/>RING</b><small>NEXT →</small></div>;
}

export default function Museum() {
  const [active, setActive] = useState<Artifact | null>(null);
  const [visits, setVisits] = useState(42);
  const [guest, setGuest] = useState("");
  const [savedGuest, setSavedGuest] = useState("");
  const [playing, setPlaying] = useState(false);
  const [sparks, setSparks] = useState<{ x: number; y: number; id: number }[]>([]);
  const [clock, setClock] = useState("");
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setActive(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const synth = () => {
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    [261.6, 329.6, 392].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? "square" : "triangle";
      oscillator.frequency.value = frequency;
      const start = context.currentTime + index * .13;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.05, start + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .6);
    });
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 900);
  };

  const activate = (artifact: Artifact) => {
    if (artifact.id === "hit-counter") setVisits(value => value + 1);
    if (artifact.id === "midi-room") synth();
    if (artifact.id === "under-construction") {
      setSparks(Array.from({ length: 16 }, (_, index) => ({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 55,
        id: Date.now() + index
      })));
    }
    if (artifact.id === "web-ring") {
      const index = artifacts.findIndex(item => item.id === artifact.id);
      setActive(artifacts[(index + 1) % artifacts.length]);
    }
  };

  return (
    <main className="desktop" onPointerMove={event => {
      if (active?.id !== "cursor-trail" || Math.random() > .2) return;
      setSparks(old => [...old.slice(-16), { x: event.clientX, y: event.clientY, id: Date.now() }]);
    }}>
      <div className="wallpaperWord" aria-hidden="true">WWW</div>
      {sparks.map(spark => <i className="spark" key={spark.id} style={{ left: spark.x, top: spark.y }}>✦</i>)}

      <section className="browser" aria-label="The Tiny Internet Museum">
        <header className="browserBar">
          <div className="traffic"><i /><i /><i /></div>
          <div className="address"><span>⌂</span> tiny.internet/museum/index.html</div>
          <div className="browserTools">☆ ···</div>
        </header>

        <div className="museumPage">
          <div className="masthead">
            <div className="museumMark"><span>T</span><span>I</span><span>M</span></div>
            <div><p>EST. SOMEWHERE ONLINE</p><h1>The Tiny<br/><em>Internet</em> Museum</h1></div>
            <aside><b>A very small archive<br/>of a very big internet.</b><span>OPEN DAILY<br/>UNTIL THE WIFI GOES OUT</span></aside>
          </div>

          <div className="museumPlan">
            <div className="hallLabel"><span>YOU ARE HERE</span><i>↓</i></div>
            {artifacts.map((artifact, index) => (
              <button
                className={`room room-${index + 1} artifact-${artifact.id}`}
                key={artifact.id}
                style={{ "--room-accent": artifact.accent } as React.CSSProperties}
                onClick={() => setActive(artifact)}
              >
                <small>ROOM {String(index + 1).padStart(2, "0")} · {artifact.year}</small>
                <div className="tinyObject" aria-hidden="true">
                  <ArtifactVisual id={artifact.id} visits={visits} />
                </div>
                <span>{artifact.title}</span>
              </button>
            ))}
            <div className="hallway"><span>PLEASE TOUCH THE ART</span><i>↝</i></div>
          </div>

          <div className="museumFooter">
            <span>7 OBJECTS · 0 GIFT SHOPS · 1 QUESTIONABLE MIDI FILE</span>
            <a href="https://github.com/jean-tmk/tiny-internet-museum" target="_blank" rel="noreferrer">VIEW THE SOURCE ↗</a>
          </div>
        </div>
      </section>

      <div className="desktopNote"><b>tiny field notes</b><span>the internet used to have corners.</span><i>♡</i></div>
      <div className="taskbar"><span>◉ TINY INTERNET MUSEUM</span><span>{clock}</span></div>

      {active && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label={active.title} onMouseDown={event => event.currentTarget === event.target && setActive(null)}>
          <article className="specimen" style={{ "--room-accent": active.accent } as React.CSSProperties}>
            <div className="specimenBar"><span>museum_object_{active.id}.html</span><button onClick={() => setActive(null)} aria-label="Close">×</button></div>
            <div className="specimenBody">
              <div className={`largeObject artifact-${active.id}`}>
                <ArtifactVisual id={active.id} visits={visits} />
              </div>
              <section><small>ACCESSION {active.year} / {active.type}</small><h2>{active.title}</h2><p>{active.story}</p><div className="tags">{active.tags.map(tag => <span key={tag}>{tag}</span>)}</div></section>
              <div className="interaction">
                <small>TRY THE EXHIBIT</small><p>{active.interaction}</p>
                {active.id === "guestbook" ? (
                  <form onSubmit={event => { event.preventDefault(); setSavedGuest(guest); setGuest(""); }}>
                    <input value={guest} onChange={event => setGuest(event.target.value)} placeholder="leave a tiny note" />
                    <button>SIGN</button>
                    {savedGuest && <em>“{savedGuest}” now lives here until this tab closes.</em>}
                  </form>
                ) : (
                  <button className={playing ? "playing" : ""} onClick={() => activate(active)}>
                    {active.id === "midi-room" ? (playing ? "PLAYING…" : "PLAY MIDI") : active.id === "hit-counter" ? "COUNT ME" : active.id === "web-ring" ? "FOLLOW THE RING" : "ACTIVATE"}
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
