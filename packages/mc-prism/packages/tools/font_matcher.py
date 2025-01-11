from rapidfuzz import process, fuzz, utils
from fontsource_fetcher import FontSourceFetcher
from typing import List, Tuple, Optional


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

    def find_font_match(self, query: str, threshold: int = 90, debug: bool = False) -> Tuple[Optional[str], List[Tuple[str, float]]]:
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

def main():
    matcher = FontMatcher()

    while True:
        query = input("\nEnter font name to search (or 'q' to quit): ").strip()
        if query.lower() == 'q':
            break

        # Show debug results first
        _, debug_matches = matcher.find_font_match(query, debug=True)
        print("\nTop 5 closest matches:")
        for font, score in debug_matches:
            print(f"- {font} (score: {score:.1f})")

        print("\nBest match based on priority:")
        best_match, similar_matches = matcher.find_font_match(query)

        if best_match:
            if similar_matches:  # This means it's a 90-95% match
                print(f"Found close match (warning: {similar_matches[0][1]:.1f}% confidence): {best_match}")
            else:
                print(f"Found match: {best_match}")
        elif similar_matches:
            # Check if all matches are variants (start with the search term)
            are_variants = all(m[0].lower().startswith(query.lower().replace(' ', '-')) for m in similar_matches)

            if are_variants:
                print(f"Found {len(similar_matches)} variants of '{query}':")
                for i, (font, score) in enumerate(similar_matches, 1):
                    variant_name = font.replace(f"{query}-", "")  # Show only the variant part
                    print(f"{i}. {variant_name} (match score: {score:.1f})")

                if len(similar_matches) > 1:
                    try:
                        choice = input("\nSelect variant number (or press Enter to skip): ").strip()
                        if choice and choice.isdigit():
                            idx = int(choice) - 1
                            if 0 <= idx < len(similar_matches):
                                print(f"\nSelected: {similar_matches[idx][0]}")
                    except ValueError:
                        print("Invalid selection")
            else:
                print("Multiple possible matches found:")
                for i, (font, score) in enumerate(similar_matches, 1):
                    print(f"{i}. {font} (match score: {score:.1f})")
        else:
            print("No matching fonts found")

if __name__ == "__main__":
    main()
