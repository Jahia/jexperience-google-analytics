// Listen for the event.\n" +
document.addEventListener('displayWemVariant', function (event) {
    var variantInfo = event.detail;
    if (variantInfo) {
        // Make sure GA module is set
        if (typeof ga !== 'undefined') {
            let type = variantInfo.type + (variantInfo.variantType ? ('_' + variantInfo.variantType) : '');
            let label = (variantInfo.wrapper.displayableName ? variantInfo.wrapper.displayableName.trim().substring(0, 65) : variantInfo.wrapper.name) +
                ' - ' +
                (variantInfo.displayableName ? variantInfo.displayableName.trim().substring(0, 65) : variantInfo.name);

            // Sending an event
            ga('send', 'event', type, 'Display', label, 5, true);
        }
    }
}, true);