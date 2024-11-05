# LangLearnGPT
An AI app that helps you learn new languages.

## Table of Contents
  - [Live Demo](#live-demo)
  - [Screenshots](#screenshots)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [How to use the application](#how-to-use-the-application)
  - [API Reference](#api-reference)
  - [Use Cases & Future Enhancements](#use-cases-and-future-enhancements)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [FAQ](#faq)

## Live Demo

[https://lang-learn-gpt.vercel.app/](https://lang-learn-gpt.vercel.app/)

## Features

- User Authentication and Profile Management
- AI-Generated Personalized Language Learning Plan
- Interactive Lesson Creation with Speech Exercises
- Audio Generation using OpenAI's Text-to-Speech API
- Speech Recognition and Transcription using OpenAI's Speech-to-Text API
- Multi-Language Support

## Technologies Used

- Next.js for Frontend and Backend
- Chakra UI for Responsive Design
- OpenAI GPT-4 Model for AI-Powered Features
- MongoDB for Database Management
- Jose for Authentication

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- MongoDB 
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/0xmetaschool/lang-learn-gpt
   cd lang-learn-gpt
   ```

2. Install dependencies:

   ```
   npm install
   ```

   This will install the following key dependencies:
   - next: React framework for production
   - react and react-dom: Core React libraries
   - @chakra-ui/react, @emotion/react, @emotion/styled, framer-motion: UI component library and its dependencies
   - @fontsource/source-sans-pro: Source Sans Pro font
   - axios: Promise-based HTTP client for making API requests
   - openai: OpenAI API client for Node.js
   - mongodb: MongoDB driver for Node.js
   - jose: Modern JavaScript implementation of JSON Web Tokens
   - bcryptjs: Library for hashing passwords
   - react-icons: Icon library for React

   Note: The exact versions of these dependencies will be determined by your package.json file.

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret  
     OPENAI_API_KEY=your_openai_api_key
     ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Screenshots

<div style="display: flex; justify-content: space-between;">
  <img src="screenshots/home.png" alt="Home Page" style="width: 49%; border: 2px solid black;" />
  <img src="screenshots/select_language.png" alt="Select Language Page" style="width: 49%; border: 2px solid black;" />
</div>
<div style="display: flex; justify-content: space-between;">
  <img src="screenshots/curriculum.png" alt="Curriculum Page" style="width: 49%; border: 2px solid black;" />
  <img src="screenshots/lesson.png" alt="Lesson Page" style="width: 49%; border: 2px solid black;" />
</div>

## How to use the application

1. Creating a personalized language learning plan:
   - Sign up or log in to your account
   - Enter your target language from the available options
   - Receive a customized learning plan generated by our AI

2. Practicing speaking through interactive exercises:
   - Navigate to the Lessons section
   - Choose a lesson from your curriculum generated by AI
   - Listen to the AI-generated audio prompts
   - Use the "Listen" button to listen to the correct pronunciation
   - Use the "Speak" button to record your response
   - Receive instant feedback on your pronunciation and grammar

Remember to practice regularly and make use of all available tools to maximize your language learning experience with LangLearnGPT.

## Use Cases & Future Enhancements

Here's what you can do with LangLearnGPT and what's coming next:

**Current Use Cases:**
- Practice pronunciation with instant AI feedback
- Learn new languages at your own pace with personalized lessons
- Prepare for international travel with essential phrases
- Track your progress with detailed performance metrics
- Practice speaking in a judgment-free environment

**Coming Soon:**
- Chat with AI language partners for real-time conversation practice
- Join virtual language exchange communities
- Earn points and badges as you learn
- Access offline mode for learning anywhere
- Get personalized study schedules and reminders
- Practice with dialect and accent variations
- Share progress with friends and compete on leaderboards

Want to contribute? Check out our contributing guidelines below!

## Contributing

We love contributions! Here's how you can help make the project even better:

- Fork the project (gh repo fork https://github.com/0xmetaschool/lang-learn-gpt)
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/0xmetaschool/lang-learn-gpt/blob/main/LICENSE) file for details.

## Acknowledgments

- OpenAI for the GPT-4 API
- Chakra UI team for their React component library

## FAQ

**Q: Do I need an OpenAI API key to use LangLearnGPT?**
A: Yes, you will need an OpenAI API key to enable AI-powered features like personalized lesson generation and speech feedback. You can sign up for an API key on the OpenAI website.

**Q: What languages does LangLearnGPT support?**
A: Currently, LangLearnGPT supports all the languages that OpenAI's GPT-4 model supports.

**Q: Is my data secure?**
A: Yes, we take data security and privacy very seriously. All user data is encrypted and stored securely, and we never share your personal information with third parties.

