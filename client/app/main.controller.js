
"use strict";

angular.module("webRtc",[])
.controller('mainController',['$scope',function($scope){
var remoteVideo = document.getElementById('remoteVideo');
var started = false;
var localStream;
var userId;
var roomId;
$scope.login = true;
$scope.loggedIn = false;
$scope.startChat = false;
$scope.model = {};
var userName = '';
var conferenceMembers = [];
var chatType = '';




$scope.logIn = function(){
  userName = $scope.model.userName;
  if(!userName){
    $scope.userNameError = true;
    $scope.userNameErrorMessage = 'Enter A Valid User Name';
    return false;
  }
  console.log($scope.model.userName);
  $scope.login = false;
  $scope.loggedIn = true;
  socket.emit('saveUser', userName);
}

$scope.hideUserNameErrorMssage = function(){
   $scope.userNameErrorMessage = '';
}


$scope.wantToCreateRoom = function(){
  $scope.needRoom = true;
}


$scope.cancelRequest = function(){
  $scope.needRoom = false;
  $scope.model.roomName = '';
  $scope.showList = false;
  conferenceMembers.length = 0;
}


$scope.showListOfOnlineUsers = function(){
  if(!$scope.model.roomName){
     $scope.model.noRoomNameErrorMessage = true;
     return false;
  }
  $scope.showList = true;
}


$scope.addToConference = function(user){
  var isRemoved = false;
   for(var i = 0;i<conferenceMembers.length;i++){
       if(conferenceMembers[i].id == user.id){
        conferenceMembers.splice(i,1);
        isRemoved = true;
       }
   }
   if(!isRemoved)
      conferenceMembers.push(user);
}



$scope.createRoom = function(){

    socket.emit('createRoom',{users:conferenceMembers, roomName:$scope.model.roomName});
    $scope.model.roomName = '';
    $scope.needRoom = false;
    $scope.showList = false;
}

socket.on('rooms', function(rooms){

  console.log(rooms);
  $scope.$apply(function(){$scope.rooms = rooms});
  
})


$scope.joinRoom = function(room){
 roomId = room.roomId; 
 chatType = 'group';
 $scope.makeOfferToJoinRoom();
}


$scope.makeOfferToJoinRoom = function(){
    navigator.getMedia({video:true, audio:true}, function(stream){
            var offer1;
            var video = document.createElement('video');
            document.body.appendChild(video);
            video.src = window.URL.createObjectURL(stream);
            console.log(video.src);
            video.play();

            peer.addStream(stream);
            peer.createOffer()
            .then(function(offer){
             offer1 = offer
             return peer.setLocalDescription(offer)
            })
            .then(function(){
                 socket.emit('groupOffer',{data:offer1, roomId:roomId, name:userName});
            })
            .catch(function(err){
              console.log(err);
            },mediaConstraints)


   }, function(err){
    console.log(err);
   })
}


socket.on('onlineusers',function(users){
  var userArray = [];

  if((users.length == 1) && ($scope.loggedIn == true))
     $scope.noUserMessage = true;
  else
     $scope.noUserMessage = false;
  for(var i=0;i<users.length;i++){
    if(users[i].name == userName){
      console.log(users[i].name);
      users.splice(i,1);
    }
  }
$scope.$apply(function(){$scope.users = users;});
   
})



var peerConfig =  {"iceServers":[{url: 'stun:stun.l.google.com:19302'}]}
var peer = new RTCPeerConnection(peerConfig);


$scope.selectUser = function(user){
  $scope.startChat = true;
  userId = user.id;
  chatType = 'individual';
  $scope.startVideo();
 } 

navigator.getMedia =  (navigator.getUserMedia
                        || navigator.webkitGetUserMedia 
                        || navigator.mozGetUserMedia 
                        || navigator.msGetUserMedia)

var mediaConstraints = {'mandatory':{
                        OfferToReceiveAudio: true,
                        OfferToReceiveVideo: true}};
                                                 
   // function startVideo(){

   
   
$scope.startVideo = function(){
  navigator.getMedia({video:true, audio:true},successCallback,failureCallback);
}

function successCallback(stream){
  console.log(stream);
  var offer1;
      var localVideo = document.getElementById('localVideo');
      localVideo.src = window.URL.createObjectURL(stream);
      console.log(localVideo.src);
      peer.addStream(stream);
      peer.createOffer()
      .then(function(offer){
       offer1 = offer
       return peer.setLocalDescription(offer)
      })
      .then(function(){
        if(chatType == 'individual')
           socket.emit('offer',{data:offer1, id:userId, name:userName});
        if(chatType == 'group')
           socket.emit('groupOffer',{data:offer1, roomId:roomId, name:userName});
      })
      .catch(function(err){
        console.log(err);
      },mediaConstraints)

}


function failureCallback(err){
      console.log('error on connecting getUserMedia',err);
}









// $scope.hangUp = function(){

    socket.on('offer', onGetRequest);
      // var peerConfig =  {"iceServers":[{url: 'stun:stun.l.google.com:19302'}]}
      // var peer = new RTCPeerConnection(peerConfig);
      function onGetRequest(evt){
        console.log(evt);
         $scope.$apply(function(){$scope.remoteEvent = evt;});
         $scope.$apply(function(){$scope.startChat = true;});
         $scope.$apply(function(){$scope.remoteCall = true;});
         $scope.$apply(function(){$scope.offerReceive = true;});
         $scope.$apply(function(){$scope.name = evt.name;});
         $scope.$apply(function(){$scope.connectionBuild = true;});
      }
         
         
    socket.on('groupOfferInRoom', function(data1){
       console.log('groupdatahahahaha', data1);
      navigator.getMedia({video:true, audio:true}, function(stream){

        // var localVideo = document.getElementById('localVideo');
        // localVideo.src = window.URL.createObjectURL(stream);
        // console.log(stream);
        var answer1;
        // console.log('haa hai');

        peer.onicecandidate = function(evt){
          console.log(evt);
          if(evt.candidate)
          socket.emit('icecandidate',{candidate:evt.candidate, id:data1.id});
        }
        peer.onaddstream = function(evt){
            var video = document.createElement('video');
            document.body.appendChild(video);
            console.log('onaddstream',evt.stream);
            video.src = window.URL.createObjectURL(evt.stream);
            console.log(video.src);
            video.play();
        }
 
        peer.addStream(stream);

        peer.setRemoteDescription(new RTCSessionDescription(data1.offer))
        .then(function(){
            return peer.createAnswer();
        })
        .then(function(answer){
            answer1 = answer;
            return peer.setLocalDescription(answer);
        })
        .then(function(data){
            socket.emit('groupAnswer',{data:answer1, id:data1.id});
        })
        .catch(function(err){
            console.log(err);
        },mediaConstraints);

        },errorCallback)

    })
    



$scope.hangUp = function(evt){
    var id = evt.id;
    console.log(evt);
    $scope.offerReceive = false;
    navigator.getMedia({video:true, audio:true}, function(stream){

  var localVideo = document.getElementById('localVideo');
      localVideo.src = window.URL.createObjectURL(stream);
      console.log(stream);
      var answer1;
      console.log('haa hai');

  peer.onicecandidate = function(evt){
    console.log('third');
    console.log(evt);
    if(evt.candidate)
    socket.emit('icecandidate',{candidate:evt.candidate, id:id});
  }
  peer.onaddstream = function(evt){
      console.log('second');
      console.log('onaddstream',evt.stream);
      var remoteVideo = document.getElementById('remoteVideo');
      remoteVideo.src = window.URL.createObjectURL(evt.stream);
      console.log(remoteVideo.src);
      remoteVideo.play();
  }
 
  peer.addStream(stream);

  peer.setRemoteDescription(new RTCSessionDescription(evt.data))
  .then(function(){
     console.log('first');
      return peer.createAnswer();
  })
  .then(function(answer){
      answer1 = answer;
      return peer.setLocalDescription(answer);
  })
  .then(function(data){
      socket.emit('answer',{data:answer1, id:evt.id});
  })
  .catch(function(err){
      console.log(err);
  },mediaConstraints);

  },errorCallback)


}

      $scope.close = function(){
        peer.close();
        var localVideo = document.getElementById('localVideo');
        localVideo.src = window.URL.revokeObjectURL();
        $scope.startChat = false;
      }



      socket.on('answer',function(data){
        peer.setRemoteDescription(new RTCSessionDescription(data));
        peer.onaddstream = function(evt){
          var remoteVideo = document.getElementById('remoteVideo');
          remoteVideo.src =  window.URL.createObjectURL(evt.stream);
          console.log(evt.stream);
        }

      })


      socket.on('groupAnswer', function(data){

          peer.setRemoteDescription(new RTCSessionDescription(data));
          peer.onaddstream = function(evt){
           var video = document.createElement('video');
            document.body.appendChild(video);
            console.log('onaddstream',evt.stream);
            video.src = window.URL.createObjectURL(evt.stream);
            console.log(video.src);
            video.play();
        }

      })



      socket.on('icecandidate',function(candidate){
        console.log(candidate);
        peer.addIceCandidate(new RTCIceCandidate(candidate));
        peer.onicecandidate = function(){
          console.log('kutte kamine mai tera khun pi jaunga');
        }
      })



      function errorCallback(err){
        console.log(err);
      }


}]);




