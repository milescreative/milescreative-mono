import json
from fontTools.ttLib import TTFont
from pathlib import Path


class FontAnalyzer:
    def __init__(self, font_path):
        self.font_path = Path(font_path)
        self.font = TTFont(self.font_path)
        self.units_per_em = self.font['head'].unitsPerEm

    def get_general_metrics(self):
        hhea_table = self.font['hhea']
        os2_table = self.font['OS/2']

        return {
            "units_per_em": self.units_per_em,
            "ascent": hhea_table.ascent / self.units_per_em,
            "descent": hhea_table.descent / self.units_per_em,
            "line_gap": hhea_table.lineGap / self.units_per_em,
            "cap_height": os2_table.sCapHeight / self.units_per_em if hasattr(os2_table, 'sCapHeight') and os2_table.sCapHeight != 0 else None,
            "x_height": os2_table.sxHeight / self.units_per_em if hasattr(os2_table, 'sxHeight') and os2_table.sxHeight != 0 else None,
            "default_width": os2_table.xAvgCharWidth / self.units_per_em,
            "italic_angle": self.font['post'].italicAngle,
            "bounding_box": (self.font['head'].xMin, self.font['head'].yMin, self.font['head'].xMax, self.font['head'].yMax),
        }

    def get_advance_widths(self):
        hmtx_table = self.font['hmtx']
        advance_widths = {
            char: hmtx_table.metrics.get(char, (0,))[0] / self.units_per_em
            for char in map(chr, range(65, 91))  # Uppercase A-Z
        }
        advance_widths.update({
            char: hmtx_table.metrics.get(char, (0,))[0] / self.units_per_em
            for char in map(chr, range(97, 123))  # Lowercase a-z
        })
        return advance_widths

    def analyze_visual_characteristics(self):
        font_family = self.font['name'].getName(1, 3, 1, 1033)
        if font_family:
            font_family = font_family.toStr()

        post_table = self.font['post']

        serif_keywords = ['serif', 'roman', 'antiqua']
        likely_serif = any(keyword in font_family.lower() for keyword in serif_keywords) if font_family else None

        return {
            "classification": {
                "likely_serif": likely_serif,
                "is_italic": post_table.italicAngle != 0,
                "is_monospaced": all(width == list(self.font['hmtx'].metrics.values())[0][0]
                                   for width, _ in list(self.font['hmtx'].metrics.values())),
            },
            "style_metrics": {
                "italic_angle": post_table.italicAngle,
                "weight_class": self.font['OS/2'].usWeightClass if 'OS/2' in self.font else None,
                "width_class": self.font['OS/2'].usWidthClass if 'OS/2' in self.font else None,
            }
        }

    def analyze_font(self, save_to_file=False, output_path=None):
        font_data = {
            "general_metrics": self.get_general_metrics(),
            "advance_widths": self.get_advance_widths(),
            "visual_characteristics": self.analyze_visual_characteristics()
        }

        if save_to_file:
            output_path = output_path or (Path(__file__).parent / 'font_metrics.json')
            with open(output_path, "w") as json_file:
                json.dump(font_data, json_file, indent=4)
            print(f"Font metrics have been saved to {output_path}")

        return font_data

def analyze_font_file(font_path, save_to_file=False, output_path=None):
    """Helper function to quickly analyze a font file"""
    analyzer = FontAnalyzer(font_path)
    return analyzer.analyze_font(save_to_file, output_path)

if __name__ == "__main__":
    # Example usage when run as a script
    current_dir = Path(__file__).parent
    font_path = current_dir / 'test_fonts' / 'OPenSans-Regular.woff2'
    analyze_font_file(font_path, save_to_file=True)
