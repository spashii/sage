# sage
A platform to facilitate secure exchange of goods between sellers and buyers

## backend api

`/listings`
- `GET`
	```json
	{
		"listings": [
			{
				"id": "123456",
				"title": "Wizards and Witches",
				"startingPrice": 200,
				"isSold": false,
				"isBiddable": true,
				"bidCurrentPrice": 275,
				"bidExpiresOn": "2021-03-26T10:07:53.566Z",
				"timestamp": "2021-03-26T10:07:53.566Z",
				"biddings": [
					{
						"id": "123412",
						"userId": "423451",
						"price": 215,
						"timestamp": "2021-03-26T10:07:53.566Z"
					},
					{
						"id": "324244",
						"userId": "345234",
						"price": 275,
						"timestamp": "2021-03-26T10:07:53.566Z"
					},
				]
			}
		]
	}
	```
