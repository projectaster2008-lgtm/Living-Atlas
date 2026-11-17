import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowUpRight, Check, CloudDrizzle, CloudFog, Compass,
  Crosshair, Map, MessageCircle, Moon, Sun, X,
} from 'lucide-react';
import WorldScene from '../rendering/scene/WorldScene';
import { advanceClock, createClock, formatWorldTime } from '../simulation/core/clock';
import type { WeatherState } from '../simulation/characters/resident-agent';
import { normalizeTouchMovement, type TouchMovement } from '../gameplay/player/touch-input';

type Interaction = { type: 'resident' | 'cafe' | 'vehicle'; id: string };
type Dialogue = { name: string; text: string; id: string; reply?: string };

const weatherCycle: WeatherState[] = ['clear', 'rain', 'storm', 'fog'];
const worldTime = (hour: number) => hour >= 6 && hour < 18;

const residents: Record<string, { name: string; role: string; greeting: string }> = {
  mara: { name: 'Mara', role: 'Local barista', greeting: 'The bay is lovely this time of day. The sea breeze makes even a busy morning feel slower.' },
  eli: { name: 'Eli', role: 'Harbor assistant', greeting: 'The marina is getting ready for the afternoon boats. There is always something moving around here.' },
  jonas: { name: 'Jonas', role: 'Bookshop owner', greeting: 'I keep a little list of places worth seeing. The old promenade is at the top of it.' },
  lina: { name: 'Lina', role: 'Florist', greeting: 'The flowers change with the weather. I like the quiet just before the rain.' },
};

export default function App() {
  const [clock, setClock] = useState(() => createClock(16 * 3600 + 42 * 60));
  const [weather, setWeather] = useState<WeatherState>('clear');
  const [vehicleMode, setVehicleMode] = useState(false);
  const [interiorOpen, setInteriorOpen] = useState(false);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>([0, 7]);
  const [missionStep, setMissionStep] = useState(0);
  const [relationship, setRelationship] = useState<Record<string, number>>({ mara: 18, eli: 10, jonas: 8, lina: 12 });
  const [notice, setNotice] = useState('The town is waking up around you.');
  const [touchMovement, setTouchMovement] = useState<TouchMovement>({ x: 0, z: 0 });
  const [touchRun, setTouchRun] = useState(false);
  const [cameraYaw, setCameraYaw] = useState(0);
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const lookPointer = useRef<number | null>(null);
  const lastLookX = useRef(0);

  const hour = Math.floor(clock.secondsOfDay / 3600);
  const timeLabel = formatWorldTime(clock);
  const daylight = worldTime(hour);
  const objective = missionStep === 0
    ? 'Meet someone who calls the bay home'
    : missionStep === 1
      ? 'Step inside Seabreeze Café'
      : 'Explore the waterfront promenade';
  const progress = missionStep === 0 ? '01 / 03' : missionStep === 1 ? '02 / 03' : '03 / 03';

  useEffect(() => {
    const timer = window.setInterval(() => setClock((current) => advanceClock(current, 1, 60, 1)), 1000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyM' && !event.repeat) setWorldMapOpen((open) => !open);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const stop = () => {
      setTouchMovement({ x: 0, z: 0 });
      setTouchRun(false);
      joystickPointer.current = null;
      lookPointer.current = null;
    };
    window.addEventListener('blur', stop);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('blur', stop);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const updateJoystick = (clientX: number, clientY: number) => {
    const bounds = joystickRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const radius = bounds.width * 0.34;
    const x = (clientX - (bounds.left + bounds.width / 2)) / radius;
    const y = (clientY - (bounds.top + bounds.height / 2)) / radius;
    setTouchMovement(normalizeTouchMovement(x, y));
  };

  const weatherLabel = useMemo(() => ({
    clear: 'Clear skies',
    cloudy: 'Overcast',
    rain: 'Light rain',
    storm: 'Passing storm',
    fog: 'Coastal fog',
  }[weather]), [weather]);

  const nearbyInteraction = useMemo(() => {
    if (interiorOpen) return { interaction: { type: 'cafe', id: 'exit' } as Interaction, label: 'EXIT SEABREEZE CAFÉ' };
    if (vehicleMode) return { interaction: { type: 'vehicle', id: 'coastal-sedan' } as Interaction, label: 'EXIT COASTAL SEDAN' };
    const candidates = [
      { type: 'resident' as const, id: 'mara', label: 'TALK TO MARA', x: -3.2, z: 1.2 },
      { type: 'resident' as const, id: 'eli', label: 'TALK TO ELI', x: 3.8, z: -1.5 },
      { type: 'resident' as const, id: 'jonas', label: 'TALK TO JONAS', x: 0.5, z: -5.5 },
      { type: 'resident' as const, id: 'lina', label: 'TALK TO LINA', x: -7, z: -3 },
      { type: 'cafe' as const, id: 'seabreeze-cafe', label: 'ENTER SEABREEZE CAFÉ', x: -7.5, z: 0.5 },
      { type: 'vehicle' as const, id: 'coastal-sedan', label: 'ENTER COASTAL SEDAN', x: 7, z: 8 },
    ];
    const nearest = candidates
      .map((item) => ({ ...item, distance: Math.hypot(item.x - position[0], item.z - position[1]) }))
      .sort((a, b) => a.distance - b.distance)[0];
    return nearest && nearest.distance < 3.1
      ? { interaction: { type: nearest.type, id: nearest.id } as Interaction, label: nearest.label }
      : null;
  }, [interiorOpen, vehicleMode, position]);

  const handleInteraction = (interaction: Interaction) => {
    if (interaction.type === 'resident') {
      const resident = residents[interaction.id];
      if (!resident) return;
      setDialogue({ id: interaction.id, name: resident.name, text: resident.greeting });
      return;
    }
    if (interaction.type === 'cafe') {
      if (interaction.id === 'exit') {
        setInteriorOpen(false);
        setNotice('Back on the promenade.');
      } else {
        setInteriorOpen(true);
        if (missionStep === 1) setMissionStep(2);
        setNotice('You stepped into Seabreeze Café.');
      }
      return;
    }
    if (interaction.type === 'vehicle') {
      setVehicleMode((current) => !current);
      setNotice(vehicleMode ? 'You stepped out of the coastal sedan.' : 'Vehicle entered. Use the touch controls or WASD to drive.');
    }
  };

  const respondToResident = (kind: 'ask' | 'goodbye') => {
    if (!dialogue) return;
    if (kind === 'ask') {
      setRelationship((current) => ({ ...current, [dialogue.id]: Math.min(100, (current[dialogue.id] ?? 0) + 3) }));
      setDialogue({
        ...dialogue,
        text: dialogue.id === 'mara'
          ? 'If you have time, take the long way along the water. The light on the old pier is beautiful near sunset.'
          : 'It is nice when people take a moment to notice the place they are in. This town has a lot of little stories.',
        reply: 'A little more familiar',
      });
      if (missionStep === 0) setMissionStep(1);
      return;
    }
    setDialogue(null);
    setNotice('You said goodbye. The day carries on.');
  };

  const cycleWeather = () => {
    const index = weatherCycle.indexOf(weather);
    const next = weatherCycle[(index + 1) % weatherCycle.length];
    setWeather(next);
    setNotice(next === 'clear' ? 'The clouds are clearing.' : next === 'rain' ? 'A light shower moves over the bay.' : next === 'storm' ? 'A storm is rolling across the water.' : 'A soft fog settles along the coast.');
  };

  const changeTime = () => {
    const hourNow = Math.floor(clock.secondsOfDay / 3600);
    const next = hourNow < 10 ? 16 : hourNow < 19 ? 21 : 8;
    setClock(createClock(next * 3600 + 18 * 60, clock.day));
    setNotice(next === 8 ? 'A new morning settles over Solara Bay.' : next === 16 ? 'Golden hour is spilling across the waterfront.' : 'Night has arrived. The town lights are coming on.');
  };

  return (
    <main className="atlas-shell">
      <div className="world-layer">
        <WorldScene
          weather={weather}
          hour={hour}
          vehicleMode={vehicleMode}
          interiorOpen={interiorOpen}
          onInteract={handleInteraction}
          onPosition={setPosition}
          touchMovement={touchMovement}
          touchRun={touchRun}
          cameraYaw={cameraYaw}
        />
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Compass size={17} strokeWidth={1.7} /></div>
          <div>
            <div className="brand-name">LIVING <span>ATLAS</span></div>
            <div className="brand-caption">A WORLD IN MOTION</div>
          </div>
        </div>
        <div className="topbar-center">
          <span className="live-dot" /> SIMULATION LIVE <span className="topbar-divider">/</span> LOCAL WORLD
        </div>
        <div className="topbar-actions">
          <button className="icon-button" onClick={() => setWorldMapOpen(true)} aria-label="Open world map"><Map size={17} /></button>
          <button className="icon-button" onClick={cycleWeather} aria-label="Change weather">
            {weather === 'clear' ? <Sun size={17} /> : weather === 'fog' ? <CloudFog size={17} /> : <CloudDrizzle size={17} />}
          </button>
          <button className="time-button" onClick={changeTime}>
            {daylight ? <Sun size={15} /> : <Moon size={15} />}
            <span>{timeLabel}</span>
            <span className="day-label">DAY {clock.day.toString().padStart(2, '0')}</span>
          </button>
        </div>
      </header>

      <section className="mission-card">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR STORY BEGINS HERE</div>
        <div className="mission-title">A day in<br /><em>Solara Bay.</em></div>
        <p className="mission-copy">No schedule to chase. No destination required. Just see where the day takes you.</p>
        <div className="mission-divider" />
        <div className="mission-meta"><span>LOCAL THREAD</span><span>{progress}</span></div>
        <div className="objective-row">
          <div className="objective-icon"><Crosshair size={15} /></div>
          <div><span className="objective-label">CURRENT OBJECTIVE</span><strong>{objective}</strong></div>
        </div>
        <div className="mission-foot"><Activity size={13} /> AUTONOMOUS LIFE SIMULATION</div>
      </section>

      <div className="location-stamp">
        <div className="location-kicker">REGION 01 <span>•</span> COASTAL DISTRICT</div>
        <div className="location-name">{interiorOpen ? 'SEABREEZE CAFÉ' : 'SOLARA BAY'}</div>
        <div className="location-subtitle">{interiorOpen ? 'A small pause in the middle of the day' : 'The coast is calling.'}</div>
      </div>

      {nearbyInteraction && !dialogue && (
        <button className="interact-prompt" onClick={() => handleInteraction(nearbyInteraction.interaction)}>
          <kbd>E</kbd><span>{nearbyInteraction.label}</span><ArrowUpRight size={14} />
        </button>
      )}

      <aside className="right-rail">
        <div className="weather-card">
          <div className="rail-label">CONDITIONS</div>
          <div className="weather-value">{weatherLabel}</div>
          <div className="weather-sub">COASTAL DISTRICT <span>•</span> 24°</div>
        </div>
        <div className="mini-map-card">
          <div className="rail-label">LOCAL MAP <span>01</span></div>
          <div className="mini-map">
            <div className="map-water" />
            <div className="map-road map-road-a" />
            <div className="map-road map-road-b" />
            <div className="map-road map-road-c" />
            <div className="map-block map-block-a" />
            <div className="map-block map-block-b" />
            <div className="map-block map-block-c" />
            <div className="map-player" style={{ left: `${Math.max(12, Math.min(86, 50 + position[0] * 1.6))}%`, top: `${Math.max(18, Math.min(78, 56 + position[1] * 1.1))}%` }} />
            <span className="map-north">N</span>
          </div>
          <div className="map-footer"><span>YOU ARE HERE</span><span>OPEN MAP <ArrowUpRight size={12} /></span></div>
        </div>
      </aside>

      <div className="bottom-hud">
        <div className="control-hints">
          <div className="control-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>MOVE</span></div>
          <div className="control-hint"><kbd>SHIFT</kbd><span>RUN</span></div>
          <div className="control-hint"><kbd>E</kbd><span>INTERACT</span></div>
          <div className="control-hint"><kbd>M</kbd><span>WORLD MAP</span></div>
        </div>
        <div className="bottom-status">
          <span className="status-pulse" /> {vehicleMode ? 'VEHICLE CONTROL' : interiorOpen ? 'INDOOR EXPLORATION' : 'FREE ROAM'}
        </div>
      </div>

      <div className="touch-camera-zone" aria-label="Drag to look around" data-camera-yaw={cameraYaw.toFixed(3)}
        onPointerDown={(event) => {
          lookPointer.current = event.pointerId;
          lastLookX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (lookPointer.current !== event.pointerId) return;
          const delta = event.clientX - lastLookX.current;
          lastLookX.current = event.clientX;
          setCameraYaw((yaw) => yaw - delta * 0.006);
        }}
        onPointerUp={() => { lookPointer.current = null; }}
        onPointerCancel={() => { lookPointer.current = null; }}
      />

      <div className="touch-controls" aria-label="Touch gameplay controls">
        <div className="virtual-joystick" ref={joystickRef}
          onPointerDown={(event) => {
            joystickPointer.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateJoystick(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (joystickPointer.current === event.pointerId) updateJoystick(event.clientX, event.clientY);
          }}
          onPointerUp={() => { joystickPointer.current = null; setTouchMovement({ x: 0, z: 0 }); }}
          onPointerCancel={() => { joystickPointer.current = null; setTouchMovement({ x: 0, z: 0 }); }}
          onLostPointerCapture={() => { joystickPointer.current = null; setTouchMovement({ x: 0, z: 0 }); }}
        >
          <span className="joystick-ring" />
          <span className="joystick-knob" style={{ transform: `translate(calc(-50% + ${touchMovement.x * 26}px), calc(-50% + ${touchMovement.z * 26}px))` }} />
          <span className="joystick-label">MOVE</span>
        </div>
        <div className="touch-action-stack">
          <button className={touchRun ? 'touch-action active' : 'touch-action'} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setTouchRun(true); }} onPointerUp={() => setTouchRun(false)} onPointerCancel={() => setTouchRun(false)} onLostPointerCapture={() => setTouchRun(false)} onPointerLeave={() => setTouchRun(false)} aria-label="Hold to run">RUN</button>
          <button className="touch-action touch-interact" disabled={!nearbyInteraction || Boolean(dialogue)} onClick={() => nearbyInteraction && handleInteraction(nearbyInteraction.interaction)} aria-label="Interact">
            {interiorOpen ? 'EXIT' : vehicleMode ? 'EXIT' : 'ACTION'}
          </button>
        </div>
      </div>

      {notice && <div className="world-notice"><span className="notice-mark">✦</span>{notice}</div>}

      {dialogue && (
        <div className="dialogue-panel">
          <div className="dialogue-top"><div><span className="dialogue-kicker">RESIDENT ENCOUNTER</span><h3>{dialogue.name}</h3><span className="dialogue-role">{residents[dialogue.id]?.role} · Familiarity {relationship[dialogue.id] ?? 0}</span></div><button className="close-button" onClick={() => setDialogue(null)}><X size={16} /></button></div>
          <p className="dialogue-text">“{dialogue.text}”</p>
          {dialogue.reply && <div className="dialogue-reply"><Check size={13} /> {dialogue.reply}</div>}
          <div className="dialogue-actions">
            <button onClick={() => respondToResident('ask')}><MessageCircle size={14} /> Ask about the day</button>
            <button className="quiet-action" onClick={() => respondToResident('goodbye')}>Say goodbye</button>
          </div>
        </div>
      )}

      {interiorOpen && (
        <div className="interior-card">
          <div className="interior-kicker">YOU ARE INSIDE</div>
          <strong>Seabreeze Café</strong>
          <span>Warm light, quiet tables, and the sound of the bay.</span>
          <button onClick={() => handleInteraction({ type: 'cafe', id: 'exit' })}>Return to the promenade <ArrowUpRight size={13} /></button>
        </div>
      )}

      {worldMapOpen && (
        <div className="modal-backdrop" onClick={() => setWorldMapOpen(false)}>
          <section className="world-map-panel" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading"><div><span className="eyebrow-line" /> THE CONNECTED ATLAS<h2>Choose a world.</h2></div><button className="close-button" onClick={() => setWorldMapOpen(false)}><X size={17} /></button></div>
            <div className="world-list">
              <div className="world-choice active"><span className="world-index">01</span><div><strong>Solara Bay</strong><small>Coastal town · Current region</small></div><span className="world-status">AVAILABLE</span></div>
              <div className="world-choice locked"><span className="world-index">02</span><div><strong>Vesper City</strong><small>Urban district · Production phase</small></div><span className="world-status">IN DEVELOPMENT</span></div>
              <div className="world-choice locked"><span className="world-index">03</span><div><strong>Verdant Highlands</strong><small>Mountain region · Production phase</small></div><span className="world-status">IN DEVELOPMENT</span></div>
              <div className="world-choice locked"><span className="world-index">04</span><div><strong>Aether District</strong><small>Future district · Production phase</small></div><span className="world-status">IN DEVELOPMENT</span></div>
            </div>
            <p className="map-note">The atlas grows as each region becomes fully playable. The first destination is already waiting.</p>
          </section>
        </div>
      )}

      <div className="build-stamp">PRODUCTION BUILD <span>•</span> SOLARA BAY / VERTICAL SLICE</div>
    </main>
  );
}
