import React, { Component } from 'react';
import './modal.scss';

class ModalEndChat extends Component {
  state = {
    feedback: 0,
    // questionid: this.props.modalRef.questionid,
    // expiration: Date.now() + 30
  }

  closesQuestion = () => {
    const token = localStorage.getItem('token');
    const body = {
      "karma": this.state.feedback,
      "credits": 50
    }

    fetch(`http://localhost:4000/questions/${this.props.questionId}/feedback`, {
      method: 'PUT',
      headers: {
        'Authorization' : 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(res=> console.log('question CLOSED', res))
  }

  chatFeedback = (e) => {
    e.preventDefault();
    // this.props.sendOffer(this.state) //Amber TTD: put feedback in here
    this.props.closeChatModal()
    this.closesQuestion();
    if (this.props.tutorOrLearner === 'tutor'){
      this.props.history.push('/answer');
    } else {
      this.props.history.push('/my-questions');
    }

  }

  setFeedback = (e, num) => {
    e.preventDefault();
    this.setState({feedback: num})
    console.log(e, this.state.feedback)
  }

  render() {
    if (this.props.tutorOrLearner === 'tutor') {
      return (
        <div className="backdrop">
          <div className="modal">
            <button class="button-close" onClick={()=>this.props.closeChatModal()}>X</button>
            <div>Thanks for being a tutor</div>
            <div>Keep on being awesome, We love you.</div>
            <form>
              <button class="button-primary" onClick={(e)=> this.chatFeedback(e)}>SUBMIT</button>
            </form>
          </div>
        </div>
      )
    } else {
      return (
        <div className="backdrop">
          <div className="modal">
            <button className="button-close" onClick={()=>this.props.closeChatModal()}>X</button>
            <h3>Hope your Tutor solved your question</h3>
            <div>Feel free to ask more questions or heck help out others if you feel confident!</div>
            <div>Please vote below on how you feel your Tutor did, Karma helps Tutors differencate themselves apart from others.</div>
            <form>
              <div className="modal-karma">
                <button className="button-karma" onClick={(e) => this.setFeedback(e, 0)}>No Karma</button>
                <button className="button-karma" onClick={(e) => this.setFeedback(e, 1)}><span>🙏</span></button>
                <button className="button-karma" onClick={(e) => this.setFeedback(e, 3)}><span>🙏🙏🙏</span></button>
              </div>
              <button class="button-primary" onClick={(e)=> this.chatFeedback(e)}>SUBMIT</button>
            </form>
          </div>
        </div>
      )
    }

  }
}

export default ModalEndChat;