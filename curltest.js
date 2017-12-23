var request = require('request');

var headers = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.8,en;q=0.6',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Cookie': 'optimizely_csf=true; AccessToken=c37c2813-9171-442a-bb8e-a16399ff1f47; ajs_anonymous_id=%224c06c631-6a8c-439d-a0ee-c29de95e60f1%22; RDSS={%22rp_package%22:%22Free%22%2C%22reload%22:11}; __gads=ID=661c7d104dc81b87:T=1506516927:S=ALNI_MYWiPoRXvJO2yDiLF3hbYOgBP9MYg; seerid=66343.27783752844; _cb_ls=1; PathforaImpressions_2f0102bf23b7cbb47f1e407953a7deb6=1%7C1506517020989; PathforaClosed_2f0102bf23b7cbb47f1e407953a7deb6=1%7C1506517023746; chooseBookie=BETWAY; mp_mixpanel__c=1; customizeSettings=%7B%22form%22%3Afalse%2C%22myNotes%22%3Afalse%2C%22spotlights%22%3Afalse%2C%22comments%22%3Afalse%2C%22raceConditions%22%3Afalse%2C%22owner%22%3Afalse%2C%22quotes%22%3Afalse%2C%22pedigrees%22%3Afalse%2C%22rtf%22%3Atrue%2C%22priceHistory%22%3Atrue%2C%22decimalOdds%22%3Afalse%2C%22bettingForecast%22%3Atrue%2C%22orderByPrice%22%3Atrue%2C%22myRatings%22%3Afalse%2C%22showPrices%22%3Atrue%7D; optimizelyEndUserId=oeu1506516924798r0.17281356093373512; ajs_user_id=null; ajs_group_id=null; _ga=GA1.2.332946784.1506516928; _gid=GA1.2.2074365122.1506516928; _pk_id.498.f816=e91a28beaa03f6f9.1506516929.2.1506523060.1506522424.; mp_c3978e172a21323291391bbaf45c499a_mixpanel=%7B%22distinct_id%22%3A%20%2215ec36800e4d34-00a64f70fdf91-31657c00-1fa400-15ec36800e5a76%22%2C%22mp_lib%22%3A%20%22Segment%3A%20web%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22__mps%22%3A%20%7B%22%24os%22%3A%20%22Mac%20OS%20X%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24browser_version%22%3A%2061%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpap%22%3A%20%5B%5D%7D; PathforaPageView=13'
};

var options = {
    url: 'https://www.racingpost.com/profile/horse/1537675/marconi',

};

function callback(error, response, body) {
    //console.log("response: " + response.statusCode);
    if (!error && response.statusCode == 200) {
        console.log(body.toString());
    }
    else {
        if(error){
            console.log("Error: " + JSON.stringify(error));
        }
        console.log(response.statusCode);
    }
}

request(options, callback);
