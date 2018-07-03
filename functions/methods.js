const rp = require('request-promise');

function getNewArrivals() {
    console.log('Getting new arrivals...');

    return rp({
        uri: 'https://www.underarmour.com/v0.0/product/US/search',
        qs: {
            facets: [
                1,
                948
            ].toString()
        },
        headers: {
            'User-Agent': 'TestGoogleActions'
        },
        json: true
    })
        .then(function (response) {
            if (!response._embedded || !response._embedded.results || !response._embedded.results[0] || !response._embedded.results[0].products) {
                throw new Error('New Arrivals response does not include "_embedded.results[0].products"');
            }

            const products = response._embedded.results[0].products;
            const productDetails = products.map((product) => {
                return {
                    name: product.content.name || product.content.shortName,
                    categoryName: product.content.categoryName,
                };
            });

            return productDetails;
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        });
}

function searchForProduct(searchText) {
    console.log('Getting search...');

    return rp({
        uri: 'https://www.underarmour.com/v0.0/product/US/search',
        qs: {
            q: searchText,
            includeInactive: false,
            includeSearchInactive: false
        },
        headers: {
            'User-Agent': 'TestGoogleActions'
        },
        json: true
    })
        .then(function (response) {
            if (!response._embedded || !response._embedded.results || !response._embedded.results[0] || !response._embedded.results[0].products) {
                throw new Error('Search response does not include "_embedded.results[0].products"');
            }

            const products = response._embedded.results[0].products;
            console.log('first product: ' + JSON.stringify(products[0]));

            const productDetails = products.map((product) => {
                return {
                    styleCode: product.styleCode,
                    name: product.content.name || product.content.shortName,
                    categoryName: product.content.categoryName,
                    cost: product.priceRange.msrp.min
                };
            });

            return productDetails[0];
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        });
}

module.exports = {
    getNewArrivals,
    searchForProduct
}
