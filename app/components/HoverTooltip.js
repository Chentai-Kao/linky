import React from 'react';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import PropTypes from 'prop-types';

class HoverTooltip extends React.Component {
  render() {
    const { children, text, direction } = this.props;
    const tooltip = <Tooltip>{text}</Tooltip>;
    return (
      <OverlayTrigger placement={direction} overlay={tooltip}>
        {children}
      </OverlayTrigger>
    );
  }
}

HoverTooltip.propTypes = {
  direction: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default HoverTooltip;
