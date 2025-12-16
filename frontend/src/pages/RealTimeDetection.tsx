import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

const RealTimeDetection = () => {
    const [isStreamActive, setIsStreamActive] = useState(true);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#23482f] bg-surface-darker px-8 py-4 shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <motion.div
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="size-6 text-primary"
                    >
                        <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                    </motion.div>
                    <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-white text-xl font-bold leading-tight tracking-[-0.015em]"
                    >
                        WildfireGuard AI
                    </motion.h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <div className="flex items-center gap-9">
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/dashboard">Dashboard</Link>
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/detection">Console</Link>
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/fwi">Fire Weather</Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-6 lg:p-10 overflow-hidden bg-surface-darker/50">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl mx-auto w-full flex flex-col h-full gap-6"
                >
                    <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div>
                            <h1 className="text-white tracking-tight text-3xl font-bold leading-tight mb-2 flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-500 animate-pulse">videocam</span>
                                Real-Time Surveillance
                            </h1>
                            <p className="text-gray-400 text-base font-normal leading-normal">Live feed with YOLOv8 inference. Telegram alerts enabled.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-full border ${isStreamActive ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'} flex items-center gap-2 text-sm font-mono`}>
                                <div className={`w-2 h-2 rounded-full ${isStreamActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isStreamActive ? 'SYSTEM ONLINE' : 'FEED DISCONNECTED'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Video Feed Container */}
                    <motion.div variants={itemVariants} className="flex-1 relative bg-black rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(19,236,91,0.1)]">
                        {isStreamActive ? (
                            <img
                                src="http://localhost:8000/video_feed"
                                alt="Real-time Fire Detection Feed"
                                className="w-full h-full object-contain"
                                onError={() => setIsStreamActive(false)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                <span className="material-symbols-outlined text-6xl mb-4">videocam_off</span>
                                <p className="text-xl font-mono">SIGNAL LOST</p>
                                <button
                                    onClick={() => setIsStreamActive(true)}
                                    className="mt-6 px-6 py-2 bg-primary/20 border border-primary text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                >
                                    RECONNECT
                                </button>
                            </div>
                        )}

                        {/* Overlay HUD */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-primary shadow-xl">
                                CAM_01 • LIVE • {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Scanning Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent w-full h-[20%] animate-[scan_4s_ease-in-out_infinite] pointer-events-none"></div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default RealTimeDetection;
