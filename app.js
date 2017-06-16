const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const fs = require('fs');
var preset = JSON.parse(fs.readFileSync('preset-table.json'));

var app = express();

var port = process.env.PORT || 3000;

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json({extended: true}));
app.use(bodyParser.text({type: '*/*'}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.post("/", (req, res) => {
	try {
		if (req.body) {
			console.log("New connection on "+Date.now());
			let user = /=([0-9]+)&/.exec(req.body);
			if (user) 
			{
				user = user[1];
				let options = {
					url: `https://www.facebook.com/react_composer/feedx_sprouts/bootload/?composer_id=rc.u_0_r&target_id=${user}&composer_type=feedx_sprouts&friend_list_id=&dpr=1`,
					method: 'POST',
					headers: {
						'User-Agent': req.headers['user-agent'],
						'Cookie': req.headers['cookie'],
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					// proxy: "http://localhost:8888",
					body: req.body,
					strictSSL: false,
				}

				request(options, (err, resp, body) => {
					if (err) {
						res.send({});
					}
					else {
						let json = JSON.parse(body.substr(9));
						if (json.jsmods) {
							json.jsmods.require[0][3][1].config.taggersConfig.FORMATTED_TEXT.textFormats=preset;
							res.send("for (;;);"+JSON.stringify(json));
						}
						else {
							res.send("Error");
						}
						// res.send(body);
					}
				});
			}
			else {
				res.send("Error");
			}
		}
	} catch (e) {
		console.log(e);
		res.send("Error");
	}
});

app.get("/", (req, res) => {
	res.send("It works<br>Made by T-Rekt of J2TeaM");
});

app.listen(port, () => {
	console.log("Listening on port "+port);
});