import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRef, useEffect, useCallback, useState } from 'react';
import gsap$1, { gsap } from 'gsap';
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

const GlareHover = ({ width = "500px", height = "500px", background = "#000", borderRadius = "10px", borderColor = "#333", children, glareColor = "#ffffff", glareOpacity = 0.5, glareAngle = -45, glareSize = 250, transitionDuration = 650, playOnce = false, className = "", style = {}, }) => {
    const hex = glareColor.replace("#", "");
    let rgba = glareColor;
    if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }
    else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }
    const vars = {
        "--gh-width": width,
        "--gh-height": height,
        "--gh-bg": background,
        "--gh-br": borderRadius,
        "--gh-angle": `${glareAngle}deg`,
        "--gh-duration": `${transitionDuration}ms`,
        "--gh-size": `${glareSize}%`,
        "--gh-rgba": rgba,
        "--gh-border": borderColor,
    };
    return (jsxs(Fragment, { children: [jsx("style", { children: `
      .glare-hover {
  width: var(--gh-width);
  height: var(--gh-height);
  background: var(--gh-bg);
  border-radius: var(--gh-br);
  border: 1px solid var(--gh-border);
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
}

.glare-hover::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(var(--gh-angle),
      hsla(0, 0%, 0%, 0) 60%,
      var(--gh-rgba) 70%,
      hsla(0, 0%, 0%, 0),
      hsla(0, 0%, 0%, 0) 100%);
  transition: var(--gh-duration) ease;
  background-size: var(--gh-size) var(--gh-size), 100% 100%;
  background-repeat: no-repeat;
  background-position: -100% -100%, 0 0;
}

.glare-hover:hover {
  cursor: pointer;
}

.glare-hover:hover::before {
  background-position: 100% 100%, 0 0;
}

.glare-hover--play-once::before {
  transition: none;
}

.glare-hover--play-once:hover::before {
  transition: var(--gh-duration) ease;
  background-position: 100% 100%, 0 0;
}
        ` }), jsx("div", { className: `glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`, style: { ...vars, ...style }, children: children })] }));
};

const MagnetLines = ({ rows = 9, columns = 9, containerSize = "80vmin", lineColor = "#efefef", lineWidth = "1vmin", lineHeight = "6vmin", baseAngle = -10, className = "", style = {}, }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const items = container.querySelectorAll("span");
        const onPointerMove = (pointer) => {
            items.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                const b = pointer.x - centerX;
                const a = pointer.y - centerY;
                const c = Math.sqrt(a * a + b * b) || 1;
                const r = ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1);
                item.style.setProperty("--rotate", `${r}deg`);
            });
        };
        const handlePointerMove = (e) => {
            onPointerMove({ x: e.x, y: e.y });
        };
        window.addEventListener("pointermove", handlePointerMove);
        if (items.length) {
            const middleIndex = Math.floor(items.length / 2);
            const rect = items[middleIndex].getBoundingClientRect();
            onPointerMove({ x: rect.x, y: rect.y });
        }
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
        };
    }, []);
    const total = rows * columns;
    const spans = Array.from({ length: total }, (_, i) => (jsx("span", { style: {
            "--rotate": `${baseAngle}deg`,
            backgroundColor: lineColor,
            width: lineWidth,
            height: lineHeight,
        } }, i)));
    return (jsxs(Fragment, { children: [jsx("style", { children: `
    .magnetLines-container {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  grid-template-rows: repeat(var(--rows), 1fr);

  justify-items: center;
  align-items: center;

  width: 80vmin;
  height: 80vmin;
}

.magnetLines-container span {
  display: block;
  transform-origin: center;
  will-change: transform;
  transform: rotate(var(--rotate));
}

     ` }), jsx("div", { ref: containerRef, className: `magnetLines-container ${className}`, style: {
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    width: containerSize,
                    height: containerSize,
                    ...style,
                }, children: spans })] }));
};

const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 2, activeTransition = "transform 0.3s ease-out", inactiveTransition = "transform 0.5s ease-in-out", wrapperClassName = "", innerClassName = "", ...props }) => {
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const magnetRef = useRef(null);
    useEffect(() => {
        if (disabled) {
            setPosition({ x: 0, y: 0 });
            return;
        }
        const handleMouseMove = (e) => {
            if (!magnetRef.current)
                return;
            const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const distX = Math.abs(centerX - e.clientX);
            const distY = Math.abs(centerY - e.clientY);
            if (distX < width / 2 + padding && distY < height / 2 + padding) {
                setIsActive(true);
                const offsetX = (e.clientX - centerX) / magnetStrength;
                const offsetY = (e.clientY - centerY) / magnetStrength;
                setPosition({ x: offsetX, y: offsetY });
            }
            else {
                setIsActive(false);
                setPosition({ x: 0, y: 0 });
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [padding, disabled, magnetStrength]);
    const transitionStyle = isActive ? activeTransition : inactiveTransition;
    return (jsx("div", { ref: magnetRef, className: wrapperClassName, style: { position: "relative", display: "inline-block" }, ...props, children: jsx("div", { className: innerClassName, style: {
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: transitionStyle,
                willChange: "transform",
            }, children: children }) }));
};

const defaultParams = {
    patternScale: 2,
    refraction: 0.015,
    edge: 1,
    patternBlur: 0.005,
    liquid: 0.07,
    speed: 0.3,
};
const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 a_position;
out vec2 vUv;

void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const liquidFragSource = `#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}

vec2 get_img_uv() {
    vec2 img_uv = vUv;
    img_uv -= .5;
    if (u_ratio > u_img_ratio) {
        img_uv.x = img_uv.x * u_ratio / u_img_ratio;
    } else {
        img_uv.y = img_uv.y * u_img_ratio / u_ratio;
    }
    float scale_factor = 1.;
    img_uv *= scale_factor;
    img_uv += .5;
    img_uv.y = 1. - img_uv.y;
    return img_uv;
}
vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
    float ch = c2;
    float border = 0.;
    float blur = u_patternBlur + extra_blur;
    ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
    border = w[0];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    b = smoothstep(.2, .8, b);
    border = w[0] + .4 * (1. - b) * w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + .5 * (1. - b) * w[1];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
    float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
    ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
    return ch;
}
float get_img_frame_alpha(vec2 uv, float img_frame_width) {
    float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
    img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
    return img_frame_alpha;
}
void main() {
    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    uv.x *= u_ratio;
    float diagonal = uv.x - uv.y;
    float t = .001 * u_time;
    vec2 img_uv = get_img_uv();
    vec4 img = texture(u_image_texture, img_uv);
    vec3 color = vec3(0.);
    float opacity = 1.;
    vec3 color1 = vec3(.98, 0.98, 1.);
    vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));
    float edge = img.r;
    vec2 grad_uv = uv;
    grad_uv -= .5;
    float dist = length(grad_uv + vec2(0., .2 * diagonal));
    grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
    float bulge = pow(1.8 * dist, 1.2);
    bulge = 1. - bulge;
    bulge *= pow(uv.y, .3);
    float cycle_width = u_patternScale;
    float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
    float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
    float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
    float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
    float thin_strip_2_width = cycle_width * thin_strip_2_ratio;
    opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
    opacity *= get_img_frame_alpha(img_uv, 0.01);
    float noise = snoise(uv - t);
    edge += (1. - edge) * u_liquid * noise;
    float refr = 0.;
    refr += (1. - bulge);
    refr = clamp(refr, 0., 1.);
    float dir = grad_uv.x;
    dir += diagonal;
    dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
    bulge *= clamp(pow(uv.y, .1), .3, 1.);
    dir *= (.1 + (1.1 - edge) * bulge);
    dir *= smoothstep(1., .7, edge);
    dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
    dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
    dir *= (.5 + .5 * pow(uv.y, 2.));
    dir *= cycle_width;
    dir -= t;
    float refr_r = refr;
    refr_r += .03 * bulge * noise;
    float refr_b = 1.3 * refr;
    refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
    refr_r -= diagonal;
    refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
    refr_b -= .2 * edge;
    refr_r *= u_refraction;
    refr_b *= u_refraction;
    vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
    w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
    float stripe_r = mod(dir + refr_r, 1.);
    float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);
    float stripe_g = mod(dir, 1.);
    float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);
    float stripe_b = mod(dir - refr_b, 1.);
    float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);
    color = vec3(r, g, b);
    color *= opacity;
    fragColor = vec4(color, opacity);
}
`;
function MetallicPaint({ imageData, params = defaultParams, }) {
    const canvasRef = useRef(null);
    const [gl, setGl] = useState(null);
    const [uniforms, setUniforms] = useState({});
    const totalAnimationTime = useRef(0);
    const lastRenderTime = useRef(0);
    function updateUniforms() {
        if (!gl || !uniforms)
            return;
        gl.uniform1f(uniforms.u_edge, params.edge);
        gl.uniform1f(uniforms.u_patternBlur, params.patternBlur);
        gl.uniform1f(uniforms.u_time, 0);
        gl.uniform1f(uniforms.u_patternScale, params.patternScale);
        gl.uniform1f(uniforms.u_refraction, params.refraction);
        gl.uniform1f(uniforms.u_liquid, params.liquid);
    }
    useEffect(() => {
        function initShader() {
            const canvas = canvasRef.current;
            const gl = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("webgl2", {
                antialias: true,
                alpha: true,
            });
            if (!canvas || !gl) {
                return;
            }
            function createShader(gl, sourceCode, type) {
                const shader = gl.createShader(type);
                if (!shader) {
                    return null;
                }
                gl.shaderSource(shader, sourceCode);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error("An error occurred compiling the shaders: " +
                        gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            }
            const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
            const fragmentShader = createShader(gl, liquidFragSource, gl.FRAGMENT_SHADER);
            const program = gl.createProgram();
            if (!program || !vertexShader || !fragmentShader) {
                return;
            }
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Unable to initialize the shader program: " +
                    gl.getProgramInfoLog(program));
                return null;
            }
            function getUniforms(program, gl) {
                var _a;
                let uniforms = {};
                let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    let uniformName = (_a = gl.getActiveUniform(program, i)) === null || _a === void 0 ? void 0 : _a.name;
                    if (!uniformName)
                        continue;
                    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
                }
                return uniforms;
            }
            const uniforms = getUniforms(program, gl);
            setUniforms(uniforms);
            const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.useProgram(program);
            const positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            setGl(gl);
        }
        initShader();
        updateUniforms();
    }, []);
    useEffect(() => {
        if (!gl || !uniforms)
            return;
        updateUniforms();
    }, [gl, params, uniforms]);
    useEffect(() => {
        if (!gl || !uniforms)
            return;
        let renderId;
        function render(currentTime) {
            const deltaTime = currentTime - lastRenderTime.current;
            lastRenderTime.current = currentTime;
            totalAnimationTime.current += deltaTime * params.speed;
            gl.uniform1f(uniforms.u_time, totalAnimationTime.current);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            renderId = requestAnimationFrame(render);
        }
        lastRenderTime.current = performance.now();
        renderId = requestAnimationFrame(render);
        return () => {
            cancelAnimationFrame(renderId);
        };
    }, [gl, params.speed]);
    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl || !gl || !uniforms)
            return;
        function resizeCanvas() {
            if (!canvasEl || !gl || !uniforms || !imageData)
                return;
            const imgRatio = imageData.width / imageData.height;
            gl.uniform1f(uniforms.u_img_ratio, imgRatio);
            const side = 1000;
            canvasEl.width = side * devicePixelRatio;
            canvasEl.height = side * devicePixelRatio;
            gl.viewport(0, 0, canvasEl.height, canvasEl.height);
            gl.uniform1f(uniforms.u_ratio, 1);
            gl.uniform1f(uniforms.u_img_ratio, imgRatio);
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [gl, uniforms, imageData]);
    useEffect(() => {
        if (!gl || !uniforms)
            return;
        const existingTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        if (existingTexture) {
            gl.deleteTexture(existingTexture);
        }
        const imageTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageData === null || imageData === void 0 ? void 0 : imageData.width, imageData === null || imageData === void 0 ? void 0 : imageData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData === null || imageData === void 0 ? void 0 : imageData.data);
            gl.uniform1i(uniforms.u_image_texture, 0);
        }
        catch (e) {
            console.error("Error uploading texture:", e);
        }
        return () => {
            if (imageTexture) {
                gl.deleteTexture(imageTexture);
            }
        };
    }, [gl, uniforms, imageData]);
    return;
}

const Noise = ({ patternSize = 250, patternScaleX = 1, patternScaleY = 1, patternRefreshInterval = 2, patternAlpha = 15, }) => {
    const grainRef = useRef(null);
    useEffect(() => {
        const canvas = grainRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        let frame = 0;
        const patternCanvas = document.createElement("canvas");
        patternCanvas.width = patternSize;
        patternCanvas.height = patternSize;
        const patternCtx = patternCanvas.getContext("2d");
        if (!patternCtx)
            return;
        const patternData = patternCtx.createImageData(patternSize, patternSize);
        const patternPixelDataLength = patternSize * patternSize * 4;
        const resize = () => {
            if (!canvas)
                return;
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            ctx.scale(patternScaleX, patternScaleY);
        };
        const updatePattern = () => {
            for (let i = 0; i < patternPixelDataLength; i += 4) {
                const value = Math.random() * 255;
                patternData.data[i] = value;
                patternData.data[i + 1] = value;
                patternData.data[i + 2] = value;
                patternData.data[i + 3] = patternAlpha;
            }
            patternCtx.putImageData(patternData, 0, 0);
        };
        const drawGrain = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const pattern = ctx.createPattern(patternCanvas, "repeat");
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };
        const loop = () => {
            if (frame % patternRefreshInterval === 0) {
                updatePattern();
                drawGrain();
            }
            frame++;
            window.requestAnimationFrame(loop);
        };
        window.addEventListener("resize", resize);
        resize();
        loop();
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [
        patternSize,
        patternScaleX,
        patternScaleY,
        patternRefreshInterval,
        patternAlpha,
    ]);
    return (jsxs(Fragment, { children: [jsx("style", { children: `
  .noise-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
  ` }), jsx("canvas", { className: "noise-overlay", ref: grainRef })] }));
};

const lerp$3 = (a, b, n) => (1 - n) * a + n * b;
const getMousePos = (e, container) => {
    const mouseEvent = e;
    if (container) {
        const bounds = container.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - bounds.left,
            y: mouseEvent.clientY - bounds.top,
        };
    }
    return { x: mouseEvent.clientX, y: mouseEvent.clientY };
};
const Crosshair = ({ color = "white", containerRef = null, }) => {
    const cursorRef = useRef(null);
    const lineHorizontalRef = useRef(null);
    const lineVerticalRef = useRef(null);
    const filterXRef = useRef(null);
    const filterYRef = useRef(null);
    let mouse = { x: 0, y: 0 };
    useEffect(() => {
        const handleMouseMove = (ev) => {
            const mouseEvent = ev;
            mouse = getMousePos(mouseEvent, containerRef === null || containerRef === void 0 ? void 0 : containerRef.current);
            if (containerRef === null || containerRef === void 0 ? void 0 : containerRef.current) {
                const bounds = containerRef.current.getBoundingClientRect();
                if (mouseEvent.clientX < bounds.left ||
                    mouseEvent.clientX > bounds.right ||
                    mouseEvent.clientY < bounds.top ||
                    mouseEvent.clientY > bounds.bottom) {
                    gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), { opacity: 0 });
                }
                else {
                    gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), { opacity: 1 });
                }
            }
        };
        const target = (containerRef === null || containerRef === void 0 ? void 0 : containerRef.current) || window;
        target.addEventListener("mousemove", handleMouseMove);
        const renderedStyles = {
            tx: { previous: 0, current: 0, amt: 0.15 },
            ty: { previous: 0, current: 0, amt: 0.15 },
        };
        gsap.set([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), { opacity: 0 });
        const onMouseMove = (_ev) => {
            renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
            renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;
            gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), {
                duration: 0.9,
                ease: "Power3.easeOut",
                opacity: 1,
            });
            requestAnimationFrame(render);
            target.removeEventListener("mousemove", onMouseMove);
        };
        target.addEventListener("mousemove", onMouseMove);
        const primitiveValues = { turbulence: 0 };
        const tl = gsap
            .timeline({
            paused: true,
            onStart: () => {
                if (lineHorizontalRef.current) {
                    lineHorizontalRef.current.style.filter = "url(#filter-noise-x)";
                }
                if (lineVerticalRef.current) {
                    lineVerticalRef.current.style.filter = "url(#filter-noise-y)";
                }
            },
            onUpdate: () => {
                if (filterXRef.current && filterYRef.current) {
                    filterXRef.current.setAttribute("baseFrequency", primitiveValues.turbulence.toString());
                    filterYRef.current.setAttribute("baseFrequency", primitiveValues.turbulence.toString());
                }
            },
            onComplete: () => {
                if (lineHorizontalRef.current && lineVerticalRef.current) {
                    lineHorizontalRef.current.style.filter = "none";
                    lineVerticalRef.current.style.filter = "none";
                }
            },
        })
            .to(primitiveValues, {
            duration: 0.5,
            ease: "power1",
            startAt: { turbulence: 1 },
            turbulence: 0,
        });
        const enter = () => tl.restart();
        const leave = () => {
            tl.progress(1).kill();
        };
        const render = () => {
            renderedStyles.tx.current = mouse.x;
            renderedStyles.ty.current = mouse.y;
            for (const key in renderedStyles) {
                const style = renderedStyles[key];
                style.previous = lerp$3(style.previous, style.current, style.amt);
            }
            if (lineHorizontalRef.current && lineVerticalRef.current) {
                gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
                gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });
            }
            requestAnimationFrame(render);
        };
        const links = (containerRef === null || containerRef === void 0 ? void 0 : containerRef.current)
            ? containerRef.current.querySelectorAll("a")
            : document.querySelectorAll("a");
        links.forEach((link) => {
            link.addEventListener("mouseenter", enter);
            link.addEventListener("mouseleave", leave);
        });
        return () => {
            target.removeEventListener("mousemove", handleMouseMove);
            target.removeEventListener("mousemove", onMouseMove);
            links.forEach((link) => {
                link.removeEventListener("mouseenter", enter);
                link.removeEventListener("mouseleave", leave);
            });
        };
    }, [containerRef]);
    return (jsxs("div", { ref: cursorRef, className: "cursor", style: {
            position: containerRef ? "absolute" : "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10000,
        }, children: [jsx("svg", { style: {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                }, children: jsxs("defs", { children: [jsxs("filter", { id: "filter-noise-x", children: [jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.000001", numOctaves: "1", ref: filterXRef }), jsx("feDisplacementMap", { in: "SourceGraphic", scale: "40" })] }), jsxs("filter", { id: "filter-noise-y", children: [jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.000001", numOctaves: "1", ref: filterYRef }), jsx("feDisplacementMap", { in: "SourceGraphic", scale: "40" })] })] }) }), jsx("div", { ref: lineHorizontalRef, style: {
                    position: "absolute",
                    width: "100%",
                    height: "1px",
                    background: color,
                    pointerEvents: "none",
                    transform: "translateY(50%)",
                    opacity: 0,
                } }), jsx("div", { ref: lineVerticalRef, style: {
                    position: "absolute",
                    height: "100%",
                    width: "1px",
                    background: color,
                    pointerEvents: "none",
                    transform: "translateX(50%)",
                    opacity: 0,
                } })] }));
};

// import "./ImageTrail.css";
function lerp$2(a, b, n) {
    return (1 - n) * a + n * b;
}
function getLocalPointerPos(e, rect) {
    let clientX = 0, clientY = 0;
    if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
}
function getMouseDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
}
class ImageItem {
    constructor(DOM_el) {
        this.DOM = {
            el: null,
            inner: null,
        };
        this.defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
        this.rect = null;
        this.DOM.el = DOM_el;
        this.DOM.inner = this.DOM.el.querySelector(".content__img-inner");
        this.getRect();
        this.initEvents();
    }
    initEvents() {
        this.resize = () => {
            gsap.set(this.DOM.el, this.defaultStyle);
            this.getRect();
        };
        window.addEventListener("resize", this.resize);
    }
    getRect() {
        this.rect = this.DOM.el.getBoundingClientRect();
    }
}
class ImageTrailVariant1 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        const handlePointerMove = (ev) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            scale: 1,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.4,
            ease: "power1",
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "power3",
            opacity: 0,
            scale: 0.2,
        }, 0.4);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
class ImageTrailVariant2 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            scale: 0,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0)
            .fromTo(img.DOM.inner, { scale: 2.8, filter: "brightness(250%)" }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            filter: "brightness(100%)",
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "power2",
            opacity: 0,
            scale: 0.2,
        }, 0.45);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
class ImageTrailVariant3 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            scale: 0,
            zIndex: this.zIndexVal,
            xPercent: 0,
            yPercent: 0,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0)
            .fromTo(img.DOM.inner, { scale: 1.2 }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
        }, 0)
            .to(img.DOM.el, {
            duration: 0.6,
            ease: "power2",
            opacity: 0,
            scale: 0.2,
            xPercent: () => gsap.utils.random(-30, 30),
            yPercent: -200,
        }, 0.6);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
class ImageTrailVariant4 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (this.isIdle && this.zIndexVal !== 1)
            this.zIndexVal = 1;
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        let dx = this.mousePos.x - this.cacheMousePos.x;
        let dy = this.mousePos.y - this.cacheMousePos.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance !== 0) {
            dx /= distance;
            dy /= distance;
        }
        dx *= distance / 100;
        dy *= distance / 100;
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            scale: 0,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0)
            .fromTo(img.DOM.inner, {
            scale: 2,
            filter: `brightness(${Math.max((400 * distance) / 100, 100)}%) contrast(${Math.max((400 * distance) / 100, 100)}%)`,
        }, {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            filter: "brightness(100%) contrast(100%)",
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "power3",
            opacity: 0,
        }, 0.4)
            .to(img.DOM.el, {
            duration: 1.5,
            ease: "power4",
            x: `+=${dx * 110}`,
            y: `+=${dy * 110}`,
        }, 0.05);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
class ImageTrailVariant5 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        this.lastAngle = 0;
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (this.isIdle && this.zIndexVal !== 1)
            this.zIndexVal = 1;
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let dx = this.mousePos.x - this.cacheMousePos.x;
        let dy = this.mousePos.y - this.cacheMousePos.y;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0)
            angle += 360;
        if (angle > 90 && angle <= 270)
            angle += 180;
        const isMovingClockwise = angle >= this.lastAngle;
        this.lastAngle = angle;
        let startAngle = isMovingClockwise ? angle - 10 : angle + 10;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance !== 0) {
            dx /= distance;
            dy /= distance;
        }
        dx *= distance / 150;
        dy *= distance / 150;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            filter: "brightness(80%)",
            scale: 0.1,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
            rotation: startAngle,
        }, {
            duration: 1,
            ease: "power2",
            scale: 1,
            filter: "brightness(100%)",
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2 + dx * 70,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2 + dy * 70,
            rotation: this.lastAngle,
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "expo",
            opacity: 0,
        }, 0.5)
            .to(img.DOM.el, {
            duration: 1.5,
            ease: "power4",
            x: `+=${dx * 120}`,
            y: `+=${dy * 120}`,
        }, 0.05);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0)
            this.isIdle = true;
    }
}
class ImageTrailVariant6 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.3);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.3);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }
        requestAnimationFrame(() => this.render());
    }
    mapSpeedToSize(speed, minSize, maxSize) {
        const maxSpeed = 200;
        return minSize + (maxSize - minSize) * Math.min(speed / maxSpeed, 1);
    }
    mapSpeedToBrightness(speed, minB, maxB) {
        const maxSpeed = 70;
        return minB + (maxB - minB) * Math.min(speed / maxSpeed, 1);
    }
    mapSpeedToBlur(speed, minBlur, maxBlur) {
        const maxSpeed = 90;
        return minBlur + (maxBlur - minBlur) * Math.min(speed / maxSpeed, 1);
    }
    mapSpeedToGrayscale(speed, minG, maxG) {
        const maxSpeed = 90;
        return minG + (maxG - minG) * Math.min(speed / maxSpeed, 1);
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const dx = this.mousePos.x - this.cacheMousePos.x;
        const dy = this.mousePos.y - this.cacheMousePos.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        const scaleFactor = this.mapSpeedToSize(speed, 0.3, 2);
        const brightnessValue = this.mapSpeedToBrightness(speed, 0, 1.3);
        const blurValue = this.mapSpeedToBlur(speed, 20, 0);
        const grayscaleValue = this.mapSpeedToGrayscale(speed, 600, 0);
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            opacity: 1,
            scale: 0,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.8,
            ease: "power3",
            scale: scaleFactor,
            filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0)
            .fromTo(img.DOM.inner, { scale: 2 }, {
            duration: 0.8,
            ease: "power3",
            scale: 1,
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "power3.in",
            opacity: 0,
            scale: 0.2,
        }, 0.45);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
function getNewPosition(position, offset, arr) {
    const realOffset = Math.abs(offset) % arr.length;
    if (position - realOffset >= 0) {
        return position - realOffset;
    }
    else {
        return arr.length - (realOffset - position);
    }
}
class ImageTrailVariant7 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        this.visibleImagesCount = 0;
        this.visibleImagesTotal = 9;
        this.visibleImagesTotal = Math.min(this.visibleImagesTotal, this.imagesTotal - 1);
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.3);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.3);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1)
            this.zIndexVal = 1;
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        ++this.visibleImagesCount;
        gsap.killTweensOf(img.DOM.el);
        const scaleValue = gsap.utils.random(0.5, 1.6);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .fromTo(img.DOM.el, {
            scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.6), 0),
            rotationZ: 0,
            opacity: 1,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
        }, {
            duration: 0.4,
            ease: "power3",
            scale: scaleValue,
            rotationZ: gsap.utils.random(-3, 3),
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
        }, 0);
        if (this.visibleImagesCount >= this.visibleImagesTotal) {
            const lastInQueue = getNewPosition(this.imgPosition, this.visibleImagesTotal, this.images);
            const oldImg = this.images[lastInQueue];
            gsap.to(oldImg.DOM.el, {
                duration: 0.4,
                ease: "power4",
                opacity: 0,
                scale: 1.3,
                onComplete: () => {
                    if (this.activeImagesCount === 0) {
                        this.isIdle = true;
                    }
                },
            });
        }
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
    }
}
class ImageTrailVariant8 {
    constructor(container) {
        this.container = container;
        this.DOM = { el: container };
        this.images = [...container.querySelectorAll(".content__img")].map((img) => new ImageItem(img));
        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.activeImagesCount = 0;
        this.isIdle = true;
        this.threshold = 80;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.cacheMousePos = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.cachedRotation = { x: 0, y: 0 };
        this.zValue = 0;
        this.cachedZValue = 0;
        const handlePointerMove = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
        };
        container.addEventListener("mousemove", handlePointerMove);
        container.addEventListener("touchmove", handlePointerMove);
        const initRender = (ev) => {
            const rect = container.getBoundingClientRect();
            this.mousePos = getLocalPointerPos(ev, rect);
            this.cacheMousePos = { ...this.mousePos };
            requestAnimationFrame(() => this.render());
            container.removeEventListener("mousemove", initRender);
            container.removeEventListener("touchmove", initRender);
        };
        container.addEventListener("mousemove", initRender);
        container.addEventListener("touchmove", initRender);
    }
    render() {
        const distance = getMouseDistance(this.mousePos, this.lastMousePos);
        this.cacheMousePos.x = lerp$2(this.cacheMousePos.x, this.mousePos.x, 0.1);
        this.cacheMousePos.y = lerp$2(this.cacheMousePos.y, this.mousePos.y, 0.1);
        if (distance > this.threshold) {
            this.showNextImage();
            this.lastMousePos = { ...this.mousePos };
        }
        if (this.isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }
        requestAnimationFrame(() => this.render());
    }
    showNextImage() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = this.mousePos.x - centerX;
        const relY = this.mousePos.y - centerY;
        this.rotation.x = -(relY / centerY) * 30;
        this.rotation.y = (relX / centerX) * 30;
        this.cachedRotation = { ...this.rotation };
        const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const proportion = distanceFromCenter / maxDistance;
        this.zValue = proportion * 1200 - 600;
        this.cachedZValue = this.zValue;
        const normalizedZ = (this.zValue + 600) / 1200;
        const brightness = 0.2 + normalizedZ * 2.3;
        ++this.zIndexVal;
        this.imgPosition =
            this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);
        gsap
            .timeline({
            onStart: () => this.onImageActivated(),
            onComplete: () => this.onImageDeactivated(),
        })
            .set(this.DOM.el, { perspective: 1000 }, 0)
            .fromTo(img.DOM.el, {
            opacity: 1,
            z: 0,
            scale: 1 + this.cachedZValue / 1000,
            zIndex: this.zIndexVal,
            x: this.cacheMousePos.x - ((_b = (_a = img.rect) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) / 2,
            y: this.cacheMousePos.y - ((_d = (_c = img.rect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2,
            rotationX: this.cachedRotation.x,
            rotationY: this.cachedRotation.y,
            filter: `brightness(${brightness})`,
        }, {
            duration: 1,
            ease: "expo",
            scale: 1 + this.zValue / 1000,
            x: this.mousePos.x - ((_f = (_e = img.rect) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2,
            y: this.mousePos.y - ((_h = (_g = img.rect) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2,
            rotationX: this.rotation.x,
            rotationY: this.rotation.y,
        }, 0)
            .to(img.DOM.el, {
            duration: 0.4,
            ease: "power2",
            opacity: 0,
            z: -800,
        }, 0.3);
    }
    onImageActivated() {
        this.activeImagesCount++;
        this.isIdle = false;
    }
    onImageDeactivated() {
        this.activeImagesCount--;
        if (this.activeImagesCount === 0) {
            this.isIdle = true;
        }
    }
}
const variantMap = {
    1: ImageTrailVariant1,
    2: ImageTrailVariant2,
    3: ImageTrailVariant3,
    4: ImageTrailVariant4,
    5: ImageTrailVariant5,
    6: ImageTrailVariant6,
    7: ImageTrailVariant7,
    8: ImageTrailVariant8,
};
function ImageTrail({ items = [], variant = 1, }) {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current)
            return;
        const Cls = variantMap[variant] || variantMap[1];
        new Cls(containerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant, items]);
    return (jsxs(Fragment, { children: [jsx("style", { children: `
    .content {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 100;
  border-radius: 8px;
  background: transparent;
  overflow: visible;
}

.content__img {
  width: 190px;
  aspect-ratio: 1.1;
  border-radius: 15px;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  overflow: hidden;
  will-change: transform, filter;
}

.content__img-inner {
  background-position: 50% 50%;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  background-size: cover;
  position: absolute;
  top: calc(-1 * 20px / 2);
  left: calc(-1 * 20px / 2);
}
    ` }), jsx("div", { className: "content", ref: containerRef, children: items.map((url, i) => (jsx("div", { className: "content__img", children: jsx("div", { className: "content__img-inner", style: { backgroundImage: `url(${url})` } }) }, i))) })] }));
}

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length$1(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy$5(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set$5(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add$2(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract$2(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply$4(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide$1(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale$3(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance$1(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance$1(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength$1(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
}

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate$1(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse$1(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize$3(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
}

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot$3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross$1(out, a, b) {
    let ax = a[0],
        ay = a[1],
        az = a[2];
    let bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp$1(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}

/**
 * Performs a frame rate independant, linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} decay decay constant for interpolation. useful range between 1 and 25, from slow to fast.
 * @param {Number} dt delta time
 * @returns {vec3} out
 */
function smoothLerp$1(out, a, b, decay, dt) {
    const exp = Math.exp(-decay * dt);
    let ax = a[0];
    let ay = a[1];
    let az = a[2];

    out[0] = b[0] + (ax - b[0]) * exp;
    out[1] = b[1] + (ay - b[1]) * exp;
    out[2] = b[2] + (az - b[2]) * exp;
    return out;
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4$1(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}

/**
 * Same as above but doesn't apply translation.
 * Useful for rays.
 */
function scaleRotateMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
}

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3$1(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed

    let x = a[0],
        y = a[1],
        z = a[2];
    let qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3];

    let uvx = qy * z - qz * y;
    let uvy = qz * x - qx * z;
    let uvz = qx * y - qy * x;

    let uuvx = qy * uvz - qz * uvy;
    let uuvy = qz * uvx - qx * uvz;
    let uuvz = qx * uvy - qy * uvx;

    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;

    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;

    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
const angle = (function () {
    const tempA = [0, 0, 0];
    const tempB = [0, 0, 0];

    return function (a, b) {
        copy$5(tempA, a);
        copy$5(tempB, b);

        normalize$3(tempA, tempA);
        normalize$3(tempB, tempB);

        let cosine = dot$3(tempA, tempB);

        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    };
})();

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals$1(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        set$5(this, x, y, z);
        return this;
    }

    copy(v) {
        copy$5(this, v);
        return this;
    }

    add(va, vb) {
        if (vb) add$2(this, va, vb);
        else add$2(this, this, va);
        return this;
    }

    sub(va, vb) {
        if (vb) subtract$2(this, va, vb);
        else subtract$2(this, this, va);
        return this;
    }

    multiply(v) {
        if (v.length) multiply$4(this, this, v);
        else scale$3(this, this, v);
        return this;
    }

    divide(v) {
        if (v.length) divide$1(this, this, v);
        else scale$3(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        inverse$1(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return length$1(this);
    }

    distance(v) {
        if (v) return distance$1(this, v);
        else return length$1(this);
    }

    squaredLen() {
        return squaredLength$1(this);
    }

    squaredDistance(v) {
        if (v) return squaredDistance$1(this, v);
        else return squaredLength$1(this);
    }

    negate(v = this) {
        negate$1(this, v);
        return this;
    }

    cross(va, vb) {
        if (vb) cross$1(this, va, vb);
        else cross$1(this, this, va);
        return this;
    }

    scale(v) {
        scale$3(this, this, v);
        return this;
    }

    normalize() {
        normalize$3(this, this);
        return this;
    }

    dot(v) {
        return dot$3(this, v);
    }

    equals(v) {
        return exactEquals$1(this, v);
    }

    applyMatrix3(mat3) {
        transformMat3$1(this, this, mat3);
        return this;
    }

    applyMatrix4(mat4) {
        transformMat4$1(this, this, mat4);
        return this;
    }

    scaleRotateMatrix4(mat4) {
        scaleRotateMat4(this, this, mat4);
        return this;
    }

    applyQuaternion(q) {
        transformQuat(this, this, q);
        return this;
    }

    angle(v) {
        return angle(this, v);
    }

    lerp(v, t) {
        lerp$1(this, this, v, t);
        return this;
    }

    smoothLerp(v, decay, dt) {
        smoothLerp$1(this, this, v, decay, dt);
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize();
    }
}

// attribute params
// {
//     data - typed array eg UInt16Array for indices, Float32Array
//     size - int default 1
//     instanced - default null. Pass divisor amount
//     type - gl enum default gl.UNSIGNED_SHORT for 'index', gl.FLOAT for others
//     normalized - boolean default false


const tempVec3$1 = /* @__PURE__ */ new Vec3();

let ID$3 = 1;
let ATTR_ID = 1;

// To stop inifinite warnings
let isBoundsWarned = false;

class Geometry {
    constructor(gl, attributes = {}) {
        if (!gl.canvas) console.error('gl not passed as first argument to Geometry');
        this.gl = gl;
        this.attributes = attributes;
        this.id = ID$3++;

        // Store one VAO per program attribute locations order
        this.VAOs = {};

        this.drawRange = { start: 0, count: 0 };
        this.instancedCount = 0;

        // Unbind current VAO so that new buffers don't get added to active mesh
        this.gl.renderer.bindVertexArray(null);
        this.gl.renderer.currentGeometry = null;

        // Alias for state store to avoid redundant calls for global state
        this.glState = this.gl.renderer.state;

        // create the buffers
        for (let key in attributes) {
            this.addAttribute(key, attributes[key]);
        }
    }

    addAttribute(key, attr) {
        this.attributes[key] = attr;

        // Set options
        attr.id = ATTR_ID++; // TODO: currently unused, remove?
        attr.size = attr.size || 1;
        attr.type =
            attr.type ||
            (attr.data.constructor === Float32Array
                ? this.gl.FLOAT
                : attr.data.constructor === Uint16Array
                ? this.gl.UNSIGNED_SHORT
                : this.gl.UNSIGNED_INT); // Uint32Array
        attr.target = key === 'index' ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        attr.normalized = attr.normalized || false;
        attr.stride = attr.stride || 0;
        attr.offset = attr.offset || 0;
        attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
        attr.divisor = attr.instanced || 0;
        attr.needsUpdate = false;
        attr.usage = attr.usage || this.gl.STATIC_DRAW;

        if (!attr.buffer) {
            // Push data to buffer
            this.updateAttribute(attr);
        }

        // Update geometry counts. If indexed, ignore regular attributes
        if (attr.divisor) {
            this.isInstanced = true;
            if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
                console.warn('geometry has multiple instanced buffers of different length');
                return (this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor));
            }
            this.instancedCount = attr.count * attr.divisor;
        } else if (key === 'index') {
            this.drawRange.count = attr.count;
        } else if (!this.attributes.index) {
            this.drawRange.count = Math.max(this.drawRange.count, attr.count);
        }
    }

    updateAttribute(attr) {
        const isNewBuffer = !attr.buffer;
        if (isNewBuffer) attr.buffer = this.gl.createBuffer();
        if (this.glState.boundBuffer !== attr.buffer) {
            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;
        }
        if (isNewBuffer) {
            this.gl.bufferData(attr.target, attr.data, attr.usage);
        } else {
            this.gl.bufferSubData(attr.target, 0, attr.data);
        }
        attr.needsUpdate = false;
    }

    setIndex(value) {
        this.addAttribute('index', value);
    }

    setDrawRange(start, count) {
        this.drawRange.start = start;
        this.drawRange.count = count;
    }

    setInstancedCount(value) {
        this.instancedCount = value;
    }

    createVAO(program) {
        this.VAOs[program.attributeOrder] = this.gl.renderer.createVertexArray();
        this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
        this.bindAttributes(program);
    }

    bindAttributes(program) {
        // Link all attributes to program using gl.vertexAttribPointer
        program.attributeLocations.forEach((location, { name, type }) => {
            // If geometry missing a required shader attribute
            if (!this.attributes[name]) {
                console.warn(`active attribute ${name} not being supplied`);
                return;
            }

            const attr = this.attributes[name];

            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;

            // For matrix attributes, buffer needs to be defined per column
            let numLoc = 1;
            if (type === 35674) numLoc = 2; // mat2
            if (type === 35675) numLoc = 3; // mat3
            if (type === 35676) numLoc = 4; // mat4

            const size = attr.size / numLoc;
            const stride = numLoc === 1 ? 0 : numLoc * numLoc * 4;
            const offset = numLoc === 1 ? 0 : numLoc * 4;

            for (let i = 0; i < numLoc; i++) {
                this.gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
                this.gl.enableVertexAttribArray(location + i);

                // For instanced attributes, divisor needs to be set.
                // For firefox, need to set back to 0 if non-instanced drawn after instanced. Else won't render
                this.gl.renderer.vertexAttribDivisor(location + i, attr.divisor);
            }
        });

        // Bind indices if geometry indexed
        if (this.attributes.index) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
    }

    draw({ program, mode = this.gl.TRIANGLES }) {
        if (this.gl.renderer.currentGeometry !== `${this.id}_${program.attributeOrder}`) {
            if (!this.VAOs[program.attributeOrder]) this.createVAO(program);
            this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
            this.gl.renderer.currentGeometry = `${this.id}_${program.attributeOrder}`;
        }

        // Check if any attributes need updating
        program.attributeLocations.forEach((location, { name }) => {
            const attr = this.attributes[name];
            if (attr.needsUpdate) this.updateAttribute(attr);
        });

        // For drawElements, offset needs to be multiple of type size
        let indexBytesPerElement = 2;
        if (this.attributes.index?.type === this.gl.UNSIGNED_INT) indexBytesPerElement = 4;

        if (this.isInstanced) {
            if (this.attributes.index) {
                this.gl.renderer.drawElementsInstanced(
                    mode,
                    this.drawRange.count,
                    this.attributes.index.type,
                    this.attributes.index.offset + this.drawRange.start * indexBytesPerElement,
                    this.instancedCount
                );
            } else {
                this.gl.renderer.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
            }
        } else {
            if (this.attributes.index) {
                this.gl.drawElements(
                    mode,
                    this.drawRange.count,
                    this.attributes.index.type,
                    this.attributes.index.offset + this.drawRange.start * indexBytesPerElement
                );
            } else {
                this.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
            }
        }
    }

    getPosition() {
        // Use position buffer, or min/max if available
        const attr = this.attributes.position;
        // if (attr.min) return [...attr.min, ...attr.max];
        if (attr.data) return attr;
        if (isBoundsWarned) return;
        console.warn('No position buffer data found to compute bounds');
        return (isBoundsWarned = true);
    }

    computeBoundingBox(attr) {
        if (!attr) attr = this.getPosition();
        const array = attr.data;
        // Data loaded shouldn't haave stride, only buffers
        // const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        const stride = attr.size;

        if (!this.bounds) {
            this.bounds = {
                min: new Vec3(),
                max: new Vec3(),
                center: new Vec3(),
                scale: new Vec3(),
                radius: Infinity,
            };
        }

        const min = this.bounds.min;
        const max = this.bounds.max;
        const center = this.bounds.center;
        const scale = this.bounds.scale;

        min.set(+Infinity);
        max.set(-Infinity);

        // TODO: check size of position (eg triangle with Vec2)
        for (let i = 0, l = array.length; i < l; i += stride) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];

            min.x = Math.min(x, min.x);
            min.y = Math.min(y, min.y);
            min.z = Math.min(z, min.z);

            max.x = Math.max(x, max.x);
            max.y = Math.max(y, max.y);
            max.z = Math.max(z, max.z);
        }

        scale.sub(max, min);
        center.add(min, max).divide(2);
    }

    computeBoundingSphere(attr) {
        if (!attr) attr = this.getPosition();
        const array = attr.data;
        // Data loaded shouldn't haave stride, only buffers
        // const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        const stride = attr.size;

        if (!this.bounds) this.computeBoundingBox(attr);

        let maxRadiusSq = 0;
        for (let i = 0, l = array.length; i < l; i += stride) {
            tempVec3$1.fromArray(array, i);
            maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3$1));
        }

        this.bounds.radius = Math.sqrt(maxRadiusSq);
    }

    remove() {
        for (let key in this.VAOs) {
            this.gl.renderer.deleteVertexArray(this.VAOs[key]);
            delete this.VAOs[key];
        }
        for (let key in this.attributes) {
            this.gl.deleteBuffer(this.attributes[key].buffer);
            delete this.attributes[key];
        }
    }
}

// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

let ID$2 = 1;

// cache of typed arrays used to flatten uniform arrays
const arrayCacheF32 = {};

class Program {
    constructor(
        gl,
        {
            vertex,
            fragment,
            uniforms = {},

            transparent = false,
            cullFace = gl.BACK,
            frontFace = gl.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = gl.LEQUAL,
        } = {}
    ) {
        if (!gl.canvas) console.error('gl not passed as first argument to Program');
        this.gl = gl;
        this.uniforms = uniforms;
        this.id = ID$2++;

        if (!vertex) console.warn('vertex shader not supplied');
        if (!fragment) console.warn('fragment shader not supplied');

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};
        this.stencilFunc = {};
        this.stencilOp = {};

        // set default blendFunc if transparent flagged
        if (this.transparent && !this.blendFunc.src) {
            if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        // Create empty shaders and attach to program
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);

        // Compile shaders with source
        this.setShaders({ vertex, fragment });
    }

    setShaders({ vertex, fragment }) {
        if (vertex) {
            // compile vertex shader and log errors
            this.gl.shaderSource(this.vertexShader, vertex);
            this.gl.compileShader(this.vertexShader);
            if (this.gl.getShaderInfoLog(this.vertexShader) !== '') {
                console.warn(`${this.gl.getShaderInfoLog(this.vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
            }
        }

        if (fragment) {
            // compile fragment shader and log errors
            this.gl.shaderSource(this.fragmentShader, fragment);
            this.gl.compileShader(this.fragmentShader);
            if (this.gl.getShaderInfoLog(this.fragmentShader) !== '') {
                console.warn(`${this.gl.getShaderInfoLog(this.fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
            }
        }

        // compile program and log errors
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            return console.warn(this.gl.getProgramInfoLog(this.program));
        }

        // Get active uniform locations
        this.uniformLocations = new Map();
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
            let uniform = this.gl.getActiveUniform(this.program, uIndex);
            this.uniformLocations.set(uniform, this.gl.getUniformLocation(this.program, uniform.name));

            // split uniforms' names to separate array and struct declarations
            const split = uniform.name.match(/(\w+)/g);

            uniform.uniformName = split[0];
            uniform.nameComponents = split.slice(1);
        }

        // Get active attribute locations
        this.attributeLocations = new Map();
        const locations = [];
        const numAttribs = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
            const attribute = this.gl.getActiveAttrib(this.program, aIndex);
            const location = this.gl.getAttribLocation(this.program, attribute.name);
            // Ignore special built-in inputs. eg gl_VertexID, gl_InstanceID
            if (location === -1) continue;
            locations[location] = attribute.name;
            this.attributeLocations.set(attribute, location);
        }
        this.attributeOrder = locations.join('');
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB, modeAlpha) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    setStencilFunc(func, ref, mask) {
        this.stencilRef = ref;
        this.stencilFunc.func = func;
        this.stencilFunc.ref = ref;
        this.stencilFunc.mask = mask;
    }

    setStencilOp(stencilFail, depthFail, depthPass) {
        this.stencilOp.stencilFail = stencilFail;
        this.stencilOp.depthFail = depthFail;
        this.stencilOp.depthPass = depthPass;
    }

    applyState() {
        if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
        else this.gl.renderer.disable(this.gl.DEPTH_TEST);

        if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
        else this.gl.renderer.disable(this.gl.CULL_FACE);

        if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
        else this.gl.renderer.disable(this.gl.BLEND);

        if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
        this.gl.renderer.setFrontFace(this.frontFace);
        this.gl.renderer.setDepthMask(this.depthWrite);
        this.gl.renderer.setDepthFunc(this.depthFunc);
        if (this.blendFunc.src) this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);

        if(this.stencilFunc.func || this.stencilOp.stencilFail) this.gl.renderer.enable(this.gl.STENCIL_TEST);
            else this.gl.renderer.disable(this.gl.STENCIL_TEST);

        this.gl.renderer.setStencilFunc(this.stencilFunc.func, this.stencilFunc.ref, this.stencilFunc.mask);
        this.gl.renderer.setStencilOp(this.stencilOp.stencilFail, this.stencilOp.depthFail, this.stencilOp.depthPass);

    }

    use({ flipFaces = false } = {}) {
        let textureUnit = -1;
        const programActive = this.gl.renderer.state.currentProgram === this.id;

        // Avoid gl call if program already in use
        if (!programActive) {
            this.gl.useProgram(this.program);
            this.gl.renderer.state.currentProgram = this.id;
        }

        // Set only the active uniforms found in the shader
        this.uniformLocations.forEach((location, activeUniform) => {
            let uniform = this.uniforms[activeUniform.uniformName];

            for (const component of activeUniform.nameComponents) {
                if (!uniform) break;

                if (component in uniform) {
                    uniform = uniform[component];
                } else if (Array.isArray(uniform.value)) {
                    break;
                } else {
                    uniform = undefined;
                    break;
                }
            }

            if (!uniform) {
                return warn(`Active uniform ${activeUniform.name} has not been supplied`);
            }

            if (uniform && uniform.value === undefined) {
                return warn(`${activeUniform.name} uniform is missing a value parameter`);
            }

            if (uniform.value.texture) {
                textureUnit = textureUnit + 1;

                // Check if texture needs to be updated
                uniform.value.update(textureUnit);
                return setUniform(this.gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value) => {
                    textureUnit = textureUnit + 1;
                    value.update(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(this.gl, activeUniform.type, location, textureUnits);
            }

            setUniform(this.gl, activeUniform.type, location, uniform.value);
        });

        this.applyState();
        if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
    }

    remove() {
        this.gl.deleteProgram(this.program);
    }
}

function setUniform(gl, type, location, value) {
    value = value.length ? flatten(value) : value;
    const setValue = gl.renderer.state.uniformLocations.get(location);

    // Avoid redundant uniform commands
    if (value.length) {
        if (setValue === undefined || setValue.length !== value.length) {
            // clone array to store as cache
            gl.renderer.state.uniformLocations.set(location, value.slice(0));
        } else {
            if (arraysEqual(setValue, value)) return;

            // Update cached array values
            setValue.set ? setValue.set(value) : setArray(setValue, value);
            gl.renderer.state.uniformLocations.set(location, setValue);
        }
    } else {
        if (setValue === value) return;
        gl.renderer.state.uniformLocations.set(location, value);
    }

    switch (type) {
        case 5126:
            return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value); // FLOAT
        case 35664:
            return gl.uniform2fv(location, value); // FLOAT_VEC2
        case 35665:
            return gl.uniform3fv(location, value); // FLOAT_VEC3
        case 35666:
            return gl.uniform4fv(location, value); // FLOAT_VEC4
        case 35670: // BOOL
        case 5124: // INT
        case 35678: // SAMPLER_2D
        case 36306: // U_SAMPLER_2D
        case 35680: // SAMPLER_CUBE
        case 36289: // SAMPLER_2D_ARRAY
            return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value); // SAMPLER_CUBE
        case 35671: // BOOL_VEC2
        case 35667:
            return gl.uniform2iv(location, value); // INT_VEC2
        case 35672: // BOOL_VEC3
        case 35668:
            return gl.uniform3iv(location, value); // INT_VEC3
        case 35673: // BOOL_VEC4
        case 35669:
            return gl.uniform4iv(location, value); // INT_VEC4
        case 35674:
            return gl.uniformMatrix2fv(location, false, value); // FLOAT_MAT2
        case 35675:
            return gl.uniformMatrix3fv(location, false, value); // FLOAT_MAT3
        case 35676:
            return gl.uniformMatrix4fv(location, false, value); // FLOAT_MAT4
    }
}

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}

function flatten(a) {
    const arrayLen = a.length;
    const valueLen = a[0].length;
    if (valueLen === undefined) return a;
    const length = arrayLen * valueLen;
    let value = arrayCacheF32[length];
    if (!value) arrayCacheF32[length] = value = new Float32Array(length);
    for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
    return value;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setArray(a, b) {
    for (let i = 0, l = a.length; i < l; i++) {
        a[i] = b[i];
    }
}

let warnCount = 0;
function warn(message) {
    if (warnCount > 100) return;
    console.warn(message);
    warnCount++;
    if (warnCount > 100) console.warn('More than 100 program warnings - stopping logs.');
}

// TODO: Handle context loss https://www.khronos.org/webgl/wiki/HandlingContextLost

// Not automatic - devs to use these methods manually
// gl.colorMask( colorMask, colorMask, colorMask, colorMask );
// gl.clearColor( r, g, b, a );
// gl.stencilMask( stencilMask );
// gl.stencilFunc( stencilFunc, stencilRef, stencilMask );
// gl.stencilOp( stencilFail, stencilZFail, stencilZPass );
// gl.clearStencil( stencil );

const tempVec3 = /* @__PURE__ */ new Vec3();
let ID$1 = 1;

class Renderer {
    constructor({
        canvas = document.createElement('canvas'),
        width = 300,
        height = 150,
        dpr = 1,
        alpha = false,
        depth = true,
        stencil = false,
        antialias = false,
        premultipliedAlpha = false,
        preserveDrawingBuffer = false,
        powerPreference = 'default',
        autoClear = true,
        webgl = 2,
    } = {}) {
        const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
        this.dpr = dpr;
        this.alpha = alpha;
        this.color = true;
        this.depth = depth;
        this.stencil = stencil;
        this.premultipliedAlpha = premultipliedAlpha;
        this.autoClear = autoClear;
        this.id = ID$1++;

        // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
        if (webgl === 2) this.gl = canvas.getContext('webgl2', attributes);
        this.isWebgl2 = !!this.gl;
        if (!this.gl) this.gl = canvas.getContext('webgl', attributes);
        if (!this.gl) console.error('unable to create webgl context');

        // Attach renderer to gl so that all classes have access to internal state functions
        this.gl.renderer = this;

        // initialise size values
        this.setSize(width, height);

        // gl state stores to avoid redundant calls on methods used internally
        this.state = {};
        this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
        this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
        this.state.cullFace = false;
        this.state.frontFace = this.gl.CCW;
        this.state.depthMask = true;
        this.state.depthFunc = this.gl.LEQUAL;
        this.state.premultiplyAlpha = false;
        this.state.flipY = false;
        this.state.unpackAlignment = 4;
        this.state.framebuffer = null;
        this.state.viewport = { x: 0, y: 0, width: null, height: null };
        this.state.textureUnits = [];
        this.state.activeTextureUnit = 0;
        this.state.boundBuffer = null;
        this.state.uniformLocations = new Map();
        this.state.currentProgram = null;

        // store requested extensions
        this.extensions = {};

        // Initialise extra format types
        if (this.isWebgl2) {
            this.getExtension('EXT_color_buffer_float');
            this.getExtension('OES_texture_float_linear');
        } else {
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_float_linear');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('EXT_sRGB');
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('WEBGL_draw_buffers');
        }
        this.getExtension('WEBGL_compressed_texture_astc');
        this.getExtension('EXT_texture_compression_bptc');
        this.getExtension('WEBGL_compressed_texture_s3tc');
        this.getExtension('WEBGL_compressed_texture_etc1');
        this.getExtension('WEBGL_compressed_texture_pvrtc');
        this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

        // Create method aliases using extension (WebGL1) or native if available (WebGL2)
        this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
        this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
        this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
        this.createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
        this.bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
        this.deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
        this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');

        // Store device parameters
        this.parameters = {};
        this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
            ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.gl.canvas.width = width * this.dpr;
        this.gl.canvas.height = height * this.dpr;

        if (!this.gl.canvas.style) return;
        Object.assign(this.gl.canvas.style, {
            width: width + 'px',
            height: height + 'px',
        });
    }

    setViewport(width, height, x = 0, y = 0) {
        if (this.state.viewport.width === width && this.state.viewport.height === height) return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.state.viewport.x = x;
        this.state.viewport.y = y;
        this.gl.viewport(x, y, width, height);
    }

    setScissor(width, height, x = 0, y = 0) {
        this.gl.scissor(x, y, width, height);
    }

    enable(id) {
        if (this.state[id] === true) return;
        this.gl.enable(id);
        this.state[id] = true;
    }

    disable(id) {
        if (this.state[id] === false) return;
        this.gl.disable(id);
        this.state[id] = false;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        if (
            this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha
        )
            return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else this.gl.blendFunc(src, dst);
    }

    setBlendEquation(modeRGB, modeAlpha) {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else this.gl.blendEquation(modeRGB);
    }

    setCullFace(value) {
        if (this.state.cullFace === value) return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }

    setFrontFace(value) {
        if (this.state.frontFace === value) return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }

    setDepthMask(value) {
        if (this.state.depthMask === value) return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }

    setDepthFunc(value) {
        if (this.state.depthFunc === value) return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }

    setStencilMask(value) {
        if(this.state.stencilMask === value) return;
        this.state.stencilMask = value;
        this.gl.stencilMask(value);
    }

    setStencilFunc(func, ref, mask) {

        if((this.state.stencilFunc === func) &&
            (this.state.stencilRef === ref) &&
            (this.state.stencilFuncMask === mask)
        ) return;

        this.state.stencilFunc = func || this.gl.ALWAYS;
        this.state.stencilRef = ref || 0;
        this.state.stencilFuncMask = mask || 0;

        this.gl.stencilFunc(func || this.gl.ALWAYS, ref || 0, mask || 0);
    }

    setStencilOp(stencilFail, depthFail, depthPass) {

        if(this.state.stencilFail === stencilFail &&
            this.state.stencilDepthFail === depthFail &&
            this.state.stencilDepthPass === depthPass
        ) return;

        this.state.stencilFail = stencilFail;
        this.state.stencilDepthFail = depthFail;
        this.state.stencilDepthPass = depthPass;
        
        this.gl.stencilOp(stencilFail, depthFail, depthPass);
        
    }

    activeTexture(value) {
        if (this.state.activeTextureUnit === value) return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }

    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
        if (this.state.framebuffer === buffer) return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }

    getExtension(extension, webgl2Func, extFunc) {
        // if webgl2 function supported, return func bound to gl context
        if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);

        // fetch extension once only
        if (!this.extensions[extension]) {
            this.extensions[extension] = this.gl.getExtension(extension);
        }

        // return extension if no function requested
        if (!webgl2Func) return this.extensions[extension];

        // Return null if extension not supported
        if (!this.extensions[extension]) return null;

        // return extension function, bound to extension
        return this.extensions[extension][extFunc].bind(this.extensions[extension]);
    }

    sortOpaque(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortTransparent(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortUI(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else {
            return b.id - a.id;
        }
    }

    getRenderList({ scene, camera, frustumCull, sort }) {
        let renderList = [];

        if (camera && frustumCull) camera.updateFrustum();

        // Get visible
        scene.traverse((node) => {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });

        if (sort) {
            const opaque = [];
            const transparent = []; // depthTest true
            const ui = []; // depthTest false

            renderList.forEach((node) => {
                // Split into the 3 render groups
                if (!node.program.transparent) {
                    opaque.push(node);
                } else if (node.program.depthTest) {
                    transparent.push(node);
                } else {
                    ui.push(node);
                }

                node.zDepth = 0;

                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // update z-depth
                node.worldMatrix.getTranslation(tempVec3);
                tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = opaque.concat(transparent, ui);
        }

        return renderList;
    }

    render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear }) {
        if (target === null) {
            // make sure no render target bound so draws to canvas
            this.bindFramebuffer();
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        } else {
            // bind supplied render target and update viewport
            this.bindFramebuffer(target);
            this.setViewport(target.width, target.height);
        }

        if (clear || (this.autoClear && clear !== false)) {
            // Ensure depth buffer writing is enabled so it can be cleared
            if (this.depth && (!target || target.depth)) {
                this.enable(this.gl.DEPTH_TEST);
                this.setDepthMask(true);
            }

            // Same for stencil
            if(this.stencil || (!target || target.stencil)) {
                this.enable(this.gl.STENCIL_TEST);
                this.setStencilMask(0xff);
            }

            this.gl.clear(
                (this.color ? this.gl.COLOR_BUFFER_BIT : 0) |
                    (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                    (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
            );
        }

        // updates all scene graph matrices
        if (update) scene.updateMatrixWorld();

        // Update camera separately, in case not in scene graph
        if (camera) camera.updateMatrixWorld();

        // Get render list - entails culling and sorting
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort });

        renderList.forEach((node) => {
            node.draw({ camera });
        });
    }
}

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
function copy$4(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
}

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
function set$4(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
}

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
function normalize$2(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let w = a[3];
    let len = x * x + y * y + z * z + w * w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
    return out;
}

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot$2(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function identity$2(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
}

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    let s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
}

/**
 * Multiplies two quats
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
function multiply$3(out, a, b) {
    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateX(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateY(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let by = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateZ(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bz = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
}

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
function slerp(out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations
    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    let omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > 0.000001) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
}

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
function invert$2(out, a) {
    let a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3];
    let dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    let invDot = dot ? 1.0 / dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
}

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
function conjugate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
}

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    let fTrace = m[0] + m[4] + m[8];
    let fRoot;

    if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)
        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
    } else {
        // |w| <= 1/2
        let i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        let j = (i + 1) % 3;
        let k = (i + 2) % 3;

        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
}

/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} euler Angles to rotate around each axis in degrees.
 * @param {String} order detailing order of operations. Default 'XYZ'.
 * @returns {quat} out
 * @function
 */
function fromEuler(out, euler, order = 'YXZ') {
    let sx = Math.sin(euler[0] * 0.5);
    let cx = Math.cos(euler[0] * 0.5);
    let sy = Math.sin(euler[1] * 0.5);
    let cy = Math.cos(euler[1] * 0.5);
    let sz = Math.sin(euler[2] * 0.5);
    let cz = Math.cos(euler[2] * 0.5);

    if (order === 'XYZ') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'YXZ') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    } else if (order === 'ZXY') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'ZYX') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    } else if (order === 'YZX') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'XZY') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    }

    return out;
}

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
const copy$3 = copy$4;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
const set$3 = set$4;

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
const dot$1 = dot$2;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
const normalize$1 = normalize$2;

class Quat extends Array {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        this.onChange = () => {};

        // Keep reference to proxy target to avoid triggering onChange internally
        this._target = this;

        // Return a proxy to trigger onChange when array elements are edited directly
        const triggerProps = ['0', '1', '2', '3'];
        return new Proxy(this, {
            set(target, property) {
                const success = Reflect.set(...arguments);
                if (success && triggerProps.includes(property)) target.onChange();
                return success;
            },
        });
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this._target[0] = v;
        this.onChange();
    }

    set y(v) {
        this._target[1] = v;
        this.onChange();
    }

    set z(v) {
        this._target[2] = v;
        this.onChange();
    }

    set w(v) {
        this._target[3] = v;
        this.onChange();
    }

    identity() {
        identity$2(this._target);
        this.onChange();
        return this;
    }

    set(x, y, z, w) {
        if (x.length) return this.copy(x);
        set$3(this._target, x, y, z, w);
        this.onChange();
        return this;
    }

    rotateX(a) {
        rotateX(this._target, this._target, a);
        this.onChange();
        return this;
    }

    rotateY(a) {
        rotateY(this._target, this._target, a);
        this.onChange();
        return this;
    }

    rotateZ(a) {
        rotateZ(this._target, this._target, a);
        this.onChange();
        return this;
    }

    inverse(q = this._target) {
        invert$2(this._target, q);
        this.onChange();
        return this;
    }

    conjugate(q = this._target) {
        conjugate(this._target, q);
        this.onChange();
        return this;
    }

    copy(q) {
        copy$3(this._target, q);
        this.onChange();
        return this;
    }

    normalize(q = this._target) {
        normalize$1(this._target, q);
        this.onChange();
        return this;
    }

    multiply(qA, qB) {
        if (qB) {
            multiply$3(this._target, qA, qB);
        } else {
            multiply$3(this._target, this._target, qA);
        }
        this.onChange();
        return this;
    }

    dot(v) {
        return dot$1(this._target, v);
    }

    fromMatrix3(matrix3) {
        fromMat3(this._target, matrix3);
        this.onChange();
        return this;
    }

    fromEuler(euler, isInternal) {
        fromEuler(this._target, euler, euler.order);
        // Avoid infinite recursion
        if (!isInternal) this.onChange();
        return this;
    }

    fromAxisAngle(axis, a) {
        setAxisAngle(this._target, axis, a);
        this.onChange();
        return this;
    }

    slerp(q, t) {
        slerp(this._target, this._target, q, t);
        this.onChange();
        return this;
    }

    fromArray(a, o = 0) {
        this._target[0] = a[o];
        this._target[1] = a[o + 1];
        this._target[2] = a[o + 2];
        this._target[3] = a[o + 3];
        this.onChange();
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }
}

const EPSILON = 0.000001;

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy$2(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function set$2(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
}

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity$1(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert$1(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}

/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply$2(out, a, b) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate$1(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2];
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];

        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
}

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale$2(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate$1(out, a, rad, axis) {
    let x = axis[0],
        y = axis[1],
        z = axis[2];
    let len = Math.hypot(x, y, z);
    let s, c, t;
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;

    if (Math.abs(len) < EPSILON) {
        return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
}

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getTranslation(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];

    return out;
}

/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getScaling(out, mat) {
    let m11 = mat[0];
    let m12 = mat[1];
    let m13 = mat[2];
    let m21 = mat[4];
    let m22 = mat[5];
    let m23 = mat[6];
    let m31 = mat[8];
    let m32 = mat[9];
    let m33 = mat[10];

    out[0] = Math.hypot(m11, m12, m13);
    out[1] = Math.hypot(m21, m22, m23);
    out[2] = Math.hypot(m31, m32, m33);

    return out;
}

function getMaxScaleOnAxis(mat) {
    let m11 = mat[0];
    let m12 = mat[1];
    let m13 = mat[2];
    let m21 = mat[4];
    let m22 = mat[5];
    let m23 = mat[6];
    let m31 = mat[8];
    let m32 = mat[9];
    let m33 = mat[10];

    const x = m11 * m11 + m12 * m12 + m13 * m13;
    const y = m21 * m21 + m22 * m22 + m23 * m23;
    const z = m31 * m31 + m32 * m32 + m33 * m33;

    return Math.sqrt(Math.max(x, y, z));
}

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
const getRotation = (function () {
    const temp = [1, 1, 1];

    return function (out, mat) {
        let scaling = temp;
        getScaling(scaling, mat);

        let is1 = 1 / scaling[0];
        let is2 = 1 / scaling[1];
        let is3 = 1 / scaling[2];

        let sm11 = mat[0] * is1;
        let sm12 = mat[1] * is2;
        let sm13 = mat[2] * is3;
        let sm21 = mat[4] * is1;
        let sm22 = mat[5] * is2;
        let sm23 = mat[6] * is3;
        let sm31 = mat[8] * is1;
        let sm32 = mat[9] * is2;
        let sm33 = mat[10] * is3;

        let trace = sm11 + sm22 + sm33;
        let S = 0;

        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            out[3] = 0.25 * S;
            out[0] = (sm23 - sm32) / S;
            out[1] = (sm31 - sm13) / S;
            out[2] = (sm12 - sm21) / S;
        } else if (sm11 > sm22 && sm11 > sm33) {
            S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
            out[3] = (sm23 - sm32) / S;
            out[0] = 0.25 * S;
            out[1] = (sm12 + sm21) / S;
            out[2] = (sm31 + sm13) / S;
        } else if (sm22 > sm33) {
            S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
            out[3] = (sm31 - sm13) / S;
            out[0] = (sm12 + sm21) / S;
            out[1] = 0.25 * S;
            out[2] = (sm23 + sm32) / S;
        } else {
            S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
            out[3] = (sm12 - sm21) / S;
            out[0] = (sm31 + sm13) / S;
            out[1] = (sm23 + sm32) / S;
            out[2] = 0.25 * S;
        }

        return out;
    };
})();

/**
 * From glTF-Transform
 * https://github.com/donmccurdy/glTF-Transform/blob/main/packages/core/src/utils/math-utils.ts
 *
 * Decompose a mat4 to TRS properties.
 *
 * Equivalent to the Matrix4 decompose() method in three.js, and intentionally not using the
 * gl-matrix version. See: https://github.com/toji/gl-matrix/issues/408
 *
 * @param {mat4} srcMat Matrix element, to be decomposed to TRS properties.
 * @param {quat4} dstRotation Rotation element, to be overwritten.
 * @param {vec3} dstTranslation Translation element, to be overwritten.
 * @param {vec3} dstScale Scale element, to be overwritten
 */
function decompose(srcMat, dstRotation, dstTranslation, dstScale) {
    let sx = length$1([srcMat[0], srcMat[1], srcMat[2]]);
    const sy = length$1([srcMat[4], srcMat[5], srcMat[6]]);
    const sz = length$1([srcMat[8], srcMat[9], srcMat[10]]);

    // if determine is negative, we need to invert one scale
    const det = determinant(srcMat);
    if (det < 0) sx = -sx;

    dstTranslation[0] = srcMat[12];
    dstTranslation[1] = srcMat[13];
    dstTranslation[2] = srcMat[14];

    // scale the rotation part
    const _m1 = srcMat.slice();

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    _m1[0] *= invSX;
    _m1[1] *= invSX;
    _m1[2] *= invSX;

    _m1[4] *= invSY;
    _m1[5] *= invSY;
    _m1[6] *= invSY;

    _m1[8] *= invSZ;
    _m1[9] *= invSZ;
    _m1[10] *= invSZ;

    getRotation(dstRotation, _m1);

    dstScale[0] = sx;
    dstScale[1] = sy;
    dstScale[2] = sz;
}

/**
 * From glTF-Transform
 * https://github.com/donmccurdy/glTF-Transform/blob/main/packages/core/src/utils/math-utils.ts
 *
 * Compose TRS properties to a mat4.
 *
 * Equivalent to the Matrix4 compose() method in three.js, and intentionally not using the
 * gl-matrix version. See: https://github.com/toji/gl-matrix/issues/408
 *
 * @param {mat4} dstMat Matrix element, to be modified and returned.
 * @param {quat4} srcRotation Rotation element of matrix.
 * @param {vec3} srcTranslation Translation element of matrix.
 * @param {vec3} srcScale Scale element of matrix.
 * @returns {mat4} dstMat, overwritten to mat4 equivalent of given TRS properties.
 */
function compose(dstMat, srcRotation, srcTranslation, srcScale) {
    const te = dstMat;

    const x = srcRotation[0],
        y = srcRotation[1],
        z = srcRotation[2],
        w = srcRotation[3];
    const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
    const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
    const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
    const wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    const sx = srcScale[0],
        sy = srcScale[1],
        sz = srcScale[2];

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = srcTranslation[0];
    te[13] = srcTranslation[1];
    te[14] = srcTranslation[2];
    te[15] = 1;

    return te;
}

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
function fromQuat$1(out, q) {
    let x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
}

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    let f = 1.0 / Math.tan(fovy / 2);
    let nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
    let lr = 1 / (left - right);
    let bt = 1 / (bottom - top);
    let nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
}

/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} target Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function targetTo(out, eye, target, up) {
    let eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2];

    let z0 = eyex - target[0],
        z1 = eyey - target[1],
        z2 = eyez - target[2];

    let len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len === 0) {
        // eye and target are in the same position
        z2 = 1;
    } else {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
    }

    let x0 = upy * z2 - upz * z1,
        x1 = upz * z0 - upx * z2,
        x2 = upx * z1 - upy * z0;

    len = x0 * x0 + x1 * x1 + x2 * x2;
    if (len === 0) {
        // up and z are parallel
        if (upz) {
            upx += 1e-6;
        } else if (upy) {
            upz += 1e-6;
        } else {
            upy += 1e-6;
        }
        (x0 = upy * z2 - upz * z1), (x1 = upz * z0 - upx * z2), (x2 = upx * z1 - upy * z0);

        len = x0 * x0 + x1 * x1 + x2 * x2;
    }

    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
}

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function add$1(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function subtract$1(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
}

class Mat4 extends Array {
    constructor(
        m00 = 1,
        m01 = 0,
        m02 = 0,
        m03 = 0,
        m10 = 0,
        m11 = 1,
        m12 = 0,
        m13 = 0,
        m20 = 0,
        m21 = 0,
        m22 = 1,
        m23 = 0,
        m30 = 0,
        m31 = 0,
        m32 = 0,
        m33 = 1
    ) {
        super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    get x() {
        return this[12];
    }

    get y() {
        return this[13];
    }

    get z() {
        return this[14];
    }

    get w() {
        return this[15];
    }

    set x(v) {
        this[12] = v;
    }

    set y(v) {
        this[13] = v;
    }

    set z(v) {
        this[14] = v;
    }

    set w(v) {
        this[15] = v;
    }

    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        if (m00.length) return this.copy(m00);
        set$2(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    translate(v, m = this) {
        translate$1(this, m, v);
        return this;
    }

    rotate(v, axis, m = this) {
        rotate$1(this, m, v, axis);
        return this;
    }

    scale(v, m = this) {
        scale$2(this, m, typeof v === 'number' ? [v, v, v] : v);
        return this;
    }

    add(ma, mb) {
        if (mb) add$1(this, ma, mb);
        else add$1(this, this, ma);
        return this;
    }

    sub(ma, mb) {
        if (mb) subtract$1(this, ma, mb);
        else subtract$1(this, this, ma);
        return this;
    }

    multiply(ma, mb) {
        if (!ma.length) {
            multiplyScalar(this, this, ma);
        } else if (mb) {
            multiply$2(this, ma, mb);
        } else {
            multiply$2(this, this, ma);
        }
        return this;
    }

    identity() {
        identity$1(this);
        return this;
    }

    copy(m) {
        copy$2(this, m);
        return this;
    }

    fromPerspective({ fov, aspect, near, far } = {}) {
        perspective(this, fov, aspect, near, far);
        return this;
    }

    fromOrthogonal({ left, right, bottom, top, near, far }) {
        ortho(this, left, right, bottom, top, near, far);
        return this;
    }

    fromQuaternion(q) {
        fromQuat$1(this, q);
        return this;
    }

    setPosition(v) {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
        return this;
    }

    inverse(m = this) {
        invert$1(this, m);
        return this;
    }

    compose(q, pos, scale) {
        compose(this, q, pos, scale);
        return this;
    }

    decompose(q, pos, scale) {
        decompose(this, q, pos, scale);
        return this;
    }

    getRotation(q) {
        getRotation(q, this);
        return this;
    }

    getTranslation(pos) {
        getTranslation(pos, this);
        return this;
    }

    getScaling(scale) {
        getScaling(scale, this);
        return this;
    }

    getMaxScaleOnAxis() {
        return getMaxScaleOnAxis(this);
    }

    lookAt(eye, target, up) {
        targetTo(this, eye, target, up);
        return this;
    }

    determinant() {
        return determinant(this);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        this[4] = a[o + 4];
        this[5] = a[o + 5];
        this[6] = a[o + 6];
        this[7] = a[o + 7];
        this[8] = a[o + 8];
        this[9] = a[o + 9];
        this[10] = a[o + 10];
        this[11] = a[o + 11];
        this[12] = a[o + 12];
        this[13] = a[o + 13];
        this[14] = a[o + 14];
        this[15] = a[o + 15];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        a[o + 4] = this[4];
        a[o + 5] = this[5];
        a[o + 6] = this[6];
        a[o + 7] = this[7];
        a[o + 8] = this[8];
        a[o + 9] = this[9];
        a[o + 10] = this[10];
        a[o + 11] = this[11];
        a[o + 12] = this[12];
        a[o + 13] = this[13];
        a[o + 14] = this[14];
        a[o + 15] = this[15];
        return a;
    }
}

// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
function fromRotationMatrix(out, m, order = 'YXZ') {
    if (order === 'XYZ') {
        out[1] = Math.asin(Math.min(Math.max(m[8], -1), 1));
        if (Math.abs(m[8]) < 0.99999) {
            out[0] = Math.atan2(-m[9], m[10]);
            out[2] = Math.atan2(-m[4], m[0]);
        } else {
            out[0] = Math.atan2(m[6], m[5]);
            out[2] = 0;
        }
    } else if (order === 'YXZ') {
        out[0] = Math.asin(-Math.min(Math.max(m[9], -1), 1));
        if (Math.abs(m[9]) < 0.99999) {
            out[1] = Math.atan2(m[8], m[10]);
            out[2] = Math.atan2(m[1], m[5]);
        } else {
            out[1] = Math.atan2(-m[2], m[0]);
            out[2] = 0;
        }
    } else if (order === 'ZXY') {
        out[0] = Math.asin(Math.min(Math.max(m[6], -1), 1));
        if (Math.abs(m[6]) < 0.99999) {
            out[1] = Math.atan2(-m[2], m[10]);
            out[2] = Math.atan2(-m[4], m[5]);
        } else {
            out[1] = 0;
            out[2] = Math.atan2(m[1], m[0]);
        }
    } else if (order === 'ZYX') {
        out[1] = Math.asin(-Math.min(Math.max(m[2], -1), 1));
        if (Math.abs(m[2]) < 0.99999) {
            out[0] = Math.atan2(m[6], m[10]);
            out[2] = Math.atan2(m[1], m[0]);
        } else {
            out[0] = 0;
            out[2] = Math.atan2(-m[4], m[5]);
        }
    } else if (order === 'YZX') {
        out[2] = Math.asin(Math.min(Math.max(m[1], -1), 1));
        if (Math.abs(m[1]) < 0.99999) {
            out[0] = Math.atan2(-m[9], m[5]);
            out[1] = Math.atan2(-m[2], m[0]);
        } else {
            out[0] = 0;
            out[1] = Math.atan2(m[8], m[10]);
        }
    } else if (order === 'XZY') {
        out[2] = Math.asin(-Math.min(Math.max(m[4], -1), 1));
        if (Math.abs(m[4]) < 0.99999) {
            out[0] = Math.atan2(m[6], m[5]);
            out[1] = Math.atan2(m[8], m[0]);
        } else {
            out[0] = Math.atan2(-m[9], m[10]);
            out[1] = 0;
        }
    }

    return out;
}

const tmpMat4 = /* @__PURE__ */ new Mat4();

class Euler extends Array {
    constructor(x = 0, y = x, z = x, order = 'YXZ') {
        super(x, y, z);
        this.order = order;
        this.onChange = () => {};

        // Keep reference to proxy target to avoid triggering onChange internally
        this._target = this;

        // Return a proxy to trigger onChange when array elements are edited directly
        const triggerProps = ['0', '1', '2'];
        return new Proxy(this, {
            set(target, property) {
                const success = Reflect.set(...arguments);
                if (success && triggerProps.includes(property)) target.onChange();
                return success;
            },
        });
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v) {
        this._target[0] = v;
        this.onChange();
    }

    set y(v) {
        this._target[1] = v;
        this.onChange();
    }

    set z(v) {
        this._target[2] = v;
        this.onChange();
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        this._target[0] = x;
        this._target[1] = y;
        this._target[2] = z;
        this.onChange();
        return this;
    }

    copy(v) {
        this._target[0] = v[0];
        this._target[1] = v[1];
        this._target[2] = v[2];
        this.onChange();
        return this;
    }

    reorder(order) {
        this._target.order = order;
        this.onChange();
        return this;
    }

    fromRotationMatrix(m, order = this.order) {
        fromRotationMatrix(this._target, m, order);
        this.onChange();
        return this;
    }

    fromQuaternion(q, order = this.order, isInternal) {
        tmpMat4.fromQuaternion(q);
        this._target.fromRotationMatrix(tmpMat4, order);
        // Avoid infinite recursion
        if (!isInternal) this.onChange();
        return this;
    }

    fromArray(a, o = 0) {
        this._target[0] = a[o];
        this._target[1] = a[o + 1];
        this._target[2] = a[o + 2];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }
}

class Transform {
    constructor() {
        this.parent = null;
        this.children = [];
        this.visible = true;

        this.matrix = new Mat4();
        this.worldMatrix = new Mat4();
        this.matrixAutoUpdate = true;
        this.worldMatrixNeedsUpdate = false;

        this.position = new Vec3();
        this.quaternion = new Quat();
        this.scale = new Vec3(1);
        this.rotation = new Euler();
        this.up = new Vec3(0, 1, 0);

        this.rotation._target.onChange = () => this.quaternion.fromEuler(this.rotation, true);
        this.quaternion._target.onChange = () => this.rotation.fromQuaternion(this.quaternion, undefined, true);
    }

    setParent(parent, notifyParent = true) {
        if (this.parent && parent !== this.parent) this.parent.removeChild(this, false);
        this.parent = parent;
        if (notifyParent && parent) parent.addChild(this, false);
    }

    addChild(child, notifyChild = true) {
        if (!~this.children.indexOf(child)) this.children.push(child);
        if (notifyChild) child.setParent(this, false);
    }

    removeChild(child, notifyChild = true) {
        if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
        if (notifyChild) child.setParent(null, false);
    }

    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent === null) this.worldMatrix.copy(this.matrix);
            else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }

        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].updateMatrixWorld(force);
        }
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
    }

    traverse(callback) {
        // Return true in callback to stop traversing children
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }

    decompose() {
        this.matrix.decompose(this.quaternion._target, this.position, this.scale);
        this.rotation.fromQuaternion(this.quaternion);
    }

    lookAt(target, invert = false) {
        if (invert) this.matrix.lookAt(this.position, target, this.up);
        else this.matrix.lookAt(target, this.position, this.up);
        this.matrix.getRotation(this.quaternion._target);
        this.rotation.fromQuaternion(this.quaternion);
    }
}

const tempMat4 = /* @__PURE__ */ new Mat4();
const tempVec3a = /* @__PURE__ */ new Vec3();
const tempVec3b = /* @__PURE__ */ new Vec3();

class Camera extends Transform {
    constructor(gl, { near = 0.1, far = 100, fov = 45, aspect = 1, left, right, bottom, top, zoom = 1 } = {}) {
        super();

        Object.assign(this, { near, far, fov, aspect, left, right, bottom, top, zoom });

        this.projectionMatrix = new Mat4();
        this.viewMatrix = new Mat4();
        this.projectionViewMatrix = new Mat4();
        this.worldPosition = new Vec3();

        // Use orthographic if left/right set, else default to perspective camera
        this.type = left || right ? 'orthographic' : 'perspective';

        if (this.type === 'orthographic') this.orthographic();
        else this.perspective();
    }

    perspective({ near = this.near, far = this.far, fov = this.fov, aspect = this.aspect } = {}) {
        Object.assign(this, { near, far, fov, aspect });
        this.projectionMatrix.fromPerspective({ fov: fov * (Math.PI / 180), aspect, near, far });
        this.type = 'perspective';
        return this;
    }

    orthographic({
        near = this.near,
        far = this.far,
        left = this.left || -1,
        right = this.right || 1,
        bottom = this.bottom || -1,
        top = this.top || 1,
        zoom = this.zoom,
    } = {}) {
        Object.assign(this, { near, far, left, right, bottom, top, zoom });
        left /= zoom;
        right /= zoom;
        bottom /= zoom;
        top /= zoom;
        this.projectionMatrix.fromOrthogonal({ left, right, bottom, top, near, far });
        this.type = 'orthographic';
        return this;
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        this.viewMatrix.inverse(this.worldMatrix);
        this.worldMatrix.getTranslation(this.worldPosition);

        // used for sorting
        this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix);
        return this;
    }

    updateProjectionMatrix() {
        if (this.type === 'perspective') {
            return this.perspective();
        } else {
            return this.orthographic();
        }
    }

    lookAt(target) {
        super.lookAt(target, true);
        return this;
    }

    // Project 3D coordinate to 2D point
    project(v) {
        v.applyMatrix4(this.viewMatrix);
        v.applyMatrix4(this.projectionMatrix);
        return this;
    }

    // Unproject 2D point to 3D coordinate
    unproject(v) {
        v.applyMatrix4(tempMat4.inverse(this.projectionMatrix));
        v.applyMatrix4(this.worldMatrix);
        return this;
    }

    updateFrustum() {
        if (!this.frustum) {
            this.frustum = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
        }

        const m = this.projectionViewMatrix;
        this.frustum[0].set(m[3] - m[0], m[7] - m[4], m[11] - m[8]).constant = m[15] - m[12]; // -x
        this.frustum[1].set(m[3] + m[0], m[7] + m[4], m[11] + m[8]).constant = m[15] + m[12]; // +x
        this.frustum[2].set(m[3] + m[1], m[7] + m[5], m[11] + m[9]).constant = m[15] + m[13]; // +y
        this.frustum[3].set(m[3] - m[1], m[7] - m[5], m[11] - m[9]).constant = m[15] - m[13]; // -y
        this.frustum[4].set(m[3] - m[2], m[7] - m[6], m[11] - m[10]).constant = m[15] - m[14]; // +z (far)
        this.frustum[5].set(m[3] + m[2], m[7] + m[6], m[11] + m[10]).constant = m[15] + m[14]; // -z (near)

        for (let i = 0; i < 6; i++) {
            const invLen = 1.0 / this.frustum[i].distance();
            this.frustum[i].multiply(invLen);
            this.frustum[i].constant *= invLen;
        }
    }

    frustumIntersectsMesh(node, worldMatrix = node.worldMatrix) {
        // If no position attribute, treat as frustumCulled false
        if (!node.geometry.attributes.position) return true;

        if (!node.geometry.bounds || node.geometry.bounds.radius === Infinity) node.geometry.computeBoundingSphere();

        if (!node.geometry.bounds) return true;

        const center = tempVec3a;
        center.copy(node.geometry.bounds.center);
        center.applyMatrix4(worldMatrix);

        const radius = node.geometry.bounds.radius * worldMatrix.getMaxScaleOnAxis();

        return this.frustumIntersectsSphere(center, radius);
    }

    frustumIntersectsSphere(center, radius) {
        const normal = tempVec3b;

        for (let i = 0; i < 6; i++) {
            const plane = this.frustum[i];
            const distance = normal.copy(plane).dot(center) + plane.constant;
            if (distance < -radius) return false;
        }
        return true;
    }
}

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
function fromMat4(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
}

/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */
function fromQuat(out, q) {
    let x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
}

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function copy$1(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
}

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function set$1(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
}

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function invert(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;

    // Calculate the determinant
    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
}

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function multiply$1(out, a, b) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    let b00 = b[0],
        b01 = b[1],
        b02 = b[2];
    let b10 = b[3],
        b11 = b[4],
        b12 = b[5];
    let b20 = b[6],
        b21 = b[7],
        b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
}

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
function translate(out, a, v) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        x = v[0],
        y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
}

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function rotate(out, a, rad) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
}

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
function scale$1(out, a, v) {
    let x = v[0],
        y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
}

/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {mat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */
function normalFromMat4(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
}

class Mat3 extends Array {
    constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0, m20 = 0, m21 = 0, m22 = 1) {
        super(m00, m01, m02, m10, m11, m12, m20, m21, m22);
        return this;
    }

    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        if (m00.length) return this.copy(m00);
        set$1(this, m00, m01, m02, m10, m11, m12, m20, m21, m22);
        return this;
    }

    translate(v, m = this) {
        translate(this, m, v);
        return this;
    }

    rotate(v, m = this) {
        rotate(this, m, v);
        return this;
    }

    scale(v, m = this) {
        scale$1(this, m, v);
        return this;
    }

    multiply(ma, mb) {
        if (mb) {
            multiply$1(this, ma, mb);
        } else {
            multiply$1(this, this, ma);
        }
        return this;
    }

    identity() {
        identity(this);
        return this;
    }

    copy(m) {
        copy$1(this, m);
        return this;
    }

    fromMatrix4(m) {
        fromMat4(this, m);
        return this;
    }

    fromQuaternion(q) {
        fromQuat(this, q);
        return this;
    }

    fromBasis(vec3a, vec3b, vec3c) {
        this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]);
        return this;
    }

    inverse(m = this) {
        invert(this, m);
        return this;
    }

    getNormalMatrix(m) {
        normalFromMat4(this, m);
        return this;
    }
}

let ID = 0;

class Mesh extends Transform {
    constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {}) {
        super();
        if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
        this.gl = gl;
        this.id = ID++;
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;

        // Override sorting to force an order
        this.renderOrder = renderOrder;
        this.modelViewMatrix = new Mat4();
        this.normalMatrix = new Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
    }

    onBeforeRender(f) {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f) {
        this.afterRenderCallbacks.push(f);
        return this;
    }

    draw({ camera } = {}) {
        if (camera) {
            // Add empty matrix uniforms to program if unset
            if (!this.program.uniforms.modelMatrix) {
                Object.assign(this.program.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }

            // Set the matrix uniforms
            this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
            this.program.uniforms.cameraPosition.value = camera.worldPosition;
            this.program.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            this.program.uniforms.modelMatrix.value = this.worldMatrix;
            this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            this.program.uniforms.normalMatrix.value = this.normalMatrix;
        }
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));

        // determine if faces need to be flipped - when mesh scaled negatively
        let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
        this.program.use({ flipFaces });
        this.geometry.draw({ mode: this.mode, program: this.program });
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
}

const NAMES = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    cyan: '#00ffff',
    yellow: '#ffff00',
    orange: '#ff8000',
};

function hexToRGB(hex) {
    if (hex.length === 4) hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!rgb) console.warn(`Unable to convert hex string ${hex} to rgb values`);
    return [parseInt(rgb[1], 16) / 255, parseInt(rgb[2], 16) / 255, parseInt(rgb[3], 16) / 255];
}

function numberToRGB(num) {
    num = parseInt(num);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function parseColor(color) {
    // Empty
    if (color === undefined) return [0, 0, 0];

    // Decimal
    if (arguments.length === 3) return arguments;

    // Number
    if (!isNaN(color)) return numberToRGB(color);

    // Hex
    if (color[0] === '#') return hexToRGB(color);

    // Names
    if (NAMES[color.toLowerCase()]) return hexToRGB(NAMES[color.toLowerCase()]);

    console.warn('Color format not recognised');
    return [0, 0, 0];
}

// Color stored as an array of RGB decimal values (between 0 > 1)
// Constructor and set method accept following formats:
// new Color() - Empty (defaults to black)
// new Color([0.2, 0.4, 1.0]) - Decimal Array (or another Color instance)
// new Color(0.7, 0.0, 0.1) - Decimal RGB values
// new Color('#ff0000') - Hex string
// new Color('#ccc') - Short-hand Hex string
// new Color(0x4f27e8) - Number
// new Color('red') - Color name string (short list in ColorFunc.js)

class Color extends Array {
    constructor(color) {
        if (Array.isArray(color)) return super(...color);
        return super(...parseColor(...arguments));
    }

    get r() {
        return this[0];
    }

    get g() {
        return this[1];
    }

    get b() {
        return this[2];
    }

    set r(v) {
        this[0] = v;
    }

    set g(v) {
        this[1] = v;
    }

    set b(v) {
        this[2] = v;
    }

    set(color) {
        if (Array.isArray(color)) return this.copy(color);
        return this.copy(parseColor(...arguments));
    }

    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }
}

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
}

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
}

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
}

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two vec2's
 * Note that the cross product returns a scalar
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} cross product of a and b
 */
function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}

/**
 * Performs a frame rate independant, linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} decay decay constant for interpolation. useful range between 1 and 25, from slow to fast.
 * @param {Number} dt delta time
 * @returns {vec2} out
 */
function smoothLerp(out, a, b, decay, dt) {
    const exp = Math.exp(-decay * dt);
    let ax = a[0];
    let ay = a[1];

    out[0] = b[0] + (ax - b[0]) * exp;
    out[1] = b[1] + (ay - b[1]) * exp;
    return out;
}

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat3(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat4(out, a, m) {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

class Vec2 extends Array {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set(x, y = x) {
        if (x.length) return this.copy(x);
        set(this, x, y);
        return this;
    }

    copy(v) {
        copy(this, v);
        return this;
    }

    add(va, vb) {
        if (vb) add(this, va, vb);
        else add(this, this, va);
        return this;
    }

    sub(va, vb) {
        if (vb) subtract(this, va, vb);
        else subtract(this, this, va);
        return this;
    }

    multiply(v) {
        if (v.length) multiply(this, this, v);
        else scale(this, this, v);
        return this;
    }

    divide(v) {
        if (v.length) divide(this, this, v);
        else scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return length(this);
    }

    distance(v) {
        if (v) return distance(this, v);
        else return length(this);
    }

    squaredLen() {
        return this.squaredDistance();
    }

    squaredDistance(v) {
        if (v) return squaredDistance(this, v);
        else return squaredLength(this);
    }

    negate(v = this) {
        negate(this, v);
        return this;
    }

    cross(va, vb) {
        if (vb) return cross(va, vb);
        return cross(this, va);
    }

    scale(v) {
        scale(this, this, v);
        return this;
    }

    normalize() {
        normalize(this, this);
        return this;
    }

    dot(v) {
        return dot(this, v);
    }

    equals(v) {
        return exactEquals(this, v);
    }

    applyMatrix3(mat3) {
        transformMat3(this, this, mat3);
        return this;
    }

    applyMatrix4(mat4) {
        transformMat4(this, this, mat4);
        return this;
    }

    lerp(v, a) {
        lerp(this, this, v, a);
        return this;
    }

    smoothLerp(v, decay, dt) {
        smoothLerp(this, this, v, decay, dt);
        return this;
    }

    clone() {
        return new Vec2(this[0], this[1]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        return a;
    }
}

class Triangle extends Geometry {
    constructor(gl, { attributes = {} } = {}) {
        Object.assign(attributes, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        super(gl, attributes);
    }
}

const tmp = /* @__PURE__ */ new Vec3();

class Polyline {
    constructor(
        gl,
        {
            points, // Array of Vec3s
            vertex = defaultVertex,
            fragment = defaultFragment,
            uniforms = {},
            attributes = {}, // For passing in custom attribs
        }
    ) {
        this.gl = gl;
        this.points = points;
        this.count = points.length;

        // Create buffers
        this.position = new Float32Array(this.count * 3 * 2);
        this.prev = new Float32Array(this.count * 3 * 2);
        this.next = new Float32Array(this.count * 3 * 2);
        const side = new Float32Array(this.count * 1 * 2);
        const uv = new Float32Array(this.count * 2 * 2);
        const index = new Uint16Array((this.count - 1) * 3 * 2);

        // Set static buffers
        for (let i = 0; i < this.count; i++) {
            side.set([-1, 1], i * 2);
            const v = i / (this.count - 1);
            uv.set([0, v, 1, v], i * 4);

            if (i === this.count - 1) continue;
            const ind = i * 2;
            index.set([ind + 0, ind + 1, ind + 2], (ind + 0) * 3);
            index.set([ind + 2, ind + 1, ind + 3], (ind + 1) * 3);
        }

        const geometry = (this.geometry = new Geometry(
            gl,
            Object.assign(attributes, {
                position: { size: 3, data: this.position },
                prev: { size: 3, data: this.prev },
                next: { size: 3, data: this.next },
                side: { size: 1, data: side },
                uv: { size: 2, data: uv },
                index: { size: 1, data: index },
            })
        ));

        // Populate dynamic buffers
        this.updateGeometry();

        if (!uniforms.uResolution) this.resolution = uniforms.uResolution = { value: new Vec2() };
        if (!uniforms.uDPR) this.dpr = uniforms.uDPR = { value: 1 };
        if (!uniforms.uThickness) this.thickness = uniforms.uThickness = { value: 1 };
        if (!uniforms.uColor) this.color = uniforms.uColor = { value: new Color('#000') };
        if (!uniforms.uMiter) this.miter = uniforms.uMiter = { value: 1 };

        // Set size uniforms' values
        this.resize();

        const program = (this.program = new Program(gl, {
            vertex,
            fragment,
            uniforms,
        }));

        this.mesh = new Mesh(gl, { geometry, program });
    }

    updateGeometry() {
        this.points.forEach((p, i) => {
            p.toArray(this.position, i * 3 * 2);
            p.toArray(this.position, i * 3 * 2 + 3);

            if (!i) {
                // If first point, calculate prev using the distance to 2nd point
                tmp.copy(p)
                    .sub(this.points[i + 1])
                    .add(p);
                tmp.toArray(this.prev, i * 3 * 2);
                tmp.toArray(this.prev, i * 3 * 2 + 3);
            } else {
                p.toArray(this.next, (i - 1) * 3 * 2);
                p.toArray(this.next, (i - 1) * 3 * 2 + 3);
            }

            if (i === this.points.length - 1) {
                // If last point, calculate next using distance to 2nd last point
                tmp.copy(p)
                    .sub(this.points[i - 1])
                    .add(p);
                tmp.toArray(this.next, i * 3 * 2);
                tmp.toArray(this.next, i * 3 * 2 + 3);
            } else {
                p.toArray(this.prev, (i + 1) * 3 * 2);
                p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
            }
        });

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.prev.needsUpdate = true;
        this.geometry.attributes.next.needsUpdate = true;
    }

    // Only need to call if not handling resolution uniforms manually
    resize() {
        // Update automatic uniforms if not overridden
        if (this.resolution) this.resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);
        if (this.dpr) this.dpr.value = this.gl.renderer.dpr;
    }
}

const defaultVertex = /* glsl */ `
    precision highp float;

    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;
    uniform float uMiter;

    varying vec2 vUv;

    vec4 getPosition() {
        mat4 mvp = projectionMatrix * modelViewMatrix;
        vec4 current = mvp * vec4(position, 1);
        vec4 nextPos = mvp * vec4(next, 1);
        vec4 prevPos = mvp * vec4(prev, 1);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1);    
        vec2 currentScreen = current.xy / current.w * aspect;
        vec2 nextScreen = nextPos.xy / nextPos.w * aspect;
        vec2 prevScreen = prevPos.xy / prevPos.w * aspect;
    
        vec2 dir1 = normalize(currentScreen - prevScreen);
        vec2 dir2 = normalize(nextScreen - currentScreen);
        vec2 dir = normalize(dir1 + dir2);
    
        vec2 normal = vec2(-dir.y, dir.x);
        normal /= mix(1.0, max(0.3, dot(normal, vec2(-dir1.y, dir1.x))), uMiter);
        normal /= aspect;

        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        float pixelWidth = current.w * pixelWidthRatio;
        normal *= pixelWidth * uThickness;
        current.xy -= normal * side;
    
        return current;
    }

    void main() {
        vUv = uv;
        gl_Position = getPosition();
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    uniform vec3 uColor;
    
    varying vec2 vUv;

    void main() {
        gl_FragColor.rgb = uColor;
        gl_FragColor.a = 1.0;
    }
`;

const Ribbons = ({ colors = ["#ff9346", "#7cff67", "#ffee51", "#5227FF"], baseSpring = 0.03, baseFriction = 0.9, baseThickness = 30, offsetFactor = 0.05, maxAge = 500, pointCount = 50, speedMultiplier = 0.6, enableFade = false, enableShaderEffect = false, effectAmplitude = 2, backgroundColor = [0, 0, 0, 0], }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const renderer = new Renderer({
            dpr: window.devicePixelRatio || 2,
            alpha: true,
        });
        const gl = renderer.gl;
        if (Array.isArray(backgroundColor) && backgroundColor.length === 4) {
            gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
        }
        else {
            gl.clearColor(0, 0, 0, 0);
        }
        gl.canvas.style.position = "absolute";
        gl.canvas.style.top = "0";
        gl.canvas.style.left = "0";
        gl.canvas.style.width = "100%";
        gl.canvas.style.height = "100%";
        container.appendChild(gl.canvas);
        const scene = new Transform();
        const lines = [];
        const vertex = `
      precision highp float;
      
      attribute vec3 position;
      attribute vec3 next;
      attribute vec3 prev;
      attribute vec2 uv;
      attribute float side;
      
      uniform vec2 uResolution;
      uniform float uDPR;
      uniform float uThickness;
      uniform float uTime;
      uniform float uEnableShaderEffect;
      uniform float uEffectAmplitude;
      
      varying vec2 vUV;
      
      vec4 getPosition() {
          vec4 current = vec4(position, 1.0);
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 nextScreen = next.xy * aspect;
          vec2 prevScreen = prev.xy * aspect;
          vec2 tangent = normalize(nextScreen - prevScreen);
          vec2 normal = vec2(-tangent.y, tangent.x);
          normal /= aspect;
          normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
          float dist = length(nextScreen - prevScreen);
          normal *= smoothstep(0.0, 0.02, dist);
          float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
          float pixelWidth = current.w * pixelWidthRatio;
          normal *= pixelWidth * uThickness;
          current.xy -= normal * side;
          if(uEnableShaderEffect > 0.5) {
            current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
          }
          return current;
      }
      
      void main() {
          vUV = uv;
          gl_Position = getPosition();
      }
    `;
        const fragment = `
      precision highp float;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uEnableFade;
      varying vec2 vUV;
      void main() {
          float fadeFactor = 1.0;
          if(uEnableFade > 0.5) {
              fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
          }
          gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
      }
    `;
        function resize() {
            if (!container)
                return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            lines.forEach((line) => line.polyline.resize());
        }
        window.addEventListener("resize", resize);
        const center = (colors.length - 1) / 2;
        colors.forEach((color, index) => {
            const spring = baseSpring + (Math.random() - 0.5) * 0.05;
            const friction = baseFriction + (Math.random() - 0.5) * 0.05;
            const thickness = baseThickness + (Math.random() - 0.5) * 3;
            const mouseOffset = new Vec3((index - center) * offsetFactor + (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.1, 0);
            const line = {
                spring,
                friction,
                mouseVelocity: new Vec3(),
                mouseOffset,
                points: [],
                polyline: {},
            };
            const count = pointCount;
            const points = [];
            for (let i = 0; i < count; i++) {
                points.push(new Vec3());
            }
            line.points = points;
            line.polyline = new Polyline(gl, {
                points,
                vertex,
                fragment,
                uniforms: {
                    uColor: { value: new Color(color) },
                    uThickness: { value: thickness },
                    uOpacity: { value: 1.0 },
                    uTime: { value: 0.0 },
                    uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
                    uEffectAmplitude: { value: effectAmplitude },
                    uEnableFade: { value: enableFade ? 1.0 : 0.0 },
                },
            });
            line.polyline.mesh.setParent(scene);
            lines.push(line);
        });
        resize();
        const mouse = new Vec3();
        function updateMouse(e) {
            let x, y;
            if (!container)
                return;
            const rect = container.getBoundingClientRect();
            if ("changedTouches" in e && e.changedTouches.length) {
                x = e.changedTouches[0].clientX - rect.left;
                y = e.changedTouches[0].clientY - rect.top;
            }
            else if (e instanceof MouseEvent) {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            else {
                x = 0;
                y = 0;
            }
            const width = container.clientWidth;
            const height = container.clientHeight;
            mouse.set((x / width) * 2 - 1, (y / height) * -2 + 1, 0);
        }
        container.addEventListener("mousemove", updateMouse);
        container.addEventListener("touchstart", updateMouse);
        container.addEventListener("touchmove", updateMouse);
        const tmp = new Vec3();
        let frameId;
        let lastTime = performance.now();
        function update() {
            frameId = requestAnimationFrame(update);
            const currentTime = performance.now();
            const dt = currentTime - lastTime;
            lastTime = currentTime;
            lines.forEach((line) => {
                tmp
                    .copy(mouse)
                    .add(line.mouseOffset)
                    .sub(line.points[0])
                    .multiply(line.spring);
                line.mouseVelocity.add(tmp).multiply(line.friction);
                line.points[0].add(line.mouseVelocity);
                for (let i = 1; i < line.points.length; i++) {
                    if (isFinite(maxAge) && maxAge > 0) {
                        const segmentDelay = maxAge / (line.points.length - 1);
                        const alpha = Math.min(1, (dt * speedMultiplier) / segmentDelay);
                        line.points[i].lerp(line.points[i - 1], alpha);
                    }
                    else {
                        line.points[i].lerp(line.points[i - 1], 0.9);
                    }
                }
                if (line.polyline.mesh.program.uniforms.uTime) {
                    line.polyline.mesh.program.uniforms.uTime.value = currentTime * 0.001;
                }
                line.polyline.updateGeometry();
            });
            renderer.render({ scene });
        }
        update();
        return () => {
            window.removeEventListener("resize", resize);
            container.removeEventListener("mousemove", updateMouse);
            container.removeEventListener("touchstart", updateMouse);
            container.removeEventListener("touchmove", updateMouse);
            cancelAnimationFrame(frameId);
            if (gl.canvas && gl.canvas.parentNode === container) {
                container.removeChild(gl.canvas);
            }
        };
    }, [
        colors,
        baseSpring,
        baseFriction,
        baseThickness,
        offsetFactor,
        maxAge,
        pointCount,
        speedMultiplier,
        enableFade,
        enableShaderEffect,
        effectAmplitude,
        backgroundColor,
    ]);
    return (jsxs(Fragment, { children: [jsx("style", { children: `
    .ribbons-container {
  width: 100%;
  height: 100%;
  position: relative;
}
    ` }), jsx("div", { ref: containerRef, className: "ribbons-container" }), ";"] }));
};

function pointerPrototype() {
    return {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: { r: 0, g: 0, b: 0 },
    };
}
function SplashCursor({ SIM_RESOLUTION = 128, DYE_RESOLUTION = 1440, CAPTURE_RESOLUTION = 512, DENSITY_DISSIPATION = 3.5, VELOCITY_DISSIPATION = 2, PRESSURE = 0.1, PRESSURE_ITERATIONS = 20, CURL = 3, SPLAT_RADIUS = 0.2, SPLAT_FORCE = 6000, SHADING = true, COLOR_UPDATE_SPEED = 10, BACK_COLOR = { r: 0.5, g: 0, b: 0 }, TRANSPARENT = true }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        let pointers = [pointerPrototype()];
        let config = {
            SIM_RESOLUTION: SIM_RESOLUTION,
            DYE_RESOLUTION: DYE_RESOLUTION,
            DENSITY_DISSIPATION: DENSITY_DISSIPATION,
            VELOCITY_DISSIPATION: VELOCITY_DISSIPATION,
            PRESSURE: PRESSURE,
            PRESSURE_ITERATIONS: PRESSURE_ITERATIONS,
            CURL: CURL,
            SPLAT_RADIUS: SPLAT_RADIUS,
            SPLAT_FORCE: SPLAT_FORCE,
            SHADING,
            COLOR_UPDATE_SPEED: COLOR_UPDATE_SPEED};
        const { gl, ext } = getWebGLContext(canvas);
        if (!gl || !ext)
            return;
        if (!ext.supportLinearFiltering) {
            config.DYE_RESOLUTION = 256;
            config.SHADING = false;
        }
        function getWebGLContext(canvas) {
            const params = {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                preserveDrawingBuffer: false,
            };
            let gl = canvas.getContext("webgl2", params);
            if (!gl) {
                gl = (canvas.getContext("webgl", params) ||
                    canvas.getContext("experimental-webgl", params));
            }
            if (!gl) {
                throw new Error("Unable to initialize WebGL.");
            }
            const isWebGL2 = "drawBuffers" in gl;
            let supportLinearFiltering = false;
            let halfFloat = null;
            if (isWebGL2) {
                gl.getExtension("EXT_color_buffer_float");
                supportLinearFiltering = !!gl.getExtension("OES_texture_float_linear");
            }
            else {
                halfFloat = gl.getExtension("OES_texture_half_float");
                supportLinearFiltering = !!gl.getExtension("OES_texture_half_float_linear");
            }
            gl.clearColor(0, 0, 0, 1);
            const halfFloatTexType = isWebGL2
                ? gl.HALF_FLOAT
                : (halfFloat && halfFloat.HALF_FLOAT_OES) || 0;
            let formatRGBA;
            let formatRG;
            let formatR;
            if (isWebGL2) {
                formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
            }
            else {
                formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            }
            return {
                gl,
                ext: {
                    formatRGBA,
                    formatRG,
                    formatR,
                    halfFloatTexType,
                    supportLinearFiltering,
                },
            };
        }
        function getSupportedFormat(gl, internalFormat, format, type) {
            if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
                if ("drawBuffers" in gl) {
                    const gl2 = gl;
                    switch (internalFormat) {
                        case gl2.R16F:
                            return getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type);
                        case gl2.RG16F:
                            return getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type);
                        default:
                            return null;
                    }
                }
                return null;
            }
            return { internalFormat, format };
        }
        function supportRenderTextureFormat(gl, internalFormat, format, type) {
            const texture = gl.createTexture();
            if (!texture)
                return false;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
            const fbo = gl.createFramebuffer();
            if (!fbo)
                return false;
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            return status === gl.FRAMEBUFFER_COMPLETE;
        }
        function hashCode(s) {
            if (!s.length)
                return 0;
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                hash = (hash << 5) - hash + s.charCodeAt(i);
                hash |= 0;
            }
            return hash;
        }
        function addKeywords(source, keywords) {
            if (!keywords)
                return source;
            let keywordsString = "";
            for (const keyword of keywords) {
                keywordsString += `#define ${keyword}\n`;
            }
            return keywordsString + source;
        }
        function compileShader(type, source, keywords = null) {
            const shaderSource = addKeywords(source, keywords);
            const shader = gl.createShader(type);
            if (!shader)
                return null;
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.trace(gl.getShaderInfoLog(shader));
            }
            return shader;
        }
        function createProgram(vertexShader, fragmentShader) {
            if (!vertexShader || !fragmentShader)
                return null;
            const program = gl.createProgram();
            if (!program)
                return null;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.trace(gl.getProgramInfoLog(program));
            }
            return program;
        }
        function getUniforms(program) {
            let uniforms = {};
            const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                const uniformInfo = gl.getActiveUniform(program, i);
                if (uniformInfo) {
                    uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
                }
            }
            return uniforms;
        }
        class Program {
            constructor(vertexShader, fragmentShader) {
                this.program = createProgram(vertexShader, fragmentShader);
                this.uniforms = this.program ? getUniforms(this.program) : {};
            }
            bind() {
                if (this.program)
                    gl.useProgram(this.program);
            }
        }
        class Material {
            constructor(vertexShader, fragmentShaderSource) {
                this.vertexShader = vertexShader;
                this.fragmentShaderSource = fragmentShaderSource;
                this.programs = {};
                this.activeProgram = null;
                this.uniforms = {};
            }
            setKeywords(keywords) {
                let hash = 0;
                for (const kw of keywords) {
                    hash += hashCode(kw);
                }
                let program = this.programs[hash];
                if (program == null) {
                    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
                    program = createProgram(this.vertexShader, fragmentShader);
                    this.programs[hash] = program;
                }
                if (program === this.activeProgram)
                    return;
                if (program) {
                    this.uniforms = getUniforms(program);
                }
                this.activeProgram = program;
            }
            bind() {
                if (this.activeProgram) {
                    gl.useProgram(this.activeProgram);
                }
            }
        }
        const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);
        const copyShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
          gl_FragColor = texture2D(uTexture, vUv);
      }
    `);
        const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);
        const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `;
        const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `);
        const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);

          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
          #ifdef MANUAL_FILTERING
              vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
              vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
              vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
              vec4 result = texture2D(uSource, coord);
          #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
      }
    `, ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]);
        const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;

          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }

          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);
        const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);
        const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;

          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;

          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);
        const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);
        const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);
        const blit = (() => {
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
            const elemBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);
            return (target, doClear = false) => {
                if (!gl)
                    return;
                if (!target) {
                    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
                else {
                    gl.viewport(0, 0, target.width, target.height);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
                }
                if (doClear) {
                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
        })();
        let dye;
        let velocity;
        let divergence;
        let curl;
        let pressure;
        const copyProgram = new Program(baseVertexShader, copyShader);
        const clearProgram = new Program(baseVertexShader, clearShader);
        const splatProgram = new Program(baseVertexShader, splatShader);
        const advectionProgram = new Program(baseVertexShader, advectionShader);
        const divergenceProgram = new Program(baseVertexShader, divergenceShader);
        const curlProgram = new Program(baseVertexShader, curlShader);
        const vorticityProgram = new Program(baseVertexShader, vorticityShader);
        const pressureProgram = new Program(baseVertexShader, pressureShader);
        const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
        const displayMaterial = new Material(baseVertexShader, displayShaderSource);
        function createFBO(w, h, internalFormat, format, type, param) {
            gl.activeTexture(gl.TEXTURE0);
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT);
            const texelSizeX = 1 / w;
            const texelSizeY = 1 / h;
            return {
                texture,
                fbo,
                width: w,
                height: h,
                texelSizeX,
                texelSizeY,
                attach(id) {
                    gl.activeTexture(gl.TEXTURE0 + id);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    return id;
                },
            };
        }
        function createDoubleFBO(w, h, internalFormat, format, type, param) {
            const fbo1 = createFBO(w, h, internalFormat, format, type, param);
            const fbo2 = createFBO(w, h, internalFormat, format, type, param);
            return {
                width: w,
                height: h,
                texelSizeX: fbo1.texelSizeX,
                texelSizeY: fbo1.texelSizeY,
                read: fbo1,
                write: fbo2,
                swap() {
                    const tmp = this.read;
                    this.read = this.write;
                    this.write = tmp;
                },
            };
        }
        function resizeFBO(target, w, h, internalFormat, format, type, param) {
            const newFBO = createFBO(w, h, internalFormat, format, type, param);
            copyProgram.bind();
            if (copyProgram.uniforms.uTexture)
                gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
            blit(newFBO, false);
            return newFBO;
        }
        function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
            if (target.width === w && target.height === h)
                return target;
            target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
            target.write = createFBO(w, h, internalFormat, format, type, param);
            target.width = w;
            target.height = h;
            target.texelSizeX = 1 / w;
            target.texelSizeY = 1 / h;
            return target;
        }
        function initFramebuffers() {
            const simRes = getResolution(config.SIM_RESOLUTION);
            const dyeRes = getResolution(config.DYE_RESOLUTION);
            const texType = ext.halfFloatTexType;
            const rgba = ext.formatRGBA;
            const rg = ext.formatRG;
            const r = ext.formatR;
            const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
            gl.disable(gl.BLEND);
            if (!dye) {
                dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
            }
            else {
                dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
            }
            if (!velocity) {
                velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
            }
            else {
                velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
            }
            divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
            curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
            pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
        }
        function updateKeywords() {
            const displayKeywords = [];
            if (config.SHADING)
                displayKeywords.push("SHADING");
            displayMaterial.setKeywords(displayKeywords);
        }
        function getResolution(resolution) {
            const w = gl.drawingBufferWidth;
            const h = gl.drawingBufferHeight;
            const aspectRatio = w / h;
            let aspect = aspectRatio < 1 ? 1 / aspectRatio : aspectRatio;
            const min = Math.round(resolution);
            const max = Math.round(resolution * aspect);
            if (w > h) {
                return { width: max, height: min };
            }
            return { width: min, height: max };
        }
        function scaleByPixelRatio(input) {
            const pixelRatio = window.devicePixelRatio || 1;
            return Math.floor(input * pixelRatio);
        }
        updateKeywords();
        initFramebuffers();
        let lastUpdateTime = Date.now();
        let colorUpdateTimer = 0.0;
        function updateFrame() {
            const dt = calcDeltaTime();
            if (resizeCanvas())
                initFramebuffers();
            updateColors(dt);
            applyInputs();
            step(dt);
            render(null);
            requestAnimationFrame(updateFrame);
        }
        function calcDeltaTime() {
            const now = Date.now();
            let dt = (now - lastUpdateTime) / 1000;
            dt = Math.min(dt, 0.016666);
            lastUpdateTime = now;
            return dt;
        }
        function resizeCanvas() {
            const width = scaleByPixelRatio(canvas.clientWidth);
            const height = scaleByPixelRatio(canvas.clientHeight);
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                return true;
            }
            return false;
        }
        function updateColors(dt) {
            colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
            if (colorUpdateTimer >= 1) {
                colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
                pointers.forEach((p) => {
                    p.color = generateColor();
                });
            }
        }
        function applyInputs() {
            for (const p of pointers) {
                if (p.moved) {
                    p.moved = false;
                    splatPointer(p);
                }
            }
        }
        function step(dt) {
            gl.disable(gl.BLEND);
            curlProgram.bind();
            if (curlProgram.uniforms.texelSize) {
                gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (curlProgram.uniforms.uVelocity) {
                gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
            }
            blit(curl);
            vorticityProgram.bind();
            if (vorticityProgram.uniforms.texelSize) {
                gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (vorticityProgram.uniforms.uVelocity) {
                gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
            }
            if (vorticityProgram.uniforms.uCurl) {
                gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
            }
            if (vorticityProgram.uniforms.curl) {
                gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
            }
            if (vorticityProgram.uniforms.dt) {
                gl.uniform1f(vorticityProgram.uniforms.dt, dt);
            }
            blit(velocity.write);
            velocity.swap();
            divergenceProgram.bind();
            if (divergenceProgram.uniforms.texelSize) {
                gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (divergenceProgram.uniforms.uVelocity) {
                gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
            }
            blit(divergence);
            clearProgram.bind();
            if (clearProgram.uniforms.uTexture) {
                gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
            }
            if (clearProgram.uniforms.value) {
                gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
            }
            blit(pressure.write);
            pressure.swap();
            pressureProgram.bind();
            if (pressureProgram.uniforms.texelSize) {
                gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (pressureProgram.uniforms.uDivergence) {
                gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
            }
            for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                if (pressureProgram.uniforms.uPressure) {
                    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                }
                blit(pressure.write);
                pressure.swap();
            }
            gradienSubtractProgram.bind();
            if (gradienSubtractProgram.uniforms.texelSize) {
                gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (gradienSubtractProgram.uniforms.uPressure) {
                gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
            }
            if (gradienSubtractProgram.uniforms.uVelocity) {
                gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
            }
            blit(velocity.write);
            velocity.swap();
            advectionProgram.bind();
            if (advectionProgram.uniforms.texelSize) {
                gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            if (!ext.supportLinearFiltering &&
                advectionProgram.uniforms.dyeTexelSize) {
                gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
            }
            const velocityId = velocity.read.attach(0);
            if (advectionProgram.uniforms.uVelocity) {
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
            }
            if (advectionProgram.uniforms.uSource) {
                gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
            }
            if (advectionProgram.uniforms.dt) {
                gl.uniform1f(advectionProgram.uniforms.dt, dt);
            }
            if (advectionProgram.uniforms.dissipation) {
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
            }
            blit(velocity.write);
            velocity.swap();
            if (!ext.supportLinearFiltering &&
                advectionProgram.uniforms.dyeTexelSize) {
                gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
            }
            if (advectionProgram.uniforms.uVelocity) {
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
            }
            if (advectionProgram.uniforms.uSource) {
                gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
            }
            if (advectionProgram.uniforms.dissipation) {
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
            }
            blit(dye.write);
            dye.swap();
        }
        function render(target) {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
            drawDisplay(target);
        }
        function drawDisplay(target) {
            const width = gl.drawingBufferWidth;
            const height = gl.drawingBufferHeight;
            displayMaterial.bind();
            if (config.SHADING && displayMaterial.uniforms.texelSize) {
                gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height);
            }
            if (displayMaterial.uniforms.uTexture) {
                gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
            }
            blit(target, false);
        }
        function splatPointer(pointer) {
            const dx = pointer.deltaX * config.SPLAT_FORCE;
            const dy = pointer.deltaY * config.SPLAT_FORCE;
            splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
        }
        function clickSplat(pointer) {
            const color = generateColor();
            color.r *= 10;
            color.g *= 10;
            color.b *= 10;
            const dx = 10 * (Math.random() - 0.5);
            const dy = 30 * (Math.random() - 0.5);
            splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
        }
        function splat(x, y, dx, dy, color) {
            splatProgram.bind();
            if (splatProgram.uniforms.uTarget) {
                gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
            }
            if (splatProgram.uniforms.aspectRatio) {
                gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
            }
            if (splatProgram.uniforms.point) {
                gl.uniform2f(splatProgram.uniforms.point, x, y);
            }
            if (splatProgram.uniforms.color) {
                gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
            }
            if (splatProgram.uniforms.radius) {
                gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
            }
            blit(velocity.write);
            velocity.swap();
            if (splatProgram.uniforms.uTarget) {
                gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
            }
            if (splatProgram.uniforms.color) {
                gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
            }
            blit(dye.write);
            dye.swap();
        }
        function correctRadius(radius) {
            const aspectRatio = canvas.width / canvas.height;
            if (aspectRatio > 1)
                radius *= aspectRatio;
            return radius;
        }
        function updatePointerDownData(pointer, id, posX, posY) {
            pointer.id = id;
            pointer.down = true;
            pointer.moved = false;
            pointer.texcoordX = posX / canvas.width;
            pointer.texcoordY = 1 - posY / canvas.height;
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.deltaX = 0;
            pointer.deltaY = 0;
            pointer.color = generateColor();
        }
        function updatePointerMoveData(pointer, posX, posY, color) {
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.texcoordX = posX / canvas.width;
            pointer.texcoordY = 1 - posY / canvas.height;
            pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
            pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
            pointer.moved =
                Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
            pointer.color = color;
        }
        function updatePointerUpData(pointer) {
            pointer.down = false;
        }
        function correctDeltaX(delta) {
            const aspectRatio = canvas.width / canvas.height;
            if (aspectRatio < 1)
                delta *= aspectRatio;
            return delta;
        }
        function correctDeltaY(delta) {
            const aspectRatio = canvas.width / canvas.height;
            if (aspectRatio > 1)
                delta /= aspectRatio;
            return delta;
        }
        function generateColor() {
            const c = HSVtoRGB(Math.random(), 1.0, 1.0);
            c.r *= 0.15;
            c.g *= 0.15;
            c.b *= 0.15;
            return c;
        }
        function HSVtoRGB(h, s, v) {
            let r = 0, g = 0, b = 0;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }
            return { r, g, b };
        }
        function wrap(value, min, max) {
            const range = max - min;
            return ((value - min) % range) + min;
        }
        window.addEventListener("mousedown", (e) => {
            const pointer = pointers[0];
            const posX = scaleByPixelRatio(e.clientX);
            const posY = scaleByPixelRatio(e.clientY);
            updatePointerDownData(pointer, -1, posX, posY);
            clickSplat(pointer);
        });
        function handleFirstMouseMove(e) {
            const pointer = pointers[0];
            const posX = scaleByPixelRatio(e.clientX);
            const posY = scaleByPixelRatio(e.clientY);
            const color = generateColor();
            updateFrame();
            updatePointerMoveData(pointer, posX, posY, color);
            document.body.removeEventListener("mousemove", handleFirstMouseMove);
        }
        document.body.addEventListener("mousemove", handleFirstMouseMove);
        window.addEventListener("mousemove", (e) => {
            const pointer = pointers[0];
            const posX = scaleByPixelRatio(e.clientX);
            const posY = scaleByPixelRatio(e.clientY);
            const color = pointer.color;
            updatePointerMoveData(pointer, posX, posY, color);
        });
        function handleFirstTouchStart(e) {
            const touches = e.targetTouches;
            const pointer = pointers[0];
            for (let i = 0; i < touches.length; i++) {
                const posX = scaleByPixelRatio(touches[i].clientX);
                const posY = scaleByPixelRatio(touches[i].clientY);
                updateFrame();
                updatePointerDownData(pointer, touches[i].identifier, posX, posY);
            }
            document.body.removeEventListener("touchstart", handleFirstTouchStart);
        }
        document.body.addEventListener("touchstart", handleFirstTouchStart);
        window.addEventListener("touchstart", (e) => {
            const touches = e.targetTouches;
            const pointer = pointers[0];
            for (let i = 0; i < touches.length; i++) {
                const posX = scaleByPixelRatio(touches[i].clientX);
                const posY = scaleByPixelRatio(touches[i].clientY);
                updatePointerDownData(pointer, touches[i].identifier, posX, posY);
            }
        }, false);
        window.addEventListener("touchmove", (e) => {
            const touches = e.targetTouches;
            const pointer = pointers[0];
            for (let i = 0; i < touches.length; i++) {
                const posX = scaleByPixelRatio(touches[i].clientX);
                const posY = scaleByPixelRatio(touches[i].clientY);
                updatePointerMoveData(pointer, posX, posY, pointer.color);
            }
        }, false);
        window.addEventListener("touchend", (e) => {
            const touches = e.changedTouches;
            const pointer = pointers[0];
            for (let i = 0; i < touches.length; i++) {
                updatePointerUpData(pointer);
            }
        });
    }, [
        SIM_RESOLUTION,
        DYE_RESOLUTION,
        CAPTURE_RESOLUTION,
        DENSITY_DISSIPATION,
        VELOCITY_DISSIPATION,
        PRESSURE,
        PRESSURE_ITERATIONS,
        CURL,
        SPLAT_RADIUS,
        SPLAT_FORCE,
        SHADING,
        COLOR_UPDATE_SPEED,
        BACK_COLOR,
        TRANSPARENT,
    ]);
    return (jsx("div", { style: {
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 50,
            pointerEvents: "none",
            width: "100%",
            height: "100%",
        }, children: jsx("canvas", { ref: canvasRef, id: "fluid", style: {
                width: "100vw",
                height: "100vh",
                display: "block",
            } }) }));
}

function parseHexColor(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return [r, g, b];
}
function fract(x) {
    return x - Math.floor(x);
}
function hash31(p) {
    let r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
    const r_yzx = [r[1], r[2], r[0]];
    const dotVal = r[0] * (r_yzx[0] + 33.33) +
        r[1] * (r_yzx[1] + 33.33) +
        r[2] * (r_yzx[2] + 33.33);
    for (let i = 0; i < 3; i++) {
        r[i] = fract(r[i] + dotVal);
    }
    return r;
}
function hash33(v) {
    let p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
    const p_yxz = [p[1], p[0], p[2]];
    const dotVal = p[0] * (p_yxz[0] + 33.33) +
        p[1] * (p_yxz[1] + 33.33) +
        p[2] * (p_yxz[2] + 33.33);
    for (let i = 0; i < 3; i++) {
        p[i] = fract(p[i] + dotVal);
    }
    const p_xxy = [p[0], p[0], p[1]];
    const p_yxx = [p[1], p[0], p[0]];
    const p_zyx = [p[2], p[1], p[0]];
    const result = [];
    for (let i = 0; i < 3; i++) {
        result[i] = fract((p_xxy[i] + p_yxx[i]) * p_zyx[i]);
    }
    return result;
}
const vertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform float iClumpFactor;
uniform bool enableTransparency;
out vec4 outColor;
const float PI = 3.14159265359;
 
float getMetaBallValue(vec2 c, float r, vec2 p) {
    vec2 d = p - c;
    float dist2 = dot(d, d);
    return (r * r) / dist2;
}
 
void main() {
    vec2 fc = gl_FragCoord.xy;
    float scale = iAnimationSize / iResolution.y;
    vec2 coord = (fc - iResolution.xy * 0.5) * scale;
    vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;
    float m1 = 0.0;
    for (int i = 0; i < 50; i++) {
        if (i >= iBallCount) break;
        m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);
    }
    float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);
    float total = m1 + m2;
    float f = smoothstep(-1.0, 1.0, (total - 1.3) / min(1.0, fwidth(total)));
    vec3 cFinal = vec3(0.0);
    if (total > 0.0) {
        float alpha1 = m1 / total;
        float alpha2 = m2 / total;
        cFinal = iColor * alpha1 + iCursorColor * alpha2;
    }
    outColor = vec4(cFinal * f, enableTransparency ? f : 1.0);
}
`;
const MetaBalls = ({ color = "#ffffff", speed = 0.3, enableMouseInteraction = true, hoverSmoothness = 0.05, animationSize = 30, ballCount = 15, clumpFactor = 1, cursorBallSize = 3, cursorBallColor = "#ffffff", enableTransparency = false, }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const dpr = 1;
        const renderer = new Renderer({
            dpr,
            alpha: true,
            premultipliedAlpha: false,
        });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, enableTransparency ? 0 : 1);
        container.appendChild(gl.canvas);
        const camera = new Camera(gl, {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0.1,
            far: 10,
        });
        camera.position.z = 1;
        const geometry = new Triangle(gl);
        const [r1, g1, b1] = parseHexColor(color);
        const [r2, g2, b2] = parseHexColor(cursorBallColor);
        const metaBallsUniform = [];
        for (let i = 0; i < 50; i++) {
            metaBallsUniform.push(new Vec3(0, 0, 0));
        }
        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new Vec3(0, 0, 0) },
                iMouse: { value: new Vec3(0, 0, 0) },
                iColor: { value: new Vec3(r1, g1, b1) },
                iCursorColor: { value: new Vec3(r2, g2, b2) },
                iAnimationSize: { value: animationSize },
                iBallCount: { value: ballCount },
                iCursorBallSize: { value: cursorBallSize },
                iMetaBalls: { value: metaBallsUniform },
                iClumpFactor: { value: clumpFactor },
                enableTransparency: { value: enableTransparency },
            },
        });
        const mesh = new Mesh(gl, { geometry, program });
        const scene = new Transform();
        mesh.setParent(scene);
        const maxBalls = 50;
        const effectiveBallCount = Math.min(ballCount, maxBalls);
        const ballParams = [];
        for (let i = 0; i < effectiveBallCount; i++) {
            const idx = i + 1;
            const h1 = hash31(idx);
            const st = h1[0] * (2 * Math.PI);
            const dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
            const baseScale = 5.0 + h1[1] * (10.0 - 5.0);
            const h2 = hash33(h1);
            const toggle = Math.floor(h2[0] * 2.0);
            const radiusVal = 0.5 + h2[2] * (2.0 - 0.5);
            ballParams.push({ st, dtFactor, baseScale, toggle, radius: radiusVal });
        }
        const mouseBallPos = { x: 0, y: 0 };
        let pointerInside = false;
        let pointerX = 0;
        let pointerY = 0;
        function resize() {
            if (!container)
                return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width * dpr, height * dpr);
            gl.canvas.style.width = `${width}px`;
            gl.canvas.style.height = `${height}px`;
            program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
        }
        window.addEventListener("resize", resize);
        resize();
        function onPointerMove(e) {
            if (!enableMouseInteraction || !container)
                return;
            const rect = container.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            pointerX = (px / rect.width) * gl.canvas.width;
            pointerY = (1 - py / rect.height) * gl.canvas.height;
        }
        function onPointerEnter() {
            if (!enableMouseInteraction)
                return;
            pointerInside = true;
        }
        function onPointerLeave() {
            if (!enableMouseInteraction)
                return;
            pointerInside = false;
        }
        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerenter", onPointerEnter);
        container.addEventListener("pointerleave", onPointerLeave);
        const startTime = performance.now();
        let animationFrameId;
        function update(t) {
            animationFrameId = requestAnimationFrame(update);
            const elapsed = (t - startTime) * 0.001;
            program.uniforms.iTime.value = elapsed;
            for (let i = 0; i < effectiveBallCount; i++) {
                const p = ballParams[i];
                const dt = elapsed * speed * p.dtFactor;
                const th = p.st + dt;
                const x = Math.cos(th);
                const y = Math.sin(th + dt * p.toggle);
                const posX = x * p.baseScale * clumpFactor;
                const posY = y * p.baseScale * clumpFactor;
                metaBallsUniform[i].set(posX, posY, p.radius);
            }
            let targetX, targetY;
            if (pointerInside) {
                targetX = pointerX;
                targetY = pointerY;
            }
            else {
                const cx = gl.canvas.width * 0.5;
                const cy = gl.canvas.height * 0.5;
                const rx = gl.canvas.width * 0.15;
                const ry = gl.canvas.height * 0.15;
                targetX = cx + Math.cos(elapsed * speed) * rx;
                targetY = cy + Math.sin(elapsed * speed) * ry;
            }
            mouseBallPos.x += (targetX - mouseBallPos.x) * hoverSmoothness;
            mouseBallPos.y += (targetY - mouseBallPos.y) * hoverSmoothness;
            program.uniforms.iMouse.value.set(mouseBallPos.x, mouseBallPos.y, 0);
            renderer.render({ scene, camera });
        }
        animationFrameId = requestAnimationFrame(update);
        return () => {
            var _a;
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
            container.removeEventListener("pointermove", onPointerMove);
            container.removeEventListener("pointerenter", onPointerEnter);
            container.removeEventListener("pointerleave", onPointerLeave);
            container.removeChild(gl.canvas);
            (_a = gl.getExtension("WEBGL_lose_context")) === null || _a === void 0 ? void 0 : _a.loseContext();
        };
    }, [
        color,
        cursorBallColor,
        speed,
        enableMouseInteraction,
        hoverSmoothness,
        animationSize,
        ballCount,
        clumpFactor,
        cursorBallSize,
        enableTransparency,
    ]);
    return (jsxs(Fragment, { children: [jsx("style", { children: `
    .metaballs-container {
  position: relative;
  width: 100%;
  height: 100%;
}
    ` }), jsx("div", { ref: containerRef, className: "metaballs-container" })] }));
};

function BlobCursor({ blobType = "circle", fillColor = "#5227FF", trailCount = 3, sizes = [60, 125, 75], innerSizes = [20, 35, 25], innerColor = "rgba(255,255,255,0.8)", opacities = [0.6, 0.6, 0.6], shadowColor = "rgba(0,0,0,0.75)", shadowBlur = 5, shadowOffsetX = 10, shadowOffsetY = 10, filterId = "blob", filterStdDeviation = 30, filterColorMatrixValues = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10", useFilter = true, fastDuration = 0.1, slowDuration = 0.5, fastEase = "power3.out", slowEase = "power1.out", zIndex = 100, }) {
    const containerRef = useRef(null);
    const blobsRef = useRef([]);
    const updateOffset = useCallback(() => {
        if (!containerRef.current)
            return { left: 0, top: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
    }, []);
    const handleMove = useCallback((e) => {
        const { left, top } = updateOffset();
        const x = "clientX" in e ? e.clientX : e.touches[0].clientX;
        const y = "clientY" in e ? e.clientY : e.touches[0].clientY;
        blobsRef.current.forEach((el, i) => {
            if (!el)
                return;
            const isLead = i === 0;
            gsap$1.to(el, {
                x: x - left,
                y: y - top,
                duration: isLead ? fastDuration : slowDuration,
                ease: isLead ? fastEase : slowEase,
            });
        });
    }, [updateOffset, fastDuration, slowDuration, fastEase, slowEase]);
    useEffect(() => {
        const onResize = () => updateOffset();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [updateOffset]);
    return (jsxs(Fragment, { children: [jsx("style", { children: `.blob-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.blob-main {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  user-select: none;
  cursor: default;
}

.blob {
  position: absolute;
  will-change: transform;
  transform: translate(-50%, -50%);
}

.inner-dot {
  position: absolute;
}` }), jsxs("div", { ref: containerRef, className: "blob-container", style: { zIndex }, onMouseMove: handleMove, onTouchMove: handleMove, children: [useFilter && (jsx("svg", { style: { position: "absolute", width: 0, height: 0 }, children: jsxs("filter", { id: filterId, children: [jsx("feGaussianBlur", { in: "SourceGraphic", result: "blur", stdDeviation: filterStdDeviation }), jsx("feColorMatrix", { in: "blur", values: filterColorMatrixValues })] }) })), jsx("div", { className: "blob-main", style: { filter: useFilter ? `url(#${filterId})` : undefined }, children: Array.from({ length: trailCount }).map((_, i) => (jsx("div", { ref: (el) => {
                                blobsRef.current[i] = el;
                            }, className: "blob", style: {
                                width: sizes[i],
                                height: sizes[i],
                                borderRadius: blobType === "circle" ? "50%" : "0%",
                                backgroundColor: fillColor,
                                opacity: opacities[i],
                                boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
                            }, children: jsx("div", { className: "inner-dot", style: {
                                    width: innerSizes[i],
                                    height: innerSizes[i],
                                    top: (sizes[i] - innerSizes[i]) / 2,
                                    left: (sizes[i] - innerSizes[i]) / 2,
                                    backgroundColor: innerColor,
                                    borderRadius: blobType === "circle" ? "50%" : "0%",
                                } }) }, i))) })] })] }));
}

export { AnimatedContent, BlobCursor, Bounce, ClickSpark, Crosshair, FadeContent, GlareHover, ImageTrail, Magnet, MagnetLines, MetaBalls, MetallicPaint, Noise, Ribbons, SplashCursor, StarBorder };
//# sourceMappingURL=index.es.js.map
