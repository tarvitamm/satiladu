Overview of the changes made:

1) Each of the elements got a data-translate identifier, which links each of the elements text values to a translation in the "translations.json" file.
2) Added 2 buttons "EST" and "ENG". When clicked, they trigger the switchLanguage function with the desired language as it's variable.
3) The switchLanguage function iterates over each of the elements in the html body which has the data-translate identifier and translates the text value of the corresponding element.

TESTING:
If you try to run the program on your own computer, make sure that in the switchLanguage function you change the directory name to a correct one. <br></br>
![image](https://github.com/tarvitamm/satiladu/assets/102857749/9eeecf7b-e0f8-43ae-abfb-16ca7799f463)
<br></br>
For example if you download the code to a folder named "satiladu-main", then change the url in the fetch to 'http://localhost:63342/satiladu-main/translations.json'


PS! The current version pushed on the 22.04.2024 works in a local computer. In the final version, there is an alternative way of how to get the data from the .json file.
