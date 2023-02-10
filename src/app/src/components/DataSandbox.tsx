import { useEffect, useState } from 'react';
import { Container, Input, Select } from '@chakra-ui/react';
import requestBodyForStateAndAgency from '../request';

const SPENDING_ENDPOINT = 'https://api.usaspending.gov/api/v2/search/spending_by_geography/';


export default function DataSandbox() {
    const [stateOrTerritory, setStateOrTerritory] = useState('MS');
    const [category, setCategory] = useState('CLIMATE');
    const [dataDump, setDataDump] = useState('Loading ...')

    useEffect(() => {
        setDataDump('Loading ...');
        fetch(
            SPENDING_ENDPOINT,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBodyForStateAndAgency(stateOrTerritory, category)),
            }
        )
        .then((response) => response.json())
        .then((data) => data.results.length ? setDataDump(data.results[0].per_capita) : setDataDump("No spending."));
        // TODO: "Other" should eventually take the difference of all spending, regardless
        // of category, minus known categories, to account for subagencies that have not
        // been hardcoded to map to a category
    }, [stateOrTerritory, category]);

    return (
        <>
            <Container maxWidth='650px'>
                <Input
                    onChange={({ target: { value } }) => setStateOrTerritory(value)}
                    placeholder='State (abbrev)'
                    value={stateOrTerritory}
                    size='sm'
                />
                <Select onChange={({ target: { value } }) => setCategory(value)} value={category}>
                    <option value='CLIMATE'>Climate, Energy, and the Environment</option>
                    <option value='BROADBAND'>Broadband</option>
                    <option value='CIVIL WORKS'>Civil Works</option>
                    <option value='TRANSPORTATION'>Transportation</option>
                    <option value='OTHER'>Other</option>
                </Select>
            </Container>
            <Container maxWidth='650px'>
                {`Per capita spending for ${stateOrTerritory}: $${dataDump}`}
            </Container>
        </>
    );
}
