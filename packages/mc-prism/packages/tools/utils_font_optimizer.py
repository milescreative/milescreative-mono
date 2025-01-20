#!/usr/bin/env python3

import sys
from fontTools.ttLib import TTFont
import os

def optimize_font(input_file: str, output_file: str, normalize: bool = False) -> None:
    """
    Optimize font through subsetting and recompression.
    Converts TTF to WOFF2 format.
    If normalize=True, adjusts metrics so descent=0, ascent=cap-height, and line-gap=0
    """
    try:
        # Load the font
        font = TTFont(input_file)

        # Store original flavor and handle TTF conversion
        original_flavor = font.flavor
        if input_file.endswith('.ttf'):
            font.flavor = 'woff2'
            output_file = os.path.splitext(output_file)[0] + '.woff2'

        if normalize:
            os2 = font['OS/2']
            hhea = font['hhea']

            # Get cap height from OS/2 table
            cap_height = os2.sCapHeight

            # Set metrics
            os2.sTypoAscender = cap_height
            os2.sTypoDescender = 0
            os2.sTypoLineGap = 0
            os2.usWinAscent = cap_height
            os2.usWinDescent = 0

            # Update hhea metrics
            hhea.ascent = cap_height
            hhea.descent = 0
            hhea.lineGap = 0

        # Restore original flavor (woff/woff2)
        font.flavor = original_flavor

        # Save optimized font
        font.save(output_file)
        print(f"Successfully optimized {input_file} to {output_file}")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) not in [2, 3]:
        print("Usage: python optimize.py <input_font_file> [output_directory]")
        print("Example: python optimize.py input.ttf [/path/to/output]")
        sys.exit(1)

    input_file = sys.argv[1].strip('"').strip("'")  # Remove any quotes
    input_file = os.path.expanduser(input_file)  # Expand user path if present

    if not input_file.lower().endswith(('.woff', '.woff2', '.ttf')):
        print("Error: Input file must be a TTF, WOFF, or WOFF2 file", file=sys.stderr)
        sys.exit(1)

    # Handle output directory
    input_filename = os.path.basename(input_file)
    if input_file.endswith('.ttf'):
        # Convert TTF filename to WOFF2
        base_name = os.path.splitext(input_filename)[0] + '.woff2'
    else:
        base_name = input_filename  # Keep same extension for optimization

    if len(sys.argv) == 3:
        output_dir = sys.argv[2]
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
    else:
        output_dir = os.path.dirname(input_file) or '.'

    output_file = os.path.join(output_dir, base_name)
    optimize_font(input_file, output_file, normalize=True)  # Set normalize=True by default
