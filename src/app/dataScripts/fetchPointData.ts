import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { spendingApiUrl } from '../src/constants';
import { httpsRequestJson } from './httpsRequest';
import { dataDir } from './nodeConstants';
import { existsSync } from 'node:fs';

type DownloadResponse = {
    status_url: string;
    file_url: string;
};

enum RequestStatus {
    READY = 'ready',
    RUNNING = 'running',
    FAILED = 'failed',
    FINISHED = 'finished',
}

type StatusResponse = {
    status: RequestStatus;
    message: string;
};

const filename = path.join(dataDir, 'pointData.zip');

async function fetchPointdata() {
    try {
        console.log('Requesting point data');

        if (existsSync(filename)) {
            console.warn(
                ' Skipping point data because the file already exists.'
            );
            return;
        }

        const { status_url, file_url } =
            await httpsRequestJson<DownloadResponse>({
                url: `${spendingApiUrl}/download/awards/`,
                options: { method: 'POST' },
                body: JSON.stringify({
                    // example filters
                    filters: {
                        agencies: [
                            {
                                type: 'awarding',
                                tier: 'toptier',
                                name: 'Department of Agriculture',
                            },
                        ],
                        keywords: ['Defense'],
                    },
                }),
            });

        await waitForReadyStatus(status_url);
        await saveCsv(file_url);
    } catch (error) {
        console.error(error);
    }
}

function waitForReadyStatus(status_url: string) {
    let retriesLeft = 10;

    return new Promise<void>((resolve, reject) => {
        const queueRequest = () => {
            if (retriesLeft === 0) {
                reject('Too many retries');
                return;
            }

            retriesLeft -= 1;

            setTimeout(async () => {
                process.stdout.write('  Current status: ');

                const { status, message } =
                    await httpsRequestJson<StatusResponse>({ url: status_url });

                process.stdout.write(`${status}\n`);

                switch (status) {
                    case RequestStatus.FAILED:
                        reject(message);
                        break;

                    case RequestStatus.FINISHED:
                        resolve();
                        break;

                    default:
                        queueRequest();
                }
            }, 30000);
        };

        queueRequest();
    });
}

async function saveCsv(file_url: string) {
    const file = await fs.open(filename, 'w');

    await new Promise<void>((resolve, reject) => {
        const request = https.request(file_url, response => {
            response.on('data', (chunk: Buffer) => {
                if (chunk) {
                    file.write(chunk);
                }
            });

            response.on('end', () => {
                file.close();
                resolve();
            });
        });

        request.on('error', error => reject(error));
        request.end();
    });
}

fetchPointdata();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum Columns {
    ASSISTANCE_AWARD_UNIQUE_KEY = 'assistance_award_unique_key',
    AWARD_ID_FAIN = 'award_id_fain',
    AWARD_ID_URI = 'award_id_uri',
    SAI_NUMBER = 'sai_number',
    //   DISASTER_EMERGENCY_FUND_CODES = 'disaster_emergency_fund_codes',
    OUTLAYED_AMOUNT_FUNDED_BY_COVID = 'outlayed_amount_funded_by_COVID-19_supplementals',
    OBLIGATED_AMOUNT_FUNDED_BY_COVID = 'obligated_amount_funded_by_COVID-19_supplementals',
    AWARD_LATEST_ACTION_DATE = 'award_latest_action_date',
    AWARD_LATEST_ACTION_DATE_FISCAL_YEAR = 'award_latest_action_date_fiscal_year',
    TOTAL_OBLIGATED_AMOUNT = 'total_obligated_amount',
    INDIRECT_COST_FEDERAL_SHARE_AMOUNT = 'indirect_cost_federal_share_amount',
    TOTAL_NON_FEDERAL_FUNDING_AMOUNT = 'total_non_federal_funding_amount',
    TOTAL_FUNDING_AMOUNT = 'total_funding_amount',
    TOTAL_FACE_VALUE_OF_LOAN = 'total_face_value_of_loan',
    TOTAL_LOAN_SUBSIDY_COST = 'total_loan_subsidy_cost',
    AWARD_BASE_ACTION_DATE = 'award_base_action_date',
    AWARD_BASE_ACTION_DATE_FISCAL_YEAR = 'award_base_action_date_fiscal_year',
    PERIOD_OF_PERFORMANCE_START_DATE = 'period_of_performance_start_date',
    PERIOD_OF_PERFORMANCE_CURRENT_END_DATE = 'period_of_performance_current_end_date',
    AWARDING_AGENCY_CODE = 'awarding_agency_code',
    AWARDING_AGENCY_NAME = 'awarding_agency_name',
    AWARDING_SUB_AGENCY_CODE = 'awarding_sub_agency_code',
    AWARDING_SUB_AGENCY_NAME = 'awarding_sub_agency_name',
    AWARDING_OFFICE_CODE = 'awarding_office_code',
    AWARDING_OFFICE_NAME = 'awarding_office_name',
    FUNDING_AGENCY_CODE = 'funding_agency_code',
    FUNDING_AGENCY_NAME = 'funding_agency_name',
    FUNDING_SUB_AGENCY_CODE = 'funding_sub_agency_code',
    FUNDING_SUB_AGENCY_NAME = 'funding_sub_agency_name',
    FUNDING_OFFICE_CODE = 'funding_office_code',
    FUNDING_OFFICE_NAME = 'funding_office_name',
    TREASURY_ACCOUNTS_FUNDING_THIS_AWARD = 'treasury_accounts_funding_this_award',
    FEDERAL_ACCOUNTS_FUNDING_THIS_AWARD = 'federal_accounts_funding_this_award',
    OBJECT_CLASSES_FUNDING_THIS_AWARD = 'object_classes_funding_this_award',
    PROGRAM_ACTIVITIES_FUNDING_THIS_AWARD = 'program_activities_funding_this_award',
    RECIPIENT_UEI = 'recipient_uei',
    RECIPIENT_DUNS = 'recipient_duns',
    RECIPIENT_NAME = 'recipient_name',
    RECIPIENT_PARENT_UEI = 'recipient_parent_uei',
    RECIPIENT_PARENT_DUNS = 'recipient_parent_duns',
    RECIPIENT_PARENT_NAME = 'recipient_parent_name',
    RECIPIENT_COUNTRY_CODE = 'recipient_country_code',
    RECIPIENT_COUNTRY_NAME = 'recipient_country_name',
    RECIPIENT_ADDRESS_LINE_1 = 'recipient_address_line_1',
    RECIPIENT_ADDRESS_LINE_2 = 'recipient_address_line_2',
    RECIPIENT_CITY_CODE = 'recipient_city_code',
    RECIPIENT_CITY_NAME = 'recipient_city_name',
    RECIPIENT_COUNTY_CODE = 'recipient_county_code',
    RECIPIENT_COUNTY_NAME = 'recipient_county_name',
    RECIPIENT_STATE_CODE = 'recipient_state_code',
    RECIPIENT_STATE_NAME = 'recipient_state_name',
    RECIPIENT_ZIP_CODE = 'recipient_zip_code',
    RECIPIENT_ZIP_LAST_4_CODE = 'recipient_zip_last_4_code',
    RECIPIENT_CONGRESSIONAL_DISTRICT = 'recipient_congressional_district',
    RECIPIENT_FOREIGN_CITY_NAME = 'recipient_foreign_city_name',
    RECIPIENT_FOREIGN_PROVINCE_NAME = 'recipient_foreign_province_name',
    RECIPIENT_FOREIGN_POSTAL_CODE = 'recipient_foreign_postal_code',
    PRIMARY_PLACE_OF_PERFORMANCE_SCOPE = 'primary_place_of_performance_scope',
    PRIMARY_PLACE_OF_PERFORMANCE_COUNTRY_CODE = 'primary_place_of_performance_country_code',
    PRIMARY_PLACE_OF_PERFORMANCE_COUNTRY_NAME = 'primary_place_of_performance_country_name',
    PRIMARY_PLACE_OF_PERFORMANCE_CODE = 'primary_place_of_performance_code',
    PRIMARY_PLACE_OF_PERFORMANCE_CITY_NAME = 'primary_place_of_performance_city_name',
    PRIMARY_PLACE_OF_PERFORMANCE_COUNTY_CODE = 'primary_place_of_performance_county_code',
    PRIMARY_PLACE_OF_PERFORMANCE_COUNTY_NAME = 'primary_place_of_performance_county_name',
    PRIMARY_PLACE_OF_PERFORMANCE_STATE_NAME = 'primary_place_of_performance_state_name',
    PRIMARY_PLACE_OF_PERFORMANCE_ZIP_4 = 'primary_place_of_performance_zip_4',
    PRIMARY_PLACE_OF_PERFORMANCE_CONGRESSIONAL_DISTRICT = 'primary_place_of_performance_congressional_district',
    PRIMARY_PLACE_OF_PERFORMANCE_FOREIGN_LOCATION = 'primary_place_of_performance_foreign_location',
    CFDA_NUMBERS_AND_TITLES = 'cfda_numbers_and_titles',
    FUNDING_OPPORTUNITY_NUMBER = 'funding_opportunity_number',
    FUNDING_OPPORTUNITY_GOALS_TEXT = 'funding_opportunity_goals_text',
    ASSISTANCE_TYPE_CODE = 'assistance_type_code',
    ASSISTANCE_TYPE_DESCRIPTION = 'assistance_type_description',
    PRIME_AWARD_BASE_TRANSACTION_DESCRIPTION = 'prime_award_base_transaction_description',
    BUSINESS_FUNDS_INDICATOR_CODE = 'business_funds_indicator_code',
    BUSINESS_FUNDS_INDICATOR_DESCRIPTION = 'business_funds_indicator_description',
    BUSINESS_TYPES_CODE = 'business_types_code',
    BUSINESS_TYPES_DESCRIPTION = 'business_types_description',
    RECORD_TYPE_CODE = 'record_type_code',
    RECORD_TYPE_DESCRIPTION = 'record_type_description',
    HIGHLY_COMPENSATED_OFFICER_1_NAME = 'highly_compensated_officer_1_name',
    HIGHLY_COMPENSATED_OFFICER_1_AMOUNT = 'highly_compensated_officer_1_amount',
    HIGHLY_COMPENSATED_OFFICER_2_NAME = 'highly_compensated_officer_2_name',
    HIGHLY_COMPENSATED_OFFICER_2_AMOUNT = 'highly_compensated_officer_2_amount',
    HIGHLY_COMPENSATED_OFFICER_3_NAME = 'highly_compensated_officer_3_name',
    HIGHLY_COMPENSATED_OFFICER_3_AMOUNT = 'highly_compensated_officer_3_amount',
    HIGHLY_COMPENSATED_OFFICER_4_NAME = 'highly_compensated_officer_4_name',
    HIGHLY_COMPENSATED_OFFICER_4_AMOUNT = 'highly_compensated_officer_4_amount',
    HIGHLY_COMPENSATED_OFFICER_5_NAME = 'highly_compensated_officer_5_name',
    HIGHLY_COMPENSATED_OFFICER_5_AMOUNT = 'highly_compensated_officer_5_amount',
    USASPENDING_PERMALINK = 'usaspending_permalink',
    LAST_MODIFIED_DATE = 'last_modified_date',
}
