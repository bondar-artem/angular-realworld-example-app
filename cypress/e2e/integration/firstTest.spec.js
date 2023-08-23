/// <reference types ="cypress" />

describe('Test with backend', ()=>{

    // beforeEach('go to login page', () =>{
    // //provide the value that we want to use as our response fixture - json
    // //intercept header for tags - GET, url, mock value we want to use as our response for intercepted API
    //     cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'})
    //     cy.loginToApp()
    // })

    beforeEach('go to login page', () =>{
        //provide the value that we want to use as our response fixture - json
        //intercept header for tags - GET, url, mock value we want to use as our response for intercepted API
            cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'tags.json'})
            cy.loginToApp()
        })

//Intercept the (response from server) data we get from the server and modify the data 
//with what we want
it('intercepting and modifying the request and response', ()=>{

    //intercept the response from the server- used for our URL - save the request .as alias - 
    //work with the instance of the method to use it later on as a listener(validator)
    //Intercept article calls, create an object of our request and modify our created req object 
    cy.intercept('POST', '**/articles/', (req) =>{
    //our request will be taken from .body.article.description and change it's value to our needs
    req.reply(resp =>{
    //type articleRecapDescriptionServerResponse in description field, click publish
        expect(resp.body.article.description).to.equal('Description before server update')
    //after verify that the input text is that one we wrote in the field we change the 
    //description data with the new data
    resp.body.article.description = "Description updated on Server"
    })
    }).as('postArticles')
       
    //create the article from UI
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('New Article Title')
        //even if we type this in the webpage field the API will read our backend data
        cy.get('[formcontrolname="description"]').type('Description before server update')
        cy.get('[formcontrolname="body"]').type('article Body')
        cy.contains('Publish Article').click()
    
    //access intercept variable with needed info is not empty - set a wait - dealy response
        cy.wait('@postArticles') // works with .then directly, no need for cy.get
    //get acces to the @postArticles intercept variable and use it's elements .then - to 
    //log to console the result of the interception
        cy.get('@postArticles').then(xhr =>{
            console.log(xhr)
    //verify -expect .statusCode from .response of .interceptResult of the created article 
    //.to.equal 201
    expect(xhr.response.statusCode).to.equal(201)
    //validate that the body text that we sent t our server is the one we have typed
    expect(xhr.request.body.article.body).to.equal('article Body')
    //validate description in the article match the API changed DATA in backed
    expect(xhr.response.body.article.description).to.equal('Description updated on Server')
    })
})


//what kind of url or different parameters you want to intercept - Handler
//routerMatcher and routerHandler  
//-Intercept the (request) data we send to the server, modify the data and send to the server what we want
it.only('intercepting and modifying the request and response', ()=>{

    //intercept the request method - used for our URL - save the request .as alias - 
    //work with the instance of the method to use it later on as a listener(validator)
    //Intercept article calls, create an object of our request and modify our created req object 
    cy.intercept('POST', '**/articles/', (req) =>{
    //our request will be taken from .body.article.description and change it's value to our needs
        req.body.article.description = "articleRecapDescriptionRouterHandler"
    }).as('postArticles')
       
    //create the article from UI
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('articleRecaprouterHandler')
        //even if we type this in the webpage field the API will read our backend data
        cy.get('[formcontrolname="description"]').type('articleRecapDescription')
        cy.get('[formcontrolname="body"]').type('articleRecapBody')
        cy.contains('Publish Article').click()
    
    //access intercept variable with needed info is not empty - set a wait - dealy response
        cy.wait('@postArticles') // works with .then directly, no need for cy.get
    //get acces to the @postArticles intercept variable and use it's elements .then - to 
    //log to console the result of the interception
        cy.get('@postArticles').then(xhr =>{
            console.log(xhr)
    //verify -expect .statusCode from .response of .interceptResult of the created article 
    //.to.equal 200
    expect(xhr.response.statusCode).to.equal(201)
    //validate that the body text that we sent t our server is the one we have typed
    expect(xhr.request.body.article.body).to.equal('articleRecapBody')
    //validate description in the article match the API changed DATA in backed
    expect(xhr.response.body.article.description).to.equal('articleRecapDescriptionRouterHandler')
        })
    })

//------------mocking API requests - STUB API - create our own api response
//how to intercept API request and provide our own API response that we want for our application

it('verify global feed likes counting', () =>{
    //intercept both api calls loaded when we open our webpage
    //empty response for yourFeed and articles response from GlobalFeed
    //3rd parameter is the empty response for YourFeed page
    // cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', '{"articles":[],"articlesCount":0}')  
    //intercept second api - from GlobalFeed page - get - url -
    //3rd element will be an object with a fixture - as we want to change how many articles
    //we get on the GlobalFeed page + modify the data inside the articles json - 
    //set a title for the article, how many counts should we see on heart sign
    //provide the object as a stub response for our api call {fixture:'article.json'} no
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture : 'heartButtonsArticles.json'}).as('clickHearts')
    cy.wait('@clickHearts')
    cy.contains('Global Feed').click()
    // get the articles list and after that the hearts buttons from each article
    //and use all the buttons elements
    cy.get('app-article-list button').then(heartButtons =>{
    //we expect that first[0] heart button from the list of buttons to contain 3 2nd 7
        expect(heartButtons[0]).to.contain('3')
        expect(heartButtons[1]).to.contain('7')
    })
    // to isolate a test to increase the count for heartButton with 1 click create a stub
    //create an object in the fixtures for the heartButton object - get the Response
    //Read the fixture files in cypress and provide the filename we want to use
    //set a .then to use the elements inside the fixture json file
    cy.fixture('heartButtonsArticles.json').then(heartButton =>{
    //Grab the 2nd Slug id from our json file from .articles.slug
    //assign the slug value to a const to use it
       const slugConst = heartButton.articles[0].slug
    //update the count value of heartButton clicks to 8 from 7
        // heartButton.articles[1].favoritesCount = 8
        cy.wrap(slugConst).favoritesCount
    //Intercept our mock POST request for the favorites counts, use POST -
    //- to our url include the SLUG const that we setup earlier - find it under Response
    //+ the mock response our API will intercept is our json object that we updated with 
    //the new favorites count
    cy.intercept('POST', 'https://api.realworld.io/api/articles/'+slugConst+'/favorite', heartButton)
    //validate the updated favorites count from the article list, the eq(2) article, click on
    //heart button shoudl contain 6 as we set the favoriteCounts to 5  
        cy.get('app-article-list button').eq(0).as('btn1').click()
        cy.get('@btn1').should('contain', '2')
        cy.get('app-article-list button').eq(1).as('btn2').click()
        cy.get('@btn2').should('contain', '6')
})
})


//-----------------------

//test that article is displayed and click counter is changing successfully  
//enough just two articles
//validate that the counter is increasing when click on the like button.

    it('verify global feed likes counting', () =>{
    //intercept both api calls loaded when we open our webpage
    //empty response for yourFeed and articles response from GlobalFeed
    //3rd parameter is the empty response for YourFeed page
    // cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', '{"articles":[],"articlesCount":0}')  
    //intercept second api - from GlobalFeed page - get - url -
    //3rd element will be an object with a fixture - as we want to change how many articles
    //we get on the GlobalFeed page + modify the data inside the articles json - 
    //set a title for the article, how many counts should we see on heart sign
    //provide the object as a stub response for our api call {fixture:'article.json'} no
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture : 'articles.json'})

    cy.contains('Global Feed').click()
    // get the articles list and after that the hearts buttons from each article
    //and use all the buttons elements
    cy.get('app-article-list button').then(heartButtons =>{
    //we expect that first[0] heart button from the list of buttons to contain 1
        expect(heartButtons[0]).to.contain('1')
        expect(heartButtons[1]).to.contain('5')
    })

    // to isolate a test to increase the count for heartButton with 1 click create a stub
    //create an object in the fixtures for the heartButton object - get the Response
    //Read the fixture files in cypress and provide the filename we want to use
    //set a .then to use the elements inside the fixture json file
    cy.fixture('articles.json').then(heartButton =>{
    //Grab the 2nd Slug id from our json file from .clickOnButtons.slug
    //assign the slug value to a const to use it
       const slugConst = heartButton.articles[1].slug
    //update the count value of heartButton clicks
        heartButton.articles[1].favoritesCount = 6
    //Intercept our mock POST request for the favorites counts, use POST -
    //- to our url include the SLUG const that we setup earlier - find it under Response
    //+ the mock response our API will intercept is our json object that we updated with 
    //the new favorites count
    cy.intercept('POST', 'https://api.realworld.io/api/articles/'+slugConst+'/favorite', heartButton)
    //validate the updated favorites count from the article list, the eq(2) article, click on
    //heart button shoudl contain 6 as we set the favoriteCounts to 5  
        cy.get('app-article-list button').eq(1).as('btn').click()
        cy.get('@btn').should('contain', '6')
})
})

//--------------------
//input or change elements in the webpage using API - change tags for example - to not create 
//articles with tags we just change the tags elements
    it('verify popular tags are displayed', ()=>{
    //Grab the tag element object and create our own mock of tags object
    //Go to fixtures folder and create the tags.json mock with tags json from Response
    //Modify the tags from webpage creating our own json
    //intercept the tags object from website and provide my own mock response-fixtures
    //tags is loaded first, before logging in so must be declared before loaded
    //Log that we logged in and see if tags elements have been changed with our mock ones
    cy.log('we logged in')
    //Assert that those tags are displayed
    //get the tags list element - it should contain cypress .and contain automation .and testing
    cy.get('.tag-list')
    .should('contain', 'cypress')
    .and('contain', 'automation')
    .and('contain', 'testing')
    })
   

//DELETE CREATED ARTICLE
//using intercept to intercept API requests - before actions
//validate that our api made a request to create the article
//and resp came exactly as it should
    it('certify correct user req and resp', ()=>{

    //intercept the method - used for our URL - save the request .as alias - 
    //work with the instance of the method to use it later on as a listener(validator)
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')
       
    //create the article from UI
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('articleRecap')
        cy.get('[formcontrolname="description"]').type('articleRecapDescription')
        cy.get('[formcontrolname="body"]').type('articleRecapBody')
        cy.contains('Publish Article').click()
    
    //access intercept variable with needed info is not empty - set a wait - dealy response
        cy.wait('@postArticles') // works with .then directly, no need for cy.get
    //get acces to the @postArticles intercept variable and use it's elements .then - to 
    //log to console the result of the interception
        cy.get('@postArticles').then(interceptResult =>{
            console.log(interceptResult)

    //verify -expect .statusCode from .response of .interceptResult of the created article 
    //.to.equal 200
    expect(interceptResult.response.statusCode).to.equal(201)
    //validate that the body text that we sent t our server is the one we have typed
    expect(interceptResult.request.body.article.body).to.equal('articleRecapBody')
    //validate description in the article match what we typed
    expect(interceptResult.response.body.article.description).to.equal('articleRecapDescription')
        })
    })

     //validate that our api made a request to create the article
    //and resp came exactly as it should
    it('certify correct user req and resp', ()=>{
        //create the article from UI
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('articleRecap')
        cy.get('[formcontrolname="description"]').type('articleRecapDescription')
        cy.get('[formcontrolname="body"]').type('articleRecapBody')
        cy.contains('Publish Article').click()
    })




    


//------------------ first day ----------
  // beforeEach('go to login page', () =>{
    //     //provide the value that we want to use as our response fixture - json
    //     cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'})
    //     cy.loginToApp()
    // })

    // beforeEach('go to login page', () =>{
    //     //provide the value that we want to use as our response fixture - json
    //     cy.intercept({method: 'GET', path:'tags'}, {fixture: 'tags.json'})
    //     cy.loginToApp()
    // })


    it('verify popular tags are displayed', ()=>{
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    it('should log in', () =>{
        cy.log('Yeeeeey we logged in!')
    })

    it('verify correct request and response', ()=>{
    //.intercept the call that will be made by our app after creating the
    //Automated the flow of creating a  new article through UI
    //saved as listener postArticles
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

    //Automated the flow of creating a new article through UI
        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('The title2')
        cy.get('[formcontrolname="description"]').type('The description')
        cy.get('[formcontrolname="body"]').type('The body of the article')
        cy.contains('Publish Article').click()

    //wait for the call to be completed and assert that the object created -article- our case
    //has all the information related to performed api calls -response request..
        cy.wait('@postArticles').then( xhr =>{
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(422)
            expect(xhr.request.body.article.body).to.equal('The body of the article')
            expect(xhr.request.body.article.description).to.equal('The description')
        })
    })

    

//----provide a mock response to the API calls - intercept api response - 
    //how to provide your own response to API for an endpoint using cy.intercept
    //cy.intercept = provide a 3rd param with fixture object and this object wil
    //be the data we want to use as a response, replacing the data from the API
    //store your ibjects in the fixture folder - .json
    it('verify global feed hearts count', ()=>{
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
       //access the fixture using {fixture:'articles.json'})
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture:'articles.json'})
    
        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(heartList =>{
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')
        })
//modify your fixture files - 
//use cy.fixture to take the file and use .then principle - create a file(sablon) 
        cy.fixture('articles').then(file =>{
//access elements inside file by taking the file.article,element[] from article json
//.slug for example and set it to a const to be able to change it when intercept
           const articleLink = file.articles[1].slug
//get the .favoritesCount element from the file and modify to 6
           file.articles[1].favoritesCount = 6
           //intercept the change before we POST it + created const so we don't
           //write the entire line of the title which is too long
           //+ favorite element that we want to assert, and 
           //+the response we get when api is intercepted is the created file object
           //that we updated with the new favoritesCount 
           cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain', '6')
    })
//------------------------------

it('intercepting and modifying REQ and RESP', ()=>{
//intercept our fixtures file and use this object of our request and modify it
        cy.intercept('POST', '**/articles/', (req) =>{
              req.body.article.description = "The new description"
        }).as('postArticles')

    //Automated the flow of creating a new article through UI
        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('The title2')
        cy.get('[formcontrolname="description"]').type('The description')
        cy.get('[formcontrolname="body"]').type('The body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then( xhr =>{
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(422)
            expect(xhr.request.body.article.body).to.equal('The body of the article')
            expect(xhr.request.body.article.description).to.equal('The new description')
        })

})


})

