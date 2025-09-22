
const FOODCOURT_HOST_NAME = 'http://localhost:8080';

class FoodCourtOrder {
  static options = null;

  static setOptions (options) {
    FoodCourtOrder.options = options;
  }

  static startOrder () {
    if (!FoodCourtOrder.options) {
      console.warn(
        "Options not set. Please set options using setOptions() method."
      );
    }

    const {
      publicKey,
      user,
      phone,
      onCompleteOrder
    } = FoodCourtOrder.options;

    if (!publicKey || !phone || !user.firstname || !user.lastname || typeof onCompleteOrder !== 'function') {
      console.error("Incomplete options provided.");
    }

    // Initialize payment iframe
    createIframe(FoodCourtOrder.options);
  }
}

window.FoodCourtOrder = FoodCourtOrder

function createIframe (options) {
  // Create iframe
  const iframe = document.createElement('iframe')
  iframe.setAttribute('allowtransparency', 'true')
  iframe.width = '70%'
  iframe.height = '80%'
  iframe.style.position = 'fixed'
  iframe.style.top = '10%'
  iframe.style.left = '15%'
  iframe.style.zIndex = '5'
  iframe.style.background = 'rgba(0, 0, 0, 0.0)'
  iframe.style.outline = 'none'
  iframe.style.padding = 'none'
  iframe.style.border = 'none'

  // Set iframe source with search parameters
  const url = new URL(FOODCOURT_HOST_NAME)
  const { onCompleteOrder, ...dataOptions } = options

  Object.keys(dataOptions).forEach((option) => {
    url.searchParams.set(camelToSnake(option), dataOptions[option]);
  });
  iframe.src = url.toString()


  //add close iframe listener
  iframe.addEventListener('load', function () {
    console.log('loaded iframe')
    // Add event listener for messages received from the iframe
    window.addEventListener('message', function (event) {
      // Check if the event originated from the iframe and contains the close message
      // Verify the origin for security
      if (event.origin !== new URL(iframe.src).origin) {
        console.log('wrong URL source')
        return;
      }

      // send out data, onCompleteOrder
      if (event.data && event.data.type === 'parentCallback') {
        console.log('parentCallback', event)
        const { callbackName, data } = event.data;
        if (callbackName === 'onCompleteOrder') {
          // Execute the desired function in the iframe
          onCompleteOrder(data);
          console.log('complete callback called in iframe', data)
        }
      }

      // close iframe
      if (event.data === 'close-iframe') {
        console.log('close', event)
        // Remove the iframe from the document
        if (iframe) {
          try {
            document.body.removeChild(iframe)
            console.log('iframe closed')
          } catch (e) { }
        }
      }
    })
  })

  // Add iframe to page
  document.body.appendChild(iframe)
}

function camelToSnake (camelCaseString) {
  return camelCaseString.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}
