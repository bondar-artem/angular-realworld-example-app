/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }


// Cypress.Commands.add ('loginToApp', () => {
//     cy.visit('/login')
//     cy.get('[placeholder="Email"]').type('artem.bondar16@gmail.com')
//     cy.get('[placeholder="Password"]').type('CypressTest1')
//     cy.get('form').submit()
// })

// ---------Headless authentication - no user pass token
// const userCredentials = {
//     "user": {
//         "email": "artem.bondar16@gmail.com",
//         "password": "CypressTest1"
//     }
// }
// //Create a method to get the HEADLESS Authentication
// //no need to auth with user pass and submit
// //use the request in API for login and get the body to get the token 
// Cypress.Commands.add ('loginToApp', () => {
//     cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials )
//     .its('body').then(body=>{
//    const token = body.user.token
// //visit the homepage - we assume we already authenticated and 
// //before load we set the token - onBeforeLoad(we create our win dow object)
// //and in win. we set for the .localStorage (Application) 
// //.setItem(token key(or name of the token..)), and value = body.user.token(token)
//         cy.visit('/', {
//             onBeforeLoad(win){
//                 win.localStorage.setItem('jwtToken', token)
//             }
//         })
//     })
// })

// ---------Headless authentication 2 - no user pass get token from localStorage
const userCredentials = {
    "user": {
        "email": "artem.bondar16@gmail.com",
        "password": "CypressTest1"
    }
}

Cypress.Commands.add ('loginToApp', () => {
    cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials )
    .its('body').then(body=>{
        
   const token = body.user.token
//wrap our token constant to save the token value .as a token ALIAS and use the token in our test
    cy.wrap(token).as('token')
//inside cy.visit we will have to call onBeforeLoad event and save the return value in localStorage
//so our browser will be authenticated before we open the homepage
cy.visit('/', {
            onBeforeLoad(win){
                win.localStorage.setItem('jwtToken', token)
            }
        })
    })
})