const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;
const fields = ["title", "price", "imageurl", "url", "time"];
const mainurl = "http://www.shirts4mike.com/shirts.php";
const opts = {
    fields
};
let innerItems = [];
let titleholder, priceholder, imageurlholder, urlholder, time;
let shirts = [];
time = new Date;
//set date
getdate = new Date();
let datetime = getdate.getFullYear() + "-" + getdate.getMonth() + "-" + getdate.getDate();
//console.log(datetime);


//check for data file

fs.mkdir("data", function (err) {
    if (err) {
        console.log("Data file already created, so did not make a new one.")
    } else {
        console.log("The file called data has been made.")
    }
})



//get url for inidviual tshirts
request(mainurl, function (err, response, html) {
    if (!err) {
        let $ = cheerio.load(html);
        let listItems = $(".products").children();
        listItems.each(function (index) {
            innerItems.push($(".products").children().eq(index).find("a").attr("href"));
        })
        shirtDetails();
    }
    if (err) {
        console.log(err.message);
        console.log(`Sorry, there seems to be a connection error:  ${err.message}`);
        errorlog();
    }

});

function shirtDetails() {
    innerItems.forEach(function (index) {
        let shirturl = "http://www.shirts4mike.com/" + (index);
        let shirty = shirturl;

        //request("http://www.shirts4mike.com/" + (index), function (err, response, html) {
        request({
                method: "GET",
                uri: "http://www.shirts4mike.com/" + (index),
                gzip: true
            },
            function (err, response, html) {
                let $ = cheerio.load(html);
                if (!err) {
                    let tdetails = $(".shirt-details").children();
                    tdetails.each(function (index) {
                        titleholder = $(".shirt-picture").children().find("img").attr("alt");
                        priceholder = $(".price").text();
                    })
                    let imagedetails = $(".shirt-picture").children();
                    imagedetails.each(function (index) {
                        imageurlholder = $(".shirt-picture").children().find("img").attr("src");

                    })
                    let timenow = time.getTime();
                    console.log(timenow);
                    shirts.push({
                        title: titleholder,
                        price: priceholder,
                        imageurl: imageurlholder,
                        url: shirturl,
                        time: timenow
                    })

                    //
                    console.log(shirts);

                }
            })
    })
    //console.log(shirts);
}
// write to data file
function makefile() {
    if (shirts.length > 0) {
        console.log("write file");
        try {
            const parser = new Json2csvParser(opts);
            const csv = parser.parse(shirts);
            fs.writeFile('./data/' + datetime + ".csv", csv, (err) => {
                if (err) {
                    console.log("error");
                }
                console.log('shirts saved');
            });
            console.log(csv);
        } catch (err) {
            console.error(err);
        }
    }
}
setTimeout(makefile, 2500);

function errorlog() {
    let timestamp = Date() + "\n";
    fs.appendFile('scraper-error.log', timestamp, function (err) {
        console.log(timestamp)
        if (err) {;
            console.log("scraper error logged");
        }
    });
}