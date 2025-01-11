#!/usr/bin/env python3

import requests
import json
from typing import Dict

class FontSourceFetcher:
    BASE_URL = "https://api.fontsource.org"

    def get_font_list(self) -> Dict[str, str]:
        """
        Fetch the list of available fonts from Fontsource API
        Returns: Dictionary with font_id as key and source as value
        """
        response = requests.get(f"{self.BASE_URL}/fontlist")
        if response.status_code != 200:
            raise Exception(f"Failed to fetch font list: {response.status_code}")

        return json.loads(response.text)

# Only run this if the file is run directly
if __name__ == "__main__":
    fetcher = FontSourceFetcher()
    fonts = fetcher.get_font_list()
    print("API Response Structure:")
    print(type(fonts))
    print("\nFirst few entries:")
    for i, (key, value) in enumerate(fonts.items()):
        if i >= 3:
            break
        print(f"\nKey: {key}")
        print(f"Value: {value}")
