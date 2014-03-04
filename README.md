Common.GD
=========

This is a charitable shop, for lack of a better description. It allows you to add both shops and charities through a JSON file. It is available at [Common.gd](http://common.gd). The site is a functional beta. It utilizes Blockchain.info's [Receive Payments API](https://blockchain.info/api_receive) to process and forward payments to their respective charities, and MongoDB with Mongoose to manage data.

##Configuration Instructions

Start by opening `config.json`. It comes preloaded with a plethora of charities, ranging from internet activism, to food-based charities and human-rights groups. You can start by editing the first product. They are identified numerically, and are autopopulated from the config file. The same with the charities. No further setup necessary. 

###Example product:
    "1": {
            "name": "Example", //Name
            "price": 0.01, //Price in Bitcoins, not satoshis
            "desc": "This is a test product. Nothing to see here.", //Description
            "file": "http://placekitten.com/g/200/200/", //Download. Must be hotlinkable.
            "img": "http://placekitten.com/g/200/200/", //Display image
            "id": 1 //Product ID. Same as outside one. Kludge fix, may be removed in later versions.
    }