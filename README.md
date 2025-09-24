# Welcome to !

## PR Description Template

## Please don't edit this! Copy-paste the template into the PR Description

Title: [Sprint# and Letter, task description]

Names:

Date:

How long did this ticket take you?

Description:

Testing: [Include pictures of known bugs, before & afters, etc.]

Takeaways:

## Git Do's and Don'ts

\*DON'T

- mess with the "main" branch - make sure you always code under a new branch!
- handle merge conflicts without Vanessa being present
- panic! it's okay to make git mistakes (most can be fixed!) just reach out to Vanessa for help

\*Do

- git cheat sheet: https://education.github.com/git-cheat-sheet-education.pdf
- make git commits locally often! this will help if you have any issues and need to access old code

- creating a NEW branch:
  git checkout main
  git pull
  git checkout -b "[new branch name]"
  npm install

- if you have just begun a coding session after a few days or your branch is behind main:
  git checkout main
  git pull  
  git checkout "[current branch name]"
  git merge main
  npm install
- to only add a single file to the stage:
  git add [file name]
- to add all edited files to the stage:
  git add .

- if you have added files to the stage and would like to commit them to the stage:
  git commit -m "[your message]"
- if you have made commits to your local branch and would like to push to github:
  git push

## IMPORTANT: Code Conventions

- Please please please comment your code!
  - Functions should have a description of what it does
  - large loops or code with a lot of logic should have a description as well
- Use camelCase instead of underscores for variable names or filenames
- Branch Names (except for sprint 0):
  sprint[#][letter]/[frontend/backend/fullstack]/[task summary]
  - please ask questions if you need help
- To apply prettier to your code, run the command: npx prettier . --write

## Getting Started

- To run the developer server on http://localhost:3000
  npm run dev

  # or

  yarn dev

  # or

  pnpm dev

  # or

  bun dev

- To run the backend:
  npm run backend
  # or
  yarn backend
  # or
  pnpm backend
  # or
  bun backend
