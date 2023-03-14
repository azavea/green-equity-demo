import { Box, Link, List, ListItem, Text } from '@chakra-ui/react';

import { getAgenciesForCategory } from '../util';
import { AgencyTier, Category } from '../enums';

import lastUpdated from '../data/lastUpdated.json';
import { Agency } from '../types/api';

export default function Attribution() {
    const date = new Date(lastUpdated.lastUpdated);

    return (
        <Box ml={2} maxWidth='650px'>
            <details style={{ alignSelf: 'start' }}>
                <summary>
                    <h3>Methodology</h3>
                </summary>
                <Text fontSize={12} pt={2}>
                    Data were downloaded from the{' '}
                    <Link href='https://api.usaspending.gov'>
                        https://api.usaspending.gov
                    </Link>{' '}
                    API operated by the U.S. Department of the Treasury, Bureau
                    of the Fiscal Service. Data updates are anticipated to be
                    made on an ad hoc basis. (Last update:{' '}
                    {date.toLocaleDateString()})
                </Text>
                <Text fontSize={12} pt={1}>
                    The query made to usaspending.gov requests the aggregated
                    amount of awards performed in a state with a Disaster
                    Emergency Fund Code of "Z" or "1" (relating to the BIL). The
                    populations for calculating per capita figures also come
                    from usaspending.gov.
                </Text>
                <Text fontSize={12} pt={1}>
                    The following advice from the General Services
                    Administration's{' '}
                    <Link href='https://d2d.gsa.gov/report/bipartisan-infrastructure-law-bil-maps-dashboard'>
                        Bipartisan Infrastructure Law (BIL) Maps Dashboard
                    </Link>
                    , which consumes the same data source, is informative,
                    despite also including announced funding: "All announcement
                    data represented on these maps, including award and project
                    locations and funding amounts, is preliminary and
                    non-binding. Awards may be contingent on meeting certain
                    requirements. Data represents announced funding (formula and
                    discretionary) as of January 13, 2023. This is a small
                    subset of what the Bipartisan Infrastructure Law will fund
                    and is not intended to be comprehensive."
                </Text>
                <Text fontSize={12} pt={1}>
                    Assignments of grant-making agencies to categories
                    (Broadband, Climate, Transportation, and Other) were modeled
                    on the assignments shown in the .xlsx file included with
                    that dashboard.
                </Text>
                {Object.values(Category)
                    .filter(c => c !== Category.ALL)
                    .map(category => (
                        <AgencyList
                            key={category.toString()}
                            category={category}
                        />
                    ))}
            </details>
        </Box>
    );
}

function AgencyList({ category }: { category: Category }) {
    const niceAgencyName = (agency: Agency) => {
        if (agency.tier === AgencyTier.SUB && agency.toptier_name) {
            return agency.toptier_name + ' - ' + agency.name;
        }
        return agency.name;
    };

    return (
        <Box mt={2}>
            <Text as='b' fontSize={12}>
                Agencies for {category.toString()} spending:
            </Text>
            <List fontSize={12} pt={1}>
                {getAgenciesForCategory(category)?.map(agency => (
                    <ListItem key={agency.name} ml={2}>
                        {niceAgencyName(agency)}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
