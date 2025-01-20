import json

def list_unique_licenses(file_path):
    """Extract and list unique licenses from the font data file."""
    try:
        with open(file_path, 'r') as f:
            fonts = json.load(f)

        # Extract unique licenses
        licenses = {font['license'] for font in fonts}

        # Sort and print the licenses
        for license in sorted(licenses):
            print(license)

        print(f"\nTotal unique licenses: {len(licenses)}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    list_unique_licenses('fontsource-fonts.json')
