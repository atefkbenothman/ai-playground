
# AI-Powered GitHub PR Automation Tool

An AI-driven tool that automates the creation of GitHub pull requests based on user input and repository context.

## Features

- Automatically generates pull request titles and descriptions
- Creates new branches for proposed changes
- Updates files in the repository based on AI-generated content
- Adds detailed reasoning as PR comments
- Maintains production-ready code standards

## Requirements

- Node.js environment
- GitHub personal access token
- AI model integration
- TypeScript setup

## Usage

1. Configure your environment variables in `.env`
2. Run the tool using `npm start`
3. Provide:
   - System message (optional)
   - User message describing changes
   - Branch name for the pull request

## Configuration

Update `.env` with:
```env
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_TOKEN=your-personal-access-token
```

## How It Works

1. Loads repository contents
2. Takes user input for system and user messages
3. Generates AI response with reasoning
4. Creates new branch
5. Updates files based on AI output
6. Creates pull request with detailed information
7. Adds AI reasoning as PR comment
      