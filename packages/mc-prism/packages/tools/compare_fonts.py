from utils_gen_font_img import process_and_save_letters
import os
import cv2
from skimage.metrics import structural_similarity as ssim




def compare_letters(src_images, target_images_path="./system_fonts", letters='nHg'):
    # Get the source font name (we only have one)
    src_font_name = list(src_images.keys())[0]
    print(src_font_name)

    # Get target images - only process directories
    target_images = {}
    for font_name in os.listdir(target_images_path):
        font_path = os.path.join(target_images_path, font_name)
        if not os.path.isdir(font_path):
            continue

        # Only process PNG files for each letter
        letter_images = {}
        for letter in letters:
            png_path = os.path.join(font_path, f"{letter}.png")
            if os.path.isfile(png_path):
                letter_images[letter] = cv2.imread(png_path)
            else:
                print(f"Warning: Missing {letter}.png for font {font_name}")

        if letter_images:  # Only add if we found any letter images
            target_images[font_name] = letter_images

    target_font_names = list(target_images.keys())
    total_scores = {f"src-{target_font}": [] for target_font in target_font_names}

    for letter in letters:
        print(f"\nComparing letter: {letter}")
        for target_font in target_font_names:
            src_img = src_images[src_font_name][letter]  # Access nested structure correctly
            target_img = target_images[target_font][letter]

            # Dynamically adjust win_size to avoid exceeding dimensions
            min_dim = min(src_img.shape[:2])
            win_size = min(7, min_dim // 2 * 2 + 1)

            # Compute SSIM
            score = ssim(src_img, target_img, channel_axis=2, win_size=win_size)
            print(f"Similarity between source and {target_font} for '{letter}': {score:.2f}")

            # Store score
            total_scores[f"src-{target_font}"].append(score)

    # Calculate and print total similarity scores
    print("\nTotal Similarity Scores:")
    best_score = -1
    fallback_font = None

    for font_pair, scores in total_scores.items():
        avg_score = sum(scores) / len(scores) if scores else 0
        print(f"{font_pair}: {avg_score:.2f}")

        # Track the highest scoring font
        if avg_score > best_score:
            best_score = avg_score
            # Extract font name from the 'src-fontname' format
            fallback_font = font_pair.split('-')[1]

    print("\nFallback Font:")
    print(f"{fallback_font} (similarity score: {best_score:.2f})")
    return fallback_font, best_score



def main():

    font_paths = {
        "Catamaran":"./test_fonts/Catamaran-Regular.ttf"
    }
    letters = "nHg"

    # Process and save the letters for all fonts
    processed_images = process_and_save_letters(font_paths, letters, save_path_prefix='./compare_fonts/')



    compare_letters(processed_images)
    # compare_letters()

if __name__ == "__main__":
    main()
