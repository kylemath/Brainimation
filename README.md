# 🧠 BrainImation

**Live EEG Brain Data Meets Creative Coding**

An interactive web platform that combines real-time EEG brain data from Muse headsets with P5.js creative coding, enabling anyone to create brain-controlled art and visualizations in real-time.

---

## 🎓 Provenance

BrainImation was developed as part of **Kyle Mathewson's** neuroscience and brain-computer interface course to provide students with hands-on experience in:
- Real-time EEG data processing and visualization
- Brain-computer interface (BCI) development
- Creative applications of neuroscience
- Interactive programming and data visualization

The platform builds upon the open-source [muse-js](https://github.com/urish/muse-js) library and [P5.js](https://p5js.org/) creative coding framework, making brain-computer interfaces accessible to students, artists, and researchers.

---

## ✨ What is BrainImation?

BrainImation is a **zero-install web application** that lets you:

1. **Connect** to a Muse EEG headset via Bluetooth (Web Bluetooth API)
2. **Visualize** live brain activity in real-time (alpha, beta, theta, delta, gamma waves)
3. **Code** creative animations that respond to your brain state using P5.js
4. **Learn** neuroscience concepts through interactive, visual feedback
5. **Create** brain-controlled art, games, music, and experiments

No installation, no setup—just open in a browser and start coding with your brain.

---

## 🚀 Key Features

### 🧠 Brain Data Access
- **Real-time EEG streaming** from Muse 2016, Muse 2, and Muse S headsets
- **5 frequency bands**: Alpha (relaxation), Beta (focus), Theta (creativity), Delta (deep states), Gamma (cognition)
- **Derived metrics**: Attention and meditation levels
- **Raw EEG access**: Time-series data from all 4 electrodes (TP9, AF7, AF8, TP10)
- **256 Hz sampling rate** for research-grade temporal resolution

### 💻 Live Code Editor
- **Monaco Editor** (VS Code engine) with syntax highlighting
- **Intelligent autocomplete** for P5.js, p5.sound, and EEG data
- **Auto-run on save** for instant visual feedback
- **Error detection** with helpful debugging messages
- **20+ example animations** to learn from

### 🎨 P5.js Integration
- Full access to **P5.js drawing functions** (2D shapes, colors, transforms)
- **p5.sound library** for brain-controlled music and synthesis
- **Mouse, keyboard, and touch** event support
- **Webcam and media input** capabilities
- Automatic function binding—all P5.js features "just work"

### 🎵 Sound & Music
- **Brain-controlled synthesis** (FM synthesis, oscillators, effects)
- **Generative music** based on brain states
- **Audio analysis** (FFT, waveform visualization)
- **Effects processing** (reverb, delay, filters)
- Built-in sound testing and diagnostics

### 📚 Interactive Reference Panel
- **Built-in documentation** for P5.js functions
- **Sound library reference** with usage examples
- **EEG data API** documentation
- **Click-to-insert** code snippets
- **Expandable tooltips** with function signatures

### 🎮 Simulation Mode
- **No headset required** for learning and testing
- **Adjustable sliders** to simulate attention and meditation
- **Realistic brain wave patterns** for development
- Perfect for students without hardware access

### 💾 Save & Share
- **Save/load** your sketches as `.js` files
- **URL parameters** for sharing sketches (`?sketch=myfile.js`)
- **Embedded code URLs** (data URIs) for self-contained sharing
- **Auto-reload** functionality for iterative development

---

## 🌟 The Promise

BrainImation makes **neuroscience tangible** by transforming abstract brain signals into immediate, visual, and interactive experiences. 

### For Students:
- Learn EEG concepts through experimentation, not just lectures
- Develop programming skills while exploring neuroscience
- Create a portfolio of brain-controlled art projects
- Understand signal processing through visual feedback

### For Researchers:
- Rapid prototyping of BCI experiments and paradigms
- Real-time neurofeedback protocol development
- Accessible platform for participant demonstrations
- Open-source foundation for custom research tools

### For Artists & Creators:
- New medium for expression: your brain as creative input
- Brain-controlled music, visuals, and interactive installations
- Perform live with your mind as the instrument
- Explore the intersection of neuroscience and art

### For Educators:
- Engage students with hands-on brain-computer interfaces
- No complex setup or installation required
- Built-in examples and reference documentation
- Accessible to students with varying programming backgrounds

---

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5 + CSS3 + JavaScript (ES6+)
- **EEG Library**: muse-js (WebBluetooth)
- **Graphics**: P5.js (canvas-based creative coding)
- **Audio**: p5.sound (Web Audio API)
- **Editor**: Monaco Editor (VS Code engine)
- **Deployment**: Static hosting (Netlify, GitHub Pages, etc.)

**No server required. No dependencies to install. No build process needed.**

---

## 🚀 Quick Start

### Option 1: Use Hosted Version (Recommended)
Simply visit the hosted URL (when deployed to Netlify) and start creating!

### Option 2: Run Locally
1. Download `index.html` and `muse-browser.js`
2. Open `index.html` in Chrome, Edge, or Opera (Web Bluetooth required)
3. That's it! The app loads all dependencies from CDNs.

### Getting Started:
1. **Click "Simulate Data"** to test without a headset
2. **Select an example** from the dropdown menu
3. **Modify the code** in the editor and see changes instantly
4. **Connect your Muse** when ready for real brain data

---

## 💡 Example Use Cases

### 🎓 Educational
- **Neuroscience Labs**: Demonstrate brain wave patterns in real-time
- **Signal Processing**: Visualize frequency decomposition and filtering
- **BCI Courses**: Hands-on experience with brain-computer interfaces
- **Psychology**: Explore attention, meditation, and cognitive states

### 🎨 Creative
- **Generative Art**: Brain-controlled particle systems and fractals
- **Live Performance**: Use your brain as a musical instrument
- **Interactive Installations**: Public art that responds to viewer brain states
- **Meditation Tools**: Visual feedback for mindfulness practice

### 🔬 Research
- **Neurofeedback**: Real-time feedback protocols
- **ERP Experiments**: Epoch visualization and averaging
- **Cognitive Load**: Attention monitoring during tasks
- **Relaxation Studies**: Alpha wave meditation training

---

## 🌐 Browser Compatibility

**Fully Supported:**
- ✅ Chrome 56+ (Desktop & Android)
- ✅ Edge 79+
- ✅ Opera 43+

**Requires Web Bluetooth:**
- ❌ Firefox (Web Bluetooth not yet supported)
- ❌ Safari (Web Bluetooth not yet supported)
- ❌ iOS browsers (Web Bluetooth not available)

**Recommendation:** Use **Chrome** for the best experience.

---

## 🎯 Hardware Support

**Compatible Muse Devices:**
- ✅ **Muse 2016** (original Muse)
- ✅ **Muse 2** 
- ✅ **Muse S**

**Note:** The software automatically detects and adapts to different Muse models, handling device-specific characteristics gracefully.

---

## 📖 Documentation

All documentation is located in the `/docs` folder (development only):
- `STUDENT_SOUND_GUIDE.md` - Comprehensive sound system guide
- `USING_REFERENCE_PANEL.md` - How to use the interactive reference
- `MUSE_CONNECTION_FIXES.md` - Troubleshooting connection issues
- `BRAINIMATION_URL_LOADING.md` - Sharing and loading sketches via URLs

The application itself includes **built-in interactive documentation** accessible via the Reference Panel.

---

## 🤝 Contributing & Development

### Development Setup
If you want to modify the muse-js bundle:

```bash
npm install
npm run build  # Rebuilds muse-browser.js from src/muse-bundle.js
```

### File Structure
```
index.html             # Main application (all-in-one)
muse-browser.js        # Bundled muse-js library (required)
netlify.toml           # Netlify deployment configuration
.gitignore             # Excludes docs/ from deployment
package.json           # Development dependencies (optional)
src/muse-bundle.js     # Source for building muse-browser.js (optional)
docs/                  # Documentation (excluded from deployment)
```

### Deployment to Netlify
1. **Connect your Git repository** to Netlify, or
2. **Drag and drop** `brainimation.html` and `muse-browser.js` into Netlify

The `netlify.toml` configuration automatically:
- Excludes `/docs` from being served
- Sets proper caching headers
- Configures the site for optimal performance

---

## 🔒 Privacy & Security

- **All data processing happens locally** in your browser
- **No data is sent to servers** (except optional AI features with your own API key)
- **EEG data never leaves your device**
- Bluetooth connections are direct device-to-browser
- Optional AI features use your own OpenAI/Anthropic API keys (stored locally)

---

## 📜 License & Credits

### Software License
[Add your chosen license here - e.g., MIT, GPL, etc.]

### Built With
- **[muse-js](https://github.com/urish/muse-js)** by Uri Shaked - EEG data streaming
- **[P5.js](https://p5js.org/)** - Creative coding framework
- **[p5.sound](https://p5js.org/reference/#/libraries/p5.sound)** - Audio synthesis and analysis
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor (VS Code engine)

### Course Information
Developed for teaching brain-computer interfaces and computational neuroscience.  
**Instructor:** Kyle Mathewson  
**Institution:** [Add your institution]  
**Course:** [Add course name/number]

---

## 🐛 Known Limitations

- **Web Bluetooth required**: Not available in Firefox or Safari
- **Desktop recommended**: Mobile browsers have limited Web Bluetooth support
- **Muse 2016 compatibility**: Some features (PPG, gyroscope) only work with newer models
- **Frequency analysis**: Simplified band calculation (not full FFT) for performance
- **Single user**: One Muse connection at a time

---

## 📞 Support & Issues

For issues, questions, or contributions:
- **GitHub Issues**: [Add your repository URL]
- **Course Forum**: [Add course discussion forum]
- **Email**: [Add contact email]

### Common Issues:
- **"No device selected"**: Make sure Muse is charged and in pairing mode
- **"Library not loaded"**: Check internet connection for CDN resources
- **No sound**: Click canvas first, check browser permissions
- **Connection fails**: Try turning Muse off/on, move closer to computer

---

## 🎉 Get Started Now!

1. **Visit** the hosted site: [Add your Netlify URL]
2. **Click** "Simulate Data" to try without a headset
3. **Explore** the example animations in the dropdown
4. **Modify** the code and see changes in real-time
5. **Connect** your Muse headset when ready for real brain control

**No installation. No configuration. Just start creating!**

---

## 🌈 Example Gallery

Check out what's possible with BrainImation:

- **Neural Networks**: Particle systems that respond to alpha waves
- **Brain Music**: Generative melodies controlled by attention and meditation
- **EEG Traces**: Real-time visualization of raw brain signals
- **Mandala Generator**: Meditation-driven geometric patterns
- **Brain Drawing**: Draw with your mind instead of your mouse
- **Frequency Bands**: Live spectral analysis and decomposition
- **3D Visualizations**: Rotating shapes controlled by brain states

*All examples included in the application!*

---

## 🙏 Acknowledgments

Special thanks to:
- Uri Shaked for creating muse-js and making EEG accessible on the web
- The P5.js community for the incredible creative coding tools
- Students and beta testers who provided feedback and bug reports
- The open-source community for making projects like this possible

---

**Made with 🧠 + ❤️ for curious minds exploring the intersection of neuroscience, art, and technology.**

