import { db } from '../../database.mjs'
import { listCars, transliterate } from '../bitrix.utils.mjs'

export async function refreshCarlist() {

    const result = await listCars()
    const values = result.map(car => {
        const { id, ufCrm4_1654801473656 } = car
        return { id, car_num: transliterate(ufCrm4_1654801473656) }
    })

    await db
        .deleteFrom('cars')
        .executeTakeFirst()

    await db
        .insertInto('cars')
        .values(values)
        .execute()

    return values.length

}

if (process.env.ENV == 'dev') {
    refreshCarlist();
}


