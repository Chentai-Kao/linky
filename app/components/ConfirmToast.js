import React from 'react';

import { toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure({
  hideProgressBar: false,
  closeOnClick: false,
  autoClose: 2000,
  draggable: false,
  transition: Slide,
});

class ConfirmToast extends React.Component {
  static info(text) {
    toast(text);
  }

  static success(text) {
    toast(text, { type: 'success' });
  }

  static error(text) {
    toast(text, { type: 'error' });
  }
}

export default ConfirmToast;
