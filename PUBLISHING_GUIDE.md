# ReactBits Animations - Publishing Guide

This guide will help you publish your ReactBits Animations package to npm.

## 📋 Pre-Publishing Checklist

### 1. Update Package Information

Before publishing, update the following in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/reactbits-animations.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/reactbits-animations#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/reactbits-animations/issues"
  },
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### 2. Verify Package Name Availability

Check if your package name is available:

```bash
npm view reactbits-animations
```

If the package already exists, consider:
- Using a scoped package: `@yourusername/reactbits-animations`
- Choosing a different name: `reactbits-ui-animations`, `react-bits-animations`, etc.

### 3. Build the Package

Ensure your package builds correctly:

```bash
npm run build
```

### 4. Test the Package

Run the test script to verify everything is working:

```bash
node test-package.js
```

## 🚀 Publishing Steps

### Step 1: Create npm Account

If you don't have an npm account:
1. Go to [npmjs.com](https://www.npmjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### Step 3: Dry Run (Recommended)

Test the publishing process without actually publishing:

```bash
npm publish --dry-run
```

This will show you exactly what files will be included in your package.

### Step 4: Publish to npm

```bash
npm publish
```

If using a scoped package:

```bash
npm publish --access public
```

## 📦 Package Structure

Your published package will include:

```
reactbits-animations/
├── dist/
│   ├── index.js          # CommonJS build
│   ├── index.es.js       # ES Module build
│   ├── index.d.ts        # TypeScript declarations
│   ├── index.css         # Extracted CSS
│   └── *.d.ts           # Component type declarations
├── README.md
├── LICENSE
└── package.json
```

## 🔄 Updating Your Package

### Version Management

Follow semantic versioning (semver):

- **Patch** (1.0.6 → 1.0.7): Bug fixes
- **Minor** (1.0.6 → 1.1.0): New features (backward compatible)
- **Major** (1.0.6 → 2.0.0): Breaking changes

Update version:

```bash
npm version patch   # For bug fixes
npm version minor   # For new features
npm version major   # For breaking changes
```

### Publishing Updates

```bash
npm run build
npm publish
```

## 📊 Package Usage

Once published, users can install your package:

```bash
npm install reactbits-animations
```

And use it in their projects:

```jsx
import { Bounce, ClickSpark, StarBorder } from 'reactbits-animations';

function App() {
  return (
    <div>
      <Bounce>
        <h1>Hello World!</h1>
      </Bounce>
    </div>
  );
}
```

## 🛠️ Maintenance

### Monitor Your Package

- Check download stats: `npm view reactbits-animations`
- Monitor issues on GitHub
- Respond to user feedback

### Keep Dependencies Updated

Regularly update your development dependencies:

```bash
npm update
npm audit fix
```

### Documentation

Keep your README.md updated with:
- New features
- Breaking changes
- Usage examples
- Migration guides

## 🎯 Best Practices

1. **Semantic Versioning**: Always follow semver
2. **Changelog**: Maintain a CHANGELOG.md file
3. **Testing**: Add automated tests before major releases
4. **Documentation**: Keep examples and docs up to date
5. **Backward Compatibility**: Avoid breaking changes in minor/patch releases

## 🚨 Troubleshooting

### Common Issues

**"Package name already exists"**
- Choose a different name or use a scoped package

**"You do not have permission to publish"**
- Make sure you're logged in: `npm whoami`
- Check if you're a collaborator on the package

**"Build fails"**
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are installed

**"Files missing from package"**
- Check your `.npmignore` file
- Use `npm publish --dry-run` to preview

### Getting Help

- npm documentation: [docs.npmjs.com](https://docs.npmjs.com/)
- npm support: [npmjs.com/support](https://www.npmjs.com/support)
- Community: [npm community forum](https://github.com/npm/feedback)

## 🎉 Success!

Once published, your package will be available at:
- npm: `https://www.npmjs.com/package/reactbits-animations`
- CDN: `https://unpkg.com/reactbits-animations`

Congratulations on publishing your React animations library! 🚀
