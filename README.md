# 🎓 Anki Maker

A modern, AI-powered frontend application that generates beautiful Anki flashcards from simple prompts using OpenAI GPT. Specifically designed for Vietnamese English learners with enhanced conversation-based learning and direct integration with Anki desktop.

[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red)](https://youtu.be/qz1la5ZFIRM)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?logo=material-ui&logoColor=white)](https://mui.com/)

## ✨ Features

### 🤖 AI-Powered Card Generation
- **GPT-4o-mini Integration**: Advanced conversation-based vocabulary cards
- **Vietnamese Focus**: Specialized prompts for Vietnamese English learners (A2 level)
- **Smart Conversations**: Natural 3-4 sentence dialogues with casual American speech
- **Enhanced Styling**: Beautiful glassmorphism design with animations and hover effects

### 🔗 Seamless Anki Integration
- **AnkiConnect**: Direct integration with Anki desktop (localhost:8765)
- **One-Click Import**: Add generated cards directly to your Anki decks
- **Deck Management**: Select target decks and organize with custom tags
- **Real-time Preview**: See exactly how cards will look before adding

### 🎵 Audio Features
- **TTS Integration**: OpenAI text-to-speech for pronunciation practice
- **Automatic Audio**: Generate audio for vocabulary words and conversations
- **Configurable Service**: Custom TTS endpoint support

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Automatic theme switching
- **Performance Optimized**: Lazy loading, React Query caching
- **Intuitive Interface**: Clean, user-friendly design with Material-UI

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **pnpm**
- **Anki Desktop** with **AnkiConnect** plugin installed
- **OpenAI API Key**

### Installation

```bash
# Clone the repository
git clone https://github.com/ngcdan/anki-maker.git
cd anki-maker

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Add your OpenAI API key to .env

# Start development server
pnpm dev
```

### Anki Setup
1. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin in Anki
2. Restart Anki Desktop
3. Ensure Anki is running on port 8765 (default)

## 🛠️ Development

```bash
# Development server
pnpm dev

# Type checking
pnpm build

# Linting
pnpm lint

# Testing
pnpm test

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
src/
├── components/           # UI Components
│   ├── ui/              # Card & UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── LoadingStates/   # Loading components
├── services/            # External API integrations
│   ├── anki/           # AnkiConnect service
│   ├── openai/         # OpenAI API service
│   ├── enhanced/       # Enhanced AI service
│   └── tts/            # Text-to-speech service
├── hooks/              # Custom React hooks
├── pages/              # Route components
│   └── app/            # Main application pages
├── constants/          # Configuration & constants
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── theme/              # Material-UI theme
```

## ⚙️ Configuration

### Environment Variables
```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
VITE_ANKI_CONNECT_URL=http://localhost:8765
VITE_TTS_SERVICE_URL=http://localhost:3000/dev/chatbot/tts/api
```

### AnkiConnect Configuration
- **URL**: `http://localhost:8765`
- **Required Plugin**: AnkiConnect 2055492159
- **Permissions**: Allow localhost connections

### TTS Configuration
- **Default Endpoint**: `localhost:3000/dev/chatbot/tts/api`
- **Provider**: OpenAI Text-to-Speech
- **Audio Directory**: Configurable in settings

## 🎯 Usage

1. **Enter your prompt**: Describe the vocabulary or concept you want to learn
2. **Generate cards**: AI creates conversation-based flashcards
3. **Preview & edit**: Review generated content with live preview
4. **Add to Anki**: One-click import to your Anki desktop

### Example Prompts
- `"Teach me the word 'definitely' in daily conversations"`
- `"Create cards for ordering food at restaurants"`
- `"Help me learn common greetings and responses"`

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI v5 + Emotion
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **AI Integration**: OpenAI GPT-4o-mini
- **Testing**: Vitest + Testing Library + MSW
- **Styling**: CSS-in-JS with Material-UI theming

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [AnkiConnect](https://foosoft.net/projects/anki-connect/) for Anki integration
- [OpenAI](https://openai.com/) for GPT API
- [Material-UI](https://mui.com/) for beautiful components
- Vietnamese English learning community for inspiration


