import React from 'react';
import './navbar.scss';
import { connect } from 'react-redux';
import { setToken, logout } from '../../redux/actions.js';
import Login from '../log-in/log-in.js';
import logo from '../../assets/square-logo.png';
import token from '../../assets/token.png';
import { Link, NavLink } from "react-router-dom";
import ProfileMenu from './profile-menu';
import TutorNotification from '../modal/modal-tutor-notification.js';
import titleImage from '../../assets/hero-logo.png';

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSignup: false,
      openModal: true,
      showMenu: false,
      socketQuestion: '',
      questionTitle: ''
    }
    this.updateInput = this.updateInput.bind(this);
  }

  componentDidMount = () => {
    this.checkToken();
    this.props.socket.on('push tutor', (question) => {
      this.setState({socketQuestion: question}, () => this.tutorNotification() );
    })
    this.props.socket.on('cancel call', () => {
      this.setState({socketQuestion: ''}, () => this.tutorNotification() );
    })
  }

  tutorNotification = () => {
    if (this.state.socketQuestion !== '') {
      return <TutorNotification question={this.state.socketQuestion} />
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
      return (<div className="navbar-item" onClick={this.toggleSignUp}><span className="log-in">Log In</span><button className="button-primary">Sign Up</button></div>)
    }
    else {
      return (
        <div className="navbar__component">
          <div className="navbar-item">
            {this.props.user.karma}
            <span role="img" className="navbar-icon" aria-label="karma"> 🙏</span>
          </div>
          <div className="navbar-item">
            {this.props.user.credits}
            <img src={token} className="navbar-icon" width="18px" alt="tokens"/>
          </div>
          <div className="navbar__userInfo">
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

  toggleProfileMenu = () => {
    this.setState({showMenu: !this.state.showMenu})
  }

  showMenu = () => {
    if (this.state.showMenu) {
      return <ProfileMenu toggleMenu={this.toggleProfileMenu}logout={this.props.logout}/>
    }
  }

  landingPageNavbar = () => {
    if (this.props.landingPage) {
      return(
        <div className="landing-page-body">

          <img src={titleImage} alt="JS QUESTIONS"/>
          <form>
            <input id="searchTerm" type="text" placeholder="What do you need help with?" onChange={this.updateInput}/>
            <NavLink to={{pathname: '/ask', state: {title: this.state.questionTitle}}} className="navbar-item searchTerm-button">?</NavLink>
          </form>
          <h3>For when Stack Overflow and the Internet just aren't enough.</h3>
          <h2>Want to help others?</h2>
        </div>
      )
    }
  }

  updateInput = (e) => {
    const searchTerm = document.getElementById("searchTerm").value;
    this.setState({questionTitle: searchTerm});
  }


  render() {
    // Sending token on user refresh
    this.props.socket.emit('user online', {token: localStorage.getItem('token')});

    // Apply different class depending if we are in the landing page or not
    let classNavbarBox = '';
    if (this.props.landingPage) classNavbarBox='navbar-box__landingPage';
    else classNavbarBox='navbar-box';

    return(
      <div className={classNavbarBox}>
        <div className="navbar">
          <div className="navbar__component">
            <div className="navbar-item"><Link to='/'><img src={logo} width="55px" alt="logo"/></Link></div>
            <div className="navbar-item navbar__underline"><Link className="navbar__link" to='/ask'>Ask for help.</Link></div>
            <div className="navbar-item navbar__underline"><Link className="navbar__link" to='/answer'>Help others.</Link></div>
          </div>
          {this.loginProcess()}
          {this.showMenu()}
        </div>
        {this.landingPageNavbar()}
        {this.showSignupModal()}
        {this.tutorNotification()}
        
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => ({
  setToken: (token) => dispatch(setToken(token)),
  logout: () => dispatch(logout()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
