# MC-Prism Python Tools

Python utilities and tools for the MC-Prism package.

## Usage

From the root of the monorepo, use:

```bash
pnpm pip install [package]
```

This will automatically:

1. Create the virtual environment if it doesn't exist
2. Activate the virtual environment
3. Run pip with your arguments

For example:

```bash
# Install a new package
pnpm pip install requests

# Install all requirements
pnpm pip install -r requirements.txt

# Upgrade a package
pnpm pip install --upgrade requests
```

## Project Structure

```
tools/
├── .venv/                 # Virtual environment
├── src/                   # Source code
│   └── mc_prism/         # Main package
├── requirements.txt       # Project dependencies
├── setup.py              # Package setup
└── README.md             # This file
```
