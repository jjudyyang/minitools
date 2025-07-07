# minitools
Some scripts that made my workflow a lot easier to minimize time spent on testing.

## SOIDcapturetool.user.js
Script that creates keyboard shortcut to capture GraphQL UUID of smart order without having to inspect, filter and click :p

**Used with TamperMonkey Chrome extension:**
https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=item-share-cb

**Note:** Need to add sites that the script can run on in the very top (ie. `// @match https://mrgreens.pepr.app/*`)

**Keyboard shortcut once installed:** `COMMAND + SHIFT + i`

## sendemails.py
Script to send inbounds via folder pathname instead of having to do it manually.

### Setup:
1. Make sure python3 / python is correctly installed
2. Update email in script to your own email
3. Configure app password for Gmail SMTP authentication
4. Recommended: install and use script with cursor to use natural language to send commands (commands also broken down below)
5. Store all inbounds that you want to send in 1 folder

Feel free to tweak the script!

**Note:** Script uses the file name and pre-appends "For ___" in the email subject (this helps with restaurant matching accuracy)

## How to Run the Script

### Basic Commands
```bash
# Interactive mode (default)
python script_name.py

# Custom folder
python script_name.py --folder /path/to/your/folder

# Custom recipient
python script_name.py --recipient someone@example.com

# Skip confirmation
python script_name.py --no-confirm

# Full custom
python script_name.py --folder /path/to/files --recipient user@domain.com --no-confirm
```

### Features
- **Interactive Mode**: Browse folders, preview files, confirm before sending
- **Supported Files**: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.txt`, `.csv`, `.xlsx`, `.eml`
