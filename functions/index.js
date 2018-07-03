'use strict';

const methods = require('./methods');
const ActionNames = require('./action-names');

process.env.DEBUG = 'actions-on-google:*';
const FirebaseFunctions = require('firebase-functions');

function getNewArrivals(response) {
    methods.getNewArrivals()
      .then((products) => {
          console.log('products: ', JSON.stringify(products));
          let outputText = '';
          products.forEach((product, index) => {
              if (index < 4) {
                  console.log(`${product.name}, included in ${product.categoryName}`);
                  if (index > 0) {
                      outputText += ', ';
                  }

                  if (index === 3) {
                      outputText += 'and ';
                  }

                  outputText += `the ${product.name}`;
              }
          });

          console.log(`outputText: ${outputText}`);
          outputText = outputText.replace(/UA /g,'U A ');
          sendResponse(response, outputText);
      });
}

function getProductPrice(params, response, session) {
    console.log(JSON.stringify(params));
    const productDescription = params.product_description;

    if(!productDescription) {
        return sendResponse(response, 'No product description detected, try again');
    }

    methods.searchForProduct(productDescription)
      .then((product) => {
          console.log('product: ', JSON.stringify(product));
          let outputText = `I found the ${product.name}, which costs \$${product.cost}`;
          outputText = outputText.replace(/UA /g,'U A ');
          sendResponse(response, outputText, session, {
              name: 'product_id',
              parameters: {
                  styleCode: product.styleCode,
                  styleName: product.name,
                  styleCost: product.cost
              }
          });
      });
}

function sendResponse (response, responseToUser, session, context) {
  let responseJson = {
      fulfillmentText: responseToUser
  };

  if (context) {
      responseJson.outputContexts = [
          {
              name: `${session}/contexts/${context.name.toLowerCase()}`,
              lifespanCount: 5,
              parameters: context.parameters
          }
      ];
  }

  // Send the response to Dialogflow
  console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
  response.json(responseJson);
}

exports.underArmourProducts = FirebaseFunctions.https.onRequest((request, response) => {
    // For version 2 of the API

    // An action is a string used to identify what needs to be done in fulfillment
    let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';
    // Parameters are any entites that Dialogflow has extracted from the request.
    let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
    // Contexts are objects used to track and store conversation state
    let inputContexts = request.body.queryResult.contexts; // https://dialogflow.com/docs/contexts
    // Get the request source (Google Assistant, Slack, API, etc)
    let requestSource = (request.body.originalDetectIntentRequest) ? request.body.originalDetectIntentRequest.source : undefined;
    // Get the session ID to differentiate calls from different users
    let session = (request.body.session) ? request.body.session : undefined;

    // let userId = request.body.originalRequest.data ? request.body.originalRequest.data.user.userId : undefined;

    console.log(`session:(${session})`);
    console.log(`request.body:(${JSON.stringify(request.body)}`);

    // If undefined or unknown action use the default handler
    if (action === ActionNames.NewArrivals) {
        getNewArrivals(response);
    } else if (action === ActionNames.ProductPrice) {
        getProductPrice(parameters, response, session);
    } else {
        sendResponse(response, 'This is a test response for action - ' + action);
    }
});
