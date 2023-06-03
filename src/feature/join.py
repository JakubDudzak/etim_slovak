import json
def spojit_subory(prvy_subor_meno, druhy_subor_meno, vystupny_subor_meno):
    with open(prvy_subor_meno, 'r', encoding='utf-8') as subor1, open(druhy_subor_meno, 'r', encoding='utf-8') as subor2, open(vystupny_subor_meno, 'w', encoding='utf-8') as vystupny_subor:
        for riadok1, riadok2 in zip(subor1, subor2):
            vystupny_subor.write(riadok1.strip() + '___' + riadok2)


# Načítať konfiguračný súbor
with open('config.json', 'r') as f:
    config = json.load(f)


# Príklad použitia
prvy_subor = config['originalFile']
druhy_subor = config['translatedFile']
vystupny_subor = config['inputFile']
spojit_subory(prvy_subor, druhy_subor, vystupny_subor)