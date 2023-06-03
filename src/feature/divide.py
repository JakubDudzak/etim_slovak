import json

def rozdelit_subor(original, translated):
    with open(original, 'r') as subor:
        riadky = subor.readlines()

    pocet_riadkov = len(riadky)
    pocet_blokov = pocet_riadkov // 100

    vystup = ""
    for i in range(pocet_blokov):
        zaciatok = i * 100
        koniec = (i + 1) * 100
        blok = riadky[zaciatok:koniec]

        vystup += "\n" * 20
        vystup += "".join(blok)

    # Spracovanie zvyšku riadkov
    zvysok = riadky[pocet_blokov * 100:]
    if zvysok:
        vystup += "\n" * 20
        vystup += "".join(zvysok)

    with open(translated, 'w') as vystupny_subor:
        vystupny_subor.write(vystup)


# Načítať konfiguračný súbor
with open('config.json', 'r') as f:
    config = json.load(f)

# Príklad použitia
rozdelit_subor(config['originalFile'], config['translatedFile'])
