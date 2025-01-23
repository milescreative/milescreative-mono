from rapidfuzz import process, fuzz, utils
from fontsource_fetcher import FontSourceFetcher
from typing import List, Tuple, Optional
import sys
import json


class FontMatcher:
    def __init__(self):
        self.fetcher = FontSourceFetcher()
        self.fonts = self.fetcher.get_font_list()
        self.font_names = [name.replace('-', ' ') for name in self.fonts.keys()]

    def _get_font_variants(self, query: str, matches: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """Get variants that perfectly match the start of the query"""
        query = query.lower().replace('-', ' ')
        variants = []
        highest_score = max(m[1] for m in matches) if matches else 0

        # Only consider matches with the highest score
        for match in matches:
            if match[1] == highest_score and match[0].lower().replace('-', ' ').startswith(query):
                variants.append(match)

        return variants if len(variants) > 1 else []

    def find_font_match(self, query: str, threshold: int = 89, debug: bool = False) -> Tuple[Optional[str], List[Tuple[str, float]]]:
        """
        Find matching fonts based on priority:
        1. Single 100% match -> return match
        2. Single >95% match -> return match
        3. Single >90% <95% match -> return with warning
        4. Multiple variants with same high score -> return variants
        5. Multiple >90% matches -> return options
        6. No matches -> return None
        """
        query = query.strip('"\'').strip()

        matches = process.extract(
            query,
            self.font_names,
            scorer=fuzz.WRatio,
            processor=utils.default_process,
            score_cutoff=threshold,
            limit=None
        )

        if not matches:
            return None, []

        formatted_matches = [(name.replace(' ', '-'), score) for name, score, _ in matches]

        if debug:
            return None, formatted_matches[:5]

        # Check for variants first (all matches with same high score that start with query)
        variants = self._get_font_variants(query, formatted_matches)
        if variants:
            return None, variants

        formatted_matches.sort(key=lambda x: x[1], reverse=True)

        # Priority 1: Single 100% match
        if formatted_matches[0][1] == 100:
            return formatted_matches[0][0], []

        # Priority 2: Single >95% match
        if formatted_matches[0][1] > 95:
            return formatted_matches[0][0], []

        # Priority 3: Single >90% <95% match
        if 90 <= formatted_matches[0][1] <= 95:
            return formatted_matches[0][0], [formatted_matches[0]]

        # Priority 5: Multiple >90% matches
        if formatted_matches:
            return None, formatted_matches

        # Priority 6: No matches
        return None, []

def find_font_candidates(query: str, threshold: int = 89) -> List[Tuple[str, float]]:
    matcher = FontMatcher()

    # Get all matches with a score greater than 90%
    _, debug_matches = matcher.find_font_match(query, threshold=threshold, debug=True)

    candidates = [(font, score) for font, score in debug_matches if score > threshold]

    return candidates

def main():
    if len(sys.argv) < 2:
        print("Usage: python font_matcher.py <font-name>")
        return

    query = sys.argv[1]
    candidates = find_font_candidates(query)

    # Output the candidates as JSON
    result = [{"id": font, "confidence": score} for font, score in candidates]
    print(json.dumps(result))

if __name__ == "__main__":
    main()
