from utils_gen_font_img import process_and_save_letters
import json



def main():
    # Define font paths
    with open('./system_fonts/system_fonts.json', 'r') as f:
    # Load the JSON data into a Python dictionary
      font_paths = json.load(f)
    f.close()


    letters = "nHg"

    # Process and save the letters for all fonts
    processed_images = process_and_save_letters(font_paths, letters, save_path_prefix="./system_fonts")

    # Compare the processed letters across fonts
    # compare_letters(processed_images, letters)

if __name__ == "__main__":
    main()
