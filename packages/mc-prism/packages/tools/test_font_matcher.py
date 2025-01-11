import pytest
from font_matcher import FontMatcher
import time

@pytest.fixture
def matcher():
    return FontMatcher()

def test_exact_match(matcher):
    """Test Priority 1: Exact 100% match"""
    match, similar = matcher.find_font_match("roboto")
    assert match == "roboto"
    assert not similar

def test_high_confidence_match(matcher):
    """Test Priority 2: >95% match"""
    match, similar = matcher.find_font_match("hanalei-fil")  # Should match hanalei-fill
    assert match is not None
    assert not similar  # High confidence matches don't return similar list

def test_warning_match(matcher):
    """Test Priority 3: 90-95% match with warning"""
    match, similar = matcher.find_font_match("source-code-p")  # Should match source-code-pro
    assert match is not None
    assert similar  # Should include the match in similar list for warning
    assert 90 <= similar[0][1] <= 95

def test_variants(matcher, capsys):
    """Test Priority 4: Multiple variants"""
    # Get matches with debug mode to see all results
    _, debug_matches = matcher.find_font_match("fusion-pixel-10px-monospaced", debug=True)
    with capsys.disabled():
        print("\nDebug Matches:")
        for name, score in debug_matches:
            print(f"- {name} (score: {score})")

    # Now test the actual matcher
    match, similar = matcher.find_font_match("fusion-pixel-10px-monospaced")
    with capsys.disabled():
        print("\nActual Results:")
        print(f"Match: {match}")
        print("Similar matches:")
        for s in similar:
            print(f"- {s[0]} (score: {s[1]})")

    assert match is None  # Should not return a single match
    assert len(similar) == 4  # Should return exactly 4 variants
    assert all(s[0].startswith("fusion-pixel-10px-monospaced") for s in similar)  # All should be variants
    assert all(s[1] >= 90 for s in similar)  # All should have high match scores

def test_multiple_matches(matcher):
    """Test Priority 5: Multiple >90% matches"""
    # First verify we have multiple matches
    _, debug_matches = matcher.find_font_match("sans", debug=True)
    matches = [m for m in debug_matches if m[1] >= 90]

    if len(matches) > 1:
        match, similar = matcher.find_font_match("sans")
        assert match is None  # No single match when multiple possibilities exist
        assert len(similar) > 1
        assert all(s[1] >= 90 for s in similar)
    else:
        pytest.skip("Not enough similar matches found for test")

def test_no_match(matcher):
    """Test Priority 6: No matches"""
    match, similar = matcher.find_font_match("xyzabc123")
    assert match is None
    assert not similar

def test_case_insensitive(matcher):
    """Test case insensitivity"""
    match1, _ = matcher.find_font_match("Roboto")
    match2, _ = matcher.find_font_match("roboto")
    assert match1 == match2

def test_space_handling(matcher):
    """Test space vs hyphen handling"""
    match1, _ = matcher.find_font_match("open sans")
    match2, _ = matcher.find_font_match("open-sans")
    assert match1 == match2

def test_performance():
    """Test performance with multiple searches"""
    matcher = FontMatcher()
    test_queries = [
        "roboto",
        "open sans",
        "noto serif jp",
        "nonexistent font",
        "arial",
        "times new roman",
        "helvetica",
        "source code pro",
        "ubuntu",
        "lato"
    ]

    start_time = time.perf_counter()
    iterations = 100

    for _ in range(iterations):
        for query in test_queries:
            matcher.find_font_match(query)

    end_time = time.perf_counter()
    total_time = end_time - start_time
    avg_time = (total_time * 1000) / (iterations * len(test_queries))

    print("\nPerformance Test Results:")
    print(f"Total time for {iterations * len(test_queries)} searches: {total_time:.2f}s")
    print(f"Average time per search: {avg_time:.2f}ms")

    assert avg_time < 10, f"Average search time ({avg_time:.2f}ms) exceeds 10ms threshold"

def test_debug_mode(matcher):
    """Test debug mode returns top 5 matches"""
    _, matches = matcher.find_font_match("robot", debug=True)
    assert len(matches) <= 5
    assert all(isinstance(m, tuple) and len(m) == 2 for m in matches)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
