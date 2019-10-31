import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ConfirmToast from './ConfirmToast';
import { apiGetJson, apiPut, apiDelete } from '../lib/apiHelper';

class Members extends React.Component {
  constructor(props) {
    super(props);

    this.onStatusChange = this.onStatusChange.bind(this);

    this.reloadMe();

    this.state = {
      me: null,
    };
  }

  async reloadMe() {
    const { me } = await apiGetJson('/me');
    if (me) {
      this.setState({ me });
    }
  }

  async removeUser(userId) {
    await apiDelete(`/users/${userId}`);
    ConfirmToast.success(`The user is deleted.`);
    this.props.reloadUsers();
  }

  async onStatusChange(event) {
    const {
      value,
      dataset: { userid },
    } = event.target;
    const userId = parseInt(userid, 10);
    const data = { userId, status: value };
    await apiPut('/users', data);
    ConfirmToast.success(`Member status is updated.`);
    await this.props.reloadUsers();
  }

  render() {
    const { me } = this.state;
    const { members } = this.props;

    if (!me || members.length === 0) {
      return <p className="text-secondary text-center">(no members)</p>;
    }

    const statusSelectStyle = {
      maxWidth: '150px',
    };
    const deleteButtonStyle = {
      position: 'absolute',
      right: 0,
    };
    const rows = members.map((user, index) => {
      const statusComponent =
        me.status === 'admin' && user.id !== me.id ? (
          <Form.Control
            as="select"
            data-userid={user.id}
            onChange={this.onStatusChange}
            defaultValue={user.status}
            style={statusSelectStyle}>
            <option>admin</option>
            <option>member</option>
          </Form.Control>
        ) : (
          <span>{user.status}</span>
        );

      return (
        <div key={index} className="row">
          <p className="col-4 text-break d-flex align-items-center">
            {`${user.first_name} ${user.last_name}`}
          </p>
          <p className="col-5 text-break d-flex align-items-center">
            {user.email}
          </p>
          <p className="col-3 text-break d-flex align-items-center">
            {statusComponent}

            <span style={deleteButtonStyle}>
              <ConfirmDeleteModal
                title="Confirm deletion"
                description={`Are you sure you want to delete user ${user.email}?`}
                confirm={() => this.removeUser(user.id)}></ConfirmDeleteModal>
            </span>
          </p>
        </div>
      );
    });

    return (
      <div className="container">
        <div className="row">
          <p className="col-4 text-secondary font-weight-bold text-break">
            Name
          </p>
          <p className="col-5 text-secondary font-weight-bold text-break">
            Email
          </p>
          <p className="col-3 text-secondary font-weight-bold text-break">
            Status
          </p>
        </div>

        {rows}
      </div>
    );
  }
}

Members.propTypes = {
  members: PropTypes.array.isRequired,
  reloadUsers: PropTypes.func.isRequired,
};

export default Members;
