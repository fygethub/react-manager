import React from 'react';

export class BaseStyle extends React.Component {
  constructor(props) {
    super(props);

    this.focus = this.focus.bind(this);
  }

  focus() {

  }

  render() {
    return (
      <div className="base-style">
        {this.props.children}
      </div>
    )
  }

}


export class EditImg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_tools: false,
      top: 0,
      left: 0,
    };
    this.toggleTools = this.toggleTools.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  toggleTools() {
    this.setState({
      show_tools: !this.state.show_tools,
    })
  }

  inputChange(e) {
    e.stopPropagation();
    console.log(e.target.name);
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  render() {
    const style = {
      width: 100,
      height: 100,
      zIndex:1,
      position: 'absolute',
      top: this.state.top - 0,
      left: this.state.left - 0,
    };
    return <div className="wrap_content" onClick={this.toggleTools} style={style}>
      {this.props.children}
      {this.state.show_tools && <div className="imgTools" onClick={(e) => e.stopPropagation()}>
        <input type="text" name="top" value={this.state.top} onChange={this.inputChange}/>
        <input type="text" name="left" value={this.state.left} onChange={this.inputChange}/>
      </div>}
    </div>
  }

}
