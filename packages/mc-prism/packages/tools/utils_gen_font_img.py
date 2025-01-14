from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import os

def generate_letter_image(font_path, letter, size=(300, 300), save_path=None):
    """Generate an image of a single letter in a given font."""
    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Font file not found: {font_path}")

    img = Image.new('RGB', size, color='white')
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, size=200)
    text_width, text_height = draw.textbbox((0, 0), letter, font=font)[2:]  # Get bounding box size
    draw.text(
        ((size[0] - text_width) // 2, (size[1] - text_height) // 2),
        letter,
        fill='black',
        font=font,
    )
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)  # Ensure directory exists
        img.save(save_path)
    return np.array(img)

def crop_to_letter(image):
    """Crop the image to the bounding box of the letter."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        x, y, w, h = cv2.boundingRect(contours[0])  # Get bounding box
        cropped = image[y:y+h, x:x+w]  # Crop to bounding box
        return cropped

    return image  # Return original image if no contours found

def resize_to_height(image, target_height=200):
    """Resize the cropped letter image to have the same target height."""
    h, w = image.shape[:2]
    aspect_ratio = w / h
    new_width = int(target_height * aspect_ratio)
    resized = cv2.resize(image, (new_width, target_height))
    return resized

def pad_to_max_width(images, target_height=200, target_width=300):
    """Pad all images to have the same width based on the maximum width in the set."""
    max_width = max(img.shape[1] for img in images)
    padded_images = []

    use_width = target_width
    if target_width == 0:
      use_width = max_width

    for img in images:
        h, w = img.shape[:2]
        padded = np.full((target_height, use_width, 3), 255, dtype=np.uint8)  # White background
        pad_x = (use_width - w) // 2
        padded[:, pad_x:pad_x+w] = img
        padded_images.append(padded)

    return padded_images

def process_and_save_letters(font_paths, letters, target_height=200,target_width=300, save_path_prefix='./letters'):
    """Process a list of letters for multiple fonts, crop them, resize to the same height, pad to fixed dimensions, and save."""
    processed_images = {}

    for font_name, font_path in font_paths.items():
        processed_images[font_name] = {}
        for letter in letters:
            # Generate the letter image
            img = generate_letter_image(font_path, letter)

            # Crop the image to the letter
            cropped_img = crop_to_letter(cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

            # Resize the cropped image to the target height
            resized_img = resize_to_height(cropped_img, target_height)

            # Store the image for padding
            processed_images[font_name][letter] = resized_img

    # Pad all images of each letter to the same width
    for letter in letters:
        letter_images = [processed_images[font_name][letter] for font_name in font_paths]
        padded_images = pad_to_max_width(letter_images, target_height, target_width)
        for idx, font_name in enumerate(font_paths):
            processed_images[font_name][letter] = padded_images[idx]

    # Save the processed images
    for font_name, font_images in processed_images.items():
        for letter, img in font_images.items():
            save_dir = f"{save_path_prefix}/{font_name}"
            os.makedirs(save_dir, exist_ok=True)
            save_path = f"{save_dir}/{letter}.png"
            cv2.imwrite(save_path, img)
            print(f"Processed and saved: {save_path}")

    return processed_images
