setLanguageButton();
function switchLanguage(language) {
    const legendInfoBox = document.getElementById('D-LegendInfo');
    legendInfoBox.style.visibility = 'hidden';
    isPopupVisible = false;
    currentLanguage = language;
    HelpMeText(); // Call your HelpMeText function to update any other text elements
    createProductListDiv();
    SenseDate();
    refreshInAadress();
    setLanguageButton();
    fetch('http://localhost:63342/satiladu/translations.json')
        .then(response => response.json())
        .then(data => {
            const translations = data;
            const elementsToTranslate = document.querySelectorAll('[data-translate]');

            elementsToTranslate.forEach(element => {
                const translationKey = element.getAttribute('data-translate');
                let translationValue = translations[language][translationKey];
                if (translationKey === "tableInfo"){
                  let text = translations[language][translationKey]
                  text = text.replace(/\n/g, '<br />');
                  translationValue = text;
                }
                // Translate the title attribute
                if (element.hasAttribute('title')) {
                    element.setAttribute('title', translationValue);
                }

                const spanElement = element.querySelector('span');
                if (spanElement) {
                    if (spanElement.getAttribute('data-translate')){
                    const key = spanElement.getAttribute('data-translate');
                    spanElement.textContent = translations[language][key];
                    }
                }

                const placeholderElement = element.querySelector('input');
                if (placeholderElement) {
                    // Assuming 'input' is the translation key for the placeholder
                    const placeholderTranslationValue = translations[language][translationKey];
                    inputElement.setAttribute('placeholder', placeholderTranslationValue);
                }
                if (element.classList.contains('inads-input')) {

                }


                // Translate the text content within SVG
                const imgElement = element.querySelector('img');
                const excludedKeys = ["Help", "NavToOne", "ExportPNG", "ExportPGW", "ExportClipboard", "ExportWMS", "ExportURL"];
                if (imgElement && !excludedKeys.includes(translationKey)) {
                    const svgXML = imgElement.getAttribute('src').replace('data:image/svg+xml;utf8,', '');
                    const parser = new DOMParser();
                    try {
                        const svgDoc = parser.parseFromString(svgXML, 'image/svg+xml');
                        const textElement = svgDoc.querySelector('.txt');
                        if (textElement) {
                            textElement.textContent = translationValue;
                            if (translationKey == 'Borders'){
                                const fontSize = language === 'english' ? '0.68em' : '0.9em';
                                textElement.setAttribute('style', `font-size: ${fontSize};`);
                            }
                            imgElement.setAttribute('src', 'data:image/svg+xml;utf8,' + new XMLSerializer().serializeToString(svgDoc));
                        }
                    } catch (error) {
                        console.error('Error parsing SVG:', error);
                    }
                }
            });

            // Additional logic to translate elements within the table
            const tableElementsToTranslate = document.querySelectorAll('#D-LutWindow [data-translate]');
            tableElementsToTranslate.forEach(tableElement => {
                translateTableElement(tableElement, translations, language);
            });
        })
        .catch(error => {
            console.error('Error fetching translations:', error);
        });
}
function translateTableElement(element, translations, language) {
    const translationKey = element.getAttribute('data-translate');
    const translationValue = translations[language][translationKey];

    // Translate the text content directly for <i> elements
    const italicElement = element.querySelector('i');
    if (italicElement) {
        if (italicElement.getAttribute('data-translate')){
        italicElement.textContent = translations[language][italicElement.getAttribute('data-translate')];
        }
    }

    // Translate the text content directly for <select> elements and their <option> children
    const selectElement = element.closest('select');
    if (selectElement) {
        const optionElements = selectElement.querySelectorAll('option');
        optionElements.forEach(optionElement => {
            if (optionElement.getAttribute('data-translate')){
            optionElement.textContent = translations[language][optionElement.getAttribute('data-translate')];}

        });
    }

    // Translate the text content directly for the table cell
    element.textContent = translationValue;
}

function setLanguageButton(){
  if (currentLanguage == 'estonian') {
      document.getElementById('estbutton').className="buttonnoy";
      document.getElementById('engbutton').className="buttonno";
    }

    else{
      document.getElementById('engbutton').className="buttonnoy";
      document.getElementById('estbutton').className="buttonno";
    }
}