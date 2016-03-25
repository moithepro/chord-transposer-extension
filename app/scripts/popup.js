/* sends a message to the content script*/
function sendMessage (msg, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id, {
        from: 'popup',
        subject: msg
      },
      function (response) {
        if (callback) {
          callback(response)
        }
      }
    )
  })
}

/* Update the relevant fields with the new data */
function setDOMInfo (data) {
  if (data.converted) {
    $('body').attr('class', 'transpose')

    if (data.transpose !== null) {
      if (data.transpose > 0) {
        data.transpose = '+' + data.transpose
      }
      $('section.transpose span').text(data.transpose)
    }
  } else if (data.initialized) {
    $('body').attr('class', 'convert')
  } else {
    $('body').attr('class', 'selector')
  }
}

/* Once the DOM is ready... */
window.addEventListener('DOMContentLoaded', function () {
  /* ...query for the active tab... */
  /* ...and send a request for the DOM info... */
  sendMessage('DOMInfo', setDOMInfo)

  /* let every button in the popup request an action from the content*/
  $('button').click(function (e) {
    sendMessage($(e.currentTarget).data('function'), setDOMInfo)
  })
})
