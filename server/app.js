


var express = require('express');
var app = express();
var http = require('https');
var fs = require('fs');
var users = [];
var rooms = [];
var groupOfferArray = [];

var options = {
	  key: fs.readFileSync('certKey.pem'),
	  cert:fs.readFileSync('Certificates.pem')
    };

var server = require('./config/express.js')(options, app); 
var io1 = require('socket.io')(server);
var io = io1.of('/chat');



io.on('connection', function(user){
	var tempId = user.id;
    console.log('user connected');


    user.on('saveUser', function(userName){     
        users.push({name:userName, id:tempId})
        console.log(users);
        io.emit('onlineusers',users);
    })


	user.on('offer',function(data){    // sending offer to the connecting user
		console.log(data);
        io.to(data.id).emit('offer',{data:data.data, name:data.name, id:tempId});
	})


	user.on('answer',function(data){
		console.log('hahahaha',data);
		io.to(data.id).emit('answer',data.data);
	})


	user.on('message',function(data){
		user.broadcast.emit('message',data);
	})


	user.on('disconnect',function(){
		for(var i=0;i<users.length;i++){
			if(tempId == users[i].id){
				users.splice(i,1);
				break;
			}
		}
		io.emit('onlineusers',users);
		console.log('user disconnected');
	})


	user.on('icecandidate',function(data){
		console.log('icecandidate',data);
		io.to(data.id).emit('icecandidate',data.candidate);
	})


	user.on('createRoom', function(data){
        var admin = io.connected[user.id];
       
        admin.join(data.roomName);
        for(var conferenceMember = 0;conferenceMember<data.users.length;conferenceMember++){
        	console.log(data.users[conferenceMember].id);
        	console.log(data.users.length);
        	var member = io.connected[data.users[conferenceMember].id];
        	member.join(data.roomName);
        }
        console.log(io.adapter.rooms);
        var roomId = getRoomId(5);
        console.log(roomId);
        var room = {roomId:roomId, name:data.roomName};
        rooms.push(room);
        io.to(data.roomName).emit('rooms', rooms);
	})


	user.on('groupOffer', function(data){
		var Room;
		for(var i=0;i<rooms.length;i++){
			if(data.roomId == rooms[i].roomId){
              Room = rooms[i].name;
              break;
			}
		}
        io.to(Room).emit('groupOfferInRoom', {offer:data.data, id:tempId});
	})
	

	user.on('groupAnswer', function(data){
		console.log('hahahaha',data);
		io.to(data.id).emit('groupAnswer',data.data);
	})

	function getRoomId(len){
		var str = '';
		var chars = 'abcdefghijklmnopqrstuvwxyz';
		for(var i=0;i<len;i++){
			str += chars[Math.floor(Math.random()*chars.length)];
		}
		return str;
	}
});
	

server.listen(3002,function(){
	console.log('server is listening on .....',3002);
    })



module.exports = app;
