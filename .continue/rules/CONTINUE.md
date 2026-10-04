"# Project Overview

This project is a static HTML page hosted on GitHub Pages that uses cookies to store user data about bots, including their variants, paths, and rebirths. It helps users manage their bot collection by providing functionalities such as adding bots, predicting paths, and generating advice.

## Key Technologies Used

- **HTML**: The markup language used for structuring the content.
- **JavaScript**: The programming language used for handling dynamic behavior.

## High-level Architecture

- **`index.html`**: The main HTML file with the structure and layout.
- **`data.js`**: Contains JSON data for bot variants and paths.
- **`app.js`**: Handles the logic for adding bots, predicting paths, updating owned bots, and generating advice.


# Getting Started

## Prerequisites

- Node.js and npm (if needed for any specific tools or scripts)

## Installation Instructions

1. Clone the repository:
   ```shell
   git clone https://github.com/DavidGM91/fn-swdt-helper.git
   ```
2. No additional installation steps required for this static site.

## Basic Usage Examples

- Open `index.html` in a browser.

## Running Tests

This project does not currently have automated tests. Manual testing is required.


# Project Structure

## Overview of Main Directories and Their Purpose

- **`/`**: Root directory containing the main files (`index.html`, `data.js`, `app.js`).

## Key Files and Their Roles

- **`index.html`**: The main HTML file with the structure and layout.
- **`data.js`**: Contains JSON data for bot variants and paths.
- **`app.js`**: Handles the logic for adding bots, predicting paths, updating owned bots, and generating advice.

## Important Configuration Files

No specific configuration files in this static site.


# Development Workflow

## Coding Standards or Conventions

- Use meaningful variable and function names.
- Follow consistent indentation (e.g., 2 spaces).
- Add comments where necessary for clarity.

## Testing Approach

Manual testing is required as there are no automated tests.

## Build and Deployment Process

No build process required for this static site. Deploy to GitHub Pages using the following command:
```shell
git subtree push --prefix public origin gh-pages
```

## Contribution Guidelines

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make changes and commit them.
4. Push your branch to your fork.
5. Create a pull request.


# Key Concepts

## Domain-specific Terminology

- **Bot**: A collectible item in the game.
- **Variant**: Different levels of a bot (e.g., Base, Gold, Diamond).
- **Path**: A specific sequence of bots required for progression.
- **Rebirth**: The current stage or level of progress in the game.


# Common Tasks

## Step-by-step guides for frequent development tasks

### Add a new bot variant:

1. Open `data.js`.
2. Add a new variant to the `Variants` array.

### Update the path predictor logic:

1. Open `app.js`.
2. Modify the `predictPath` function.

## Examples of common operations

- Adding a new bot:
  1. Enter the bot name in the "Enter bot name" field.
  2. Select the variant from the dropdown.
  3. Click the "Add" button.


# Troubleshooting

## Common issues and their solutions

### Buttons not working

Ensure that `app.js` is correctly loaded after `data.js`. Check for any JavaScript errors in the console.

## Debugging tips

- Use `console.log` statements to debug JavaScript functions.
- Open the browser's developer tools (usually by pressing F12 or right-clicking on the page and selecting "Inspect") and check the console tab.


# References

## Links to relevant documentation

- [GitHub Pages Documentation](https://pages.github.com/)
- [JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Important resources

This `CONTINUE.md` file for project-specific guidelines.