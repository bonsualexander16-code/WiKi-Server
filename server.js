const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const port = process.env.PORT || 5050 ;

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.text());


app.get("/" , (req , res)=>{

    res.send("Hello MotherFucker") ;
})


// ===============================
// IMAGE PROXY
// ===============================

app.get("/image", async (req, res) => {

    const url = req.query.url;

    if (!url) {
        return res.status(400).send("No image URL");
    }

    try {

        const image = await axios.get(url, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "BexeSearch/1.0 (bonsualexander16@gmail.com)"
            }
        });

        res.set(
            "Content-Type",
            image.headers["content-type"]
        );

        return res.send(image.data);

    } catch (error) {

        console.log("IMAGE ERROR:", error.message);

        return res.status(500).send("Image error");
    }
});


// ===============================
// GET SEARCH DATA
// ===============================

app.post("/getData", async (req, res) => {

    console.log(req.body);

    try {

        const response = await axios.get(
            "https://en.wikipedia.org/w/api.php",
            {
                params: {
                    action: "query",
                    prop: "pageimages|extracts",
                    titles: req.body.querry,
                    pithumbsize: 300,
                    exintro: 1,
                    explaintext: 1,
                    format: "json",
                    origin: "*"
                },

                headers: {
                    "User-Agent":
                        "BexeSearch/1.0 (bonsualexander16@gmail.com)"
                }
            }
        );


        if (!response.data) {
            return res.json({
                mess: "No Data Found"
            });
        }

        const pages = response.data.query.pages;

        const page = Object.values(pages)[0];


        // ===============================
        // WIKIPEDIA PAGE LINK
        // ===============================

        let name = page.title.replace(/ /g, "_");

        let visit =
            `https://en.wikipedia.org/wiki/${name}`;


        // ===============================
        // IMAGE URL
        // ===============================

        let imURL = page.thumbnail?.source || null;

        let imgUrl = null;


        if (imURL) {

            imgUrl =
                "http://localhost:5050/image?url=" +
                encodeURIComponent(imURL);


        }


        // ===============================
        // SEND RESULT TO REACT NATIVE
        // ===============================

        return res.json({

            title:
                page.title ||
                "No information Found",

            des:
                page.extract ||
                "No Data Found Search Google",

            imgLink:
                imgUrl,

            link:
                visit
        });


    } catch (e) {

        console.log("SEARCH ERROR:", e.message);

        return res.json("No Page Found");
    }

});


// ===============================
// START SERVER
// ===============================

app.listen(port, "0.0.0.0", () => {

    console.log(
        "Server Running on Port 5050"
    );

});
