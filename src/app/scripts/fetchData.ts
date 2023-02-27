import fetchPerCapitaSpendingData from './fetchPerCapitaSpendingData';
import fetchStatesData from './fetchStatesData';

async function fetchData() {
    await Promise.all([fetchStatesData(), fetchPerCapitaSpendingData()]);
}

fetchData();
