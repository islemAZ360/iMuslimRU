"use client";

/**
 * Glowing Bubble Dock — Premium macOS-style Navigation
 * Green orbs → golden when active
 * Responsive: adapts for mobile (smaller bubbles, tighter spacing)
 */

import {
    AnimatePresence,
    type MotionValue,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";
import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function FloatingDock({
    items,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
}) {
    const mouseX = useMotionValue(Infinity);
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <motion.nav
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
            onMouseMove={(e) => !isMobile && mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "4px" : "8px",
                padding: isMobile ? "6px 8px" : "8px 14px 10px 14px",
                borderRadius: isMobile ? "18px" : "22px",
                background: "rgba(8, 8, 8, 0.6)",
                backdropFilter: "blur(24px) saturate(160%)",
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                boxShadow:
                    "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 60px rgba(16,185,129,0.03)",
            }}
        >
            {items.map((item) => (
                <BubbleIcon
                    mouseX={mouseX}
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                    href={item.href}
                    isActive={pathname === item.href}
                    isMobile={isMobile}
                />
            ))}
        </motion.nav>
    );
}

function BubbleIcon({
    mouseX,
    title,
    icon,
    href,
    isActive,
    isMobile,
}: {
    mouseX: MotionValue<number>;
    title: string;
    icon: React.ReactNode;
    href: string;
    isActive: boolean;
    isMobile: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const baseSize = isMobile ? 42 : 46;
    const hoverSize = isMobile ? 42 : 62;
    const baseIcon = isMobile ? 20 : 21;
    const hoverIcon = isMobile ? 20 : 28;

    const sizeTransform = useTransform(distance, [-100, 0, 100], [baseSize, hoverSize, baseSize]);
    const iconSizeTransform = useTransform(distance, [-100, 0, 100], [baseIcon, hoverIcon, baseIcon]);

    const size = useSpring(sizeTransform, { stiffness: 320, damping: 24 });
    const iconSize = useSpring(iconSizeTransform, { stiffness: 320, damping: 24 });

    const [hovered, setHovered] = useState(false);

    const greenStyle = {
        background: "radial-gradient(circle at 30% 30%, rgba(52,211,153,0.28), rgba(16,185,129,0.12) 60%, rgba(6,78,59,0.18))",
        border: "1.5px solid rgba(52, 211, 153, 0.22)",
        boxShadow: "0 0 10px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
    };

    const goldStyle = {
        background: "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.45), rgba(245,158,11,0.2) 60%, rgba(180,83,9,0.18))",
        border: "1.5px solid rgba(251,191,36,0.45)",
        boxShadow: "0 0 16px rgba(251,191,36,0.25), 0 0 6px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.12)",
    };

    const colors = isActive ? goldStyle : greenStyle;

    return (
        <a href={href} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
            <motion.div
                ref={ref}
                style={{
                    width: isMobile ? baseSize : size,
                    height: isMobile ? baseSize : size,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    position: "relative",
                    cursor: "pointer",
                    ...colors,
                    transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={() => !isMobile && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                whileTap={{ scale: 0.9 }}
            >
                {/* Glass shine */}
                <div
                    style={{
                        position: "absolute",
                        top: "12%",
                        left: "18%",
                        width: "40%",
                        height: "28%",
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(255,255,255,0.2), transparent)",
                        pointerEvents: "none",
                    }}
                />

                {/* Desktop tooltip */}
                <AnimatePresence>
                    {hovered && !isMobile && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.1 }}
                            style={{
                                position: "absolute",
                                top: "-32px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                padding: "3px 10px",
                                borderRadius: "8px",
                                background: isActive ? "rgba(180,83,9,0.9)" : "rgba(6,78,59,0.9)",
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "0.3px",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            }}
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active pulse ring */}
                {isActive && (
                    <div
                        style={{
                            position: "absolute",
                            inset: "-3px",
                            borderRadius: "50%",
                            border: "1px solid rgba(251,191,36,0.2)",
                            animation: "dockPulse 2.5s ease-in-out infinite",
                            pointerEvents: "none",
                        }}
                    />
                )}

                {/* Icon */}
                <motion.div
                    style={{
                        width: isMobile ? baseIcon : iconSize,
                        height: isMobile ? baseIcon : iconSize,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        filter: isActive
                            ? "brightness(1.4) drop-shadow(0 0 3px rgba(251,191,36,0.5))"
                            : "brightness(1.1) drop-shadow(0 0 2px rgba(16,185,129,0.3))",
                        transition: "filter 0.3s",
                    }}
                >
                    {icon}
                </motion.div>
            </motion.div>
        </a>
    );
}
