import React, {Component, Fragment} from 'react';
import { Link } from 'react-router-dom';
import '../static/header.css';
import $ from 'jquery';
import { Button} from 'antd';


class Header extends Component {

  constructor(props) {
    super(props);
    this.handleclick = this.handleclick.bind(this);
    this.state=({
      data : false
    })
    
}
  componentDidMount(){
    $(window).on("scroll", function() {
      if($(window).scrollTop() > 50) {
        $("header").addClass("active");
      } else {
        $("header").removeClass("active");
      }
    })
  }

  handleclick(){
    console.log("hello")
    this.setState({
      data : true
    })
    this.props.showmodal(this.state.data)
  }
   render() {

     return (
      <header>
        <div className="container">
          <div className="logo">
            <h1><a href='/'> Innovaccer</a></h1>
          </div>

          <input type="checkbox" id="sidebar-toggle" hidden={true}/>
          <label htmlFor="sidebar-toggle" className="hamburger"><span></span></label>

          <div className="sidebar">
            <nav className="sidebar-nav">
              <ul>
                <li> <a href='/'> Summergeek-Task</a></li>
              </ul>
            </nav>
            <div className="accent"></div>
          </div>
          <div className="sidebar-shadow" id="sidebar-shadow"></div>

          {/* Desktop Navigation Menu */}
          <nav className="desktop-nav">
            <ul>
            <li><a href='/'> Summergeek-Task</a></li>
            </ul>
          </nav>
        </div>
      </header>

     );
   }
 }
export default Header;
