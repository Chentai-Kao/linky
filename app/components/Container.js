import React from 'react';
import PropTypes from 'prop-types';

class Container extends React.Component {
  render() {
    const style = {
      maxWidth: '1000px',
    };
    return (
      <div className="mx-auto p-1" style={style}>
        {this.props.children}
      </div>
    );
  }
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Container;
