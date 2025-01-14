from typing import List, Optional
from dataclasses import dataclass

@dataclass
class FontLoadingStrategy:
    font_family: str
    fallback_fonts: List[str]
    display: str = 'swap'
    preload: bool = True

class CSSGenerator:
    def generate_font_face(self,
                          font_family: str,
                          woff2_path: str,
                          woff_path: Optional[str] = None,
                          display: str = 'swap') -> str:
        """Generate @font-face declaration"""
        css = [
            '@font-face {',
            f'  font-family: "{font_family}";',
            '  font-display: ' + display + ';',
            '  src: '
        ]

        sources = []
        if woff2_path:
            sources.append(f'url("{woff2_path}") format("woff2")')
        if woff_path:
            sources.append(f'url("{woff_path}") format("woff")')

        css.append('    ' + ',\n    '.join(sources) + ';')
        css.append('}')

        return '\n'.join(css)

    def generate_font_loading_html(self, strategy: FontLoadingStrategy) -> str:
        """Generate HTML preload tags and font-family CSS"""
        html = []

        if strategy.preload:
            html.append(f'<link rel="preload" href="{strategy.font_family}.woff2" as="font" type="font/woff2" crossorigin>')

        css = [
            '<style>',
            '.font-loaded {',
            f'  font-family: "{strategy.font_family}", {", ".join(strategy.fallback_fonts)};',
            '}',
            '</style>'
        ]

        html.extend(css)
        return '\n'.join(html)
