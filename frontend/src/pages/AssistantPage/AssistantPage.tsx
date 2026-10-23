import type { CSSProperties } from "react";
import QQShowAssistant from "./QQShowAssistant";

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background:
    "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, .55) 0 2px, transparent 3px), radial-gradient(circle at 80% 15%, rgba(255, 255, 255, .5) 0 2px, transparent 3px), radial-gradient(circle at 65% 75%, rgba(255, 255, 255, .45) 0 2px, transparent 3px), radial-gradient(circle at 30% 85%, rgba(255, 255, 255, .5) 0 2px, transparent 3px), linear-gradient(135deg, #ffd6ec 0%, #d6c8ff 45%, #bfe8ff 100%)",
};

export default function AssistantPage() {
  return (
    <main style={pageStyle}>
      <QQShowAssistant />
    </main>
  );
}
