from bs4 import BeautifulSoup
import json

with open("Archnemesis - PoEDB, Path of Exile Wiki.html", "r", encoding="utf8") as f:
	doc = BeautifulSoup(f, "html.parser")

table = doc.find(id="ArchnemesisArchnemesisMods")
tablebody = table.find("tbody")
trs = tablebody.find_all("tr")
modDict = {}


for row in trs:
	# modName = row.find_all("a")
	rowTDs = row.find_all("td")
	col1 = rowTDs[0]

	keyName = str(col1.find("img"))
	keyName = keyName[keyName.find("/Mod") + 1: keyName.find(".png")]
	# print(keyName)
	modName = col1.find_all("a")[1].string

	explicitMod = row.find(class_="explicitMod").string

	rewards = row.find_all(class_="currency")
	for idx, reward in enumerate(rewards):
		rewards[idx] = rewards[idx].string

	col2 = rowTDs[1].contents
	bonus = None
	if " " in col2[-1]:
		bonus = col2[-1]

	col3 = rowTDs[2]
	ingredients = []
	if col3.contents:
		divs = col3.find_all("div")
		for div in divs:
			ingredients.append(div.find_all("a")[1].string)

	# print(ingredients)

	modDict[modName] = {"name" : modName, "mod" : explicitMod, "rewards" : rewards, "bonus" : bonus, "recipe" : ingredients, "imgName" : keyName}
		# print(rewards)


# print(trs)
# print(modDict)
print(json.dumps(modDict, indent=4, sort_keys=True))
with open('data.json', 'w') as outfile:
	json.dump(modDict, outfile, indent=4, sort_keys=True)

with open('data.js', 'w') as outfile:
	outfile.write("const data = " + json.dumps(modDict, indent=4, sort_keys=True))
