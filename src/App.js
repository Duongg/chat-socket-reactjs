import React from 'react';
import $ from 'jquery';
import Messages from './message-list';
import Input from './input';
import _map from 'lodash/map';
import io from 'socket.io-client';
import './App.css';

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state={
      messages: [],
      user: {id: '', name: ''},
      userOnline: []
    }
    this.socket = null;
  }
  //connect với server node js thong qua socket.io
  componentWillMount(){
    console.log(this.state.user);
    this.socket = io('localhost:6969');
    this.socket.on('newMessage',(response) => {this.newMessage(response)});
    this.socket.on('loginFail',(response)=>{alert('Tên đã có người sử dụng')});
    this.socket.on('loginSuccess',(response)=>{this.setState({user: {id: this.socket.id, name: response}})});
    this.socket.on('updateUsersList', (response) => {this.setState({userOnline: response})});
  }
  newMessage(m){
    const messages = this.state.messages;
    let ids = _map(messages,'id');
    let max = Math.max(...ids);
    messages.push({
      id:max+1,
      userId: m.id,
      message: m.data,
      userName: m.user.name
    });
    let objMessage = $('.messages');
    if(objMessage[0].scrollHeight - objMessage[0].scrollTop === objMessage[0].clientHeight){
      this.setState({messages});
      objMessage.animate({scrollTop: objMessage.prop('scrollHeight')}, 300);
    }else{
      this.setState({messages});
      if(m.id===this.state.user){
        objMessage.animate({scrollTop: objMessage.prop('scrollHeight')}, 300);
      }
    }
  }
  sendnewMessage(m){
    if(m.value){
      this.socket.emit("newMessage",{data: m.value, user: this.state.user});
      m.value = "";
    }
  }
  login(){
    this.socket.emit("login", this.refs.name.value);
  }
  render(){
    return(
      <div className="app__content">
          <h1>Chat box</h1>
        {this.state.user.id $$ this.state.user.name ?
          <div className="chat_window">
            <div className="menu">
                <ul className="user">
                  <span className="user-name">{this.state.user.name}</span>
                  <p>Online</p>
                  {this.state.userOnline.map(item =>
                      <li key={item.id}><span>{item.name}</span></li>
                    )}
                </ul>
            </div>
            <div className="content">
              <Messages user={this.state.user} messages={this.state.messages} typing={this.state.typing}/>
              <Input sendMessage = {this.sendnewMessage.bind(this)} />
            </div>
          </div>
          :
          <div className="login_form">
              <input type="text" name="name" ref="name"/>
              <input type="button" name="" value="Login" onClick={this.login.bind(this)} />
          </div>
        }
      </div>
      )
  }
}
