// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const ytinfo = require('youtube-info');
const {google} = require('googleapis');
const { OAuth2Client } = require("google-auth-library");
const ytid = require('get-youtube-channel-id');
const Discord = require('discord.js');
const bot = new Discord.Client();


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('port', (process.env.PORT || 5000))
app.set('views engine', 'ejs')

app.listen(app.get('port'));

setInterval(() => {
  http.get(`http://bearcommunity.herokuapp.com/`);
}, 15000);

// http://expressjs.com/en/starter/basic-routing.html


// listen for requests :)


//bot login with Discord token
bot.login(process.env.TOKEN);

bot.on('ready',(ready) => {
  bot.user.setActivity('les nouvelles vidéos de la BearCommunity', { type : 'WATCHING' })
});

bot.on('message', (message)=> {
  let guild = bot.guilds
  .filter(function (guild) { return guild.name === '🐻BearCommunity🐻';})
  .first();
  let textChannel = guild.channels
		.filter(function (channel) { return  channel.type === 'text'; })
		.filter(function (name) { return  name.name === '🔧commandes🔧'; })
		.first();
  if (message.channel.name == textChannel.name){ 
    let args = message.content.split(' ');
    if(args[0] == 'yt' && args[1] == 'link'){
      if(args[2] != undefined){
        if(args[2].charAt(0) == 'h' && args[2].charAt(1) == 't' && args[2].charAt(2) == 't' && args[2].charAt(3)){
          fs.readFile('lastVideo.json', (err, data) => {
            let i = 0;
            let list = JSON.parse(data);
            ytid(args[2]).then(function(channel) {
              let different = true
              console.log(channel.id)
              while (i < list.length){
                if(message.author.id == list[i].id){
                  message.channel.send("Votre pseudo est déjà enregistré dans la base de donné. La modification n'étant pas encore disponible, contactez Louwix")
                  different = false;
                }
                i++;
              }
              if(different){
                console.log(list);
                list.push({ username: message.author.username, id: message.author.id, youtube: { channelId: channel.id, lastVideo: ''}});
                console.log(list)
                fs.writeFile('lastVideo.json', JSON.stringify(list));   
                message.channel.send("La chaîne youtube a été associées a votre compte portant le pseudonyme "+ message.author.username+ ". A chaque nouvelle vidéo sortie sur cette chaîne un message sera publié dans le salon #🚨vidéos🚨 . Si vous constatez un problème rendez-vous sur http://bearcommunity.glitch.me");
              }
            });
          });
        } else {
          message.channel.send('Veuillez fournir un url valide');
        }
      } else {
        message.channel.send("Préciser l'url d'une chaîne")
      }
    }
  }
});
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/google-apis-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  // Authorize a client with the loaded credentials, then call the YouTube API.
  //See full code sample for authorize() function code.
app.get("/", (req, res) => {
  var date = new Date();
  var month = date.getMonth();
  var hour = date.getHours();
  month++;
  hour++;
  console.log(date.getDate() + '/' + month + '/' + date.getFullYear() + ' ' + hour + ':' + date.getMinutes() + ':' + date.getSeconds() + " Ping reçu");
  fs.readFile('lastVideo.json', function read(err, data) {
    let list = JSON.parse(data)
    let i = 0
    while (i < list.length){
      let user = list[i];
      console.log(list[i].youtube.channelId)
      authorize(JSON.parse(content), {'params': {'channelId': list[i].youtube.channelId,
                 'maxResults': '1',
                 'part': 'contentDetails'}}, user, activitiesList);
      i++;
    }
  });
  res.sendStatus(200)
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, requestData, user, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  activitiesList(oauth2Client, requestData)
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, requestData, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, requestData, user);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, requestData, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
    var code = process.env.CODE;
    /*oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }*/
      oauth2Client.credentials = process.env.CODE;
      //storeToken(token);
      callback(oauth2Client, requestData);
    //});
  //});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

/**
 * Create a JSON object, representing an API resource, from a list of
 * properties and their values.
 *
 * @param {Object} properties A list of key-value pairs representing resource
 *                            properties and their values.
 * @return {Object} A JSON object. The function nests properties based on
 *                  periods (.) in property names.
 */
function createResource(properties) {
  var resource = {};
  var normalizedProps = properties;
  for (var p in properties) {
    var value = properties[p];
    if (p && p.substr(-2, 2) == '[]') {
      var adjustedName = p.replace('[]', '');
      if (value) {
        normalizedProps[adjustedName] = value.split(',');
      }
      delete normalizedProps[p];
    }
  }
  for (var p in normalizedProps) {
    // Leave properties that don't have values out of inserted resource.
    if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
      var propArray = p.split('.');
      var ref = resource;
      for (var pa = 0; pa < propArray.length; pa++) {
        var key = propArray[pa];
        if (pa == propArray.length - 1) {
          ref[key] = normalizedProps[p];
        } else {
          ref = ref[key] = ref[key] || {};
        }
      }
    };
  }
  return resource;
}

function activitiesList(auth, requestData, user) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  service.activities.list(parameters, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(response.data)
    let id = response.data.items[0].contentDetails.upload;
    fs.readFile('lastVideo.json', function read(err, data) {
    let list = JSON.parse(data)
    console.log('Pseudo : ' + user.username)
    console.log('Id cherché : ' + id);
    console.log('Id stockée : ' + user.youtube.lastVideo);
    if(id != undefined){
    if(user.youtube.lastVideo == '' || user.youtube.lastVideo == undefined){
       let i = 0
      let ok = true;
      while (ok) {
        if(user.id == list[i].id){
          list[i].youtube.lastVideo = id.videoId;
          fs.writeFile("lastVideo.json", JSON.stringify(list));
          ok = false;
        }
        i++
      }
    } else {
    if(user.youtube.lastVideo !== id.videoId){
      console.log("New video")
      let channelSend = '🚨vidéos🚨';
      if(user.id == '258599077548261376'){
        channelSend = '📢annonce📢';
      }
      let guild = bot.guilds
        .filter(function (guild) { return guild.name === '🐻BearCommunity🐻';})
        .first();
      let textChannel = guild.channels
		    .filter(function (channel) { return  channel.type === 'text'; })
			  .filter(function (name) { return  name.name === channelSend; })
			  .first();
      ytinfo(id.videoId, (err, videoInfo) => {
        if (err) throw new Error(err);;
        textChannel.send('@everyone '+ videoInfo.url, new Discord.RichEmbed()
          .setAuthor(videoInfo.owner, '', 'https://www.youtube.com/' + videoInfo.channelId)
          .addField('🆕 🎬 Nouvelle vidéo en ligne', videoInfo.title)
          .setURL(videoInfo.url)
          .setThumbnail(videoInfo.thumbnailUrl)
          .setColor('GREEN')
        );
      });
      let i = 0
      let ok = true;
      while (ok) {
        if(user.id == list[i].id){
          list[i].youtube.lastVideo = id.videoId;
          fs.writeFile("lastVideo.json", JSON.stringify(list));
          ok = false;
        }
        i++
      }
    }
    }
    }
    });
  });
}
  
});
