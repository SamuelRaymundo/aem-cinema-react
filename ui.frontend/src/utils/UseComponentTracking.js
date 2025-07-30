import {sendComponentLoadedEvent} from './SendComponentLoadedEvent'

export const trackComponent = (id, dataLayer) => {
    if (id && dataLayer) {
        sendComponentLoadedEvent(id, dataLayer);
    }
};