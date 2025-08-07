
import * as fs from 'fs'
import {
    auth,
    drive
} from '@googleapis/drive'

const content = await fs.readFileSync('token.json');
const credentials = JSON.parse(content);
const authClient = auth.fromJSON(credentials);

const client = drive({ version: 'v3', auth: authClient });

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
export async function getFolderIdByParentIdAndName({ name, parentId }) {

    const res = await client.files.list({
        pageSize: 10,
        q: `mimeType = 'application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed = false`,
        fields: `files(id, name)`,
        spaces: 'drive',
        supportsAllDrives: true,
        supportsTeamDrives: true
    });
    const folders = res.data.files;
    if (folders.length === 0) {
        return null;
    }

    const [carFolder] = folders
    const { id } = carFolder
    return id
}

export async function createFolderInParentFolder({ name, parentId }) {

    const fileMetaData = {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
    };

    const result = await client.files
        .create({
            fields: "id",
            resource: fileMetaData,
            supportsAllDrives: true
        })

    console.log({ createFolderInParentFolder: result });
    const { data } = result
    return data.id
}

export async function uploadFileToParentId({ createReadStream, name, parentId }) {
    const maxRetries = 3;
    const retryInterval = 1500;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const file = await client.files.create({
                media: {
                    body: createReadStream
                },
                fields: 'id',
                requestBody: {
                    name,
                    parents: [parentId]
                },
                supportsAllDrives: true
            });
            return file.data.id;
        } catch (error) {
            if (attempt === maxRetries - 1) {
                throw error; // Переброшенная ошибка, если все попытки неудачны
            }
            await new Promise(resolve => setTimeout(resolve, retryInterval)); // Задержка перед следующей попыткой
        }
    }
}



if (process.env.ENV == 'dev') {
    // getFolderIdByParentIdAndName('AA1403KM');
    // createFolder();
}

