const express = require('express');
const hbs = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

//Configure express
const app = express();
app.engine('hbs', hbs({ defaultLayout: 'default.hbs' }));
app.set('view engine', 'hbs');

//Configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

//Define the Category
const category = ["BUSINESS", "ENTERTAINMENT", "GENERAL", "HEALTH",
"SCIENCE", "SPORTS", "TECHNOLOGY"];

const API_KEY = process.env.API_KEY || '';

//Define Endpoint for TOP Headlines
const TOP_HEADLINE_ENDPONT = 'https://newsapi.org/v2/top-headlines';

//Get /
app.get('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('searchNews', 
    {
        category
    });
})

let articles = [];
let caching = [];

app.get('/searchNews', (req, res) => {
    //Put Api Key into Headers
    let headers = {
        'X-Api-Key': API_KEY
    }

    //Create the Search URL
    let url = withQuery(TOP_HEADLINE_ENDPONT,  {
        country: req.query.country,
        category: req.query.category.toLowerCase(),
        q: req.query.newsSearch
    })

    //Check for the requestedTime
    let currDate = new Date();
    let cached = false;

    //Find for available article
    caching.forEach((d, index) => {
        if(d.url === url)
        {
            let allowedDate = new Date(d.requestedTime);
            allowedDate.setMinutes(allowedDate.getMinutes() + 1);
            if(currDate < allowedDate)
            {
                console.info('Cached');
                //Response 201
                res.status(201);
                res.type('text/html');
                res.render('browseNews', {
                    articles: d.articles,
                    haveArticle: d.articles.length
                });
                cached = true;
            }
            else
            {
                caching.splice(index, 1);
            }
        }
    })

    if(!cached)
    {
        //Fetch the Result
        let result = fetch(url, {method:"GET", headers});
        
        result.then(result => {
            return result.json();
        }).then(data => {
            //Add into Caching
            console.info('New');

            articles = [];

            for(let a of data.articles)
            {
                articles.push(a);
            }

            //Response 201
            res.status(201);
            res.type('text/html');
            res.render('browseNews', {
                articles,
                haveArticle: articles.length
            });

            //Add to Cache
            caching.push({
                url,
                requestedTime: new Date(),
                articles
            })
        }).catch(e => {
            console.info('Error happened during fetching of result');
        }) 
    }      
})

app.post('/searchNews', 
    express.urlencoded({ extended: true }),
    (req, res) => {

        //Put Api Key into Headers
        let headers = {
            'X-Api-Key': API_KEY
        }

        //Create the Search URL
        let url = withQuery(TOP_HEADLINE_ENDPONT,  {
            country: req.body.country,
            category: req.body.category.toLowerCase(),
            q: req.body.newsSearch
        })

        //Check for the requestedTime
        let currDate = new Date();
        let cached = false;

        //Find for available article
        caching.forEach((d, index) => {
            if(d.url === url)
            {
                let allowedDate = new Date(d.requestedTime);
                allowedDate.setMinutes(allowedDate.getMinutes() + 1);
                if(currDate < allowedDate)
                {
                    console.info('Cached');
                    //Response 201
                    res.status(201);
                    res.type('text/html');
                    res.render('browseNews', {
                        articles: d.articles,
                        haveArticle: d.articles.length
                    });
                    cached = true;
                }
                else
                {
                    caching.splice(index, 1);
                }
            }
        })

        if(!cached)
        {
            //Fetch the Result
            let result = fetch(url, {method:"GET", headers});
            
            result.then(result => {
                return result.json();
            }).then(data => {
                //Add into Caching
                console.info('New');

                articles = [];

                for(let a of data.articles)
                {
                    articles.push(a);
                }

                //Response 201
                res.status(201);
                res.type('text/html');
                res.render('browseNews', {
                    articles,
                    haveArticle: articles.length
                });

                //Add to Cache
                caching.push({
                    url,
                    requestedTime: new Date(),
                    articles
                })
            }).catch(e => {
                console.info('Error happened during fetching of result');
            }) 
        }      
    }
)

app.use(express.static(__dirname + '/public'));

app.use('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('searchNews', 
    {
        category
    });
})

//Configure Server
app.listen(PORT, ()=> {
    console.info(`Server Started on PORT ${PORT} at ${new Date()}`);
})