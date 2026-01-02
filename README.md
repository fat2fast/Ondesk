# OnDesk - Offline Developer Tools

OnDesk is a suite of developer tools designed to run 100% offline in your browser. No data ever leaves your device.

## Features

- **100% Offline**: All transformations and logic happen client-side.
- **Responsive Design**: Works on desktop and mobile, with a collapsible sidebar for more screen space.
- **Privacy First**: Secure by design, ensuring your sensitive data (JWTs, passwords, etc.) stays local.
- **Searchable**: Quickly find the tool you need with the built-in search.

## Available Tools

- **Email Signature**: Generate professional HTML email signatures.
- **JWT Debugger**: Decode and verify JWTs without sending them to a server.
- **Crontab Explainer**: Parse and explain cron expressions in plain English.
- **Nginx Beautifier**: Format and clean up Nginx configuration files.
- **JSON Editor**: Validate, format, and edit JSON data.
- **Text Diff**: Compare two text blocks to find differences.
- **Base64 Converter**: Encode and decode Base64 strings.
- **URL Encoder**: Encode and decode URLs.
- **Password Generator**: Create secure, random passwords.
- **Universal Converter**: Convert between various formats like JSON, XML, YAML, CSV, and ENV.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

## Docker Deployment

To deploy using Docker:

```bash
# Build the image
docker build -t ondesk-app .

# Run the container
docker run -p 80:80 ondesk-app
```
