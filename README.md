Overview of the changes made:

1) Each of the elements got a data-translate identifier, which links each of the elements text values to a translation in the "translations.json" file.
2) Added 2 buttons "EST" and "ENG". When clicked, they trigger the switchLanguage function with the desired language as it's variable.
3) The switchLanguage function iterates over each of the elements in the html body which has the data-translate identifier and translates the text value of the corresponding element.

PS! The current version pushed on the 22.04.2024 works in a local computer. In the switchLanguage function there is the fetch, which gets the translations from the .json file in a way that will not be used in the final product.
In the final version, there is an alternative way of how to get the data from the .json file.
