from rapidfuzz import process, fuzz, utils

strs = ["Brush Script"]
str2 = "Brush Script MT"



extract_one = process.extractOne(str2,strs, scorer=fuzz.WRatio, processor=utils.default_process)

print(extract_one)
