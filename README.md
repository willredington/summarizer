Copy .env.example to .env and fill out the details
Create a new integration in notion https://www.notion.so/profile/integrations
Create a page in notion and share it with your new integration
Copy the page ID
Create a new api token for anthropic
Edit index.ts for your "profile"
npm install
npm link
export the envs to your shell if you want to run outside of node
summarize <name of your profile> <url>
