import pytest
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from font_metrics import FontMetricsAnalyzer

@pytest.fixture
def test_fonts():
    # Get the absolute path to the test fonts
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_fonts_dir = os.path.join(base_dir, 'test_fonts')

    print(f"\nLooking for fonts in: {test_fonts_dir}")

    if not os.path.exists(test_fonts_dir):
        os.makedirs(test_fonts_dir)
        print(f"Created test fonts directory: {test_fonts_dir}")

    primary_font = os.path.join(test_fonts_dir, 'Roboto-Regular.woff2')
    system_fonts = [
        os.path.join(test_fonts_dir, 'OpenSans-Regular.woff2'),
        os.path.join(test_fonts_dir, 'Lato-Regular.woff2'),
        os.path.join(test_fonts_dir, 'SourceSansPro-Regular.woff2')
    ]

    print("\nAvailable test fonts:")
    for font in [primary_font] + system_fonts:
        exists = os.path.exists(font)
        print(f"- {font}: {'✓' if exists else '✗'}")

    return {
        'primary': primary_font,
        'system': system_fonts
    }

def test_basic_metrics(test_fonts):
    print("\nTesting basic metrics...")
    analyzer = FontMetricsAnalyzer(test_fonts['primary'])
    metrics = analyzer.get_basic_metrics()

    print(f"Metrics: {metrics}")

    assert 'ascender' in metrics
    assert 'descender' in metrics
    assert 'line_gap' in metrics
    assert 'units_per_em' in metrics

    assert all(isinstance(v, float) for v in metrics.values())

def test_fallback_score(test_fonts):
    print("\nTesting fallback score...")
    analyzer = FontMetricsAnalyzer(test_fonts['primary'])
    score = analyzer.calculate_fallback_score(test_fonts['system'][0])

    print(f"Fallback score: {score}")

    assert 0 <= score <= 100

def test_find_best_fallbacks(test_fonts):
    print("\nTesting best fallbacks...")
    analyzer = FontMetricsAnalyzer(test_fonts['primary'])
    matches = analyzer.find_best_system_fallbacks(test_fonts['system'])

    print(f"Best matches: {matches}")

    assert isinstance(matches, list)
    assert all(isinstance(m, tuple) and len(m) == 2 for m in matches)
    assert all(isinstance(m[1], float) and 0 <= m[1] <= 100 for m in matches)

if __name__ == '__main__':
    # This will run when you execute the file directly
    pytest.main([__file__, '-v', '-s'])
