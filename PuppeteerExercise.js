const puppeteer = require('puppeteer');

const cardTrelloID = "55d39827b8629b45cb9c722d";
const urlTrello = "https://trello.com/b/QvHVksDa/personal-work-goals";
const urlTodoist = "https://app.todoist.com/auth/login?success_page=%2Fapp%2F";

//It is necessary to create an account in TODOIST and enter the credentials here
const emailForTodoist = "miEmailTodoIst@gmail.com";
const passForTodoist = "MiPassword";

(async () => {
  //PRUPPETEER FOR GET DATA
  const browser1 = await puppeteer.launch();
  const page1 = await browser1.newPage();

  //PRUPPETEER FOR INSERT DATA
  const browser2 = await puppeteer.launch({ headless: false });
  const page2 = await browser2.newPage();

  //INIT TRELLO
  await page1.goto(urlTrello);
  const dataListElement = await page1.$(`[data-list-id="${cardTrelloID}"]`);

  if (dataListElement) {    
    const listItems = await dataListElement.$$('a');

    //INIT TODOIST
    const botonSelector = 'li.controller button';
    await page2.goto(urlTodoist);
    await page2.waitForNavigation({ waitUntil: 'domcontentloaded' });

    //LOGIN TODOIST PAGE
    await page2.type('#element-0', emailForTodoist);
    await page2.type('#element-3', passForTodoist);
    await page2.click('button[type="submit"]');    
    await page2.waitForSelector('li.controller');    
    await page2.waitForSelector(botonSelector, { visible: true });

    if (listItems.length > 0) {

      //ITERATE THROUGH ELEMENTS OBTAINED FROM TRELLO AND STORE THEM IN TODOIST
      for (const listItem of listItems) {        
        const result = await page1.evaluate(element => element.textContent, listItem);

        await page2.evaluate((botonSelector, result) => {
          const boton = document.querySelector(botonSelector);
      
          if (boton) {
            boton.click();
      
            const myElement = document.querySelector('.tiptap > p');
      
            if (myElement) {
              myElement.innerHTML = result;
            }
          }
      
        }, botonSelector, result);
      
        await page2.waitForTimeout(1000);

        await page2.waitForSelector('button[type="submit"]');
        await page2.click('button[type="submit"]');                      
      }
    } else {
      console.error('No se encontraron elementos en la lista ordenada con el selector proporcionado.');
    }
  } else {
    console.error(`No se encontró ningún cardTrelloID con este id: ${cardTrelloID}.`);
  }

  await browser1.close();
  await browser2.close();
})();





