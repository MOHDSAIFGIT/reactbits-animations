import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Bounce = ({ children }) => {
    return (jsxs("div", { style: {
            animation: "bounce 2s infinite",
        }, children: [jsx("style", { children: `
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        ` }), children] }));
};

const StarBorder = ({ as, className = "", color = "white", speed = "6s", children, ...rest }) => {
    const Component = as || "button";
    return (jsxs(Fragment, { children: [jsx("style", { children: `
          .star-border-container {
            display: inline-block;
            padding: 1px 0;
            position: relative;
            border-radius: 20px;
            overflow: hidden;
          }
          
          .border-gradient-bottom {
            position: absolute;
            width: 300%;
            height: 50%;
            opacity: 0.7;
            bottom: -11px;
            right: -250%;
            border-radius: 50%;
            animation: star-movement-bottom linear infinite alternate;
            z-index: 0;
          }
          
          .border-gradient-top {
            position: absolute;
            opacity: 0.7;
            width: 300%;
            height: 50%;
            top: -10px;
            left: -250%;
            border-radius: 50%;
            animation: star-movement-top linear infinite alternate;
            z-index: 0;
          }
          
          .inner-content {
            position: relative;
            border: 1px solid #222;
            background: #000;
            color: white;
            font-size: 16px;
            text-align: center;
            padding: 16px 26px;
            border-radius: 20px;
            z-index: 1;
          }
          
          @keyframes star-movement-bottom {
            0% {
              transform: translate(0%, 0%);
              opacity: 1;
            }
            100% {
              transform: translate(-100%, 0%);
              opacity: 0;
            }
          }
          
          @keyframes star-movement-top {
            0% {
              transform: translate(0%, 0%);
              opacity: 1;
            }
            100% {
              transform: translate(100%, 0%);
              opacity: 0;
            }
          }
      ` }), jsxs(Component, { className: `star-border-container ${className}`, ...rest, children: [jsx("div", { className: "border-gradient-bottom", style: {
                            background: `radial-gradient(circle, ${color}, transparent 10%)`,
                            animationDuration: speed,
                        } }), jsx("div", { className: "border-gradient-top", style: {
                            background: `radial-gradient(circle, ${color}, transparent 10%)`,
                            animationDuration: speed,
                        } }), jsx("div", { className: "inner-content", children: children })] })] }));
};

const ClickSpark = ({ sparkColor = "#fff", sparkSize = 10, sparkRadius = 15, sparkCount = 8, duration = 400, easing = "ease-out", extraScale = 1.0, children }) => {
    const canvasRef = useRef(null);
    const sparksRef = useRef([]);
    const startTimeRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const parent = canvas.parentElement;
        if (!parent)
            return;
        let resizeTimeout;
        const resizeCanvas = () => {
            const { width, height } = parent.getBoundingClientRect();
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        };
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };
        const ro = new ResizeObserver(handleResize);
        ro.observe(parent);
        resizeCanvas();
        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, []);
    const easeFunc = useCallback((t) => {
        switch (easing) {
            case "linear":
                return t;
            case "ease-in":
                return t * t;
            case "ease-in-out":
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t * (2 - t);
        }
    }, [easing]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        let animationId;
        const draw = (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }
            ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvas.width, canvas.height);
            sparksRef.current = sparksRef.current.filter((spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }
                const progress = elapsed / duration;
                const eased = easeFunc(progress);
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);
                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
                ctx.strokeStyle = sparkColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                return true;
            });
            animationId = requestAnimationFrame(draw);
        };
        animationId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);
    const handleClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const now = performance.now();
        const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now,
        }));
        sparksRef.current.push(...newSparks);
    };
    return (jsxs("div", { style: {
            width: "100%",
            height: "100%",
            position: "relative"
        }, onClick: handleClick, children: [jsx("canvas", { ref: canvasRef, style: {
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none"
                } }), children] }));
};

gsap.registerPlugin(ScrollTrigger);
const AnimatedContent = ({ children, distance = 100, direction = "vertical", reverse = false, duration = 0.8, ease = "power3.out", initialOpacity = 0, animateOpacity = true, scale = 1, threshold = 0.1, delay = 0, onComplete, }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const axis = direction === "horizontal" ? "x" : "y";
        const offset = reverse ? -distance : distance;
        const startPct = (1 - threshold) * 100;
        gsap.set(el, {
            [axis]: offset,
            scale,
            opacity: animateOpacity ? initialOpacity : 1,
        });
        gsap.to(el, {
            [axis]: 0,
            scale: 1,
            opacity: 1,
            duration,
            ease,
            delay,
            onComplete,
            scrollTrigger: {
                trigger: el,
                start: `top ${startPct}%`,
                toggleActions: "play none none none",
                once: true,
            },
        });
        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
            gsap.killTweensOf(el);
        };
    }, [
        distance,
        direction,
        reverse,
        duration,
        ease,
        initialOpacity,
        animateOpacity,
        scale,
        threshold,
        delay,
        onComplete,
    ]);
    return jsx("div", { ref: ref, children: children });
};

const FadeContent = ({ children, blur = false, duration = 1000, easing = "ease-out", delay = 0, threshold = 0.1, initialOpacity = 0, className = "", }) => {
    const [inView, setInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                observer.unobserve(element);
                setTimeout(() => {
                    setInView(true);
                }, delay);
            }
        }, { threshold });
        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, delay]);
    return (jsx("div", { ref: ref, className: className, style: {
            opacity: inView ? 1 : initialOpacity,
            transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
            filter: blur ? (inView ? "blur(0px)" : "blur(10px)") : "none",
        }, children: children }));
};

export { AnimatedContent, Bounce, ClickSpark, FadeContent, StarBorder };
//# sourceMappingURL=index.es.js.map
