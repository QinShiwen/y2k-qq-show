import { useEffect, useRef, useState, type CSSProperties } from "react";
import QQShowFigure, { type QQShowFigureProps } from "../DressingPage/QQShowFigure";
import { Gender } from "../DressingPage/costumes";
import { DEFAULT_QQSHOW_WIDGET_WIDTH } from "../DressingPage/consts";
import type { WeatherData } from "../../api/weather/types";
import { getCachedWeather } from "../../api/weather/utils";
import { weatherInformationMapping } from "./consts";
import { getLocalWeather } from "../../api/weather/weather";

const popKeyframes = `
@keyframes qqshow-pop { from { opacity: .2; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
@keyframes qqshow-caret { 50% { opacity: 0; } }
@keyframes qqshow-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
`;

const bubbleFont =
  '"Yuanti SC", "YouYuan", "幼圆", "Comic Sans MS", "PingFang SC", sans-serif';

const TYPE_MS = 36;

type WeatherPhase = "idle" | "loading" | "ready" | "error";

// simulates the typing effect, revealing the text one character at a time
function useTypewriter(text: string, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    setCount(0);
    if (!text) return;

    const timer = window.setInterval(() => {
      setCount((current) => (current >= text.length ? current : current + 1));
    }, TYPE_MS);

    return () => window.clearInterval(timer);
  }, [text, active]);

  return text.slice(0, count);
}

function LoadingDots() {
  return (
    <span aria-hidden style={{ display: "inline-flex", gap: 4, height: 16 }}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#e25aa3",
            animation: `qqshow-dot 1s ${index * 0.16}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

function Hint({ text, stillTyping }: { text: string; stillTyping: boolean }) {
  return (
    <div style={{ marginTop: 8, minHeight: "1.45em" }}>
      {text}
      {stillTyping ? (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 1,
            verticalAlign: "text-bottom",
            background: "#e25aa3",
            animation: "qqshow-caret 1s steps(1) infinite",
          }}
        />
      ) : null}
    </div>
  );
}

function WeatherBubble({
  phase,
  weather,
}: {
  phase: WeatherPhase;
  weather: WeatherData | null;
}) {
  const info = weather
    ? weatherInformationMapping[weather.weatherCondition]
    : null;
  const hint = weather
    ? weatherInformationMapping[weather.weatherCondition]?.hint
    : "";

  const typedHint = useTypewriter(hint, hint.length > 0);
  const stillTyping = typedHint.length < hint.length;

  const displayedContent = () => {
    if (phase === "loading") {
      return <LoadingDots />;
    }

    if (phase === "error" || !info || !weather) {
      return <Hint text="Weather unavailable" stillTyping={false} />;
    }

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            fontWeight: 700,
          }}
        >
          <span aria-hidden>{info.icon}</span>
          <span>{info.label}</span>
          <span style={{ marginLeft: "auto" }}>{weather.temperature}</span>
        </div>
        <div style={{ marginTop: 2, fontSize: 12, opacity: 0.72 }}>
          Today {weather.temperatureMin} – {weather.temperatureMax}
        </div>
        <Hint text={typedHint} stillTyping={stillTyping} />
      </>
    );
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        left: "50%",
        bottom: "calc(100% - 12px)",
        width: 248,
        maxWidth: "min(248px, calc(100vw - 48px))",
        transform: "translateX(-50%)",
        zIndex: 1,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#fff6fb",
          color: "#5a3d5c",
          fontFamily: bubbleFont,
          fontSize: 13,
          lineHeight: 1.45,
          padding: "10px 12px 12px",
          borderRadius: 16,
          border: "2px solid #fff",
          boxShadow: "0 0 0 2px #ff6eb8, 0 10px 22px rgba(190, 90, 160, .28)",
          animation: "qqshow-pop .22s ease",
        }}
      >
        {displayedContent()}

        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: -7,
            marginLeft: -6,
            width: 12,
            height: 12,
            background: "#fff6fb",
            borderRight: "2px solid #ff6eb8",
            borderBottom: "2px solid #ff6eb8",
            transform: "rotate(45deg)",
            boxShadow: "3px 3px 4px rgba(190, 90, 160, .08)",
          }}
        />
      </div>
    </div>
  );
}

const widgetStyle: CSSProperties = {
  position: "relative",
  width: DEFAULT_QQSHOW_WIDGET_WIDTH,
  filter: "drop-shadow(0 10px 14px rgba(90, 40, 80, .35))",
  cursor: "pointer",
};

const defaultQQShowLook: QQShowFigureProps = {
  gender: Gender.Female,
  hair: "hair1",
  top: "top1",
  bottom: "bottom1",
  shoes: "shoes1",
};

export default function QQShowAssistant() {

  const [open, setOpen] = useState(false);
  // record the status of the weather fetching
  const [phase, setPhase] = useState<WeatherPhase>("idle");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // temporarily record the weather request
  // prevent the weather request from being fetched again if it is still running
  const inflight = useRef<Promise<void> | null>(null);

  /*
   On hover: show cached weather if it is still fresh (30 min).
   Otherwise fetch it. Skip if we already have it, or a fetch is running.
   Success fills the bubble; failure shows "Weather unavailable".
  */
  const loadWeather = () => {
    if (phase === "ready" && weather) return;
    if (inflight.current) return;

    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
      setPhase("ready");
      return;
    }

    setPhase("loading");
    inflight.current = getLocalWeather()
      .then((next) => {
        setWeather(next);
        setPhase("ready");
      })
      .catch(() => {
        setPhase("error");
      })
      .finally(() => {
        inflight.current = null;
      });
  };

  return (
    <div
      style={widgetStyle}
      onMouseEnter={() => {
        setOpen(true);
        loadWeather();
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <style>{popKeyframes}</style>
      {open ? <WeatherBubble phase={phase} weather={weather} /> : null}
      <QQShowFigure
        {...defaultQQShowLook}
        width={DEFAULT_QQSHOW_WIDGET_WIDTH}
      />
    </div>
  );
}
