with open("adjectives.txt") as f:
    adj = f.read().splitlines()
    for a in adj:
        if not a.isalpha():
            continue
        # if " " in animal:
        #     continue
        print(a.lower())
# with open("animals.txt") as f:
#     animals = f.read().splitlines()
#     for animal in animals:
#         if " " in animal:
#             continue
#         print(animal.lower())
