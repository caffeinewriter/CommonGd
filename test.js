config = require('./config.json');

console.log(config.products);

for (prod in config.products) {
	if(config.products.hasOwnProperty(prod)) {
		console.log(config.products[prod].price);
	}
}