'use client';

import { cn } from "@/lib/utils";

export const NoiseBackground = ({
    children,
    className,
    containerClassName,
    gradientColors = [
        "rgb(255, 100, 150)",
        "rgb(100, 150, 255)",
        "rgb(255, 200, 100)",
    ],
}: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    gradientColors?: string[];
}) => {
    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center bg-white dark:bg-neutral-950 w-full h-full overflow-hidden",
                containerClassName
            )}
        >
            <div
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-[1]"
                style={{
                    backgroundImage: "url('/noise.svg')", // Ensure this path exists or use a base64
                    backgroundSize: "100px 100px",
                }}
            >
                {/* Fallback CSS noise if image missing */}
                <div className="absolute inset-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                    opacity: 0.15,
                    filter: 'contrast(120%) brightness(120%)'
                }} />
            </div>

            {/* Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className={cn(
                        "absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob",
                        "bg-[var(--gradient-1)]"
                    )}
                    style={{ backgroundColor: gradientColors[0] }}
                ></div>
                <div
                    className={cn(
                        "absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000",
                        "bg-[var(--gradient-2)]"
                    )}
                    style={{ backgroundColor: gradientColors[1] }}
                ></div>
                <div
                    className={cn(
                        "absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000",
                        "bg-[var(--gradient-3)]"
                    )}
                    style={{ backgroundColor: gradientColors[2] }}
                ></div>
            </div>

            <div className={cn("relative z-10", className)}>{children}</div>
        </div>
    );
};
