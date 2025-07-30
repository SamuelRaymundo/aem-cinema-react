export const sendComponentLoadedEvent = (
    id,
    dataLayer
) => {
    if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
    }

    if (dataLayer && id) {
        window.adobeDataLayer.push({
            component: {
                [id]: dataLayer[id],
            },
            event: "cmp:loaded",
        });
    }
};