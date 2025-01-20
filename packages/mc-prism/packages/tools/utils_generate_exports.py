import json
from typing import List, Dict

def format_weight_type(weights: List[int]) -> str:
    weight_strs = [f"'{w}'" for w in weights]
    if len(weight_strs) == 1:
        return weight_strs[0]
    return f"{' | '.join(weight_strs)} | Array<{' | '.join(weight_strs)}>"

def format_style_type(styles: List[str]) -> str:
    if not styles:
        return ""
    style_strs = [f"'{s}'" for s in styles]
    if len(style_strs) == 1:
        return f"style?: {style_strs[0]} | Array<{style_strs[0]}>"
    return f"style?: {' | '.join(style_strs)} | Array<{' | '.join(style_strs)}>"

def format_subset_type(subsets: List[str]) -> str:
    subset_strs = [f"'{s}'" for s in subsets]
    return f"Array<{' | '.join(subset_strs)}>"

def generate_font_declarations():
    # Read the fonts data from JSON file
    with open('fontsource-fonts.json', 'r') as f:
        fonts = json.load(f)

    ts_content = [
        "/**",
        " * This file is auto-generated. Do not edit manually.",
        " */",
        "",
        "export type CssVariable = `--${string}`",
        "",
        "export type Display = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'",
        "",
        "export type FontMetadata = {",
        "  readonly id: string",
        "  readonly family: string",
        "  readonly category: string",
        "  readonly license: string",
        "  readonly type: 'google' | 'other'",
        "  readonly variable: boolean",
        "  readonly lastModified: string",
        "  readonly weights: number[]",
        "  readonly styles: string[]",
        "  readonly subsets: string[]",
        "  readonly defSubset: string",
        "}",
        "",
        "export type Font = {",
        "  className: string",
        "  style: {",
        "    fontFamily: string",
        "    fontWeight?: number",
        "    fontStyle?: string",
        "  }",
        "} & FontMetadata",
        "",
        "export type FontWithVariable = Font & {",
        "  variable: string",
        "}",
        "",
        "// Font Declarations",
        ""
    ]

    for font in fonts:
        # Convert font id to proper function name format
        function_name = font['id'].replace('-', '_').title().replace('_', '_')

        declaration = [
            f"export declare function {function_name}<",
            "  T extends CssVariable | undefined = undefined,",
            ">(options: {",
            f"  weight: {format_weight_type(font['weights'])}"
        ]

        if font['styles']:
            declaration.append(f"  {format_style_type(font['styles'])}")

        declaration.extend([
            "  display?: Display",
            "  variable?: T",
            "  preload?: boolean",
            "  fallback?: string[]",
            f"  subsets?: {format_subset_type(font['subsets'])}",
        ])

        if font['variable']:
            declaration.append(f"  axes?: string[]")

        declaration.extend([
            "}): T extends undefined ? Font : FontWithVariable & {",
            f"  readonly id: '{font['id']}'",
            f"  readonly family: '{font['family']}'",
            f"  readonly category: '{font['category']}'",
            f"  readonly license: '{font['license']}'",
            f"  readonly type: '{font['type']}'",
            f"  readonly variable: {str(font['variable']).lower()}",
            f"  readonly lastModified: '{font['lastModified']}'",
            f"  readonly weights: {json.dumps(font['weights'])}",
            f"  readonly styles: {json.dumps(font['styles'])}",
            f"  readonly subsets: {json.dumps(font['subsets'])}",
            f"  readonly defSubset: '{font['defSubset']}'",
            "}",
            ""
        ])

        ts_content.extend(declaration)

    # Write the TypeScript file
    output_path = '../fonts/src/declarations.ts'
    with open(output_path, 'w') as f:
        f.write('\n'.join(ts_content))

if __name__ == "__main__":
    generate_font_declarations()
