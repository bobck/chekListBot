import { BigQuery } from '@google-cloud/bigquery';
import { devLog } from '../utils.mjs';

const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_NAME,
  keyFilename: 'token.json',
});

export async function insertRowsAsStream(rows) {
  devLog(`BQ API: inserting ${rows.length} rows as stream into ${process.env.BQ_DATASET_ID}.${process.env.BQ_TABLE_ID}`);
  await bigquery
    .dataset(process.env.BQ_DATASET_ID)
    .table(process.env.BQ_TABLE_ID)
    .insert(rows);
}

function mapObjToSqlString(row) {
  const columnsNames = Object.keys(row);

  let columnString = '(';
  let valuesString = 'VALUES (';

  for (let [i, columnName] of columnsNames.entries()) {
    if (i > 0) {
      columnString += `, `;
      valuesString += `, `;
    }

    columnString += `${columnName}`;

    const value = row[columnName];

    if (typeof value == 'undefined') {
      valuesString += `null`;
      continue;
    }

    if (typeof value == 'boolean') {
      valuesString += `${value}`;
      continue;
    }

    valuesString += `'${value}'`;
  }

  columnString += `)`;
  valuesString += `)`;

  return { columnString, valuesString };
}

export async function insertRowWithDlm(row) {
  const { columnString, valuesString } = mapObjToSqlString(row);

  const insertQuery = `INSERT INTO \`${process.env.BQ_DATASET_ID}.${process.env.BQ_TABLE_ID}\` ${columnString} ${valuesString}`;
  devLog(`BQ API: creating query job for row insertion:`, insertQuery);

  const [job] = await bigquery.createQueryJob({
    query: insertQuery,
    location: 'US',
  });

  devLog(`BQ API: getting query results for job ${job.id}`);
  await job.getQueryResults();
}

export async function daysWithNoMileageByCarId({ id }) {
  const options = {
    configuration: {
      query: {
        query: `SELECT
          DATE_DIFF(timestamp_add(current_timestamp(), INTERVAL 0 DAY), created_at, DAY) as days_with_no_mileage_update
        FROM
        \`${process.env.BQ_PROJECT_NAME}.${process.env.BQ_DATASET_ID}.${process.env.BQ_TABLE_ID}\`
        WHERE
        photo_odometr_id IS NOT NULL
          AND car_id = '${id}'
          AND is_trash IS NULL
        ORDER BY
          created_at DESC
        LIMIT
          1`,
        useLegacySql: false,
      },
    },
  };

  devLog(`BQ API: creating job for daysWithNoMileageByCarId for car_id '${id}'`);
  const response = await bigquery.createJob(options);
  const [job] = response;

  devLog(`BQ API: getting query results for job ${job.id}`);
  const [rows] = await job.getQueryResults(job);

  if (!rows.length) {
    return { days_with_no_mileage_update: null };
  }

  const [row] = rows;
  const { days_with_no_mileage_update } = row;
  return { days_with_no_mileage_update };
}

if (process.env.ENV == 'dev') {
  // const r = {
  //     id: '1',
  //     status: 'done'
  // }
  // console.log(await insertRowWithDlm(r))
  // insertRowsAsStream();

  daysWithNoMileageByCarId({ id: '5498' });
}
