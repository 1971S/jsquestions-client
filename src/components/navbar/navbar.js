import React from 'react';
import './navbar.scss';
import { connect } from 'react-redux';
import { setToken } from '../../redux/actions.js';
import Login from '../log-in/log-in.js';
import logo from '../../assets/square-logo.png';
import token from '../../assets/token.png';
import { Link } from "react-router-dom";
import ProfileMenu from './profile-menu';
import Modal from '../modal/modal.js';

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSignup: false,
      openModal: true,
      showMenu: false,
      socketQuestion: '',
    }
  }

  componentDidMount = () => {
    this.checkToken();
    this.props.socket.on('push tutor', (question) => this.setState({socketQuestion: question}, () => this.tutorNotification()));
  }

  tutorNotification = () => {
    console.log('notify tutor');
    if (this.state.socketQuestion !== '') {
      return <Modal question={this.state.socketQuestion} />
    } else {
      return '';
    }
  }

  toggleSignUp = () => {
    this.setState({showSignup: !this.state.showSignup})
  }

  checkToken = () => {
    const checkToken = localStorage.getItem('token');
    if (checkToken) {
      return this.props.setToken(checkToken);
    } 
  }

  loginProcess = () => {
    if (!this.props.user.username) {
      return (<div className="navbar-item" onClick={this.toggleSignUp}>Sign up/Log in</div>)
    }
    else {
      return (
        <div className="navbar-component">
          <div className="navbar-item">{this.props.user.karma}<span role="img" className="navbar-icon" aria-label="karma"> 🙏</span></div>
          <div className="navbar-item">{this.props.user.credits}<img src={token} className="navbar-icon" width="18px" alt="tokens"/></div>
          <div className="navbar-item">
            <img src={this.props.user.profileBadge} width="50px" alt="profile-badge" onClick={() => this.setState({showMenu: !this.state.showMenu})}/>
            <p id="username">{this.props.user.username}</p>  
          </div>
        </div>
      )
    }
  }

  showSignupModal = () => {
    if (this.state.showSignup) {
      return <Login close={this.toggleSignUp}/>
    }
  }

  showMenu = () => {
    if (this.state.showMenu) {
      return <ProfileMenu/>
    }
  }


  render() {
    // Sending token on user refresh
    this.props.socket.emit('user online', {token: localStorage.getItem('token')});

    return(
      <div>
        <div>
          <div className="navbar">
            <div className="navbar-component">
              <div className="navbar-item"><Link to='/'><img src={logo} width="55px" alt="logo"/></Link></div>
              <div className="navbar-item"><Link to='/ask'>Ask for help.</Link></div>
              <div className="navbar-item"><Link to='/answer'>Help others.</Link></div>
            </div>
            {this.loginProcess()}
          </div>
          {this.showSignupModal()}
          {this.tutorNotification()}
        </div>
        {this.showMenu()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => ({
  setToken: (token) => dispatch(setToken(token)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
