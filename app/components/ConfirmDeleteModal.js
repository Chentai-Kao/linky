import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Clear from '@material-ui/icons/Clear';
import Button from 'react-bootstrap/Button';

class ConfirmDeleteModal extends React.Component {
  constructor(props) {
    super(props);

    this.show = this.show.bind(this);
    this.cancel = this.cancel.bind(this);
    this.confirm = this.confirm.bind(this);

    this.state = { showModal: false };
  }

  show() {
    this.setState({ showModal: true });
  }

  cancel() {
    this.setState({ showModal: false });
    if (this.props.cancel) {
      this.props.cancel();
    }
  }

  confirm() {
    this.setState({ showModal: false });
    if (this.props.confirm) {
      this.props.confirm();
    }
  }

  render() {
    return (
      <>
        <Button
          variant="link"
          className="text-secondary p-0"
          onClick={this.show}>
          <Clear />
        </Button>

        <Modal show={this.state.showModal} onHide={this.cancel}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>{this.props.description}</Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={this.cancel}>
              Cancel
            </Button>
            <Button variant="outline-primary" onClick={this.confirm}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

ConfirmDeleteModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirm: PropTypes.func,
  cancel: PropTypes.func,
};

export default ConfirmDeleteModal;
