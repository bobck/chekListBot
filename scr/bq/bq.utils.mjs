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

function mapObjToSqlString(row) {
    const columnsNames = Object.keys(row)

    let columnString = '('
    let valuesString = 'VALUES ('

    for (let [i, columnName] of columnsNames.entries()) {

        if (i > 0) {
            columnString += `, `
            valuesString += `, `
        }

        columnString += `${columnName}`

        const value = row[columnName]


        if (typeof value == 'undefined') {
            valuesString += `null`
            continue
        }

        if (typeof value == 'boolean') {
            valuesString += `${value}`
            continue
        }

        valuesString += `'${value}'`
    }

    columnString += `)`
    valuesString += `)`

    return { columnString, valuesString }
}

export async function insertRowWithDlm(row) {

    const { columnString, valuesString } = mapObjToSqlString(row);

    const insertQuery = `INSERT INTO \`${process.env.BQ_DATASET_ID}.${process.env.BQ_TABLE_ID}\` ${columnString} ${valuesString}`;

    const [job] = await bigquery.createQueryJob({
        query: insertQuery,
        location: 'US',
    });

    await job.getQueryResults();

}


if (process.env.ENV == 'dev') {
    const r = {
        id: '1',
        status: 'done'
    }
    console.log(await insertRowWithDlm(r))
    // insertRowsAsStream();
}

