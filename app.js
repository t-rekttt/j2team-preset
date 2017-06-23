const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const fs = require('fs');
var preset = JSON.parse(fs.readFileSync('preset-table.json'));

var app = express();

var port = process.env.PORT || 3000;

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json({extended: true}));

// Filter and check if there is any new preset
var filterUnique = (obj1, obj, cb) => {
	var news = [];
	for (var i=0; i<obj.length; i++) {
		found = false;
		for (var j=0; j<obj1.length; j++) {
			if (obj[i].presetID === obj1[j].presetID) {
				found=true;
				break;
			}
		}
		if (!found) news.push(obj[i]);
		if (i===obj.length-1) cb(news);
	}
}

// Recursively traverse and replace the textFormats object with our preset
var traverseAndReplace = (o, cb) => {
    for (i in o) {
        if (!!o[i] && typeof(o[i])=="object") {
			if (o[i].textFormats) {
				let original_preset = o[i].textFormats;
            	o[i].textFormats=preset
				cb(original_preset);
				break;
            }
			traverseAndReplace(o[i], cb);
        }
    }
} 

// Parse body to a string
app.use(bodyParser.text({type: '*/*'}));

// Add Access-Control-Allow-Origin header
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Proxying request from Facebook to patch the preset
app.post("/", (req, res) => {
	try {
		if (req.body) {
			console.log("New connection on "+Date.now());
			let user = /=([0-9]+)&/.exec(req.body);
			if (user) 
			{	
				// Forward the request
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
							var original_preset;

							traverseAndReplace(json.jsmods.require, original => {
								// Take the original preset table
								original_preset = original;
								res.send("for (;;);"+JSON.stringify(json));
							});


							// Check if there is anything new
							filterUnique(preset, original_preset, filtered_preset => {
								if (filtered_preset.length>0) {
									// If there is anything new, log them off (because I'm poor and Heroku free tier doesn't let us write to file)
									console.log(filtered_preset);
								}
							});
						}
						else {
							// Hope that I'll never have to use this
							res.send("Error");
						}
					}
				});
			}
			else {
				// Bad move :(
				res.send("Error");
			}
		}
	} catch (e) {
		// Ouch
		console.log(e);
		res.send("Error");
	}
});

app.get("/", (req, res) => {
	// A bit of credit :))
	res.send("It works<br>Made by T-Rekt of J2TeaM");
});

app.listen(port, () => {
	// Start our wonderful server
	console.log("Listening on port "+port);
});