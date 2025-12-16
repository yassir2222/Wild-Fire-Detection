
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DetectionConsole from './pages/DetectionConsole';
import FireWeatherIndex from './pages/FireWeatherIndex';
import RealTimeDetection from './pages/RealTimeDetection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detection" element={<DetectionConsole />} />
        <Route path="/realtime" element={<RealTimeDetection />} />
        <Route path="/fwi" element={<FireWeatherIndex />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
