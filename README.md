# AI Chatbot Frontend

This is a React-based frontend application for an AI-powered chatbot. The application allows users to interact with a chatbot, manage chat sessions, and switch between different AI models. It also includes features like session export, dark mode, and user authentication via Auth0.

## Features

- **Chatbot Interaction**: Communicate with an AI chatbot in real-time.
- **Session Management**: Save, rename, delete, and export chat sessions.
- **Dark Mode**: Toggle between light and dark themes.
- **Model Selection**: Choose between different AI models (e.g., GPT-3.5, GPT-4).
- **Authentication**: Secure login and logout using Auth0.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Project Structure

```
.
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── Chatbot.css
│   ├── Chatbot.js
│   ├── ChatbotWidget.js
│   ├── index.css
│   ├── index.js
│   ├── PayPalButton.js
│   ├── reportWebVitals.js
│   └── setupTests.js
├── .gitignore
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── variables.env
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd ai-chatbot-frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `variables.env` file in the root directory and add the following environment variables:
   ```env
   REACT_APP_PAYPAL_PLAN_ID=your-plan-id
   ```

### Running the Application

1. Start the development server:
   ```sh
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create a production build:
```sh
npm run build
```

The build will be available in the `build/` directory.

### Running Tests

Run the test suite:
```sh
npm test
```

## Configuration

### Auth0 Integration

Update the `domain` and `clientId` in `src/index.js` with your Auth0 credentials:
```javascript
<Auth0Provider
  domain={process.env.REACT_APP_AUTH0_DOMAIN}
  clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
```

### PayPal Integration

Ensure the `variables.env` file contains your PayPal subscription plan ID:
```env
REACT_APP_PAYPAL_PLAN_ID=your-plan-id
```

The `PayPalButton.js` file already references this environment variable:
```javascript
plan_id: process.env.REACT_APP_PAYPAL_PLAN_ID
```

### API Proxy

The application proxies API requests to `http://localhost:8080`. Update the `proxy` field in `package.json` if your backend runs on a different URL.

## Styling

This project uses **Tailwind CSS** for styling. You can customize the theme in `tailwind.config.js`.

## Deployment

To deploy the application, upload the contents of the `build/` directory to your hosting provider.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Auth0](https://auth0.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Create React App](https://create-react-app.dev/)
