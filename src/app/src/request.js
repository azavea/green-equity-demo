export default function requestBodyForStateAndAgency(state, category) {
    return {
        scope: 'place_of_performance',
        geo_layer: 'state',
        filters: {
            time_period: [
                {
                    start_date: '2008-01-01',
                    end_date: '2024-01-01',
                },
            ],
            def_codes: ['1', 'Z'],
            agencies: agenciesForCategory(category),
        },
        subawards: false,
        geo_layer_filters: [state],
    };
}

function makeAgency(name) {
    const agency = {
        type: 'awarding',
        tier: 'subtier',
        name: name,
    };
    if (name.startsWith('DOA - ')) {
        agency.name = name.substring(6);
        agency.toptier_name = 'Department of Agriculture';
    }
    if (name.startsWith('DOI - ')) {
        agency.name = name.substring(6);
        agency.toptier_name = 'Department of Interior';
    }
    if (name.startsWith('DOT - ')) {
        agency.name = name.substring(6);
        agency.toptier_name = 'Department of Transportation';
    }
    return agency;
}

function agenciesForCategory(category) {
    switch (category) {
        case 'CLIMATE':
            return [
                'Bureau of Reclamation',
                'Natural Resources Conservation Service',
                'Bureau of Indian Affairs',
                'State and Tribal Assistance Grants', // EPA
                'Department-Wide Programs', // Interior
                'Hazardous Substance Superfund',
                'Forest Service',
                'Federal Emergency Management Agency',
                'National Oceanic and Atmospheric Administration',
                'Energy Efficiency and Renewable Energy',
                'Indian Health Service',
                'Nuclear Energy',
                'United States Fish and Wildlife Service',
                'Environmental Programs and Management',
                'United States Geological Survey',
                'DOI - Office of the Secretary',
            ].map(makeAgency);
        case 'CIVIL WORKS':
            return [makeAgency('Corps of Engineers - Civil Works')];
        case 'TRANSPORTATION':
            return [
                'Federal Aviation Administration',
                'Federal Highway Administration',
                'Federal Transit Administration',
                'Real Property Activities',
                'Maritime Administration',
                'DOT - Office of the Secretary',
                'Federal Motor Carrier Safety Administration',
                'Energy Efficiency and Renewable Energy', // electric vehicles
            ].map(makeAgency);
        case 'BROADBAND':
            return [
                'Rural Utilities Service',
                'National Telecommunications and Information Administration',
            ].map(makeAgency);
        default:
            return [
                'Denali Commission',
                'DOA - Office of the Secretary',
                'Delta Regional Authority',
            ].map(makeAgency);
    }
}
