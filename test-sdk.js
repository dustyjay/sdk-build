
const hostname = 'https://checkout.paga.com';

class PagaCheckout {
    static options = null;

    static setOptions(options) {
        PagaCheckout.options = options;
    }

    static openCheckout() {
        if (!PagaCheckout.options) {
            throw new Error(
                "Options not set. Please set options using setOptions() method."
            );
        }

        const {
            publicKey,
            amount
        } = PagaCheckout.options;

        if (!publicKey || !amount) {
            throw new Error("Incomplete options provided.");
        }

        // Initialize payment iframe
        createIframe(PagaCheckout.options);
    }
}

function createIframe(options) {
    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.setAttribute('allowtransparency', 'true')
    iframe.width = '100%'
    iframe.height = '100%'
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.zIndex = '5'
    iframe.style.background = 'rgba(0, 0, 0, 0.0)'
    iframe.style.outline = 'none'
    iframe.style.padding = 'none'
    iframe.style.border = 'none'

    // Set iframe source with search parameters
    const url = new URL(hostname)

    Object.keys(options).forEach((option) => {
        url.searchParams.set(camelToSnake(option), options[option]);
    });
    iframe.src = url.toString()

    //add close iframe listener
    iframe.addEventListener('load', function () {
        // Add event listener for messages received from the iframe
        window.addEventListener('message', function (event) {
            // Check if the event originated from the iframe and contains the close message
            if (event.origin === new URL(iframe.src).origin && event.data === 'close-iframe') {
                // Remove the iframe from the document
                if (iframe) {
                    try {
                        document.body.removeChild(iframe)
                    }catch (e){}
                }
            }
        })
    })

    // Add iframe to page
    document.body.appendChild(iframe)
}

function camelToSnake(camelCaseString) {
    return camelCaseString.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}
