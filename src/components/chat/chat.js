import React, { Component } from 'react';
import './chat.scss';
import './codeeditor.scss';

import logo from '../../assets/square-logo.png';

import { connect } from 'react-redux';
import { updateChatQuestion, updateKarma } from '../../redux/actions.js';

import CodeEditor from './codeeditor';
import ChatMessages from './chat-messages';

import Overlay from './overlay';
import ModalEndChat from './../modal/modal-end-chat';

class Chat extends Component {

  state = {
    roomId: this.props.location.pathname.split('/')[2],
    questionId: this.props.location.pathname.split('/')[3],
    tutorOrLearner: this.props.location.pathname.split('/')[4],
    showFeedbackModal: false,
    tutorJoined: false,
    minutes: 0,
    seconds: 0,
    secondsString: '00',
    overTime: 'white',
    clockReset: true,
    timerId: null,
  }

  componentDidMount() {
    this.props.socket.emit('join room', this.state.roomId)

    // Notify that user is online (since navbar is not render)
    this.props.socket.emit('user online', {token: localStorage.getItem('token')});

    this.props.socket.on('join room', (participants) => {
      if (participants === 2) {

        if (this.state.clockReset) {
          this.setState({tutorJoined: true}, () => this.startTimer());
        }
        this.setState({clockReset:false})

        if (this.state.tutorOrLearner === 'learner' && this.props.question.learner === this.props.user.user_id) { // added additional check so learner exists
          const targetOffer = this.props.offers.filter(offer => offer.offer_id === this.props.question.answered_by); // offers prop only exists for the learner
          this.setState({targetTutor: targetOffer[0].tutor});
          sessionStorage.setItem('targetOffer', targetOffer);
          this.props.socket.emit('question info', {
            question: this.props.question,
            tutor: sessionStorage.getItem('targetOffer')
          })
        }
      } else {
        this.setState({tutorJoined: false});
      }
    });

    // STORE THE QUESTION INFO TO THE REDUX STATE AND THE CHATROOM
    this.props.socket.on('question info', (data) => {
      this.props.updateChatQuestion(data);
    })

    //HANG-UP
    this.props.socket.on('hang up', () => {this.setState({showFeedbackModal: true})})
  }

  startTimer = () => {
    if (!sessionStorage.getItem('timeStarted')){
      sessionStorage.setItem('timeStarted', Date.now());
    }

    if (sessionStorage.getItem('timeStarted')) {
      const newTime = Date.now() - sessionStorage.getItem('timeStarted');
      const secs = Number(((newTime % 60000) / 1000).toFixed(0));
      const mins= Math.floor(newTime/ 60000);
      this.setState({
        minutes: mins,
        seconds: secs,
      })
    }

    const intervalId = setInterval( () => {
      this.setState({seconds: this.state.seconds + 1})
      if (this.state.seconds < 10 ) this.setState({secondsString: '0' + this.state.seconds})
      else this.setState({secondsString: this.state.seconds})
      if (this.state.seconds === 60) {
        this.setState({ seconds: 0, minutes: this.state.minutes + 1, secondsString: '00'})
      }
      if (this.state.minutes === 15) {
        this.setState({ overTime: 'red'});
      }
    }, 1000)

    this.setState({ timerId: intervalId });

  }

  renderOverlay = () => {
    if (this.state.tutorOrLearner === 'learner' && !this.state.tutorJoined) {
      return <Overlay closeOverlay={(counter) => {
        clearInterval(counter);
        if (this.props.question.learner) { // prevents chat from crashing when the timer runs out
          const targetOffer = this.props.offers.filter(offer => offer.offer_id === this.props.question.answered_by)
          this.props.history.goBack()
          this.props.socket.emit('cancel call', targetOffer[0].tutor)
        }
      }
      }/>
    }
  }

  hangUp = () => {
    this.props.socket.emit('hang up', {roomId: this.state.roomId});
  }

  updateKarma = (karma) => {
    this.props.socket.emit('update karma', {tutor: this.state.targetTutor, karma: karma })
  }

  showEndChatModal = () => {
    if (this.state.showFeedbackModal) {      
      sessionStorage.removeItem('timeStarted');
      sessionStorage.removeItem('targetOffer');
      return <ModalEndChat updateKarma={this.updateKarma} closeChatModal={() => this.setState({showFeedbackModal: false})} history={this.props.history} questionId={this.state.questionId} tutorOrLearner={this.state.tutorOrLearner}/>
    }
  }

  componentWillUnmount() {
    this.props.socket.removeListener('join room');
    this.props.socket.removeListener('question info');
    this.props.socket.removeListener('hang up');
    clearInterval(this.state.timerId);
  }

  render() {
    return(
      <div className="chat-component">

        {this.state.tutorJoined ? null : this.renderOverlay()}

        <div className="chat-header">
          <div className="left">
            <img src={logo} width="40px" alt="logo"/>
            <p>Live Help Session</p>
          </div>
          <div className="right">
            <h3 id="timer" style={{color: this.state.overTime}}>{this.state.minutes}:{this.state.secondsString}</h3>
            <button className="end-call-button" onClick={this.hangUp}>End Call</button>        
          </div>
        </div>

        {/* <div className="chat-info">
          <h1>{this.props.question.title}</h1>
          <p>{this.props.question.description}</p>
        </div> */}

        <div className="chat-body">
          <CodeEditor socket={this.props.socket} room={this.state.roomId}/>
          <ChatMessages socket={this.props.socket} room={this.state.roomId} />
        </div>

        <div className="chat-footer">
          <p>Troubleshooting - I need to report a problem</p>
        </div>

        {this.showEndChatModal()}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  question: state.question,
  offers: state.offers,
  tutors: state.tutors,
})

const mapDispatchToProps = (dispatch) => ({
  updateChatQuestion: (question) => dispatch(updateChatQuestion(question)),
  updateKarma: (karma) => dispatch(updateKarma(karma))
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat);