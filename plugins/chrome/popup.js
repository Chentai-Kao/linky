$(() => {
  const $form = $('#form');
  const $dashboardButton = $('#dashboard');
  const $settingsButton = $('#settings');
  const $magicInputField = $('#magic');

  // hide everything initially
  $dashboardButton.hide();
  $settingsButton.hide();
  $form.hide();

  // go to dashboard page when 'dashboard' button is clicked
  $dashboardButton.click(() => {
    chrome.storage.sync.get(['magicKey'], (data) => {
      const { host } = JSON.parse(atob(data.magicKey));
      window.open(host, '_blank');
    });
  });

  // display form when 'settings' button is clicked
  $settingsButton.click(() => {
    $dashboardButton.hide();
    $settingsButton.hide();
    $form.show();
  });

  // get stored data and set up popup
  chrome.storage.sync.get(['magicKey'], (data) => {
    const { magicKey } = data;
    prefillInfo(magicKey);
    checkInfoCompleteness(magicKey);
  });

  // on form submit, save info to local storage
  $form.submit((event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target.elements;
    const magicKey = form.magic.value.trim();
    const isFormValid = checkMagicKey(magicKey);
    $magicInputField.toggleClass('warn', !isFormValid);
    saveInfo(form);
    checkInfoCompleteness(magicKey);
  });

  function prefillInfo(magicKey) {
    $magicInputField.val(magicKey);
  }

  function checkMagicKey(magicKey) {
    try {
      const { host, email, key } = JSON.parse(atob(magicKey));
      return host && email && key;
    } catch (error) {
      return false;
    }
  }

  function saveInfo(form) {
    const magicKey = form.magic.value.trim();
    const info = { magicKey };
    chrome.storage.sync.set(info);
  }

  function checkInfoCompleteness(magicKey) {
    const isInfoComplete = checkMagicKey(magicKey);
    $form.toggle(!isInfoComplete);
    $magicInputField.toggleClass('warn', !isInfoComplete);
    $dashboardButton.toggle(isInfoComplete);
    $settingsButton.toggle(isInfoComplete);
  }
});
