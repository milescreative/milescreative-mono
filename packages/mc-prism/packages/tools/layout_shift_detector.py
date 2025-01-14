from typing import Dict, Tuple
from PIL import Image, ImageDraw, ImageFont
from PIL.ImageDraw import ImageDraw as ImageDrawType
from PIL.ImageFont import FreeTypeFont

class LayoutShiftDetector:
    def __init__(self, font_path: str, fallback_font_path: str):
        """Initialize with primary and fallback fonts"""
        self.primary_font = ImageFont.truetype(font_path)
        self.fallback_font = ImageFont.truetype(fallback_font_path)

    def _get_text_size(self, draw: ImageDrawType, text: str, font: FreeTypeFont) -> Tuple[float, float]:
        """Get text dimensions using textbbox"""
        bbox = draw.textbbox((0, 0), text, font=font)
        return (bbox[2] - bbox[0], bbox[3] - bbox[1])  # width, height as floats

    def measure_text_difference(self, text: str, font_size: int = 16) -> Dict[str, float]:
        """Measure differences between primary and fallback fonts"""
        # Create images for both fonts
        img1 = Image.new('RGB', (500, 100), color='white')
        img2 = Image.new('RGB', (500, 100), color='white')

        # Draw text with both fonts
        draw1 = ImageDraw.Draw(img1)
        draw2 = ImageDraw.Draw(img2)

        # Get text sizes
        size1_w, size1_h = self._get_text_size(draw1, text, self.primary_font)
        size2_w, size2_h = self._get_text_size(draw2, text, self.fallback_font)

        return {
            'width_difference': abs(size1_w - size2_w),
            'height_difference': abs(size1_h - size2_h),
            'area_difference': abs(size1_w * size1_h - size2_w * size2_h)
        }

    def analyze_layout_shift(self, sample_text: str) -> Dict[str, float]:
        """Analyze potential layout shift with metrics"""
        metrics = self.measure_text_difference(sample_text)

        # Calculate layout shift score (lower is better)
        width_impact = metrics['width_difference'] / 500  # Normalize to viewport
        height_impact = metrics['height_difference'] / 100

        return {
            'layout_shift_score': (width_impact + height_impact) / 2,
            'width_impact': width_impact,
            'height_impact': height_impact
        }
