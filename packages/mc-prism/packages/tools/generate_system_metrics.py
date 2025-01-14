from font_metrics import FontAnalyzer
from rapidfuzz import process, fuzz, utils
import platform
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class SystemFontMetricsGenerator:
    SYSTEM_PATHS = {
        'darwin': ['/System/Library/Fonts/Supplemental']
    }

    # Define font paths
    with open('./system_fonts/system_fonts.json', 'r') as f:
        font_paths = json.load(f)
    f.close()

    TARGET_FONTS = list(font_paths.keys())

    def __init__(self):
        self.system = platform.system().lower()
        self.available_fonts = self._get_available_fonts()
        self.metrics_db = {}

    def _get_available_fonts(self) -> Dict[str, str]:
        """Get all available system fonts"""
        fonts = {}
        if self.system in self.SYSTEM_PATHS:
            for base_path in self.SYSTEM_PATHS[self.system]:
                base = Path(base_path)
                if base.exists():
                    for ext in ['ttf', 'otf', 'ttc']:
                        for font_path in base.glob(f'*.{ext}'):
                            fonts[font_path.stem] = str(font_path)
                            print(f"Found: {font_path.name}")
        return fonts

    def find_font_match(self, query: str, threshold: int = 90) -> Tuple[Optional[str], List[Tuple[str, float]]]:
        """Find matching fonts using fuzzy matching"""
        matches = process.extract(
            query,
            list(self.available_fonts.keys()),
            scorer=fuzz.WRatio,
            processor=utils.default_process,
            score_cutoff=threshold,
            limit=None
        )

        if not matches:
            return None, []

        formatted_matches = [(name, score) for name, score, _ in matches]
        formatted_matches.sort(key=lambda x: x[1], reverse=True)

        if formatted_matches[0][1] >= threshold:
            return self.available_fonts[formatted_matches[0][0]], []

        return None, formatted_matches

    def generate_metrics(self) -> Dict:
        """Generate metrics for matched system fonts"""
        for target_font in self.TARGET_FONTS:
            print(f"\nLooking for: {target_font}")
            match, similar = self.find_font_match(target_font)

            if match:
                try:
                    analyzer = FontAnalyzer(match)
                    metrics = analyzer.analyze_font()

                    self.metrics_db[target_font] = {
                        'path': match,
                        'metrics': metrics
                    }
                    print(f"Generated metrics for: {target_font} using {match}")

                except Exception as e:
                    print(f"Error processing {match}: {str(e)}")
            else:
                print(f"No match found for: {target_font}")
                if similar:
                    print("Similar fonts found:")
                    for name, score in similar[:3]:
                        print(f"- {name}: {score:.1f}%")

        return self.metrics_db

    def save_metrics(self, output_path: str = "system_font_metrics.json"):
        """Save metrics database to JSON file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.metrics_db, f, indent=2)
        print(f"\nMetrics saved to: {output_path}")

def main():
    generator = SystemFontMetricsGenerator()
    generator.generate_metrics()
    generator.save_metrics(output_path="./system_fonts/system_font_metrics.json")

if __name__ == "__main__":
    main()
