import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
    projectId: process.env.BQ_PROJECT_NAME,
    keyFilename: 'token.json'
});

export async function insertRowsAsStream(rows) {
    // const rows = [
    //     { ID: 666, First_Name: 'Tom' },
    // ];
    await bigquery.dataset(process.env.BQ_DATASET_ID).table(process.env.BQ_TABLE_ID).insert(rows);
    // console.log(`Inserted ${rows.length} rows`);
}


if (process.env.ENV == 'dev') {
    // insertRowsAsStream();
}

