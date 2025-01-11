#!/usr/bin/env python3

import sys
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont
import os

def optimize_font(input_file: str, output_file: str) -> None:
    """Optimize WOFF/WOFF2 font through subsetting and recompression."""
    try:
        # Load the font
        font = TTFont(input_file)
        original_flavor = font.flavor

        # Subsetting options
        options = Options()
        # Suppress the warning with type: ignore
        options.layout_features = [  # type: ignore
            'tnum', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08', 'ss09',
            'ss10', 'ss11', 'ss12', 'ss13', 'ss14', 'ss15'
        ]
        # Suppress the warning with type: ignore
        options.unicodes = (  # type: ignore
            list(range(0x0020, 0x007F + 1)) +  # Basic Latin
            list(range(0x0080, 0x00FF + 1)) +  # Latin-1 Supplement
            [0x201E, 0x201C, 0x20AC, 0x201E, 0x201C, 0x201D, 0x2013, 0x2014, 0x2212, 0x2002, 0x2003]  # Special characters
        )

        # Subset the font
        subsetter = Subsetter(options=options)
        subsetter.populate(unicodes=getattr(options, 'unicodes', []))  # Use getattr to avoid type warning
        subsetter.subset(font)

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
        print("Usage: python optimize.py <input_woff_file> [output_directory]")
        print("Example: python optimize.py input.woff2 [/path/to/output]")
        sys.exit(1)

    input_file = sys.argv[1]

    if not input_file.endswith(('.woff', '.woff2')):
        print("Error: Input file must be a WOFF or WOFF2 file", file=sys.stderr)
        sys.exit(1)

    # Handle output directory
    input_filename = os.path.basename(input_file)
    base_name = input_filename  # Keep same extension for optimization

    if len(sys.argv) == 3:
        output_dir = sys.argv[2]
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
    else:
        output_dir = os.path.dirname(input_file) or '.'

    output_file = os.path.join(output_dir, base_name)
    optimize_font(input_file, output_file)
