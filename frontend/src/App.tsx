import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import AssistantPage from "./pages/AssistantPage/AssistantPage"
import DressingPage from "./pages/DressingPage/DressingPage"
import UploadPage from "./pages/UploadPage/UploadPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/qq-show" replace />} />
        <Route path="/qq-show" element={<DressingPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  )
}
