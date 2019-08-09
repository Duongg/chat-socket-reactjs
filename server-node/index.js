var express = require('express');
var app = express();
var _findIndex = require('lodash/findIndex')
var server = require('http').Server(app);
var port = (process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 6969);
var io = require('socket.io')(server);
server.listen(port, () => console.log('Server running in port ' + port));


var userOnline = [];
io.on('connection', function(socket){
  console.log(socket.id + ': connected');
  socket.emit('id', socket.id);

  socket.on('disconnect', function(){
    console.log(socket.id + ': disconnected')
    $index = _findIndex(userOnline, ['id', socket.id]);
    userOnline.splice($index,1);
    io.sockets.emit('updateUserList', userOnline);
  })

  socket.on('newMessage', data => {
    io.sockets.emit('newMessage', {
      data: data.data,
      user: data.user
    });
  })
  socket.on('login',data => {
    if(userOnline.indexOf(data) >= 0){
      socket.emit('loginFail');
    }else{
      socket.emit('loginSuccess',data);
      userOnline.push({
        id: socket.id,
        name:data
      })
      io.sockets.emit('updateUserList', userOnline);
    }
  })

});

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
})
