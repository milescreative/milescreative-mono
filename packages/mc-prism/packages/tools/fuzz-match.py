from rapidfuzz import process, fuzz, utils
from fontsource_fetcher import FontSourceFetcher

strs = ["open sans"]
str2 = "open-sans"



extract_one = process.extractOne(str2,strs, scorer=fuzz.QRatio, processor=utils.default_process)

print(extract_one)
