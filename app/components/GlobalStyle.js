import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* <input> placeholder text color */
  .form-control::-webkit-input-placeholder { color: #aaa; }  /* WebKit, Blink, Edge */
  .form-control:-moz-placeholder { color: #aaa; }  /* Mozilla Firefox 4 to 18 */
  .form-control::-moz-placeholder { color: #aaa; }  /* Mozilla Firefox 19+ */
  .form-control:-ms-input-placeholder { color: #aaa; }  /* Internet Explorer 10-11 */
  .form-control::-ms-input-placeholder { color: #aaa; }  /* Microsoft Edge */

  a,
  a:hover,
  a:active {
    text-decoration: none
  }
`;

export default GlobalStyle;
