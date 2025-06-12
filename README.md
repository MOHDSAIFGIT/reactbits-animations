# ReactBits Animations 🎨

A comprehensive collection of beautiful, performant React animation components built with TypeScript. Create stunning user interfaces with smooth animations, interactive effects, and scroll-triggered content.

[![npm version](https://badge.fury.io/js/reactbits-animations.svg)](https://badge.fury.io/js/reactbits-animations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **5 Powerful Animation Components**
- 🚀 **Performance Optimized** - Built with GSAP and native browser APIs
- 📱 **Responsive** - Works seamlessly across all devices
- 🎨 **Highly Customizable** - Extensive props for fine-tuning
- 📦 **Tree Shakeable** - Import only what you need
- 🔧 **TypeScript Support** - Full type safety out of the box
- ⚡ **Zero Dependencies** - Except for peer dependencies (React)

## 📦 Installation

```bash
npm install reactbits-animations
# or
yarn add reactbits-animations
# or
pnpm add reactbits-animations
```

## 🚀 Quick Start

```jsx
import { Bounce, ClickSpark, StarBorder, AnimatedContent, FadeContent } from 'reactbits-animations';

function App() {
  return (
    <div>
      <Bounce>
        <h1>Bouncing Header!</h1>
      </Bounce>
      
      <ClickSpark sparkColor="#ff6b6b" sparkCount={12}>
        <button>Click me for sparks!</button>
      </ClickSpark>
      
      <StarBorder color="#00d4ff" speed="4s">
        Animated Star Border
      </StarBorder>
    </div>
  );
}
```

## 🎭 Components

### 🏀 Bounce
Simple, smooth bouncing animation for any content.

```jsx
<Bounce>
  <div>This content will bounce!</div>
</Bounce>
```

**Props:**
- `children`: React.ReactNode - Content to animate

### ✨ ClickSpark
Interactive click effect that creates beautiful spark animations on user interaction.

```jsx
<ClickSpark 
  sparkColor="#ff6b6b" 
  sparkCount={8} 
  sparkRadius={20}
  duration={600}
>
  <button>Click for sparks!</button>
</ClickSpark>
```

**Props:**
- `sparkColor?`: string - Color of the sparks (default: "#fff")
- `sparkSize?`: number - Size of individual sparks (default: 10)
- `sparkRadius?`: number - Radius of spark spread (default: 15)
- `sparkCount?`: number - Number of sparks per click (default: 8)
- `duration?`: number - Animation duration in ms (default: 400)
- `easing?`: "linear" | "ease-in" | "ease-out" | "ease-in-out" - Animation easing
- `extraScale?`: number - Additional scaling factor (default: 1.0)
- `children?`: React.ReactNode - Content to wrap

### ⭐ StarBorder
Animated border effect with moving star-like gradients.

```jsx
<StarBorder 
  as="div" 
  color="#00d4ff" 
  speed="6s"
  className="my-custom-class"
>
  Beautiful Star Border
</StarBorder>
```

**Props:**
- `as?`: React.ElementType - HTML element type (default: "button")
- `color?`: string - Star color (default: "white")
- `speed?`: string - Animation speed (default: "6s")
- `className?`: string - Additional CSS classes
- `children?`: React.ReactNode - Content inside the border

### 🎬 AnimatedContent
Powerful GSAP-powered scroll-triggered animations with extensive customization.

```jsx
<AnimatedContent
  direction="vertical"
  distance={100}
  duration={0.8}
  ease="power3.out"
  threshold={0.1}
>
  <div>This content animates on scroll!</div>
</AnimatedContent>
```

**Props:**
- `distance?`: number - Animation distance in pixels (default: 100)
- `direction?`: "vertical" | "horizontal" - Animation direction (default: "vertical")
- `reverse?`: boolean - Reverse animation direction (default: false)
- `duration?`: number - Animation duration in seconds (default: 0.8)
- `ease?`: string - GSAP easing function (default: "power3.out")
- `initialOpacity?`: number - Starting opacity (default: 0)
- `animateOpacity?`: boolean - Whether to animate opacity (default: true)
- `scale?`: number - Initial scale (default: 1)
- `threshold?`: number - Scroll trigger threshold (default: 0.1)
- `delay?`: number - Animation delay in seconds (default: 0)
- `onComplete?`: () => void - Callback when animation completes

### 🌅 FadeContent
Smooth fade-in animations with optional blur effects using Intersection Observer.

```jsx
<FadeContent
  blur={true}
  duration={1000}
  threshold={0.2}
  delay={200}
>
  <div>This content fades in smoothly!</div>
</FadeContent>
```

**Props:**
- `blur?`: boolean - Add blur effect during fade (default: false)
- `duration?`: number - Animation duration in ms (default: 1000)
- `easing?`: string - CSS easing function (default: "ease-out")
- `delay?`: number - Animation delay in ms (default: 0)
- `threshold?`: number - Intersection threshold (default: 0.1)
- `initialOpacity?`: number - Starting opacity (default: 0)
- `className?`: string - Additional CSS classes

## 🛠️ Advanced Usage

### Combining Components

```jsx
<FadeContent duration={800}>
  <ClickSpark sparkColor="#ff6b6b">
    <StarBorder color="#00d4ff">
      <Bounce>
        Multi-layered Animation!
      </Bounce>
    </StarBorder>
  </ClickSpark>
</FadeContent>
```

### Custom Styling

All components accept standard React props and can be styled with CSS:

```css
.my-animated-content {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 12px;
  padding: 20px;
}
```

## 🎯 Performance Tips

1. **Tree Shaking**: Import only the components you need
2. **GSAP Optimization**: AnimatedContent uses GSAP's ScrollTrigger for optimal performance
3. **Canvas Rendering**: ClickSpark uses HTML5 Canvas for smooth animations
4. **Intersection Observer**: FadeContent uses native browser APIs for efficient scroll detection

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Your Name](https://github.com/yourusername)

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/reactbits-animations)
- [npm Package](https://www.npmjs.com/package/reactbits-animations)
- [Issues](https://github.com/yourusername/reactbits-animations/issues)

---

Made with ❤️ by the ReactBits team
