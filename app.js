// Requerir módulos y librerías
const request = require('request');
const requestPromise = require('request-promise');  
const cheerio = require('cheerio');
const fs = require('fs');
const {Parser} = require('json2csv');
const XLSX = require('xlsx');

// Array para almacenar las citas
let quotesArray = [];

// Declarar función autoejecutable async 
(async () => {
    try {
        console.log('::::::::::: Practica 2 Scrapping (Azucena H. - Sergio M. - Victor A.C.) :::::::::::::::');

        // Scrapear páginas del 1 al 10
        for (let page = 1; page <= 10; page++) {
            let response = await requestPromise({
                uri: `https://quotes.toscrape.com/page/${page}/`,    
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                }
            });

            let $ = cheerio.load(response);

            const titulopagina = $('h1 > a').text();
            console.log(`Procesando página ${page}: ${titulopagina}`);

            $('div.quote').each(function() {
                const quoteText = $(this).find('span.text').text().replace(/^“|”$/g, '');
                const author = $(this).find('small.author').text();
                
                const tags = [];
                $(this).find('div.tags a.tag').each(function() {
                    tags.push($(this).text());
                });

                quotesArray.push({
                    quote: quoteText,
                    author: author,
                    tags: tags.join(', ')
                });
            });
        }

        console.log(`Se encontraron ${quotesArray.length} citas.`);

        let data = JSON.stringify(quotesArray, null, 2);
        fs.writeFileSync('quotes.json', data);
        console.log("Archivo JSON creado: quotes.json");

        let fields = ["quote", "author", "tags"];
        const json2csvParse = new Parser({
            fields: fields, 
            defaultValue: "No hay info."
        });
        const csv = json2csvParse.parse(quotesArray);
        fs.writeFileSync('quotes.csv', csv, "utf-8");
        console.log("Archivo CSV creado: quotes.csv");

        const worksheet = XLSX.utils.json_to_sheet(quotesArray);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook, worksheet, 'Quotes'
        );
        XLSX.writeFile(workbook, 'quotes.xlsx');
        console.log("Archivo XLSX creado: quotes.xlsx");

    } catch (error) {
        console.error('Error en la función autoejecutable:', error.message);
    }
})();