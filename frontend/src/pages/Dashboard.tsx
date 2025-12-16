
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-black">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/20 bg-background-dark/95 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-wider">AI SENTINEL</h2>
                        <p className="text-primary text-xs tracking-widest font-medium opacity-80">WILDFIRE DEFENSE GRID</p>
                    </div>
                </div>
                <div className="hidden md:flex flex-1 justify-center gap-8">
                    <nav className="flex items-center gap-1 rounded-full bg-surface-darker p-1 border border-white/5">
                        <Link className="px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold shadow-[0_0_10px_rgba(19,236,91,0.2)] transition-all" to="/dashboard">Dashboard</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/fwi">Fire Weather</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/realtime">Live Monitoring</Link>
                        <a className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" href="#">Sat-View</a>
                        <a className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" href="#">Logs</a>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-darker border border-primary/20">
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-primary text-xs font-mono uppercase">System Online</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-1"></div>
                    <Link to="/" className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors relative" title="Back to Home">
                        <span className="material-symbols-outlined">home</span>
                    </Link>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white overflow-hidden">
                        <span className="material-symbols-outlined">person</span>
                    </button>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 lg:p-8 gap-6">
                {/* Dashboard Controls & KPI Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-[140px]">
                    {/* Title Block */}
                    <div className="flex flex-col justify-center gap-1 lg:col-span-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Sector <span className="text-primary">Alpha-9</span></h1>
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="material-symbols-outlined text-sm">radar</span>
                            <span className="text-sm font-mono">Scanning Active // Lat: 34.05, Long: -118.24</span>
                        </div>
                    </div>
                    {/* KPI Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stat 1 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-primary/20 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">local_fire_department</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Active Threats</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> +1
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">3</p>
                                <span className="text-red-400 text-sm font-medium animate-pulse">CRITICAL</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[25%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 2 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">psychology</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">AI Confidence</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span> 0.2%
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">99.8%</p>
                                <span className="text-primary text-sm font-medium">OPTIMAL</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[99%] shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 3 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">shutter_speed</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Avg Response</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_downward</span> -2s
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">14s</p>
                                <span className="text-primary text-sm font-medium">FAST</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-[65%] shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Map & Logs */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0">
                    {/* Center Map Visualization */}
                    <div className="lg:col-span-3 relative rounded-xl border border-white/10 bg-surface-darker overflow-hidden flex flex-col">
                        {/* Map Controls Toolbar */}
                        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-start justify-between pointer-events-none">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 pointer-events-auto bg-surface-darker/80 backdrop-blur rounded-lg p-1.5 border border-white/10">
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-primary text-surface-darker font-bold text-xs uppercase tracking-wide transition hover:brightness-110">
                                    <span className="material-symbols-outlined text-base">layers</span> All Layers
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-red-400">thermostat</span> Thermal
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-blue-400">air</span> Wind
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-yellow-400">landscape</span> Topo
                                </button>
                            </div>
                            {/* Live Status Tag */}
                            <div className="bg-red-500/20 text-red-400 border border-red-500/50 backdrop-blur px-3 py-1 rounded flex items-center gap-2 animate-pulse-slow">
                                <div className="size-2 bg-red-500 rounded-full animate-ping"></div>
                                <span className="text-xs font-bold uppercase tracking-wider">Live Feed</span>
                            </div>
                        </div>
                        {/* Map Image Container */}
                        <div className="flex-1 relative bg-surface-darker w-full h-full">
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#13ec5b 1px, transparent 1px), linear-gradient(90deg, #13ec5b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            </div>
                            {/* The Map Image */}
                            <div className="w-full h-full bg-cover bg-center opacity-80 mix-blend-screen" data-alt="Futuristic dark topographical map with glowing green grid lines and red heat signatures indicating wildfire locations" data-location="California Forests" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClFJ7OgTftlzxj_rYF0cNchbAJbQUap4R7euuLRkN0dn10XYFA_9Oruys-SexRpdWVSS4j0R-q0jekw__nfTKKDNocSFxeXwK5Jb62Gvs1qMmN9EyxBAMZUzpSGFPry82QV7B__OwDuXAuYQ8-XC86JXXXt4NS8ENLX1h6t2vBAmMbLX4Hm6XO_8ZwYo6V72kQaLZW8zaLAVG5tYuQR3sbb5u_-ULROO00SmDY2YP3rsPK9_VdPL8QjMMb3oBtyynTkFWPamASKFo')" }}>
                            </div>
                            {/* Central Radar Scan Effect (CSS Only approximation) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[500px] h-[500px] border border-primary/10 rounded-full flex items-center justify-center">
                                    <div className="w-[300px] h-[300px] border border-primary/20 rounded-full flex items-center justify-center">
                                        <div className="w-[100px] h-[100px] border border-primary/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Hotspots */}
                            <div className="absolute top-1/3 left-1/4">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
                                    <div className="size-3 bg-red-500 rounded-full border-2 border-white relative z-10"></div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-surface-darker border border-red-500/50 p-2 rounded text-xs hidden group-hover:block z-20">
                                        <p className="text-red-400 font-bold mb-1">ALERT: HEAT SPIKE</p>
                                        <p className="text-white/80">Temp: 840°C</p>
                                        <p className="text-white/80">Confidence: 98%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-1/3 right-1/3">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute -inset-6 bg-orange-500/20 rounded-full blur-md"></div>
                                    <div className="size-3 bg-orange-500 rounded-full border-2 border-white relative z-10"></div>
                                </div>
                            </div>
                        </div>
                        {/* Bottom Bar on Map */}
                        <div className="h-12 bg-surface-dark border-t border-white/10 flex items-center justify-between px-4 text-xs font-mono text-white/50">
                            <div className="flex gap-4">
                                <span>SCALE: 1:5000</span>
                                <span>SOURCE: SAT-V2, DRONE-SWARM</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                <span className="text-primary">SYNCED</span>
                            </div>
                        </div>
                    </div>
                    {/* Right Column: System Logs / Data Stream */}
                    <div className="lg:col-span-1 bg-surface-dark rounded-xl border border-white/10 flex flex-col overflow-hidden max-h-[600px] lg:max-h-none">
                        <div className="p-4 border-b border-white/5 bg-surface-darker flex justify-between items-center">
                            <h3 className="text-white font-bold tracking-wide text-sm uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">terminal</span> System Log
                            </h3>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50 border border-white/5">REAL-TIME</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 font-mono text-xs">
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>14:02:45</span>
                                    <span>#LOG-8921</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    <span className="text-primary group-hover:underline">Scan Complete.</span> Sector 7G nominal. No anomalies detected.
                                </p>
                            </div>
                            {/* Log Entry Warning */}
                            <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500/50">
                                <div className="flex justify-between text-red-400/70 mb-1">
                                    <span>14:02:05</span>
                                    <span>#LOG-8920</span>
                                </div>
                                <p className="text-red-200 leading-relaxed">
                                    <span className="text-red-400 font-bold">ALERT:</span> Thermal Anomaly detected at Sector North-East.
                                    <br /><span className="opacity-50 text-[10px]">Lat: 34.11, Long: -118.19</span>
                                </p>
                            </div>
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>14:01:55</span>
                                    <span>#LOG-8919</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    <span className="text-blue-400">Wind Shift.</span> Velocity increase detected. 12mph NW to 18mph N.
                                </p>
                            </div>
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>14:01:22</span>
                                    <span>#LOG-8918</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    <span className="text-primary">Drone 04</span> deployed to sector Alpha for visual confirmation.
                                </p>
                            </div>
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>14:00:10</span>
                                    <span>#LOG-8917</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    System calibration check. All sensors green.
                                </p>
                            </div>
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>13:59:45</span>
                                    <span>#LOG-8916</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    Data packet received from Satellite Uplink V4.
                                </p>
                            </div>
                            {/* Log Entry */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>13:58:12</span>
                                    <span>#LOG-8915</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    <span className="text-primary">Routine Scan.</span> Sector 4B clear.
                                </p>
                            </div>
                        </div>
                        {/* Input Area */}
                        <div className="p-3 bg-surface-darker border-t border-white/5">
                            <div className="flex items-center bg-surface-dark rounded border border-white/10 px-3 py-2">
                                <span className="material-symbols-outlined text-white/30 text-sm mr-2">chevron_right</span>
                                <input className="bg-transparent border-none p-0 text-xs text-white placeholder-white/20 w-full focus:ring-0 font-mono" placeholder="Enter command..." type="text" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
