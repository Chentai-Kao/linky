import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

import ConfirmToast from './ConfirmToast';
import { apiPut, apiDelete } from '../lib/apiHelper';

class MemberRequests extends React.Component {
  constructor(props) {
    super(props);

    this.approve = this.approve.bind(this);
    this.decline = this.decline.bind(this);
  }

  async approve(event) {
    await this.save(event, true);
  }

  async decline(event) {
    await this.save(event, false);
  }

  async save(event, isApproved) {
    const {
      dataset: { userid },
    } = event.currentTarget;
    const userId = parseInt(userid, 10);
    if (isApproved) {
      const data = { userId, status: 'member' };
      await apiPut('/users', data);
      ConfirmToast.success(`The request is approved.`);
    } else {
      await apiDelete(`/users/${userId}`);
      ConfirmToast.success(`The request is deleted.`);
    }
    await this.props.reloadUsers();
  }

  render() {
    const { memberRequests } = this.props;

    if (memberRequests.length === 0) {
      return <p className="text-secondary text-center">(no member requests)</p>;
    }

    const rows = memberRequests.map((user, index) => (
      <div key={index} className="row">
        <p className="col-3 text-break d-flex align-items-center">
          {`${user.first_name} ${user.last_name}`}
        </p>
        <p className="col-5 text-break d-flex align-items-center">
          {user.email}
        </p>
        <p className="col-4 text-break d-flex align-items-center">
          <Button
            variant="outline-danger"
            data-userid={user.id}
            onClick={this.decline}>
            Reject
          </Button>
          <Button
            variant="outline-success"
            className="ml-4"
            data-userid={user.id}
            onClick={this.approve}>
            Approve
          </Button>
        </p>
      </div>
    ));

    return (
      <div className="container">
        <div className="row">
          <p className="col-3 text-secondary font-weight-bold text-break">
            Name
          </p>
          <p className="col-5 text-secondary font-weight-bold text-break">
            Email
          </p>
          <p className="col-4 text-secondary font-weight-bold text-break">
            Approve?
          </p>
        </div>

        {rows}
      </div>
    );
  }
}

MemberRequests.propTypes = {
  memberRequests: PropTypes.array.isRequired,
  reloadUsers: PropTypes.func.isRequired,
};

export default MemberRequests;
